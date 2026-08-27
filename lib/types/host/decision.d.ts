import type { GameState } from '../game/types.ts';
import type { XiangqiDecisionPacket, XiangqiDecisionResponse, XiangqiMove } from '../types.ts';
export type XiangqiDecisionProtocolErrorCode = 'INVALID_JSON' | 'INVALID_SHAPE' | 'UNKNOWN_FIELD' | 'POSITION_MISMATCH' | 'OBSERVATION_MISMATCH' | 'UNKNOWN_CANDIDATE' | 'ILLEGAL_CANDIDATE' | 'NOT_BLACK_TURN';
export declare class XiangqiDecisionProtocolError extends Error {
    readonly code: XiangqiDecisionProtocolErrorCode;
    constructor(code: XiangqiDecisionProtocolErrorCode, message: string);
}
export interface XiangqiDecisionBuildOptions {
    readonly localSearchTimeMs?: number;
    readonly depth?: number;
    readonly limit?: number;
}
export interface XiangqiDecisionIdentity {
    readonly gameId: string;
    readonly revision: number;
    readonly lastMove?: XiangqiMove;
}
export interface XiangqiDecisionValidationContext {
    readonly gameId: string;
    readonly revision: number;
    readonly game: GameState;
}
/** Build one immutable, Host-owned packet. This function never commits a move. */
export declare function buildXiangqiDecisionPacket(game: GameState, identity: XiangqiDecisionIdentity, decisionId: string, options?: XiangqiDecisionBuildOptions): XiangqiDecisionPacket;
/** Parse and enforce the minimal snake_case response contract. */
export declare function parseXiangqiDecisionResponse(raw: unknown, packet: XiangqiDecisionPacket): XiangqiDecisionResponse;
/** Recheck the frozen decision against the latest Host state immediately before commit. */
export declare function validateXiangqiDecisionForCurrentState(packet: XiangqiDecisionPacket, response: XiangqiDecisionResponse, current: XiangqiDecisionValidationContext): XiangqiMove;
//# sourceMappingURL=decision.d.ts.map