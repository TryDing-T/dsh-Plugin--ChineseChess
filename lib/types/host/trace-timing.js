/**
 * 决策追踪计时规则（审查第二轮 P1）：只有正在运行的决策耗时才动态增长；
 * 进入 completed/failed/cancelled 任一终态后，耗时以首次终态时刻为准冻结。
 */
const TERMINAL_PHASES = ['completed', 'failed', 'cancelled'];
/** 该阶段是否为决策终态。 */
export function isTerminalPhase(phase) {
    return TERMINAL_PHASES.includes(phase);
}
/**
 * 计算展示用耗时：已结束的决策用定格的 endedAt，运行中的用当前时间。
 * `endedAt` 一旦写入就不再改变（由调用方保证只写一次）。
 */
export function freezeElapsedMs(startedAt, endedAt, now) {
    return Math.max(0, (endedAt ?? now) - startedAt);
}
//# sourceMappingURL=trace-timing.js.map