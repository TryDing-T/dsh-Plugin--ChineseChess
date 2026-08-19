import { BOARD_HEIGHT, BOARD_SIZE, BOARD_WIDTH } from './types.ts'
import type { Position, PositionLike } from './types.ts'

const FILES = 'abcdefghi'

export function isOnBoard(position: Position): boolean {
  return (
    Number.isInteger(position.x) &&
    Number.isInteger(position.y) &&
    position.x >= 0 &&
    position.x < BOARD_WIDTH &&
    position.y >= 0 &&
    position.y < BOARD_HEIGHT
  )
}

export function assertPosition(position: Position): Position {
  if (!isOnBoard(position)) {
    throw new RangeError(`棋盘坐标越界: (${position.x},${position.y})`)
  }
  return { x: position.x, y: position.y }
}

export function positionToIndex(position: Position): number {
  assertPosition(position)
  return position.y * BOARD_WIDTH + position.x
}

export function indexToPosition(index: number): Position {
  if (!Number.isInteger(index) || index < 0 || index >= BOARD_SIZE) {
    throw new RangeError(`棋盘索引越界: ${index}`)
  }
  return { x: index % BOARD_WIDTH, y: Math.floor(index / BOARD_WIDTH) }
}

/**
 * 将内部坐标转成 UCCI/PEN 风格的两字符坐标。
 * 例如红帅初始位置为 e0，黑将初始位置为 e9。
 */
export function formatCoordinate(position: Position): string {
  assertPosition(position)
  return `${FILES[position.x]}${9 - position.y}`
}

/** 支持 a9..i0，也支持用于 UI 调试的“x,y”形式。 */
export function parseCoordinate(value: PositionLike): Position {
  if (typeof value !== 'string') {
    return assertPosition(value)
  }

  const text = value.trim().toLowerCase()
  const coordinate = /^([a-i])([0-9])$/.exec(text)
  if (coordinate) {
    return {
      x: FILES.indexOf(coordinate[1]),
      y: 9 - Number(coordinate[2])
    }
  }

  const pair = /^(\d)\s*,\s*(\d)$/.exec(text)
  if (pair) {
    return assertPosition({ x: Number(pair[1]), y: Number(pair[2]) })
  }

  throw new TypeError(`无法解析棋盘坐标“${value}”，应为 a9..i0 或 x,y`)
}

export function samePosition(left: Position, right: Position): boolean {
  return left.x === right.x && left.y === right.y
}

export function clonePosition(position: Position): Position {
  return { x: position.x, y: position.y }
}
