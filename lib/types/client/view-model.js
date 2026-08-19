/** Convert the Host's authoritative JSON snapshot into the board view model. */
import { formatCoordinate } from "../game/coordinates.js";
import { formatMoveRecord, getPieceLabel } from "../game/notation.js";
import { getLegalMoves } from "../game/rules.js";
import { deserialize } from "../game/serialization.js";
function positionOf(position) {
    return { row: position.y, col: position.x };
}
function moveOf(move) {
    return { from: positionOf(move.from), to: positionOf(move.to) };
}
function pieceOf(game, x, y) {
    const piece = game.board[y * 9 + x];
    if (piece === null)
        return null;
    return {
        id: `${piece.side}-${piece.type}-${x}-${y}`,
        side: piece.side,
        kind: piece.type,
        label: getPieceLabel(piece),
    };
}
function statusOf(state, game) {
    if (state.phase === 'resigned')
        return 'resigned';
    if (game.status === 'checkmate')
        return game.winner === 'red' ? 'red-won' : 'black-won';
    if (game.status === 'stalemate')
        return 'draw';
    return 'playing';
}
function sideLabel(side) {
    return side === 'red' ? '红方' : '黑方';
}
function statusTextOf(state, game, status, humanSide, busy) {
    if (busy && status === 'playing' && game.turn !== humanSide)
        return 'AI 正在计算下一步';
    if (status === 'resigned')
        return `${sideLabel(state.winner ?? 'red')}获胜（对方认输）`;
    if (status === 'red-won' || status === 'black-won') {
        return `${status === 'red-won' ? '红方' : '黑方'}将死，${status === 'red-won' ? '红方' : '黑方'}获胜`;
    }
    if (status === 'draw')
        return '无子可走，和棋';
    if (game.inCheck)
        return `${sideLabel(game.turn)}被将军，轮到${sideLabel(game.turn)}应对`;
    return `轮到${sideLabel(game.turn)}落子`;
}
function moveRecords(game) {
    return game.history.map(record => ({
        ...moveOf(record),
        side: record.piece.side,
        notation: formatMoveRecord(record),
        ...record.captured === null ? {} : { captured: record.captured.type },
    }));
}
/**
 * Project one Host snapshot. The client uses the pure core only to format the
 * already committed state and legal destinations; move acceptance remains a
 * revision-fenced Host operation.
 */
export function toXiangqiGameViewModel(state, options = {}) {
    const game = deserialize(JSON.stringify(state.gameState));
    const humanSide = options.humanSide ?? 'red';
    const busy = options.busy ?? false;
    const status = statusOf(state, game);
    const board = Array.from({ length: 10 }, (_row, y) => (Array.from({ length: 9 }, (_column, x) => pieceOf(game, x, y))));
    const legalMoves = getLegalMoves(game).map(moveOf);
    const lastMove = game.lastMove === null ? undefined : moveOf(game.lastMove);
    return {
        board,
        currentTurn: game.turn,
        humanSide,
        legalMoves,
        moves: moveRecords(game),
        status,
        statusText: statusTextOf(state, game, status, humanSide, busy),
        inCheck: game.inCheck,
        ...lastMove === undefined ? {} : { lastMove },
        busy,
    };
}
/** Read the current turn without duplicating the board projection. */
export function turnOf(state) {
    return deserialize(JSON.stringify(state.gameState)).turn;
}
/** Convert a visible row/column pair into the Host's canonical UCCI coordinate. */
export function ucciOf(position) {
    return formatCoordinate({ x: position.col, y: position.row });
}
//# sourceMappingURL=view-model.js.map