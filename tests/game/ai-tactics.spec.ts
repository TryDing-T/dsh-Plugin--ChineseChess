import { describe, expect, it } from 'vitest'
import { fromFen } from '../../src/game/serialization.ts'
import { getLegalMoves } from '../../src/game/rules.ts'
import { findBestMoves } from '../../src/game/ai.ts'
import type { GameState, Move } from '../../src/game/types.ts'

function moveOf(result: ReturnType<typeof findBestMoves>, index = 0): Move {
  return result.candidates[index].move
}

function sameMove(move: Move, from: string, to: string): boolean {
  const fileOf = (x: number): string => 'abcdefghi'[x]
  const fmt = (x: number, y: number): string => `${fileOf(x)}${9 - y}`
  return fmt(move.from.x, move.from.y) === from && fmt(move.to.x, move.to.y) === to
}

/** 断言某个走法在给定局面里确实合法。 */
function expectLegal(game: GameState, from: string, to: string): void {
  const legal = getLegalMoves(game)
  expect(legal.some(move => sameMove(move, from, to)), `走法 ${from}->${to} 应合法`).toBe(true)
}

describe('AI 战术智能', () => {
  it('看到白吃子的机会（红车吃黑车）', () => {
    // 黑将 e9 避开与红帅 d0 的照面；黑车 a2 无保护，红车 a4 纵向直吃
    const fen = '4k4/9/9/9/9/R8/9/r8/9/3K5 w'
    const game = fromFen(fen)
    expectLegal(game, 'a4', 'a2')
    const result = findBestMoves(game, { depth: 2, limit: 5 })
    expect(sameMove(moveOf(result), 'a4', 'a2')).toBe(true)
  })

  it('不把车送到对方嘴里（吃马会被反吃时选择其他走法）', () => {
    // 红车 e5；黑马 e4 被黑马 c5 保护——红车吃马后黑马 c5 能吃回红车
    const fen = '5k3/9/9/9/2n1R4/4n4/9/9/9/3K5 w'
    const game = fromFen(fen)
    expectLegal(game, 'e5', 'e4')
    const result = findBestMoves(game, { depth: 2, limit: 5 })
    // 引擎不应首选“吃马送车”
    expect(sameMove(moveOf(result), 'e5', 'e4')).toBe(false)
    // 候选必须全部合法
    for (const candidate of result.candidates) {
      expect(getLegalMoves(game).some(move => (
        move.from.x === candidate.move.from.x
        && move.from.y === candidate.move.from.y
        && move.to.x === candidate.move.to.x
        && move.to.y === candidate.move.to.y
      ))).toBe(true)
    }
  })

  it('优先吃掉能吃的马（炮隔架打马）', () => {
    // 红炮 c6 隔黑象 c5 打黑马 c4——黑马无保护，白吃
    const fen = '3k5/9/9/2C6/2b6/2n6/9/9/9/4K4 w'
    const game = fromFen(fen)
    expectLegal(game, 'c6', 'c4')
    const result = findBestMoves(game, { depth: 2, limit: 5 })
    expect(sameMove(moveOf(result), 'c6', 'c4')).toBe(true)
  })

  it('吃士将军是强走法（出现在前两位）', () => {
    // 红车 d5 可直接下底吃黑士 d9 并将军黑将 e9
    const fen = '3ak4/9/9/9/3R5/9/9/9/9/3K5 w'
    const game = fromFen(fen)
    expectLegal(game, 'd5', 'd9')
    const result = findBestMoves(game, { depth: 2, limit: 5 })
    const topTwo = result.candidates.slice(0, 2).some(candidate => sameMove(candidate.move, 'd5', 'd9'))
    expect(topTwo).toBe(true)
  })

  it('将死局面返回空候选', () => {
    // 三车封死黑将：红车 (3,3)(4,3)(5,3) 分别封住黑将三条逃路，无子可挡
    const fen = '4k4/9/9/3RRR3/9/9/9/9/9/4K4 b'
    const game = fromFen(fen)
    expect(getLegalMoves(game)).toHaveLength(0)
    const result = findBestMoves(game, { depth: 2, limit: 5 })
    expect(result.candidates).toHaveLength(0)
  })

  it('迭代加深在时间预算内返回合法候选且深度可增长', () => {
    const fen = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w'
    const game = fromFen(fen)
    const start = performance.now()
    const result = findBestMoves(game, { timeMs: 150, depth: 5, limit: 5 })
    const elapsed = performance.now() - start
    expect(result.candidates).toHaveLength(5)
    expect(result.depth).toBeGreaterThanOrEqual(2)
    expect(elapsed).toBeLessThan(600)
  })
})
