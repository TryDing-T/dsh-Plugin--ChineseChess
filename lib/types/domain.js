/** Host-side durable event vocabulary for one Chinese chess session. */
import { KNOWN_SESSION_EVENT_TYPES } from '@deepseek-ai/dsh-session';
/**
 * The rc.7 persistence catalog is generated inside dsh-session and does not
 * have a runtime registration API for events contributed by an external
 * plugin. Register this optional domain event in the shared catalog before
 * the host starts loading session history; otherwise a session containing a
 * chess move is rejected even when this plugin is installed.
 */
export function registerXiangqiSessionEventType() {
    const catalog = KNOWN_SESSION_EVENT_TYPES;
    if (!catalog.has('xiangqi/change'))
        catalog.add('xiangqi/change');
}
//# sourceMappingURL=domain.js.map