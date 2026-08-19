/**
 * 中国象棋规则内核的公开类型。
 *
 * 坐标约定：x 为从左到右的 0..8，y 为从上到下的 0..9。
 * 因此黑方底线是 y=0，红方底线是 y=9；坐标字符串使用 a9..i0。
 */

export const BOARD_WIDTH = 9
export const BOARD_HEIGHT = 10
export const BOARD_SIZE = BOARD_WIDTH * BOARD_HEIGHT

export type Side = 'red' | 'black'

export type PieceType =
  | 'general'
  | 'advisor'
  | 'elephant'
  | 'horse'
  | 'rook'
  | 'cannon'
  | 'soldier'

export interface Position {
  readonly x: number
  readonly y: number
}

export type PositionLike = Position | string

export interface Piece {
  readonly side: Side
  readonly type: PieceType
}

export type Board = ReadonlyArray<Piece | null>

export interface MoveInput {
  readonly from: PositionLike
  readonly to: PositionLike
}

/** 一个已经通过当前局面规则过滤的走法。 */
export interface Move {
  readonly from: Position
  readonly to: Position
  readonly piece: Piece
  readonly captured: Piece | null
}

export type GameStatus = 'playing' | 'checkmate' | 'stalemate'

/** 已经落子、可用于棋谱和悔棋的历史记录。 */
export interface MoveRecord extends Move {
  /** 不含将军后缀的中文棋谱，例如“炮二平五”。 */
  readonly notation: string
  /** 这一步落子后，下一方是否处于将军状态。 */
  readonly givesCheck: boolean
  /** 这一步落子后产生的局面状态。 */
  readonly result: GameStatus
  readonly halfmoveClockBefore: number
  readonly fullmoveNumberBefore: number
}

export interface GameState {
  readonly board: Board
  /** 当前轮到哪一方。红方先行。 */
  readonly turn: Side
  /** 当前轮到的一方是否被将军。 */
  readonly inCheck: boolean
  readonly status: GameStatus
  /** 将死时为获胜方，和棋或进行中为 null。 */
  readonly winner: Side | null
  /** FEN 半回合计数；吃子或走兵后归零。 */
  readonly halfmoveClock: number
  /** FEN 全回合计数，从 1 开始，黑方落子后加一。 */
  readonly fullmoveNumber: number
  readonly history: ReadonlyArray<MoveRecord>
  readonly lastMove: MoveRecord | null
}

export interface GameStateOptions {
  readonly halfmoveClock?: number
  readonly fullmoveNumber?: number
  readonly history?: ReadonlyArray<MoveRecord>
}

export type SerializationFormat = 'json' | 'fen'

export interface SerializeOptions {
  /** 默认 json；fen 只保存当前棋盘和 FEN 计数，不保存历史。 */
  readonly format?: SerializationFormat
}
