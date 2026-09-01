/** Host-side durable event vocabulary for one Chinese chess session. */
import type { XiangqiChange } from './types.ts';
/**
 * The persistence catalog is generated inside dsh-session and does not
 * have a runtime registration API for events contributed by an external
 * plugin. 0.1.2 官方已明确否决"事件名注册"机制（无法判定缺失该事件是否
 * 安全），兼容机制只有事件信封 `ignorable: true`；`KNOWN_SESSION_EVENT_TYPES`
 * 在 0.1.2 的类型面已声明为 `ReadonlySet<string>`。
 *
 * 0.1.17 起本插件不再写入 `xiangqi/change`，这里仅对 ≤0.1.16 时代遗留的
 * 历史会话执行"尽力而为"的目录补充（运行时仍是可变 Set）：失败不影响
 * 插件任何功能，未来若 dsh-session 将其运行时冻结，此调用自然失效并被吞掉。
 */
export declare function registerXiangqiSessionEventType(): void;
declare module '@deepseek-ai/dsh-session/types' {
    interface SessionEventMap {
        /** Complete post-mutation game state; projection folding is last-wins. */
        'xiangqi/change': XiangqiChange;
    }
}
export type { XiangqiChange };
//# sourceMappingURL=domain.d.ts.map