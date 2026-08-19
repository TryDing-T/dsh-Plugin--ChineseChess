import { describe, expect, it } from 'vitest'
import {
  createXiangqiToolSpec,
  executeXiangqiTool,
} from '../../src/host/dsh-tool.ts'
import { XiangqiHostService } from '../../src/host/service.ts'
import type { JsonValue, XiangqiGameFactory, XiangqiGamePort } from '../../src/host/types.ts'

class ToolGame implements XiangqiGamePort {
  constructor(private moves: readonly string[] = []) {}

  move(move: { from: string; to: string }): void {
    this.moves = [...this.moves, `${move.from}-${move.to}`]
  }

  serialize(): JsonValue {
    return { moves: [...this.moves] }
  }
}

const factory: XiangqiGameFactory = {
  create: () => new ToolGame(),
  restore: state => new ToolGame([...(state as { moves: string[] }).moves]),
}

function createService() {
  return new XiangqiHostService(factory, { createGameId: () => 'game-tool' })
}

describe('xiangqi_game model boundary', () => {
  it('executes a new game and a revision-bound move', () => {
    const service = createService()
    const created = executeXiangqiTool(service, { action: 'new_game', session_id: 'session-1' })
    const moved = executeXiangqiTool(service, {
      action: 'move',
      game_id: created.state.gameId,
      revision: created.state.revision,
      from: 'a0',
      to: 'a1',
    })

    expect(created).toMatchObject({ ok: true, action: 'new_game', state: { revision: 1 } })
    expect(moved).toMatchObject({ ok: true, action: 'move', state: { revision: 2 } })
  })

  it('rejects action-specific missing fields and stale tool input', () => {
    const service = createService()
    executeXiangqiTool(service, { action: 'new_game' })

    expect(() => executeXiangqiTool(service, { action: 'move', game_id: 'game-tool' }))
      .toThrowError(/xiangqi: revision is required and must be a positive safe integer/)
    expect(() => executeXiangqiTool(service, { action: 'resign', game_id: 'game-tool', revision: 1, side: 'blue' }))
      .toThrowError(/xiangqi: side is required and must be "red" or "black"/)
    expect(() => executeXiangqiTool(service, { action: 'move', game_id: 'game-tool', revision: 99, from: 'a0', to: 'a1' }))
      .toThrowError(/xiangqi: stale revision 99; current revision is 1/)
  })

  it('exposes an rc.7-shaped tool definition and JSON text rendering', async () => {
    const spec = createXiangqiToolSpec(createService())

    expect(spec.name).toBe('xiangqi_game')
    expect(spec.description).toContain('exact game_id')
    expect((spec.parameters.action as { required: boolean }).required).toBe(true)
    expect((spec.output.schema.properties as Record<string, { required?: boolean }>).state.required).toBe(true)

    const value = await spec.execute({ action: 'new_game' }, {})
    expect(spec.output.render({}, value)[0].type).toBe('text')
    expect(spec.output.render({}, value)[0].text).toContain('gameId')
    expect(spec.output.presentationMeta?.({}, value)).toMatchObject({ action: 'new_game', revision: 1 })
  })
})

