/** Frame-wide Chinese chess surface and its Host/Agent turn bridge. */
import type { PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots';
import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client';
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
import type { XiangqiNewGameRequest, XiangqiSerializedState } from '../types.ts';
import { createXiangqiStore } from './store.ts';
export interface XiangqiClientRemote {
    newGame: (sessionId: SessionId, request: XiangqiNewGameRequest) => Promise<RemoteResult<XiangqiSerializedState>>;
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
}
export type PromptDshTurn = (sessionId: SessionId, state: XiangqiSerializedState, suggestions: {
    depth: number;
    nodes: number;
    candidates: readonly {
        from: string;
        to: string;
        score: number;
    }[];
}) => Promise<void>;
export type XiangqiOverlayProps = PropsRuntime<'shell.overlay'> & PropsStore<ReturnType<typeof createXiangqiStore>>;
/**
 * Build a slot component with the mounted Remote face closed over the plugin
 * fiber. This avoids a module-level singleton and keeps HMR unload-safe.
 */
export declare function createXiangqiOverlay(remote: XiangqiClientRemote, promptDshTurn: PromptDshTurn): ({ useSessions, useStore, actions, }: XiangqiOverlayProps) => import("react").JSX.Element | null;
//# sourceMappingURL=XiangqiOverlay.d.ts.map