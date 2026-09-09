/**
 * 模型路由快照解析（审查第二轮 P0）：把"这一刻"拿到的模型选择原样变成
 * 一次黑方请求的路由。纯函数、无副作用，方便对 off/xhigh/max 等
 * 模型自定义思考级别做透传测试。
 */
import type { XiangqiAiModelOverride } from '../types.ts';
/** Host 决策使用的最终路由；'auto' 是"不显式传思考程度给模型"的哨兵值。 */
export interface DecisionRoute {
    readonly provider: string;
    readonly model: string;
    readonly reasoningEffort: string;
}
/** 路由来源：显式覆盖 > 待生效模型选择 > 请求头 > 请求上下文 > Agent 默认。 */
export interface ModelRouteSources {
    readonly override?: XiangqiAiModelOverride;
    readonly selectedModel?: {
        readonly provider: string;
        readonly model: string;
        readonly reasoningEffort?: string;
    };
    readonly headerConfig?: {
        readonly provider?: string;
        readonly model?: string;
        readonly reasoningEffort?: unknown;
    };
    readonly requestContext?: {
        readonly provider?: string;
        readonly model?: string;
    };
    readonly agentOptions?: {
        readonly provider?: string;
        readonly model?: string;
    };
}
/** 只保留非空字符串；空串/空白视为"未指定"。 */
export declare function normalizeEffort(value: unknown): string | undefined;
/**
 * 解析一次黑方决策的路由。provider/model 缺失时抛 INVALID_DECISION，
 * 由上层转成用户可见的重试提示——绝不静默猜测模型。
 */
export declare function resolveRouteFromSnapshot(sources: ModelRouteSources): DecisionRoute;
//# sourceMappingURL=route.d.ts.map