import { formatCoordinate } from "../game/coordinates.js";
import { findBestMoves } from "../game/ai.js";
import { applyMove, getLegalMoves, isInCheck } from "../game/rules.js";
import { toFen } from "../game/serialization.js";
export class XiangqiDecisionProtocolError extends Error {
    code;
    constructor(code, message) {
        super(`xiangqi decision: ${message}`);
        this.name = 'XiangqiDecisionProtocolError';
        this.code = code;
    }
}
const PIECE_SYMBOLS = {
    rook: 'r',
    horse: 'h',
    elephant: 'e',
    advisor: 'a',
    general: 'k',
    cannon: 'c',
    soldier: 'p',
};
const PIECE_VALUES = {
    general: 10_000,
    rook: 900,
    cannon: 450,
    horse: 400,
    elephant: 200,
    advisor: 200,
    soldier: 100,
};
const RESPONSE_FIELDS = new Set([
    'decision_id',
    'position_id',
    'observed',
    'candidate_id',
    'summary',
]);
function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function boardEncodingOf(game) {
    const rows = [];
    for (let y = 0; y < 10; y += 1) {
        let row = '';
        for (let x = 0; x < 9; x += 1) {
            const piece = game.board[y * 9 + x];
            if (piece === null) {
                row += '.';
                continue;
            }
            const symbol = PIECE_SYMBOLS[piece.type];
            row += piece.side === 'black' ? symbol : symbol.toUpperCase();
        }
        rows.push(row);
    }
    return {
        orientation: 'black-top-red-bottom',
        rows,
        symbols: 'rheakcp=black,RHEAKCP=red,.'
    };
}
function generalPosition(game, side) {
    const index = game.board.findIndex(piece => piece?.side === side && piece.type === 'general');
    if (index < 0)
        throw new XiangqiDecisionProtocolError('INVALID_SHAPE', `${side} general is missing`);
    return formatCoordinate({ x: index % 9, y: Math.floor(index / 9) });
}
function ruleFactsOf(game) {
    if (game.turn !== 'black') {
        throw new XiangqiDecisionProtocolError('NOT_BLACK_TURN', 'the frozen position is not black to move');
    }
    return {
        turn: 'black',
        inCheck: isInCheck(game, 'black'),
        legalMoveCount: getLegalMoves(game).length,
        blackGeneral: generalPosition(game, 'black'),
        redGeneral: generalPosition(game, 'red'),
        halfmoveClock: game.halfmoveClock,
        fullmoveNumber: game.fullmoveNumber,
    };
}
function fnv1a64(value) {
    let hash = 0xcbf29ce484222325n;
    for (let index = 0; index < value.length; index += 1) {
        hash ^= BigInt(value.charCodeAt(index));
        hash = BigInt.asUintN(64, hash * 0x100000001b3n);
    }
    return hash.toString(16).padStart(16, '0');
}
function positionIdOf(gameId, revision, game, boardEncoding, ruleFacts) {
    const fingerprint = JSON.stringify({
        gameId,
        revision,
        fen: toFen(game),
        rows: boardEncoding.rows,
        ruleFacts,
    });
    return `pos-${fnv1a64(fingerprint)}`;
}
function candidateOf(entry, game, rank) {
    const next = applyMove(game, entry.move);
    return {
        id: `m${rank}`,
        rank,
        from: formatCoordinate(entry.move.from),
        to: formatCoordinate(entry.move.to),
        score: Number.isFinite(entry.score) ? Math.trunc(entry.score) : 0,
        givesCheck: next.inCheck,
        captures: entry.move.captured !== null,
        escapesCheck: game.inCheck && !isInCheck(next, 'black'),
        materialDelta: entry.move.captured === null ? 0 : PIECE_VALUES[entry.move.captured.type],
    };
}
/** Build one immutable, Host-owned packet. This function never commits a move. */
export function buildXiangqiDecisionPacket(game, identity, decisionId, options = {}) {
    const boardEncoding = boardEncodingOf(game);
    const ruleFacts = ruleFactsOf(game);
    const positionId = positionIdOf(identity.gameId, identity.revision, game, boardEncoding, ruleFacts);
    const summary = findBestMoves(game, {
        timeMs: options.localSearchTimeMs ?? 180,
        depth: options.depth ?? 6,
        limit: Math.min(options.limit ?? 5, 5),
    });
    const candidates = summary.candidates.map((entry, index) => candidateOf(entry, game, index + 1)).slice(0, 5);
    return {
        protocol: 'xiangqi-decision/v1',
        decisionId,
        positionId,
        gameId: identity.gameId,
        revision: identity.revision,
        side: 'black',
        fen: toFen(game),
        boardEncoding,
        lastMove: identity.lastMove === undefined ? null : { ...identity.lastMove },
        ruleFacts,
        candidates,
    };
}
function responseObject(raw) {
    if (isRecord(raw) && raw.arguments !== undefined)
        return responseObject(raw.arguments);
    if (isRecord(raw) && raw.output !== undefined)
        return responseObject(raw.output);
    if (isRecord(raw) && Array.isArray(raw.content)) {
        const text = raw.content
            .filter((item) => isRecord(item) && item.type === 'text' && typeof item.text === 'string')
            .map(item => item.text)
            .join('');
        if (text.length > 0)
            return responseObject(text);
    }
    if (typeof raw !== 'string')
        return raw;
    let text = raw.trim();
    const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/i.exec(text);
    if (fenced !== null)
        text = fenced[1];
    try {
        return JSON.parse(text);
    }
    catch {
        throw new XiangqiDecisionProtocolError('INVALID_JSON', 'model output is not one JSON object');
    }
}
function requiredString(record, field) {
    const value = record[field];
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new XiangqiDecisionProtocolError('INVALID_SHAPE', `${field} must be a non-empty string`);
    }
    return value.trim();
}
/** Parse and enforce the minimal snake_case response contract. */
export function parseXiangqiDecisionResponse(raw, packet) {
    const value = responseObject(raw);
    if (!isRecord(value)) {
        throw new XiangqiDecisionProtocolError('INVALID_SHAPE', 'model output must be a JSON object');
    }
    for (const key of Object.keys(value)) {
        if (!RESPONSE_FIELDS.has(key)) {
            throw new XiangqiDecisionProtocolError('UNKNOWN_FIELD', `field ${key} is not allowed`);
        }
    }
    const decisionId = requiredString(value, 'decision_id');
    const positionId = requiredString(value, 'position_id');
    const observedValue = value.observed;
    if (!isRecord(observedValue)) {
        throw new XiangqiDecisionProtocolError('INVALID_SHAPE', 'observed must be an object');
    }
    for (const key of Object.keys(observedValue)) {
        if (!new Set(['side', 'in_check', 'black_general', 'red_general']).has(key)) {
            throw new XiangqiDecisionProtocolError('UNKNOWN_FIELD', `observed field ${key} is not allowed`);
        }
    }
    const observedSide = requiredString(observedValue, 'side');
    const observedInCheck = observedValue.in_check;
    const blackGeneral = requiredString(observedValue, 'black_general');
    const redGeneral = requiredString(observedValue, 'red_general');
    const candidateId = requiredString(value, 'candidate_id');
    if (decisionId !== packet.decisionId || positionId !== packet.positionId) {
        throw new XiangqiDecisionProtocolError('POSITION_MISMATCH', 'decision_id or position_id does not match the frozen packet');
    }
    if (observedSide !== packet.ruleFacts.turn
        || typeof observedInCheck !== 'boolean'
        || observedInCheck !== packet.ruleFacts.inCheck
        || blackGeneral !== packet.ruleFacts.blackGeneral
        || redGeneral !== packet.ruleFacts.redGeneral) {
        throw new XiangqiDecisionProtocolError('OBSERVATION_MISMATCH', 'model observations do not match the frozen rule facts');
    }
    if (!packet.candidates.some(candidate => candidate.id === candidateId)) {
        throw new XiangqiDecisionProtocolError('UNKNOWN_CANDIDATE', `candidate ${candidateId} is not in the frozen top five`);
    }
    const summary = value.summary;
    if (summary !== undefined && (typeof summary !== 'string' || summary.includes('\n') || summary.length > 160)) {
        throw new XiangqiDecisionProtocolError('INVALID_SHAPE', 'summary must be one short line');
    }
    return {
        decision_id: decisionId,
        position_id: positionId,
        observed: {
            side: 'black',
            in_check: observedInCheck,
            black_general: blackGeneral,
            red_general: redGeneral,
        },
        candidate_id: candidateId,
        ...summary === undefined ? {} : { summary },
    };
}
function sameFacts(left, right) {
    return left.turn === right.turn
        && left.inCheck === right.inCheck
        && left.legalMoveCount === right.legalMoveCount
        && left.blackGeneral === right.blackGeneral
        && left.redGeneral === right.redGeneral
        && left.halfmoveClock === right.halfmoveClock
        && left.fullmoveNumber === right.fullmoveNumber;
}
/** Recheck the frozen decision against the latest Host state immediately before commit. */
export function validateXiangqiDecisionForCurrentState(packet, response, current) {
    if (current.gameId !== packet.gameId || current.revision !== packet.revision) {
        throw new XiangqiDecisionProtocolError('POSITION_MISMATCH', 'gameId or revision changed while the model was thinking');
    }
    if (current.game.turn !== 'black') {
        throw new XiangqiDecisionProtocolError('NOT_BLACK_TURN', 'the current position is no longer black to move');
    }
    const boardEncoding = boardEncodingOf(current.game);
    const facts = ruleFactsOf(current.game);
    const positionId = positionIdOf(current.gameId, current.revision, current.game, boardEncoding, facts);
    if (positionId !== packet.positionId || toFen(current.game) !== packet.fen || !sameFacts(facts, packet.ruleFacts)) {
        throw new XiangqiDecisionProtocolError('POSITION_MISMATCH', 'the current Host position differs from the frozen packet');
    }
    if (response.position_id !== packet.positionId || response.decision_id !== packet.decisionId) {
        throw new XiangqiDecisionProtocolError('POSITION_MISMATCH', 'model response is not for the current decision');
    }
    if (response.observed.side !== facts.turn
        || response.observed.in_check !== facts.inCheck
        || response.observed.black_general !== facts.blackGeneral
        || response.observed.red_general !== facts.redGeneral) {
        throw new XiangqiDecisionProtocolError('OBSERVATION_MISMATCH', 'model response facts are stale');
    }
    const candidate = packet.candidates.find(item => item.id === response.candidate_id);
    if (candidate === undefined) {
        throw new XiangqiDecisionProtocolError('UNKNOWN_CANDIDATE', `candidate ${response.candidate_id} is not frozen`);
    }
    const legal = getLegalMoves(current.game).some(move => formatCoordinate(move.from) === candidate.from && formatCoordinate(move.to) === candidate.to);
    if (!legal) {
        throw new XiangqiDecisionProtocolError('ILLEGAL_CANDIDATE', `candidate ${candidate.id} is no longer legal`);
    }
    return { from: candidate.from, to: candidate.to };
}
//# sourceMappingURL=decision.js.map