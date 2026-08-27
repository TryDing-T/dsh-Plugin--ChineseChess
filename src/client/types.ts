/** Number of ranks on a Chinese chess board. */
export const XIANGQI_ROWS = 10

/** Number of files on a Chinese chess board. */
export const XIANGQI_COLUMNS = 9

/** A side that can own a Chinese chess piece. */
export type XiangqiSide = 'red' | 'black'

/** The seven Chinese chess piece kinds. */
export type XiangqiPieceKind =
  | 'general'
  | 'advisor'
  | 'elephant'
  | 'horse'
  | 'rook'
  | 'cannon'
  | 'soldier'

/** A zero-based location in the 9x10 board. */
export interface XiangqiPosition {
  readonly row: number
  readonly col: number
}

/** A JSON-friendly piece projected by the game/host layer. */
export interface XiangqiPiece {
  readonly id: string
  readonly side: XiangqiSide
  readonly kind: XiangqiPieceKind
  /** Optional display override for a variant or localized piece set. */
  readonly label?: string
}

/** A legal destination offered for the currently projected game state. */
export interface XiangqiLegalMove {
  readonly from: XiangqiPosition
  readonly to: XiangqiPosition
}

/** A completed move shown in the visible move list. */
export interface XiangqiMoveRecord extends XiangqiLegalMove {
  readonly side: XiangqiSide
  readonly notation: string
  readonly captured?: XiangqiPieceKind
}

/** The lifecycle state exposed by the game projection. 中国象棋无和棋困毙，终局均有胜方。 */
export type XiangqiGameStatus = 'playing' | 'red-won' | 'black-won' | 'resigned'

/** 当前 Overlay 正在执行的后台动作，用于把状态文案与"AI 思考中"区分开。 */
export type XiangqiActivity = 'idle' | 'ai' | 'undo' | 'new' | 'sync'

/**
 * JSON-friendly view model consumed by the client page.
 *
 * The client does not calculate rules. `legalMoves` is supplied by the game
 * projection and is filtered against the piece selected in the page.
 */
export interface XiangqiGameViewModel {
  readonly board: readonly (readonly (XiangqiPiece | null)[])[]
  readonly currentTurn: XiangqiSide
  /** Side controlled by the person in the board UI; the other side is DSH. */
  readonly humanSide?: XiangqiSide
  readonly legalMoves: readonly XiangqiLegalMove[]
  readonly moves: readonly XiangqiMoveRecord[]
  readonly status: XiangqiGameStatus
  readonly statusText: string
  readonly lastMove?: XiangqiLegalMove
  readonly inCheck?: boolean
  readonly busy?: boolean
  /** Host 确实存在黑方决策（跨页面权威值）；与本页面 operationBusy 区分。 */
  readonly aiPending?: boolean
  /** 与 busy 配合展示的细粒度动作标签；缺省按 idle 处理。 */
  readonly activity?: XiangqiActivity
}

/** Payload passed to the host/game callback after a legal destination click. */
export type XiangqiMoveRequest = XiangqiLegalMove

/** Host/game callbacks injected by the DSH client adapter. */
export interface XiangqiPageActions {
  /** Apply one move to the authoritative game state. */
  readonly onMove: (move: XiangqiMoveRequest) => void | Promise<void>
  /** Start a fresh game. */
  readonly onNewGame: () => void | Promise<void>
  /** Rewind the latest completed move. */
  readonly onUndo: () => void | Promise<void>
  /** End the current game as a resignation. */
  readonly onResign: () => void | Promise<void>
  /** Cancel the in-flight DSH decision without changing the board revision. */
  readonly onCancelAiMove?: () => void | Promise<void>
  /** Re-request the DSH move after a failed or cancelled black-side decision. */
  readonly onRequestAiMove?: () => void | Promise<void>
  /** Close the floating chess surface. */
  readonly onExit?: () => void | Promise<void>
}
