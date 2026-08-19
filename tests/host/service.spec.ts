import { describe, expect, it } from 'vitest'
import {
  XiangqiError,
  XiangqiHostService,
} from '../../src/host/service.ts'
import type {
  JsonValue,
  XiangqiGameFactory,
  XiangqiGamePort,
  XiangqiMove,
} from '../../src/host/types.ts'

interface FakeState {
  readonly turn: 'red' | 'black'
  readonly moves: readonly string[]
}

class FakeGame implements XiangqiGamePort {
  constructor(private state: FakeState) {}

  move(move: XiangqiMove): void {
    if (move.to === 'illegal') throw new Error('illegal move from game core')
    this.state = {
      turn: this.state.turn === 'red' ? 'black' : 'red',
      moves: [...this.state.moves, `${move.from}-${move.to}`],
    }
  }

  serialize(): JsonValue {
    return {
      turn: this.state.turn,
      moves: [...this.state.moves],
    }
  }
}

const factory: XiangqiGameFactory = {
  create: () => new FakeGame({ turn: 'red', moves: [] }),
  restore: state => {
    const value = state as { turn: 'red' | 'black'; moves: string[] }
    return new FakeGame({ turn: value.turn, moves: [...value.moves] })
  },
}

function createService() {
  return new XiangqiHostService(factory, { createGameId: () => 'game-1' })
}

function move(revision: number, to = 'a1') {
  return {
    gameId: 'game-1',
    revision,
    move: { from: 'a0', to },
  }
}

describe('XiangqiHostService', () => {
  it('publishes only successful commits and rejects stale revisions', () => {
    const service = createService()
    const changes: string[] = []
    service.subscribe(change => changes.push(`${change.operation}:${change.state.revision}`))

    const created = service.newGame({ sessionId: 'session-1' })
    const moved = service.move(move(created.revision))

    expect(moved.revision).toBe(2)
    expect(changes).toEqual(['newGame:1', 'move:2'])
    expect(() => service.move(move(created.revision, 'b1')))
      .toThrowError(/xiangqi: stale revision 1; current revision is 2/)
    expect(service.get('game-1').revision).toBe(2)
    expect(changes).toHaveLength(2)
  })

  it('keeps the committed state and publication list unchanged for an illegal move', () => {
    const service = createService()
    const changes: string[] = []
    service.subscribe(change => changes.push(change.operation))
    const created = service.newGame()

    expect(() => service.move(move(created.revision, 'illegal')))
      .toThrowError(/xiangqi: illegal move from game core/)
    expect(service.get('game-1')).toMatchObject({ revision: 1, phase: 'active' })
    expect(changes).toEqual(['newGame'])
  })

  it('undoes a committed move with a new revision', () => {
    const service = createService()
    service.newGame()
    const moved = service.move(move(1))
    const undone = service.undo({ gameId: 'game-1', revision: moved.revision })

    expect(undone.revision).toBe(3)
    expect(undone.phase).toBe('active')
    expect(undone.gameState).toEqual({ turn: 'red', moves: [] })
    expect(() => service.undo({ gameId: 'game-1', revision: undone.revision }))
      .toThrowError(/xiangqi: no committed move is available to undo/)
  })

  it('commits resignation and blocks later moves', () => {
    const service = createService()
    const created = service.newGame()
    const resigned = service.resign({ gameId: created.gameId, revision: created.revision, side: 'red' })

    expect(resigned).toMatchObject({ revision: 2, phase: 'resigned', winner: 'black' })
    expect(() => service.move(move(resigned.revision, 'b1')))
      .toThrowError(/xiangqi: game "game-1" is resigned; winner is black/)
  })

  it('prefixes invalid input and unknown-game errors', () => {
    const service = createService()

    expect(() => service.get('')).toThrowError(XiangqiError)
    expect(() => service.get('missing')).toThrowError(/xiangqi: game "missing" was not found/)
    expect(() => service.newGame({ sessionId: ' ' })).toThrowError(/xiangqi: sessionId must be a non-empty string/)
  })
})

