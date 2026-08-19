import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/** Frame-wide Chinese chess surface and its Host/Agent turn bridge. */
import { useEffect, useRef } from 'react';
import { toXiangqiGameViewModel, turnOf, ucciOf } from "./view-model.js";
import { XiangqiPage } from "./XiangqiPage.js";
import css from './XiangqiSlots.module.css';
import { formatCoordinate } from "../game/coordinates.js";
import { findBestMoves } from "../game/ai.js";
import { deserialize } from "../game/serialization.js";
function errorText(error) {
    return error instanceof Error ? error.message : String(error);
}
function unwrap(result) {
    if (!result.ok)
        throw new Error(`${result.error.code}: ${result.error.message}`);
    return result.value;
}
/**
 * Build a slot component with the mounted Remote face closed over the plugin
 * fiber. This avoids a module-level singleton and keeps HMR unload-safe.
 */
export function createXiangqiOverlay(remote, promptDshTurn) {
    return function XiangqiOverlay({ useSessions, useStore, actions, }) {
        const open = useStore(state => state.open);
        const minimized = useStore(state => state.minimized);
        const sessionId = useStore(state => state.sessionId);
        const gameId = useStore(state => state.gameId);
        const revision = useStore(state => state.revision);
        const game = useStore(state => state.game);
        const busy = useStore(state => state.busy);
        const error = useStore(state => state.error);
        const currentSessionId = useSessions(state => state.current);
        const projection = useSessions(state => {
            const current = state.current;
            return current === undefined ? undefined : state.byId[current]?.projectionValues?.xiangqi;
        });
        const autoStartSession = useRef(null);
        useEffect(() => {
            if (!open)
                return;
            if (currentSessionId === undefined) {
                if (sessionId !== null)
                    actions.clearGame();
                return;
            }
            const current = String(currentSessionId);
            if (sessionId !== null && sessionId !== current)
                actions.clearGame();
        }, [actions, currentSessionId, open, sessionId]);
        useEffect(() => {
            if (!open || currentSessionId === undefined) {
                autoStartSession.current = null;
                return;
            }
            const current = String(currentSessionId);
            if (sessionId !== null && sessionId !== current) {
                autoStartSession.current = null;
                return;
            }
            // The summary has not received the plugin's projection baseline yet.
            // Waiting here prevents a duplicate new_game during the initial sync.
            if (projection === undefined)
                return;
            if (projection === null) {
                // A failed Remote must not turn into a tight retry loop. The retry
                // button below starts another explicit attempt after this fuse has
                // already been armed for the current session.
                if (sessionId !== null || busy || autoStartSession.current === current)
                    return;
                autoStartSession.current = current;
                actions.setBusy(true);
                void remote.newGame(currentSessionId, {})
                    .then(unwrap)
                    .then((state) => {
                    actions.setGame(current, state, toXiangqiGameViewModel(state, { humanSide: 'red', busy: false }));
                })
                    .catch((reason) => { actions.setError(errorText(reason)); })
                    .finally(() => { actions.setBusy(false); });
                return;
            }
            try {
                const next = toXiangqiGameViewModel(projection, { humanSide: 'red', busy });
                const projectionIsOlder = sessionId === current
                    && revision !== null
                    && projection.revision < revision;
                if (!projectionIsOlder && (sessionId !== current || gameId !== projection.gameId || revision !== projection.revision)) {
                    actions.setGame(current, projection, next);
                }
                if (!projectionIsOlder && busy && (projection.phase !== 'active' || turnOf(projection) === 'red'))
                    actions.setBusy(false);
            }
            catch (reason) {
                actions.setError(errorText(reason));
            }
        }, [actions, busy, currentSessionId, gameId, open, projection, remote, revision, sessionId]);
        const withCurrent = (action) => {
            return () => {
                if (currentSessionId === undefined) {
                    actions.setError('请先选择一个会话');
                    return;
                }
                void action(currentSessionId).catch((reason) => {
                    actions.setError(errorText(reason));
                    actions.setBusy(false);
                });
            };
        };
        const onNewGame = withCurrent(async (current) => {
            if (busy)
                return;
            autoStartSession.current = String(current);
            actions.setBusy(true);
            actions.setError(null);
            const state = unwrap(await remote.newGame(current, {}));
            actions.setGame(String(current), state, toXiangqiGameViewModel(state, { humanSide: 'red', busy: false }));
            actions.setBusy(false);
        });
        const onUndo = withCurrent(async (current) => {
            if (gameId === null || revision === null)
                throw new Error('棋局尚未同步完成');
            actions.setBusy(true);
            actions.setError(null);
            let state = unwrap(await remote.undo(current, { gameId, revision }));
            // A human-facing undo rewinds the model's reply together with the
            // human move, so the board returns to red's turn whenever possible.
            while (state.phase === 'active' && turnOf(state) === 'black') {
                const view = toXiangqiGameViewModel(state, { humanSide: 'red', busy: true });
                if (view.moves.length === 0)
                    break;
                state = unwrap(await remote.undo(current, { gameId: state.gameId, revision: state.revision }));
            }
            actions.setGame(String(current), state, toXiangqiGameViewModel(state, { humanSide: 'red', busy: false }));
            actions.setBusy(false);
        });
        const onResign = withCurrent(async (current) => {
            if (gameId === null || revision === null)
                throw new Error('棋局尚未同步完成');
            actions.setBusy(true);
            actions.setError(null);
            const state = unwrap(await remote.resign(current, { gameId, revision, side: 'red' }));
            actions.setGame(String(current), state, toXiangqiGameViewModel(state, { humanSide: 'red', busy: false }));
            actions.setBusy(false);
        });
        const onMoveWith = async (move) => {
            if (currentSessionId === undefined) {
                actions.setError('请先选择一个会话');
                return;
            }
            if (gameId === null || revision === null) {
                actions.setError('棋局尚未同步完成');
                return;
            }
            actions.setBusy(true);
            actions.setError(null);
            try {
                const state = unwrap(await remote.move(currentSessionId, {
                    gameId,
                    revision,
                    move: { from: ucciOf(move.from), to: ucciOf(move.to) },
                }));
                const next = toXiangqiGameViewModel(state, { humanSide: 'red', busy: true });
                actions.setGame(String(currentSessionId), state, next);
                if (state.phase === 'active' && next.status === 'playing' && turnOf(state) === 'black') {
                    // 候选排名留在浏览器本地，DSH 模型只需做一次决策。迭代加深 +
                    // 时间预算：固定 ~180ms 内返回，剩余预算自动挖得更深（通常 3~5 层，
                    // 含静态搜索兜底），浏览器无需等待另一个 Host Remote 往返。
                    const summary = findBestMoves(deserialize(JSON.stringify(state.gameState)), {
                        timeMs: 180,
                        depth: 6,
                        limit: 5,
                    });
                    const suggestions = {
                        depth: summary.depth,
                        nodes: summary.nodes,
                        candidates: summary.candidates.map(candidate => ({
                            from: formatCoordinate(candidate.move.from),
                            to: formatCoordinate(candidate.move.to),
                            score: candidate.score,
                        })),
                    };
                    await promptDshTurn(currentSessionId, state, suggestions);
                }
                else {
                    actions.setBusy(false);
                }
            }
            catch (reason) {
                actions.setError(errorText(reason));
                actions.setBusy(false);
            }
        };
        const onPageMove = (move) => {
            // The callback keeps XiangqiPage's public surface UI-only while the
            // overlay supplies the current session/revision fence.
            void onMoveWith(move);
        };
        const pageActions = {
            onMove: onPageMove,
            onNewGame,
            onUndo,
            onResign,
        };
        if (!open)
            return null;
        return (_jsx("div", { className: minimized ? css.overlayBackdropMinimized : css.overlayBackdrop, role: "presentation", children: _jsxs("section", { className: minimized ? `${css.overlaySurface} ${css.overlaySurfaceMinimized}` : css.overlaySurface, role: "dialog", "aria-modal": minimized ? undefined : true, "aria-labelledby": "xiangqi-dialog-title", children: [_jsxs("div", { className: css.overlayToolbar, children: [_jsx("h2", { className: css.overlayTitle, id: "xiangqi-dialog-title", children: "\u4E2D\u56FD\u8C61\u68CB" }), _jsxs("div", { className: css.toolbarActions, children: [_jsx("button", { type: "button", className: css.minimizeButton, "aria-label": minimized ? '恢复棋盘' : '最小化棋盘', onClick: () => { actions.toggleMinimized(); }, children: minimized ? '恢复棋盘' : '最小化' }), _jsx("button", { type: "button", className: css.closeButton, onClick: () => { actions.close(); }, children: "\u5173\u95ED\u68CB\u76D8" })] })] }), minimized ? (_jsxs("div", { className: css.minimizedSummary, children: [_jsx("span", { className: css.minimizedDot, "data-busy": busy || undefined, "aria-hidden": "true" }), _jsx("span", { children: game === null ? '棋局未准备' : game.statusText })] })) : (_jsxs(_Fragment, { children: [currentSessionId === undefined && (_jsx("div", { className: css.emptyState, children: "\u8BF7\u5148\u5728\u5DE6\u4FA7\u9009\u62E9\u6216\u521B\u5EFA\u4E00\u4E2A\u4F1A\u8BDD\u3002" })), currentSessionId !== undefined && game === null && (_jsxs("div", { className: css.emptyState, children: [_jsx("p", { children: projection === undefined ? '正在同步棋局……' : '正在准备棋局……' }), error !== null && _jsx("p", { className: css.errorText, role: "alert", children: error }), _jsx("button", { type: "button", className: css.retryButton, onClick: onNewGame, children: "\u91CD\u65B0\u5F00\u5C40" })] })), game !== null && _jsx(XiangqiPage, { game: game, ...pageActions }), error !== null && game !== null && _jsx("p", { className: css.inlineError, role: "alert", children: error })] }))] }) }));
    };
}
//# sourceMappingURL=XiangqiOverlay.js.map