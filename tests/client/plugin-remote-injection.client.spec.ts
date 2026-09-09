// @vitest-environment jsdom
/**
 * Client Loader 组合冒烟：真实 cordis + cordis-plugin-loader 激活客户端插件。
 *
 * 加载真实 lib/client.js factory 后交给 Cordis Loader。
 * 仅模拟 Remote transport 和宿主 UI 服务；缺依赖、产物或 factory 均失败。
 */
import { describe, expect, it, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { runInNewContext } from 'node:vm'
import { resolve } from 'node:path'

/**
 * 运行时动态导入。specifier 由变量拼出，打包/转换器无法静态解析，
 * 缺包时抛出可捕获的运行时异常而不是文件级收集错误。
 */
async function runtimeImport<T = unknown>(scope: string, subpath: string): Promise<T> {
  const specifier = [scope, subpath].filter(Boolean).join('/')
  return await import(/* @vite-ignore */ specifier) as T
}

describe('xiangqi client Remote lifecycle', () => {
  let clientPlugin: Record<string, unknown>

  beforeAll(async () => {
    let declaration: { id: string; factory: (require: (id: string) => unknown) => Record<string, unknown> } | undefined
    runInNewContext(readFileSync(resolve('lib/client.js'), 'utf8'), {
      window: { __ModuleLoader__: { load: (value: typeof declaration) => { declaration = value } } },
      document, console, setTimeout, clearTimeout, AbortController,
    })
    expect(declaration?.id).toBe('@deepseek-ai/dsh-plugin-xiangqi')
    const require = createRequire(resolve('package.json'))
    const platform = new Set(['react', 'react/jsx-runtime', '@deepseek-ai/dsh-client-store'])
    clientPlugin = declaration!.factory((specifier) => {
      if (!platform.has(specifier)) throw new Error(`unexpected bundle dependency: ${specifier}`)
      return require(specifier)
    })
  })

  it('activates through the real Loader after mounting remote.xiangqi', async () => {
    const { Context, Service } = await runtimeImport<typeof import('@deepseek-ai/cordis')>('@deepseek-ai', 'cordis')
    const loaderModule = await runtimeImport<{ default: unknown }>('@deepseek-ai', 'cordis-plugin-loader')
    const Loader = loaderModule.default
    const { vi } = await import('vitest')

    class FakeRemoteCarrier extends Service {
      constructor(
        ctx: InstanceType<typeof Context>,
        private readonly root: InstanceType<typeof Context>,
      ) {
        super(ctx as never, 'remote')
      }

      async $mount(): Promise<() => Promise<void>> {
        const dispose = this.root.provide('remote.xiangqi', {
          newGame: vi.fn(),
          move: vi.fn(),
          undo: vi.fn(),
          resign: vi.fn(),
          get: vi.fn(),
          requestAiMove: vi.fn(),
          cancelAiMove: vi.fn(),
          // 第三轮补齐：Overlay 打开期间会调用这两个接口。
          getRuntimeState: vi.fn(async () => ({ ok: false, error: { code: 'STUB', message: 'runtime state stub' } })),
          getDecisionTrace: vi.fn(async () => ({ ok: true, value: null })),
        })
        return async () => { dispose() }
      }
    }

    const ctx = new Context()
    new FakeRemoteCarrier(ctx, ctx)
    const injectSlot = vi.fn()
    const disposeSlots = ctx.provide('slots', { inject: injectSlot })
    const disposeSessions = ctx.provide('sessions', { binding: vi.fn() })
    // 0.1.2 适配：Child fiber 不再注入 'connection'（官方 session.models RPC
    // 已移除，模型路由由 Host 会话请求头兜底）。

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
