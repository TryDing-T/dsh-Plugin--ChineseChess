import { describe, expect, it } from 'vitest'
import { XiangqiError, XiangqiHostService, assertCurrentGame } from '../../src/host/service.ts'
import type { XiangqiGameFactory, XiangqiGamePort } from '../../src/host/types.ts'

interface FakeState {
  readonly turn: 'red' | 'black'
}

class FakeGame implements XiangqiGamePort {
  constructor(private state: FakeState) {}

  move(): void {
    this.state = { turn: this.state.turn === 'red' ? 'black' : 'red' }
  }

  serialize(): { turn: 'red' | 'black' } {
    return { turn: this.state.turn }
  }
}

const factory: XiangqiGameFactory = {
  create: () => new FakeGame({ turn: 'red' }),
  restore: value => new FakeGame(value as FakeState),
}

function createServiceWithIds(...ids: string[]): XiangqiHostService {
  let index = 0
  return new XiangqiHostService(factory, { createGameId: () => ids[index++] ?? `extra-${index}` })
}

describe('跨局守卫（审查问题 2）', () => {
  it('allows writes only while the requested game is current', () => {
    expect(() => assertCurrentGame(undefined, 'game-1')).not.toThrow()
    expect(() => assertCurrentGame('game-1', 'game-1')).not.toThrow()
    try {
      assertCurrentGame('game-2', 'game-1')
      throw new Error('expected GAME_NOT_CURRENT')
    } catch (error) {
      expect(error).toBeInstanceOf(XiangqiError)
      expect((error as XiangqiError).code).toBe('GAME_NOT_CURRENT')
      expect((error as Error).message).toContain('"game-1" is not the current game "game-2"')
    }
  })

  it('retainOnly retires every stale game so late writes cannot resurrect them', () => {
    const service = createServiceWithIds('game-a', 'game-b')
    const first = service.newGame()
    const second = service.newGame()

    expect(service.retainOnly(second.gameId)).toBe(1)
    expect(service.get(second.gameId).revision).toBe(1)
    expect(() => service.get(first.gameId)).toThrowError(/was not found/)
    expect(service.retainOnly(second.gameId)).toBe(0)
  })
})
