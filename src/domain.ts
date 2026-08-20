/** Host-side durable event vocabulary for one Chinese chess session. */

import { KNOWN_SESSION_EVENT_TYPES } from '@deepseek-ai/dsh-session'
import type { XiangqiChange } from './types.ts'

/**
 * The rc.7 persistence catalog is generated inside dsh-session and does not
 * have a runtime registration API for events contributed by an external
 * plugin. Register this optional domain event in the shared catalog before
 * the host starts loading session history; otherwise a session containing a
 * chess move is rejected even when this plugin is installed.
 */
export function registerXiangqiSessionEventType(): void {
  const catalog = KNOWN_SESSION_EVENT_TYPES as Set<string>
  if (!catalog.has('xiangqi/change')) catalog.add('xiangqi/change')
}

declare module '@deepseek-ai/dsh-session/types' {
  interface SessionEventMap {
    /** Complete post-mutation game state; projection folding is last-wins. */
    'xiangqi/change': XiangqiChange
  }
}

export type { XiangqiChange }
