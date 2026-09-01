/** Root-scoped UI state for the independent Chinese chess overlay. */

// 0.1.2 适配：dsh-client-runtime 包已移除，store 引擎迁至 @deepseek-ai/dsh-client-store。
import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-store'
import type { XiangqiDecisionTrace, XiangqiSerializedState } from '../types.ts'
import type { XiangqiActivity, XiangqiGameViewModel } from './types.ts'

export interface XiangqiUiState {
  open: boolean
  minimized: boolean
  sessionId: string | null
  gameId: string | null
  revision: number | null
  game: XiangqiGameViewModel | null
  decisionTrace: XiangqiDecisionTrace | null
  /** 本页面自己发起的普通操作（开局/走子/悔棋/认输）尚未返回。 */
  operationBusy: boolean
  /** Host 确实存在黑方决策在运行（跨页面权威值，由运行状态轮询写入）。 */
  aiPending: boolean
  /** operationBusy 期间的细粒度动作标签，用于把悔棋/新局与"AI 思考中"区分开。 */
  activity: XiangqiActivity
  error: string | null
}

export type XiangqiUiActions = {
  open: (draft: XiangqiUiState) => void
  close: (draft: XiangqiUiState) => void
  toggleMinimized: (draft: XiangqiUiState) => void
  attachSession: (draft: XiangqiUiState, sessionId: string) => void
  detachSession: (draft: XiangqiUiState) => void
  clearGame: (draft: XiangqiUiState) => void
  /** Host 进程重建后清掉指向已消失棋局的本地视图；保留会话绑定与错误状态。 */
  hostReset: (draft: XiangqiUiState) => void
  setOperationBusy: (draft: XiangqiUiState, busy: boolean) => void
  setAiPending: (draft: XiangqiUiState, pending: boolean) => void
  setActivity: (draft: XiangqiUiState, activity: XiangqiActivity) => void
  setError: (draft: XiangqiUiState, error: string | null) => void
  setDecisionTrace: (draft: XiangqiUiState, trace: XiangqiDecisionTrace | null) => void
  setGame: (
    draft: XiangqiUiState,
    sessionId: string,
    state: XiangqiSerializedState,
    game: XiangqiGameViewModel,
  ) => void
}

/** 棋盘交互禁用条件：本页面有操作未返回，或 Host 正在等 DSH 落子。 */
export function isBoardLocked(state: Pick<XiangqiUiState, 'operationBusy' | 'aiPending'>): boolean {
  return state.operationBusy || state.aiPending
}

/**
 * Store factory rather than a module-level handle: DSH slot registration owns
 * the handle identity and can dispose/recreate it during client HMR.
 */
export function createXiangqiStore(): EngineStoreHandle<XiangqiUiState, XiangqiUiActions> {
  return defineStore({
    init: (): XiangqiUiState => ({
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
      open: d => { d.open = true; d.minimized = false },
      close: d => { d.open = false; d.minimized = false },
      toggleMinimized: d => { d.minimized = !d.minimized },
      // Rebind the visible surface without discarding the process-global game.
      attachSession: (d, sessionId: string) => {
        d.sessionId = sessionId
        d.error = null
      },
      // Session switching must not discard the process-global game view.
      detachSession: (d) => {
        d.sessionId = null
        d.operationBusy = false
        // aiPending 是 Host 权威状态，换聊天不清除；由运行状态轮询继续维护。
        d.activity = 'idle'
        d.error = null
        if (d.game !== null) d.game = { ...d.game, busy: false }
      },
      clearGame: (d) => {
        d.minimized = false
        d.sessionId = null
        d.gameId = null
        d.revision = null
        d.game = null
        d.decisionTrace = null
        d.operationBusy = false
        d.aiPending = false
        d.activity = 'idle'
        d.error = null
      },
      hostReset: (d) => {
        d.gameId = null
        d.revision = null
        d.game = null
        d.decisionTrace = null
        d.aiPending = false
      },
      setOperationBusy: (d, busy: boolean) => {
        d.operationBusy = busy
        if (d.game !== null) d.game = { ...d.game, busy: isBoardLocked(d) }
      },
      setAiPending: (d, pending: boolean) => {
        d.aiPending = pending
        if (d.game !== null) d.game = { ...d.game, busy: isBoardLocked(d), aiPending: pending }
      },
      setActivity: (d, activity: XiangqiActivity) => {
        d.activity = activity
        if (d.game !== null) d.game = { ...d.game, activity }
      },
      setError: (d, error: string | null) => { d.error = error },
      setDecisionTrace: (d, trace: XiangqiDecisionTrace | null) => { d.decisionTrace = trace },
      setGame: (d, sessionId: string, state: XiangqiSerializedState, game: XiangqiGameViewModel) => {
        d.sessionId = sessionId
        d.gameId = state.gameId
        d.revision = state.revision
        d.game = { ...game, busy: isBoardLocked(d), aiPending: d.aiPending }
        d.error = null
      },
    },
  })
}
