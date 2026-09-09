import { describe, expect, it } from 'vitest'
import { resolveRouteFromSnapshot } from '../../src/host/route.ts'
import { XiangqiError } from '../../src/host/service.ts'

describe('模型路由快照（审查第二轮 P0）', () => {
  it('does not inherit the old effort when an explicit model override uses its default', () => {
    expect(resolveRouteFromSnapshot({
      override: { provider: 'override', model: 'model' },
      selectedModel: { provider: 'selected', model: 'model', reasoningEffort: 'xhigh' },
      headerConfig: { provider: 'old', model: 'model', reasoningEffort: 'high' },
    }).reasoningEffort).toBe('auto')
  })
  it('prefers an explicit override over every session source, verbatim', () => {
    const route = resolveRouteFromSnapshot({
      override: { provider: 'opencode-go', model: 'gpt-xhigh', reasoningEffort: 'xhigh' },
      headerConfig: { provider: 'deepseek-official', model: 'deepseek-chat', reasoningEffort: 'high' },
      requestContext: { provider: 'a', model: 'b' },
      agentOptions: { provider: 'c', model: 'd' },
    })
    expect(route).toEqual({ provider: 'opencode-go', model: 'gpt-xhigh', reasoningEffort: 'xhigh' })
  })

  it('falls back through header → requestContext → agent options', () => {
    expect(resolveRouteFromSnapshot({
      headerConfig: { provider: 'h-provider', model: 'h-model' },
      requestContext: { provider: 'c-provider', model: 'c-model' },
      agentOptions: { provider: 'o-provider', model: 'o-model' },
    })).toEqual({ provider: 'h-provider', model: 'h-model', reasoningEffort: 'auto' })

    expect(resolveRouteFromSnapshot({
      requestContext: { provider: 'c-provider', model: 'c-model' },
      agentOptions: { provider: 'o-provider', model: 'o-model' },
    })).toEqual({ provider: 'c-provider', model: 'c-model', reasoningEffort: 'auto' })

    expect(resolveRouteFromSnapshot({
      agentOptions: { provider: 'o-provider', model: 'o-model' },
    })).toEqual({ provider: 'o-provider', model: 'o-model', reasoningEffort: 'auto' })
  })

  it('passes custom effort levels (off/xhigh/max) through without dropping them', () => {
    for (const effort of ['off', 'xhigh', 'max', 'minimal-思考']) {
      const fromOverride = resolveRouteFromSnapshot({
        override: { provider: 'p', model: 'm', reasoningEffort: effort },
      })
      expect(fromOverride.reasoningEffort).toBe(effort)

      const fromHeader = resolveRouteFromSnapshot({
        headerConfig: { provider: 'p', model: 'm', reasoningEffort: effort },
      })
      expect(fromHeader.reasoningEffort).toBe(effort)
    }
  })

  it('treats blank/unknown-shaped efforts as "auto" (do not send anything)', () => {
    expect(resolveRouteFromSnapshot({
      override: { provider: 'p', model: 'm', reasoningEffort: '   ' },
    }).reasoningEffort).toBe('auto')
    expect(resolveRouteFromSnapshot({
      headerConfig: { provider: 'p', model: 'm', reasoningEffort: null },
    }).reasoningEffort).toBe('auto')
  })

  it('rejects a session without any usable provider/model instead of guessing', () => {
    try {
      resolveRouteFromSnapshot({})
      throw new Error('expected INVALID_DECISION')
    } catch (error) {
      expect(error).toBeInstanceOf(XiangqiError)
      expect((error as XiangqiError).code).toBe('INVALID_DECISION')
    }
  })

  it('an empty-string override field falls back to the session sources', () => {
    const route = resolveRouteFromSnapshot({
      override: { provider: '', model: '' },
      headerConfig: { provider: 'h', model: 'm' },
    })
    expect(route.provider).toBe('h')
    expect(route.model).toBe('m')
  })
})
