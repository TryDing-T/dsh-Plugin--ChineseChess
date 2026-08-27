/** Root-scoped UI state for the independent Chinese chess overlay. */
import { defineStore } from '@deepseek-ai/dsh-client-runtime/client';
/** 棋盘交互禁用条件：本页面有操作未返回，或 Host 正在等 DSH 落子。 */
export function isBoardLocked(state) {
    return state.operationBusy || state.aiPending;
}
/**
 * Store factory rather than a module-level handle: DSH slot registration owns
 * the handle identity and can dispose/recreate it during client HMR.
 */
export function createXiangqiStore() {
    return defineStore({
        init: () => ({
            open: false,
            minimized: false,
            sessionId: null,
            gameId: null,
            revision: null,
            game: null,
            decisionTrace: null,
            operationBusy: false,
            aiPending: false,
            activity: 'idle',
            error: null,
        }),
        actions: {
            open: d => { d.open = true; d.minimized = false; },
            close: d => { d.open = false; d.minimized = false; },
            toggleMinimized: d => { d.minimized = !d.minimized; },
            // Rebind the visible surface without discarding the process-global game.
            attachSession: (d, sessionId) => {
                d.sessionId = sessionId;
                d.error = null;
            },
            // Session switching must not discard the process-global game view.
            detachSession: (d) => {
                d.sessionId = null;
                d.operationBusy = false;
                // aiPending 是 Host 权威状态，换聊天不清除；由运行状态轮询继续维护。
                d.activity = 'idle';
                d.error = null;
                if (d.game !== null)
                    d.game = { ...d.game, busy: false };
            },
            clearGame: (d) => {
                d.minimized = false;
                d.sessionId = null;
                d.gameId = null;
                d.revision = null;
                d.game = null;
                d.decisionTrace = null;
                d.operationBusy = false;
                d.aiPending = false;
                d.activity = 'idle';
                d.error = null;
            },
            hostReset: (d) => {
                d.gameId = null;
                d.revision = null;
                d.game = null;
                d.decisionTrace = null;
                d.aiPending = false;
            },
            setOperationBusy: (d, busy) => {
                d.operationBusy = busy;
                if (d.game !== null)
                    d.game = { ...d.game, busy: isBoardLocked(d) };
            },
            setAiPending: (d, pending) => {
                d.aiPending = pending;
                if (d.game !== null)
                    d.game = { ...d.game, busy: isBoardLocked(d), aiPending: pending };
            },
            setActivity: (d, activity) => {
                d.activity = activity;
                if (d.game !== null)
                    d.game = { ...d.game, activity };
            },
            setError: (d, error) => { d.error = error; },
            setDecisionTrace: (d, trace) => { d.decisionTrace = trace; },
            setGame: (d, sessionId, state, game) => {
                d.sessionId = sessionId;
                d.gameId = state.gameId;
                d.revision = state.revision;
                d.game = { ...game, busy: isBoardLocked(d), aiPending: d.aiPending };
                d.error = null;
            },
        },
    });
}
//# sourceMappingURL=store.js.map