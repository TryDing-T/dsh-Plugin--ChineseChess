import { type Board, type GameState, type GameStateOptions, type Move, type MoveInput, type Piece, type Position, type Side } from './types.ts';
export declare class InvalidPositionError extends Error {
    readonly code = "INVALID_POSITION";
    constructor(message: string);
}
export type IllegalMoveCode = 'GAME_OVER' | 'NO_PIECE' | 'WRONG_TURN' | 'ILLEGAL_DESTINATION';
export declare class IllegalMoveError extends Error {
    readonly code: IllegalMoveCode;
    constructor(code: IllegalMoveCode, message: string);
}
/** 内部和 FEN 解析共用的状态构造器；会重新计算将军和终局状态。 */
export declare function makeGameState(board: Board, turn: Side, options?: GameStateOptions): GameState;
export declare function newGame(): GameState;
export declare function getPieceAt(game: GameState, position: Position | string): Piece | null;
export declare function isInCheck(game: GameState, side?: Side): boolean;
export declare function getLegalMoves(game: GameState, from?: Position | string): Move[];
export declare function applyMove(game: GameState, input: MoveInput | Move): GameState;
/** 没有可悔棋时返回 null；否则返回落回上一步后的新状态。 */
export declare function undo(game: GameState): GameState | null;
export declare function canUndo(game: GameState): boolean;
/**
 * 生成某方的全部伪走法（含把己方将帅置于被将军状态、以及不可取的非法走法）。
 * 导出给 AI 搜索内核，内核会做就地走子 + 单点将军过滤以节省每次克隆整盘的开销，
 * 从而与规则引擎共用同一套走法与判定，避免搜索与规则失同步。
 */
export declare function generatePseudoMoves(board: Board, side: Side): Move[];
/**
 * 就地走子后判断某方是否处于被将军状态。
 * 导出给 AI 搜索内核做单点合法性过滤，避免每次全量克隆棋盘。
 */
export declare function isInCheckOnBoard(board: Board, side: Side): boolean;
//# sourceMappingURL=rules.d.ts.map