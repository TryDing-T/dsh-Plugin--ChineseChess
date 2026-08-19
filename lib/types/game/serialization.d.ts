import { type GameState, type SerializeOptions } from './types.ts';
export declare function toFen(game: GameState): string;
export declare function fromFen(fen: string): GameState;
/**
 * 默认保存为 JSON，以便同时保留 FEN 和悔棋历史；也可通过 format:'fen' 只导出标准扩展 FEN。
 * deserialize 同时接受这两种格式。
 */
export declare function serialize(game: GameState, options?: SerializeOptions): string;
export declare function deserialize(serialized: string): GameState;
//# sourceMappingURL=serialization.d.ts.map