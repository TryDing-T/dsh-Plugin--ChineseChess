import { describe, expect, it } from 'vitest'
import { XiangqiDecisionGate } from '../../src/host/decision-gate.ts'

describe('卸载安全闸门（审查第二轮 P0）', () => {
  it('tracks exactly one active decision and settles it on completion', () => {
    const gate = new XiangqiDecisionGate()
    expect(gate.begin('d1')).toBe(true)
    expect(gate.currentDecisionId).toBe('d1')
    // 同一时刻不允许第二条决策。
    expect(gate.begin('d2')).toBe(false)
    expect(gate.canCommit('d1')).toBe(true)
    expect(gate.settle('d1')).toBe(true)
    expect(gate.currentDecisionId).toBeUndefined()
    // 结束后旧结果不能再提交。
    expect(gate.canCommit('d1')).toBe(false)
    expect(gate.begin('d2')).toBe(true)
  })

  it('rejects results returned after the plugin was destroyed', () => {
    const gate = new XiangqiDecisionGate()
    gate.begin('d1')
    gate.destroy()

    expect(gate.isDestroyed).toBe(true)
    expect(gate.canCommit('d1')).toBe(false)
    expect(gate.begin('d2')).toBe(false)
    // destroy 已清空活动决策：取消动作不再有目标。
    expect(gate.cancel()).toBeUndefined()
  })

  it('cancel clears only the active decision and keeps the service alive', () => {
    const gate = new XiangqiDecisionGate()
    gate.begin('d1')
    expect(gate.cancel()).toBe('d1')
    expect(gate.isDestroyed).toBe(false)
    expect(gate.canCommit('d1')).toBe(false)
    expect(gate.begin('d2')).toBe(true)
    expect(gate.settle('d2')).toBe(true)
  })

  it('settle reports false for decisions it does not own', () => {
    const gate = new XiangqiDecisionGate()
    expect(gate.settle('ghost')).toBe(false)
    gate.begin('d1')
    gate.settle('d1')
    expect(gate.settle('d1')).toBe(false)
  })
})
