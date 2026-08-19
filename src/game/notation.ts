import { clonePosition, parseCoordinate } from './coordinates.ts'
import type { GameState, Move, MoveInput, MoveRecord, Piece, PieceType, Position } from './types.ts'

const CHINESE_NUMBERS = ['一', '二', '三', '四', '五', '六', '七', '八', '九']

function pieceLabel(piece: Piece): string {
  if (piece.type === 'general') return piece.side === 'red' ? '帅' : '将'
  if (piece.type === 'advisor') return piece.side === 'red' ? '仕' : '士'
  if (piece.type === 'elephant') return piece.side === 'red' ? '相' : '象'
  if (piece.type === 'horse') return '马'
  if (piece.type === 'rook') return '车'
  if (piece.type === 'cannon') return '炮'
  return piece.side === 'red' ? '兵' : '卒'
}

function fileNumber(side: Piece['side'], x: number): string {
  const number = side === 'red' ? 9 - x : x + 1
  return CHINESE_NUMBERS[number - 1]
}

function forwardDistance(from: Position, to: Position): number {
  return Math.abs(to.y - from.y)
}

function isForward(side: Piece['side'], from: Position, to: Position): boolean {
  return side === 'red' ? to.y < from.y : to.y > from.y
}

function samePiece(left: Piece | null, right: Piece): left is Piece {
  return left !== null && left.side === right.side && left.type === right.type
}

function frontRank(side: Piece['side'], position: Position): number {
  return side === 'red' ? position.y : -position.y
}

function sourcePrefix(game: GameState, move: Move): string {
  const sameFilePieces: Array<{ position: Position; piece: Piece }> = []
  for (let index = 0; index < game.board.length; index += 1) {
    const piece = game.board[index]
    if (!samePiece(piece, move.piece)) continue
    const position = { x: index % 9, y: Math.floor(index / 9) }
    if (position.x === move.from.x) {
      sameFilePieces.push({ position, piece })
    }
  }

  if (sameFilePieces.length <= 1) {
    return fileNumber(move.piece.side, move.from.x)
  }

  sameFilePieces.sort((left, right) => frontRank(move.piece.side, left.position) - frontRank(move.piece.side, right.position))
  const index = sameFilePieces.findIndex(item => item.position.y === move.from.y)
  if (index === 0) return '前'
  if (index === sameFilePieces.length - 1) return '后'
  return '中'
}

/**
 * 格式化一手中文棋谱。
 * 这是常用的红方视角文件编号：红方右侧为“一”，黑方从黑方视角计算文件号。
 */
export function formatChineseMove(game: GameState, input: MoveInput | Move): string {
  const from = parseCoordinate(input.from)
  const to = parseCoordinate(input.to)
  const piece = game.board[from.y * 9 + from.x]
  if (!piece) {
    throw new Error(`起点没有棋子: ${from.x},${from.y}`)
  }

  const move: Move = {
    from: clonePosition(from),
    to: clonePosition(to),
    piece,
    captured: game.board[to.y * 9 + to.x]
  }
  const prefix = sourcePrefix(game, move)
  let action: string
  let destination: string

  if (from.y === to.y) {
    action = '平'
    destination = fileNumber(piece.side, to.x)
  } else if (from.x === to.x) {
    action = isForward(piece.side, from, to) ? '进' : '退'
    destination = CHINESE_NUMBERS[forwardDistance(from, to) - 1]
  } else {
    action = isForward(piece.side, from, to) ? '进' : '退'
    destination = fileNumber(piece.side, to.x)
  }

  return `${pieceLabel(piece)}${prefix}${action}${destination}`
}

/** 将记录转换成可直接展示的中文棋谱，附带将军/将死标记。 */
export function formatMoveRecord(record: MoveRecord): string {
  if (record.result === 'checkmate') return `${record.notation}将死`
  if (record.givesCheck) return `${record.notation}将军`
  return record.notation
}

export function getPieceLabel(piece: Piece): string {
  return pieceLabel(piece)
}

export function getPieceTypeLabel(type: PieceType): string {
  return pieceLabel({ type, side: type === 'general' ? 'red' : 'red' })
}
