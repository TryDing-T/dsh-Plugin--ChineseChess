/** Session projection unit for the latest committed Chinese chess state. */
import { z } from 'zod';
/**
 * The event append boundary performs the detailed state validation. The
 * projection registry still needs a Zod schema at its outbound boundary; the
 * JSON-safe domain type is intentionally validated as an opaque whole here so
 * future core fields can be added without duplicating the game schema.
 */
export const xiangqiProjectionSchema = z.unknown();
export function applyXiangqiProjection(state, event) {
    if (event.type !== 'xiangqi/change')
        return state;
    return event.data.state;
}
export function viewXiangqiProjection(state) {
    return state;
}
//# sourceMappingURL=projection.js.map