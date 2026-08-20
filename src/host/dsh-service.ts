/** DSH Host service: per-session Chinese chess state, Remote methods, tool, and projection. */

import { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import type { Session, SessionEvent } from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-session-projection'
import type {} from '@deepseek-ai/dsh-tools'
import type { XiangqiChange, XiangqiProjection } from '../types.ts'
import type {
  XiangqiMoveRequest,
  XiangqiNewGameRequest,
  XiangqiResignRequest,
  XiangqiSerializedState,
  XiangqiToolArgs,
  XiangqiToolResult,
  XiangqiUndoRequest,
} from './dsh-service-types.ts'
import { createXiangqiGameFactory } from './game-adapter.ts'
import { createXiangqiRuntimeTool } from './runtime-tool.ts'
import { XiangqiError, XiangqiHostService } from './service.ts'
import type {} from '../domain.ts'
import { registerXiangqiSessionEventType } from '../domain.ts'
import { applyXiangqiProjection, viewXiangqiProjection, xiangqiProjectionSchema } from '../projection.ts'

// Must run while the Host bundle is being loaded, before a persisted session
// is adopted by the persistence coordinator.
registerXiangqiSessionEventType()

interface SessionGame {
  readonly service: XiangqiHostService
  currentGameId?: string
}

function asSessionEvent(
  event: SessionEvent,
): event is SessionEvent & { type: 'xiangqi/change'; data: XiangqiChange } {
  return event.type === 'xiangqi/change'
}

function lastProjection(session: Session): XiangqiProjection {
  let state: XiangqiProjection = null
  for (const event of session.events) {
    if (asSessionEvent(event)) state = event.data.state
  }
  return state
}

function requireGameId(value: string | undefined): string {
  if (value === undefined || value.trim().length === 0) {
    throw new XiangqiError('GAME_NOT_FOUND', 'no Chinese chess game exists in this session; call new_game first')
  }
  return value.trim()
}

/**
 * Host-side service loaded by the bundle patch. Every Remote method starts
 * with Agent so Typert maps the client SessionId to the exact live agent.
 */
export class XiangqiService extends TypertRemoteService {
  static inject = ['agents', 'tools']

  private readonly games = new WeakMap<Session, SessionGame>()

  constructor(ctx: Context) {
    super(ctx, 'xiangqi')
    ctx.inject(['sessionProjections'], (projectionCtx) => {
      projectionCtx.sessionProjections.register<'xiangqi', XiangqiProjection>({
        key: 'xiangqi',
        schema: xiangqiProjectionSchema,
        init: () => null,
        apply: applyXiangqiProjection,
        view: viewXiangqiProjection,
        stateVersion: 1,
      })
    })
    ctx.tools.register(createXiangqiRuntimeTool(this))
  }

  /** Start one new game owned by the calling DSH session. */
  @Remote('newGame')
  newGame(agent: Agent, _request: XiangqiNewGameRequest): XiangqiSerializedState {
    const game = this.gameFor(agent)
    return game.service.newGame({ sessionId: String(agent.id) })
  }

  /** Read the requested game, or the session's latest game when omitted. */
  @Remote('get')
  get(agent: Agent, gameId?: string): XiangqiSerializedState {
    const game = this.gameFor(agent)
    return game.service.get(requireGameId(gameId ?? game.currentGameId))
  }

  /** Apply one revision-fenced move. */
  @Remote('move')
  move(agent: Agent, request: XiangqiMoveRequest): XiangqiSerializedState {
    return this.gameFor(agent).service.move(request)
  }

  /** Undo one committed move. */
  @Remote('undo')
  undo(agent: Agent, request: XiangqiUndoRequest): XiangqiSerializedState {
    return this.gameFor(agent).service.undo(request)
  }

  /** Mark one side as resigned. */
  @Remote('resign')
  resign(agent: Agent, request: XiangqiResignRequest): XiangqiSerializedState {
    return this.gameFor(agent).service.resign(request)
  }

  /** Execute the model tool against the exact agent owning the current turn. */
  executeTool(agent: Agent, args: XiangqiToolArgs): XiangqiToolResult {
    const game = this.gameFor(agent)
    const normalized = args.action === 'new_game'
      ? { ...args, session_id: String(agent.id) }
      : args
    // Reuse the dependency-free command parser so the model boundary and the
    // Host Remote boundary reject the same malformed field combinations.
    return this.executeParsedTool(game.service, normalized)
  }

  private executeParsedTool(service: XiangqiHostService, args: XiangqiToolArgs): XiangqiToolResult {
    switch (args.action) {
      case 'new_game': {
        const state = args.session_id === undefined
          ? service.newGame({})
          : service.newGame({ sessionId: args.session_id })
        return { ok: true, action: args.action, state, message: 'New Chinese chess game created.' }
      }
      case 'get': {
        const state = service.get(requireGameId(args.game_id))
        return { ok: true, action: args.action, state, message: 'Current Chinese chess state.' }
      }
      case 'move': {
        if (args.game_id === undefined || args.revision === undefined || args.from === undefined || args.to === undefined) {
          throw new XiangqiError('INVALID_INPUT', 'move requires game_id, revision, from, and to')
        }
        const state = service.move({
          gameId: args.game_id,
          revision: args.revision,
          move: { from: args.from, to: args.to },
        })
        return { ok: true, action: args.action, state, message: 'Move committed.' }
      }
      case 'undo': {
        if (args.game_id === undefined || args.revision === undefined) {
          throw new XiangqiError('INVALID_INPUT', 'undo requires game_id and revision')
        }
        const state = service.undo({ gameId: args.game_id, revision: args.revision })
        return { ok: true, action: args.action, state, message: 'Last committed move undone.' }
      }
      case 'resign': {
        if (args.game_id === undefined || args.revision === undefined || args.side === undefined) {
          throw new XiangqiError('INVALID_INPUT', 'resign requires game_id, revision, and side')
        }
        const state = service.resign({ gameId: args.game_id, revision: args.revision, side: args.side })
        return { ok: true, action: args.action, state, message: 'Resignation committed.' }
      }
    }
    throw new XiangqiError('INVALID_INPUT', `unsupported action: ${String(args.action)}`)
  }

  private gameFor(agent: Agent): SessionGame {
    if (this.ctx.agents.get(agent.id) !== agent) {
      throw new XiangqiError('INVALID_INPUT', 'the calling DSH agent is no longer live')
    }
    const session = agent.session
    const existing = this.games.get(session)
    if (existing !== undefined) return existing

    const service = new XiangqiHostService(createXiangqiGameFactory())
    const restored = lastProjection(session)
    const game: SessionGame = { service }
    if (restored !== null) {
      service.restore(restored)
      game.currentGameId = restored.gameId
    }
    service.subscribe((change) => {
      game.currentGameId = change.state.gameId
      session.append('xiangqi/change', change)
    })
    this.games.set(session, game)
    return game
  }
}

export default XiangqiService
