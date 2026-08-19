import type { Position, PositionLike } from './types.ts';
export declare function isOnBoard(position: Position): boolean;
export declare function assertPosition(position: Position): Position;
export declare function positionToIndex(position: Position): number;
export declare function indexToPosition(index: number): Position;
/**
 * 将内部坐标转成 UCCI/PEN 风格的两字符坐标。
 * 例如红帅初始位置为 e0，黑将初始位置为 e9。
 */
export declare function formatCoordinate(position: Position): string;
/** 支持 a9..i0，也支持用于 UI 调试的“x,y”形式。 */
export declare function parseCoordinate(value: PositionLike): Position;
export declare function samePosition(left: Position, right: Position): boolean;
export declare function clonePosition(position: Position): Position;
//# sourceMappingURL=coordinates.d.ts.map