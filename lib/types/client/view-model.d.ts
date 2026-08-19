/** Convert the Host's authoritative JSON snapshot into the board view model. */
import type { Side } from '../game/types.ts';
import type { XiangqiSerializedState, XiangqiSide } from '../types.ts';
import type { XiangqiGameViewModel } from './types.ts';
/**
 * Project one Host snapshot. The client uses the pure core only to format the
 * already committed state and legal destinations; move acceptance remains a
 * revision-fenced Host operation.
 */
export declare function toXiangqiGameViewModel(state: XiangqiSerializedState, options?: {
    readonly humanSide?: XiangqiSide;
    readonly busy?: boolean;
}): XiangqiGameViewModel;
/** Read the current turn without duplicating the board projection. */
export declare function turnOf(state: XiangqiSerializedState): Side;
/** Convert a visible row/column pair into the Host's canonical UCCI coordinate. */
export declare function ucciOf(position: {
    readonly row: number;
    readonly col: number;
}): string;
//# sourceMappingURL=view-model.d.ts.map