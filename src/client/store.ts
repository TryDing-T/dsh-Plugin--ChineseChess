/** Root-scoped UI state for the independent Chinese chess overlay. */

import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client'
import type { XiangqiSerializedState } from '../types.ts'
import type { XiangqiGameViewModel } from './types.ts'

export interface XiangqiUiState {
  open: boolean
  minimized: boolean
  sessionId: string | null
  gameId: string | null
  revision: number | null
  game: XiangqiGameViewModel | null
  busy: boolean
  error: string | null
}

export type XiangqiUiActions = {
  open: (draft: XiangqiUiState) => void
  close: (draft: XiangqiUiState) => void
  toggleMinimized: (draft: XiangqiUiState) => void
  clearGame: (draft: XiangqiUiState) => void
  setBusy: (draft: XiangqiUiState, busy: boolean) => void
  setError: (draft: XiangqiUiState, error: string | null) => void
  setGame: (
    draft: XiangqiUiState,
    sessionId: string,
    state: XiangqiSerializedState,
    game: XiangqiGameViewModel,
  ) => void
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
      busy: false,
      error: null,
    }),
    actions: {
      open: d => { d.open = true; d.minimized = false },
      close: d => { d.open = false; d.minimized = false },
      toggleMinimized: d => { d.minimized = !d.minimized },
      clearGame: (d) => {
        d.minimized = false
        d.sessionId = null
        d.gameId = null
        d.revision = null
        d.game = null
        d.busy = false
        d.error = null
      },
      setBusy: (d, busy: boolean) => { d.busy = busy },
      setError: (d, error: string | null) => { d.error = error },
      setGame: (d, sessionId: string, state: XiangqiSerializedState, game: XiangqiGameViewModel) => {
        d.sessionId = sessionId
        d.gameId = state.gameId
        d.revision = state.revision
        d.game = game
        d.error = null
      },
    },
  })
}
