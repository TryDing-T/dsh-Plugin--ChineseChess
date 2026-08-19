import { parseCoordinate } from '../game/coordinates.ts'
import { applyMove, newGame } from '../game/rules.ts'
import { deserialize as deserializeGame, serialize as serializeGame } from '../game/serialization.ts'
import type { GameState } from '../game/types.ts'
import type {
  JsonValue,
  XiangqiGameFactory,
  XiangqiGamePort,
  XiangqiMove,
} from './types.ts'

/** Adapt the pure src/game rules to the Host service's transactional port. */
export class XiangqiGameAdapter implements XiangqiGamePort {
  constructor(private state: GameState) {}

  move(move: XiangqiMove): void {
    this.state = applyMove(this.state, {
      from: parseCoordinate(move.from),
      to: parseCoordinate(move.to),
    })
  }

  serialize(): JsonValue {
    return JSON.parse(serializeGame(this.state)) as JsonValue
  }
}

/** Build the default Host factory over the repository's actual game core. */
export function createXiangqiGameFactory(): XiangqiGameFactory {
  return {
    create: () => new XiangqiGameAdapter(newGame()),
    restore: state => new XiangqiGameAdapter(deserializeGame(JSON.stringify(state))),
  }
}
