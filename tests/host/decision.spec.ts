import { describe, expect, it } from 'vitest'
import { applyMove, newGame } from '../../src/game/rules.ts'
import {
  buildXiangqiDecisionPacket,
  parseXiangqiDecisionResponse,
  validateXiangqiDecisionForCurrentState,
  XiangqiDecisionProtocolError,
} from '../../src/host/decision.ts'

function blackTurnGame() {
  return applyMove(newGame(), { from: 'a0', to: 'a1' })
}

describe('xiangqi isolated decision protocol', () => {
  it('builds deterministic black-top encoding and legal frozen candidates', () => {
    const game = blackTurnGame()
    const packet = buildXiangqiDecisionPacket(
      game,
      { gameId: 'game-1', revision: 2, lastMove: { from: 'a0', to: 'a1' } },
      'decision-1',
      { localSearchTimeMs: 20, depth: 2, limit: 5 },
    )
    const duplicate = buildXiangqiDecisionPacket(
      game,
      { gameId: 'game-1', revision: 2, lastMove: { from: 'a0', to: 'a1' } },
      'decision-1',
      { localSearchTimeMs: 20, depth: 2, limit: 5 },
    )

    expect(packet.protocol).toBe('xiangqi-decision/v1')
    expect(packet.positionId).toBe(duplicate.positionId)
    expect(packet.boardEncoding.orientation).toBe('black-top-red-bottom')
    expect(packet.boardEncoding.rows).toHaveLength(10)
    expect(packet.boardEncoding.rows.every(row => row.length === 9)).toBe(true)
    expect(packet.boardEncoding.rows[0]).toBe('rheakaehr')
    expect(packet.boardEncoding.rows[9]).toBe('.HEAKAEHR')
    expect(packet.candidates.length).toBeGreaterThan(0)
    expect(packet.candidates.length).toBeLessThanOrEqual(5)
    expect(packet.candidates.map(candidate => candidate.id)).toEqual(
      packet.candidates.map((_, index) => `m${index + 1}`),
    )
  })

  it('accepts only a candidate id and rejects model-generated coordinates or stale facts', () => {
    const game = blackTurnGame()
    const packet = buildXiangqiDecisionPacket(
      game,
      { gameId: 'game-1', revision: 2 },
      'decision-2',
      { localSearchTimeMs: 20, depth: 2, limit: 5 },
    )
    const candidate = packet.candidates[0]
    if (candidate === undefined) throw new Error('expected a black candidate')
    const response = parseXiangqiDecisionResponse(JSON.stringify({
      decision_id: packet.decisionId,
      position_id: packet.positionId,
      observed: {
        side: 'black',
        in_check: packet.ruleFacts.inCheck,
        black_general: packet.ruleFacts.blackGeneral,
        red_general: packet.ruleFacts.redGeneral,
      },
      candidate_id: candidate.id,
      summary: '选择冻结候选。',
    }), packet)

    expect(validateXiangqiDecisionForCurrentState(packet, response, {
      gameId: 'game-1',
      revision: 2,
      game,
    })).toEqual({ from: candidate.from, to: candidate.to })

    expect(() => parseXiangqiDecisionResponse(JSON.stringify({
      decision_id: packet.decisionId,
      position_id: packet.positionId,
      observed: {
        side: 'black',
        in_check: packet.ruleFacts.inCheck,
        black_general: packet.ruleFacts.blackGeneral,
        red_general: packet.ruleFacts.redGeneral,
      },
      candidate_id: candidate.id,
      from: candidate.from,
      to: candidate.to,
    }), packet)).toThrow(XiangqiDecisionProtocolError)

    expect(() => validateXiangqiDecisionForCurrentState(packet, response, {
      gameId: 'game-1',
      revision: 3,
      game,
    })).toThrow(XiangqiDecisionProtocolError)
  })
})
