/** Convert the Host's authoritative JSON snapshot into the board view model. */

import { formatCoordinate } from '../game/coordinates.ts'
import { formatMoveRecord, getPieceLabel } from '../game/notation.ts'
import { getLegalMoves } from '../game/rules.ts'
import { deserialize } from '../game/serialization.ts'
import type { GameState, PieceType, Side } from '../game/types.ts'
import type { XiangqiSerializedState, XiangqiSide } from '../types.ts'
import type {
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
  if (game.status === 'checkmate') return game.winner === 'red' ? 'red-won' : 'black-won'
  if (game.status === 'stalemate') return 'draw'
  return 'playing'
}

function sideLabel(side: XiangqiSide): string {
  return side === 'red' ? '红方' : '黑方'
}

function statusTextOf(
  state: XiangqiSerializedState,
  game: GameState,
  status: XiangqiGameStatus,
  humanSide: XiangqiSide,
  busy: boolean,
): string {
  if (busy && status === 'playing' && game.turn !== humanSide) return 'AI 正在计算下一步'
  if (status === 'resigned') return `${sideLabel(state.winner ?? 'red')}获胜（对方认输）`
  if (status === 'red-won' || status === 'black-won') {
    return `${status === 'red-won' ? '红方' : '黑方'}将死，${status === 'red-won' ? '红方' : '黑方'}获胜`
  }
  if (status === 'draw') return '无子可走，和棋'
  if (game.inCheck) return `${sideLabel(game.turn)}被将军，轮到${sideLabel(game.turn)}应对`
  return `轮到${sideLabel(game.turn)}落子`
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
  options: { readonly humanSide?: XiangqiSide; readonly busy?: boolean } = {},
): XiangqiGameViewModel {
  const game = deserialize(JSON.stringify(state.gameState))
  const humanSide = options.humanSide ?? 'red'
  const busy = options.busy ?? false
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
    statusText: statusTextOf(state, game, status, humanSide, busy),
    inCheck: game.inCheck,
    ...lastMove === undefined ? {} : { lastMove },
    busy,
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
