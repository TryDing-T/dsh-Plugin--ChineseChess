import { describe, expect, it } from 'vitest'
import {
  formatXiangqiDecisionFailure,
  isXiangqiRateLimitFailure,
  XiangqiDecisionModelError,
} from '../../src/host/decision-error.ts'

describe('xiangqi model failure diagnostics', () => {
  it('renders the upstream shared-pool 429 instead of a JSON protocol error', () => {
    const failure = {
      message: '429: {"message":"Provider returned error","code":429,"metadata":{"raw":"stealth/ox-alpha is temporarily rate-limited upstream. Please retry shortly.","provider_name":"Stealth"}}',
      code: 'UNKNOWN',
    }

    expect(isXiangqiRateLimitFailure(failure)).toBe(true)
    expect(formatXiangqiDecisionFailure(failure)).toContain('模型提供商限流（429）')
    expect(formatXiangqiDecisionFailure(failure)).toContain('Stealth')
    expect(formatXiangqiDecisionFailure(failure)).toContain('stealth/ox-alpha is temporarily rate-limited upstream')
  })

  it('keeps an empty completion out of the protocol retry path', () => {
    const error = new XiangqiDecisionModelError({
      message: '模型完成响应但没有返回可见内容',
      code: 'EMPTY_RESPONSE',
    })

    expect(error).toBeInstanceOf(XiangqiDecisionModelError)
    expect(error.message).toBe('模型未返回可用内容：模型完成响应但没有返回可见内容')
    expect(error.failure.code).toBe('EMPTY_RESPONSE')
  })
})
