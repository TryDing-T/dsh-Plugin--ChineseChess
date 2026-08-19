/** DSH-native model tool registration for the Chinese chess Host service. */

import { defineTool, type ToolRunContext } from '@deepseek-ai/dsh-tools'
import type { JsonValue } from '@deepseek-ai/dsh-session'
import { XiangqiError } from './service.ts'
import type { XiangqiService } from './dsh-service.ts'
import type { XiangqiToolAction, XiangqiToolArgs } from './dsh-tool.ts'

const ACTIONS: readonly XiangqiToolAction[] = ['new_game', 'get', 'move', 'undo', 'resign']

const OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    ok: { type: 'boolean', required: true },
    action: { type: 'string', required: true, enum: ACTIONS },
    state: { type: 'json', required: true },
    message: { type: 'string', required: true },
  },
} as const

type XiangqiRuntimeToolResult = {
  readonly ok: boolean
  readonly action: XiangqiToolAction
  readonly state: JsonValue
  readonly message: string
}

function render(_args: XiangqiToolArgs, value: XiangqiRuntimeToolResult) {
  return [{ type: 'text' as const, text: JSON.stringify(value) }]
}

function stateRecord(value: JsonValue): Record<string, JsonValue> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value
    : {}
}

function execute(service: XiangqiService, args: XiangqiToolArgs, exec: ToolRunContext): Promise<XiangqiRuntimeToolResult> {
  const agent = exec.agent
  if (agent === undefined) {
    throw new XiangqiError('INVALID_INPUT', 'the Chinese chess tool requires a calling DSH agent')
  }
  const value = service.executeTool(agent, args)
  return Promise.resolve({
    ok: value.ok,
    action: value.action,
    state: JSON.parse(JSON.stringify(value.state)) as JsonValue,
    message: value.message,
  })
}

/** Create the actual rc.7 ToolDefinition after the Host service is mounted. */
export function createXiangqiRuntimeTool(service: XiangqiService) {
  return defineTool({
    name: 'xiangqi_game',
    description: 'Play Chinese chess in the current DSH session. Use new_game first. '
      + 'When the current game_id and revision are already supplied by the latest state, '
      + 'call move directly; use get only when the current state is genuinely unavailable. '
      + 'Mutating actions require the exact game_id and revision returned by the latest successful result. '
      + 'Coordinates use the chess UI format, for example e3 to e4. Use undo only for a '
      + 'committed move, and resign only when the user explicitly requests it.',
    parameters: {
      action: {
        type: 'string',
        required: true,
        enum: ACTIONS,
        description: 'new_game | get | move | undo | resign.',
      },
      game_id: { type: 'string', description: 'Exact game_id from the latest successful result.' },
      revision: { type: 'integer', description: 'Exact current revision from the latest successful result.' },
      from: { type: 'string', description: 'Source coordinate, for example e3.' },
      to: { type: 'string', description: 'Destination coordinate, for example e4.' },
      side: { type: 'string', enum: ['red', 'black'], description: 'Side resigning; required for resign.' },
    },
    output: {
      schema: OUTPUT_SCHEMA,
      render,
      presentationMeta: (_args, value) => {
        const state = stateRecord(value.state)
        return {
          action: value.action,
          gameId: typeof state.gameId === 'string' ? state.gameId : '',
          revision: typeof state.revision === 'number' ? state.revision : 0,
        }
      },
    },
    timeoutMs: 2_000,
    isConcurrencySafe: () => false,
    execute: (args, exec) => execute(service, args, exec),
  })
}
