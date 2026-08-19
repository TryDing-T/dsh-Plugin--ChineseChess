import type { GameState } from '../game/types.ts';
import type { JsonValue, XiangqiGameFactory, XiangqiGamePort, XiangqiMove } from './types.ts';
/** Adapt the pure src/game rules to the Host service's transactional port. */
export declare class XiangqiGameAdapter implements XiangqiGamePort {
    private state;
    constructor(state: GameState);
    move(move: XiangqiMove): void;
    serialize(): JsonValue;
}
/** Build the default Host factory over the repository's actual game core. */
export declare function createXiangqiGameFactory(): XiangqiGameFactory;
//# sourceMappingURL=game-adapter.d.ts.map