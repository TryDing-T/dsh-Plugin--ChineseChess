/** Host-side durable event vocabulary for one Chinese chess session. */
import type { XiangqiChange } from './types.ts';
declare module '@deepseek-ai/dsh-session/types' {
    interface SessionEventMap {
        /** Complete post-mutation game state; projection folding is last-wins. */
        'xiangqi/change': XiangqiChange;
    }
}
export type { XiangqiChange };
//# sourceMappingURL=domain.d.ts.map