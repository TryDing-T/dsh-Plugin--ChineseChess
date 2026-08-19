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

/** The lifecycle state exposed by the game projection. */
export type XiangqiGameStatus = 'playing' | 'red-won' | 'black-won' | 'draw' | 'resigned'

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
}
