/**
 * 模型路由快照解析（审查第二轮 P0）：把"这一刻"拿到的模型选择原样变成
 * 一次黑方请求的路由。纯函数、无副作用，方便对 off/xhigh/max 等
 * 模型自定义思考级别做透传测试。
 */

import type { XiangqiAiModelOverride } from '../types.ts'
import { XiangqiError } from './service.ts'

/** Host 决策使用的最终路由；'auto' 是"不显式传思考程度给模型"的哨兵值。 */
export interface DecisionRoute {
  readonly provider: string
  readonly model: string
  readonly reasoningEffort: string
}

/** 组装路由的全部可能来源：显式覆盖 > 会话请求头 > 请求上下文 > Agent 默认。 */
export interface ModelRouteSources {
  readonly override?: XiangqiAiModelOverride
  readonly headerConfig?: { readonly provider?: string; readonly model?: string; readonly reasoningEffort?: unknown }
  readonly requestContext?: { readonly provider?: string; readonly model?: string }
  readonly agentOptions?: { readonly provider?: string; readonly model?: string }
}

/** 只保留非空字符串；空串/空白视为"未指定"。 */
export function normalizeEffort(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length === 0 ? undefined : trimmed
}

function firstNonEmpty(...values: ReadonlyArray<string | undefined>): string | undefined {
  for (const value of values) {
    if (value !== undefined && value.trim().length > 0) return value
  }
  return undefined
}

/**
 * 解析一次黑方决策的路由。provider/model 缺失时抛 INVALID_DECISION，
 * 由上层转成用户可见的重试提示——绝不静默猜测模型。
 */
export function resolveRouteFromSnapshot(sources: ModelRouteSources): DecisionRoute {
  const override = sources.override
  const liveProvider = firstNonEmpty(sources.headerConfig?.provider, sources.requestContext?.provider, sources.agentOptions?.provider)
  const liveModel = firstNonEmpty(sources.headerConfig?.model, sources.requestContext?.model, sources.agentOptions?.model)
  // 覆盖字段里的空串/空白视为未指定，继续向会话来源回退。
  const provider = firstNonEmpty(override?.provider) ?? liveProvider
  const model = firstNonEmpty(override?.model) ?? liveModel
  if (provider === undefined || model === undefined || provider.trim().length === 0 || model.trim().length === 0) {
    throw new XiangqiError(
      'INVALID_DECISION',
      '当前会话还没有可用的 provider/model；请先在该会话完成一次对话，或在请求里显式指定模型',
    )
  }
  // 思考程度优先级：显式覆盖 > 会话最近一次真实请求的头；未知自定义值
  // （off/xhigh/max…）原样透传给适配器，绝不静默丢弃。
  const effort = override?.reasoningEffort !== undefined
    ? normalizeEffort(override.reasoningEffort)
    : normalizeEffort(sources.headerConfig?.reasoningEffort)
  return {
    provider: provider.trim(),
    model: model.trim(),
    reasoningEffort: effort ?? 'auto',
  }
}
