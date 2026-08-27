/** Convert the Host's authoritative JSON snapshot into the board view model. */
import type { Side } from '../game/types.ts';
import type { XiangqiSerializedState, XiangqiSide } from '../types.ts';
import type { XiangqiActivity, XiangqiGameViewModel } from './types.ts';
/**
 * 渲染时计算的实时标题（审查第三轮）：aiPending/activity 是随时会变的
 * 运行标志，固化进 ViewModel 的字符串会误导用户（例如别的标签页取消后
 * 本页仍显示"AI 正在计算"）。基础文案之外的一切动态状态都在这里求值。
 */
export declare function liveStatusTextOf(game: XiangqiGameViewModel): string;
/**
 * Project one Host snapshot. The client uses the pure core only to format the
 * already committed state and legal destinations; move acceptance remains a
 * revision-fenced Host operation.
 */
export declare function toXiangqiGameViewModel(state: XiangqiSerializedState, options?: {
    readonly humanSide?: XiangqiSide;
    readonly busy?: boolean;
    readonly aiPending?: boolean;
    readonly activity?: XiangqiActivity;
}): XiangqiGameViewModel;
/** Read the current turn without duplicating the board projection. */
export declare function turnOf(state: XiangqiSerializedState): Side;
/** Convert a visible row/column pair into the Host's canonical UCCI coordinate. */
export declare function ucciOf(position: {
    readonly row: number;
    readonly col: number;
}): string;
//# sourceMappingURL=view-model.d.ts.map