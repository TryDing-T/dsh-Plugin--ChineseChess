/** Root-scoped UI state for the independent Chinese chess overlay. */
import { type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client';
import type { XiangqiSerializedState } from '../types.ts';
import type { XiangqiGameViewModel } from './types.ts';
export interface XiangqiUiState {
    open: boolean;
    minimized: boolean;
    sessionId: string | null;
    gameId: string | null;
    revision: number | null;
    game: XiangqiGameViewModel | null;
    busy: boolean;
    error: string | null;
}
export type XiangqiUiActions = {
    open: (draft: XiangqiUiState) => void;
    close: (draft: XiangqiUiState) => void;
    toggleMinimized: (draft: XiangqiUiState) => void;
    clearGame: (draft: XiangqiUiState) => void;
    setBusy: (draft: XiangqiUiState, busy: boolean) => void;
    setError: (draft: XiangqiUiState, error: string | null) => void;
    setGame: (draft: XiangqiUiState, sessionId: string, state: XiangqiSerializedState, game: XiangqiGameViewModel) => void;
};
/**
 * Store factory rather than a module-level handle: DSH slot registration owns
 * the handle identity and can dispose/recreate it during client HMR.
 */
export declare function createXiangqiStore(): EngineStoreHandle<XiangqiUiState, XiangqiUiActions>;
//# sourceMappingURL=store.d.ts.map