import { describe, expect, it, vi } from 'vitest'

vi.mock('@deepseek-ai/dsh-client-runtime/client', () => ({
  defineStore: (decl: {
    init: () => Record<string, unknown>
    actions: Record<string, (draft: Record<string, unknown>, ...params: unknown[]) => void>
  }) => ({
    create: () => {
      const state = decl.init()
      const actions = Object.fromEntries(Object.entries(decl.actions).map(([name, mutate]) => [
        name,
        (...params: unknown[]) => { mutate(state, ...params) },
      ]))
      return { actions, getSnapshot: () => state }
    },
  }),
}))

import { createXiangqiStore } from '../../src/client/store.ts'
import type { XiangqiGameViewModel } from '../../src/client/types.ts'
import type { XiangqiSerializedState } from '../../src/types.ts'

const game: XiangqiGameViewModel = {
  board: Array.from({ length: 10 }, () => Array(9).fill(null)),
  currentTurn: 'red',
  legalMoves: [],
  moves: [],
  status: 'red-won',
  statusText: '红方将死，红方获胜',
  busy: true,
}

const state: XiangqiSerializedState = {
  gameId: 'game-1',
  sessionId: 'session-1',
  revision: 1,
  phase: 'active',
  gameState: {},
}

describe('xiangqi UI store', () => {
  it('clears the projected game busy flag when an operation finishes', () => {
    const store = createXiangqiStore().create()
    store.actions.setGame(
      'session-1',
      state,
      game,
    )

    store.actions.setBusy(false)

    expect(store.getSnapshot().busy).toBe(false)
    expect(store.getSnapshot().game?.busy).toBe(false)
  })
})
