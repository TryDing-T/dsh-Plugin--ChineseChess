import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { XIANGQI_COLUMNS, XIANGQI_ROWS } from "./types.js";
import css from './XiangqiPage.module.css';
const SIDE_LABELS = {
    red: '红方',
    black: '黑方',
};
const PIECE_LABELS = {
    red: {
        general: '帅',
        advisor: '仕',
        elephant: '相',
        horse: '马',
        rook: '车',
        cannon: '炮',
        soldier: '兵',
    },
    black: {
        general: '将',
        advisor: '士',
        elephant: '象',
        horse: '马',
        rook: '车',
        cannon: '炮',
        soldier: '卒',
    },
};
const INITIAL_PIECES = {
    red: {
        general: 1,
        advisor: 2,
        elephant: 2,
        horse: 2,
        rook: 2,
        cannon: 2,
        soldier: 5,
    },
    black: {
        general: 1,
        advisor: 2,
        elephant: 2,
        horse: 2,
        rook: 2,
        cannon: 2,
        soldier: 5,
    },
};
function samePosition(left, right) {
    return left !== null
        && right !== null
        && left.row === right.row
        && left.col === right.col;
}
function positionKey(position) {
    return `${position.row}:${position.col}`;
}
function pieceAt(view, position) {
    return view.board[position.row]?.[position.col] ?? null;
}
function pieceLabel(piece) {
    return piece.label ?? PIECE_LABELS[piece.side][piece.kind];
}
function joinClasses(...names) {
    return names.filter(Boolean).join(' ');
}
function isMoveEndpoint(move, position) {
    if (!move)
        return null;
    if (samePosition(move.from, position))
        return 'from';
    if (samePosition(move.to, position))
        return 'to';
    return null;
}
/** 计算双方已被吃掉的棋子 */
function getCapturedPieces(game) {
    const currentCount = {
        red: { general: 0, advisor: 0, elephant: 0, horse: 0, rook: 0, cannon: 0, soldier: 0 },
        black: { general: 0, advisor: 0, elephant: 0, horse: 0, rook: 0, cannon: 0, soldier: 0 },
    };
    for (let r = 0; r < XIANGQI_ROWS; r += 1) {
        for (let c = 0; c < XIANGQI_COLUMNS; c += 1) {
            const piece = game.board[r]?.[c];
            if (piece) {
                currentCount[piece.side][piece.kind] += 1;
            }
        }
    }
    const redLost = [];
    const blackLost = [];
    const kinds = ['rook', 'horse', 'cannon', 'elephant', 'advisor', 'soldier', 'general'];
    for (const kind of kinds) {
        const redDiff = INITIAL_PIECES.red[kind] - currentCount.red[kind];
        for (let i = 0; i < redDiff; i += 1)
            redLost.push(kind);
        const blackDiff = INITIAL_PIECES.black[kind] - currentCount.black[kind];
        for (let i = 0; i < blackDiff; i += 1)
            blackLost.push(kind);
    }
    return { redLost, blackLost };
}
/** 格式化整局棋谱为文本 */
function exportPgn(moves) {
    if (moves.length === 0)
        return '尚未落子';
    const lines = [];
    for (let i = 0; i < moves.length; i += 2) {
        const round = Math.floor(i / 2) + 1;
        const redMove = moves[i] ? `${moves[i].notation}` : '';
        const blackMove = moves[i + 1] ? `  ${moves[i + 1].notation}` : '';
        lines.push(`${round}. ${redMove}${blackMove}`);
    }
    return lines.join('\n');
}
/**
 * 现代新国风 9x10 中国象棋主界面
 */
export function XiangqiPage({ game, onMove, onNewGame, onUndo, onResign }) {
    const [selected, setSelected] = useState(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const moveListEndRef = useRef(null);
    const moveListContainerRef = useRef(null);
    const humanCanMove = game.humanSide === undefined || game.currentTurn === game.humanSide;
    const selectedLegalMoves = selected === null
        ? []
        : game.legalMoves.filter(move => samePosition(move.from, selected));
    // 走法列表实时自动滚动到最新一步
    useEffect(() => {
        if (game.moves.length > 0) {
            if (moveListEndRef.current?.scrollIntoView) {
                moveListEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            else if (moveListContainerRef.current?.scrollTo) {
                moveListContainerRef.current.scrollTo({
                    top: moveListContainerRef.current.scrollHeight,
                    behavior: 'smooth',
                });
            }
        }
    }, [game.moves.length]);
    const invokeAction = (action) => {
        setSelected(null);
        void action();
    };
    const handleCellClick = (position) => {
        if (game.busy === true || game.status !== 'playing' || !humanCanMove)
            return;
        const legalMove = selectedLegalMoves.find(move => samePosition(move.to, position));
        if (selected !== null && legalMove !== undefined) {
            setSelected(null);
            void onMove({ from: legalMove.from, to: legalMove.to });
            return;
        }
        const piece = pieceAt(game, position);
        if (piece?.side === game.currentTurn) {
            setSelected(samePosition(selected, position) ? null : position);
            return;
        }
        setSelected(null);
    };
    const handleCopyNotation = async () => {
        const text = exportPgn(game.moves);
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
            }
            else {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
            setCopySuccess(true);
            setTimeout(() => { setCopySuccess(false); }, 2000);
        }
        catch {
            // ignore
        }
    };
    const { redLost, blackLost } = getCapturedPieces(game);
    const lastMove = game.moves[game.moves.length - 1];
    // 生成 10行 9列 棋盘格
    const boardCells = [];
    for (let row = 0; row < XIANGQI_ROWS; row += 1) {
        for (let col = 0; col < XIANGQI_COLUMNS; col += 1) {
            const position = { row, col };
            const piece = pieceAt(game, position);
            const cellMove = game.lastMove;
            const moveEndpoint = isMoveEndpoint(cellMove, position);
            const cellIsSelected = samePosition(selected, position);
            const cellIsLegal = selectedLegalMoves.some(move => samePosition(move.to, position));
            const isCapturable = cellIsLegal && piece !== null;
            const isCheckingGeneral = game.inCheck && piece !== null && piece.kind === 'general' && piece.side === game.currentTurn;
            const baseCellLabel = piece === null
                ? `第${row + 1}行第${col + 1}列，空位`
                : `第${row + 1}行第${col + 1}列，${SIDE_LABELS[piece.side]}${pieceLabel(piece)}`;
            const cellLabel = `${baseCellLabel}${cellIsLegal ? (isCapturable ? '，可吃子' : '，合法落点') : ''}${cellIsSelected ? '，已选中' : ''}`;
            boardCells.push(_jsx("div", { className: joinClasses(css.cell, cellIsSelected && css.selectedCell, cellIsLegal && css.legalCell, isCapturable && css.capturableCell, moveEndpoint === 'from' && css.lastMoveFromCell, moveEndpoint === 'to' && css.lastMoveToCell), role: "gridcell", "aria-label": cellLabel, "aria-rowindex": row + 1, "aria-colindex": col + 1, children: _jsxs("button", { type: "button", className: css.cellButton, "aria-label": cellLabel, "aria-pressed": cellIsSelected, "data-col": col, "data-row": row, disabled: game.busy === true || game.status !== 'playing' || !humanCanMove, onClick: () => { handleCellClick(position); }, children: [piece !== null && (_jsxs("span", { className: joinClasses(css.piece, cellIsSelected && css.pieceSelected, isCheckingGeneral && css.pieceInCheck), "data-side": piece.side, "data-piece-kind": piece.kind, children: [_jsx("span", { className: css.pieceInnerRing, children: _jsx("span", { className: css.pieceText, children: pieceLabel(piece) }) }), isCheckingGeneral && _jsx("span", { className: css.checkBadge, children: "\u5C06\u519B" })] })), cellIsLegal && !isCapturable && _jsx("span", { className: css.legalDot, "aria-hidden": "true" }), cellIsLegal && isCapturable && (_jsxs("span", { className: css.captureReticle, "aria-hidden": "true", children: [_jsx("span", { className: css.reticleCornerTopLeft }), _jsx("span", { className: css.reticleCornerTopRight }), _jsx("span", { className: css.reticleCornerBottomLeft }), _jsx("span", { className: css.reticleCornerBottomRight })] })), moveEndpoint === 'to' && !cellIsSelected && (_jsx("span", { className: css.lastMoveTargetIndicator, "aria-hidden": "true" }))] }) }, positionKey(position)));
        }
    }
    return (_jsxs("main", { className: css.page, "aria-labelledby": "xiangqi-page-title", children: [_jsxs("header", { className: css.header, children: [_jsxs("div", { className: css.headerMain, children: [_jsxs("div", { className: css.badgeRow, children: [_jsx("span", { className: css.gameTag, children: "DSH \u8C61\u68CB\u5BF9\u5F08" }), _jsx("span", { className: css.versionTag, children: "\u6807\u51C6\u89C4\u5219" })] }), _jsx("h1", { className: css.title, id: "xiangqi-page-title", children: "\u695A\u6C49\u98CE\u4E91 \u00B7 \u8C61\u68CB\u5BF9\u5F08" }), _jsx("p", { className: css.subtitle, children: "\u4E0E DSH AI \u5C55\u5F00\u4E2D\u56FD\u8C61\u68CB\u535A\u5F08\uFF0C\u8FD0\u7B79\u5E37\u5E44\uFF0C\u51B3\u80DC\u5343\u91CC" })] }), _jsxs("div", { className: css.turnCard, "data-side": game.currentTurn, "data-busy": game.busy || undefined, children: [_jsxs("div", { className: css.turnVisual, children: [_jsx("span", { className: css.turnAvatar, "data-side": game.currentTurn, children: game.currentTurn === 'red' ? '帅' : '将' }), _jsx("span", { className: css.turnPulse })] }), _jsxs("div", { className: css.turnDetails, children: [_jsx("span", { className: css.turnStatusBadge, children: game.busy ? 'AI 思考中…' : '落子中' }), _jsx("strong", { className: css.turnPlayer, children: game.currentTurn === 'red' ? '红方（您）' : '黑方（AI）' })] })] })] }), _jsxs("div", { className: css.layout, children: [_jsxs("section", { className: css.boardColumn, "aria-labelledby": "xiangqi-board-title", children: [_jsx("div", { className: css.sectionHeading, children: _jsxs("div", { className: css.playerStrip, children: [_jsxs("div", { className: joinClasses(css.playerCard, game.currentTurn === 'black' && css.playerCardActive), children: [_jsx("span", { className: css.playerPieceIcon, "data-side": "black", children: "\u5C06" }), _jsxs("div", { className: css.playerMeta, children: [_jsx("span", { className: css.playerName, children: "\u9ED1\u65B9 \u00B7 DSH AI" }), _jsxs("div", { className: css.lostPieces, children: [redLost.map((k, i) => (_jsx("span", { className: css.lostPiece, "data-side": "red", title: `吃掉红方 ${PIECE_LABELS.red[k]}`, children: PIECE_LABELS.red[k] }, `redLost-${i}`))), redLost.length === 0 && _jsx("span", { className: css.lostEmpty, children: "\u6682\u65E0\u5931\u5B50" })] })] })] }), _jsx("div", { className: css.vsDivider, children: "VS" }), _jsxs("div", { className: joinClasses(css.playerCard, game.currentTurn === 'red' && css.playerCardActive), children: [_jsx("span", { className: css.playerPieceIcon, "data-side": "red", children: "\u5E05" }), _jsxs("div", { className: css.playerMeta, children: [_jsx("span", { className: css.playerName, children: "\u7EA2\u65B9 \u00B7 \u6267\u7EA2\u5148\u884C\uFF08\u6267\u5B50\uFF09" }), _jsxs("div", { className: css.lostPieces, children: [blackLost.map((k, i) => (_jsx("span", { className: css.lostPiece, "data-side": "black", title: `吃掉黑方 ${PIECE_LABELS.black[k]}`, children: PIECE_LABELS.black[k] }, `blackLost-${i}`))), blackLost.length === 0 && _jsx("span", { className: css.lostEmpty, children: "\u6682\u65E0\u5931\u5B50" })] })] })] })] }) }), _jsxs("div", { className: css.boardSurface, children: [_jsx("div", { className: css.fileLabelsTop, "aria-hidden": "true", children: ['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(n => (_jsx("span", { className: css.coordLabel, children: n }, `top-${n}`))) }), _jsxs("div", { className: css.boardGrid, role: "grid", "aria-label": "\u4E2D\u56FD\u8C61\u68CB\u68CB\u76D8\uFF0C9\u521710\u884C", "aria-rowcount": XIANGQI_ROWS, "aria-colcount": XIANGQI_COLUMNS, children: [_jsxs("svg", { className: css.boardDecorationSvg, viewBox: "0 0 900 1000", preserveAspectRatio: "none", "aria-hidden": "true", children: [_jsxs("defs", { children: [_jsxs("g", { id: "star-mark-full", children: [_jsx("path", { d: "M -14,-4 L -4,-4 L -4,-14", fill: "none", stroke: "currentColor", strokeWidth: "1.5" }), _jsx("path", { d: "M 4,-14 L 4,-4 L 14,-4", fill: "none", stroke: "currentColor", strokeWidth: "1.5" }), _jsx("path", { d: "M -14,4 L -4,4 L -4,14", fill: "none", stroke: "currentColor", strokeWidth: "1.5" }), _jsx("path", { d: "M 4,14 L 4,4 L 14,4", fill: "none", stroke: "currentColor", strokeWidth: "1.5" })] }), _jsxs("g", { id: "star-mark-left", children: [_jsx("path", { d: "M 4,-14 L 4,-4 L 14,-4", fill: "none", stroke: "currentColor", strokeWidth: "1.5" }), _jsx("path", { d: "M 4,14 L 4,4 L 14,4", fill: "none", stroke: "currentColor", strokeWidth: "1.5" })] }), _jsxs("g", { id: "star-mark-right", children: [_jsx("path", { d: "M -14,-4 L -4,-4 L -4,-14", fill: "none", stroke: "currentColor", strokeWidth: "1.5" }), _jsx("path", { d: "M -14,4 L -4,4 L -4,14", fill: "none", stroke: "currentColor", strokeWidth: "1.5" })] })] }), _jsx("line", { x1: "350", y1: "50", x2: "550", y2: "250", stroke: "currentColor", strokeWidth: "1.2", strokeOpacity: "0.75" }), _jsx("line", { x1: "550", y1: "50", x2: "350", y2: "250", stroke: "currentColor", strokeWidth: "1.2", strokeOpacity: "0.75" }), _jsx("line", { x1: "350", y1: "750", x2: "550", y2: "950", stroke: "currentColor", strokeWidth: "1.2", strokeOpacity: "0.75" }), _jsx("line", { x1: "550", y1: "750", x2: "350", y2: "950", stroke: "currentColor", strokeWidth: "1.2", strokeOpacity: "0.75" }), _jsx("use", { href: "#star-mark-full", x: "150", y: "250", opacity: "0.6" }), _jsx("use", { href: "#star-mark-full", x: "750", y: "250", opacity: "0.6" }), _jsx("use", { href: "#star-mark-full", x: "150", y: "750", opacity: "0.6" }), _jsx("use", { href: "#star-mark-full", x: "750", y: "750", opacity: "0.6" }), _jsx("use", { href: "#star-mark-left", x: "50", y: "350", opacity: "0.6" }), _jsx("use", { href: "#star-mark-full", x: "250", y: "350", opacity: "0.6" }), _jsx("use", { href: "#star-mark-full", x: "450", y: "350", opacity: "0.6" }), _jsx("use", { href: "#star-mark-full", x: "650", y: "350", opacity: "0.6" }), _jsx("use", { href: "#star-mark-right", x: "850", y: "350", opacity: "0.6" }), _jsx("use", { href: "#star-mark-left", x: "50", y: "650", opacity: "0.6" }), _jsx("use", { href: "#star-mark-full", x: "250", y: "650", opacity: "0.6" }), _jsx("use", { href: "#star-mark-full", x: "450", y: "650", opacity: "0.6" }), _jsx("use", { href: "#star-mark-full", x: "650", y: "650", opacity: "0.6" }), _jsx("use", { href: "#star-mark-right", x: "850", y: "650", opacity: "0.6" })] }), _jsxs("div", { className: css.riverArea, "aria-hidden": "true", children: [_jsx("span", { className: css.riverTextLeft, children: "\u695A\u3000\u6CB3" }), _jsx("span", { className: css.riverEmblem, children: "\u262F" }), _jsx("span", { className: css.riverTextRight, children: "\u6F22\u3000\u754C" })] }), boardCells] }), _jsx("div", { className: css.fileLabelsBottom, "aria-hidden": "true", children: ['九', '八', '七', '六', '五', '四', '三', '二', '一'].map(n => (_jsx("span", { className: css.coordLabel, children: n }, `bot-${n}`))) })] }), _jsxs("div", { className: css.statusCard, role: "status", "aria-live": "polite", children: [_jsx("div", { className: css.statusIconWrapper, "data-status": game.status, children: game.status === 'playing' ? (_jsx("span", { className: css.statusPulseDot })) : (_jsx("span", { className: css.statusResultIcon, children: "\uD83C\uDFC6" })) }), _jsxs("div", { className: css.statusInfo, children: [_jsx("strong", { className: css.statusHeadline, children: game.statusText }), _jsx("span", { className: css.statusSubtext, children: game.status === 'playing'
                                                    ? (game.inCheck ? '⚠️ 当前将军，请化解危机！' : (humanCanMove ? '请选择己方棋子并点击绿色/红色落点走子' : 'AI 正在计算最佳应手…'))
                                                    : '对局已结束，可点击下方【新局】重新开盘' })] })] })] }), _jsxs("aside", { className: css.sideColumn, "aria-label": "\u68CB\u5C40\u8D70\u6CD5\u4E0E\u64CD\u4F5C", children: [_jsxs("section", { className: css.panel, "aria-labelledby": "xiangqi-moves-title", children: [_jsxs("div", { className: css.panelHeader, children: [_jsxs("div", { className: css.panelTitleGroup, children: [_jsx("h2", { className: css.panelTitle, id: "xiangqi-moves-title", children: "\u5B9E\u65F6\u8D70\u6CD5" }), _jsxs("span", { className: css.moveBadge, children: [game.moves.length, " \u6B65"] })] }), _jsx("button", { type: "button", className: css.copyButton, onClick: handleCopyNotation, disabled: game.moves.length === 0, title: "\u590D\u5236\u6574\u5C40\u4E2D\u6587\u68CB\u8C31", children: copySuccess ? '✓ 已复制' : '复制棋谱' })] }), _jsxs("div", { className: css.latestMoveBar, children: [_jsx("span", { className: css.latestLabel, children: "\u6700\u65B0\u4E00\u624B" }), lastMove ? (_jsxs("span", { className: css.latestValue, "data-side": lastMove.side, children: [_jsx("strong", { children: SIDE_LABELS[lastMove.side] }), " ", lastMove.notation, lastMove.notation.includes('将军') && _jsx("span", { className: css.checkTag, children: "\u26A1\u5C06\u519B" }), lastMove.notation.includes('将死') && _jsx("span", { className: css.mateTag, children: "\uD83D\uDD25\u5C06\u6B7B" })] })) : (_jsx("span", { className: css.latestEmpty, children: "\u5C1A\u672A\u5F00\u59CB\uFF0C\u7B49\u5F85\u7EA2\u65B9\u8D77\u624B" }))] }), _jsxs("ol", { ref: moveListContainerRef, className: css.moveList, "aria-label": "\u8C61\u68CB\u5BF9\u5F08\u8D70\u6CD5\u8BB0\u5F55", children: [game.moves.length === 0 && (_jsxs("li", { className: css.emptyMovesState, children: [_jsx("span", { className: css.emptyMovesIcon, children: "\uD83D\uDCDC" }), _jsx("p", { className: css.emptyMovesTitle, children: "\u68CB\u8C31\u865A\u5E2D\u4EE5\u5F85" }), _jsx("p", { className: css.emptyMovesHint, children: "\u7EA2\u65B9\u5148\u884C\uFF0C\u843D\u5B50\u540E\u6B64\u5904\u5C06\u5B9E\u65F6\u8BB0\u5F55\u6BCF\u6B65\u7740\u6CD5" })] })), Array.from({ length: Math.ceil(game.moves.length / 2) }).map((_, roundIndex) => {
                                                const redMoveIndex = roundIndex * 2;
                                                const blackMoveIndex = redMoveIndex + 1;
                                                const redMove = game.moves[redMoveIndex];
                                                const blackMove = game.moves[blackMoveIndex];
                                                const isLatestRound = blackMove ? blackMoveIndex === game.moves.length - 1 : redMoveIndex === game.moves.length - 1;
                                                return (_jsxs("li", { className: joinClasses(css.roundItem, isLatestRound && css.roundItemLatest), children: [_jsx("span", { className: css.roundIndex, children: String(roundIndex + 1).padStart(2, '0') }), _jsxs("div", { className: joinClasses(css.moveBlock, css.redMoveBlock, redMoveIndex === game.moves.length - 1 && css.moveBlockLatest), children: [_jsx("span", { className: css.moveSideIcon, "data-side": "red", children: "\u7EA2" }), _jsx("span", { className: css.moveNotationText, children: redMove.notation }), redMoveIndex === game.moves.length - 1 && (_jsx("span", { className: css.latestBadge, children: "\u6700\u65B0" }))] }), blackMove ? (_jsxs("div", { className: joinClasses(css.moveBlock, css.blackMoveBlock, blackMoveIndex === game.moves.length - 1 && css.moveBlockLatest), children: [_jsx("span", { className: css.moveSideIcon, "data-side": "black", children: "\u9ED1" }), _jsx("span", { className: css.moveNotationText, children: blackMove.notation }), blackMoveIndex === game.moves.length - 1 && (_jsx("span", { className: css.latestBadge, children: "\u6700\u65B0" }))] })) : (_jsx("div", { className: joinClasses(css.moveBlock, css.pendingMoveBlock), children: _jsx("span", { className: css.pendingDot, children: "\u2026" }) }))] }, `round-${roundIndex + 1}`));
                                            }), _jsx("div", { ref: moveListEndRef, style: { height: '1px' } })] })] }), _jsxs("section", { className: css.panel, "aria-labelledby": "xiangqi-actions-title", children: [_jsx("h2", { className: css.panelTitle, id: "xiangqi-actions-title", children: "\u68CB\u5C40\u64CD\u4F5C" }), _jsxs("div", { className: css.actionsGrid, children: [_jsxs("button", { type: "button", className: css.actionNewGame, disabled: game.busy === true, onClick: () => { invokeAction(onNewGame); }, children: [_jsx("span", { className: css.btnIcon, children: "\uD83D\uDD04" }), _jsx("span", { children: "\u65B0\u5C40" })] }), _jsxs("button", { type: "button", className: css.actionUndo, disabled: game.busy === true || game.moves.length === 0, onClick: () => { invokeAction(onUndo); }, title: "\u64A4\u9500\u4E0A\u4E00\u6B65\u843D\u5B50", children: [_jsx("span", { className: css.btnIcon, children: "\u21A9\uFE0F" }), _jsx("span", { children: "\u6094\u68CB" })] }), _jsxs("button", { type: "button", className: css.actionResign, disabled: game.busy === true || game.status !== 'playing', onClick: () => { invokeAction(onResign); }, title: "\u5411\u5BF9\u65B9\u8BA4\u8F93\u7ED3\u675F\u672C\u5C40", children: [_jsx("span", { className: css.btnIcon, children: "\uD83C\uDFF3\uFE0F" }), _jsx("span", { children: "\u8BA4\u8F93" })] })] })] })] })] })] }));
}
/** Backwards-compatible board name for slot adapters that call the surface a board. */
export const XiangqiBoard = XiangqiPage;
//# sourceMappingURL=XiangqiPage.js.map