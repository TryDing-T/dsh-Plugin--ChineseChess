import { describe, expect, it } from 'vitest'
import { newCustomGame, emptyBoard, put, serialize } from '../game/game-api.ts'
import { liveStatusTextOf, toXiangqiGameViewModel } from '../../src/client/view-model.ts'
import type { XiangqiSerializedState } from '../../src/types.ts'

/** 用规则内核构造 Host 序列化快照，避免手写棋盘 JSON。 */
function stateFrom(board: ReturnType<typeof emptyBoard>, turn: 'red' | 'black'): XiangqiSerializedState {
  return {
    gameId: 'game-stalemate',
    revision: 7,
    phase: 'active',
    gameState: JSON.parse(serialize(newCustomGame(board, turn))),
  }
}

describe('view-model：中国象棋无和棋困毙', () => {
  it('maps a stalemated black side to a red win with explicit wording', () => {
    // 黑将 e0 被过河红兵 d1/f1 困毙，未被将军，轮黑。
    const board = emptyBoard()
    put(board, 'e0', 'k')
    put(board, 'd1', 'P')
    put(board, 'f1', 'P')
    put(board, 'd9', 'K')

    const view = toXiangqiGameViewModel(stateFrom(board, 'black'))
    expect(view.status).toBe('red-won')
    expect(view.statusText).toContain('黑方困毙')
    expect(view.statusText).toContain('红方获胜')
  })

  it('keeps dynamic AI wording out of the snapshot and computes it at render time', () => {
    const board = emptyBoard()
    put(board, 'e0', 'k')
    put(board, 'd9', 'K')

    const base = stateFrom(board, 'black')
    // ViewModel 的 statusText 是基础文案，不随 busy/aiPending 变化——
    // 否则跨页面标志更新后标题会停留在过期状态（审查第三轮问题 3）。
    const idleView = toXiangqiGameViewModel(base)
    const busyAiView = toXiangqiGameViewModel(base, { busy: true, aiPending: true, activity: 'ai' })
    expect(idleView.statusText).toBe(busyAiView.statusText)

    // 动态标题由渲染层按实时标志求值。
    expect(liveStatusTextOf({ ...busyAiView })).toBe('AI 正在计算下一步')
    expect(liveStatusTextOf({
      ...toXiangqiGameViewModel(base, { busy: true, aiPending: false, activity: 'undo' }),
    })).toBe('正在更新棋局…')
    expect(liveStatusTextOf({ ...idleView })).toBe(idleView.statusText)
  })
})
