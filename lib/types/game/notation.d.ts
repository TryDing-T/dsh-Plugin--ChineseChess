import type { GameState, Move, MoveInput, MoveRecord, Piece, PieceType } from './types.ts';
/**
 * 格式化一手中文棋谱。
 * 这是常用的红方视角文件编号：红方右侧为“一”，黑方从黑方视角计算文件号。
 */
export declare function formatChineseMove(game: GameState, input: MoveInput | Move): string;
/** 将记录转换成可直接展示的中文棋谱，附带将军/将死标记。 */
export declare function formatMoveRecord(record: MoveRecord): string;
export declare function getPieceLabel(piece: Piece): string;
export declare function getPieceTypeLabel(type: PieceType): string;
//# sourceMappingURL=notation.d.ts.map