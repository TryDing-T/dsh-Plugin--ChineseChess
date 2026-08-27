import type { XiangqiChangeListener, XiangqiDecisionMeta, XiangqiGameFactory, XiangqiHostServiceOptions, XiangqiMove, XiangqiMoveRequest, XiangqiNewGameRequest, XiangqiResignRequest, XiangqiSerializedState, XiangqiUndoRequest } from './types.ts';
export type XiangqiErrorCode = 'INVALID_INPUT' | 'GAME_NOT_FOUND' | 'GAME_NOT_CURRENT' | 'STALE_REVISION' | 'GAME_NOT_ACTIVE' | 'NO_UNDO' | 'INVALID_MOVE' | 'GAME_CREATE' | 'GAME_RESTORE' | 'GAME_SERIALIZE' | 'GAME_RULE' | 'INVALID_DECISION';
/** All command-layer failures have the stable `xiangqi:` prefix. */
export declare class XiangqiError extends Error {
    readonly code: XiangqiErrorCode;
    constructor(code: XiangqiErrorCode, message: string);
}
/**
 * 写操作防串局守卫（审查问题 2）：任何针对非当前全局棋局的写请求一律拒绝。
 * 没有它，旧棋局的延迟/重复请求会把自己的 gameId 重新发布成"当前棋局"，
 * 让新开的棋局被旧局面覆盖。
 */
export declare function assertCurrentGame(currentGameId: string | undefined, requestedGameId: string): void;
/**
 * Host-owned command service for one or more DSH/session chess games.
 *
 * It owns lifecycle, revision checks, transactional restore-before-commit,
 * undo history, and publication. Rules remain in the injected src/game port.
 */
export declare class XiangqiHostService {
    private readonly factory;
    private readonly games;
    private readonly listeners;
    private readonly createGameId;
    constructor(factory: XiangqiGameFactory, options?: XiangqiHostServiceOptions);
    /** Create and publish a new active game. */
    newGame(request?: XiangqiNewGameRequest): XiangqiSerializedState;
    /** Read a defensive copy of a current game state. */
    get(gameId: string): XiangqiSerializedState;
    /**
     * Restore one projected game after a Host restart.
     *
     * The core snapshot already contains its own move history, so the restored
     * game can continue and can be inspected. Host-side undo history is rebuilt
     * only for mutations made after this restore boundary.
     */
    restore(state: XiangqiSerializedState): void;
    /** Apply one move against an exact revision and publish only after commit. */
    move(request: XiangqiMoveRequest): XiangqiSerializedState;
    /** Apply a previously validated DSH decision against the same revision fence. */
    moveWithDecision(request: XiangqiMoveRequest, decision: {
        readonly move: XiangqiMove;
        readonly meta: XiangqiDecisionMeta;
    }): XiangqiSerializedState;
    private commitMove;
    /** Restore the last committed position against an exact revision. */
    undo(request: XiangqiUndoRequest): XiangqiSerializedState;
    /** Mark one side as resigned and publish the committed result. */
    resign(request: XiangqiResignRequest): XiangqiSerializedState;
    /** Subscribe to committed state changes. The returned disposer is idempotent. */
    subscribe(listener: XiangqiChangeListener): () => void;
    /**
     * Drop every game record except the named one and report how many were
     * removed. Called after a new game becomes current so stale games can never
     * be mutated back into existence.
     */
    retainOnly(gameId: string): number;
    private serialize;
    private requireGame;
    private assertRevision;
    private assertActive;
    private serializeRecord;
    private snapshot;
    private historyEntry;
    private commitAndPublish;
}
//# sourceMappingURL=service.d.ts.map