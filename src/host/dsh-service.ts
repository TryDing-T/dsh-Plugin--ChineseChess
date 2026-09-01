/** DSH Host service: one in-memory global Chinese chess state. */

import { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import {
  BlockAssembler,
  createUserMessage,
  ReasoningEffortId,
} from '@deepseek-ai/dsh-llm'
import { deepFreeze } from '@deepseek-ai/dsh-util-values'
import type { FinishReason, GenerateOptions, LlmFailure, StreamChunk } from '@deepseek-ai/dsh-llm'
import type { GameState } from '../game/types.ts'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import type {
  XiangqiAiTurnRequest,
  XiangqiAiTurnResult,
  XiangqiDecisionPacket,
  XiangqiDecisionResponse,
  XiangqiDecisionTrace,
  XiangqiDecisionTraceEntry,
  XiangqiDecisionTracePhase,
  XiangqiRuntimeState,
} from '../types.ts'
import type {
  XiangqiMoveRequest,
  XiangqiNewGameRequest,
  XiangqiResignRequest,
  XiangqiSerializedState,
  XiangqiUndoRequest,
} from './dsh-service-types.ts'
import {
  buildXiangqiDecisionPacket,
  parseXiangqiDecisionResponse,
  XiangqiDecisionProtocolError,
  validateXiangqiDecisionForCurrentState,
} from './decision.ts'
import {
  isXiangqiRateLimitFailure,
  XiangqiDecisionModelError,
} from './decision-error.ts'
import { createXiangqiGameFactory } from './game-adapter.ts'
import { XiangqiError, XiangqiHostService, assertCurrentGame } from './service.ts'
import { resolveRouteFromSnapshot, type DecisionRoute } from './route.ts'
import { XiangqiDecisionGate } from './decision-gate.ts'
import { freezeElapsedMs, isTerminalPhase } from './trace-timing.ts'
import { deserialize as deserializeGame } from '../game/serialization.ts'
import type {} from '../domain.ts'
import { registerXiangqiSessionEventType } from '../domain.ts'

// Must run while the Host bundle is being loaded, before a persisted session
// is adopted by the persistence coordinator.
//
// 本插件自 0.1.17 起不再向任何会话写入 `xiangqi/change` 事件，棋局只保存在
// Host 进程内存里：DSH 重启或插件 HMR 重载后自然回到"未开局"，下次打开棋盘
// 直接创建新局。这里仍向事件目录注册该类型，纯粹是为了让 ≤0.1.16 时代写入
// 的历史会话在任何机器上都能继续加载。
registerXiangqiSessionEventType()

interface SessionGame {
  readonly service: XiangqiHostService
  // 显式可空而非可选：恢复失败时需要把当前局清空回 undefined。
  currentGameId: string | undefined
  pending: PendingDecision | undefined
  decisionSequence: number
  trace: DecisionTraceState | undefined
}

interface PendingDecision {
  readonly agent: Agent
  readonly decisionId: string
  readonly gameId: string
  readonly revision: number
  readonly controller: AbortController
}

interface DecisionTraceState {
  readonly decisionId: string
  readonly gameId: string
  readonly revision: number
  readonly provider: string
  readonly model: string
  readonly reasoningEffort: DecisionRoute['reasoningEffort']
  readonly startedAt: number
  phase: XiangqiDecisionTracePhase
  phaseText: string
  outputChars: number
  reasoningDeltaCount: number
  entrySequence: number
  /** 首次进入终态（completed/failed/cancelled）的时刻；此后耗时不再增长。 */
  endedAt?: number
  readonly entries: XiangqiDecisionTraceEntry[]
}

const DEFAULT_LOCAL_SEARCH_TIME_MS = 180
const DEFAULT_PROTOCOL_RETRY_COUNT = 1
// 决策正文本体只需 ~100 token，但推理模型在高思考程度（max/xhigh）下
// 隐藏思考 token 计入输出预算——预算太小会被思考全部吃掉，正文一个字
// 都出不来（表现为"完成响应但没有返回可见内容"）。给足思考空间。
const DEFAULT_MAX_OUTPUT_TOKENS = 4096

const DECISION_SYSTEM_PROMPT = [
  'You are the black-side move selector for a Chinese chess game.',
  'The Host owns the board and commits moves only after validation.',
  'Do not call any tool and do not invent a move outside packet.candidates.',
  'Return exactly one JSON object and no Markdown, prose, or extra field.',
  'Allowed keys are: decision_id, position_id, observed, candidate_id, summary.',
  'observed must contain only side, in_check, black_general, red_general.',
  'Do not output from, to, a move string, or a new candidate.',
  'Choose candidate_id only from the newest packet.candidates. observed.side must be black.',
  'Use the newest packet rule facts exactly. summary is optional and must be one short line.',
].join(' ')

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function isAborted(signal: AbortSignal): boolean {
  return signal.aborted
}

function finishError(finish: FinishReason): Error | undefined {
  if (finish.kind === 'stop' || finish.kind === 'max-tokens') return undefined
  if (finish.kind === 'aborted') return new XiangqiDecisionModelError(finish.failure)
  if (finish.kind === 'error') return new XiangqiDecisionModelError(finish.failure)
  return new Error(`unsupported LLM finish reason: ${finish.kind}`)
}

/**
 * Host-side service loaded by the bundle patch. Every Remote method starts
 * with Agent so Typert maps the client SessionId to the exact live agent.
 */
export class XiangqiService extends TypertRemoteService {
  static inject = ['agents', 'llm']

  private readonly gate = new XiangqiDecisionGate()
  private readonly game: SessionGame

  constructor(ctx: Context) {
    super(ctx, 'xiangqi')
    const service = new XiangqiHostService(createXiangqiGameFactory())
    this.game = { service, currentGameId: undefined, pending: undefined, decisionSequence: 0, trace: undefined }
    ctx.on('agent/disposed', ({ agent }) => {
      if (this.game.pending?.agent === agent) this.cancelPending(this.game)
    })
    // 只跟踪"当前全局棋局是哪一局"；棋局本身留在 Host 内存，不做任何落盘。
    service.subscribe((change) => {
      this.game.currentGameId = change.state.gameId
    })
    // 插件卸载 / HMR 重载：标记销毁并取消进行中的模型请求。已经返回的旧
    // 结果在提交落子前会再次检查闸门，绝不可能在卸载后改变棋局。
    ctx.effect(() => () => { this.destroy() }, 'xiangqi: dispose gate')
  }

  /** 卸载闸门：销毁后所有写路径与模型结果提交都被拒绝。 */
  private destroy(): void {
    this.gate.destroy()
    this.cancelPending(this.game)
    this.game.trace = undefined
  }

  /**
   * 原子读取 Host 运行状态（审查第二轮 P1）：任意标签页一次调用即可拿到
   * 当前棋局、"Host 是否真的有决策在跑"与决策追踪，不再依赖本页面自己
   * 发起的请求来猜测全局状态。
   */
  @Remote('getRuntimeState')
  getRuntimeState(agent: Agent): XiangqiRuntimeState {
    const game = this.gameFor(agent)
    if (game.currentGameId === undefined) {
      return { state: null, aiPending: false, phase: null, trace: null }
    }
    const trace = game.trace === undefined ? null : this.snapshotDecisionTrace(game.trace)
    return {
      state: game.service.get(game.currentGameId),
      aiPending: game.pending !== undefined,
      phase: game.trace === undefined ? null : game.trace.phase,
      trace,
    }
  }

  /** Start one new global game; switching chats never creates one implicitly. */
  @Remote('newGame')
  newGame(agent: Agent, _request: XiangqiNewGameRequest): XiangqiSerializedState {
    const game = this.gameFor(agent)
    this.cancelPending(game)
    game.trace = undefined
    const state = game.service.newGame({})
    // 新局即位后立刻退役全部旧局：旧棋局的延迟请求从此无法把自己写回"当前"。
    game.service.retainOnly(state.gameId)
    return state
  }

  /**
   * Read the one process-global game. The first read creates the initial game
   * when this DSH Host has no game yet; switching chats only reads this same
   * game and never creates another one.
   */
  @Remote('get')
  get(agent: Agent, gameId?: string): XiangqiSerializedState {
    const game = this.gameFor(agent)
    if (gameId !== undefined) return game.service.get(gameId)
    if (game.currentGameId === undefined) {
      this.cancelPending(game)
      return game.service.newGame({})
    }
    return game.service.get(game.currentGameId)
  }

  /** Read the latest non-durable DSH decision trace for the process-global game. */
  @Remote('getDecisionTrace')
  getDecisionTrace(agent: Agent, gameId?: string): XiangqiDecisionTrace | null {
    const game = this.gameFor(agent)
    if (game.trace === undefined) return null
    if (gameId !== undefined && game.trace.gameId !== gameId) return null
    return this.snapshotDecisionTrace(game.trace)
  }

  /** Apply one revision-fenced move. */
  @Remote('move')
  move(agent: Agent, request: XiangqiMoveRequest): XiangqiSerializedState {
    const game = this.gameFor(agent)
    // 先校验再取消：过期棋局的请求不得取消当前棋局正在进行的 DSH 决策。
    assertCurrentGame(game.currentGameId, request.gameId)
    this.cancelPending(game)
    return game.service.move(request)
  }

  /** Undo one committed move. */
  @Remote('undo')
  undo(agent: Agent, request: XiangqiUndoRequest): XiangqiSerializedState {
    const game = this.gameFor(agent)
    assertCurrentGame(game.currentGameId, request.gameId)
    this.cancelPending(game)
    return game.service.undo(request)
  }

  /** Mark one side as resigned. */
  @Remote('resign')
  resign(agent: Agent, request: XiangqiResignRequest): XiangqiSerializedState {
    const game = this.gameFor(agent)
    assertCurrentGame(game.currentGameId, request.gameId)
    this.cancelPending(game)
    return game.service.resign(request)
  }

  /** Cancel the in-flight lightweight DSH decision without changing the game revision. */
  @Remote('cancelAiMove')
  cancelAiMove(agent: Agent): { readonly cancelled: boolean } {
    return { cancelled: this.cancelPending(this.gameFor(agent)) }
  }

  /** Ask the selected DSH model for one frozen-candidate decision, then commit it. */
  @Remote('requestAiMove')
  async requestAiMove(agent: Agent, request: XiangqiAiTurnRequest): Promise<XiangqiAiTurnResult> {
    if (this.gate.isDestroyed) {
      return this.failedAiMove(request, 'DECISION_CANCELLED', '象棋插件正在卸载，请重新打开棋盘后再试')
    }
    const game = this.gameFor(agent)
    if (game.currentGameId !== undefined && game.currentGameId !== request.gameId) {
      return this.failedAiMove(request, 'STALE_GAME', '当前会话已经切换到另一盘棋局')
    }
    let current: XiangqiSerializedState
    try {
      current = game.service.get(request.gameId)
    } catch (error) {
      if (error instanceof XiangqiError && error.code === 'GAME_NOT_FOUND') {
        return this.failedAiMove(request, 'STALE_GAME', error.message)
      }
      throw error
    }
    if (current.revision !== request.revision) {
      return {
        status: 'stale',
        gameId: request.gameId,
        revision: current.revision,
        message: `棋局已进入 revision ${current.revision}`,
      }
    }
    if (current.phase !== 'active') return this.failedAiMove(request, 'NOT_BLACK_TURN', '棋局已经结束')

    let currentGame: GameState
    try {
      currentGame = deserializeGame(JSON.stringify(current.gameState))
    } catch (error) {
      return this.failedAiMove(request, 'MODEL_ERROR', `无法读取当前棋局：${messageOf(error)}`)
    }
    if (currentGame.turn !== 'black') return this.failedAiMove(request, 'NOT_BLACK_TURN', '当前不是黑方回合')
    if (game.pending !== undefined) {
      return this.failedAiMove(request, 'DECISION_IN_PROGRESS', '当前棋局已有一条 DSH 决策正在进行')
    }

    const decisionId = `decision-${request.gameId}-${request.revision}-${game.decisionSequence + 1}`
    game.decisionSequence += 1
    // 闸门登记：同一时刻只允许一条决策；被销毁或已有活动决策时直接拒绝。
    if (!this.gate.begin(decisionId)) {
      return this.failedAiMove(request, 'DECISION_IN_PROGRESS', '当前棋局已有一条 DSH 决策正在进行')
    }
    const pending: PendingDecision = {
      agent,
      decisionId,
      gameId: request.gameId,
      revision: request.revision,
      controller: new AbortController(),
    }
    game.pending = pending
    const startedAt = Date.now()

    try {
      const route = this.resolveDecisionRoute(agent, request)
      this.startDecisionTrace(game, pending, route)
      this.updateDecisionTrace(
        game,
        decisionId,
        'preparing',
        '正在生成冻结局面和合法候选着法',
        { speaker: 'host', kind: 'status', text: 'Host 已锁定当前棋局和 revision，开始准备发给 DSH 的决策包。' },
      )
      const packet = buildXiangqiDecisionPacket(
        currentGame,
        {
          gameId: request.gameId,
          revision: request.revision,
          ...current.lastMove === undefined ? {} : { lastMove: current.lastMove },
        },
        decisionId,
        { localSearchTimeMs: DEFAULT_LOCAL_SEARCH_TIME_MS },
      )
      const candidates = packet.candidates.map(candidate => `${candidate.id} ${candidate.from}-${candidate.to}`).join('、')
      this.updateDecisionTrace(
        game,
        decisionId,
        'requesting',
        '已发送决策请求，等待 DSH 首个输出',
        {
          speaker: 'host',
          kind: 'request',
          text: `发送给 DSH：黑方当前局面（${packet.fen}），合法候选 ${candidates || '无'}。`,
        },
      )
      this.updateDecisionTrace(game, decisionId, 'requesting', '已发送决策请求，等待 DSH 首个输出', {
        speaker: 'host',
        kind: 'status',
        text: `调用 ${route.provider}/${route.model}，思考程度 ${route.reasoningEffort}。`,
      })
      const response = await this.obtainDecision(
        route,
        packet,
        pending.controller.signal,
        DEFAULT_PROTOCOL_RETRY_COUNT,
        chunk => { this.observeDecisionChunk(game, decisionId, chunk) },
        (attempt, message) => {
          this.updateDecisionTrace(game, decisionId, 'requesting', `第 ${attempt} 次请求，等待 DSH 返回`, {
            speaker: 'host',
            kind: 'status',
            text: message,
          })
        },
      )
      pending.controller.signal.throwIfAborted()
      // 提交闸门：决策已被取消、被新请求取代或服务已销毁时，模型结果一律作废。
      if (!this.gate.canCommit(decisionId)) {
        this.updateDecisionTrace(game, decisionId, 'cancelled', 'DSH 决策已取消，未提交落子', {
          speaker: 'host',
          kind: 'status',
          text: '当前决策已经被取消，棋局 revision 保持不变。',
        })
        return this.failedAiMove(
          request,
          game.currentGameId === request.gameId ? 'DECISION_CANCELLED' : 'STALE_GAME',
          game.currentGameId === request.gameId ? 'DSH 决策已取消' : '当前会话已经切换到另一盘棋局',
        )
      }

      this.updateDecisionTrace(game, decisionId, 'validating', '收到 DSH 结构化返回，正在校验', {
        speaker: 'dsh',
        kind: 'response',
        text: `DSH 返回：选择 ${response.candidate_id}${response.summary === undefined ? '' : `；${response.summary}`}`,
      })
      const latest = game.service.get(request.gameId)
      const latestGame = deserializeGame(JSON.stringify(latest.gameState))
      if (latest.revision !== request.revision) {
        this.updateDecisionTrace(game, decisionId, 'failed', '局面已变化，未提交 DSH 落子', {
          speaker: 'host',
          kind: 'error',
          text: `校验失败：棋局已经进入 revision ${latest.revision}。`,
        })
        return {
          status: 'stale',
          gameId: request.gameId,
          revision: latest.revision,
          message: `棋局已进入 revision ${latest.revision}`,
        }
      }
      const move = validateXiangqiDecisionForCurrentState(
        packet,
        response,
        {
          gameId: latest.gameId,
          revision: latest.revision,
          game: latestGame,
        },
      )
      this.updateDecisionTrace(game, decisionId, 'committing', 'DSH 选择已通过 Host 合法性校验，正在提交', {
        speaker: 'host',
        kind: 'status',
        text: `校验通过：${response.candidate_id} 对应的着法合法，开始提交黑方落子。`,
      })
      const meta = {
        source: 'dsh' as const,
        decisionId,
        provider: route.provider,
        model: route.model,
        candidateId: response.candidate_id,
        revision: request.revision,
        latencyMs: Math.max(0, Date.now() - startedAt),
        ...response.summary === undefined ? {} : { summary: response.summary },
      }
      const state = game.service.moveWithDecision({
        gameId: request.gameId,
        revision: request.revision,
        move,
      }, { move, meta })
      this.updateDecisionTrace(game, decisionId, 'completed', `DSH 已完成落子（${meta.latencyMs} ms）`, {
        speaker: 'host',
        kind: 'status',
        text: `Host 已提交黑方着法，当前 revision 为 ${state.revision}。`,
      })
      return { status: 'moved', state, decision: meta }
    } catch (error) {
      if (isAborted(pending.controller.signal)) {
        this.updateDecisionTrace(game, decisionId, 'cancelled', 'DSH 决策已取消，未提交落子', {
          speaker: 'host',
          kind: 'status',
          text: '请求已中止，棋局 revision 保持不变。',
        })
        return this.failedAiMove(request, 'DECISION_CANCELLED', 'DSH 决策已取消')
      }
      if (error instanceof XiangqiDecisionProtocolError) {
        this.updateDecisionTrace(game, decisionId, 'failed', 'DSH 返回未通过协议校验', {
          speaker: 'host',
          kind: 'error',
          text: error.message,
        })
        return this.failedAiMove(request, 'INVALID_DECISION', error.message)
      }
      if (error instanceof XiangqiError && error.code === 'STALE_REVISION') {
        this.updateDecisionTrace(game, decisionId, 'failed', '局面已变化，未提交 DSH 落子', {
          speaker: 'host',
          kind: 'error',
          text: error.message,
        })
        return {
          status: 'stale',
          gameId: request.gameId,
          revision: game.service.get(request.gameId).revision,
          message: error.message,
        }
      }
      const failure = error instanceof XiangqiDecisionModelError ? error.failure : undefined
      const rateLimited = failure !== undefined && isXiangqiRateLimitFailure(failure)
      this.updateDecisionTrace(game, decisionId, 'failed', rateLimited ? '模型提供商限流，未提交落子' : 'DSH 请求失败，未提交落子', {
        speaker: 'host',
        kind: 'error',
        text: messageOf(error),
      })
      return this.failedAiMove(request, 'MODEL_ERROR', messageOf(error))
    } finally {
      // 无论成败都解除闸门登记；aiPending 的权威值由 getRuntimeState 反映。
      this.gate.settle(decisionId)
      if (game.pending?.decisionId === decisionId) game.pending = undefined
    }
  }

  private gameFor(agent: Agent): SessionGame {
    this.assertLiveAgent(agent)
    return this.game
  }

  private assertLiveAgent(agent: Agent): void {
    if (this.ctx.agents.get(agent.id) !== agent) {
      throw new XiangqiError('INVALID_INPUT', 'the calling DSH agent is no longer live')
    }
  }

  private failedAiMove(
    request: XiangqiAiTurnRequest,
    code: Extract<XiangqiAiTurnResult, { status: 'failed' }>['code'],
    message: string,
  ): XiangqiAiTurnResult {
    return {
      status: 'failed',
      code,
      gameId: request.gameId,
      revision: request.revision,
      message,
    }
  }

  private startDecisionTrace(game: SessionGame, pending: PendingDecision, route: DecisionRoute): void {
    game.trace = {
      decisionId: pending.decisionId,
      gameId: pending.gameId,
      revision: pending.revision,
      provider: route.provider,
      model: route.model,
      reasoningEffort: route.reasoningEffort,
      startedAt: Date.now(),
      phase: 'preparing',
      phaseText: '正在准备 DSH 决策',
      outputChars: 0,
      reasoningDeltaCount: 0,
      entrySequence: 0,
      entries: [],
    }
    this.updateDecisionTrace(game, pending.decisionId, 'preparing', '正在准备 DSH 决策', {
      speaker: 'host',
      kind: 'status',
      text: `开始处理 gameId=${pending.gameId}、revision=${pending.revision} 的黑方回合。`,
    })
  }

  private updateDecisionTrace(
    game: SessionGame,
    decisionId: string,
    phase: XiangqiDecisionTracePhase,
    phaseText: string,
    entry?: Omit<XiangqiDecisionTraceEntry, 'id' | 'elapsedMs'>,
  ): void {
    const trace = game.trace
    if (trace === undefined || trace.decisionId !== decisionId) return
    trace.phase = phase
    trace.phaseText = phaseText
    // 首次进入终态时定格结束时刻：已结束的决策耗时不再随轮询增长。
    if (isTerminalPhase(phase) && trace.endedAt === undefined) {
      trace.endedAt = Date.now()
    }
    if (entry !== undefined) {
      trace.entrySequence += 1
      trace.entries.push({
        ...entry,
        id: trace.entrySequence,
        elapsedMs: Math.max(0, Date.now() - trace.startedAt),
      })
      if (trace.entries.length > 40) trace.entries.splice(0, trace.entries.length - 40)
    }
  }

  private observeDecisionChunk(game: SessionGame, decisionId: string, chunk: StreamChunk): void {
    const trace = game.trace
    if (trace === undefined || trace.decisionId !== decisionId) return
    if (chunk.type === 'reasoning-delta' && chunk.text.length > 0) {
      trace.reasoningDeltaCount += 1
      if (trace.phase !== 'receiving') {
        this.updateDecisionTrace(game, decisionId, 'receiving', 'DSH 已开始返回流式输出', {
          speaker: 'dsh',
          kind: 'status',
          text: 'DSH 已开始输出；面板只展示可观察进度，不展开隐藏思维内容。',
        })
      } else {
        trace.phaseText = `DSH 正在输出（已接收 ${trace.reasoningDeltaCount} 段思考流）`
      }
      return
    }
    if (chunk.type === 'text-delta' && chunk.text.length > 0) {
      trace.outputChars += chunk.text.length
      if (trace.phase !== 'receiving') {
        this.updateDecisionTrace(game, decisionId, 'receiving', 'DSH 已开始返回结构化结果', {
          speaker: 'dsh',
          kind: 'status',
          text: 'DSH 已开始返回结构化结果。',
        })
      } else {
        trace.phaseText = `DSH 正在返回结构化结果（已接收 ${trace.outputChars} 字）`
      }
      return
    }
    if (chunk.type === 'finish') {
      trace.phaseText = 'DSH 输出已结束，正在解析返回内容'
    }
  }

  private snapshotDecisionTrace(trace: DecisionTraceState): XiangqiDecisionTrace {
    return {
      decisionId: trace.decisionId,
      gameId: trace.gameId,
      revision: trace.revision,
      phase: trace.phase,
      phaseText: trace.phaseText,
      provider: trace.provider,
      model: trace.model,
      reasoningEffort: trace.reasoningEffort,
      // 终态后耗时以 endedAt 定格；只有运行中的决策才随轮询增长。
      elapsedMs: freezeElapsedMs(trace.startedAt, trace.endedAt, Date.now()),
      outputChars: trace.outputChars,
      reasoningDeltaCount: trace.reasoningDeltaCount,
      entries: trace.entries.map(entry => ({ ...entry })),
    }
  }

  /** Resolve the decision route from an explicit override or the session snapshot. */
  private resolveDecisionRoute(agent: Agent, request: XiangqiAiTurnRequest): DecisionRoute {
    const override = request.modelOverride
    const hasOverride = override?.provider !== undefined && override.model !== undefined
    const headerConfig = hasOverride ? undefined : agent.session.requestHeader()?.config
    const requestContext = agent.session.requestContext()
    // 纯函数解析（见 ./route.ts，可单测）：显式覆盖 > 会话请求头 >
    // 请求上下文 > Agent 创建默认值；off/xhigh/max 等自定义级别原样透传。
    return resolveRouteFromSnapshot({
      ...(override === undefined || !hasOverride ? {} : { override }),
      ...(headerConfig === undefined ? {} : { headerConfig: { provider: headerConfig.provider, model: headerConfig.model, reasoningEffort: headerConfig.reasoningEffort } }),
      ...(requestContext === undefined ? {} : { requestContext }),
      agentOptions: agent.options,
    })
  }

  private async obtainDecision(
    route: DecisionRoute,
    packet: XiangqiDecisionPacket,
    signal: AbortSignal,
    retryCount: number,
    observeChunk: (chunk: StreamChunk) => void,
    onRetry: (attempt: number, message: string) => void,
  ): Promise<XiangqiDecisionResponse> {
    for (let attempt = 0; attempt <= retryCount; attempt += 1) {
      try {
        const text = await this.streamDecision(route, packet, signal, observeChunk)
        return parseXiangqiDecisionResponse(text, packet)
      } catch (error) {
        if (!(error instanceof XiangqiDecisionProtocolError) || attempt >= retryCount) throw error
        onRetry(attempt + 2, `第 ${attempt + 1} 次返回未通过协议校验：${error.message}`)
      }
    }
    throw new Error('unreachable decision retry state')
  }

  private async streamDecision(
    route: DecisionRoute,
    packet: XiangqiDecisionPacket,
    signal: AbortSignal,
    observeChunk: (chunk: StreamChunk) => void,
  ): Promise<string> {
    signal.throwIfAborted()
    const requested = {
      provider: route.provider,
      model: route.model,
      maxTokens: DEFAULT_MAX_OUTPUT_TOKENS,
      ...route.reasoningEffort === 'auto' ? {} : { reasoningEffort: ReasoningEffortId(route.reasoningEffort) },
    }
    const resolved = await this.ctx.llm.resolveCallConfig(requested, signal)
    const options: GenerateOptions = deepFreeze({
      ...resolved,
      messages: [createUserMessage({
        content: [{ type: 'text', text: `Frozen Chinese chess decision packet:\n${JSON.stringify(packet)}` }],
        source: { kind: 'plugin', plugin: 'dsh-plugin-xiangqi' },
      })],
      system: DECISION_SYSTEM_PROMPT,
      maxTokens: DEFAULT_MAX_OUTPUT_TOKENS,
      signal,
    })
    const assembler = new BlockAssembler()
    for await (const chunk of this.ctx.llm.stream(options)) {
      signal.throwIfAborted()
      observeChunk(chunk)
      assembler.push(chunk)
    }
    signal.throwIfAborted()
    if (assembler.finish.kind === 'tool-calls') {
      throw new XiangqiDecisionProtocolError('INVALID_SHAPE', 'model returned a tool call instead of JSON')
    }
    const terminalError = finishError(assembler.finish)
    if (terminalError !== undefined) throw terminalError
    const blocks = assembler.blocks()
    if (blocks.some(block => block.type === 'tool-call')) {
      throw new XiangqiDecisionProtocolError('INVALID_SHAPE', 'model returned a tool call instead of JSON')
    }
    const text = blocks
      .filter((block): block is Extract<(typeof blocks)[number], { type: 'text' }> => block.type === 'text')
      .map(block => block.text)
      .join('')
    if (text.trim().length === 0) {
      // 区分"输出预算被隐藏思考耗尽"与"真的没有内容"：前者要引导用户调低
      // 思考程度，而不是让人以为模型坏了。
      const hint = assembler.finish.kind === 'max-tokens'
        ? '输出预算很可能已被隐藏思考全部占用；可在会话的模型选择里调低思考程度（例如 high/medium）后重试'
        : '模型完成响应但没有返回可见内容'
      const failure: LlmFailure = {
        message: `模型未返回可用内容：${hint}`,
        code: 'EMPTY_RESPONSE',
      }
      throw new XiangqiDecisionModelError(failure)
    }
    return text
  }

  private cancelPending(game: SessionGame): boolean {
    const pending = game.pending
    if (pending === undefined) return false
    this.updateDecisionTrace(game, pending.decisionId, 'cancelled', 'DSH 决策已取消，未提交落子', {
      speaker: 'host',
      kind: 'status',
      text: '当前请求已被取消，棋局 revision 保持不变。',
    })
    pending.controller.abort()
    game.pending = undefined
    this.gate.cancel()
    return true
  }
}

export default XiangqiService
