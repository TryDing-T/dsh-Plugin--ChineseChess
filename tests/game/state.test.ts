import { describe, expect, it } from 'vitest'
import {
  applyMove,
  boardWithKings,
  deserialize,
  historyCaptured,
  historyFrom,
  historyOf,
  historyTo,
  newCustomGame,
  newGame,
  pieceAt,
  put,
  serialize,
  square,
  turnOf,
} from './game-api.ts'

describe('中国象棋状态、轮次与历史', () => {
  it('toggles the turn and records a non-capturing move', () => {
    const initial = newGame()
    const afterRed = applyMove(initial, square('e6'), square('e5'))
    const afterBlack = applyMove(afterRed, square('e3'), square('e4'))

    expect(turnOf(initial)).toBe('red')
    expect(turnOf(afterRed)).toBe('black')
    expect(turnOf(afterBlack)).toBe('red')

    const history = historyOf(afterBlack)
    expect(history).toHaveLength(2)
    expect(historyFrom(history[0])).toEqual(square('e6'))
    expect(historyTo(history[0])).toEqual(square('e5'))
    expect(historyFrom(history[1])).toEqual(square('e3'))
    expect(historyTo(history[1])).toEqual(square('e4'))
  })

  it('records the captured piece and removes it from the board', () => {
    const board = boardWithKings()
    put(board, 'e5', 'C')
    put(board, 'e4', 'P')
    put(board, 'e2', 'p')

    const afterCapture = applyMove(newCustomGame(board), square('e5'), square('e2'))
    const history = historyOf(afterCapture)

    expect(pieceAt(afterCapture, 'e5')).toBeNull()
    expect(pieceAt(afterCapture, 'e2')).toBe('C')
    expect(history).toHaveLength(1)
    expect(historyFrom(history[0])).toEqual(square('e5'))
    expect(historyTo(history[0])).toEqual(square('e2'))
    expect(historyCaptured(history[0])).toBe('p')
    expect(turnOf(afterCapture)).toBe('black')
  })

  it('round-trips the board, turn, captures, and history through serialization', () => {
    const board = boardWithKings()
    put(board, 'e5', 'C')
    put(board, 'e4', 'P')
    put(board, 'e2', 'p')
    const original = applyMove(newCustomGame(board), square('e5'), square('e2'))

    const encoded = serialize(original)
    expect(typeof encoded).toBe('string')

    const restored = deserialize(encoded)
    expect(serialize(restored)).toBe(encoded)
    expect(pieceAt(restored, 'e5')).toBeNull()
    expect(pieceAt(restored, 'e2')).toBe('C')
    expect(turnOf(restored)).toBe('black')
    expect(historyOf(restored)).toHaveLength(1)
    expect(historyCaptured(historyOf(restored)[0])).toBe('p')
  })
})
