/** Host-side aliases kept separate so the Typert service signature is easy to audit. */

export type {
  XiangqiMoveRequest,
  XiangqiNewGameRequest,
  XiangqiResignRequest,
  XiangqiSerializedState,
  XiangqiUndoRequest,
} from './types.ts'

export type { XiangqiToolArgs, XiangqiToolResult } from './dsh-tool.ts'
