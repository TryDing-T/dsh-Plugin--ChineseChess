/** Convert the Host's authoritative JSON snapshot into the board view model. */

import { formatCoordinate } from '../game/coordinates.ts'
import { formatMoveRecord, getPieceLabel } from '../game/notation.ts'
import { getLegalMoves } from '../game/rules.ts'
import { deserialize } from '../game/serialization.ts'
import type { GameState, PieceType, Side } from '../game/types.ts'
import type { XiangqiSerializedState, XiangqiSide } from '../types.ts'
import type {
  XiangqiActivity,
  XiangqiGameStatus,
  XiangqiGameViewModel,
  XiangqiLegalMove,
  XiangqiMoveRecord,
  XiangqiPiece,
} from './types.ts'

function positionOf(position: { readonly x: number; readonly y: number }) {
  return { row: position.y, col: position.x }
}

function moveOf(move: { readonly from: { readonly x: number; readonly y: number }; readonly to: { readonly x: number; readonly y: number } }): XiangqiLegalMove {
  return { from: positionOf(move.from), to: positionOf(move.to) }
}

function pieceOf(game: GameState, x: number, y: number): XiangqiPiece | null {
  const piece = game.board[y * 9 + x]
  if (piece === null) return null
  return {
    id: `${piece.side}-${piece.type}-${x}-${y}`,
    side: piece.side,
    kind: piece.type,
    label: getPieceLabel(piece),
  }
}

function statusOf(state: XiangqiSerializedState, game: GameState): XiangqiGameStatus {
  if (state.phase === 'resigned') return 'resigned'
  // 中国象棋没有困毙和棋：将死与困毙都由 winner 指明获胜方。
  if (game.status === 'checkmate' || game.status === 'stalemate') {
    return game.winner === 'black' ? 'black-won' : 'red-won'
  }
  return 'playing'
}

function sideLabel(side: XiangqiSide): string {
  return side === 'red' ? '红方' : '黑方'
}

function statusTextOf(
  state: XiangqiSerializedState,
  game: GameState,
  status: XiangqiGameStatus,
): string {
  if (status === 'resigned') return `${sideLabel(state.winner ?? 'red')}获胜（对方认输）`
  if (status === 'red-won' || status === 'black-won') {
    const winnerLabel = status === 'red-won' ? '红方' : '黑方'
    const loserLabel = status === 'red-won' ? '黑方' : '红方'
    if (game.status === 'stalemate') return `${loserLabel}困毙（无子可走），${winnerLabel}获胜`
    return `${winnerLabel}将死${loserLabel}，${winnerLabel}获胜`
  }
  if (game.inCheck) return `${sideLabel(game.turn)}被将军，轮到${sideLabel(game.turn)}应对`
  return `轮到${sideLabel(game.turn)}落子`
}

/**
 * 渲染时计算的实时标题（审查第三轮）：aiPending/activity 是随时会变的
 * 运行标志，固化进 ViewModel 的字符串会误导用户（例如别的标签页取消后
 * 本页仍显示"AI 正在计算"）。基础文案之外的一切动态状态都在这里求值。
 */
export function liveStatusTextOf(game: XiangqiGameViewModel): string {
  if (
    game.busy === true
    && game.status === 'playing'
    && game.currentTurn !== game.humanSide
  ) {
    // Host 确认有决策在跑（含其他标签页发起的）才叫"AI 正在计算"；
    // 本页面悔棋/新局/同步等操作用中性文案。
    if (game.aiPending === true || game.activity === 'ai') return 'AI 正在计算下一步'
    return '正在更新棋局…'
  }
  return game.statusText
}

function moveRecords(game: GameState): XiangqiMoveRecord[] {
  return game.history.map(record => ({
    ...moveOf(record),
    side: record.piece.side,
    notation: formatMoveRecord(record),
    ...record.captured === null ? {} : { captured: record.captured.type as PieceType },
  }))
}

/**
 * Project one Host snapshot. The client uses the pure core only to format the
 * already committed state and legal destinations; move acceptance remains a
 * revision-fenced Host operation.
 */
export function toXiangqiGameViewModel(
  state: XiangqiSerializedState,
  options: {
    readonly humanSide?: XiangqiSide
    readonly busy?: boolean
    readonly aiPending?: boolean
    readonly activity?: XiangqiActivity
  } = {},
): XiangqiGameViewModel {
  const game = deserialize(JSON.stringify(state.gameState))
  const humanSide = options.humanSide ?? 'red'
  const busy = options.busy ?? false
  const aiPending = options.aiPending ?? false
  const activity = options.activity ?? 'idle'
  const status = statusOf(state, game)
  const board = Array.from({ length: 10 }, (_row, y) => (
    Array.from({ length: 9 }, (_column, x) => pieceOf(game, x, y))
  ))
  const legalMoves = getLegalMoves(game).map(moveOf)
  const lastMove = game.lastMove === null ? undefined : moveOf(game.lastMove)

  return {
    board,
    currentTurn: game.turn,
    humanSide,
    legalMoves,
    moves: moveRecords(game),
    status,
    // 基础文案不含忙碌状态；渲染层用 liveStatusTextOf 叠加实时标志。
    statusText: statusTextOf(state, game, status),
    inCheck: game.inCheck,
    ...lastMove === undefined ? {} : { lastMove },
    busy,
    aiPending,
    activity,
  }
}

/** Read the current turn without duplicating the board projection. */
export function turnOf(state: XiangqiSerializedState): Side {
  return deserialize(JSON.stringify(state.gameState)).turn
}

/** Convert a visible row/column pair into the Host's canonical UCCI coordinate. */
export function ucciOf(position: { readonly row: number; readonly col: number }): string {
  return formatCoordinate({ x: position.col, y: position.row })
}
