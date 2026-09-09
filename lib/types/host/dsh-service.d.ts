/** DSH Host service: one in-memory global Chinese chess state. */
import { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { XiangqiAiTurnRequest, XiangqiAiTurnResult, XiangqiDecisionTrace, XiangqiRuntimeState } from '../types.ts';
import type { XiangqiMoveRequest, XiangqiNewGameRequest, XiangqiResignRequest, XiangqiSerializedState, XiangqiUndoRequest } from './dsh-service-types.ts';
/**
 * Host-side service loaded by the bundle patch. Every Remote method starts
 * with Agent so Typert maps the client SessionId to the exact live agent.
 */
export declare class XiangqiService extends TypertRemoteService {
    static inject: string[];
    private readonly gate;
    private readonly game;
    private readonly decisions;
    constructor(ctx: Context);
    /** 卸载闸门：销毁后所有写路径与模型结果提交都被拒绝。 */
    private destroy;
    /**
     * 原子读取 Host 运行状态（审查第二轮 P1）：任意标签页一次调用即可拿到
     * 当前棋局、"Host 是否真的有决策在跑"与决策追踪，不再依赖本页面自己
     * 发起的请求来猜测全局状态。
     */
    getRuntimeState(agent: Agent): XiangqiRuntimeState;
    /** Start one new global game; switching chats never creates one implicitly. */
    newGame(agent: Agent, _request: XiangqiNewGameRequest): XiangqiSerializedState;
    /**
     * Read the one process-global game. The first read creates the initial game
     * when this DSH Host has no game yet; switching chats only reads this same
     * game and never creates another one.
     */
    get(agent: Agent, gameId?: string): XiangqiSerializedState;
    /** Read the latest non-durable DSH decision trace for the process-global game. */
    getDecisionTrace(agent: Agent, gameId?: string): XiangqiDecisionTrace | null;
    /** Apply one revision-fenced move. */
    move(agent: Agent, request: XiangqiMoveRequest): XiangqiSerializedState;
    /** Undo one committed move. */
    undo(agent: Agent, request: XiangqiUndoRequest): XiangqiSerializedState;
    /** Mark one side as resigned. */
    resign(agent: Agent, request: XiangqiResignRequest): XiangqiSerializedState;
    /** Cancel the in-flight lightweight DSH decision without changing the game revision. */
    cancelAiMove(agent: Agent): {
        readonly cancelled: boolean;
    };
    /** Ask the selected DSH model for one frozen-candidate decision, then commit it. */
    requestAiMove(agent: Agent, request: XiangqiAiTurnRequest): Promise<XiangqiAiTurnResult>;
    private gameFor;
    private assertLiveAgent;
    private failedAiMove;
    private startDecisionTrace;
    private updateDecisionTrace;
    private observeDecisionChunk;
    private snapshotDecisionTrace;
    /** Resolve the decision route from an explicit override or the session snapshot. */
    private resolveDecisionRoute;
    private obtainDecision;
    private streamDecision;
    private cancelPending;
}
export default XiangqiService;
//# sourceMappingURL=dsh-service.d.ts.map