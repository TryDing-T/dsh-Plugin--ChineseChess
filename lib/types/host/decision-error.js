/** A model/provider failure is not a protocol failure and must not be retried as bad JSON. */
export class XiangqiDecisionModelError extends Error {
    failure;
    constructor(failure) {
        super(formatXiangqiDecisionFailure(failure));
        this.name = 'XiangqiDecisionModelError';
        this.failure = Object.freeze({ ...failure });
    }
}
/** Keep the provider's useful diagnostic while making the failure actionable in the board UI. */
export function formatXiangqiDecisionFailure(failure) {
    const detail = providerFailureDetail(failure.message);
    const status = failure.status ?? detail.status;
    if (isXiangqiRateLimitFailure(failure)) {
        const provider = detail.provider === undefined ? '' : `；提供商：${detail.provider}`;
        return `模型提供商限流${status === undefined ? '' : `（${status}）`}：上游暂时限流，请稍后重试${provider}。${detail.message}`;
    }
    if (failure.code === 'EMPTY_RESPONSE') {
        return `模型未返回可用内容：${detail.message}`;
    }
    const code = failure.code.length === 0 ? '' : `（${failure.code}${status === undefined ? '' : `/${status}`}）`;
    return `DSH 模型请求失败${code}：${detail.message}`;
}
export function isXiangqiRateLimitFailure(failure) {
    const detail = providerFailureDetail(failure.message);
    return failure.status === 429
        || detail.status === 429
        || failure.code === 'RATE_LIMIT'
        || /(?:rate.?limit|temporarily\s+rate-limited|too many requests)/i.test(detail.message);
}
function providerFailureDetail(message) {
    const trimmed = message.trim();
    const prefix = /^(\d{3})\s*:\s*/.exec(trimmed);
    const status = prefix === null ? undefined : Number(prefix[1]);
    const body = prefix === null ? trimmed : trimmed.slice(prefix[0].length);
    let parsed;
    try {
        parsed = JSON.parse(body);
    }
    catch {
        return { ...status === undefined ? {} : { status }, message: trimmed };
    }
    if (!isRecord(parsed)) {
        return { ...status === undefined ? {} : { status }, message: trimmed };
    }
    const metadata = isRecord(parsed.metadata) ? parsed.metadata : undefined;
    const providerRaw = metadata?.provider_name;
    const raw = metadata?.raw;
    const provider = typeof providerRaw === 'string' && providerRaw.trim().length > 0
        ? providerRaw.trim()
        : undefined;
    const nestedStatus = typeof parsed.code === 'number' && Number.isInteger(parsed.code)
        && parsed.code >= 100 && parsed.code <= 599
        ? parsed.code
        : undefined;
    const detailMessage = typeof raw === 'string' && raw.trim().length > 0
        ? raw.trim()
        : typeof parsed.message === 'string' && parsed.message.trim().length > 0
            ? parsed.message.trim()
            : trimmed;
    const resolvedStatus = status ?? nestedStatus;
    return {
        ...resolvedStatus === undefined ? {} : { status: resolvedStatus },
        ...provider === undefined ? {} : { provider },
        message: detailMessage,
    };
}
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
//# sourceMappingURL=decision-error.js.map