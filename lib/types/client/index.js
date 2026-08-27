/** Browser half: sidebar action, frame overlay, and generated DSH Remote bridge. */
import xiangqiRemote from '@deepseek-ai/dsh-plugin-xiangqi/remote';
import { createXiangqiOverlay, } from "./XiangqiOverlay.js";
import { XiangqiSidebarAction } from "./SidebarAction.js";
import { createXiangqiStore } from "./store.js";
export { XiangqiBoard, XiangqiPage } from "./XiangqiPage.js";
export { liveStatusTextOf, toXiangqiGameViewModel, turnOf, ucciOf } from "./view-model.js";
export { createXiangqiStore } from "./store.js";
export { createXiangqiOverlay } from "./XiangqiOverlay.js";
export { XIANGQI_COLUMNS, XIANGQI_ROWS, } from "./types.js";
/**
 * The outer Client plugin mounts the generated Remote and reads the official
 * session model-selection face; the UI itself runs in a child fiber.
 */
export const inject = ['remote', 'connection'];
/**
 * 每次黑方请求前的模型快照（审查第二轮 P0）：走官方 `session.models`
 * Remote 读"下一步将使用的 provider/model/reasoningEffort"。任何失败都
 * 返回 null，让 Host 用自己的会话头快照兜底；绝不阻塞、绝不猜测。
 */
function createModelSelectionFetcher(ctx) {
    return async (sessionId) => {
        const connection = ctx.get('connection');
        const models = connection?.api?.sessions?.models;
        if (models === undefined)
            return null;
        const { result } = await models({ sessionId });
        if (!result.ok)
            return null;
        const current = result.value.current;
        if (current === null)
            return null;
        const provider = current.provider.trim();
        const model = current.model.trim();
        if (provider.length === 0 || model.length === 0)
            return null;
        const effort = current.reasoningEffort?.trim();
        return {
            provider,
            model,
            ...(effort === undefined || effort.length === 0 ? {} : { reasoningEffort: effort }),
        };
    };
}
/** Mount the Host Remote, then activate the UI in a child with the exact namespace injection. */
export async function apply(ctx) {
    const disposeRemote = await ctx.remote.$mount(xiangqiRemote);
    ctx.effect(() => () => { void disposeRemote(); }, 'ui-xiangqi: Remote mount');
    // A mounted Remote namespace is a Cordis child service. Reading
    // ctx.remote.xiangqi from this outer fiber would violate the injection guard,
    // while declaring it in the outer `inject` would deadlock before $mount runs.
    // Park the UI in a child fiber that starts only after the namespace exists.
    await ctx.inject(['slots', 'sessions', 'remote', 'remote.xiangqi', 'connection'], (uiCtx) => {
        applyXiangqiUi(uiCtx);
    });
}
/** Register the browser surfaces from a context authorized for remote.xiangqi. */
function applyXiangqiUi(ctx) {
    const store = createXiangqiStore();
    // remote.xiangqi is a dynamically mounted child Service. A strict get is
    // stable across Loader-owned child fibers; chained property access is not.
    const remote = ctx.get('remote.xiangqi');
    if (remote === undefined)
        throw new Error('象棋 Remote 挂载后仍不可用');
    const fetchModelSelection = createModelSelectionFetcher(ctx);
    ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
        name: 'sidebar.footer.action',
        id: 'xiangqi',
        store,
    }, XiangqiSidebarAction));
    const Overlay = createXiangqiOverlay(remote, fetchModelSelection);
    ctx.slots.inject('shell.overlay', () => ctx.slots.register({
        name: 'shell.overlay',
        id: 'xiangqi-overlay',
        order: 80,
        store,
    }, Overlay));
}
//# sourceMappingURL=index.js.map