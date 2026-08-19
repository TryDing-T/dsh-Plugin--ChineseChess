/**
 * 中国象棋 AI：迭代加深 + Alpha-Beta + 置换表 + 静态搜索。
 *
 * 设计目标：速度与棋力兼顾。
 * - 就地 make/unmake 棋盘：搜索过程中不再克隆整盘、不生成中文记谱、不重建
 *   GameState，单次节点开销比直接调用 applyMove 低一个数量级。
 * - 迭代加深 + 时间预算：默认在几百毫秒内返回可靠结果，剩余预算自动向下挖掘
 *   更深；未配置时间预算时退化为固定深度模式（兼顾旧调用方）。
 * - Zobrist 置换表（TT）：缓存重复局面，避免重复搜索。
 * - 静态搜索（QSearch）：叶子只延伸吃子与将军应对，消除“白送子/白吃子”的
 *   水平线效应——这是提升棋感最直接的一项。
 * - 走法排序：TT 首选走法 > MVV-LVA 吃子分 > 杀手走法 > 历史启发，让剪枝效率
 *   进一步成倍提升。
 * - 评估：物质 + 位置价值表（红黑对称）+ 过河兵奖励。
 *
 * 走法与合法性判定完全复用 rules.ts 导出的伪走法与就地将军判断，搜索与规则
 * 引擎不会失同步。
 */
import type { GameState, Move, Side } from './types.ts';
export interface XiangqiAiSearchOptions {
    /**
     * 主搜索深度（半回合）。配合 timeMs 使用时表示“最大深度上限”；
     * 单独使用时为固定深度（兼容旧调用方）。默认按模式取 2 或 6。
     */
    readonly depth?: number;
    /**
     * 迭代加深时间预算（毫秒）。提供后引擎在预算内尽量加深；超时返回最近
     * 一层已完整完成的结果，保证有结果且不显著卡顿。未提供则固定深度。
     */
    readonly timeMs?: number;
    /** 返回给调用方的候选数量；默认 5。 */
    readonly limit?: number;
}
export interface XiangqiAiSearchResult {
    readonly move: Move;
    readonly score: number;
}
export interface XiangqiAiSearchSummary {
    readonly turn: Side;
    readonly depth: number;
    readonly nodes: number;
    readonly candidates: readonly XiangqiAiSearchResult[];
}
/**
 * 搜索当前局面的候选走法。结果按引擎分数从高到低排列。
 *
 * 速度策略：
 * - 有 timeMs 时迭代加深：从 depth 1 逐步加深。每层完整搜索所有根走法
 *   后才更新结果；若下一层在预算内无法完成，则整层丢弃，返回最近一层
 *   完整结果（保证“有限时间内必有可靠答案”）。
 * - 无 timeMs 时固定 depth（兼容旧调用方），默认 2。
 */
export declare function findBestMoves(game: GameState, options?: XiangqiAiSearchOptions): XiangqiAiSearchSummary;
//# sourceMappingURL=ai.d.ts.map