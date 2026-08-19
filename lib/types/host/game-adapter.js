import { parseCoordinate } from "../game/coordinates.js";
import { applyMove, newGame } from "../game/rules.js";
import { deserialize as deserializeGame, serialize as serializeGame } from "../game/serialization.js";
/** Adapt the pure src/game rules to the Host service's transactional port. */
export class XiangqiGameAdapter {
    state;
    constructor(state) {
        this.state = state;
    }
    move(move) {
        this.state = applyMove(this.state, {
            from: parseCoordinate(move.from),
            to: parseCoordinate(move.to),
        });
    }
    serialize() {
        return JSON.parse(serializeGame(this.state));
    }
}
/** Build the default Host factory over the repository's actual game core. */
export function createXiangqiGameFactory() {
    return {
        create: () => new XiangqiGameAdapter(newGame()),
        restore: state => new XiangqiGameAdapter(deserializeGame(JSON.stringify(state))),
    };
}
//# sourceMappingURL=game-adapter.js.map