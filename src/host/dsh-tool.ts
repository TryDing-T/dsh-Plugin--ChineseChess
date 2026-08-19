import { XiangqiError, XiangqiHostService } from './service.ts'
import type {
  XiangqiSerializedState,
  XiangqiSide,
} from './types.ts'

export const XIANGQI_TOOL_NAME = 'xiangqi_game'

export type XiangqiToolAction = 'new_game' | 'get' | 'move' | 'undo' | 'resign'

export interface XiangqiToolArgs {
  readonly action: XiangqiToolAction
  readonly game_id?: string
  readonly session_id?: string
  readonly revision?: number
  readonly from?: string
  readonly to?: string
  readonly side?: XiangqiSide
}

export interface XiangqiToolResult {
  readonly ok: true
  readonly action: XiangqiToolAction
  readonly state: XiangqiSerializedState
  readonly message: string
}

/** Minimal execution shape needed by this pure adapter. */
export interface XiangqiToolExecution {
  /** The DSH exec signal is intentionally opaque at this dependency-free seam. */
  readonly signal?: unknown
  readonly agent?: unknown
}

/**
 * DSH-shaped definition without importing DSH packages.
 *
 * The plugin directory currently has no package.json/node_modules, so importing
 * @deepseek-ai/dsh-tools here would make the Host layer unbuildable. The shape
 * intentionally mirrors rc.7 defineTool and is consumed by the main-thread
 * adapter through `defineTool(createXiangqiToolSpec(service))`.
 */
export interface XiangqiToolDefinition {
  readonly name: string
  readonly description: string
  readonly parameters: Record<string, unknown>
  readonly output: {
    readonly schema: Record<string, unknown>
    readonly render: (args: unknown, value: XiangqiToolResult) => readonly { type: 'text'; text: string }[]
    readonly presentationMeta?: (args: unknown, value: XiangqiToolResult) => Record<string, unknown>
  }
  readonly timeoutMs: number
  readonly isConcurrencySafe: (args: XiangqiToolArgs) => boolean
  readonly execute: (args: XiangqiToolArgs, exec: XiangqiToolExecution | unknown) => Promise<XiangqiToolResult>
}

const ACTIONS: readonly XiangqiToolAction[] = ['new_game', 'get', 'move', 'undo', 'resign']

const XIANGQI_DESCRIPTION =
  'Play Chinese chess in the current DSH session. Use new_game first. When the current '
  + 'game_id and revision are already available, call move directly; use get only when '
  + 'the current state is genuinely unavailable. Mutating actions require the '
  + 'exact game_id and revision returned by the tool; never invent or reuse a stale '
  + 'revision. For move, from and to are the canonical board coordinates supplied by '
  + 'the chess UI. Use undo only for a committed move, and resign only when the user '
  + 'explicitly requests it. Illegal moves are rejected by the game core.'

const XIANGQI_PARAMETERS: Record<string, unknown> = {
  action: {
    type: 'string',
    required: true,
    enum: ACTIONS,
    description: 'new_game | get | move | undo | resign.',
  },
  game_id: {
    type: 'string',
    description: 'Exact game_id from the latest successful result.',
  },
  session_id: {
    type: 'string',
    description: 'Optional DSH session id used only with new_game.',
  },
  revision: {
    type: 'integer',
    description: 'Exact current revision from the latest successful result.',
  },
  from: {
    type: 'string',
    description: 'Source coordinate, for example a0.',
  },
  to: {
    type: 'string',
    description: 'Destination coordinate, for example a1.',
  },
  side: {
    type: 'string',
    enum: ['red', 'black'],
    description: 'Side resigning; required only for resign.',
  },
}

const XIANGQI_OUTPUT_SCHEMA: Record<string, unknown> = {
  type: 'object',
  additionalProperties: false,
  properties: {
    ok: { type: 'boolean', required: true },
    action: { type: 'string', required: true },
    state: { type: 'json', required: true },
    message: { type: 'string', required: true },
  },
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new XiangqiError('INVALID_INPUT', 'tool arguments must be an object')
  }
  return value as Record<string, unknown>
}

function requiredText(record: Record<string, unknown>, field: string): string {
  const value = record[field]
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new XiangqiError('INVALID_INPUT', `${field} is required and must be a non-empty string`)
  }
  return value.trim()
}

function optionalText(record: Record<string, unknown>, field: string): string | undefined {
  const value = record[field]
  if (value === undefined) return undefined
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new XiangqiError('INVALID_INPUT', `${field} must be a non-empty string when provided`)
  }
  return value.trim()
}

function requiredRevision(record: Record<string, unknown>): number {
  const value = record.revision
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1) {
    throw new XiangqiError('INVALID_INPUT', 'revision is required and must be a positive safe integer')
  }
  return value
}

function requiredSide(record: Record<string, unknown>): XiangqiSide {
  const value = record.side
  if (value !== 'red' && value !== 'black') {
    throw new XiangqiError('INVALID_INPUT', 'side is required and must be "red" or "black"')
  }
  return value
}

function requiredAction(record: Record<string, unknown>): XiangqiToolAction {
  const value = record.action
  if (!ACTIONS.includes(value as XiangqiToolAction)) {
    throw new XiangqiError('INVALID_INPUT', `action must be one of ${ACTIONS.join(', ')}`)
  }
  return value as XiangqiToolAction
}

function rejectField(record: Record<string, unknown>, field: string, action: XiangqiToolAction): void {
  if (record[field] !== undefined) {
    throw new XiangqiError('INVALID_INPUT', `${field} is not valid for action ${action}`)
  }
}

/** Execute the model command without relying on a DSH runtime import. */
export function executeXiangqiTool(
  service: XiangqiHostService,
  rawArgs: unknown,
): XiangqiToolResult {
  const record = asRecord(rawArgs)
  const action = requiredAction(record)

  switch (action) {
    case 'new_game': {
      rejectField(record, 'game_id', action)
      rejectField(record, 'revision', action)
      rejectField(record, 'from', action)
      rejectField(record, 'to', action)
      rejectField(record, 'side', action)
      const sessionId = optionalText(record, 'session_id')
      const state = sessionId === undefined
        ? service.newGame({})
        : service.newGame({ sessionId })
      return { ok: true, action, state, message: 'New Chinese chess game created.' }
    }
    case 'get': {
      rejectField(record, 'session_id', action)
      rejectField(record, 'revision', action)
      rejectField(record, 'from', action)
      rejectField(record, 'to', action)
      rejectField(record, 'side', action)
      const state = service.get(requiredText(record, 'game_id'))
      return { ok: true, action, state, message: 'Current Chinese chess state.' }
    }
    case 'move': {
      rejectField(record, 'session_id', action)
      rejectField(record, 'side', action)
      const state = service.move({
        gameId: requiredText(record, 'game_id'),
        revision: requiredRevision(record),
        move: {
          from: requiredText(record, 'from'),
          to: requiredText(record, 'to'),
        },
      })
      return { ok: true, action, state, message: 'Move committed.' }
    }
    case 'undo': {
      rejectField(record, 'session_id', action)
      rejectField(record, 'from', action)
      rejectField(record, 'to', action)
      rejectField(record, 'side', action)
      const state = service.undo({
        gameId: requiredText(record, 'game_id'),
        revision: requiredRevision(record),
      })
      return { ok: true, action, state, message: 'Last committed move undone.' }
    }
    case 'resign': {
      rejectField(record, 'session_id', action)
      rejectField(record, 'from', action)
      rejectField(record, 'to', action)
      const state = service.resign({
        gameId: requiredText(record, 'game_id'),
        revision: requiredRevision(record),
        side: requiredSide(record),
      })
      return { ok: true, action, state, message: 'Resignation committed.' }
    }
  }
}

/**
 * Create the minimal model-facing tool contract.
 *
 * Main-thread integration should pass this object to the verified rc.7
 * `defineTool` and then call `ctx.tools.register(...)`; see dsh-service.ts.
 */
export function createXiangqiToolSpec(service: XiangqiHostService): XiangqiToolDefinition {
  return {
    name: XIANGQI_TOOL_NAME,
    description: XIANGQI_DESCRIPTION,
    parameters: XIANGQI_PARAMETERS,
    output: {
      schema: XIANGQI_OUTPUT_SCHEMA,
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }],
      presentationMeta: (_args, value) => ({
        action: value.action,
        gameId: value.state.gameId,
        revision: value.state.revision,
      }),
    },
    timeoutMs: 2_000,
    isConcurrencySafe: () => false,
    execute: async (args) => executeXiangqiTool(service, args),
  }
}
