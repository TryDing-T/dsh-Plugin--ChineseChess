/** Browser half: sidebar action, frame overlay, and generated DSH Remote bridge. */

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import xiangqiRemote from '@deepseek-ai/dsh-plugin-xiangqi/remote'
import type {} from '@deepseek-ai/dsh-plugin-xiangqi/remote'
import type { XiangqiAiModelOverride } from '../types.ts'
import {
  createXiangqiOverlay,
  type XiangqiClientRemote,
  type XiangqiModelSelectionFetcher,
} from './XiangqiOverlay.tsx'
import { XiangqiSidebarAction } from './SidebarAction.tsx'
import { createXiangqiStore } from './store.ts'

export { XiangqiBoard, XiangqiPage } from './XiangqiPage.tsx'
export type { XiangqiPageProps } from './XiangqiPage.tsx'
export { liveStatusTextOf, toXiangqiGameViewModel, turnOf, ucciOf } from './view-model.ts'
export { createXiangqiStore } from './store.ts'
export { createXiangqiOverlay } from './XiangqiOverlay.tsx'
export type { XiangqiClientRemote, XiangqiModelSelectionFetcher, XiangqiOverlayProps } from './XiangqiOverlay.tsx'
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
 * The outer Client plugin mounts the generated Remote and reads the official
 * session model-selection face; the UI itself runs in a child fiber.
 */
export const inject = ['remote', 'connection']

/** The slice of the official connection face this plugin consumes. */
interface ModelSelectionConnectionFace {
  readonly api?: {
    readonly sessions?: {
      readonly models?: (request: { readonly sessionId: SessionId }) => Promise<{
        readonly result: RemoteResult<{ readonly current: {
          readonly provider: string
          readonly model: string
          readonly reasoningEffort?: string
        } | null }>
      }>
    }
  }
}

/**
 * 每次黑方请求前的模型快照（审查第二轮 P0）：走官方 `session.models`
 * Remote 读"下一步将使用的 provider/model/reasoningEffort"。任何失败都
 * 返回 null，让 Host 用自己的会话头快照兜底；绝不阻塞、绝不猜测。
 */
function createModelSelectionFetcher(ctx: ClientContext): XiangqiModelSelectionFetcher {
  return async (sessionId): Promise<XiangqiAiModelOverride | null> => {
    const connection = ctx.get('connection') as unknown as ModelSelectionConnectionFace | undefined
    const models = connection?.api?.sessions?.models
    if (models === undefined) return null
    const { result } = await models({ sessionId })
    if (!result.ok) return null
    const current = result.value.current
    if (current === null) return null
    const provider = current.provider.trim()
    const model = current.model.trim()
    if (provider.length === 0 || model.length === 0) return null
    const effort = current.reasoningEffort?.trim()
    return {
      provider,
      model,
      ...(effort === undefined || effort.length === 0 ? {} : { reasoningEffort: effort }),
    }
  }
}

/** Mount the Host Remote, then activate the UI in a child with the exact namespace injection. */
export async function apply(ctx: ClientContext): Promise<void> {
  const disposeRemote = await ctx.remote.$mount(xiangqiRemote)
  ctx.effect(() => () => { void disposeRemote() }, 'ui-xiangqi: Remote mount')

  // A mounted Remote namespace is a Cordis child service. Reading
  // ctx.remote.xiangqi from this outer fiber would violate the injection guard,
  // while declaring it in the outer `inject` would deadlock before $mount runs.
  // Park the UI in a child fiber that starts only after the namespace exists.
  await ctx.inject(['slots', 'sessions', 'remote', 'remote.xiangqi', 'connection'], (uiCtx) => {
    applyXiangqiUi(uiCtx)
  })
}

/** Register the browser surfaces from a context authorized for remote.xiangqi. */
function applyXiangqiUi(ctx: ClientContext): void {
  const store = createXiangqiStore()
  // remote.xiangqi is a dynamically mounted child Service. A strict get is
  // stable across Loader-owned child fibers; chained property access is not.
  const remote = ctx.get('remote.xiangqi') as unknown as XiangqiClientRemote | undefined
  if (remote === undefined) throw new Error('象棋 Remote 挂载后仍不可用')
  const fetchModelSelection = createModelSelectionFetcher(ctx)

  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'xiangqi',
    store,
  }, XiangqiSidebarAction))

  const Overlay = createXiangqiOverlay(remote, fetchModelSelection)
  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'xiangqi-overlay',
    order: 80,
    store,
  }, Overlay))
}
