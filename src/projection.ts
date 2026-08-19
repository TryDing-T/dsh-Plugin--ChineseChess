/** Session projection unit for the latest committed Chinese chess state. */

import type { SessionEvent } from '@deepseek-ai/dsh-session'
import type { ZodType } from 'zod'
import { z } from 'zod'
import type { XiangqiProjection } from './types.ts'
import type {} from './domain.ts'

/**
 * The event append boundary performs the detailed state validation. The
 * projection registry still needs a Zod schema at its outbound boundary; the
 * JSON-safe domain type is intentionally validated as an opaque whole here so
 * future core fields can be added without duplicating the game schema.
 */
export const xiangqiProjectionSchema: ZodType<XiangqiProjection> = z.unknown() as ZodType<XiangqiProjection>

export function applyXiangqiProjection(
  state: XiangqiProjection,
  event: SessionEvent,
): XiangqiProjection {
  if (event.type !== 'xiangqi/change') return state
  return event.data.state
}

export function viewXiangqiProjection(state: XiangqiProjection): XiangqiProjection {
  return state
}
