import type { XiangqiDecisionTrace } from '../types.ts';
import type { XiangqiGameViewModel, XiangqiPageActions } from './types.ts';
/** Props for the visible DSH Chinese chess page. */
export interface XiangqiPageProps extends XiangqiPageActions {
    /** Current JSON view model projected by the game/host layer. */
    readonly game: XiangqiGameViewModel;
    /** Observable Host/DSH decision progress for the current process-global game. */
    readonly decisionTrace?: XiangqiDecisionTrace | null;
}
/**
 * 现代新国风 9x10 中国象棋主界面
 */
export declare function XiangqiPage({ game, decisionTrace, onMove, onNewGame, onUndo, onResign, onCancelAiMove, onRequestAiMove, onExit, }: XiangqiPageProps): import("react").JSX.Element;
/** Backwards-compatible board name for slot adapters that call the surface a board. */
export declare const XiangqiBoard: typeof XiangqiPage;
//# sourceMappingURL=XiangqiPage.d.ts.map