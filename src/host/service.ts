import type {
  JsonValue,
  XiangqiChange,
  XiangqiChangeListener,
  XiangqiDecisionMeta,
  XiangqiGameFactory,
  XiangqiGameIdFactory,
  XiangqiGamePhase,
  XiangqiHostServiceOptions,
  XiangqiMove,
  XiangqiMoveRequest,
  XiangqiNewGameRequest,
  XiangqiResignRequest,
  XiangqiSerializedState,
  XiangqiSide,
  XiangqiUndoRequest,
} from './types.ts'

export type XiangqiErrorCode =
  | 'INVALID_INPUT'
  | 'GAME_NOT_FOUND'
  | 'GAME_NOT_CURRENT'
  | 'STALE_REVISION'
  | 'GAME_NOT_ACTIVE'
  | 'NO_UNDO'
  | 'INVALID_MOVE'
  | 'GAME_CREATE'
  | 'GAME_RESTORE'
  | 'GAME_SERIALIZE'
  | 'GAME_RULE'
  | 'INVALID_DECISION'

/** All command-layer failures have the stable `xiangqi:` prefix. */
export class XiangqiError extends Error {
  readonly code: XiangqiErrorCode

  constructor(code: XiangqiErrorCode, message: string) {
    const normalized = message.startsWith('xiangqi:')
      ? message.slice('xiangqi:'.length).trim()
      : message
    super(`xiangqi: ${normalized}`)
    this.name = 'XiangqiError'
    this.code = code
  }
}

interface HistoryEntry {
  readonly gameState: JsonValue
  readonly phase: XiangqiGamePhase
  readonly winner?: XiangqiSide
  readonly lastMove?: XiangqiMove
}

interface GameRecord {
  readonly gameId: string
  readonly sessionId?: string
  revision: number
  phase: XiangqiGamePhase
  winner?: XiangqiSide
  gameState: JsonValue
  lastMove?: XiangqiMove
  readonly history: HistoryEntry[]
}

let generatedIdSequence = 0

function defaultGameId(): string {
  generatedIdSequence += 1
  return `game-${Date.now().toString(36)}-${generatedIdSequence.toString(36)}`
}

function cloneJson(value: JsonValue): JsonValue {
  const encoded = JSON.stringify(value)
  if (encoded === undefined) {
    throw new Error('game state is not JSON serializable')
  }
  return JSON.parse(encoded) as JsonValue
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function wrap(error: unknown, code: XiangqiErrorCode): XiangqiError {
  if (error instanceof XiangqiError) return error
  return new XiangqiError(code, messageOf(error))
}

function requireText(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new XiangqiError('INVALID_INPUT', `${field} must be a non-empty string`)
  }
  return value.trim()
}

function requireRevision(value: unknown): number {
  if (!Number.isSafeInteger(value) || (value as number) < 1) {
    throw new XiangqiError('INVALID_INPUT', 'revision must be a positive safe integer')
  }
  return value as number
}

function requireSide(value: unknown): XiangqiSide {
  if (value !== 'red' && value !== 'black') {
    throw new XiangqiError('INVALID_INPUT', 'side must be "red" or "black"')
  }
  return value
}

function validateMove(move: XiangqiMove): XiangqiMove {
  if (move === null || typeof move !== 'object') {
    throw new XiangqiError('INVALID_MOVE', 'move must be an object')
  }
  const from = requireText(move.from, 'move.from')
  const to = requireText(move.to, 'move.to')
  if (from === to) {
    throw new XiangqiError('INVALID_MOVE', 'move.from and move.to must differ')
  }
  return { from, to }
}

function otherSide(side: XiangqiSide): XiangqiSide {
  return side === 'red' ? 'black' : 'red'
}

/**
 * 写操作防串局守卫（审查问题 2）：任何针对非当前全局棋局的写请求一律拒绝。
 * 没有它，旧棋局的延迟/重复请求会把自己的 gameId 重新发布成"当前棋局"，
 * 让新开的棋局被旧局面覆盖。
 */
export function assertCurrentGame(currentGameId: string | undefined, requestedGameId: string): void {
  if (currentGameId !== undefined && requestedGameId !== currentGameId) {
    throw new XiangqiError(
      'GAME_NOT_CURRENT',
      `game "${requestedGameId}" is not the current game "${currentGameId}"; open or create the current game instead`,
    )
  }
}

/**
 * Host-owned command service for one or more DSH/session chess games.
 *
 * It owns lifecycle, revision checks, transactional restore-before-commit,
 * undo history, and publication. Rules remain in the injected src/game port.
 */
export class XiangqiHostService {
  private readonly games = new Map<string, GameRecord>()
  private readonly listeners = new Set<XiangqiChangeListener>()
  private readonly createGameId: XiangqiGameIdFactory

  constructor(
    private readonly factory: XiangqiGameFactory,
    options: XiangqiHostServiceOptions = {},
  ) {
    this.createGameId = options.createGameId ?? defaultGameId
  }

  /** Create and publish a new active game. */
  newGame(request: XiangqiNewGameRequest = {}): XiangqiSerializedState {
    const sessionId = request.sessionId === undefined
      ? undefined
      : requireText(request.sessionId, 'sessionId')
    const gameId = requireText(this.createGameId(), 'gameId')
    if (this.games.has(gameId)) {
      throw new XiangqiError('INVALID_INPUT', `game id "${gameId}" already exists`)
    }

    let gameState: JsonValue
    try {
      gameState = this.serialize(this.factory.create())
    } catch (error) {
      throw wrap(error, 'GAME_CREATE')
    }

    const record: GameRecord = {
      gameId,
      ...sessionId === undefined ? {} : { sessionId },
      revision: 1,
      phase: 'active',
      gameState,
      history: [],
    }
    this.games.set(gameId, record)
    return this.commitAndPublish('newGame', record)
  }

  /** Read a defensive copy of a current game state. */
  get(gameId: string): XiangqiSerializedState {
    return this.snapshot(this.requireGame(gameId))
  }

  /**
   * Restore one projected game after a Host restart.
   *
   * The core snapshot already contains its own move history, so the restored
   * game can continue and can be inspected. Host-side undo history is rebuilt
   * only for mutations made after this restore boundary.
   */
  restore(state: XiangqiSerializedState): void {
    const gameId = requireText(state.gameId, 'gameId')
    const sessionId = state.sessionId === undefined ? undefined : requireText(state.sessionId, 'sessionId')
    const revision = requireRevision(state.revision)
    if (state.phase !== 'active' && state.phase !== 'resigned') {
      throw new XiangqiError('GAME_RESTORE', `unknown game phase: ${String(state.phase)}`)
    }
    try {
      this.factory.restore(cloneJson(state.gameState))
    } catch (error) {
      throw wrap(error, 'GAME_RESTORE')
    }
    this.games.set(gameId, {
      gameId,
      ...sessionId === undefined ? {} : { sessionId },
      revision,
      phase: state.phase,
      ...state.winner === undefined ? {} : { winner: state.winner },
      gameState: cloneJson(state.gameState),
      ...state.lastMove === undefined ? {} : { lastMove: { ...state.lastMove } },
      history: [],
    })
  }

  /** Apply one move against an exact revision and publish only after commit. */
  move(request: XiangqiMoveRequest): XiangqiSerializedState {
    return this.commitMove(request)
  }

  /** Apply a previously validated DSH decision against the same revision fence. */
  moveWithDecision(
    request: XiangqiMoveRequest,
    decision: { readonly move: XiangqiMove; readonly meta: XiangqiDecisionMeta },
  ): XiangqiSerializedState {
    if (decision.meta.source !== 'dsh' || decision.meta.revision !== request.revision) {
      throw new XiangqiError('INVALID_DECISION', 'decision metadata does not match the move revision')
    }
    return this.commitMove(request, decision.meta)
  }

  private commitMove(
    request: XiangqiMoveRequest,
    decision?: XiangqiDecisionMeta,
  ): XiangqiSerializedState {
    const record = this.requireGame(request.gameId)
    this.assertRevision(record, request.revision)
    this.assertActive(record)
    const move = validateMove(request.move)

    let nextGameState: JsonValue
    try {
      // Work on a restored copy. A throwing game-core move cannot partially
      // mutate the committed record or cause a false publication.
      const workingGame = this.factory.restore(cloneJson(record.gameState))
      workingGame.move(move)
      nextGameState = this.serialize(workingGame)
    } catch (error) {
      throw wrap(error, 'GAME_RULE')
    }

    record.history.push(this.historyEntry(record))
    record.gameState = nextGameState
    record.lastMove = move
    record.revision += 1
    return this.commitAndPublish('move', record, decision)
  }

  /** Restore the last committed position against an exact revision. */
  undo(request: XiangqiUndoRequest): XiangqiSerializedState {
    const record = this.requireGame(request.gameId)
    this.assertRevision(record, request.revision)
    if (record.history.length === 0) {
      throw new XiangqiError('NO_UNDO', 'no committed move is available to undo')
    }

    const previous = record.history[record.history.length - 1]
    // Validate the stored boundary before changing the record.
    try {
      this.factory.restore(cloneJson(previous.gameState))
    } catch (error) {
      throw wrap(error, 'GAME_RESTORE')
    }

    record.history.pop()
    record.gameState = cloneJson(previous.gameState)
    record.phase = previous.phase
    if (previous.winner === undefined) delete record.winner
    else record.winner = previous.winner
    if (previous.lastMove === undefined) delete record.lastMove
    else record.lastMove = { ...previous.lastMove }
    record.revision += 1
    return this.commitAndPublish('undo', record)
  }

  /** Mark one side as resigned and publish the committed result. */
  resign(request: XiangqiResignRequest): XiangqiSerializedState {
    const record = this.requireGame(request.gameId)
    this.assertRevision(record, request.revision)
    this.assertActive(record)
    const side = requireSide(request.side)

    record.history.push(this.historyEntry(record))
    record.phase = 'resigned'
    record.winner = otherSide(side)
    record.revision += 1
    return this.commitAndPublish('resign', record)
  }

  /** Subscribe to committed state changes. The returned disposer is idempotent. */
  subscribe(listener: XiangqiChangeListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Drop every game record except the named one and report how many were
   * removed. Called after a new game becomes current so stale games can never
   * be mutated back into existence.
   */
  retainOnly(gameId: string): number {
    const id = requireText(gameId, 'gameId')
    let removed = 0
    for (const key of [...this.games.keys()]) {
      if (key !== id) {
        this.games.delete(key)
        removed += 1
      }
    }
    return removed
  }

  private serialize(game: { serialize(): JsonValue }): JsonValue {
    try {
      return cloneJson(game.serialize())
    } catch (error) {
      throw wrap(error, 'GAME_SERIALIZE')
    }
  }

  private requireGame(gameId: string): GameRecord {
    const id = requireText(gameId, 'gameId')
    const record = this.games.get(id)
    if (record === undefined) {
      throw new XiangqiError('GAME_NOT_FOUND', `game "${id}" was not found`)
    }
    return record
  }

  private assertRevision(record: GameRecord, expectedRevision: number): void {
    const revision = requireRevision(expectedRevision)
    if (revision !== record.revision) {
      throw new XiangqiError(
        'STALE_REVISION',
        `stale revision ${revision}; current revision is ${record.revision}`,
      )
    }
  }

  private assertActive(record: GameRecord): void {
    if (record.phase !== 'active') {
      throw new XiangqiError(
        'GAME_NOT_ACTIVE',
        `game "${record.gameId}" is ${record.phase}${record.winner === undefined ? '' : `; winner is ${record.winner}`}`,
      )
    }
  }

  private serializeRecord(record: GameRecord): XiangqiSerializedState {
    return {
      gameId: record.gameId,
      ...record.sessionId === undefined ? {} : { sessionId: record.sessionId },
      revision: record.revision,
      phase: record.phase,
      ...record.winner === undefined ? {} : { winner: record.winner },
      gameState: cloneJson(record.gameState),
      ...record.lastMove === undefined ? {} : { lastMove: { ...record.lastMove } },
    }
  }

  private snapshot(record: GameRecord): XiangqiSerializedState {
    return this.serializeRecord(record)
  }

  private historyEntry(record: GameRecord): HistoryEntry {
    return {
      gameState: cloneJson(record.gameState),
      phase: record.phase,
      ...record.winner === undefined ? {} : { winner: record.winner },
      ...record.lastMove === undefined ? {} : { lastMove: { ...record.lastMove } },
    }
  }

  private commitAndPublish(
    operation: XiangqiChange['operation'],
    record: GameRecord,
    decision?: XiangqiDecisionMeta,
  ): XiangqiSerializedState {
    // The record has already been mutated before this method is entered. This
    // ordering is intentional: observers can only see successful commits.
    const state = this.snapshot(record)
    const change: XiangqiChange = {
      operation,
      state,
      ...decision === undefined ? {} : { decision },
    }
    for (const listener of [...this.listeners]) listener(change)
    return state
  }
}
