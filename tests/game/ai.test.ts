import { describe, expect, it } from 'vitest'
import { applyMove, getLegalMoves, newGame } from '../../src/game/rules.ts'
import { findBestMoves } from '../../src/game/ai.ts'

describe('快速候选搜索', () => {
  it('returns legal black candidates after a red move', () => {
    const game = applyMove(newGame(), { from: 'e3', to: 'e4' })
    const legal = getLegalMoves(game)
    const result = findBestMoves(game, { depth: 1, limit: 5 })

    expect(result.turn).toBe('black')
    expect(result.candidates).toHaveLength(5)
    expect(result.nodes).toBeGreaterThan(0)
    for (const candidate of result.candidates) {
      expect(legal.some(move => (
        move.from.x === candidate.move.from.x
        && move.from.y === candidate.move.from.y
        && move.to.x === candidate.move.to.x
        && move.to.y === candidate.move.to.y
      ))).toBe(true)
    }
  })
})
