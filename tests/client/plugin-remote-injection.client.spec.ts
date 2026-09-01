// @vitest-environment jsdom
/**
 * Client Loader 组合冒烟：真实 cordis + cordis-plugin-loader 激活客户端插件。
 *
 * 它依赖完整 DSH 浏览器模块运行时（@deepseek-ai/cordis、cordis-plugin-loader、
 * window.__ModuleLoader__ 等）。本工作区不安装这些运行时包，因此顶层先做
 * 能力探测，缺失时整体跳过以保持 `npm test` 全绿；在具备 0.1.2-alpha.3
 * 完整依赖的镜像/CI 中会真实执行并覆盖 Remote 生命周期与新增接口。
 * （0.1.2 适配：客户端插件入口不再使用 @deepseek-ai/dsh-client-runtime，
 * store 引擎迁至 @deepseek-ai/dsh-client-store。）
 */
import { describe, expect, it, beforeAll } from 'vitest'

/**
 * 运行时动态导入。specifier 由变量拼出，打包/转换器无法静态解析，
 * 缺包时抛出可捕获的运行时异常而不是文件级收集错误。
 */
async function runtimeImport<T = unknown>(scope: string, subpath: string): Promise<T> {
  const specifier = [scope, subpath].filter(Boolean).join('/')
  return await import(/* @vite-ignore */ specifier) as T
}

const hasCordis = await runtimeImport('@deepseek-ai', 'cordis').then(() => true, () => false)
const hasLoader = await runtimeImport('@deepseek-ai', 'cordis-plugin-loader').then(() => true, () => false)
const hasClientStore = await runtimeImport('@deepseek-ai', 'dsh-client-store').then(() => true, () => false)
const runnable = hasCordis && hasLoader && hasClientStore

describe.skipIf(!runnable)('xiangqi client Remote lifecycle', () => {
  let clientPlugin: Record<string, unknown>

  beforeAll(async () => {
    // Client 插件经 Loader 模块表加载时，bundle 工厂以 window.__ModuleLoader__
    // 自注册；Node 测试环境必须在动态导入插件源码之前备好该全局。
    ;(window as unknown as Record<string, unknown>).__ModuleLoader__ = {
      load: (_declaration: unknown) => ({ exports: {} }),
    }
    clientPlugin = await import('../../src/client/index.ts') as Record<string, unknown>
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
