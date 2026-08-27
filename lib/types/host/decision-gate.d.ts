/**
 * 卸载安全闸门（审查第二轮 P0）：跟踪唯一在跑的黑方决策。
 * 插件卸载/HMR 重载时 destroy() 后：新决策不能开始，旧结果不能提交，
 * 取消动作不再有目标——所有路径都可单测，不依赖 cordis 运行时。
 */
export declare class XiangqiDecisionGate {
    private destroyed;
    private activeId;
    /** 服务是否已进入卸载流程。 */
    get isDestroyed(): boolean;
    /** 当前被认可的活动决策 id；没有则为 undefined。 */
    get currentDecisionId(): string | undefined;
    /** 尝试开始一条新决策；已销毁或已有活动决策时拒绝。 */
    begin(decisionId: string): boolean;
    /**
     * 提交闸门：只有"未销毁且该决策仍是活动者"才允许把模型结果落子。
     * 卸载后返回的旧结果在这里被拦下。
     */
    canCommit(decisionId: string): boolean;
    /** 决策终态后清除活动标记；返回该决策此前是否确实是活动者。 */
    settle(decisionId: string): boolean;
    /** 取消当前活动决策；返回被取消的 decisionId 或 undefined。 */
    cancel(): string | undefined;
    /** 卸载：此后 begin/canCommit 永远失败。不可逆。 */
    destroy(): void;
}
//# sourceMappingURL=decision-gate.d.ts.map