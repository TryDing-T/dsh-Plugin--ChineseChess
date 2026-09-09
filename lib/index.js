import { BlockAssembler, ReasoningEffortId, createUserMessage } from "@deepseek-ai/dsh-llm";
import { deepFreeze } from "@deepseek-ai/dsh-util-values";
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
//#region lib/types/game/coordinates.js
const FILES = "abcdefghi";
function isOnBoard(position) {
	return Number.isInteger(position.x) && Number.isInteger(position.y) && position.x >= 0 && position.x < 9 && position.y >= 0 && position.y < 10;
}
function assertPosition(position) {
	if (!isOnBoard(position)) throw new RangeError(`棋盘坐标越界: (${position.x},${position.y})`);
	return {
		x: position.x,
		y: position.y
	};
}
function positionToIndex(position) {
	assertPosition(position);
	return position.y * 9 + position.x;
}
function indexToPosition(index) {
	if (!Number.isInteger(index) || index < 0 || index >= 90) throw new RangeError(`棋盘索引越界: ${index}`);
	return {
		x: index % 9,
		y: Math.floor(index / 9)
	};
}
/**
* 将内部坐标转成 UCCI/PEN 风格的两字符坐标。
* 例如红帅初始位置为 e0，黑将初始位置为 e9。
*/
function formatCoordinate(position) {
	assertPosition(position);
	return `${FILES[position.x]}${9 - position.y}`;
}
/** 支持 a9..i0，也支持用于 UI 调试的“x,y”形式。 */
function parseCoordinate(value) {
	if (typeof value !== "string") return assertPosition(value);
	const text = value.trim().toLowerCase();
	const coordinate = /^([a-i])([0-9])$/.exec(text);
	if (coordinate) return {
		x: FILES.indexOf(coordinate[1]),
		y: 9 - Number(coordinate[2])
	};
	const pair = /^(\d)\s*,\s*(\d)$/.exec(text);
	if (pair) return assertPosition({
		x: Number(pair[1]),
		y: Number(pair[2])
	});
	throw new TypeError(`无法解析棋盘坐标“${value}”，应为 a9..i0 或 x,y`);
}
function clonePosition(position) {
	return {
		x: position.x,
		y: position.y
	};
}
//#endregion
//#region lib/types/game/notation.js
const CHINESE_NUMBERS = [
	"一",
	"二",
	"三",
	"四",
	"五",
	"六",
	"七",
	"八",
	"九"
];
function pieceLabel(piece) {
	if (piece.type === "general") return piece.side === "red" ? "帅" : "将";
	if (piece.type === "advisor") return piece.side === "red" ? "仕" : "士";
	if (piece.type === "elephant") return piece.side === "red" ? "相" : "象";
	if (piece.type === "horse") return "马";
	if (piece.type === "rook") return "车";
	if (piece.type === "cannon") return "炮";
	return piece.side === "red" ? "兵" : "卒";
}
function fileNumber(side, x) {
	const number = side === "red" ? 9 - x : x + 1;
	return CHINESE_NUMBERS[number - 1];
}
function forwardDistance(from, to) {
	return Math.abs(to.y - from.y);
}
function isForward(side, from, to) {
	return side === "red" ? to.y < from.y : to.y > from.y;
}
function samePiece(left, right) {
	return left !== null && left.side === right.side && left.type === right.type;
}
function frontRank(side, position) {
	return side === "red" ? position.y : -position.y;
}
function sourcePrefix(game, move) {
	const sameFilePieces = [];
	for (let index = 0; index < game.board.length; index += 1) {
		const piece = game.board[index];
		if (!samePiece(piece, move.piece)) continue;
		const position = {
			x: index % 9,
			y: Math.floor(index / 9)
		};
		if (position.x === move.from.x) sameFilePieces.push({
			position,
			piece
		});
	}
	if (sameFilePieces.length <= 1) return fileNumber(move.piece.side, move.from.x);
	sameFilePieces.sort((left, right) => frontRank(move.piece.side, left.position) - frontRank(move.piece.side, right.position));
	const index = sameFilePieces.findIndex((item) => item.position.y === move.from.y);
	if (index === 0) return "前";
	if (index === sameFilePieces.length - 1) return "后";
	return "中";
}
/**
* 格式化一手中文棋谱。
* 这是常用的红方视角文件编号：红方右侧为“一”，黑方从黑方视角计算文件号。
*/
function formatChineseMove(game, input) {
	const from = parseCoordinate(input.from);
	const to = parseCoordinate(input.to);
	const piece = game.board[from.y * 9 + from.x];
	if (!piece) throw new Error(`起点没有棋子: ${from.x},${from.y}`);
	const prefix = sourcePrefix(game, {
		from: clonePosition(from),
		to: clonePosition(to),
		piece,
		captured: game.board[to.y * 9 + to.x]
	});
	let action;
	let destination;
	if (from.y === to.y) {
		action = "平";
		destination = fileNumber(piece.side, to.x);
	} else if (from.x === to.x) {
		action = isForward(piece.side, from, to) ? "进" : "退";
		destination = CHINESE_NUMBERS[forwardDistance(from, to) - 1];
	} else {
		action = isForward(piece.side, from, to) ? "进" : "退";
		destination = fileNumber(piece.side, to.x);
	}
	return `${pieceLabel(piece)}${prefix}${action}${destination}`;
}
//#endregion
//#region lib/types/game/rules.js
var InvalidPositionError = class extends Error {
	code = "INVALID_POSITION";
	constructor(message) {
		super(message);
		this.name = "InvalidPositionError";
	}
};
var IllegalMoveError = class extends Error {
	code;
	constructor(code, message) {
		super(message);
		this.name = "IllegalMoveError";
		this.code = code;
	}
};
const RED_BACK_RANK = [
	"rook",
	"horse",
	"elephant",
	"advisor",
	"general",
	"advisor",
	"elephant",
	"horse",
	"rook"
];
const RED_SOLDIER_FILES = [
	0,
	2,
	4,
	6,
	8
];
function otherSide$2(side) {
	return side === "red" ? "black" : "red";
}
function clonePiece(piece) {
	return piece ? {
		side: piece.side,
		type: piece.type
	} : null;
}
function cloneBoard(board) {
	return board.map(clonePiece);
}
function validSide(value) {
	return value === "red" || value === "black";
}
function validPieceType(value) {
	return value === "general" || value === "advisor" || value === "elephant" || value === "horse" || value === "rook" || value === "cannon" || value === "soldier";
}
function validateBoard(board) {
	if (board.length !== 90) throw new InvalidPositionError(`棋盘必须正好有 90 个格子`);
	let redGeneralCount = 0;
	let blackGeneralCount = 0;
	for (const piece of board) {
		if (piece === null) continue;
		if (!validSide(piece.side) || !validPieceType(piece.type)) throw new InvalidPositionError("棋盘包含未知棋子");
		if (piece.type === "general") {
			if (piece.side === "red") redGeneralCount += 1;
			else blackGeneralCount += 1;
		}
	}
	if (redGeneralCount !== 1 || blackGeneralCount !== 1) throw new InvalidPositionError("合法局面必须恰好包含一个红帅和一个黑将");
}
/** 内部和 FEN 解析共用的状态构造器；会重新计算将军和终局状态。 */
function makeGameState(board, turn, options = {}) {
	validateBoard(board);
	if (!validSide(turn)) throw new InvalidPositionError(`未知轮次: ${String(turn)}`);
	const halfmoveClock = options.halfmoveClock ?? 0;
	const fullmoveNumber = options.fullmoveNumber ?? 1;
	if (!Number.isInteger(halfmoveClock) || halfmoveClock < 0) throw new InvalidPositionError("半回合计数必须是非负整数");
	if (!Number.isInteger(fullmoveNumber) || fullmoveNumber < 1) throw new InvalidPositionError("全回合计数必须是正整数");
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
function newGame() {
	const board = Array.from({ length: 90 }, () => null);
	for (let x = 0; x < RED_BACK_RANK.length; x += 1) {
		board[81 + x] = {
			side: "red",
			type: RED_BACK_RANK[x]
		};
		board[x] = {
			side: "black",
			type: RED_BACK_RANK[x]
		};
	}
	board[64] = {
		side: "red",
		type: "cannon"
	};
	board[70] = {
		side: "red",
		type: "cannon"
	};
	board[19] = {
		side: "black",
		type: "cannon"
	};
	board[25] = {
		side: "black",
		type: "cannon"
	};
	for (const x of RED_SOLDIER_FILES) {
		board[54 + x] = {
			side: "red",
			type: "soldier"
		};
		board[27 + x] = {
			side: "black",
			type: "soldier"
		};
	}
	return makeGameState(board, "red");
}
function isInCheck(game, side = game.turn) {
	const general = findGeneral(game.board, side);
	if (!general) throw new InvalidPositionError(`${side}方缺少将帅`);
	return isSquareAttacked(game.board, general, otherSide$2(side));
}
function getLegalMoves(game, from) {
	if (game.status !== "playing") return [];
	const moves = generateLegalMoves(game.board, game.turn);
	if (from === void 0) return moves;
	const normalized = parseCoordinate(from);
	return moves.filter((move) => move.from.x === normalized.x && move.from.y === normalized.y);
}
function applyMove(game, input) {
	if (game.status !== "playing") throw new IllegalMoveError("GAME_OVER", `当前棋局已结束: ${game.status}`);
	const from = parseCoordinate(input.from);
	const to = parseCoordinate(input.to);
	const fromIndex = positionToIndex(from);
	const toIndex = positionToIndex(to);
	const piece = game.board[fromIndex];
	if (!piece) throw new IllegalMoveError("NO_PIECE", `起点没有棋子: ${from.x},${from.y}`);
	if (piece.side !== game.turn) throw new IllegalMoveError("WRONG_TURN", `当前轮到${game.turn === "red" ? "红" : "黑"}方`);
	const legalMove = generateLegalMoves(game.board, game.turn).find((move) => move.from.x === from.x && move.from.y === from.y && move.to.x === to.x && move.to.y === to.y);
	if (!legalMove) throw new IllegalMoveError("ILLEGAL_DESTINATION", `${from.x},${from.y} 到 ${to.x},${to.y} 不是合法走法`);
	const board = cloneBoard(game.board);
	const captured = board[toIndex];
	board[fromIndex] = null;
	board[toIndex] = clonePiece(piece);
	const nextTurn = otherSide$2(game.turn);
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
		halfmoveClock: captured !== null || piece.type === "soldier" ? 0 : game.halfmoveClock + 1,
		fullmoveNumber: game.turn === "black" ? game.fullmoveNumber + 1 : game.fullmoveNumber,
		history: [...game.history, record]
	});
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
	if (!general) throw new InvalidPositionError(`${turn}方缺少将帅`);
	const inCheck = isSquareAttacked(board, general, otherSide$2(turn));
	if (generateLegalMoves(board, turn).length > 0) return {
		inCheck,
		status: "playing",
		winner: null
	};
	return {
		inCheck,
		status: inCheck ? "checkmate" : "stalemate",
		winner: otherSide$2(turn)
	};
}
function generateLegalMoves(board, side) {
	const pseudoMoves = generatePseudoMoves(board, side);
	const legalMoves = [];
	for (const move of pseudoMoves) if (!isInCheckOnBoard(applyMoveToBoard(board, move), side)) legalMoves.push(move);
	return legalMoves;
}
/**
* 生成某方的全部伪走法（含把己方将帅置于被将军状态、以及不可取的非法走法）。
* 导出给 AI 搜索内核，内核会做就地走子 + 单点将军过滤以节省每次克隆整盘的开销，
* 从而与规则引擎共用同一套走法与判定，避免搜索与规则失同步。
*/
function generatePseudoMoves(board, side) {
	const moves = [];
	for (let index = 0; index < 90; index += 1) {
		const piece = board[index];
		if (!piece || piece.side !== side) continue;
		const from = indexToPosition(index);
		for (const to of getPseudoTargets(board, from, piece)) {
			const captured = board[positionToIndex(to)];
			if (captured?.side === side) continue;
			if (captured?.type === "general") continue;
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
		case "general": return getGeneralTargets(from, piece.side);
		case "advisor": return getAdvisorTargets(from, piece.side);
		case "elephant": return getElephantTargets(board, from, piece.side);
		case "horse": return getHorseTargets(board, from);
		case "rook": return getRookTargets(board, from);
		case "cannon": return getCannonTargets(board, from, piece.side);
		case "soldier": return getSoldierTargets(from, piece.side);
	}
}
function getGeneralTargets(from, side) {
	const targets = [];
	for (const [dx, dy] of [
		[-1, 0],
		[1, 0],
		[0, -1],
		[0, 1]
	]) {
		const target = {
			x: from.x + dx,
			y: from.y + dy
		};
		if (isInPalace(target, side)) targets.push(target);
	}
	return targets;
}
function getAdvisorTargets(from, side) {
	const targets = [];
	for (const [dx, dy] of [
		[-1, -1],
		[1, -1],
		[-1, 1],
		[1, 1]
	]) {
		const target = {
			x: from.x + dx,
			y: from.y + dy
		};
		if (isInPalace(target, side)) targets.push(target);
	}
	return targets;
}
function getElephantTargets(board, from, side) {
	const targets = [];
	for (const [dx, dy] of [
		[-2, -2],
		[2, -2],
		[-2, 2],
		[2, 2]
	]) {
		const target = {
			x: from.x + dx,
			y: from.y + dy
		};
		const eye = {
			x: from.x + dx / 2,
			y: from.y + dy / 2
		};
		if (isInElephantTerritory(target, side) && isEmpty(board, eye)) targets.push(target);
	}
	return targets;
}
function getHorseTargets(board, from) {
	const targets = [];
	for (const [dx, dy, legX, legY] of [
		[
			-2,
			-1,
			-1,
			0
		],
		[
			-2,
			1,
			-1,
			0
		],
		[
			2,
			-1,
			1,
			0
		],
		[
			2,
			1,
			1,
			0
		],
		[
			-1,
			-2,
			0,
			-1
		],
		[
			1,
			-2,
			0,
			-1
		],
		[
			-1,
			2,
			0,
			1
		],
		[
			1,
			2,
			0,
			1
		]
	]) {
		const target = {
			x: from.x + dx,
			y: from.y + dy
		};
		const leg = {
			x: from.x + legX,
			y: from.y + legY
		};
		if (isOnBoardSafe(target) && isEmpty(board, leg)) targets.push(target);
	}
	return targets;
}
function getRookTargets(board, from) {
	return getSlidingTargets(board, from);
}
function getCannonTargets(board, from, side) {
	const targets = [];
	for (const [dx, dy] of [
		[-1, 0],
		[1, 0],
		[0, -1],
		[0, 1]
	]) {
		let x = from.x + dx;
		let y = from.y + dy;
		let hasScreen = false;
		while (isOnBoardSafe({
			x,
			y
		})) {
			const piece = board[y * 9 + x];
			if (!hasScreen) {
				if (piece === null) targets.push({
					x,
					y
				});
				else hasScreen = true;
			} else if (piece !== null) {
				if (piece.side !== side) targets.push({
					x,
					y
				});
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
	for (const [dx, dy] of [
		[-1, 0],
		[1, 0],
		[0, -1],
		[0, 1]
	]) {
		let x = from.x + dx;
		let y = from.y + dy;
		while (isOnBoardSafe({
			x,
			y
		})) {
			const piece = board[y * 9 + x];
			if (piece === null) targets.push({
				x,
				y
			});
			else {
				if (piece.side !== board[positionToIndex(from)]?.side) targets.push({
					x,
					y
				});
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
	const forward = side === "red" ? -1 : 1;
	const forwardTarget = {
		x: from.x,
		y: from.y + forward
	};
	if (isOnBoardSafe(forwardTarget)) targets.push(forwardTarget);
	if (side === "red" ? from.y <= 4 : from.y >= 5) for (const dx of [-1, 1]) {
		const target = {
			x: from.x + dx,
			y: from.y
		};
		if (isOnBoardSafe(target)) targets.push(target);
	}
	return targets;
}
/**
* 就地走子后判断某方是否处于被将军状态。
* 导出给 AI 搜索内核做单点合法性过滤，避免每次全量克隆棋盘。
*/
function isInCheckOnBoard(board, side) {
	const general = findGeneral(board, side);
	if (!general) return true;
	return isSquareAttacked(board, general, otherSide$2(side));
}
function findGeneral(board, side) {
	for (let index = 0; index < board.length; index += 1) {
		const piece = board[index];
		if (piece?.side === side && piece.type === "general") return indexToPosition(index);
	}
	return null;
}
/** 判断某格是否被 bySide 的一方攻击。 */
function isSquareAttacked(board, target, bySide) {
	for (let index = 0; index < 90; index += 1) {
		const piece = board[index];
		if (!piece || piece.side !== bySide) continue;
		if (pieceAttacksSquare(board, indexToPosition(index), piece, target)) return true;
	}
	return false;
}
function pieceAttacksSquare(board, from, piece, target) {
	const dx = target.x - from.x;
	const dy = target.y - from.y;
	const absX = Math.abs(dx);
	const absY = Math.abs(dy);
	switch (piece.type) {
		case "general": return absX + absY === 1 || from.x === target.x && countBetween(board, from, target) === 0;
		case "advisor": return absX === 1 && absY === 1;
		case "elephant": return absX === 2 && absY === 2 && isEmpty(board, {
			x: from.x + dx / 2,
			y: from.y + dy / 2
		});
		case "horse":
			if (!(absX === 2 && absY === 1 || absX === 1 && absY === 2)) return false;
			return isEmpty(board, absX === 2 ? {
				x: from.x + dx / 2,
				y: from.y
			} : {
				x: from.x,
				y: from.y + dy / 2
			});
		case "rook": return (from.x === target.x || from.y === target.y) && countBetween(board, from, target) === 0;
		case "cannon": {
			if (from.x !== target.x && from.y !== target.y) return false;
			const blockers = countBetween(board, from, target);
			return board[positionToIndex(target)] === null ? blockers === 0 : blockers === 1;
		}
		case "soldier": {
			const forward = piece.side === "red" ? -1 : 1;
			if (dx === 0 && dy === forward) return true;
			return (piece.side === "red" ? from.y <= 4 : from.y >= 5) && absX === 1 && dy === 0;
		}
	}
}
function countBetween(board, from, target) {
	if (from.x !== target.x && from.y !== target.y) return Number.POSITIVE_INFINITY;
	const stepX = Math.sign(target.x - from.x);
	const stepY = Math.sign(target.y - from.y);
	let x = from.x + stepX;
	let y = from.y + stepY;
	let count = 0;
	while (x !== target.x || y !== target.y) {
		if (board[y * 9 + x] !== null) count += 1;
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
	if (position.x < 3 || position.x > 5) return false;
	return side === "red" ? position.y >= 7 && position.y <= 9 : position.y >= 0 && position.y <= 2;
}
function isInElephantTerritory(position, side) {
	return side === "red" ? position.y >= 5 && position.y <= 9 : position.y >= 0 && position.y <= 4;
}
//#endregion
//#region lib/types/game/ai.js
/**
* 中国象棋 AI：迭代加深 + Alpha-Beta + 置换表 + 静态搜索。
*
* 设计目标：速度与棋力兼顾。
* - 就地 make/unmake 棋盘：搜索过程中不再克隆整盘、不生成中文记谱、不重建
*   GameState，单次节点开销比直接调用 applyMove 低一个数量级。
* - 迭代加深 + 时间预算：默认在几百毫秒内返回可靠结果，剩余预算自动向下挖掘
*   更深；未配置时间预算时退化为固定深度模式（兼顾旧调用方）。
* - Zobrist 置换表（TT）：缓存重复局面，避免重复搜索。
* - 静态搜索（QSearch）：叶子只延伸吃子与将军应对，消除“白送子/白吃子”的
*   水平线效应——这是提升棋感最直接的一项。
* - 走法排序：TT 首选走法 > MVV-LVA 吃子分 > 杀手走法 > 历史启发，让剪枝效率
*   进一步成倍提升。
* - 评估：物质 + 位置价值表（红黑对称）+ 过河兵奖励。
*
* 走法与合法性判定完全复用 rules.ts 导出的伪走法与就地将军判断，搜索与规则
* 引擎不会失同步。
*/
const DEFAULT_MAX_DEPTH = 6;
const FIXED_DEPTH_MIN = 1;
const FIXED_DEPTH_MAX = 6;
const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 8;
/** 将死/绝杀分数；一层约相差 1_000_000 / MATE_PLY_BONUS，避免多步将死互相混淆。 */
const MATE_SCORE = 1e6;
/** 接近将死值即视为“将死分数”的阈值。 */
const MATE_THRESHOLD = 999900;
/** 静态搜索最大深度（含吃子/将军应对）。 */
const QSEARCH_PLY_LIMIT = 24;
const PAWN_CROSSED_RIVER_BONUS = 40;
/** 基础子力价值（红黑共用）。 */
const PIECE_VALUES$1 = {
	general: 1e4,
	rook: 1e3,
	cannon: 550,
	horse: 400,
	elephant: 250,
	advisor: 250,
	soldier: 150
};
/** 确定性 64 位 PRNG，保证同一次命中的哈希表每次一致。 */
function splitmix64(seed) {
	let state = seed & 18446744073709551615n;
	return () => {
		state = state + 11400714819323198485n & 18446744073709551615n;
		let z = state;
		z = (z ^ z >> 30n) * 13787848793156543929n & 18446744073709551615n;
		z = (z ^ z >> 27n) * 10723151780598845931n & 18446744073709551615n;
		return z ^ z >> 31n;
	};
}
const PIECE_TYPE_ORDER = [
	"general",
	"advisor",
	"elephant",
	"horse",
	"rook",
	"cannon",
	"soldier"
];
const PIECE_HASH = (() => {
	const random = splitmix64(11325522273671422743n);
	const table = /* @__PURE__ */ new BigUint64Array(1260);
	for (let i = 0; i < table.length; i += 1) table[i] = random();
	return table;
})();
const SIDE_HASH = (() => {
	return splitmix64(8158064426821842807n)();
})();
/** 就地棋盘上的 Zobrist 增量键（不含轮次边 switch）。 */
function boardKey(board) {
	let key = 0n;
	for (let index = 0; index < board.length; index += 1) {
		const piece = board[index];
		if (piece === null) continue;
		key ^= PIECE_HASH[index * 14 + pieceCode(piece.side, piece.type)];
	}
	return key;
}
function pieceCode(side, type) {
	return (side === "black" ? 7 : 0) + PIECE_TYPE_ORDER.indexOf(type);
}
function indexOf(position) {
	return position.y * 9 + position.x;
}
/** 切换轮次的边。 */
function otherSide$1(side) {
	return side === "red" ? "black" : "red";
}
/** 就地走子并增量更新 Zobrist 键；返回撤销信息。 */
function makeMoveInPlace(board, fromIndex, toIndex, context) {
	const mover = board[fromIndex];
	const captured = board[toIndex];
	if (mover === null) throw new Error(`AI 内部错误: 起点 ${fromIndex} 无棋子`);
	board[toIndex] = mover;
	board[fromIndex] = null;
	let key = context.key;
	key ^= PIECE_HASH[fromIndex * 14 + pieceCode(mover.side, mover.type)];
	key ^= PIECE_HASH[toIndex * 14 + pieceCode(mover.side, mover.type)];
	if (captured !== null) key ^= PIECE_HASH[toIndex * 14 + pieceCode(captured.side, captured.type)];
	context.key = key;
	return {
		mover,
		captured
	};
}
/** 撤销就地走子并还原 Zobrist 键。 */
function unmakeMoveInPlace(board, fromIndex, toIndex, undo, context) {
	board[fromIndex] = undo.mover;
	board[toIndex] = undo.captured;
	let key = context.key;
	key ^= PIECE_HASH[toIndex * 14 + pieceCode(undo.mover.side, undo.mover.type)];
	key ^= PIECE_HASH[fromIndex * 14 + pieceCode(undo.mover.side, undo.mover.type)];
	if (undo.captured !== null) key ^= PIECE_HASH[toIndex * 14 + pieceCode(undo.captured.side, undo.captured.type)];
	context.key = key;
}
const PST_BY_TYPE = {
	general: { rows: [
		[
			0,
			0,
			0,
			-2,
			-4,
			-2,
			0,
			0,
			0
		],
		[
			0,
			0,
			0,
			4,
			6,
			4,
			0,
			0,
			0
		],
		[
			0,
			0,
			0,
			2,
			4,
			2,
			0,
			0,
			0
		],
		[
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		],
		[
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		],
		[
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		],
		[
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		],
		[
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		],
		[
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		],
		[
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		]
	] },
	advisor: { rows: [
		[
			0,
			0,
			0,
			4,
			0,
			4,
			0,
			0,
			0
		],
		[
			0,
			0,
			0,
			0,
			6,
			0,
			0,
			0,
			0
		],
		[
			0,
			0,
			0,
			4,
			0,
			4,
			0,
			0,
			0
		],
		[
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		],
		[
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		],
		[
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		],
		[
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		],
		[
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		],
		[
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		],
		[
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		]
	] },
	elephant: { rows: [
		[
			0,
			0,
			6,
			0,
			0,
			0,
			6,
			0,
			0
		],
		[
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		],
		[
			6,
			0,
			0,
			6,
			8,
			6,
			0,
			0,
			6
		],
		[
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		],
		[
			0,
			0,
			6,
			0,
			6,
			0,
			6,
			0,
			0
		],
		[
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		],
		[
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		],
		[
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		],
		[
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		],
		[
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		]
	] },
	horse: { rows: [
		[
			-10,
			-8,
			-6,
			-4,
			-2,
			-4,
			-6,
			-8,
			-10
		],
		[
			-8,
			-4,
			0,
			2,
			4,
			2,
			0,
			-4,
			-8
		],
		[
			-4,
			0,
			6,
			8,
			10,
			8,
			6,
			0,
			-4
		],
		[
			0,
			4,
			8,
			12,
			14,
			12,
			8,
			4,
			0
		],
		[
			4,
			8,
			12,
			16,
			18,
			16,
			12,
			8,
			4
		],
		[
			4,
			8,
			12,
			16,
			18,
			16,
			12,
			8,
			4
		],
		[
			0,
			4,
			8,
			12,
			14,
			12,
			8,
			4,
			0
		],
		[
			-4,
			0,
			6,
			8,
			10,
			8,
			6,
			0,
			-4
		],
		[
			-8,
			-4,
			0,
			2,
			4,
			2,
			0,
			-4,
			-8
		],
		[
			-10,
			-8,
			-6,
			-4,
			-2,
			-4,
			-6,
			-8,
			-10
		]
	] },
	rook: { rows: [
		[
			-8,
			-6,
			-2,
			0,
			2,
			0,
			-2,
			-6,
			-8
		],
		[
			-6,
			-4,
			0,
			2,
			4,
			2,
			0,
			-4,
			-6
		],
		[
			-4,
			-2,
			2,
			4,
			6,
			4,
			2,
			-2,
			-4
		],
		[
			-2,
			0,
			4,
			6,
			8,
			6,
			4,
			0,
			-2
		],
		[
			0,
			2,
			6,
			8,
			10,
			8,
			6,
			2,
			0
		],
		[
			0,
			2,
			6,
			8,
			10,
			8,
			6,
			2,
			0
		],
		[
			-2,
			0,
			4,
			6,
			8,
			6,
			4,
			0,
			-2
		],
		[
			-4,
			-2,
			2,
			4,
			6,
			4,
			2,
			-2,
			-4
		],
		[
			-6,
			-4,
			0,
			2,
			4,
			2,
			0,
			-4,
			-6
		],
		[
			-8,
			-6,
			-2,
			0,
			2,
			0,
			-2,
			-6,
			-8
		]
	] },
	cannon: { rows: [
		[
			-4,
			-2,
			0,
			2,
			2,
			2,
			0,
			-2,
			-4
		],
		[
			-2,
			0,
			2,
			4,
			4,
			4,
			2,
			0,
			-2
		],
		[
			0,
			2,
			4,
			6,
			8,
			6,
			4,
			2,
			0
		],
		[
			2,
			4,
			6,
			8,
			10,
			8,
			6,
			4,
			2
		],
		[
			4,
			6,
			8,
			10,
			12,
			10,
			8,
			6,
			4
		],
		[
			2,
			4,
			6,
			8,
			10,
			8,
			6,
			4,
			2
		],
		[
			0,
			2,
			4,
			6,
			8,
			6,
			4,
			2,
			0
		],
		[
			0,
			2,
			4,
			6,
			8,
			6,
			4,
			2,
			0
		],
		[
			-2,
			0,
			2,
			4,
			4,
			4,
			2,
			0,
			-2
		],
		[
			-4,
			-2,
			0,
			2,
			2,
			2,
			0,
			-2,
			-4
		]
	] },
	soldier: { rows: [
		[
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		],
		[
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0,
			0
		],
		[
			0,
			0,
			-2,
			-2,
			-2,
			-2,
			-2,
			0,
			0
		],
		[
			0,
			0,
			0,
			-4,
			-6,
			-4,
			0,
			0,
			0
		],
		[
			0,
			-2,
			-2,
			-4,
			-6,
			-4,
			-2,
			-2,
			0
		],
		[
			6,
			6,
			8,
			10,
			14,
			10,
			8,
			6,
			6
		],
		[
			8,
			10,
			12,
			16,
			20,
			16,
			12,
			10,
			8
		],
		[
			12,
			14,
			18,
			22,
			26,
			22,
			18,
			14,
			12
		],
		[
			14,
			16,
			20,
			24,
			30,
			24,
			20,
			16,
			14
		],
		[
			10,
			12,
			16,
			20,
			24,
			20,
			16,
			12,
			10
		]
	] }
};
/** 某方视角下的表格行（红方从底部旋转，黑方正序）。 */
function pstValue(type, side, x, y) {
	const row = side === "red" ? 9 - y : y;
	const table = PST_BY_TYPE[type];
	if (row < 0 || row >= table.rows.length) return 0;
	const line = table.rows[row];
	if (x < 0 || x >= line.length) return 0;
	return line[x];
}
function crossedRiver(side, y) {
	return side === "red" ? y <= 4 : y >= 5;
}
/**
* 静态评估：从“当前轮到的一方”视角返回分数（适配 Negamax）。
* 物质 + 位置表 + 过河兵 + 被将军惩罚，不生成走法，保证叶子评估极快。
*/
function evaluate(board, turn) {
	let score = 0;
	for (let index = 0; index < board.length; index += 1) {
		const piece = board[index];
		if (piece === null) continue;
		const x = index % 9;
		const y = Math.floor(index / 9);
		let value = PIECE_VALUES$1[piece.type] + pstValue(piece.type, piece.side, x, y);
		if (piece.type === "soldier" && crossedRiver(piece.side, y)) value += PAWN_CROSSED_RIVER_BONUS;
		score += piece.side === turn ? value : -value;
	}
	if (isInCheckOnBoard(board, turn)) score -= 160;
	return score;
}
/**
* 就地棋盘合法性走法：伪走法 + 落子后单点将军判定，全程不克隆整盘。
* rules.ts 的 generatePseudoMoves / isInCheckOnBoard 保证与规则引擎一致。
*/
function legalMovesInPlace(board, side, includeCapturesOnly) {
	const pseudo = generatePseudoMoves(board, side);
	const legal = [];
	for (const move of pseudo) {
		if (includeCapturesOnly && move.captured === null) continue;
		const fromIndex = indexOf(move.from);
		const toIndex = indexOf(move.to);
		const mover = board[fromIndex];
		const captured = board[toIndex];
		board[toIndex] = mover;
		board[fromIndex] = null;
		const safe = !isInCheckOnBoard(board, side);
		board[fromIndex] = mover;
		board[toIndex] = captured;
		if (safe) legal.push(move);
	}
	return legal;
}
/** 将死分数按约定深度归一化，避免 TT 中不同深度的将死分互相混淆。 */
function toMateScale(score) {
	return score > MATE_THRESHOLD ? score + 1 : score < -999900 ? score - 1 : score;
}
function fromMateScale(score) {
	return score > MATE_THRESHOLD ? score - 1 : score < -999900 ? score + 1 : score;
}
/** 越早的将死分越高，避免不同深度的将死分数互相混淆。 */
function mateScoreAgainst(ply) {
	return MATE_SCORE - ply;
}
/** MVV-LVA 风格走法排序分：吃高价值子优先，吃子时按被吃价值×10 - 己方子力。 */
function moveOrderScore(move) {
	if (move.captured === null) return 0;
	const victim = PIECE_VALUES$1[move.captured.type];
	const attacker = PIECE_VALUES$1[move.piece.type];
	return victim * 10 - attacker;
}
function sideIndex(side) {
	return side === "red" ? 0 : 1;
}
/** 时间预算放行检查；超时置 aborted，所有层快速展开。timeMs<0 表示未启用预算。 */
function outOfTime(context, ply) {
	if (context.timeMs < 0 || ply <= 0) return false;
	if ((context.nodes & 1023) !== 0) return false;
	if (context.startTime + context.timeMs <= Date.now()) {
		context.aborted = true;
		return true;
	}
	return false;
}
/**
* 静态搜索（QSearch）：叶子层沿“吃子 + 被将军时的全部应对”继续，
* 直到局面安静或深度用尽，消除水平线效应（白送/白吃）。
*/
function quiesce(board, side, alpha, beta, context, ply) {
	context.nodes += 1;
	if (context.aborted) return alpha;
	if (outOfTime(context, ply)) return alpha;
	if (ply >= QSEARCH_PLY_LIMIT) return evaluate(board, side);
	const standPat = evaluate(board, side);
	if (standPat >= beta) return standPat;
	if (standPat > alpha) alpha = standPat;
	const inCheck = isInCheckOnBoard(board, side);
	const moves = legalMovesInPlace(board, side, !inCheck);
	if (moves.length === 0) return inCheck ? -mateScoreAgainst(ply) : standPat;
	const captures = moves.filter((move) => move.captured !== null);
	if (inCheck) captures.unshift(...moves.filter((move) => move.captured === null));
	const ordered = captures.sort((left, right) => moveOrderScore(right) - moveOrderScore(left));
	for (const move of ordered) {
		const fromIndex = indexOf(move.from);
		const toIndex = indexOf(move.to);
		const undo = makeMoveInPlace(board, fromIndex, toIndex, context);
		const score = -quiesce(board, otherSide$1(side), -beta, -alpha, context, ply + 1);
		unmakeMoveInPlace(board, fromIndex, toIndex, undo, context);
		if (score >= beta) return beta;
		if (score > alpha) alpha = score;
	}
	return alpha;
}
function alphaBeta(board, side, depth, alpha, beta, context, ply) {
	context.nodes += 1;
	if (context.aborted) return alpha;
	if (outOfTime(context, ply)) return alpha;
	const key = context.key ^ (side === "red" ? SIDE_HASH : 0n);
	const hashEntry = context.tt.get(key);
	if (hashEntry !== void 0 && hashEntry.depth >= depth) {
		const storedScore = fromMateScale(hashEntry.score);
		if (hashEntry.flag === "exact") return storedScore;
		if (hashEntry.flag === "lower" && storedScore >= beta) return storedScore;
		if (hashEntry.flag === "upper" && storedScore <= alpha) return storedScore;
	}
	if (depth <= 0) return quiesce(board, side, alpha, beta, context, ply);
	const moves = legalMovesInPlace(board, side, false);
	if (moves.length === 0) return -mateScoreAgainst(ply);
	const ttMove = hashEntry === void 0 ? null : {
		from: hashEntry.bestFrom,
		to: hashEntry.bestTo
	};
	const ordered = [...moves].sort((left, right) => {
		const leftTt = ttMove !== null && indexOf(left.from) === ttMove.from && indexOf(left.to) === ttMove.to;
		if (leftTt !== (ttMove !== null && indexOf(right.from) === ttMove.from && indexOf(right.to) === ttMove.to)) return leftTt ? -1 : 1;
		const leftCap = moveOrderScore(left);
		const rightCap = moveOrderScore(right);
		if (leftCap !== rightCap) return rightCap - leftCap;
		const leftKiller = isKiller(context, ply, left);
		if (leftKiller !== isKiller(context, ply, right)) return leftKiller ? -1 : 1;
		const leftHist = historyScore(context, side, left);
		return historyScore(context, side, right) - leftHist;
	});
	let best = -Infinity;
	let bestMove = null;
	let flag = "upper";
	const startAlpha = alpha;
	for (const move of ordered) {
		const fromIndex = indexOf(move.from);
		const toIndex = indexOf(move.to);
		const undo = makeMoveInPlace(board, fromIndex, toIndex, context);
		const score = -alphaBeta(board, otherSide$1(side), depth - 1, -beta, -alpha, context, ply + 1);
		unmakeMoveInPlace(board, fromIndex, toIndex, undo, context);
		if (score > best) {
			best = score;
			bestMove = move;
		}
		if (score > alpha) alpha = score;
		if (alpha >= beta) {
			if (move.captured === null) recordKiller(context, ply, move);
			else rewardHistory(context, side, move, depth);
			flag = "lower";
			break;
		}
	}
	if (bestMove !== null) rewardHistory(context, side, bestMove, depth);
	if (best <= startAlpha) flag = "upper";
	else if (best >= beta) flag = "lower";
	else flag = "exact";
	const storedBest = toMateScale(best);
	if (bestMove !== null) context.tt.set(key, {
		flag,
		depth,
		score: storedBest,
		bestFrom: indexOf(bestMove.from),
		bestTo: indexOf(bestMove.to)
	});
	else context.tt.set(key, {
		flag,
		depth,
		score: storedBest,
		bestFrom: -1,
		bestTo: -1
	});
	return best;
}
/** 历史启发得分：同一起点-终点走法过去越有效，之后越优先尝试。 */
function historyScore(context, side, move) {
	const from = indexOf(move.from);
	const to = indexOf(move.to);
	return context.history[sideIndex(side) * 90 * 90 + from * 90 + to];
}
function rewardHistory(context, side, move, depth) {
	const from = indexOf(move.from);
	const to = indexOf(move.to);
	const slot = sideIndex(side) * 90 * 90 + from * 90 + to;
	const bonus = depth * 16;
	const current = context.history[slot];
	context.history[slot] = current + bonus - (current * bonus >> 12);
}
function recordKiller(context, ply, move) {
	const offset = ply * 2;
	const fromTo = indexOf(move.from) * 90 + indexOf(move.to);
	if (context.killer[offset] !== fromTo) {
		context.killer[offset + 1] = context.killer[offset];
		context.killer[offset] = fromTo;
	}
}
function isKiller(context, ply, move) {
	const offset = ply * 2;
	const fromTo = indexOf(move.from) * 90 + indexOf(move.to);
	return context.killer[offset] === fromTo || context.killer[offset + 1] === fromTo;
}
const TT_MAX_ENTRIES = 1 << 17;
function integerInRange(value, fallback, min, max) {
	if (!Number.isInteger(value)) return fallback;
	return Math.max(min, Math.min(max, value));
}
/**
* 搜索当前局面的候选走法。结果按引擎分数从高到低排列。
*
* 速度策略：
* - 有 timeMs 时迭代加深：从 depth 1 逐步加深。每层完整搜索所有根走法
*   后才更新结果；若下一层在预算内无法完成，则整层丢弃，返回最近一层
*   完整结果（保证“有限时间内必有可靠答案”）。
* - 无 timeMs 时固定 depth（兼容旧调用方），默认 2。
*/
function findBestMoves(game, options = {}) {
	const limit = integerInRange(options.limit, DEFAULT_LIMIT, 1, MAX_LIMIT);
	const board = game.board.slice();
	const turn = game.turn;
	const hasTimeBudget = Number.isFinite(options.timeMs) && (options.timeMs ?? 0) > 0;
	const maxDepth = hasTimeBudget ? integerInRange(options.depth, DEFAULT_MAX_DEPTH, FIXED_DEPTH_MIN, DEFAULT_MAX_DEPTH) : integerInRange(options.depth, 2, FIXED_DEPTH_MIN, FIXED_DEPTH_MAX);
	const context = {
		nodes: 0,
		tt: /* @__PURE__ */ new Map(),
		killer: /* @__PURE__ */ new Int32Array(28),
		history: /* @__PURE__ */ new Int32Array(16200),
		startTime: Date.now(),
		timeMs: hasTimeBudget ? Math.min(Math.max(options.timeMs ?? 0, 8), 3e3) : -1,
		aborted: false,
		key: boardKey(board)
	};
	const rootMoves = legalMovesInPlace(board, turn, false);
	const results = rootMoves.map((move) => ({
		move,
		score: 0
	}));
	let lastCompleted = [];
	let completedDepth = 0;
	const firstDepth = hasTimeBudget ? 1 : maxDepth;
	for (let depth = firstDepth; depth <= maxDepth; depth += 1) {
		if (context.aborted) break;
		if (hasTimeBudget && context.startTime + context.timeMs <= Date.now()) break;
		let rootAlpha = -Infinity;
		let firstRootMove = true;
		let layerAborted = false;
		for (const entry of results) {
			if (context.aborted) {
				layerAborted = true;
				break;
			}
			const fromIndex = indexOf(entry.move.from);
			const toIndex = indexOf(entry.move.to);
			const undo = makeMoveInPlace(board, fromIndex, toIndex, context);
			let score;
			if (firstRootMove) {
				score = -alphaBeta(board, otherSide$1(turn), depth - 1, -Infinity, Infinity, context, 1);
				firstRootMove = false;
			} else {
				score = -alphaBeta(board, otherSide$1(turn), depth - 1, -rootAlpha - 1, -rootAlpha, context, 1);
				if (!context.aborted && score > rootAlpha) score = -alphaBeta(board, otherSide$1(turn), depth - 1, -Infinity, -rootAlpha, context, 1);
			}
			unmakeMoveInPlace(board, fromIndex, toIndex, undo, context);
			entry.score = score;
			if (score > rootAlpha) rootAlpha = score;
			if (context.tt.size > TT_MAX_ENTRIES) context.tt.clear();
		}
		if (layerAborted) break;
		results.sort((left, right) => right.score - left.score);
		lastCompleted = results.map((entry) => ({
			move: entry.move,
			score: entry.score
		}));
		completedDepth = depth;
	}
	if (completedDepth === 0) {
		completedDepth = 1;
		lastCompleted = rootMoves.map((move) => ({
			move,
			score: evaluate(applyMoveLocally(board, move), otherSide$1(turn))
		})).sort((left, right) => right.score - left.score);
	}
	return {
		turn,
		depth: completedDepth,
		nodes: context.nodes,
		candidates: lastCompleted.slice(0, limit)
	};
}
/** 计算“走一步后对手视角”的静态评估（仅兜底用）。 */
function applyMoveLocally(board, move) {
	const next = board.slice();
	next[indexOf(move.to)] = next[indexOf(move.from)];
	next[indexOf(move.from)] = null;
	return next;
}
//#endregion
//#region lib/types/game/serialization.js
const FEN_BY_TYPE = {
	general: "k",
	advisor: "a",
	elephant: "b",
	horse: "n",
	rook: "r",
	cannon: "c",
	soldier: "p"
};
const TYPE_BY_FEN = {
	k: "general",
	a: "advisor",
	b: "elephant",
	n: "horse",
	r: "rook",
	c: "cannon",
	p: "soldier"
};
function pieceToFen(piece) {
	const code = FEN_BY_TYPE[piece.type];
	return piece.side === "red" ? code.toUpperCase() : code;
}
function parseFenPiece(code) {
	const type = TYPE_BY_FEN[code.toLowerCase()];
	if (!type) throw new InvalidPositionError(`未知 FEN 棋子: ${code}`);
	return {
		side: code === code.toUpperCase() ? "red" : "black",
		type
	};
}
function toFen(game) {
	const rows = [];
	for (let y = 0; y < 10; y += 1) {
		let row = "";
		let empty = 0;
		for (let x = 0; x < 9; x += 1) {
			const piece = game.board[y * 9 + x];
			if (piece === null) {
				empty += 1;
				continue;
			}
			if (empty > 0) {
				row += String(empty);
				empty = 0;
			}
			row += pieceToFen(piece);
		}
		if (empty > 0) row += String(empty);
		rows.push(row);
	}
	const side = game.turn === "red" ? "w" : "b";
	return `${rows.join("/")} ${side} - - ${game.halfmoveClock} ${game.fullmoveNumber}`;
}
function fromFen(fen) {
	const fields = fen.trim().split(/\s+/);
	if (fields.length < 2 || fields.length > 6) throw new InvalidPositionError("FEN 至少需要棋盘布局和轮次字段");
	return makeGameState(parsePlacement(fields[0]), parseSide(fields[1]), {
		halfmoveClock: fields[4] === void 0 || fields[4] === "-" ? 0 : parseNonNegativeInt(fields[4], "半回合计数"),
		fullmoveNumber: fields[5] === void 0 || fields[5] === "-" ? 1 : parsePositiveInt(fields[5], "全回合计数")
	});
}
/**
* 默认保存为 JSON，以便同时保留 FEN 和悔棋历史；也可通过 format:'fen' 只导出标准扩展 FEN。
* deserialize 同时接受这两种格式。
*/
function serialize(game, options = {}) {
	if (options.format === "fen") return toFen(game);
	return JSON.stringify({
		version: 1,
		fen: toFen(game),
		history: game.history
	});
}
function deserialize(serialized) {
	const text = serialized.trim();
	if (text.length === 0) throw new InvalidPositionError("不能反序列化空字符串");
	if (!text.startsWith("{")) return fromFen(text);
	let value;
	try {
		value = JSON.parse(text);
	} catch {
		throw new InvalidPositionError("棋局 JSON 格式错误");
	}
	if (!isRecord$2(value) || value.version !== 1 || typeof value.fen !== "string") throw new InvalidPositionError("不支持的棋局序列化格式");
	const base = fromFen(value.fen);
	const history = value.history === void 0 ? [] : parseHistory(value.history);
	return makeGameState(base.board, base.turn, {
		halfmoveClock: base.halfmoveClock,
		fullmoveNumber: base.fullmoveNumber,
		history
	});
}
function parsePlacement(placement) {
	const rows = placement.split("/");
	if (rows.length !== 10) throw new InvalidPositionError(`FEN 棋盘必须有 10 行`);
	const board = Array.from({ length: 90 }, () => null);
	for (let y = 0; y < rows.length; y += 1) {
		let x = 0;
		for (const code of rows[y]) if (/^[1-9]$/.test(code)) x += Number(code);
		else {
			if (!TYPE_BY_FEN[code.toLowerCase()] || x >= 9) throw new InvalidPositionError(`FEN 第 ${y + 1} 行包含非法内容`);
			board[y * 9 + x] = parseFenPiece(code);
			x += 1;
		}
		if (x !== 9) throw new InvalidPositionError(`FEN 第 ${y + 1} 行不是 9 列`);
	}
	return board;
}
function parseSide(value) {
	if (value === "w" || value === "r" || value === "red") return "red";
	if (value === "b" || value === "black") return "black";
	throw new InvalidPositionError(`未知 FEN 轮次: ${value}`);
}
function parseNonNegativeInt(value, label) {
	if (!/^\d+$/.test(value)) throw new InvalidPositionError(`${label}不是非负整数`);
	return Number(value);
}
function parsePositiveInt(value, label) {
	const result = parseNonNegativeInt(value, label);
	if (result < 1) throw new InvalidPositionError(`${label}必须大于 0`);
	return result;
}
function isRecord$2(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function parseHistory(value) {
	if (!Array.isArray(value)) throw new InvalidPositionError("棋局历史必须是数组");
	return value.map((item, index) => parseMoveRecord(item, index));
}
function parseMoveRecord(value, index) {
	if (!isRecord$2(value)) throw new InvalidPositionError(`历史第 ${index + 1} 步格式错误`);
	const from = parseSerializedPosition(value.from, `历史第 ${index + 1} 步起点`);
	const to = parseSerializedPosition(value.to, `历史第 ${index + 1} 步终点`);
	const piece = parsePiece(value.piece, `历史第 ${index + 1} 步棋子`);
	const captured = value.captured === null || value.captured === void 0 ? null : parsePiece(value.captured, `历史第 ${index + 1} 步被吃棋子`);
	if (typeof value.notation !== "string") throw new InvalidPositionError(`历史第 ${index + 1} 步缺少棋谱`);
	if (typeof value.givesCheck !== "boolean") throw new InvalidPositionError(`历史第 ${index + 1} 步将军标记错误`);
	if (value.result !== "playing" && value.result !== "checkmate" && value.result !== "stalemate") throw new InvalidPositionError(`历史第 ${index + 1} 步结果错误`);
	return {
		from,
		to,
		piece,
		captured,
		notation: value.notation,
		givesCheck: value.givesCheck,
		result: value.result,
		halfmoveClockBefore: parseNonNegativeInt(String(value.halfmoveClockBefore), "历史半回合计数"),
		fullmoveNumberBefore: parsePositiveInt(String(value.fullmoveNumberBefore), "历史全回合计数")
	};
}
function parseSerializedPosition(value, label) {
	if (typeof value === "string") try {
		return parseCoordinate(value);
	} catch {
		throw new InvalidPositionError(`${label}格式错误`);
	}
	if (isRecord$2(value) && typeof value.x === "number" && typeof value.y === "number") try {
		return parseCoordinate({
			x: value.x,
			y: value.y
		});
	} catch {
		throw new InvalidPositionError(`${label}格式错误`);
	}
	throw new InvalidPositionError(`${label}格式错误`);
}
function parsePiece(value, label) {
	if (!isRecord$2(value) || value.side !== "red" && value.side !== "black" || !isPieceType(value.type)) throw new InvalidPositionError(`${label}格式错误`);
	return {
		side: value.side,
		type: value.type
	};
}
function isPieceType(value) {
	return value === "general" || value === "advisor" || value === "elephant" || value === "horse" || value === "rook" || value === "cannon" || value === "soldier";
}
//#endregion
//#region lib/types/host/decision.js
var XiangqiDecisionProtocolError = class extends Error {
	code;
	constructor(code, message) {
		super(`xiangqi decision: ${message}`);
		this.name = "XiangqiDecisionProtocolError";
		this.code = code;
	}
};
const PIECE_SYMBOLS = {
	rook: "r",
	horse: "h",
	elephant: "e",
	advisor: "a",
	general: "k",
	cannon: "c",
	soldier: "p"
};
const PIECE_VALUES = {
	general: 1e4,
	rook: 900,
	cannon: 450,
	horse: 400,
	elephant: 200,
	advisor: 200,
	soldier: 100
};
const RESPONSE_FIELDS = /* @__PURE__ */ new Set([
	"decision_id",
	"position_id",
	"observed",
	"candidate_id",
	"summary"
]);
function isRecord$1(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}
function boardEncodingOf(game) {
	const rows = [];
	for (let y = 0; y < 10; y += 1) {
		let row = "";
		for (let x = 0; x < 9; x += 1) {
			const piece = game.board[y * 9 + x];
			if (piece === null) {
				row += ".";
				continue;
			}
			const symbol = PIECE_SYMBOLS[piece.type];
			row += piece.side === "black" ? symbol : symbol.toUpperCase();
		}
		rows.push(row);
	}
	return {
		orientation: "black-top-red-bottom",
		rows,
		symbols: "rheakcp=black,RHEAKCP=red,."
	};
}
function generalPosition(game, side) {
	const index = game.board.findIndex((piece) => piece?.side === side && piece.type === "general");
	if (index < 0) throw new XiangqiDecisionProtocolError("INVALID_SHAPE", `${side} general is missing`);
	return formatCoordinate({
		x: index % 9,
		y: Math.floor(index / 9)
	});
}
function ruleFactsOf(game) {
	if (game.turn !== "black") throw new XiangqiDecisionProtocolError("NOT_BLACK_TURN", "the frozen position is not black to move");
	return {
		turn: "black",
		inCheck: isInCheck(game, "black"),
		legalMoveCount: getLegalMoves(game).length,
		blackGeneral: generalPosition(game, "black"),
		redGeneral: generalPosition(game, "red"),
		halfmoveClock: game.halfmoveClock,
		fullmoveNumber: game.fullmoveNumber
	};
}
function fnv1a64(value) {
	let hash = 14695981039346656037n;
	for (let index = 0; index < value.length; index += 1) {
		hash ^= BigInt(value.charCodeAt(index));
		hash = BigInt.asUintN(64, hash * 1099511628211n);
	}
	return hash.toString(16).padStart(16, "0");
}
function positionIdOf(gameId, revision, game, boardEncoding, ruleFacts) {
	return `pos-${fnv1a64(JSON.stringify({
		gameId,
		revision,
		fen: toFen(game),
		rows: boardEncoding.rows,
		ruleFacts
	}))}`;
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
		escapesCheck: game.inCheck && !isInCheck(next, "black"),
		materialDelta: entry.move.captured === null ? 0 : PIECE_VALUES[entry.move.captured.type]
	};
}
/** Build one immutable, Host-owned packet. This function never commits a move. */
function buildXiangqiDecisionPacket(game, identity, decisionId, options = {}) {
	const boardEncoding = boardEncodingOf(game);
	const ruleFacts = ruleFactsOf(game);
	const positionId = positionIdOf(identity.gameId, identity.revision, game, boardEncoding, ruleFacts);
	const candidates = findBestMoves(game, {
		timeMs: options.localSearchTimeMs ?? 180,
		depth: options.depth ?? 6,
		limit: Math.min(options.limit ?? 5, 5)
	}).candidates.map((entry, index) => candidateOf(entry, game, index + 1)).slice(0, 5);
	return {
		protocol: "xiangqi-decision/v1",
		decisionId,
		positionId,
		gameId: identity.gameId,
		revision: identity.revision,
		side: "black",
		fen: toFen(game),
		boardEncoding,
		lastMove: identity.lastMove === void 0 ? null : { ...identity.lastMove },
		ruleFacts,
		candidates
	};
}
function responseObject(raw) {
	if (isRecord$1(raw) && raw.arguments !== void 0) return responseObject(raw.arguments);
	if (isRecord$1(raw) && raw.output !== void 0) return responseObject(raw.output);
	if (isRecord$1(raw) && Array.isArray(raw.content)) {
		const text = raw.content.filter((item) => isRecord$1(item) && item.type === "text" && typeof item.text === "string").map((item) => item.text).join("");
		if (text.length > 0) return responseObject(text);
	}
	if (typeof raw !== "string") return raw;
	let text = raw.trim();
	const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/i.exec(text);
	if (fenced !== null) text = fenced[1];
	try {
		return JSON.parse(text);
	} catch {
		throw new XiangqiDecisionProtocolError("INVALID_JSON", "model output is not one JSON object");
	}
}
function requiredString(record, field) {
	const value = record[field];
	if (typeof value !== "string" || value.trim().length === 0) throw new XiangqiDecisionProtocolError("INVALID_SHAPE", `${field} must be a non-empty string`);
	return value.trim();
}
/** Parse and enforce the minimal snake_case response contract. */
function parseXiangqiDecisionResponse(raw, packet) {
	const value = responseObject(raw);
	if (!isRecord$1(value)) throw new XiangqiDecisionProtocolError("INVALID_SHAPE", "model output must be a JSON object");
	for (const key of Object.keys(value)) if (!RESPONSE_FIELDS.has(key)) throw new XiangqiDecisionProtocolError("UNKNOWN_FIELD", `field ${key} is not allowed`);
	const decisionId = requiredString(value, "decision_id");
	const positionId = requiredString(value, "position_id");
	const observedValue = value.observed;
	if (!isRecord$1(observedValue)) throw new XiangqiDecisionProtocolError("INVALID_SHAPE", "observed must be an object");
	for (const key of Object.keys(observedValue)) if (!(/* @__PURE__ */ new Set([
		"side",
		"in_check",
		"black_general",
		"red_general"
	])).has(key)) throw new XiangqiDecisionProtocolError("UNKNOWN_FIELD", `observed field ${key} is not allowed`);
	const observedSide = requiredString(observedValue, "side");
	const observedInCheck = observedValue.in_check;
	const blackGeneral = requiredString(observedValue, "black_general");
	const redGeneral = requiredString(observedValue, "red_general");
	const candidateId = requiredString(value, "candidate_id");
	if (decisionId !== packet.decisionId || positionId !== packet.positionId) throw new XiangqiDecisionProtocolError("POSITION_MISMATCH", "decision_id or position_id does not match the frozen packet");
	if (observedSide !== packet.ruleFacts.turn || typeof observedInCheck !== "boolean" || observedInCheck !== packet.ruleFacts.inCheck || blackGeneral !== packet.ruleFacts.blackGeneral || redGeneral !== packet.ruleFacts.redGeneral) throw new XiangqiDecisionProtocolError("OBSERVATION_MISMATCH", "model observations do not match the frozen rule facts");
	if (!packet.candidates.some((candidate) => candidate.id === candidateId)) throw new XiangqiDecisionProtocolError("UNKNOWN_CANDIDATE", `candidate ${candidateId} is not in the frozen top five`);
	const summary = value.summary;
	if (summary !== void 0 && (typeof summary !== "string" || summary.includes("\n") || summary.length > 160)) throw new XiangqiDecisionProtocolError("INVALID_SHAPE", "summary must be one short line");
	return {
		decision_id: decisionId,
		position_id: positionId,
		observed: {
			side: "black",
			in_check: observedInCheck,
			black_general: blackGeneral,
			red_general: redGeneral
		},
		candidate_id: candidateId,
		...summary === void 0 ? {} : { summary }
	};
}
function sameFacts(left, right) {
	return left.turn === right.turn && left.inCheck === right.inCheck && left.legalMoveCount === right.legalMoveCount && left.blackGeneral === right.blackGeneral && left.redGeneral === right.redGeneral && left.halfmoveClock === right.halfmoveClock && left.fullmoveNumber === right.fullmoveNumber;
}
/** Recheck the frozen decision against the latest Host state immediately before commit. */
function validateXiangqiDecisionForCurrentState(packet, response, current) {
	if (current.gameId !== packet.gameId || current.revision !== packet.revision) throw new XiangqiDecisionProtocolError("POSITION_MISMATCH", "gameId or revision changed while the model was thinking");
	if (current.game.turn !== "black") throw new XiangqiDecisionProtocolError("NOT_BLACK_TURN", "the current position is no longer black to move");
	const boardEncoding = boardEncodingOf(current.game);
	const facts = ruleFactsOf(current.game);
	if (positionIdOf(current.gameId, current.revision, current.game, boardEncoding, facts) !== packet.positionId || toFen(current.game) !== packet.fen || !sameFacts(facts, packet.ruleFacts)) throw new XiangqiDecisionProtocolError("POSITION_MISMATCH", "the current Host position differs from the frozen packet");
	if (response.position_id !== packet.positionId || response.decision_id !== packet.decisionId) throw new XiangqiDecisionProtocolError("POSITION_MISMATCH", "model response is not for the current decision");
	if (response.observed.side !== facts.turn || response.observed.in_check !== facts.inCheck || response.observed.black_general !== facts.blackGeneral || response.observed.red_general !== facts.redGeneral) throw new XiangqiDecisionProtocolError("OBSERVATION_MISMATCH", "model response facts are stale");
	const candidate = packet.candidates.find((item) => item.id === response.candidate_id);
	if (candidate === void 0) throw new XiangqiDecisionProtocolError("UNKNOWN_CANDIDATE", `candidate ${response.candidate_id} is not frozen`);
	if (!getLegalMoves(current.game).some((move) => formatCoordinate(move.from) === candidate.from && formatCoordinate(move.to) === candidate.to)) throw new XiangqiDecisionProtocolError("ILLEGAL_CANDIDATE", `candidate ${candidate.id} is no longer legal`);
	return {
		from: candidate.from,
		to: candidate.to
	};
}
//#endregion
//#region lib/types/host/decision-error.js
/** A model/provider failure is not a protocol failure and must not be retried as bad JSON. */
var XiangqiDecisionModelError = class extends Error {
	failure;
	constructor(failure) {
		super(formatXiangqiDecisionFailure(failure));
		this.name = "XiangqiDecisionModelError";
		this.failure = Object.freeze({ ...failure });
	}
};
/** Keep the provider's useful diagnostic while making the failure actionable in the board UI. */
function formatXiangqiDecisionFailure(failure) {
	const detail = providerFailureDetail(failure.message);
	const status = failure.status ?? detail.status;
	if (isXiangqiRateLimitFailure(failure)) {
		const provider = detail.provider === void 0 ? "" : `；提供商：${detail.provider}`;
		return `模型提供商限流${status === void 0 ? "" : `（${status}）`}：上游暂时限流，请稍后重试${provider}。${detail.message}`;
	}
	if (failure.code === "EMPTY_RESPONSE") return `模型未返回可用内容：${detail.message}`;
	return `DSH 模型请求失败${failure.code.length === 0 ? "" : `（${failure.code}${status === void 0 ? "" : `/${status}`}）`}：${detail.message}`;
}
function isXiangqiRateLimitFailure(failure) {
	const detail = providerFailureDetail(failure.message);
	return failure.status === 429 || detail.status === 429 || failure.code === "RATE_LIMIT" || /(?:rate.?limit|temporarily\s+rate-limited|too many requests)/i.test(detail.message);
}
function providerFailureDetail(message) {
	const trimmed = message.trim();
	const prefix = /^(\d{3})\s*:\s*/.exec(trimmed);
	const status = prefix === null ? void 0 : Number(prefix[1]);
	const body = prefix === null ? trimmed : trimmed.slice(prefix[0].length);
	let parsed;
	try {
		parsed = JSON.parse(body);
	} catch {
		return {
			...status === void 0 ? {} : { status },
			message: trimmed
		};
	}
	if (!isRecord(parsed)) return {
		...status === void 0 ? {} : { status },
		message: trimmed
	};
	const metadata = isRecord(parsed.metadata) ? parsed.metadata : void 0;
	const providerRaw = metadata?.provider_name;
	const raw = metadata?.raw;
	const provider = typeof providerRaw === "string" && providerRaw.trim().length > 0 ? providerRaw.trim() : void 0;
	const nestedStatus = typeof parsed.code === "number" && Number.isInteger(parsed.code) && parsed.code >= 100 && parsed.code <= 599 ? parsed.code : void 0;
	const detailMessage = typeof raw === "string" && raw.trim().length > 0 ? raw.trim() : typeof parsed.message === "string" && parsed.message.trim().length > 0 ? parsed.message.trim() : trimmed;
	const resolvedStatus = status ?? nestedStatus;
	return {
		...resolvedStatus === void 0 ? {} : { status: resolvedStatus },
		...provider === void 0 ? {} : { provider },
		message: detailMessage
	};
}
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
//#endregion
//#region lib/types/host/game-adapter.js
/** Adapt the pure src/game rules to the Host service's transactional port. */
var XiangqiGameAdapter = class {
	state;
	constructor(state) {
		this.state = state;
	}
	move(move) {
		this.state = applyMove(this.state, {
			from: parseCoordinate(move.from),
			to: parseCoordinate(move.to)
		});
	}
	serialize() {
		return JSON.parse(serialize(this.state));
	}
};
/** Build the default Host factory over the repository's actual game core. */
function createXiangqiGameFactory() {
	return {
		create: () => new XiangqiGameAdapter(newGame()),
		restore: (state) => new XiangqiGameAdapter(deserialize(JSON.stringify(state)))
	};
}
//#endregion
//#region lib/types/host/service.js
/** All command-layer failures have the stable `xiangqi:` prefix. */
var XiangqiError = class extends Error {
	code;
	constructor(code, message) {
		const normalized = message.startsWith("xiangqi:") ? message.slice(8).trim() : message;
		super(`xiangqi: ${normalized}`);
		this.name = "XiangqiError";
		this.code = code;
	}
};
let generatedIdSequence = 0;
function defaultGameId() {
	generatedIdSequence += 1;
	return `game-${Date.now().toString(36)}-${generatedIdSequence.toString(36)}`;
}
function cloneJson(value) {
	const encoded = JSON.stringify(value);
	if (encoded === void 0) throw new Error("game state is not JSON serializable");
	return JSON.parse(encoded);
}
function messageOf$1(error) {
	return error instanceof Error ? error.message : String(error);
}
function wrap(error, code) {
	if (error instanceof XiangqiError) return error;
	return new XiangqiError(code, messageOf$1(error));
}
function requireText(value, field) {
	if (typeof value !== "string" || value.trim().length === 0) throw new XiangqiError("INVALID_INPUT", `${field} must be a non-empty string`);
	return value.trim();
}
function requireRevision(value) {
	if (!Number.isSafeInteger(value) || value < 1) throw new XiangqiError("INVALID_INPUT", "revision must be a positive safe integer");
	return value;
}
function requireSide(value) {
	if (value !== "red" && value !== "black") throw new XiangqiError("INVALID_INPUT", "side must be \"red\" or \"black\"");
	return value;
}
function validateMove(move) {
	if (move === null || typeof move !== "object") throw new XiangqiError("INVALID_MOVE", "move must be an object");
	const from = requireText(move.from, "move.from");
	const to = requireText(move.to, "move.to");
	if (from === to) throw new XiangqiError("INVALID_MOVE", "move.from and move.to must differ");
	return {
		from,
		to
	};
}
function otherSide(side) {
	return side === "red" ? "black" : "red";
}
/**
* 写操作防串局守卫（审查问题 2）：任何针对非当前全局棋局的写请求一律拒绝。
* 没有它，旧棋局的延迟/重复请求会把自己的 gameId 重新发布成"当前棋局"，
* 让新开的棋局被旧局面覆盖。
*/
function assertCurrentGame(currentGameId, requestedGameId) {
	if (currentGameId !== void 0 && requestedGameId !== currentGameId) throw new XiangqiError("GAME_NOT_CURRENT", `game "${requestedGameId}" is not the current game "${currentGameId}"; open or create the current game instead`);
}
/**
* Host-owned command service for one or more DSH/session chess games.
*
* It owns lifecycle, revision checks, transactional restore-before-commit,
* undo history, and publication. Rules remain in the injected src/game port.
*/
var XiangqiHostService = class {
	factory;
	games = /* @__PURE__ */ new Map();
	listeners = /* @__PURE__ */ new Set();
	createGameId;
	constructor(factory, options = {}) {
		this.factory = factory;
		this.createGameId = options.createGameId ?? defaultGameId;
	}
	/** Create and publish a new active game. */
	newGame(request = {}) {
		const sessionId = request.sessionId === void 0 ? void 0 : requireText(request.sessionId, "sessionId");
		const gameId = requireText(this.createGameId(), "gameId");
		if (this.games.has(gameId)) throw new XiangqiError("INVALID_INPUT", `game id "${gameId}" already exists`);
		let gameState;
		try {
			gameState = this.serialize(this.factory.create());
		} catch (error) {
			throw wrap(error, "GAME_CREATE");
		}
		const record = {
			gameId,
			...sessionId === void 0 ? {} : { sessionId },
			revision: 1,
			phase: "active",
			gameState,
			history: []
		};
		this.games.set(gameId, record);
		return this.commitAndPublish("newGame", record);
	}
	/** Read a defensive copy of a current game state. */
	get(gameId) {
		return this.snapshot(this.requireGame(gameId));
	}
	/**
	* Restore one projected game after a Host restart.
	*
	* The core snapshot already contains its own move history, so the restored
	* game can continue and can be inspected. Host-side undo history is rebuilt
	* only for mutations made after this restore boundary.
	*/
	restore(state) {
		const gameId = requireText(state.gameId, "gameId");
		const sessionId = state.sessionId === void 0 ? void 0 : requireText(state.sessionId, "sessionId");
		const revision = requireRevision(state.revision);
		if (state.phase !== "active" && state.phase !== "resigned") throw new XiangqiError("GAME_RESTORE", `unknown game phase: ${String(state.phase)}`);
		try {
			this.factory.restore(cloneJson(state.gameState));
		} catch (error) {
			throw wrap(error, "GAME_RESTORE");
		}
		this.games.set(gameId, {
			gameId,
			...sessionId === void 0 ? {} : { sessionId },
			revision,
			phase: state.phase,
			...state.winner === void 0 ? {} : { winner: state.winner },
			gameState: cloneJson(state.gameState),
			...state.lastMove === void 0 ? {} : { lastMove: { ...state.lastMove } },
			history: []
		});
	}
	/** Apply one move against an exact revision and publish only after commit. */
	move(request) {
		return this.commitMove(request);
	}
	/** Apply a previously validated DSH decision against the same revision fence. */
	moveWithDecision(request, decision) {
		if (decision.meta.source !== "dsh" || decision.meta.revision !== request.revision) throw new XiangqiError("INVALID_DECISION", "decision metadata does not match the move revision");
		return this.commitMove(request, decision.meta);
	}
	commitMove(request, decision) {
		const record = this.requireGame(request.gameId);
		this.assertRevision(record, request.revision);
		this.assertActive(record);
		const move = validateMove(request.move);
		let nextGameState;
		try {
			const workingGame = this.factory.restore(cloneJson(record.gameState));
			workingGame.move(move);
			nextGameState = this.serialize(workingGame);
		} catch (error) {
			throw wrap(error, "GAME_RULE");
		}
		record.history.push(this.historyEntry(record));
		record.gameState = nextGameState;
		record.lastMove = move;
		record.revision += 1;
		return this.commitAndPublish("move", record, decision);
	}
	/** Restore the last committed position against an exact revision. */
	undo(request) {
		const record = this.requireGame(request.gameId);
		this.assertRevision(record, request.revision);
		if (record.history.length === 0) throw new XiangqiError("NO_UNDO", "no committed move is available to undo");
		const previous = record.history[record.history.length - 1];
		try {
			this.factory.restore(cloneJson(previous.gameState));
		} catch (error) {
			throw wrap(error, "GAME_RESTORE");
		}
		record.history.pop();
		record.gameState = cloneJson(previous.gameState);
		record.phase = previous.phase;
		if (previous.winner === void 0) delete record.winner;
		else record.winner = previous.winner;
		if (previous.lastMove === void 0) delete record.lastMove;
		else record.lastMove = { ...previous.lastMove };
		record.revision += 1;
		return this.commitAndPublish("undo", record);
	}
	/** Mark one side as resigned and publish the committed result. */
	resign(request) {
		const record = this.requireGame(request.gameId);
		this.assertRevision(record, request.revision);
		this.assertActive(record);
		const side = requireSide(request.side);
		record.history.push(this.historyEntry(record));
		record.phase = "resigned";
		record.winner = otherSide(side);
		record.revision += 1;
		return this.commitAndPublish("resign", record);
	}
	/** Subscribe to committed state changes. The returned disposer is idempotent. */
	subscribe(listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}
	/**
	* Drop every game record except the named one and report how many were
	* removed. Called after a new game becomes current so stale games can never
	* be mutated back into existence.
	*/
	retainOnly(gameId) {
		const id = requireText(gameId, "gameId");
		let removed = 0;
		for (const key of [...this.games.keys()]) if (key !== id) {
			this.games.delete(key);
			removed += 1;
		}
		return removed;
	}
	serialize(game) {
		try {
			return cloneJson(game.serialize());
		} catch (error) {
			throw wrap(error, "GAME_SERIALIZE");
		}
	}
	requireGame(gameId) {
		const id = requireText(gameId, "gameId");
		const record = this.games.get(id);
		if (record === void 0) throw new XiangqiError("GAME_NOT_FOUND", `game "${id}" was not found`);
		return record;
	}
	assertRevision(record, expectedRevision) {
		const revision = requireRevision(expectedRevision);
		if (revision !== record.revision) throw new XiangqiError("STALE_REVISION", `stale revision ${revision}; current revision is ${record.revision}`);
	}
	assertActive(record) {
		if (record.phase !== "active") throw new XiangqiError("GAME_NOT_ACTIVE", `game "${record.gameId}" is ${record.phase}${record.winner === void 0 ? "" : `; winner is ${record.winner}`}`);
	}
	serializeRecord(record) {
		return {
			gameId: record.gameId,
			...record.sessionId === void 0 ? {} : { sessionId: record.sessionId },
			revision: record.revision,
			phase: record.phase,
			...record.winner === void 0 ? {} : { winner: record.winner },
			gameState: cloneJson(record.gameState),
			...record.lastMove === void 0 ? {} : { lastMove: { ...record.lastMove } }
		};
	}
	snapshot(record) {
		return this.serializeRecord(record);
	}
	historyEntry(record) {
		return {
			gameState: cloneJson(record.gameState),
			phase: record.phase,
			...record.winner === void 0 ? {} : { winner: record.winner },
			...record.lastMove === void 0 ? {} : { lastMove: { ...record.lastMove } }
		};
	}
	commitAndPublish(operation, record, decision) {
		const state = this.snapshot(record);
		const change = {
			operation,
			state,
			...decision === void 0 ? {} : { decision }
		};
		for (const listener of [...this.listeners]) listener(change);
		return state;
	}
};
//#endregion
//#region lib/types/host/route.js
/**
* 模型路由快照解析（审查第二轮 P0）：把"这一刻"拿到的模型选择原样变成
* 一次黑方请求的路由。纯函数、无副作用，方便对 off/xhigh/max 等
* 模型自定义思考级别做透传测试。
*/
/** 只保留非空字符串；空串/空白视为"未指定"。 */
function normalizeEffort(value) {
	if (typeof value !== "string") return void 0;
	const trimmed = value.trim();
	return trimmed.length === 0 ? void 0 : trimmed;
}
function firstNonEmpty(...values) {
	for (const value of values) if (value !== void 0 && value.trim().length > 0) return value;
}
/**
* 解析一次黑方决策的路由。provider/model 缺失时抛 INVALID_DECISION，
* 由上层转成用户可见的重试提示——绝不静默猜测模型。
*/
function resolveRouteFromSnapshot(sources) {
	const override = sources.override;
	const liveProvider = firstNonEmpty(sources.selectedModel?.provider, sources.headerConfig?.provider, sources.requestContext?.provider, sources.agentOptions?.provider);
	const liveModel = firstNonEmpty(sources.selectedModel?.model, sources.headerConfig?.model, sources.requestContext?.model, sources.agentOptions?.model);
	const provider = firstNonEmpty(override?.provider) ?? liveProvider;
	const model = firstNonEmpty(override?.model) ?? liveModel;
	if (provider === void 0 || model === void 0 || provider.trim().length === 0 || model.trim().length === 0) throw new XiangqiError("INVALID_DECISION", "当前会话还没有可用的 provider/model；请先在该会话完成一次对话，或在请求里显式指定模型");
	const overridesModel = firstNonEmpty(override?.provider) !== void 0 && firstNonEmpty(override?.model) !== void 0;
	const effort = override?.reasoningEffort !== void 0 ? normalizeEffort(override.reasoningEffort) : overridesModel ? void 0 : normalizeEffort(sources.selectedModel === void 0 ? sources.headerConfig?.reasoningEffort : sources.selectedModel.reasoningEffort);
	return {
		provider: provider.trim(),
		model: model.trim(),
		reasoningEffort: effort ?? "auto"
	};
}
//#endregion
//#region lib/types/host/decision-gate.js
/**
* 卸载安全闸门（审查第二轮 P0）：跟踪唯一在跑的黑方决策。
* 插件卸载/HMR 重载时 destroy() 后：新决策不能开始，旧结果不能提交，
* 取消动作不再有目标——所有路径都可单测，不依赖 cordis 运行时。
*/
var XiangqiDecisionGate = class {
	destroyed = false;
	activeId;
	/** 服务是否已进入卸载流程。 */
	get isDestroyed() {
		return this.destroyed;
	}
	/** 当前被认可的活动决策 id；没有则为 undefined。 */
	get currentDecisionId() {
		return this.activeId;
	}
	/** 尝试开始一条新决策；已销毁或已有活动决策时拒绝。 */
	begin(decisionId) {
		if (this.destroyed || this.activeId !== void 0) return false;
		this.activeId = decisionId;
		return true;
	}
	/**
	* 提交闸门：只有"未销毁且该决策仍是活动者"才允许把模型结果落子。
	* 卸载后返回的旧结果在这里被拦下。
	*/
	canCommit(decisionId) {
		return !this.destroyed && this.activeId === decisionId;
	}
	/** 决策终态后清除活动标记；返回该决策此前是否确实是活动者。 */
	settle(decisionId) {
		if (this.activeId !== decisionId) return false;
		this.activeId = void 0;
		return true;
	}
	/** 取消当前活动决策；返回被取消的 decisionId 或 undefined。 */
	cancel() {
		const id = this.activeId;
		this.activeId = void 0;
		return id;
	}
	/** 卸载：此后 begin/canCommit 永远失败。不可逆。 */
	destroy() {
		this.destroyed = true;
		this.activeId = void 0;
	}
};
//#endregion
//#region lib/types/host/trace-timing.js
/**
* 决策追踪计时规则（审查第二轮 P1）：只有正在运行的决策耗时才动态增长；
* 进入 completed/failed/cancelled 任一终态后，耗时以首次终态时刻为准冻结。
*/
const TERMINAL_PHASES = [
	"completed",
	"failed",
	"cancelled"
];
/** 该阶段是否为决策终态。 */
function isTerminalPhase(phase) {
	return TERMINAL_PHASES.includes(phase);
}
/**
* 计算展示用耗时：已结束的决策用定格的 endedAt，运行中的用当前时间。
* `endedAt` 一旦写入就不再改变（由调用方保证只写一次）。
*/
function freezeElapsedMs(startedAt, endedAt, now) {
	return Math.max(0, (endedAt ?? now) - startedAt);
}
//#endregion
//#region lib/types/host/dsh-service.js
/** DSH Host service: one in-memory global Chinese chess state. */
var __runInitializers = function(thisArg, initializers, value) {
	var useValue = arguments.length > 2;
	for (var i = 0; i < initializers.length; i++) value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
	return useValue ? value : void 0;
};
var __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
	function accept(f) {
		if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
		return f;
	}
	var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
	var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
	var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
	var _, done = false;
	for (var i = decorators.length - 1; i >= 0; i--) {
		var context = {};
		for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
		for (var p in contextIn.access) context.access[p] = contextIn.access[p];
		context.addInitializer = function(f) {
			if (done) throw new TypeError("Cannot add initializers after decoration has completed");
			extraInitializers.push(accept(f || null));
		};
		var result = (0, decorators[i])(kind === "accessor" ? {
			get: descriptor.get,
			set: descriptor.set
		} : descriptor[key], context);
		if (kind === "accessor") {
			if (result === void 0) continue;
			if (result === null || typeof result !== "object") throw new TypeError("Object expected");
			if (_ = accept(result.get)) descriptor.get = _;
			if (_ = accept(result.set)) descriptor.set = _;
			if (_ = accept(result.init)) initializers.unshift(_);
		} else if (_ = accept(result)) {
			if (kind === "field") initializers.unshift(_);
			else descriptor[key] = _;
		}
	}
	if (target) Object.defineProperty(target, contextIn.name, descriptor);
	done = true;
};
const DEFAULT_LOCAL_SEARCH_TIME_MS = 180;
const DEFAULT_PROTOCOL_RETRY_COUNT = 1;
const DEFAULT_MAX_OUTPUT_TOKENS = 4096;
const DECISION_SYSTEM_PROMPT = [
	"You are the black-side move selector for a Chinese chess game.",
	"The Host owns the board and commits moves only after validation.",
	"Do not call any tool and do not invent a move outside packet.candidates.",
	"Return exactly one JSON object and no Markdown, prose, or extra field.",
	"Allowed keys are: decision_id, position_id, observed, candidate_id, summary.",
	"observed must contain only side, in_check, black_general, red_general.",
	"Do not output from, to, a move string, or a new candidate.",
	"Choose candidate_id only from the newest packet.candidates. observed.side must be black.",
	"Use the newest packet rule facts exactly. summary is optional and must be one short line."
].join(" ");
function messageOf(error) {
	return error instanceof Error ? error.message : String(error);
}
function isAborted(signal) {
	return signal.aborted;
}
function finishError(finish) {
	if (finish.kind === "stop" || finish.kind === "max-tokens") return void 0;
	if (finish.kind === "aborted") return new XiangqiDecisionModelError(finish.failure);
	if (finish.kind === "error") return new XiangqiDecisionModelError(finish.failure);
	return /* @__PURE__ */ new Error(`unsupported LLM finish reason: ${finish.kind}`);
}
/**
* Host-side service loaded by the bundle patch. Every Remote method starts
* with Agent so Typert maps the client SessionId to the exact live agent.
*/
let XiangqiService = (() => {
	let _classSuper = TypertRemoteService;
	let _instanceExtraInitializers = [];
	let _getRuntimeState_decorators;
	let _newGame_decorators;
	let _get_decorators;
	let _getDecisionTrace_decorators;
	let _move_decorators;
	let _undo_decorators;
	let _resign_decorators;
	let _cancelAiMove_decorators;
	let _requestAiMove_decorators;
	return class XiangqiService extends _classSuper {
		static {
			const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
			_getRuntimeState_decorators = [Remote("getRuntimeState")];
			_newGame_decorators = [Remote("newGame")];
			_get_decorators = [Remote("get")];
			_getDecisionTrace_decorators = [Remote("getDecisionTrace")];
			_move_decorators = [Remote("move")];
			_undo_decorators = [Remote("undo")];
			_resign_decorators = [Remote("resign")];
			_cancelAiMove_decorators = [Remote("cancelAiMove")];
			_requestAiMove_decorators = [Remote("requestAiMove")];
			__esDecorate(this, null, _getRuntimeState_decorators, {
				kind: "method",
				name: "getRuntimeState",
				static: false,
				private: false,
				access: {
					has: (obj) => "getRuntimeState" in obj,
					get: (obj) => obj.getRuntimeState
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _newGame_decorators, {
				kind: "method",
				name: "newGame",
				static: false,
				private: false,
				access: {
					has: (obj) => "newGame" in obj,
					get: (obj) => obj.newGame
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _get_decorators, {
				kind: "method",
				name: "get",
				static: false,
				private: false,
				access: {
					has: (obj) => "get" in obj,
					get: (obj) => obj.get
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _getDecisionTrace_decorators, {
				kind: "method",
				name: "getDecisionTrace",
				static: false,
				private: false,
				access: {
					has: (obj) => "getDecisionTrace" in obj,
					get: (obj) => obj.getDecisionTrace
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _move_decorators, {
				kind: "method",
				name: "move",
				static: false,
				private: false,
				access: {
					has: (obj) => "move" in obj,
					get: (obj) => obj.move
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _undo_decorators, {
				kind: "method",
				name: "undo",
				static: false,
				private: false,
				access: {
					has: (obj) => "undo" in obj,
					get: (obj) => obj.undo
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _resign_decorators, {
				kind: "method",
				name: "resign",
				static: false,
				private: false,
				access: {
					has: (obj) => "resign" in obj,
					get: (obj) => obj.resign
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _cancelAiMove_decorators, {
				kind: "method",
				name: "cancelAiMove",
				static: false,
				private: false,
				access: {
					has: (obj) => "cancelAiMove" in obj,
					get: (obj) => obj.cancelAiMove
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _requestAiMove_decorators, {
				kind: "method",
				name: "requestAiMove",
				static: false,
				private: false,
				access: {
					has: (obj) => "requestAiMove" in obj,
					get: (obj) => obj.requestAiMove
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			if (_metadata) Object.defineProperty(this, Symbol.metadata, {
				enumerable: true,
				configurable: true,
				writable: true,
				value: _metadata
			});
		}
		static inject = [
			"agents",
			"llm",
			"sessionProjections"
		];
		gate = (__runInitializers(this, _instanceExtraInitializers), new XiangqiDecisionGate());
		game;
		decisions = /* @__PURE__ */ new Set();
		constructor(ctx) {
			super(ctx, "xiangqi");
			const service = new XiangqiHostService(createXiangqiGameFactory());
			this.game = {
				service,
				currentGameId: void 0,
				pending: void 0,
				decisionSequence: 0,
				trace: void 0
			};
			ctx.on("agent/disposed", ({ agent }) => {
				if (this.game.pending?.agent === agent) this.cancelPending(this.game);
			});
			service.subscribe((change) => {
				this.game.currentGameId = change.state.gameId;
			});
			ctx.effect(() => () => this.destroy(), "xiangqi: dispose gate");
		}
		/** 卸载闸门：销毁后所有写路径与模型结果提交都被拒绝。 */
		async destroy() {
			this.gate.destroy();
			this.cancelPending(this.game);
			await Promise.all(this.decisions);
			this.game.trace = void 0;
		}
		/**
		* 原子读取 Host 运行状态（审查第二轮 P1）：任意标签页一次调用即可拿到
		* 当前棋局、"Host 是否真的有决策在跑"与决策追踪，不再依赖本页面自己
		* 发起的请求来猜测全局状态。
		*/
		getRuntimeState(agent) {
			const game = this.gameFor(agent);
			if (game.currentGameId === void 0) return {
				state: null,
				aiPending: false,
				phase: null,
				trace: null
			};
			const trace = game.trace === void 0 ? null : this.snapshotDecisionTrace(game.trace);
			return {
				state: game.service.get(game.currentGameId),
				aiPending: game.pending !== void 0,
				phase: game.trace === void 0 ? null : game.trace.phase,
				trace
			};
		}
		/** Start one new global game; switching chats never creates one implicitly. */
		newGame(agent, _request) {
			const game = this.gameFor(agent);
			this.cancelPending(game);
			game.trace = void 0;
			const state = game.service.newGame({});
			game.service.retainOnly(state.gameId);
			return state;
		}
		/**
		* Read the one process-global game. The first read creates the initial game
		* when this DSH Host has no game yet; switching chats only reads this same
		* game and never creates another one.
		*/
		get(agent, gameId) {
			const game = this.gameFor(agent);
			if (gameId !== void 0) return game.service.get(gameId);
			if (game.currentGameId === void 0) {
				this.cancelPending(game);
				return game.service.newGame({});
			}
			return game.service.get(game.currentGameId);
		}
		/** Read the latest non-durable DSH decision trace for the process-global game. */
		getDecisionTrace(agent, gameId) {
			const game = this.gameFor(agent);
			if (game.trace === void 0) return null;
			if (gameId !== void 0 && game.trace.gameId !== gameId) return null;
			return this.snapshotDecisionTrace(game.trace);
		}
		/** Apply one revision-fenced move. */
		move(agent, request) {
			const game = this.gameFor(agent);
			assertCurrentGame(game.currentGameId, request.gameId);
			this.cancelPending(game);
			return game.service.move(request);
		}
		/** Undo one committed move. */
		undo(agent, request) {
			const game = this.gameFor(agent);
			assertCurrentGame(game.currentGameId, request.gameId);
			this.cancelPending(game);
			return game.service.undo(request);
		}
		/** Mark one side as resigned. */
		resign(agent, request) {
			const game = this.gameFor(agent);
			assertCurrentGame(game.currentGameId, request.gameId);
			this.cancelPending(game);
			return game.service.resign(request);
		}
		/** Cancel the in-flight lightweight DSH decision without changing the game revision. */
		cancelAiMove(agent) {
			return { cancelled: this.cancelPending(this.gameFor(agent)) };
		}
		/** Ask the selected DSH model for one frozen-candidate decision, then commit it. */
		async requestAiMove(agent, request) {
			if (this.gate.isDestroyed) return this.failedAiMove(request, "DECISION_CANCELLED", "象棋插件正在卸载，请重新打开棋盘后再试");
			const game = this.gameFor(agent);
			if (game.currentGameId !== void 0 && game.currentGameId !== request.gameId) return this.failedAiMove(request, "STALE_GAME", "当前会话已经切换到另一盘棋局");
			let current;
			try {
				current = game.service.get(request.gameId);
			} catch (error) {
				if (error instanceof XiangqiError && error.code === "GAME_NOT_FOUND") return this.failedAiMove(request, "STALE_GAME", error.message);
				throw error;
			}
			if (current.revision !== request.revision) return {
				status: "stale",
				gameId: request.gameId,
				revision: current.revision,
				message: `棋局已进入 revision ${current.revision}`
			};
			if (current.phase !== "active") return this.failedAiMove(request, "NOT_BLACK_TURN", "棋局已经结束");
			let currentGame;
			try {
				currentGame = deserialize(JSON.stringify(current.gameState));
			} catch (error) {
				return this.failedAiMove(request, "MODEL_ERROR", `无法读取当前棋局：${messageOf(error)}`);
			}
			if (currentGame.turn !== "black") return this.failedAiMove(request, "NOT_BLACK_TURN", "当前不是黑方回合");
			if (game.pending !== void 0) return this.failedAiMove(request, "DECISION_IN_PROGRESS", "当前棋局已有一条 DSH 决策正在进行");
			const decisionId = `decision-${request.gameId}-${request.revision}-${game.decisionSequence + 1}`;
			game.decisionSequence += 1;
			if (!this.gate.begin(decisionId)) return this.failedAiMove(request, "DECISION_IN_PROGRESS", "当前棋局已有一条 DSH 决策正在进行");
			const pending = {
				agent,
				decisionId,
				gameId: request.gameId,
				revision: request.revision,
				controller: new AbortController()
			};
			game.pending = pending;
			const completion = Promise.withResolvers();
			this.decisions.add(completion.promise);
			const startedAt = Date.now();
			try {
				const route = this.resolveDecisionRoute(agent, request);
				this.startDecisionTrace(game, pending, route);
				this.updateDecisionTrace(game, decisionId, "preparing", "正在生成冻结局面和合法候选着法", {
					speaker: "host",
					kind: "status",
					text: "Host 已锁定当前棋局和 revision，开始准备发给 DSH 的决策包。"
				});
				const packet = buildXiangqiDecisionPacket(currentGame, {
					gameId: request.gameId,
					revision: request.revision,
					...current.lastMove === void 0 ? {} : { lastMove: current.lastMove }
				}, decisionId, { localSearchTimeMs: DEFAULT_LOCAL_SEARCH_TIME_MS });
				const candidates = packet.candidates.map((candidate) => `${candidate.id} ${candidate.from}-${candidate.to}`).join("、");
				this.updateDecisionTrace(game, decisionId, "requesting", "已发送决策请求，等待 DSH 首个输出", {
					speaker: "host",
					kind: "request",
					text: `发送给 DSH：黑方当前局面（${packet.fen}），合法候选 ${candidates || "无"}。`
				});
				this.updateDecisionTrace(game, decisionId, "requesting", "已发送决策请求，等待 DSH 首个输出", {
					speaker: "host",
					kind: "status",
					text: `调用 ${route.provider}/${route.model}，思考程度 ${route.reasoningEffort}。`
				});
				const response = await this.obtainDecision(route, packet, pending.controller.signal, DEFAULT_PROTOCOL_RETRY_COUNT, (chunk) => {
					this.observeDecisionChunk(game, decisionId, chunk);
				}, (attempt, message) => {
					this.updateDecisionTrace(game, decisionId, "requesting", `第 ${attempt} 次请求，等待 DSH 返回`, {
						speaker: "host",
						kind: "status",
						text: message
					});
				});
				pending.controller.signal.throwIfAborted();
				if (!this.gate.canCommit(decisionId)) {
					this.updateDecisionTrace(game, decisionId, "cancelled", "DSH 决策已取消，未提交落子", {
						speaker: "host",
						kind: "status",
						text: "当前决策已经被取消，棋局 revision 保持不变。"
					});
					return this.failedAiMove(request, game.currentGameId === request.gameId ? "DECISION_CANCELLED" : "STALE_GAME", game.currentGameId === request.gameId ? "DSH 决策已取消" : "当前会话已经切换到另一盘棋局");
				}
				this.updateDecisionTrace(game, decisionId, "validating", "收到 DSH 结构化返回，正在校验", {
					speaker: "dsh",
					kind: "response",
					text: `DSH 返回：选择 ${response.candidate_id}${response.summary === void 0 ? "" : `；${response.summary}`}`
				});
				const latest = game.service.get(request.gameId);
				const latestGame = deserialize(JSON.stringify(latest.gameState));
				if (latest.revision !== request.revision) {
					this.updateDecisionTrace(game, decisionId, "failed", "局面已变化，未提交 DSH 落子", {
						speaker: "host",
						kind: "error",
						text: `校验失败：棋局已经进入 revision ${latest.revision}。`
					});
					return {
						status: "stale",
						gameId: request.gameId,
						revision: latest.revision,
						message: `棋局已进入 revision ${latest.revision}`
					};
				}
				const move = validateXiangqiDecisionForCurrentState(packet, response, {
					gameId: latest.gameId,
					revision: latest.revision,
					game: latestGame
				});
				this.updateDecisionTrace(game, decisionId, "committing", "DSH 选择已通过 Host 合法性校验，正在提交", {
					speaker: "host",
					kind: "status",
					text: `校验通过：${response.candidate_id} 对应的着法合法，开始提交黑方落子。`
				});
				const meta = {
					source: "dsh",
					decisionId,
					provider: route.provider,
					model: route.model,
					candidateId: response.candidate_id,
					revision: request.revision,
					latencyMs: Math.max(0, Date.now() - startedAt),
					...response.summary === void 0 ? {} : { summary: response.summary }
				};
				const state = game.service.moveWithDecision({
					gameId: request.gameId,
					revision: request.revision,
					move
				}, {
					move,
					meta
				});
				this.updateDecisionTrace(game, decisionId, "completed", `DSH 已完成落子（${meta.latencyMs} ms）`, {
					speaker: "host",
					kind: "status",
					text: `Host 已提交黑方着法，当前 revision 为 ${state.revision}。`
				});
				return {
					status: "moved",
					state,
					decision: meta
				};
			} catch (error) {
				if (isAborted(pending.controller.signal)) {
					this.updateDecisionTrace(game, decisionId, "cancelled", "DSH 决策已取消，未提交落子", {
						speaker: "host",
						kind: "status",
						text: "请求已中止，棋局 revision 保持不变。"
					});
					return this.failedAiMove(request, "DECISION_CANCELLED", "DSH 决策已取消");
				}
				if (error instanceof XiangqiDecisionProtocolError) {
					this.updateDecisionTrace(game, decisionId, "failed", "DSH 返回未通过协议校验", {
						speaker: "host",
						kind: "error",
						text: error.message
					});
					return this.failedAiMove(request, "INVALID_DECISION", error.message);
				}
				if (error instanceof XiangqiError && error.code === "STALE_REVISION") {
					this.updateDecisionTrace(game, decisionId, "failed", "局面已变化，未提交 DSH 落子", {
						speaker: "host",
						kind: "error",
						text: error.message
					});
					return {
						status: "stale",
						gameId: request.gameId,
						revision: game.service.get(request.gameId).revision,
						message: error.message
					};
				}
				const failure = error instanceof XiangqiDecisionModelError ? error.failure : void 0;
				const rateLimited = failure !== void 0 && isXiangqiRateLimitFailure(failure);
				this.updateDecisionTrace(game, decisionId, "failed", rateLimited ? "模型提供商限流，未提交落子" : "DSH 请求失败，未提交落子", {
					speaker: "host",
					kind: "error",
					text: messageOf(error)
				});
				return this.failedAiMove(request, "MODEL_ERROR", messageOf(error));
			} finally {
				this.gate.settle(decisionId);
				if (game.pending?.decisionId === decisionId) game.pending = void 0;
				this.decisions.delete(completion.promise);
				completion.resolve();
			}
		}
		gameFor(agent) {
			this.assertLiveAgent(agent);
			return this.game;
		}
		assertLiveAgent(agent) {
			if (this.ctx.agents.get(agent.id) !== agent) throw new XiangqiError("INVALID_INPUT", "the calling DSH agent is no longer live");
		}
		failedAiMove(request, code, message) {
			return {
				status: "failed",
				code,
				gameId: request.gameId,
				revision: request.revision,
				message
			};
		}
		startDecisionTrace(game, pending, route) {
			game.trace = {
				decisionId: pending.decisionId,
				gameId: pending.gameId,
				revision: pending.revision,
				provider: route.provider,
				model: route.model,
				reasoningEffort: route.reasoningEffort,
				startedAt: Date.now(),
				phase: "preparing",
				phaseText: "正在准备 DSH 决策",
				outputChars: 0,
				reasoningDeltaCount: 0,
				entrySequence: 0,
				entries: []
			};
			this.updateDecisionTrace(game, pending.decisionId, "preparing", "正在准备 DSH 决策", {
				speaker: "host",
				kind: "status",
				text: `开始处理 gameId=${pending.gameId}、revision=${pending.revision} 的黑方回合。`
			});
		}
		updateDecisionTrace(game, decisionId, phase, phaseText, entry) {
			const trace = game.trace;
			if (trace === void 0 || trace.decisionId !== decisionId) return;
			trace.phase = phase;
			trace.phaseText = phaseText;
			if (isTerminalPhase(phase) && trace.endedAt === void 0) trace.endedAt = Date.now();
			if (entry !== void 0) {
				trace.entrySequence += 1;
				trace.entries.push({
					...entry,
					id: trace.entrySequence,
					elapsedMs: Math.max(0, Date.now() - trace.startedAt)
				});
				if (trace.entries.length > 40) trace.entries.splice(0, trace.entries.length - 40);
			}
		}
		observeDecisionChunk(game, decisionId, chunk) {
			const trace = game.trace;
			if (trace === void 0 || trace.decisionId !== decisionId) return;
			if (chunk.type === "reasoning-delta" && chunk.text.length > 0) {
				trace.reasoningDeltaCount += 1;
				if (trace.phase !== "receiving") this.updateDecisionTrace(game, decisionId, "receiving", "DSH 已开始返回流式输出", {
					speaker: "dsh",
					kind: "status",
					text: "DSH 已开始输出；面板只展示可观察进度，不展开隐藏思维内容。"
				});
				else trace.phaseText = `DSH 正在输出（已接收 ${trace.reasoningDeltaCount} 段思考流）`;
				return;
			}
			if (chunk.type === "text-delta" && chunk.text.length > 0) {
				trace.outputChars += chunk.text.length;
				if (trace.phase !== "receiving") this.updateDecisionTrace(game, decisionId, "receiving", "DSH 已开始返回结构化结果", {
					speaker: "dsh",
					kind: "status",
					text: "DSH 已开始返回结构化结果。"
				});
				else trace.phaseText = `DSH 正在返回结构化结果（已接收 ${trace.outputChars} 字）`;
				return;
			}
			if (chunk.type === "finish") trace.phaseText = "DSH 输出已结束，正在解析返回内容";
		}
		snapshotDecisionTrace(trace) {
			return {
				decisionId: trace.decisionId,
				gameId: trace.gameId,
				revision: trace.revision,
				phase: trace.phase,
				phaseText: trace.phaseText,
				provider: trace.provider,
				model: trace.model,
				reasoningEffort: trace.reasoningEffort,
				elapsedMs: freezeElapsedMs(trace.startedAt, trace.endedAt, Date.now()),
				outputChars: trace.outputChars,
				reasoningDeltaCount: trace.reasoningDeltaCount,
				entries: trace.entries.map((entry) => ({ ...entry }))
			};
		}
		/** Resolve the decision route from an explicit override or the session snapshot. */
		resolveDecisionRoute(agent, request) {
			const override = request.modelOverride;
			const selection = this.ctx.sessionProjections.stateOf(agent.session, "modelSelection");
			if (selection === void 0) throw new XiangqiError("INVALID_DECISION", "DSH modelSelection 投影尚未注册，无法读取当前模型选择");
			const header = agent.session.requestHeader();
			const headerConfig = header?.config;
			const requestContext = agent.session.requestContext();
			return resolveRouteFromSnapshot({
				...override === void 0 ? {} : { override },
				...selection.pending === null ? {} : { selectedModel: selection.pending },
				...headerConfig === void 0 ? {} : { headerConfig: {
					provider: headerConfig.provider,
					model: headerConfig.model,
					reasoningEffort: header?.adapterDefaults?.reasoningEffort === true ? void 0 : headerConfig.reasoningEffort
				} },
				...requestContext === void 0 ? {} : { requestContext },
				agentOptions: agent.options
			});
		}
		async obtainDecision(route, packet, signal, retryCount, observeChunk, onRetry) {
			for (let attempt = 0; attempt <= retryCount; attempt += 1) try {
				return parseXiangqiDecisionResponse(await this.streamDecision(route, packet, signal, observeChunk), packet);
			} catch (error) {
				if (!(error instanceof XiangqiDecisionProtocolError) || attempt >= retryCount) throw error;
				onRetry(attempt + 2, `第 ${attempt + 1} 次返回未通过协议校验：${error.message}`);
			}
			throw new Error("unreachable decision retry state");
		}
		async streamDecision(route, packet, signal, observeChunk) {
			signal.throwIfAborted();
			const requested = {
				provider: route.provider,
				model: route.model,
				maxTokens: DEFAULT_MAX_OUTPUT_TOKENS,
				...route.reasoningEffort === "auto" ? {} : { reasoningEffort: ReasoningEffortId(route.reasoningEffort) }
			};
			const resolved = await this.ctx.llm.resolveCallConfig(requested, signal);
			const options = deepFreeze({
				...resolved,
				messages: [createUserMessage({
					content: [{
						type: "text",
						text: `Frozen Chinese chess decision packet:\n${JSON.stringify(packet)}`
					}],
					source: {
						kind: "plugin",
						plugin: "dsh-plugin-xiangqi"
					}
				})],
				system: DECISION_SYSTEM_PROMPT,
				maxTokens: DEFAULT_MAX_OUTPUT_TOKENS,
				signal
			});
			const assembler = new BlockAssembler();
			for await (const chunk of this.ctx.llm.stream(options)) {
				signal.throwIfAborted();
				observeChunk(chunk);
				assembler.push(chunk);
			}
			signal.throwIfAborted();
			if (assembler.finish.kind === "tool-calls") throw new XiangqiDecisionProtocolError("INVALID_SHAPE", "model returned a tool call instead of JSON");
			const terminalError = finishError(assembler.finish);
			if (terminalError !== void 0) throw terminalError;
			const blocks = assembler.blocks();
			if (blocks.some((block) => block.type === "tool-call")) throw new XiangqiDecisionProtocolError("INVALID_SHAPE", "model returned a tool call instead of JSON");
			const text = blocks.filter((block) => block.type === "text").map((block) => block.text).join("");
			if (text.trim().length === 0) throw new XiangqiDecisionModelError({
				message: `模型未返回可用内容：${assembler.finish.kind === "max-tokens" ? "输出预算很可能已被隐藏思考全部占用；可在会话的模型选择里调低思考程度（例如 high/medium）后重试" : "模型完成响应但没有返回可见内容"}`,
				code: "EMPTY_RESPONSE"
			});
			return text;
		}
		cancelPending(game) {
			const pending = game.pending;
			if (pending === void 0) return false;
			this.updateDecisionTrace(game, pending.decisionId, "cancelled", "DSH 决策已取消，未提交落子", {
				speaker: "host",
				kind: "status",
				text: "当前请求已被取消，棋局 revision 保持不变。"
			});
			pending.controller.abort();
			game.pending = void 0;
			this.gate.cancel();
			return true;
		}
	};
})();
//#endregion
//#region lib/types/index.js
/** Host package entry for the DSH Chinese chess bundle. */
var types_default = XiangqiService;
//#endregion
export { XiangqiError, XiangqiHostService, XiangqiService, assertCurrentGame, createXiangqiGameFactory, types_default as default };
