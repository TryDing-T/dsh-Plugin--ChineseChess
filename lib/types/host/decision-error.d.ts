import type { LlmFailure } from '@deepseek-ai/dsh-llm';
/** A model/provider failure is not a protocol failure and must not be retried as bad JSON. */
export declare class XiangqiDecisionModelError extends Error {
    readonly failure: LlmFailure;
    constructor(failure: LlmFailure);
}
/** Keep the provider's useful diagnostic while making the failure actionable in the board UI. */
export declare function formatXiangqiDecisionFailure(failure: LlmFailure): string;
export declare function isXiangqiRateLimitFailure(failure: LlmFailure): boolean;
//# sourceMappingURL=decision-error.d.ts.map