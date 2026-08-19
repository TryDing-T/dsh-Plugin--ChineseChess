/** Root-scoped UI state for the independent Chinese chess overlay. */
import { defineStore } from '@deepseek-ai/dsh-client-runtime/client';
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
            busy: false,
            error: null,
        }),
        actions: {
            open: d => { d.open = true; d.minimized = false; },
            close: d => { d.open = false; d.minimized = false; },
            toggleMinimized: d => { d.minimized = !d.minimized; },
            clearGame: (d) => {
                d.minimized = false;
                d.sessionId = null;
                d.gameId = null;
                d.revision = null;
                d.game = null;
                d.busy = false;
                d.error = null;
            },
            setBusy: (d, busy) => { d.busy = busy; },
            setError: (d, error) => { d.error = error; },
            setGame: (d, sessionId, state, game) => {
                d.sessionId = sessionId;
                d.gameId = state.gameId;
                d.revision = state.revision;
                d.game = game;
                d.error = null;
            },
        },
    });
}
//# sourceMappingURL=store.js.map