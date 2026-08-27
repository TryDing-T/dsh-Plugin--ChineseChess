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
  it('keeps the board locked while either the page operation or the Host AI is pending', () => {
    const store = createXiangqiStore().create()
    store.actions.setGame('session-1', state, { ...game, busy: false })

    // 本页面操作未返回：锁定。
    store.actions.setOperationBusy(true)
    expect(store.getSnapshot().operationBusy).toBe(true)
    expect(store.getSnapshot().game?.busy).toBe(true)

    // 操作返回但 Host 决策仍在跑：保持锁定（跨页面权威状态）。
    store.actions.setOperationBusy(false)
    store.actions.setAiPending(true)
    expect(store.getSnapshot().operationBusy).toBe(false)
    expect(store.getSnapshot().aiPending).toBe(true)
    expect(store.getSnapshot().game?.busy).toBe(true)
    expect(store.getSnapshot().game?.aiPending).toBe(true)

    // 决策结束：解锁。
    store.actions.setAiPending(false)
    expect(store.getSnapshot().game?.busy).toBe(false)
    expect(store.getSnapshot().game?.aiPending).toBe(false)
  })

  it('detaches the chat binding without discarding the global game or Host AI state', () => {
    const store = createXiangqiStore().create()
    store.actions.setGame('session-1', state, { ...game, busy: false })
    store.actions.setAiPending(true)

    store.actions.detachSession()

    expect(store.getSnapshot()).toMatchObject({
      sessionId: null,
      gameId: 'game-1',
      revision: 1,
      aiPending: true,
    })
    expect(store.getSnapshot().game?.busy).toBe(false)
  })

  it('hostReset drops the stale view but keeps session binding and error state', () => {
    const store = createXiangqiStore().create()
    store.actions.setGame('session-1', state, { ...game, busy: false })
    store.actions.setError('旧错误保留')
    store.actions.setDecisionTrace(null)

    store.actions.hostReset()

    expect(store.getSnapshot()).toMatchObject({
      sessionId: 'session-1',
      gameId: null,
      revision: null,
      game: null,
      decisionTrace: null,
      aiPending: false,
      error: '旧错误保留',
    })
  })
})
