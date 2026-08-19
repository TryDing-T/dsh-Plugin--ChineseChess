/** Browser half: sidebar action, frame overlay, fast candidate search, and DSH turn prompt. */

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-api-remotes/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import xiangqiRemote from '@deepseek-ai/dsh-plugin-xiangqi/remote'
import type {} from '@deepseek-ai/dsh-plugin-xiangqi/remote'
import { createXiangqiOverlay, type XiangqiClientRemote } from './XiangqiOverlay.tsx'
import type { PromptDshTurn } from './XiangqiOverlay.tsx'
import { XiangqiSidebarAction } from './SidebarAction.tsx'
import { createXiangqiStore } from './store.ts'
import { deserialize, toFen } from '../game/serialization.ts'

export { XiangqiBoard, XiangqiPage } from './XiangqiPage.tsx'
export type { XiangqiPageProps } from './XiangqiPage.tsx'
export { toXiangqiGameViewModel, turnOf, ucciOf } from './view-model.ts'
export { createXiangqiStore } from './store.ts'
export { createXiangqiOverlay } from './XiangqiOverlay.tsx'
export type { XiangqiClientRemote, XiangqiOverlayProps, PromptDshTurn } from './XiangqiOverlay.tsx'
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

/** Required services for the browser slots, sessions, and Remote carrier. */
export const inject = ['slots', 'sessions', 'remote']

/** Mount the Host Remote and the two additive browser surfaces. */
export async function apply(ctx: ClientContext): Promise<void> {
  const disposeRemote = await ctx.remote.$mount(xiangqiRemote)
  ctx.effect(() => () => { void disposeRemote() }, 'ui-xiangqi: Remote mount')

  const store = createXiangqiStore()
  // This plugin mounts its own Remote contribution above. Reading the
  // dynamically-created namespace through ctx.remote.xiangqi here would make
  // Loader wait for a service that can only be created by this apply() call.
  const remote = ctx.get('remote.xiangqi') as unknown as XiangqiClientRemote | undefined
  if (remote === undefined) throw new Error('象棋 Remote 挂载后仍不可用')
  const promptDshTurn: PromptDshTurn = async (sessionId, state, suggestions) => {
    const session = ctx.sessions.binding(sessionId)?.session
    if (session === undefined) throw new Error('当前会话不可用，无法让 DSH 落子')
    const fen = toFen(deserialize(JSON.stringify(state.gameState)))
    const candidateText = suggestions.candidates.length === 0
      ? '无候选走法，请根据 FEN 选择一手合法黑方棋。'
      : suggestions.candidates
        .map((candidate, index) => `${index + 1}. ${candidate.from}-${candidate.to}（${candidate.score}）`)
        .join('；')
    const result = await session.prompt([{
      type: 'text',
      text: `你正在和用户进行中国象棋对弈，当前轮到黑方。请结合当前 FEN 和本地引擎候选，快速判断并立即调用一次 xiangqi_game。禁止 get、new_game、undo、resign，禁止长篇解释；只允许 action="move"，必须使用 game_id="${state.gameId}"、revision=${state.revision}，从候选中选择或修正为一手合法黑方棋。\n当前 FEN：${fen}\n本地引擎候选（深度 ${suggestions.depth}，搜索 ${suggestions.nodes} 个节点）：${candidateText}`,
    }], 'queue')
    if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`)
  }

  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
    name: 'sidebar.footer.action',
    id: 'xiangqi',
    store,
  }, XiangqiSidebarAction))

  const Overlay = createXiangqiOverlay(remote, promptDshTurn)
  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'xiangqi-overlay',
    order: 80,
    store,
  }, Overlay))
}
