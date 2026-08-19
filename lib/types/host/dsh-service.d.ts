/** DSH Host service: per-session Chinese chess state, Remote methods, tool, and projection. */
import { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { XiangqiMoveRequest, XiangqiNewGameRequest, XiangqiResignRequest, XiangqiSerializedState, XiangqiToolArgs, XiangqiToolResult, XiangqiUndoRequest } from './dsh-service-types.ts';
/**
 * Host-side service loaded by the bundle patch. Every Remote method starts
 * with Agent so Typert maps the client SessionId to the exact live agent.
 */
export declare class XiangqiService extends TypertRemoteService {
    static inject: string[];
    private readonly games;
    constructor(ctx: Context);
    /** Start one new game owned by the calling DSH session. */
    newGame(agent: Agent, _request: XiangqiNewGameRequest): XiangqiSerializedState;
    /** Read the requested game, or the session's latest game when omitted. */
    get(agent: Agent, gameId?: string): XiangqiSerializedState;
    /** Apply one revision-fenced move. */
    move(agent: Agent, request: XiangqiMoveRequest): XiangqiSerializedState;
    /** Undo one committed move. */
    undo(agent: Agent, request: XiangqiUndoRequest): XiangqiSerializedState;
    /** Mark one side as resigned. */
    resign(agent: Agent, request: XiangqiResignRequest): XiangqiSerializedState;
    /** Execute the model tool against the exact agent owning the current turn. */
    executeTool(agent: Agent, args: XiangqiToolArgs): XiangqiToolResult;
    private executeParsedTool;
    private gameFor;
}
export default XiangqiService;
//# sourceMappingURL=dsh-service.d.ts.map