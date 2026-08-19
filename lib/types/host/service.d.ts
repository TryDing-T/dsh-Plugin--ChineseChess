import type { XiangqiChangeListener, XiangqiGameFactory, XiangqiHostServiceOptions, XiangqiMoveRequest, XiangqiNewGameRequest, XiangqiResignRequest, XiangqiSerializedState, XiangqiUndoRequest } from './types.ts';
export type XiangqiErrorCode = 'INVALID_INPUT' | 'GAME_NOT_FOUND' | 'STALE_REVISION' | 'GAME_NOT_ACTIVE' | 'NO_UNDO' | 'INVALID_MOVE' | 'GAME_CREATE' | 'GAME_RESTORE' | 'GAME_SERIALIZE' | 'GAME_RULE';
/** All command-layer failures have the stable `xiangqi:` prefix. */
export declare class XiangqiError extends Error {
    readonly code: XiangqiErrorCode;
    constructor(code: XiangqiErrorCode, message: string);
}
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
    /** Restore the last committed position against an exact revision. */
    undo(request: XiangqiUndoRequest): XiangqiSerializedState;
    /** Mark one side as resigned and publish the committed result. */
    resign(request: XiangqiResignRequest): XiangqiSerializedState;
    /** Subscribe to committed state changes. The returned disposer is idempotent. */
    subscribe(listener: XiangqiChangeListener): () => void;
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