import { describe, expect, it } from 'vitest'
import type { XiangqiDecisionTracePhase } from '../../src/types.ts'
import { freezeElapsedMs, isTerminalPhase } from '../../src/host/trace-timing.ts'

describe('决策追踪计时（审查第二轮 P1）', () => {
  it('recognizes completed / failed / cancelled as the three terminal phases', () => {
    for (const phase of ['completed', 'failed', 'cancelled'] as const) {
      expect(isTerminalPhase(phase)).toBe(true)
    }
    for (const phase of ['preparing', 'requesting', 'receiving', 'validating', 'committing'] as const) {
      expect(isTerminalPhase(phase)).toBe(false)
    }
  })

  it('freezes the elapsed time at the terminal moment for each terminal phase', () => {
    const startedAt = 1_000
    const phases = ['completed', 'failed', 'cancelled'] as const
    for (const phase of phases satisfies readonly XiangqiDecisionTracePhase[]) {
      void phase
      // 终态写入 endedAt=1500 之后，无论轮询何时再读都停在 500ms。
      const endedAt = 1_500
      expect(freezeElapsedMs(startedAt, endedAt, 61_500)).toBe(500)
      expect(freezeElapsedMs(startedAt, endedAt, 999_999)).toBe(500)
    }
  })

  it('keeps a running decision growing with the clock until it terminates', () => {
    const startedAt = 1_000
    expect(freezeElapsedMs(startedAt, undefined, 1_350)).toBe(350)
    expect(freezeElapsedMs(startedAt, undefined, 2_000)).toBe(1_000)
  })

  it('never reports negative elapsed times', () => {
    expect(freezeElapsedMs(1_000, 900, 1_200)).toBe(0)
    expect(freezeElapsedMs(1_000, undefined, 400)).toBe(0)
  })
})
