/** JSON-safe vocabulary shared by the Host boundary, session projection, and client. */
export type JsonPrimitive = string | number | boolean | null

export type JsonValue = JsonPrimitive | JsonObject | JsonValue[]

export interface JsonObject {
  [key: string]: JsonValue
}

export type XiangqiSide = 'red' | 'black'

export type XiangqiGamePhase = 'active' | 'resigned'

export type XiangqiOperation = 'newGame' | 'move' | 'undo' | 'resign'

/**
 * 思考程度：跟随模型/供应商的自定义取值（例如 off/xhigh/max），
 * 只要求非空字符串；'auto' 是"不显式传给模型"的哨兵值。
 */
export type XiangqiAiReasoningEffort = string

/** A move in the canonical UCCI/PEN coordinate format (for example e3 -> e4). */
export interface XiangqiMove {
  readonly from: string
  readonly to: string
}

/** Public Remote request contracts, kept on the package's ./types boundary. */
export interface XiangqiNewGameRequest {
  readonly sessionId?: string
}

export interface XiangqiMoveRequest {
  readonly gameId: string
  readonly revision: number
  readonly move: XiangqiMove
}

export interface XiangqiUndoRequest {
  readonly gameId: string
  readonly revision: number
}

export interface XiangqiResignRequest {
  readonly gameId: string
  readonly revision: number
  readonly side: XiangqiSide
}

export interface XiangqiDecisionBoardEncoding {
  readonly orientation: 'black-top-red-bottom'
  readonly rows: readonly string[]
  readonly symbols: 'rheakcp=black,RHEAKCP=red,.'
}

export interface XiangqiDecisionRuleFacts {
  readonly turn: 'black'
  readonly inCheck: boolean
  readonly legalMoveCount: number
  readonly blackGeneral: string
  readonly redGeneral: string
  readonly halfmoveClock: number
  readonly fullmoveNumber: number
}

export interface XiangqiDecisionCandidate {
  readonly id: string
  readonly rank: number
  readonly from: string
  readonly to: string
  readonly score: number
  readonly givesCheck: boolean
  readonly captures: boolean
  readonly escapesCheck: boolean
  readonly materialDelta: number
  readonly shortPv?: readonly string[]
}

/** One frozen Host-generated position sent to the isolated DSH request. */
export interface XiangqiDecisionPacket {
  readonly protocol: 'xiangqi-decision/v1'
  readonly decisionId: string
  readonly positionId: string
  readonly gameId: string
  readonly revision: number
  readonly side: 'black'
  readonly fen: string
  readonly boardEncoding: XiangqiDecisionBoardEncoding
  readonly lastMove: XiangqiMove | null
  readonly ruleFacts: XiangqiDecisionRuleFacts
  readonly candidates: readonly XiangqiDecisionCandidate[]
}

export interface XiangqiDecisionObserved {
  readonly side: 'black'
  readonly in_check: boolean
  readonly black_general: string
  readonly red_general: string
}

/** The only semantic fields the model is allowed to return. */
export interface XiangqiDecisionResponse {
  readonly decision_id: string
  readonly position_id: string
  readonly observed: XiangqiDecisionObserved
  readonly candidate_id: string
  readonly summary?: string
}

export interface XiangqiDecisionMeta {
  readonly source: 'dsh'
  readonly decisionId: string
  readonly provider: string
  readonly model: string
  readonly candidateId: string
  readonly revision: number
  readonly latencyMs: number
  readonly summary?: string
}

/** Lifecycle phases exposed by the chess panel for one DSH decision. */
export type XiangqiDecisionTracePhase =
  | 'preparing'
  | 'requesting'
  | 'receiving'
  | 'validating'
  | 'committing'
  | 'completed'
  | 'failed'
  | 'cancelled'

export interface XiangqiDecisionTraceEntry {
  readonly id: number
  readonly speaker: 'host' | 'dsh'
  readonly kind: 'status' | 'request' | 'response' | 'error'
  readonly text: string
  readonly elapsedMs: number
}

/** Observable request/response diagnostics; it deliberately excludes hidden model reasoning text. */
export interface XiangqiDecisionTrace {
  readonly decisionId: string
  readonly gameId: string
  readonly revision: number
  readonly phase: XiangqiDecisionTracePhase
  readonly phaseText: string
  readonly provider: string
  readonly model: string
  readonly reasoningEffort: XiangqiAiReasoningEffort
  readonly elapsedMs: number
  readonly outputChars: number
  readonly reasoningDeltaCount: number
  readonly entries: readonly XiangqiDecisionTraceEntry[]
}

/**
 * Host 端原子运行状态：一次 Remote 同时带回棋局快照与决策状态，
 * 让任意标签页都能看到一致的"AI 是否正在计算"。
 */
export interface XiangqiRuntimeState {
  /** 当前全局棋局；Host 尚未创建过任何棋局时为 null。读取它不会隐式开新局。 */
  readonly state: XiangqiSerializedState | null
  /** Host 是否确实还有一条黑方决策在运行（跨页面权威值）。 */
  readonly aiPending: boolean
  /** 进行中/最近一条决策的阶段；没有任何决策时为 null。 */
  readonly phase: XiangqiDecisionTracePhase | null
  /** 最近一条决策追踪（终态后耗时会冻结）。 */
  readonly trace: XiangqiDecisionTrace | null
}

export interface XiangqiAiModelOverride {
  readonly provider?: string
  readonly model?: string
  readonly reasoningEffort?: XiangqiAiReasoningEffort
}

export interface XiangqiAiTurnRequest {
  readonly gameId: string
  readonly revision: number
  readonly modelOverride?: XiangqiAiModelOverride
}

export type XiangqiAiTurnFailureCode =
  | 'MODEL_ERROR'
  | 'INVALID_DECISION'
  | 'DECISION_CANCELLED'
  | 'DECISION_IN_PROGRESS'
  | 'STALE_GAME'
  | 'STALE_REVISION'
  | 'NOT_BLACK_TURN'

export type XiangqiAiTurnResult =
  | {
    readonly status: 'moved'
    readonly state: XiangqiSerializedState
    readonly decision: XiangqiDecisionMeta
  }
  | {
    readonly status: 'failed'
    readonly code: XiangqiAiTurnFailureCode
    readonly gameId: string
    readonly revision: number
    readonly message: string
  }
  | {
    readonly status: 'stale'
    readonly gameId: string
    readonly revision: number
    readonly message: string
  }

/** Serializable state returned by Remote calls, the model tool, and projections. */
export interface XiangqiSerializedState {
  readonly gameId: string
  readonly sessionId?: string
  readonly revision: number
  readonly phase: XiangqiGamePhase
  readonly winner?: XiangqiSide
  readonly gameState: JsonValue
  readonly lastMove?: XiangqiMove
}

/** Whole-value event written after one Host mutation commits. */
export interface XiangqiChange {
  readonly operation: XiangqiOperation
  readonly state: XiangqiSerializedState
  readonly decision?: XiangqiDecisionMeta
}
