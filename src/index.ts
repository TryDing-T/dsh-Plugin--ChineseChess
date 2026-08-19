/** Host package entry for the DSH Chinese chess bundle. */

import { XiangqiService } from './host/dsh-service.ts'

declare module '@deepseek-ai/cordis' {
  interface Context {
    xiangqi: XiangqiService
  }
}

export { XiangqiService }
export type * from './types.ts'
export type * from './host/types.ts'
export { XiangqiError, XiangqiHostService } from './host/service.ts'
export { createXiangqiGameFactory } from './host/game-adapter.ts'
export { XIANGQI_TOOL_NAME, createXiangqiToolSpec, executeXiangqiTool } from './host/dsh-tool.ts'
export type { XiangqiToolAction, XiangqiToolArgs, XiangqiToolResult } from './host/dsh-tool.ts'

export default XiangqiService
