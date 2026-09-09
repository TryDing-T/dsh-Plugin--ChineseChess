/**
 * 模型路由快照解析（审查第二轮 P0）：把"这一刻"拿到的模型选择原样变成
 * 一次黑方请求的路由。纯函数、无副作用，方便对 off/xhigh/max 等
 * 模型自定义思考级别做透传测试。
 */
import { XiangqiError } from "./service.js";
/** 只保留非空字符串；空串/空白视为"未指定"。 */
export function normalizeEffort(value) {
    if (typeof value !== 'string')
        return undefined;
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
}
function firstNonEmpty(...values) {
    for (const value of values) {
        if (value !== undefined && value.trim().length > 0)
            return value;
    }
    return undefined;
}
/**
 * 解析一次黑方决策的路由。provider/model 缺失时抛 INVALID_DECISION，
 * 由上层转成用户可见的重试提示——绝不静默猜测模型。
 */
export function resolveRouteFromSnapshot(sources) {
    const override = sources.override;
    const liveProvider = firstNonEmpty(sources.selectedModel?.provider, sources.headerConfig?.provider, sources.requestContext?.provider, sources.agentOptions?.provider);
    const liveModel = firstNonEmpty(sources.selectedModel?.model, sources.headerConfig?.model, sources.requestContext?.model, sources.agentOptions?.model);
    // 覆盖字段里的空串/空白视为未指定，继续向会话来源回退。
    const provider = firstNonEmpty(override?.provider) ?? liveProvider;
    const model = firstNonEmpty(override?.model) ?? liveModel;
    if (provider === undefined || model === undefined || provider.trim().length === 0 || model.trim().length === 0) {
        throw new XiangqiError('INVALID_DECISION', '当前会话还没有可用的 provider/model；请先在该会话完成一次对话，或在请求里显式指定模型');
    }
    // A complete explicit model override owns its default effort as well.
    const overridesModel = firstNonEmpty(override?.provider) !== undefined && firstNonEmpty(override?.model) !== undefined;
    const effort = override?.reasoningEffort !== undefined
        ? normalizeEffort(override.reasoningEffort)
        : overridesModel ? undefined : normalizeEffort(sources.selectedModel === undefined ? sources.headerConfig?.reasoningEffort : sources.selectedModel.reasoningEffort);
    return {
        provider: provider.trim(),
        model: model.trim(),
        reasoningEffort: effort ?? 'auto',
    };
}
//# sourceMappingURL=route.js.map