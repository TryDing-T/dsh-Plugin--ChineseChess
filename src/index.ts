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
export { XiangqiError, XiangqiHostService, assertCurrentGame } from './host/service.ts'
export { createXiangqiGameFactory } from './host/game-adapter.ts'

export default XiangqiService
