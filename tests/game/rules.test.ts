import { describe, expect, it } from 'vitest'
import {
  applyMove,
  boardCodesOf,
  boardWithKings,
  containsDestination,
  getLegalMoves,
  historyOf,
  initialBoard,
  newCustomGame,
  newGame,
  pieceAt,
  put,
  square,
  turnOf,
} from './game-api.ts'

describe('中国象棋规则内核', () => {
  it('newGame creates the standard initial layout and red moves first', () => {
    const state = newGame()

    expect(boardCodesOf(state)).toEqual(initialBoard())
    expect(turnOf(state)).toBe('red')
    expect(historyOf(state)).toHaveLength(0)
  })

  it('allows a cannon to capture across exactly one screen and rejects a screenless capture', () => {
    const board = boardWithKings()
    put(board, 'e5', 'C')
    put(board, 'e4', 'P')
    put(board, 'e2', 'p')
    const state = newCustomGame(board)

    const moves = getLegalMoves(state, square('e5'))
    expect(containsDestination(moves, square('e2'))).toBe(true)
    expect(containsDestination(moves, square('e3'))).toBe(false)

    const afterCapture = applyMove(state, square('e5'), square('e2'))
    expect(pieceAt(afterCapture, 'e5')).toBeNull()
    expect(pieceAt(afterCapture, 'e2')).toBe('C')

    const noScreenBoard = boardWithKings()
    put(noScreenBoard, 'e5', 'C')
    put(noScreenBoard, 'e2', 'p')
    const noScreenState = newCustomGame(noScreenBoard)
    expect(containsDestination(getLegalMoves(noScreenState, square('e5')), square('e2'))).toBe(
      false
    )
    expect(() => applyMove(noScreenState, square('e5'), square('e2'))).toThrow()
  })

  it('blocks a knight move when its leg is occupied', () => {
    const blockedBoard = boardWithKings()
    put(blockedBoard, 'e5', 'N')
    put(blockedBoard, 'e6', 'P')
    const blockedMoves = getLegalMoves(newCustomGame(blockedBoard), square('e5'))

    expect(containsDestination(blockedMoves, square('f7'))).toBe(false)
    expect(containsDestination(blockedMoves, square('g6'))).toBe(true)

    const openBoard = boardWithKings()
    put(openBoard, 'e5', 'N')
    const openMoves = getLegalMoves(newCustomGame(openBoard), square('e5'))
    expect(containsDestination(openMoves, square('f7'))).toBe(true)
  })

  it('does not allow a move that exposes the two generals to each other', () => {
    const board = emptyBoardWithFacingGenerals()
    put(board, 'd8', 'R')
    const state = newCustomGame(board)

    const moves = getLegalMoves(state, square('d8'))
    expect(containsDestination(moves, square('d7'))).toBe(true)
    expect(containsDestination(moves, square('e8'))).toBe(false)
    expect(() => applyMove(state, square('d8'), square('e8'))).toThrow()
  })

  it('only gains horizontal pawn moves after crossing the river', () => {
    const beforeRiverBoard = boardWithKings()
    put(beforeRiverBoard, 'e5', 'P')
    const beforeRiverMoves = getLegalMoves(newCustomGame(beforeRiverBoard), square('e5'))
    expect(containsDestination(beforeRiverMoves, square('e4'))).toBe(true)
    expect(containsDestination(beforeRiverMoves, square('d5'))).toBe(false)
    expect(containsDestination(beforeRiverMoves, square('f5'))).toBe(false)

    const afterRiverBoard = boardWithKings()
    put(afterRiverBoard, 'e4', 'P')
    const afterRiverMoves = getLegalMoves(newCustomGame(afterRiverBoard), square('e4'))
    expect(containsDestination(afterRiverMoves, square('e3'))).toBe(true)
    expect(containsDestination(afterRiverMoves, square('d4'))).toBe(true)
    expect(containsDestination(afterRiverMoves, square('f4'))).toBe(true)
    expect(containsDestination(afterRiverMoves, square('e5'))).toBe(false)
  })

  it('rejects wrong-turn, geometrically invalid, and out-of-board moves', () => {
    const initial = newGame()
    expect(() => applyMove(initial, square('a0'), square('a1'))).toThrow()

    const invalidBoard = boardWithKings()
    put(invalidBoard, 'e5', 'R')
    put(invalidBoard, 'f4', 'P')
    const invalidState = newCustomGame(invalidBoard)
    expect(() => applyMove(invalidState, square('e5'), square('f4'))).toThrow()

    const offBoardMove = {
      from: { x: -1, y: 0 },
      to: { x: 0, y: 0 },
    }
    expect(() => applyMove(initial, offBoardMove.from, offBoardMove.to)).toThrow()
  })
})

function emptyBoardWithFacingGenerals() {
  const board = boardWithKings()
  put(board, 'f0', null)
  put(board, 'd0', 'k')
  return board
}
