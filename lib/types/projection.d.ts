/** Session projection unit for the latest committed Chinese chess state. */
import type { SessionEvent } from '@deepseek-ai/dsh-session';
import type { ZodType } from 'zod';
import type { XiangqiProjection } from './types.ts';
/**
 * The event append boundary performs the detailed state validation. The
 * projection registry still needs a Zod schema at its outbound boundary; the
 * JSON-safe domain type is intentionally validated as an opaque whole here so
 * future core fields can be added without duplicating the game schema.
 */
export declare const xiangqiProjectionSchema: ZodType<XiangqiProjection>;
export declare function applyXiangqiProjection(state: XiangqiProjection, event: SessionEvent): XiangqiProjection;
export declare function viewXiangqiProjection(state: XiangqiProjection): XiangqiProjection;
//# sourceMappingURL=projection.d.ts.map