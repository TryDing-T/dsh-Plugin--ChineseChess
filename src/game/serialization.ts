import { parseCoordinate } from './coordinates.ts'
import { makeGameState, InvalidPositionError } from './rules.ts'
import {
  BOARD_HEIGHT,
  BOARD_SIZE,
  BOARD_WIDTH,
  type GameState,
  type MoveRecord,
  type Piece,
  type PieceType,
  type Position,
  type SerializeOptions,
  type Side
} from './types.ts'

const FEN_BY_TYPE: Record<PieceType, string> = {
  general: 'k',
  advisor: 'a',
  elephant: 'b',
  horse: 'n',
  rook: 'r',
  cannon: 'c',
  soldier: 'p'
}

const TYPE_BY_FEN: Record<string, PieceType> = {
  k: 'general',
  a: 'advisor',
  b: 'elephant',
  n: 'horse',
  r: 'rook',
  c: 'cannon',
  p: 'soldier'
}

function pieceToFen(piece: Piece): string {
  const code = FEN_BY_TYPE[piece.type]
  return piece.side === 'red' ? code.toUpperCase() : code
}

function parseFenPiece(code: string): Piece {
  const type = TYPE_BY_FEN[code.toLowerCase()]
  if (!type) throw new InvalidPositionError(`未知 FEN 棋子: ${code}`)
  return { side: code === code.toUpperCase() ? 'red' : 'black', type }
}

export function toFen(game: GameState): string {
  const rows: string[] = []
  for (let y = 0; y < BOARD_HEIGHT; y += 1) {
    let row = ''
    let empty = 0
    for (let x = 0; x < BOARD_WIDTH; x += 1) {
      const piece = game.board[y * BOARD_WIDTH + x]
      if (piece === null) {
        empty += 1
        continue
      }
      if (empty > 0) {
        row += String(empty)
        empty = 0
      }
      row += pieceToFen(piece)
    }
    if (empty > 0) row += String(empty)
    rows.push(row)
  }

  const side = game.turn === 'red' ? 'w' : 'b'
  return `${rows.join('/')} ${side} - - ${game.halfmoveClock} ${game.fullmoveNumber}`
}

export function fromFen(fen: string): GameState {
  const fields = fen.trim().split(/\s+/)
  if (fields.length < 2 || fields.length > 6) {
    throw new InvalidPositionError('FEN 至少需要棋盘布局和轮次字段')
  }

  const board = parsePlacement(fields[0])
  const turn = parseSide(fields[1])
  const halfmoveClock = fields[4] === undefined || fields[4] === '-' ? 0 : parseNonNegativeInt(fields[4], '半回合计数')
  const fullmoveNumber = fields[5] === undefined || fields[5] === '-' ? 1 : parsePositiveInt(fields[5], '全回合计数')
  return makeGameState(board, turn, { halfmoveClock, fullmoveNumber })
}

/**
 * 默认保存为 JSON，以便同时保留 FEN 和悔棋历史；也可通过 format:'fen' 只导出标准扩展 FEN。
 * deserialize 同时接受这两种格式。
 */
export function serialize(game: GameState, options: SerializeOptions = {}): string {
  if (options.format === 'fen') return toFen(game)
  return JSON.stringify({ version: 1, fen: toFen(game), history: game.history })
}

export function deserialize(serialized: string): GameState {
  const text = serialized.trim()
  if (text.length === 0) throw new InvalidPositionError('不能反序列化空字符串')

  if (!text.startsWith('{')) return fromFen(text)

  let value: unknown
  try {
    value = JSON.parse(text) as unknown
  } catch {
    throw new InvalidPositionError('棋局 JSON 格式错误')
  }

  if (!isRecord(value) || value.version !== 1 || typeof value.fen !== 'string') {
    throw new InvalidPositionError('不支持的棋局序列化格式')
  }

  const base = fromFen(value.fen)
  const history = value.history === undefined ? [] : parseHistory(value.history)
  return makeGameState(base.board, base.turn, {
    halfmoveClock: base.halfmoveClock,
    fullmoveNumber: base.fullmoveNumber,
    history
  })
}

function parsePlacement(placement: string): Array<Piece | null> {
  const rows = placement.split('/')
  if (rows.length !== BOARD_HEIGHT) {
    throw new InvalidPositionError(`FEN 棋盘必须有 ${BOARD_HEIGHT} 行`)
  }

  const board: Array<Piece | null> = Array.from({ length: BOARD_SIZE }, () => null)
  for (let y = 0; y < rows.length; y += 1) {
    let x = 0
    for (const code of rows[y]) {
      if (/^[1-9]$/.test(code)) {
        x += Number(code)
      } else {
        if (!TYPE_BY_FEN[code.toLowerCase()] || x >= BOARD_WIDTH) {
          throw new InvalidPositionError(`FEN 第 ${y + 1} 行包含非法内容`)
        }
        board[y * BOARD_WIDTH + x] = parseFenPiece(code)
        x += 1
      }
    }
    if (x !== BOARD_WIDTH) {
      throw new InvalidPositionError(`FEN 第 ${y + 1} 行不是 ${BOARD_WIDTH} 列`)
    }
  }
  return board
}

function parseSide(value: string): Side {
  if (value === 'w' || value === 'r' || value === 'red') return 'red'
  if (value === 'b' || value === 'black') return 'black'
  throw new InvalidPositionError(`未知 FEN 轮次: ${value}`)
}

function parseNonNegativeInt(value: string, label: string): number {
  if (!/^\d+$/.test(value)) throw new InvalidPositionError(`${label}不是非负整数`)
  return Number(value)
}

function parsePositiveInt(value: string, label: string): number {
  const result = parseNonNegativeInt(value, label)
  if (result < 1) throw new InvalidPositionError(`${label}必须大于 0`)
  return result
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseHistory(value: unknown): MoveRecord[] {
  if (!Array.isArray(value)) throw new InvalidPositionError('棋局历史必须是数组')
  return value.map((item, index) => parseMoveRecord(item, index))
}

function parseMoveRecord(value: unknown, index: number): MoveRecord {
  if (!isRecord(value)) throw new InvalidPositionError(`历史第 ${index + 1} 步格式错误`)
  const from = parseSerializedPosition(value.from, `历史第 ${index + 1} 步起点`)
  const to = parseSerializedPosition(value.to, `历史第 ${index + 1} 步终点`)
  const piece = parsePiece(value.piece, `历史第 ${index + 1} 步棋子`)
  const captured = value.captured === null || value.captured === undefined
    ? null
    : parsePiece(value.captured, `历史第 ${index + 1} 步被吃棋子`)
  if (typeof value.notation !== 'string') throw new InvalidPositionError(`历史第 ${index + 1} 步缺少棋谱`)
  if (typeof value.givesCheck !== 'boolean') throw new InvalidPositionError(`历史第 ${index + 1} 步将军标记错误`)
  if (value.result !== 'playing' && value.result !== 'checkmate' && value.result !== 'stalemate') {
    throw new InvalidPositionError(`历史第 ${index + 1} 步结果错误`)
  }
  return {
    from,
    to,
    piece,
    captured,
    notation: value.notation,
    givesCheck: value.givesCheck,
    result: value.result,
    halfmoveClockBefore: parseNonNegativeInt(String(value.halfmoveClockBefore), '历史半回合计数'),
    fullmoveNumberBefore: parsePositiveInt(String(value.fullmoveNumberBefore), '历史全回合计数')
  }
}

function parseSerializedPosition(value: unknown, label: string): Position {
  if (typeof value === 'string') {
    try {
      return parseCoordinate(value)
    } catch {
      throw new InvalidPositionError(`${label}格式错误`)
    }
  }
  if (
    isRecord(value) &&
    typeof value.x === 'number' &&
    typeof value.y === 'number'
  ) {
    try {
      return parseCoordinate({ x: value.x, y: value.y })
    } catch {
      throw new InvalidPositionError(`${label}格式错误`)
    }
  }
  throw new InvalidPositionError(`${label}格式错误`)
}

function parsePiece(value: unknown, label: string): Piece {
  if (!isRecord(value) || (value.side !== 'red' && value.side !== 'black') || !isPieceType(value.type)) {
    throw new InvalidPositionError(`${label}格式错误`)
  }
  return { side: value.side, type: value.type }
}

function isPieceType(value: unknown): value is PieceType {
  return (
    value === 'general' ||
    value === 'advisor' ||
    value === 'elephant' ||
    value === 'horse' ||
    value === 'rook' ||
    value === 'cannon' ||
    value === 'soldier'
  )
}
