/** Browser half: sidebar action, frame overlay, and generated DSH Remote bridge. */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
// 0.1.2 适配：ctx.slots（SlotRegistry）由 dsh-client-ui-renderer/client 声明；
// useSessions 等 GlobalStandardProps 标准 hooks 由 dsh-client-ui-session/client 合并。
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import xiangqiRemote from '@deepseek-ai/dsh-plugin-xiangqi/remote'
import type {} from '@deepseek-ai/dsh-plugin-xiangqi/remote'
import {
  createXiangqiOverlay,
  type XiangqiClientRemote,
} from './XiangqiOverlay.tsx'
import { XiangqiSidebarAction } from './SidebarAction.tsx'
import { createXiangqiStore } from './store.ts'

export { XiangqiBoard, XiangqiPage } from './XiangqiPage.tsx'
export type { XiangqiPageProps } from './XiangqiPage.tsx'
export { liveStatusTextOf, toXiangqiGameViewModel, turnOf, ucciOf } from './view-model.ts'
export { createXiangqiStore } from './store.ts'
export { createXiangqiOverlay } from './XiangqiOverlay.tsx'
export type { XiangqiClientRemote, XiangqiOverlayProps } from './XiangqiOverlay.tsx'
export {
  XIANGQI_COLUMNS,
  XIANGQI_ROWS,
} from './types.ts'
export type {
  XiangqiGameStatus,
  XiangqiGameViewModel,
  XiangqiLegalMove,
  XiangqiMoveRecord,
  XiangqiMoveRequest,
  XiangqiPageActions,
  XiangqiPiece,
  XiangqiPieceKind,
  XiangqiPosition,
  XiangqiSide,
} from './types.ts'

/**
 * The outer Client plugin mounts the generated Remote; the UI itself runs in
 * a child fiber.
 */
export const name = 'dsh-plugin-xiangqi/client'
export const inject = ['remote']

/** Mount the Host Remote, then activate the UI in a child with the exact namespace injection. */
export async function apply(ctx: ClientContext): Promise<() => Promise<void>> {
  let disposeRemote: (() => Promise<void>) | undefined
  try {
    disposeRemote = await ctx.remote.$mount(xiangqiRemote)
  } catch (error) {
    if (disposeRemote !== undefined) await disposeRemote()
    throw error
  }

  // A mounted Remote namespace is a Cordis child service. Reading
  // ctx.remote.xiangqi from this outer fiber would violate the injection guard,
  // while declaring it in the outer `inject` would deadlock before $mount runs.
  // Park the UI in a child fiber that starts only after the namespace exists.
  await ctx.inject(['slots', 'sessions', 'remote', 'remote.xiangqi'], (uiCtx) => {
    applyXiangqiUi(uiCtx)
  })

  return async () => {
    if (disposeRemote !== undefined) await disposeRemote()
  }
}

/** Register the browser surfaces from a context authorized for remote.xiangqi. */
function applyXiangqiUi(ctx: ClientContext): void {
  const store = createXiangqiStore()
  // remote.xiangqi is a dynamically mounted child Service. A strict get is
  // stable across Loader-owned child fibers; chained property access is not.
  const remote = ctx.get('remote.xiangqi') as unknown as XiangqiClientRemote | undefined
  if (remote === undefined) throw new Error('象棋 Remote 挂载后仍不可用')

  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'xiangqi',
    store,
  }, XiangqiSidebarAction))

  const Overlay = createXiangqiOverlay(remote)
  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'xiangqi-overlay',
    order: 80,
    store,
  }, Overlay))
}
