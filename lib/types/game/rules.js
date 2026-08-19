import { clonePosition, indexToPosition, parseCoordinate, positionToIndex } from "./coordinates.js";
import { formatChineseMove } from "./notation.js";
import { BOARD_SIZE } from "./types.js";
export class InvalidPositionError extends Error {
    code = 'INVALID_POSITION';
    constructor(message) {
        super(message);
        this.name = 'InvalidPositionError';
    }
}
export class IllegalMoveError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.name = 'IllegalMoveError';
        this.code = code;
    }
}
const RED_BACK_RANK = [
    'rook',
    'horse',
    'elephant',
    'advisor',
    'general',
    'advisor',
    'elephant',
    'horse',
    'rook'
];
const RED_SOLDIER_FILES = [0, 2, 4, 6, 8];
function otherSide(side) {
    return side === 'red' ? 'black' : 'red';
}
function clonePiece(piece) {
    return piece ? { side: piece.side, type: piece.type } : null;
}
function cloneBoard(board) {
    return board.map(clonePiece);
}
function validSide(value) {
    return value === 'red' || value === 'black';
}
function validPieceType(value) {
    return (value === 'general' ||
        value === 'advisor' ||
        value === 'elephant' ||
        value === 'horse' ||
        value === 'rook' ||
        value === 'cannon' ||
        value === 'soldier');
}
function validateBoard(board) {
    if (board.length !== BOARD_SIZE) {
        throw new InvalidPositionError(`棋盘必须正好有 ${BOARD_SIZE} 个格子`);
    }
    let redGeneralCount = 0;
    let blackGeneralCount = 0;
    for (const piece of board) {
        if (piece === null)
            continue;
        if (!validSide(piece.side) || !validPieceType(piece.type)) {
            throw new InvalidPositionError('棋盘包含未知棋子');
        }
        if (piece.type === 'general') {
            if (piece.side === 'red')
                redGeneralCount += 1;
            else
                blackGeneralCount += 1;
        }
    }
    if (redGeneralCount !== 1 || blackGeneralCount !== 1) {
        throw new InvalidPositionError('合法局面必须恰好包含一个红帅和一个黑将');
    }
}
/** 内部和 FEN 解析共用的状态构造器；会重新计算将军和终局状态。 */
export function makeGameState(board, turn, options = {}) {
    validateBoard(board);
    if (!validSide(turn))
        throw new InvalidPositionError(`未知轮次: ${String(turn)}`);
    const halfmoveClock = options.halfmoveClock ?? 0;
    const fullmoveNumber = options.fullmoveNumber ?? 1;
    if (!Number.isInteger(halfmoveClock) || halfmoveClock < 0) {
        throw new InvalidPositionError('半回合计数必须是非负整数');
    }
    if (!Number.isInteger(fullmoveNumber) || fullmoveNumber < 1) {
        throw new InvalidPositionError('全回合计数必须是正整数');
    }
    const copiedHistory = (options.history ?? []).map(cloneMoveRecord);
    const evaluation = evaluateBoard(board, turn);
    return {
        board: cloneBoard(board),
        turn,
        inCheck: evaluation.inCheck,
        status: evaluation.status,
        winner: evaluation.winner,
        halfmoveClock,
        fullmoveNumber,
        history: copiedHistory,
        lastMove: copiedHistory.length > 0 ? copiedHistory[copiedHistory.length - 1] : null
    };
}
export function newGame() {
    const board = Array.from({ length: BOARD_SIZE }, () => null);
    for (let x = 0; x < RED_BACK_RANK.length; x += 1) {
        board[9 * 9 + x] = { side: 'red', type: RED_BACK_RANK[x] };
        board[x] = { side: 'black', type: RED_BACK_RANK[x] };
    }
    board[7 * 9 + 1] = { side: 'red', type: 'cannon' };
    board[7 * 9 + 7] = { side: 'red', type: 'cannon' };
    board[2 * 9 + 1] = { side: 'black', type: 'cannon' };
    board[2 * 9 + 7] = { side: 'black', type: 'cannon' };
    for (const x of RED_SOLDIER_FILES) {
        board[6 * 9 + x] = { side: 'red', type: 'soldier' };
        board[3 * 9 + x] = { side: 'black', type: 'soldier' };
    }
    return makeGameState(board, 'red');
}
export function getPieceAt(game, position) {
    const normalized = parseCoordinate(position);
    return game.board[positionToIndex(normalized)];
}
export function isInCheck(game, side = game.turn) {
    const general = findGeneral(game.board, side);
    if (!general)
        throw new InvalidPositionError(`${side}方缺少将帅`);
    return isSquareAttacked(game.board, general, otherSide(side));
}
export function getLegalMoves(game, from) {
    if (game.status !== 'playing')
        return [];
    const moves = generateLegalMoves(game.board, game.turn);
    if (from === undefined)
        return moves;
    const normalized = parseCoordinate(from);
    return moves.filter(move => move.from.x === normalized.x && move.from.y === normalized.y);
}
export function applyMove(game, input) {
    if (game.status !== 'playing') {
        throw new IllegalMoveError('GAME_OVER', `当前棋局已结束: ${game.status}`);
    }
    const from = parseCoordinate(input.from);
    const to = parseCoordinate(input.to);
    const fromIndex = positionToIndex(from);
    const toIndex = positionToIndex(to);
    const piece = game.board[fromIndex];
    if (!piece) {
        throw new IllegalMoveError('NO_PIECE', `起点没有棋子: ${from.x},${from.y}`);
    }
    if (piece.side !== game.turn) {
        throw new IllegalMoveError('WRONG_TURN', `当前轮到${game.turn === 'red' ? '红' : '黑'}方`);
    }
    const legalMove = generateLegalMoves(game.board, game.turn).find(move => move.from.x === from.x && move.from.y === from.y && move.to.x === to.x && move.to.y === to.y);
    if (!legalMove) {
        throw new IllegalMoveError('ILLEGAL_DESTINATION', `${from.x},${from.y} 到 ${to.x},${to.y} 不是合法走法`);
    }
    const board = cloneBoard(game.board);
    const captured = board[toIndex];
    board[fromIndex] = null;
    board[toIndex] = clonePiece(piece);
    const nextTurn = otherSide(game.turn);
    const evaluation = evaluateBoard(board, nextTurn);
    const record = {
        from: clonePosition(from),
        to: clonePosition(to),
        piece: clonePiece(piece),
        captured: clonePiece(captured),
        notation: formatChineseMove(game, legalMove),
        givesCheck: evaluation.inCheck,
        result: evaluation.status,
        halfmoveClockBefore: game.halfmoveClock,
        fullmoveNumberBefore: game.fullmoveNumber
    };
    return makeGameState(board, nextTurn, {
        halfmoveClock: captured !== null || piece.type === 'soldier' ? 0 : game.halfmoveClock + 1,
        fullmoveNumber: game.turn === 'black' ? game.fullmoveNumber + 1 : game.fullmoveNumber,
        history: [...game.history, record]
    });
}
/** 没有可悔棋时返回 null；否则返回落回上一步后的新状态。 */
export function undo(game) {
    if (game.history.length === 0)
        return null;
    const record = game.history[game.history.length - 1];
    const fromIndex = positionToIndex(record.from);
    const toIndex = positionToIndex(record.to);
    const board = cloneBoard(game.board);
    board[fromIndex] = clonePiece(record.piece);
    board[toIndex] = clonePiece(record.captured);
    return makeGameState(board, otherSide(game.turn), {
        halfmoveClock: record.halfmoveClockBefore,
        fullmoveNumber: record.fullmoveNumberBefore,
        history: game.history.slice(0, -1)
    });
}
export function canUndo(game) {
    return game.history.length > 0;
}
function cloneMoveRecord(record) {
    return {
        from: clonePosition(record.from),
        to: clonePosition(record.to),
        piece: clonePiece(record.piece),
        captured: clonePiece(record.captured),
        notation: record.notation,
        givesCheck: record.givesCheck,
        result: record.result,
        halfmoveClockBefore: record.halfmoveClockBefore,
        fullmoveNumberBefore: record.fullmoveNumberBefore
    };
}
function evaluateBoard(board, turn) {
    const general = findGeneral(board, turn);
    if (!general)
        throw new InvalidPositionError(`${turn}方缺少将帅`);
    const inCheck = isSquareAttacked(board, general, otherSide(turn));
    const hasMove = generateLegalMoves(board, turn).length > 0;
    if (hasMove)
        return { inCheck, status: 'playing', winner: null };
    if (inCheck)
        return { inCheck, status: 'checkmate', winner: otherSide(turn) };
    return { inCheck, status: 'stalemate', winner: null };
}
function generateLegalMoves(board, side) {
    const pseudoMoves = generatePseudoMoves(board, side);
    const legalMoves = [];
    for (const move of pseudoMoves) {
        const nextBoard = applyMoveToBoard(board, move);
        if (!isInCheckOnBoard(nextBoard, side))
            legalMoves.push(move);
    }
    return legalMoves;
}
/**
 * 生成某方的全部伪走法（含把己方将帅置于被将军状态、以及不可取的非法走法）。
 * 导出给 AI 搜索内核，内核会做就地走子 + 单点将军过滤以节省每次克隆整盘的开销，
 * 从而与规则引擎共用同一套走法与判定，避免搜索与规则失同步。
 */
export function generatePseudoMoves(board, side) {
    const moves = [];
    for (let index = 0; index < BOARD_SIZE; index += 1) {
        const piece = board[index];
        if (!piece || piece.side !== side)
            continue;
        const from = indexToPosition(index);
        for (const to of getPseudoTargets(board, from, piece)) {
            const captured = board[positionToIndex(to)];
            if (captured?.side === side)
                continue;
            // 将帅不能作为普通棋子被“吃掉”；将死由无合法着判断。
            if (captured?.type === 'general')
                continue;
            moves.push({
                from: clonePosition(from),
                to: clonePosition(to),
                piece: clonePiece(piece),
                captured: clonePiece(captured)
            });
        }
    }
    return moves;
}
function applyMoveToBoard(board, move) {
    const nextBoard = cloneBoard(board);
    nextBoard[positionToIndex(move.from)] = null;
    nextBoard[positionToIndex(move.to)] = clonePiece(move.piece);
    return nextBoard;
}
function getPseudoTargets(board, from, piece) {
    switch (piece.type) {
        case 'general':
            return getGeneralTargets(from, piece.side);
        case 'advisor':
            return getAdvisorTargets(from, piece.side);
        case 'elephant':
            return getElephantTargets(board, from, piece.side);
        case 'horse':
            return getHorseTargets(board, from);
        case 'rook':
            return getRookTargets(board, from);
        case 'cannon':
            return getCannonTargets(board, from, piece.side);
        case 'soldier':
            return getSoldierTargets(from, piece.side);
    }
}
function getGeneralTargets(from, side) {
    const targets = [];
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const target = { x: from.x + dx, y: from.y + dy };
        if (isInPalace(target, side))
            targets.push(target);
    }
    return targets;
}
function getAdvisorTargets(from, side) {
    const targets = [];
    for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        const target = { x: from.x + dx, y: from.y + dy };
        if (isInPalace(target, side))
            targets.push(target);
    }
    return targets;
}
function getElephantTargets(board, from, side) {
    const targets = [];
    for (const [dx, dy] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) {
        const target = { x: from.x + dx, y: from.y + dy };
        const eye = { x: from.x + dx / 2, y: from.y + dy / 2 };
        if (isInElephantTerritory(target, side) && isEmpty(board, eye))
            targets.push(target);
    }
    return targets;
}
function getHorseTargets(board, from) {
    const targets = [];
    const jumps = [
        [-2, -1, -1, 0],
        [-2, 1, -1, 0],
        [2, -1, 1, 0],
        [2, 1, 1, 0],
        [-1, -2, 0, -1],
        [1, -2, 0, -1],
        [-1, 2, 0, 1],
        [1, 2, 0, 1]
    ];
    for (const [dx, dy, legX, legY] of jumps) {
        const target = { x: from.x + dx, y: from.y + dy };
        const leg = { x: from.x + legX, y: from.y + legY };
        if (isOnBoardSafe(target) && isEmpty(board, leg))
            targets.push(target);
    }
    return targets;
}
function getRookTargets(board, from) {
    return getSlidingTargets(board, from);
}
function getCannonTargets(board, from, side) {
    const targets = [];
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        let x = from.x + dx;
        let y = from.y + dy;
        let hasScreen = false;
        while (isOnBoardSafe({ x, y })) {
            const piece = board[y * 9 + x];
            if (!hasScreen) {
                if (piece === null) {
                    targets.push({ x, y });
                }
                else {
                    hasScreen = true;
                }
            }
            else if (piece !== null) {
                if (piece.side !== side)
                    targets.push({ x, y });
                break;
            }
            x += dx;
            y += dy;
        }
    }
    return targets;
}
function getSlidingTargets(board, from) {
    const targets = [];
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        let x = from.x + dx;
        let y = from.y + dy;
        while (isOnBoardSafe({ x, y })) {
            const piece = board[y * 9 + x];
            if (piece === null) {
                targets.push({ x, y });
            }
            else {
                if (piece.side !== board[positionToIndex(from)]?.side)
                    targets.push({ x, y });
                break;
            }
            x += dx;
            y += dy;
        }
    }
    return targets;
}
function getSoldierTargets(from, side) {
    const targets = [];
    const forward = side === 'red' ? -1 : 1;
    const forwardTarget = { x: from.x, y: from.y + forward };
    if (isOnBoardSafe(forwardTarget))
        targets.push(forwardTarget);
    const crossedRiver = side === 'red' ? from.y <= 4 : from.y >= 5;
    if (crossedRiver) {
        for (const dx of [-1, 1]) {
            const target = { x: from.x + dx, y: from.y };
            if (isOnBoardSafe(target))
                targets.push(target);
        }
    }
    return targets;
}
/**
 * 就地走子后判断某方是否处于被将军状态。
 * 导出给 AI 搜索内核做单点合法性过滤，避免每次全量克隆棋盘。
 */
export function isInCheckOnBoard(board, side) {
    const general = findGeneral(board, side);
    if (!general)
        return true;
    return isSquareAttacked(board, general, otherSide(side));
}
function findGeneral(board, side) {
    for (let index = 0; index < board.length; index += 1) {
        const piece = board[index];
        if (piece?.side === side && piece.type === 'general')
            return indexToPosition(index);
    }
    return null;
}
/** 判断某格是否被 bySide 的一方攻击。 */
function isSquareAttacked(board, target, bySide) {
    for (let index = 0; index < BOARD_SIZE; index += 1) {
        const piece = board[index];
        if (!piece || piece.side !== bySide)
            continue;
        const from = indexToPosition(index);
        if (pieceAttacksSquare(board, from, piece, target))
            return true;
    }
    return false;
}
function pieceAttacksSquare(board, from, piece, target) {
    const dx = target.x - from.x;
    const dy = target.y - from.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    switch (piece.type) {
        case 'general':
            return (absX + absY === 1) || (from.x === target.x && countBetween(board, from, target) === 0);
        case 'advisor':
            return absX === 1 && absY === 1;
        case 'elephant':
            return absX === 2 && absY === 2 && isEmpty(board, { x: from.x + dx / 2, y: from.y + dy / 2 });
        case 'horse': {
            if (!((absX === 2 && absY === 1) || (absX === 1 && absY === 2)))
                return false;
            const leg = absX === 2 ? { x: from.x + dx / 2, y: from.y } : { x: from.x, y: from.y + dy / 2 };
            return isEmpty(board, leg);
        }
        case 'rook':
            return (from.x === target.x || from.y === target.y) && countBetween(board, from, target) === 0;
        case 'cannon': {
            if (from.x !== target.x && from.y !== target.y)
                return false;
            const blockers = countBetween(board, from, target);
            const targetPiece = board[positionToIndex(target)];
            return targetPiece === null ? blockers === 0 : blockers === 1;
        }
        case 'soldier': {
            const forward = piece.side === 'red' ? -1 : 1;
            if (dx === 0 && dy === forward)
                return true;
            const crossedRiver = piece.side === 'red' ? from.y <= 4 : from.y >= 5;
            return crossedRiver && absX === 1 && dy === 0;
        }
    }
}
function countBetween(board, from, target) {
    if (from.x !== target.x && from.y !== target.y)
        return Number.POSITIVE_INFINITY;
    const stepX = Math.sign(target.x - from.x);
    const stepY = Math.sign(target.y - from.y);
    let x = from.x + stepX;
    let y = from.y + stepY;
    let count = 0;
    while (x !== target.x || y !== target.y) {
        if (board[y * 9 + x] !== null)
            count += 1;
        x += stepX;
        y += stepY;
    }
    return count;
}
function isEmpty(board, position) {
    return isOnBoardSafe(position) && board[position.y * 9 + position.x] === null;
}
function isOnBoardSafe(position) {
    return position.x >= 0 && position.x < 9 && position.y >= 0 && position.y < 10;
}
function isInPalace(position, side) {
    if (position.x < 3 || position.x > 5)
        return false;
    return side === 'red' ? position.y >= 7 && position.y <= 9 : position.y >= 0 && position.y <= 2;
}
function isInElephantTerritory(position, side) {
    return side === 'red' ? position.y >= 5 && position.y <= 9 : position.y >= 0 && position.y <= 4;
}
//# sourceMappingURL=rules.js.map