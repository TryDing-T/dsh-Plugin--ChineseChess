import {
  applyMove as applyMoveApi,
  deserialize as deserializeApi,
  getLegalMoves as getLegalMovesApi,
  newGame as newGameApi,
  serialize as serializeApi,
} from '../../src/game/index.ts'

export type Turn = 'red' | 'black'
export type Piece = string | null
export type Square = Readonly<{ x: number; y: number }>
export type Move = Readonly<{ from: Square; to: Square }>
export type Board = Piece[][]
export type GameState = Readonly<Record<string, unknown>>

/**
 * This is the only import/API seam for the rule-kernel tests.
 *
 * Canonical test contract:
 * - src/game/index exports newGame, applyMove, getLegalMoves, serialize, deserialize.
 * - public state uses a 90-cell board of { side, type } pieces; tests normalize it
 *   to FEN-like one-letter codes at this seam.
 * - test positions use x=0..8 and y=0..9, with black at y=0 and red at y=9.
 * - applyMove(state, { from, to }) returns the next state and rejects illegal moves.
 * - deserialize(FEN) is the test-only custom-position entry point because the
 *   current implementation's newGame() has no options parameter.
 *
 * If the implementation chooses a different public shape, adjust this file rather
 * than spreading compatibility branches through the rule tests.
 */
type GameApi = {
  newGame: (options?: unknown) => GameState
  applyMove: (state: GameState, move: Move) => GameState
  getLegalMoves: (state: GameState, from: Square) => readonly unknown[]
  serialize: (state: GameState) => string
  deserialize: (serialized: string) => GameState
}

export const api = {
  applyMove: applyMoveApi,
  deserialize: deserializeApi,
  getLegalMoves: getLegalMovesApi,
  newGame: newGameApi,
  serialize: serializeApi,
} as unknown as GameApi

export function newGame(): GameState {
  return api.newGame()
}

export function newCustomGame(board: Board, turn: Turn = 'red'): GameState {
  return deserialize(toFen(board, turn))
}

export function applyMove(state: GameState, from: Square, to: Square): GameState {
  return api.applyMove(state, { from, to })
}

export function getLegalMoves(state: GameState, from: Square): readonly unknown[] {
  return api.getLegalMoves(state, from)
}

export function serialize(state: GameState): string {
  return api.serialize(state)
}

export function deserialize(value: string): GameState {
  return api.deserialize(value)
}

export function square(value: string): Square {
  const normalized = value.toLowerCase()
  if (!/^[a-i][0-9]$/.test(normalized)) {
    throw new Error(`Invalid test square: ${value}`)
  }
  return {
    x: normalized.charCodeAt(0) - 'a'.charCodeAt(0),
    y: Number(normalized[1]),
  }
}

export function emptyBoard(): Board {
  return Array.from({ length: 10 }, () => Array<Piece>(9).fill(null))
}

export function boardWithKings(): Board {
  const board = emptyBoard()
  put(board, 'd9', 'K')
  put(board, 'f0', 'k')
  return board
}

export function put(board: Board, at: string, piece: Piece): void {
  const point = square(at)
  board[point.y][point.x] = piece
}

export function initialBoard(): Board {
  return [
    ['r', 'n', 'b', 'a', 'k', 'a', 'b', 'n', 'r'],
    [null, null, null, null, null, null, null, null, null],
    [null, 'c', null, null, null, null, null, 'c', null],
    ['p', null, 'p', null, 'p', null, 'p', null, 'p'],
    [null, null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null, null],
    ['P', null, 'P', null, 'P', null, 'P', null, 'P'],
    [null, 'C', null, null, null, null, null, 'C', null],
    [null, null, null, null, null, null, null, null, null],
    ['R', 'N', 'B', 'A', 'K', 'A', 'B', 'N', 'R'],
  ]
}

export function boardOf(state: GameState): readonly unknown[] {
  const value = readStateValue(state, ['board', 'position'], ['getBoard', 'getPosition'])
  if (!Array.isArray(value)) {
    throw new Error('Game state does not expose a flat board array')
  }
  return value
}

export function boardCodesOf(state: GameState): Board {
  const board = boardOf(state)
  if (board.length !== 90) {
    throw new Error(`Expected a 90-cell board, received ${board.length}`)
  }
  return Array.from({ length: 10 }, (_, y) =>
    Array.from({ length: 9 }, (_, x) => pieceCode(board[y * 9 + x]))
  )
}

export function pieceAt(state: GameState, at: string): Piece {
  const point = square(at)
  return pieceCode(boardOf(state)[point.y * 9 + point.x])
}

export function turnOf(state: GameState): unknown {
  return readStateValue(state, ['turn', 'currentPlayer', 'sideToMove'], [
    'getTurn',
    'getCurrentPlayer',
    'getSideToMove',
  ])
}

export function historyOf(state: GameState): readonly unknown[] {
  const value = readStateValue(state, ['history', 'moveHistory', 'moves'], [
    'getHistory',
    'getMoveHistory',
  ])
  if (!Array.isArray(value)) {
    throw new Error('Game state does not expose a history array')
  }
  return value
}

export function historyFrom(record: unknown): Square {
  return normalizeSquare(readRecordValue(record, ['from', 'source']))
}

export function historyTo(record: unknown): Square {
  return normalizeSquare(readRecordValue(record, ['to', 'target']))
}

export function historyCaptured(record: unknown): Piece | undefined {
  const value = readRecordValue(record, ['captured', 'capturedPiece', 'capture', 'taken'])
  return value === undefined ? undefined : pieceCode(value)
}

export function containsDestination(moves: readonly unknown[], target: Square): boolean {
  return moves.some((candidate) => sameSquare(destinationOf(candidate), target))
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row])
}

function toFen(board: Board, turn: Turn): string {
  if (board.length !== 10 || board.some((row) => row.length !== 9)) {
    throw new Error('Test board must contain ten rows of nine columns')
  }

  const placement = board.map((row) => {
    let result = ''
    let empty = 0
    for (const value of row) {
      if (value === null) {
        empty += 1
        continue
      }
      if (empty > 0) {
        result += String(empty)
        empty = 0
      }
      result += value
    }
    if (empty > 0) result += String(empty)
    return result
  })
  return `${placement.join('/')} ${turn === 'red' ? 'w' : 'b'}`
}

function pieceCode(value: unknown): Piece {
  if (value === null || value === undefined) return null
  if (typeof value === 'string') return value
  if (!value || typeof value !== 'object') {
    throw new Error('Board contains an unsupported piece representation')
  }
  const piece = value as { side?: unknown; type?: unknown }
  const codeByType: Record<string, string> = {
    general: 'K',
    advisor: 'A',
    elephant: 'B',
    horse: 'N',
    rook: 'R',
    cannon: 'C',
    soldier: 'P',
  }
  if ((piece.side !== 'red' && piece.side !== 'black') || typeof piece.type !== 'string') {
    throw new Error('Board contains an unsupported piece representation')
  }
  const code = codeByType[piece.type]
  if (!code) throw new Error(`Board contains an unknown piece type: ${piece.type}`)
  return piece.side === 'red' ? code : code.toLowerCase()
}

function readStateValue(
  state: GameState,
  fields: readonly string[],
  methods: readonly string[]
): unknown {
  const record = state as Record<string, unknown>
  for (const field of fields) {
    if (field in record) {
      return record[field]
    }
  }
  for (const method of methods) {
    const candidate = record[method]
    if (typeof candidate === 'function') {
      return candidate.call(state)
    }
  }
  return undefined
}

function readRecordValue(record: unknown, fields: readonly string[]): unknown {
  if (!record || typeof record !== 'object') {
    throw new Error('History entry is not an object')
  }
  const value = record as Record<string, unknown>
  for (const field of fields) {
    if (field in value) {
      return value[field]
    }
  }
  throw new Error(`History entry does not expose ${fields.join(' or ')}`)
}

function destinationOf(candidate: unknown): unknown {
  if (candidate && typeof candidate === 'object') {
    const value = candidate as Record<string, unknown>
    if ('to' in value) return value.to
    if ('target' in value) return value.target
  }
  if (Array.isArray(candidate) && candidate.length === 2 && isSquareLike(candidate[1])) {
    return candidate[1]
  }
  return candidate
}

function normalizeSquare(value: unknown): Square {
  if (typeof value === 'string') {
    return square(value)
  }
  if (Array.isArray(value) && value.length >= 2) {
    if (typeof value[0] !== 'object' && typeof value[1] !== 'object') {
      return { x: Number(value[0]), y: Number(value[1]) }
    }
  }
  if (isSquareLike(value)) {
    const point = value as Record<string, unknown>
    if ('x' in point && 'y' in point) {
      return { x: Number(point.x), y: Number(point.y) }
    }
    return { x: Number(point.col), y: Number(point.row) }
  }
  throw new Error('Value is not a supported square representation')
}

function isSquareLike(value: unknown): boolean {
  if (Array.isArray(value)) return value.length >= 2
  if (!value || typeof value !== 'object') return false
  const point = value as Record<string, unknown>
  return ('x' in point && 'y' in point) || ('row' in point && 'col' in point)
}

function sameSquare(left: unknown, right: Square): boolean {
  if (left === undefined || left === null) return false
  try {
    const point = normalizeSquare(left)
    return point.x === right.x && point.y === right.y
  } catch {
    return false
  }
}
