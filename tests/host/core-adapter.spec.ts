import { describe, expect, it } from 'vitest'
import { deserialize } from '../../src/game/serialization.ts'
import { findBestMoves } from '../../src/game/ai.ts'
import { createXiangqiGameFactory } from '../../src/host/game-adapter.ts'
import { XiangqiHostService } from '../../src/host/service.ts'

describe('Host adapter over src/game', () => {
  it('uses the real rules for a legal move, illegal move, and undo', () => {
    const service = new XiangqiHostService(createXiangqiGameFactory(), {
      createGameId: () => 'core-game',
    })
    const created = service.newGame()
    const moved = service.move({
      gameId: created.gameId,
      revision: created.revision,
      move: { from: 'e3', to: 'e4' },
    })

    expect(moved.revision).toBe(2)
    expect(moved.gameState).not.toEqual(created.gameState)
    expect(() => service.move({
      gameId: created.gameId,
      revision: moved.revision,
      move: { from: 'e6', to: 'e4' },
    })).toThrowError(/^xiangqi:/)

    const undone = service.undo({ gameId: created.gameId, revision: moved.revision })
    expect(undone.gameState).toEqual(created.gameState)
    expect(undone.revision).toBe(3)
  })

  it('can search fast black candidates from the real persisted state', () => {
    const service = new XiangqiHostService(createXiangqiGameFactory(), {
      createGameId: () => 'candidate-game',
    })
    const created = service.newGame()
    const afterRed = service.move({
      gameId: created.gameId,
      revision: created.revision,
      move: { from: 'e3', to: 'e4' },
    })
    const result = findBestMoves(deserialize(JSON.stringify(afterRed.gameState)), { depth: 1, limit: 5 })

    expect(result.turn).toBe('black')
    expect(result.candidates.length).toBeGreaterThan(0)
  })
})
