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

import {
  generatePseudoMoves,
  isInCheckOnBoard,
} from './rules.ts'
import type { GameState, Move, Piece, PieceType, Position, Side } from './types.ts'
import { BOARD_SIZE, BOARD_WIDTH } from './types.ts'

const DEFAULT_MAX_DEPTH = 6
const FIXED_DEPTH_MIN = 1
const FIXED_DEPTH_MAX = 6
const DEFAULT_LIMIT = 5
const MAX_LIMIT = 8

/** 将死/绝杀分数；一层约相差 1_000_000 / MATE_PLY_BONUS，避免多步将死互相混淆。 */
const MATE_SCORE = 1_000_000
/** 接近将死值即视为“将死分数”的阈值。 */
const MATE_THRESHOLD = MATE_SCORE - 100
/** 静态搜索最大深度（含吃子/将军应对）。 */
const QSEARCH_PLY_LIMIT = 24
const PAWN_CROSSED_RIVER_BONUS = 40

/** 基础子力价值（红黑共用）。 */
const PIECE_VALUES: Record<PieceType, number> = {
  general: 10_000,
  rook: 1_000,
  cannon: 550,
  horse: 400,
  elephant: 250,
  advisor: 250,
  soldier: 150,
}

export interface XiangqiAiSearchOptions {
  /**
   * 主搜索深度（半回合）。配合 timeMs 使用时表示“最大深度上限”；
   * 单独使用时为固定深度（兼容旧调用方）。默认按模式取 2 或 6。
   */
  readonly depth?: number
  /**
   * 迭代加深时间预算（毫秒）。提供后引擎在预算内尽量加深；超时返回最近
   * 一层已完整完成的结果，保证有结果且不显著卡顿。未提供则固定深度。
   */
  readonly timeMs?: number
  /** 返回给调用方的候选数量；默认 5。 */
  readonly limit?: number
}

export interface XiangqiAiSearchResult {
  readonly move: Move
  readonly score: number
}

export interface XiangqiAiSearchSummary {
  readonly turn: Side
  readonly depth: number
  readonly nodes: number
  readonly candidates: readonly XiangqiAiSearchResult[]
}

interface SearchContext {
  nodes: number
  tt: Map<bigint, TTEntry>
  /** killer[ply][slot] */
  killer: Int32Array
  /** history[sideIndex][fromIndex * BOARD_SIZE + toIndex] */
  history: Int32Array
  startTime: number
  timeMs: number
  /** 超时后置位，所有层立即展开返回。 */
  aborted: boolean
  /** 当前局面的增量 Zobrist 键（不含轮次位，由调用方维护）。 */
  key: bigint
}

type TTFlag = 'exact' | 'lower' | 'upper'

interface TTEntry {
  readonly flag: TTFlag
  readonly depth: number
  readonly score: number
  readonly bestFrom: number
  readonly bestTo: number
}

/* ---------------------------- Zobrist 哈希 ---------------------------- */

/** 确定性 64 位 PRNG，保证同一次命中的哈希表每次一致。 */
function splitmix64(seed: bigint): () => bigint {
  let state = seed & 0xffffffffffffffffn
  return () => {
    state = (state + 0x9e3779b97f4a7c15n) & 0xffffffffffffffffn
    let z = state
    z = (z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n & 0xffffffffffffffffn
    z = (z ^ (z >> 27n)) * 0x94d049bb133111ebn & 0xffffffffffffffffn
    return z ^ (z >> 31n)
  }
}

// keys[squareIndex][pieceCode]，pieceCode = side(0/1) * 7 + typeIndex
const PIECE_TYPE_ORDER: readonly PieceType[] = [
  'general', 'advisor', 'elephant', 'horse', 'rook', 'cannon', 'soldier',
]
const PIECE_HASH: BigUint64Array = (() => {
  const random = splitmix64(0x9d2c5680b1f5a317n)
  const table = new BigUint64Array(BOARD_SIZE * 14)
  for (let i = 0; i < table.length; i += 1) table[i] = random()
  return table
})()

const SIDE_HASH = (() => {
  const random = splitmix64(0x7137445f77777777n)
  return random()
})()
/** 就地棋盘上的 Zobrist 增量键（不含轮次边 switch）。 */
function boardKey(board: ReadonlyArray<Piece | null>): bigint {
  let key = 0n
  for (let index = 0; index < board.length; index += 1) {
    const piece = board[index]
    if (piece === null) continue
    key ^= PIECE_HASH[index * 14 + pieceCode(piece.side, piece.type)]
  }
  return key
}

function pieceCode(side: Side, type: PieceType): number {
  return (side === 'black' ? 7 : 0) + PIECE_TYPE_ORDER.indexOf(type)
}

function indexOf(position: Position): number {
  return position.y * BOARD_WIDTH + position.x
}

/** 切换轮次的边。 */
function otherSide(side: Side): Side {
  return side === 'red' ? 'black' : 'red'
}

/** 就地走子并增量更新 Zobrist 键；返回撤销信息。 */
function makeMoveInPlace(
  board: Array<Piece | null>,
  fromIndex: number,
  toIndex: number,
  context: SearchContext,
): { mover: Piece; captured: Piece | null } {
  const mover = board[fromIndex]
  const captured = board[toIndex]
  if (mover === null) throw new Error(`AI 内部错误: 起点 ${fromIndex} 无棋子`)
  board[toIndex] = mover
  board[fromIndex] = null
  let key = context.key
  key ^= PIECE_HASH[fromIndex * 14 + pieceCode(mover.side, mover.type)]
  key ^= PIECE_HASH[toIndex * 14 + pieceCode(mover.side, mover.type)]
  if (captured !== null) key ^= PIECE_HASH[toIndex * 14 + pieceCode(captured.side, captured.type)]
  context.key = key
  return { mover, captured }
}

/** 撤销就地走子并还原 Zobrist 键。 */
function unmakeMoveInPlace(
  board: Array<Piece | null>,
  fromIndex: number,
  toIndex: number,
  undo: { mover: Piece; captured: Piece | null },
  context: SearchContext,
): void {
  board[fromIndex] = undo.mover
  board[toIndex] = undo.captured
  let key = context.key
  key ^= PIECE_HASH[toIndex * 14 + pieceCode(undo.mover.side, undo.mover.type)]
  key ^= PIECE_HASH[fromIndex * 14 + pieceCode(undo.mover.side, undo.mover.type)]
  if (undo.captured !== null) key ^= PIECE_HASH[toIndex * 14 + pieceCode(undo.captured.side, undo.captured.type)]
  context.key = key
}

/* ---------------------------- 评估 ---------------------------- */

/**
 * 位置价值表（红方视角，row 0 = 红方底线）。
 * 读取规则：红方棋子 row = 9 - piece.y；黑方棋子 row = piece.y。
 * 棋盘左右对称，因此只按 x 取列即可。
 */
interface PositionTables {
  readonly rows: readonly (readonly number[])[]
}

const ROOK_PST: PositionTables = {
  rows: [
    [-8, -6, -2, 0, 2, 0, -2, -6, -8],
    [-6, -4, 0, 2, 4, 2, 0, -4, -6],
    [-4, -2, 2, 4, 6, 4, 2, -2, -4],
    [-2, 0, 4, 6, 8, 6, 4, 0, -2],
    [0, 2, 6, 8, 10, 8, 6, 2, 0],
    [0, 2, 6, 8, 10, 8, 6, 2, 0],
    [-2, 0, 4, 6, 8, 6, 4, 0, -2],
    [-4, -2, 2, 4, 6, 4, 2, -2, -4],
    [-6, -4, 0, 2, 4, 2, 0, -4, -6],
    [-8, -6, -2, 0, 2, 0, -2, -6, -8],
  ],
}

const CANNON_PST: PositionTables = {
  rows: [
    [-4, -2, 0, 2, 2, 2, 0, -2, -4],
    [-2, 0, 2, 4, 4, 4, 2, 0, -2],
    [0, 2, 4, 6, 8, 6, 4, 2, 0],
    [2, 4, 6, 8, 10, 8, 6, 4, 2],
    [4, 6, 8, 10, 12, 10, 8, 6, 4],
    [2, 4, 6, 8, 10, 8, 6, 4, 2],
    [0, 2, 4, 6, 8, 6, 4, 2, 0],
    [0, 2, 4, 6, 8, 6, 4, 2, 0],
    [-2, 0, 2, 4, 4, 4, 2, 0, -2],
    [-4, -2, 0, 2, 2, 2, 0, -2, -4],
  ],
}

const HORSE_PST: PositionTables = {
  rows: [
    [-10, -8, -6, -4, -2, -4, -6, -8, -10],
    [-8, -4, 0, 2, 4, 2, 0, -4, -8],
    [-4, 0, 6, 8, 10, 8, 6, 0, -4],
    [0, 4, 8, 12, 14, 12, 8, 4, 0],
    [4, 8, 12, 16, 18, 16, 12, 8, 4],
    [4, 8, 12, 16, 18, 16, 12, 8, 4],
    [0, 4, 8, 12, 14, 12, 8, 4, 0],
    [-4, 0, 6, 8, 10, 8, 6, 0, -4],
    [-8, -4, 0, 2, 4, 2, 0, -4, -8],
    [-10, -8, -6, -4, -2, -4, -6, -8, -10],
  ],
}

const SOLDIER_PST: PositionTables = {
  rows: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, -2, -2, -2, -2, -2, 0, 0],
    [0, 0, 0, -4, -6, -4, 0, 0, 0],
    [0, -2, -2, -4, -6, -4, -2, -2, 0],
    [6, 6, 8, 10, 14, 10, 8, 6, 6],
    [8, 10, 12, 16, 20, 16, 12, 10, 8],
    [12, 14, 18, 22, 26, 22, 18, 14, 12],
    [14, 16, 20, 24, 30, 24, 20, 16, 14],
    [10, 12, 16, 20, 24, 20, 16, 12, 10],
  ],
}

const GENERAL_PST: PositionTables = {
  rows: [
    [0, 0, 0, -2, -4, -2, 0, 0, 0],
    [0, 0, 0, 4, 6, 4, 0, 0, 0],
    [0, 0, 0, 2, 4, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
}

const ADVISOR_PST: PositionTables = {
  rows: [
    [0, 0, 0, 4, 0, 4, 0, 0, 0],
    [0, 0, 0, 0, 6, 0, 0, 0, 0],
    [0, 0, 0, 4, 0, 4, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
}

const ELEPHANT_PST: PositionTables = {
  rows: [
    [0, 0, 6, 0, 0, 0, 6, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [6, 0, 0, 6, 8, 6, 0, 0, 6],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 6, 0, 6, 0, 6, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
}

const PST_BY_TYPE: Record<PieceType, PositionTables> = {
  general: GENERAL_PST,
  advisor: ADVISOR_PST,
  elephant: ELEPHANT_PST,
  horse: HORSE_PST,
  rook: ROOK_PST,
  cannon: CANNON_PST,
  soldier: SOLDIER_PST,
}

/** 某方视角下的表格行（红方从底部旋转，黑方正序）。 */
function pstValue(type: PieceType, side: Side, x: number, y: number): number {
  const row = side === 'red' ? 9 - y : y
  const table = PST_BY_TYPE[type]
  if (row < 0 || row >= table.rows.length) return 0
  const line = table.rows[row]
  if (x < 0 || x >= line.length) return 0
  return line[x]
}

function crossedRiver(side: Side, y: number): boolean {
  return side === 'red' ? y <= 4 : y >= 5
}

/**
 * 静态评估：从“当前轮到的一方”视角返回分数（适配 Negamax）。
 * 物质 + 位置表 + 过河兵 + 被将军惩罚，不生成走法，保证叶子评估极快。
 */
function evaluate(board: ReadonlyArray<Piece | null>, turn: Side): number {
  let score = 0
  for (let index = 0; index < board.length; index += 1) {
    const piece = board[index]
    if (piece === null) continue
    const x = index % BOARD_WIDTH
    const y = Math.floor(index / BOARD_WIDTH)
    let value = PIECE_VALUES[piece.type] + pstValue(piece.type, piece.side, x, y)
    if (piece.type === 'soldier' && crossedRiver(piece.side, y)) {
      value += PAWN_CROSSED_RIVER_BONUS
    }
    score += piece.side === turn ? value : -value
  }
  // 被将军会严重限制下一步选择，直接给负分，驱动引擎重视将军/解将。
  if (isInCheckOnBoard(board, turn)) score -= 160
  return score
}

/* ---------------------------- 走法生成（就地） ---------------------------- */

/**
 * 就地棋盘合法性走法：伪走法 + 落子后单点将军判定，全程不克隆整盘。
 * rules.ts 的 generatePseudoMoves / isInCheckOnBoard 保证与规则引擎一致。
 */
function legalMovesInPlace(
  board: Array<Piece | null>,
  side: Side,
  includeCapturesOnly: boolean,
): Move[] {
  const pseudo = generatePseudoMoves(board, side)
  const legal: Move[] = []
  for (const move of pseudo) {
    if (includeCapturesOnly && move.captured === null) continue
    const fromIndex = indexOf(move.from)
    const toIndex = indexOf(move.to)
    const mover = board[fromIndex]
    const captured = board[toIndex]
    board[toIndex] = mover
    board[fromIndex] = null
    const safe = !isInCheckOnBoard(board, side)
    // 撤销
    board[fromIndex] = mover
    board[toIndex] = captured
    if (safe) legal.push(move)
  }
  return legal
}

/* ---------------------------- 搜索 ---------------------------- */

/** 将死分数按约定深度归一化，避免 TT 中不同深度的将死分互相混淆。 */
function toMateScale(score: number): number {
  return score > MATE_THRESHOLD ? score + 1 : score < -MATE_THRESHOLD ? score - 1 : score
}

function fromMateScale(score: number): number {
  return score > MATE_THRESHOLD ? score - 1 : score < -MATE_THRESHOLD ? score + 1 : score
}

/** 越早的将死分越高，避免不同深度的将死分数互相混淆。 */
function mateScoreAgainst(ply: number): number {
  return MATE_SCORE - ply
}

/** MVV-LVA 风格走法排序分：吃高价值子优先，吃子时按被吃价值×10 - 己方子力。 */
function moveOrderScore(move: Move): number {
  if (move.captured === null) return 0
  const victim = PIECE_VALUES[move.captured.type]
  const attacker = PIECE_VALUES[move.piece.type]
  return victim * 10 - attacker
}

function sideIndex(side: Side): number {
  return side === 'red' ? 0 : 1
}

/** 时间预算放行检查；超时置 aborted，所有层快速展开。timeMs<0 表示未启用预算。 */
function outOfTime(context: SearchContext, ply: number): boolean {
  if (context.timeMs < 0 || ply <= 0) return false
  if ((context.nodes & 0x3ff) !== 0) return false
  if (context.startTime + context.timeMs <= Date.now()) {
    context.aborted = true
    return true
  }
  return false
}

/**
 * 静态搜索（QSearch）：叶子层沿“吃子 + 被将军时的全部应对”继续，
 * 直到局面安静或深度用尽，消除水平线效应（白送/白吃）。
 */
function quiesce(
  board: Array<Piece | null>,
  side: Side,
  alpha: number,
  beta: number,
  context: SearchContext,
  ply: number,
): number {
  context.nodes += 1
  if (context.aborted) return alpha
  if (outOfTime(context, ply)) return alpha
  if (ply >= QSEARCH_PLY_LIMIT) return evaluate(board, side)

  const standPat = evaluate(board, side)
  if (standPat >= beta) return standPat
  if (standPat > alpha) alpha = standPat

  const inCheck = isInCheckOnBoard(board, side)
  // 被将军时必须考虑所有应对，否则可能漏杀/漏解；否则只延伸吃子。
  const moves = legalMovesInPlace(board, side, !inCheck)
  if (moves.length === 0) {
    return inCheck ? -mateScoreAgainst(ply) : standPat
  }

  // 吃子按 MVV-LVA 排序优化剪枝
  const captures = moves.filter(move => move.captured !== null)
  if (inCheck) captures.unshift(...moves.filter(move => move.captured === null))
  const ordered = captures.sort((left, right) => moveOrderScore(right) - moveOrderScore(left))

  for (const move of ordered) {
    const fromIndex = indexOf(move.from)
    const toIndex = indexOf(move.to)
    const undo = makeMoveInPlace(board, fromIndex, toIndex, context)
    const score = -quiesce(board, otherSide(side), -beta, -alpha, context, ply + 1)
    unmakeMoveInPlace(board, fromIndex, toIndex, undo, context)

    if (score >= beta) return beta
    if (score > alpha) alpha = score
  }
  return alpha
}

function alphaBeta(
  board: Array<Piece | null>,
  side: Side,
  depth: number,
  alpha: number,
  beta: number,
  context: SearchContext,
  ply: number,
): number {
  context.nodes += 1
  if (context.aborted) return alpha
  if (outOfTime(context, ply)) return alpha

  const key = context.key ^ (side === 'red' ? SIDE_HASH : 0n)
  const hashEntry = context.tt.get(key)
  if (hashEntry !== undefined && hashEntry.depth >= depth) {
    const storedScore = fromMateScale(hashEntry.score)
    if (hashEntry.flag === 'exact') return storedScore
    if (hashEntry.flag === 'lower' && storedScore >= beta) return storedScore
    if (hashEntry.flag === 'upper' && storedScore <= alpha) return storedScore
  }

  if (depth <= 0) {
    return quiesce(board, side, alpha, beta, context, ply)
  }

  const moves = legalMovesInPlace(board, side, false)
  if (moves.length === 0) {
    const inCheck = isInCheckOnBoard(board, side)
    return inCheck ? -mateScoreAgainst(ply) : 0
  }

  // 走法排序：TT 首选 > 吃子（MVV-LVA）> 杀手 > 历史启发
  const ttMove = hashEntry === undefined ? null : { from: hashEntry.bestFrom, to: hashEntry.bestTo }
  const ordered = [...moves].sort((left, right) => {
    const leftTt = ttMove !== null && indexOf(left.from) === ttMove.from && indexOf(left.to) === ttMove.to
    const rightTt = ttMove !== null && indexOf(right.from) === ttMove.from && indexOf(right.to) === ttMove.to
    if (leftTt !== rightTt) return leftTt ? -1 : 1
    const leftCap = moveOrderScore(left)
    const rightCap = moveOrderScore(right)
    if (leftCap !== rightCap) return rightCap - leftCap
    const leftKiller = isKiller(context, ply, left)
    const rightKiller = isKiller(context, ply, right)
    if (leftKiller !== rightKiller) return leftKiller ? -1 : 1
    const leftHist = historyScore(context, side, left)
    const rightHist = historyScore(context, side, right)
    return rightHist - leftHist
  })

  let best = -Infinity
  let bestMove: Move | null = null
  let flag: TTFlag = 'upper'
  const startAlpha = alpha

  for (const move of ordered) {
    const fromIndex = indexOf(move.from)
    const toIndex = indexOf(move.to)
    const undo = makeMoveInPlace(board, fromIndex, toIndex, context)
    const score = -alphaBeta(board, otherSide(side), depth - 1, -beta, -alpha, context, ply + 1)
    unmakeMoveInPlace(board, fromIndex, toIndex, undo, context)

    if (score > best) {
      best = score
      bestMove = move
    }
    if (score > alpha) alpha = score
    if (alpha >= beta) {
      // 剪枝：吃子走法直接给历史奖励；非吃子记录为杀手走法
      if (move.captured === null) recordKiller(context, ply, move)
      else rewardHistory(context, side, move, depth)
      flag = 'lower'
      break
    }
  }

  // 最佳走法也给予历史奖励（即使是未剪枝的搜索路径）
  if (bestMove !== null) rewardHistory(context, side, bestMove, depth)

  if (best <= startAlpha) flag = 'upper'
  else if (best >= beta) flag = 'lower'
  else flag = 'exact'

  const storedBest = toMateScale(best)
  if (bestMove !== null) {
    context.tt.set(key, {
      flag,
      depth,
      score: storedBest,
      bestFrom: indexOf(bestMove.from),
      bestTo: indexOf(bestMove.to),
    })
  } else {
    context.tt.set(key, { flag, depth, score: storedBest, bestFrom: -1, bestTo: -1 })
  }

  return best
}

/** 历史启发得分：同一起点-终点走法过去越有效，之后越优先尝试。 */
function historyScore(
  context: SearchContext,
  side: Side,
  move: Move,
): number {
  const from = indexOf(move.from)
  const to = indexOf(move.to)
  return context.history[sideIndex(side) * BOARD_SIZE * BOARD_SIZE + from * BOARD_SIZE + to]
}

function rewardHistory(
  context: SearchContext,
  side: Side,
  move: Move,
  depth: number,
): void {
  const from = indexOf(move.from)
  const to = indexOf(move.to)
  const slot = sideIndex(side) * BOARD_SIZE * BOARD_SIZE + from * BOARD_SIZE + to
  const bonus = depth * 16
  const current = context.history[slot]
  context.history[slot] = current + bonus - (current * bonus >> 12)
}

function recordKiller(context: SearchContext, ply: number, move: Move): void {
  const offset = ply * 2
  const fromTo = indexOf(move.from) * BOARD_SIZE + indexOf(move.to)
  if (context.killer[offset] !== fromTo) {
    context.killer[offset + 1] = context.killer[offset]
    context.killer[offset] = fromTo
  }
}

function isKiller(context: SearchContext, ply: number, move: Move): boolean {
  const offset = ply * 2
  const fromTo = indexOf(move.from) * BOARD_SIZE + indexOf(move.to)
  return context.killer[offset] === fromTo || context.killer[offset + 1] === fromTo
}

/* ---------------------------- 对外入口 ---------------------------- */

const TT_MAX_ENTRIES = 1 << 17

function integerInRange(value: number | undefined, fallback: number, min: number, max: number): number {
  if (!Number.isInteger(value)) return fallback
  return Math.max(min, Math.min(max, value as number))
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
export function findBestMoves(
  game: GameState,
  options: XiangqiAiSearchOptions = {},
): XiangqiAiSearchSummary {
  const limit = integerInRange(options.limit, DEFAULT_LIMIT, 1, MAX_LIMIT)

  const board: Array<Piece | null> = game.board.slice()
  const turn = game.turn

  const hasTimeBudget = Number.isFinite(options.timeMs) && (options.timeMs ?? 0) > 0
  const maxDepth: number = hasTimeBudget
    ? integerInRange(options.depth, DEFAULT_MAX_DEPTH, FIXED_DEPTH_MIN, DEFAULT_MAX_DEPTH)
    : integerInRange(options.depth, 2, FIXED_DEPTH_MIN, FIXED_DEPTH_MAX)

  const context: SearchContext = {
    nodes: 0,
    tt: new Map(),
    killer: new Int32Array(2 * (DEFAULT_MAX_DEPTH + 8)),
    history: new Int32Array(2 * BOARD_SIZE * BOARD_SIZE),
    startTime: Date.now(),
    timeMs: hasTimeBudget ? Math.min(Math.max(options.timeMs ?? 0, 8), 3000) : -1,
    aborted: false,
    key: boardKey(board),
  }

  // 根走法（合法，就地判定）
  const rootMoves = legalMovesInPlace(board, turn, false)
  const results: Array<{ move: Move; score: number }> = rootMoves.map(move => ({ move, score: 0 }))

  // 迭代加深：逐层完整搜索所有根走法；每层完成后按分数重排，越深越准。
  let lastCompleted: XiangqiAiSearchResult[] = []
  let completedDepth = 0
  const firstDepth = hasTimeBudget ? 1 : maxDepth

  for (let depth = firstDepth; depth <= maxDepth; depth += 1) {
    // 预算耗尽或上一层已中止时，保留上一层结果。
    if (context.aborted) break
    if (hasTimeBudget && context.startTime + context.timeMs <= Date.now()) break

    // 根层 PVS：首个走法全窗口，其余走法零窗口试探，失败再重搜；
    // 配合上一层的排序，让剪枝从根开始生效。
    let rootAlpha = -Infinity
    let firstRootMove = true
    let layerAborted = false
    for (const entry of results) {
      if (context.aborted) {
        layerAborted = true
        break
      }
      const fromIndex = indexOf(entry.move.from)
      const toIndex = indexOf(entry.move.to)
      const undo = makeMoveInPlace(board, fromIndex, toIndex, context)
      let score: number
      if (firstRootMove) {
        score = -alphaBeta(board, otherSide(turn), depth - 1, -Infinity, Infinity, context, 1)
        firstRootMove = false
      } else {
        // 零窗口试探：确认该走法是否优于当前最佳
        score = -alphaBeta(board, otherSide(turn), depth - 1, -rootAlpha - 1, -rootAlpha, context, 1)
        if (!context.aborted && score > rootAlpha) {
          score = -alphaBeta(board, otherSide(turn), depth - 1, -Infinity, -rootAlpha, context, 1)
        }
      }
      unmakeMoveInPlace(board, fromIndex, toIndex, undo, context)
      entry.score = score
      if (score > rootAlpha) rootAlpha = score

      if (context.tt.size > TT_MAX_ENTRIES) context.tt.clear()
    }

    // 层只在其完整完成时提交，中途超时整层作废。
    if (layerAborted) break
    results.sort((left, right) => right.score - left.score)
    lastCompleted = results.map(entry => ({ move: entry.move, score: entry.score }))
    completedDepth = depth
  }

  if (completedDepth === 0) {
    // 理论兜底：至少给出深度 1 的静态排序结果
    completedDepth = 1
    lastCompleted = rootMoves
      .map(move => ({ move, score: evaluate(applyMoveLocally(board, move), otherSide(turn)) }))
      .sort((left, right) => right.score - left.score)
  }

  return {
    turn,
    depth: completedDepth,
    nodes: context.nodes,
    candidates: lastCompleted.slice(0, limit),
  }
}

/** 计算“走一步后对手视角”的静态评估（仅兜底用）。 */
function applyMoveLocally(
  board: Array<Piece | null>,
  move: Move,
): Array<Piece | null> {
  const next = board.slice()
  next[indexOf(move.to)] = next[indexOf(move.from)]
  next[indexOf(move.from)] = null
  return next
}
