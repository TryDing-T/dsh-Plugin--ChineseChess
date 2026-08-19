import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { defineTool } from "@deepseek-ai/dsh-tools";
import { z } from "zod";
//#endregion
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
	return CHINESE_NUMBERS[(side === "red" ? 9 - x : x + 1) - 1];
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
function otherSide$1(side) {
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
		if (piece.type === "general") if (piece.side === "red") redGeneralCount += 1;
		else blackGeneralCount += 1;
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
	const nextTurn = otherSide$1(game.turn);
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
	const inCheck = isSquareAttacked(board, general, otherSide$1(turn));
	if (generateLegalMoves(board, turn).length > 0) return {
		inCheck,
		status: "playing",
		winner: null
	};
	if (inCheck) return {
		inCheck,
		status: "checkmate",
		winner: otherSide$1(turn)
	};
	return {
		inCheck,
		status: "stalemate",
		winner: null
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
			if (!hasScreen) if (piece === null) targets.push({
				x,
				y
			});
			else hasScreen = true;
			else if (piece !== null) {
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
	return isSquareAttacked(board, general, otherSide$1(side));
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
	if (!isRecord(value) || value.version !== 1 || typeof value.fen !== "string") throw new InvalidPositionError("不支持的棋局序列化格式");
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
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function parseHistory(value) {
	if (!Array.isArray(value)) throw new InvalidPositionError("棋局历史必须是数组");
	return value.map((item, index) => parseMoveRecord(item, index));
}
function parseMoveRecord(value, index) {
	if (!isRecord(value)) throw new InvalidPositionError(`历史第 ${index + 1} 步格式错误`);
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
	if (isRecord(value) && typeof value.x === "number" && typeof value.y === "number") try {
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
	if (!isRecord(value) || value.side !== "red" && value.side !== "black" || !isPieceType(value.type)) throw new InvalidPositionError(`${label}格式错误`);
	return {
		side: value.side,
		type: value.type
	};
}
function isPieceType(value) {
	return value === "general" || value === "advisor" || value === "elephant" || value === "horse" || value === "rook" || value === "cannon" || value === "soldier";
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
function messageOf(error) {
	return error instanceof Error ? error.message : String(error);
}
function wrap(error, code) {
	if (error instanceof XiangqiError) return error;
	return new XiangqiError(code, messageOf(error));
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
		return this.commitAndPublish("move", record);
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
	commitAndPublish(operation, record) {
		const state = this.snapshot(record);
		const change = {
			operation,
			state
		};
		for (const listener of [...this.listeners]) listener(change);
		return state;
	}
};
//#endregion
//#region lib/types/host/runtime-tool.js
/** DSH-native model tool registration for the Chinese chess Host service. */
const ACTIONS$1 = [
	"new_game",
	"get",
	"move",
	"undo",
	"resign"
];
const OUTPUT_SCHEMA = {
	type: "object",
	additionalProperties: false,
	properties: {
		ok: {
			type: "boolean",
			required: true
		},
		action: {
			type: "string",
			required: true,
			enum: ACTIONS$1
		},
		state: {
			type: "json",
			required: true
		},
		message: {
			type: "string",
			required: true
		}
	}
};
function render(_args, value) {
	return [{
		type: "text",
		text: JSON.stringify(value)
	}];
}
function stateRecord(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function execute(service, args, exec) {
	const agent = exec.agent;
	if (agent === void 0) throw new XiangqiError("INVALID_INPUT", "the Chinese chess tool requires a calling DSH agent");
	const value = service.executeTool(agent, args);
	return Promise.resolve({
		ok: value.ok,
		action: value.action,
		state: JSON.parse(JSON.stringify(value.state)),
		message: value.message
	});
}
/** Create the actual rc.7 ToolDefinition after the Host service is mounted. */
function createXiangqiRuntimeTool(service) {
	return defineTool({
		name: "xiangqi_game",
		description: "Play Chinese chess in the current DSH session. Use new_game first. When the current game_id and revision are already supplied by the latest state, call move directly; use get only when the current state is genuinely unavailable. Mutating actions require the exact game_id and revision returned by the latest successful result. Coordinates use the chess UI format, for example e3 to e4. Use undo only for a committed move, and resign only when the user explicitly requests it.",
		parameters: {
			action: {
				type: "string",
				required: true,
				enum: ACTIONS$1,
				description: "new_game | get | move | undo | resign."
			},
			game_id: {
				type: "string",
				description: "Exact game_id from the latest successful result."
			},
			revision: {
				type: "integer",
				description: "Exact current revision from the latest successful result."
			},
			from: {
				type: "string",
				description: "Source coordinate, for example e3."
			},
			to: {
				type: "string",
				description: "Destination coordinate, for example e4."
			},
			side: {
				type: "string",
				enum: ["red", "black"],
				description: "Side resigning; required for resign."
			}
		},
		output: {
			schema: OUTPUT_SCHEMA,
			render,
			presentationMeta: (_args, value) => {
				const state = stateRecord(value.state);
				return {
					action: value.action,
					gameId: typeof state.gameId === "string" ? state.gameId : "",
					revision: typeof state.revision === "number" ? state.revision : 0
				};
			}
		},
		timeoutMs: 2e3,
		isConcurrencySafe: () => false,
		execute: (args, exec) => execute(service, args, exec)
	});
}
//#endregion
//#region lib/types/projection.js
/** Session projection unit for the latest committed Chinese chess state. */
/**
* The event append boundary performs the detailed state validation. The
* projection registry still needs a Zod schema at its outbound boundary; the
* JSON-safe domain type is intentionally validated as an opaque whole here so
* future core fields can be added without duplicating the game schema.
*/
const xiangqiProjectionSchema = z.unknown();
function applyXiangqiProjection(state, event) {
	if (event.type !== "xiangqi/change") return state;
	return event.data.state;
}
function viewXiangqiProjection(state) {
	return state;
}
//#endregion
//#region lib/types/host/dsh-service.js
/** DSH Host service: per-session Chinese chess state, Remote methods, tool, and projection. */
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
		} else if (_ = accept(result)) if (kind === "field") initializers.unshift(_);
		else descriptor[key] = _;
	}
	if (target) Object.defineProperty(target, contextIn.name, descriptor);
	done = true;
};
function asSessionEvent(event) {
	return event.type === "xiangqi/change";
}
function lastProjection(session) {
	let state = null;
	for (const event of session.events) if (asSessionEvent(event)) state = event.data.state;
	return state;
}
function requireGameId(value) {
	if (value === void 0 || value.trim().length === 0) throw new XiangqiError("GAME_NOT_FOUND", "no Chinese chess game exists in this session; call new_game first");
	return value.trim();
}
/**
* Host-side service loaded by the bundle patch. Every Remote method starts
* with Agent so Typert maps the client SessionId to the exact live agent.
*/
let XiangqiService = (() => {
	let _classSuper = TypertRemoteService;
	let _instanceExtraInitializers = [];
	let _newGame_decorators;
	let _get_decorators;
	let _move_decorators;
	let _undo_decorators;
	let _resign_decorators;
	return class XiangqiService extends _classSuper {
		static {
			const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
			_newGame_decorators = [Remote("newGame")];
			_get_decorators = [Remote("get")];
			_move_decorators = [Remote("move")];
			_undo_decorators = [Remote("undo")];
			_resign_decorators = [Remote("resign")];
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
			if (_metadata) Object.defineProperty(this, Symbol.metadata, {
				enumerable: true,
				configurable: true,
				writable: true,
				value: _metadata
			});
		}
		static inject = ["agents", "tools"];
		games = (__runInitializers(this, _instanceExtraInitializers), /* @__PURE__ */ new WeakMap());
		constructor(ctx) {
			super(ctx, "xiangqi");
			ctx.inject(["sessionProjections"], (projectionCtx) => {
				projectionCtx.sessionProjections.register({
					key: "xiangqi",
					schema: xiangqiProjectionSchema,
					init: () => null,
					apply: applyXiangqiProjection,
					view: viewXiangqiProjection,
					stateVersion: 1
				});
			});
			ctx.tools.register(createXiangqiRuntimeTool(this));
		}
		/** Start one new game owned by the calling DSH session. */
		newGame(agent, _request) {
			return this.gameFor(agent).service.newGame({ sessionId: String(agent.id) });
		}
		/** Read the requested game, or the session's latest game when omitted. */
		get(agent, gameId) {
			const game = this.gameFor(agent);
			return game.service.get(requireGameId(gameId ?? game.currentGameId));
		}
		/** Apply one revision-fenced move. */
		move(agent, request) {
			return this.gameFor(agent).service.move(request);
		}
		/** Undo one committed move. */
		undo(agent, request) {
			return this.gameFor(agent).service.undo(request);
		}
		/** Mark one side as resigned. */
		resign(agent, request) {
			return this.gameFor(agent).service.resign(request);
		}
		/** Execute the model tool against the exact agent owning the current turn. */
		executeTool(agent, args) {
			const game = this.gameFor(agent);
			const normalized = args.action === "new_game" ? {
				...args,
				session_id: String(agent.id)
			} : args;
			return this.executeParsedTool(game.service, normalized);
		}
		executeParsedTool(service, args) {
			switch (args.action) {
				case "new_game": {
					const state = args.session_id === void 0 ? service.newGame({}) : service.newGame({ sessionId: args.session_id });
					return {
						ok: true,
						action: args.action,
						state,
						message: "New Chinese chess game created."
					};
				}
				case "get": {
					const state = service.get(requireGameId(args.game_id));
					return {
						ok: true,
						action: args.action,
						state,
						message: "Current Chinese chess state."
					};
				}
				case "move": {
					if (args.game_id === void 0 || args.revision === void 0 || args.from === void 0 || args.to === void 0) throw new XiangqiError("INVALID_INPUT", "move requires game_id, revision, from, and to");
					const state = service.move({
						gameId: args.game_id,
						revision: args.revision,
						move: {
							from: args.from,
							to: args.to
						}
					});
					return {
						ok: true,
						action: args.action,
						state,
						message: "Move committed."
					};
				}
				case "undo": {
					if (args.game_id === void 0 || args.revision === void 0) throw new XiangqiError("INVALID_INPUT", "undo requires game_id and revision");
					const state = service.undo({
						gameId: args.game_id,
						revision: args.revision
					});
					return {
						ok: true,
						action: args.action,
						state,
						message: "Last committed move undone."
					};
				}
				case "resign": {
					if (args.game_id === void 0 || args.revision === void 0 || args.side === void 0) throw new XiangqiError("INVALID_INPUT", "resign requires game_id, revision, and side");
					const state = service.resign({
						gameId: args.game_id,
						revision: args.revision,
						side: args.side
					});
					return {
						ok: true,
						action: args.action,
						state,
						message: "Resignation committed."
					};
				}
			}
			throw new XiangqiError("INVALID_INPUT", `unsupported action: ${String(args.action)}`);
		}
		gameFor(agent) {
			if (this.ctx.agents.get(agent.id) !== agent) throw new XiangqiError("INVALID_INPUT", "the calling DSH agent is no longer live");
			const session = agent.session;
			const existing = this.games.get(session);
			if (existing !== void 0) return existing;
			const service = new XiangqiHostService(createXiangqiGameFactory());
			const restored = lastProjection(session);
			const game = { service };
			if (restored !== null) {
				service.restore(restored);
				game.currentGameId = restored.gameId;
			}
			service.subscribe((change) => {
				game.currentGameId = change.state.gameId;
				session.append("xiangqi/change", change);
			});
			this.games.set(session, game);
			return game;
		}
	};
})();
//#endregion
//#region lib/types/host/dsh-tool.js
const XIANGQI_TOOL_NAME = "xiangqi_game";
const ACTIONS = [
	"new_game",
	"get",
	"move",
	"undo",
	"resign"
];
const XIANGQI_DESCRIPTION = "Play Chinese chess in the current DSH session. Use new_game first. When the current game_id and revision are already available, call move directly; use get only when the current state is genuinely unavailable. Mutating actions require the exact game_id and revision returned by the tool; never invent or reuse a stale revision. For move, from and to are the canonical board coordinates supplied by the chess UI. Use undo only for a committed move, and resign only when the user explicitly requests it. Illegal moves are rejected by the game core.";
const XIANGQI_PARAMETERS = {
	action: {
		type: "string",
		required: true,
		enum: ACTIONS,
		description: "new_game | get | move | undo | resign."
	},
	game_id: {
		type: "string",
		description: "Exact game_id from the latest successful result."
	},
	session_id: {
		type: "string",
		description: "Optional DSH session id used only with new_game."
	},
	revision: {
		type: "integer",
		description: "Exact current revision from the latest successful result."
	},
	from: {
		type: "string",
		description: "Source coordinate, for example a0."
	},
	to: {
		type: "string",
		description: "Destination coordinate, for example a1."
	},
	side: {
		type: "string",
		enum: ["red", "black"],
		description: "Side resigning; required only for resign."
	}
};
const XIANGQI_OUTPUT_SCHEMA = {
	type: "object",
	additionalProperties: false,
	properties: {
		ok: {
			type: "boolean",
			required: true
		},
		action: {
			type: "string",
			required: true
		},
		state: {
			type: "json",
			required: true
		},
		message: {
			type: "string",
			required: true
		}
	}
};
function asRecord(value) {
	if (value === null || typeof value !== "object" || Array.isArray(value)) throw new XiangqiError("INVALID_INPUT", "tool arguments must be an object");
	return value;
}
function requiredText(record, field) {
	const value = record[field];
	if (typeof value !== "string" || value.trim().length === 0) throw new XiangqiError("INVALID_INPUT", `${field} is required and must be a non-empty string`);
	return value.trim();
}
function optionalText(record, field) {
	const value = record[field];
	if (value === void 0) return void 0;
	if (typeof value !== "string" || value.trim().length === 0) throw new XiangqiError("INVALID_INPUT", `${field} must be a non-empty string when provided`);
	return value.trim();
}
function requiredRevision(record) {
	const value = record.revision;
	if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1) throw new XiangqiError("INVALID_INPUT", "revision is required and must be a positive safe integer");
	return value;
}
function requiredSide(record) {
	const value = record.side;
	if (value !== "red" && value !== "black") throw new XiangqiError("INVALID_INPUT", "side is required and must be \"red\" or \"black\"");
	return value;
}
function requiredAction(record) {
	const value = record.action;
	if (!ACTIONS.includes(value)) throw new XiangqiError("INVALID_INPUT", `action must be one of ${ACTIONS.join(", ")}`);
	return value;
}
function rejectField(record, field, action) {
	if (record[field] !== void 0) throw new XiangqiError("INVALID_INPUT", `${field} is not valid for action ${action}`);
}
/** Execute the model command without relying on a DSH runtime import. */
function executeXiangqiTool(service, rawArgs) {
	const record = asRecord(rawArgs);
	const action = requiredAction(record);
	switch (action) {
		case "new_game": {
			rejectField(record, "game_id", action);
			rejectField(record, "revision", action);
			rejectField(record, "from", action);
			rejectField(record, "to", action);
			rejectField(record, "side", action);
			const sessionId = optionalText(record, "session_id");
			return {
				ok: true,
				action,
				state: sessionId === void 0 ? service.newGame({}) : service.newGame({ sessionId }),
				message: "New Chinese chess game created."
			};
		}
		case "get":
			rejectField(record, "session_id", action);
			rejectField(record, "revision", action);
			rejectField(record, "from", action);
			rejectField(record, "to", action);
			rejectField(record, "side", action);
			return {
				ok: true,
				action,
				state: service.get(requiredText(record, "game_id")),
				message: "Current Chinese chess state."
			};
		case "move":
			rejectField(record, "session_id", action);
			rejectField(record, "side", action);
			return {
				ok: true,
				action,
				state: service.move({
					gameId: requiredText(record, "game_id"),
					revision: requiredRevision(record),
					move: {
						from: requiredText(record, "from"),
						to: requiredText(record, "to")
					}
				}),
				message: "Move committed."
			};
		case "undo":
			rejectField(record, "session_id", action);
			rejectField(record, "from", action);
			rejectField(record, "to", action);
			rejectField(record, "side", action);
			return {
				ok: true,
				action,
				state: service.undo({
					gameId: requiredText(record, "game_id"),
					revision: requiredRevision(record)
				}),
				message: "Last committed move undone."
			};
		case "resign":
			rejectField(record, "session_id", action);
			rejectField(record, "from", action);
			rejectField(record, "to", action);
			return {
				ok: true,
				action,
				state: service.resign({
					gameId: requiredText(record, "game_id"),
					revision: requiredRevision(record),
					side: requiredSide(record)
				}),
				message: "Resignation committed."
			};
	}
}
/**
* Create the minimal model-facing tool contract.
*
* Main-thread integration should pass this object to the verified rc.7
* `defineTool` and then call `ctx.tools.register(...)`; see dsh-service.ts.
*/
function createXiangqiToolSpec(service) {
	return {
		name: XIANGQI_TOOL_NAME,
		description: XIANGQI_DESCRIPTION,
		parameters: XIANGQI_PARAMETERS,
		output: {
			schema: XIANGQI_OUTPUT_SCHEMA,
			render: (_args, value) => [{
				type: "text",
				text: JSON.stringify(value)
			}],
			presentationMeta: (_args, value) => ({
				action: value.action,
				gameId: value.state.gameId,
				revision: value.state.revision
			})
		},
		timeoutMs: 2e3,
		isConcurrencySafe: () => false,
		execute: async (args) => executeXiangqiTool(service, args)
	};
}
//#endregion
//#region lib/types/index.js
/** Host package entry for the DSH Chinese chess bundle. */
var types_default = XiangqiService;
//#endregion
export { XIANGQI_TOOL_NAME, XiangqiError, XiangqiHostService, XiangqiService, createXiangqiGameFactory, createXiangqiToolSpec, types_default as default, executeXiangqiTool };
