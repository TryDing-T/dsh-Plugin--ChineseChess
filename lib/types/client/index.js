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
 * The outer Client plugin mounts the generated Remote; the UI itself runs in
 * a child fiber.
 */
export const name = 'dsh-plugin-xiangqi/client';
export const inject = ['remote'];
/** Mount the Host Remote, then activate the UI in a child with the exact namespace injection. */
export async function apply(ctx) {
    let disposeRemote;
    try {
        disposeRemote = await ctx.remote.$mount(xiangqiRemote);
    }
    catch (error) {
        if (disposeRemote !== undefined)
            await disposeRemote();
        throw error;
    }
    // A mounted Remote namespace is a Cordis child service. Reading
    // ctx.remote.xiangqi from this outer fiber would violate the injection guard,
    // while declaring it in the outer `inject` would deadlock before $mount runs.
    // Park the UI in a child fiber that starts only after the namespace exists.
    await ctx.inject(['slots', 'sessions', 'remote', 'remote.xiangqi'], (uiCtx) => {
        applyXiangqiUi(uiCtx);
    });
    return async () => {
        if (disposeRemote !== undefined)
            await disposeRemote();
    };
}
/** Register the browser surfaces from a context authorized for remote.xiangqi. */
function applyXiangqiUi(ctx) {
    const store = createXiangqiStore();
    // remote.xiangqi is a dynamically mounted child Service. A strict get is
    // stable across Loader-owned child fibers; chained property access is not.
    const remote = ctx.get('remote.xiangqi');
    if (remote === undefined)
        throw new Error('象棋 Remote 挂载后仍不可用');
    ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
        name: 'sidebar.footer.action',
        id: 'xiangqi',
        store,
    }, XiangqiSidebarAction));
    const Overlay = createXiangqiOverlay(remote);
    ctx.slots.inject('shell.overlay', () => ctx.slots.register({
        name: 'shell.overlay',
        id: 'xiangqi-overlay',
        order: 80,
        store,
    }, Overlay));
}
//# sourceMappingURL=index.js.map