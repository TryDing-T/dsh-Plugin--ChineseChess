import { Context, Service } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import { describe, expect, it, vi } from 'vitest'
import * as clientPlugin from '../../src/client/index.ts'

class FakeRemoteCarrier extends Service {
  constructor(
    ctx: Context,
    private readonly root: Context,
  ) {
    super(ctx, 'remote')
  }

  async $mount(): Promise<() => Promise<void>> {
    const dispose = this.root.provide('remote.xiangqi', {
      newGame: vi.fn(),
      move: vi.fn(),
      undo: vi.fn(),
      resign: vi.fn(),
      get: vi.fn(),
    })
    return async () => { dispose() }
  }
}

describe('xiangqi client Remote lifecycle', () => {
  it('activates through the real Loader after mounting remote.xiangqi', async () => {
    const ctx = new Context()
    new FakeRemoteCarrier(ctx, ctx)
    const injectSlot = vi.fn()
    const disposeSlots = ctx.provide('slots', { inject: injectSlot })
    const disposeSessions = ctx.provide('sessions', { binding: vi.fn() })

    await ctx.plugin(Loader)
    ctx.loader.internal = {
      import: vi.fn(async (specifier: string) => {
        if (specifier === '@deepseek-ai/dsh-plugin-xiangqi') return clientPlugin
        throw new Error(`unexpected module: ${specifier}`)
      }),
    } as never
    const entryId = await ctx.loader.create({ name: '@deepseek-ai/dsh-plugin-xiangqi' })
    await ctx.loader.await()

    expect(ctx.get('remote.xiangqi')).toBeDefined()
    expect(injectSlot).toHaveBeenCalledWith('sidebar.footer.action', expect.any(Function))
    expect(injectSlot).toHaveBeenCalledWith('shell.overlay', expect.any(Function))

    await ctx.loader.remove(entryId)
    expect(ctx.get('remote.xiangqi')).toBeUndefined()
    disposeSessions()
    disposeSlots()
    await ctx.fiber.dispose()
  })
})
