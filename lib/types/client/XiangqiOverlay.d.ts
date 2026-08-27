/** Frame-wide Chinese chess surface and its Host/Agent turn bridge. */
import type { PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots';
import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client';
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
import type { XiangqiAiModelOverride, XiangqiAiTurnRequest, XiangqiAiTurnResult, XiangqiDecisionTrace, XiangqiNewGameRequest, XiangqiRuntimeState, XiangqiSerializedState } from '../types.ts';
import { createXiangqiStore } from './store.ts';
export interface XiangqiClientRemote {
    newGame: (sessionId: SessionId, request: XiangqiNewGameRequest) => Promise<RemoteResult<XiangqiSerializedState>>;
    get: (sessionId: SessionId, gameId?: string) => Promise<RemoteResult<XiangqiSerializedState>>;
    getRuntimeState: (sessionId: SessionId) => Promise<RemoteResult<XiangqiRuntimeState>>;
    getDecisionTrace: (sessionId: SessionId, gameId?: string) => Promise<RemoteResult<XiangqiDecisionTrace | null>>;
    move: (sessionId: SessionId, request: {
        gameId: string;
        revision: number;
        move: {
            from: string;
            to: string;
        };
    }) => Promise<RemoteResult<XiangqiSerializedState>>;
    undo: (sessionId: SessionId, request: {
        gameId: string;
        revision: number;
    }) => Promise<RemoteResult<XiangqiSerializedState>>;
    resign: (sessionId: SessionId, request: {
        gameId: string;
        revision: number;
        side: 'red' | 'black';
    }) => Promise<RemoteResult<XiangqiSerializedState>>;
    requestAiMove: (sessionId: SessionId, request: XiangqiAiTurnRequest) => Promise<RemoteResult<XiangqiAiTurnResult>>;
    cancelAiMove: (sessionId: SessionId) => Promise<RemoteResult<{
        readonly cancelled: boolean;
    }>>;
}
/**
 * 每次黑方请求前读取一次当前会话的模型选择快照（审查第二轮 P0）。
 * 实现端走官方 `session.models` Remote；失败返回 null，让 Host 用自己的
 * 会话头快照兜底，绝不阻塞对弈。
 */
export type XiangqiModelSelectionFetcher = (sessionId: SessionId) => Promise<XiangqiAiModelOverride | null>;
export type XiangqiOverlayProps = PropsRuntime<'shell.overlay'> & PropsStore<ReturnType<typeof createXiangqiStore>>;
/**
 * Build a slot component with the mounted Remote face closed over the plugin
 * fiber. This avoids a module-level singleton and keeps HMR unload-safe.
 */
export declare function createXiangqiOverlay(remote: XiangqiClientRemote, fetchModelSelection?: XiangqiModelSelectionFetcher): ({ useSessions, useStore, actions, }: XiangqiOverlayProps) => import("react").JSX.Element | null;
//# sourceMappingURL=XiangqiOverlay.d.ts.map