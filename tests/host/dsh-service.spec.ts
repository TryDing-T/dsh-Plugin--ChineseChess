import { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type { GenerateOptions } from '@deepseek-ai/dsh-llm'
import { remoteMethods } from '@deepseek-ai/dsh-typert-protocol'
import { describe, expect, it } from 'vitest'
// The Host decorators are lowered by the build before this composition test.
import { XiangqiService } from '../../lib/index.js'
import { TYPERT } from '../../lib/typert.host.js'
import remote from '../../lib/typert.remote-client.js'

async function createHarness() {
  const ctx = new Context()
  const streams: Array<{ options: GenerateOptions; finish: () => void }> = []
  const agent = {
    id: 'test-agent',
    options: { provider: 'old-provider', model: 'old-model' },
    session: {
      requestHeader: () => ({ config: { provider: 'old-provider', model: 'old-model', reasoningEffort: 'high' } }),
      requestContext: () => undefined,
    },
  } as unknown as Agent
  const projection = {
    lastUsed: { provider: 'old-provider', model: 'old-model', reasoningEffort: 'high' },
    pending: { provider: 'new-provider', model: 'new-model' } as { provider: string; model: string; reasoningEffort?: string } | null,
  }
  ctx.provide('agents', { get: (id: string) => id === agent.id ? agent : undefined } as never)
  ctx.provide('sessionProjections', { stateOf: () => projection } as never)
  ctx.provide('llm', {
    resolveCallConfig: async (options: GenerateOptions) => options,
    async *stream(options: GenerateOptions) {
      const done = Promise.withResolvers<void>()
      streams.push({ options, finish: () => done.resolve() })
      await done.promise
    },
  } as never)
  const fiber = ctx.plugin(XiangqiService)
  await fiber.await()
  const service = ctx.get('xiangqi')!
  const initial = service.newGame(agent, {})
  const black = service.move(agent, { gameId: initial.gameId, revision: initial.revision, move: { from: 'a3', to: 'a4' } })
  const request = { gameId: black.gameId, revision: black.revision }
  return { ctx, fiber, service, agent, streams, projection, request }
}

describe('DSH Host service composition', () => {
  it('generates the live Remote methods, lookup identities and matching state codecs', async () => {
    const h = await createHarness()
    try {
      const methods = remoteMethods(h.service).map(marker => marker.exportName ?? marker.method).sort()
      expect(remote.descriptors.map(descriptor => descriptor.method).sort()).toEqual(methods)
      expect(TYPERT.invocations.map(descriptor => descriptor.method).sort()).toEqual(methods)
      for (const descriptor of remote.descriptors) {
        expect(descriptor.parameters[0]).toMatchObject({ name: 'agent', wire: 'agentId', source: 'lookup', lookup: 'agent' })
        expect(descriptor.scope).toEqual({ context: 'agent', wire: 'agentId' })
      }
      const state = h.service.getRuntimeState(h.agent)
      const clientCodec = remote.descriptors.find(descriptor => descriptor.method === 'getRuntimeState')!.result.schema
      const hostCodec = TYPERT.invocations.find(descriptor => descriptor.method === 'getRuntimeState')!.result.schema
      expect(clientCodec.parse(state)).toEqual(hostCodec.parse(state))
      expect(() => clientCodec.parse({ ...state, state: { ...state.state, revision: 'invalid' } })).toThrow()
    } finally {
      await h.ctx.fiber.dispose()
    }
  })
  it('uses a pending model selection immediately and clears the old reasoning effort', async () => {
    const h = await createHarness()
    const decision = h.service.requestAiMove(h.agent, h.request)
    try {
      await expect.poll(() => h.streams.length).toBe(1)
      expect(h.streams[0].options).toMatchObject({ provider: 'new-provider', model: 'new-model' })
      expect(h.streams[0].options.reasoningEffort).toBeUndefined()
    } finally {
      h.service.cancelAiMove(h.agent)
      h.streams.forEach(stream => stream.finish())
      await decision
      await h.ctx.fiber.dispose()
    }
  })

  it('preserves a pending custom effort and lets an explicit override win', async () => {
    const h = await createHarness()
    h.projection.pending!.reasoningEffort = 'xhigh'
    const first = h.service.requestAiMove(h.agent, h.request)
    try {
      await expect.poll(() => h.streams.length).toBe(1)
      expect(h.streams[0].options.reasoningEffort).toBe('xhigh')
      h.service.cancelAiMove(h.agent)
      h.streams[0].finish()
      await first
      const second = h.service.requestAiMove(h.agent, {
        ...h.request,
        modelOverride: { provider: 'override-provider', model: 'override-model', reasoningEffort: 'off' },
      })
      await expect.poll(() => h.streams.length).toBe(2)
      expect(h.streams[1].options).toMatchObject({ provider: 'override-provider', model: 'override-model', reasoningEffort: 'off' })
      h.service.cancelAiMove(h.agent)
      h.streams[1].finish()
      await second
    } finally {
      h.streams.forEach(stream => stream.finish())
      await first
      await h.ctx.fiber.dispose()
    }
  })

  it('waits for both a cancelled stream and its replacement before finishing unload', async () => {
    const h = await createHarness()
    const first = h.service.requestAiMove(h.agent, h.request)
    await expect.poll(() => h.streams.length).toBe(1)
    h.service.cancelAiMove(h.agent)
    const second = h.service.requestAiMove(h.agent, h.request)
    await expect.poll(() => h.streams.length).toBe(2)
    let unloaded = false
    const unloading = h.fiber.dispose().then(() => { unloaded = true })
    try {
      await expect.poll(() => h.streams[1].options.signal.aborted).toBe(true)
      await new Promise(resolve => setImmediate(resolve))
      expect(unloaded).toBe(false)
      h.streams[1].finish()
      await second
      await new Promise(resolve => setImmediate(resolve))
      expect(unloaded).toBe(false)
      h.streams[0].finish()
      await unloading
      expect((await first).status).toBe('failed')
      expect(h.service.getRuntimeState(h.agent).state?.revision).toBe(h.request.revision)
    } finally {
      h.streams.forEach(stream => stream.finish())
      await Promise.all([first, second, unloading])
      await h.ctx.fiber.dispose()
    }
  })
})
