/** JSON-safe vocabulary shared by the Host boundary, session projection, and client. */
export type JsonPrimitive = string | number | boolean | null

export type JsonValue = JsonPrimitive | JsonObject | JsonValue[]

export interface JsonObject {
  [key: string]: JsonValue
}

export type XiangqiSide = 'red' | 'black'

export type XiangqiGamePhase = 'active' | 'resigned'

export type XiangqiOperation = 'newGame' | 'move' | 'undo' | 'resign'

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
}

/** Current session projection. Null is reserved for a session with no game yet. */
export type XiangqiProjection = XiangqiSerializedState | null

declare module '@deepseek-ai/dsh-session-projection/types' {
  interface SessionProjectionMap {
    /** Latest committed Chinese chess game for the session, or null before a game exists. */
    xiangqi: XiangqiProjection
  }
}
