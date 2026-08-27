/** Root-scoped UI state for the independent Chinese chess overlay. */
import { type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client';
import type { XiangqiDecisionTrace, XiangqiSerializedState } from '../types.ts';
import type { XiangqiActivity, XiangqiGameViewModel } from './types.ts';
export interface XiangqiUiState {
    open: boolean;
    minimized: boolean;
    sessionId: string | null;
    gameId: string | null;
    revision: number | null;
    game: XiangqiGameViewModel | null;
    decisionTrace: XiangqiDecisionTrace | null;
    /** 本页面自己发起的普通操作（开局/走子/悔棋/认输）尚未返回。 */
    operationBusy: boolean;
    /** Host 确实存在黑方决策在运行（跨页面权威值，由运行状态轮询写入）。 */
    aiPending: boolean;
    /** operationBusy 期间的细粒度动作标签，用于把悔棋/新局与"AI 思考中"区分开。 */
    activity: XiangqiActivity;
    error: string | null;
}
export type XiangqiUiActions = {
    open: (draft: XiangqiUiState) => void;
    close: (draft: XiangqiUiState) => void;
    toggleMinimized: (draft: XiangqiUiState) => void;
    attachSession: (draft: XiangqiUiState, sessionId: string) => void;
    detachSession: (draft: XiangqiUiState) => void;
    clearGame: (draft: XiangqiUiState) => void;
    /** Host 进程重建后清掉指向已消失棋局的本地视图；保留会话绑定与错误状态。 */
    hostReset: (draft: XiangqiUiState) => void;
    setOperationBusy: (draft: XiangqiUiState, busy: boolean) => void;
    setAiPending: (draft: XiangqiUiState, pending: boolean) => void;
    setActivity: (draft: XiangqiUiState, activity: XiangqiActivity) => void;
    setError: (draft: XiangqiUiState, error: string | null) => void;
    setDecisionTrace: (draft: XiangqiUiState, trace: XiangqiDecisionTrace | null) => void;
    setGame: (draft: XiangqiUiState, sessionId: string, state: XiangqiSerializedState, game: XiangqiGameViewModel) => void;
};
/** 棋盘交互禁用条件：本页面有操作未返回，或 Host 正在等 DSH 落子。 */
export declare function isBoardLocked(state: Pick<XiangqiUiState, 'operationBusy' | 'aiPending'>): boolean;
/**
 * Store factory rather than a module-level handle: DSH slot registration owns
 * the handle identity and can dispose/recreate it during client HMR.
 */
export declare function createXiangqiStore(): EngineStoreHandle<XiangqiUiState, XiangqiUiActions>;
//# sourceMappingURL=store.d.ts.map