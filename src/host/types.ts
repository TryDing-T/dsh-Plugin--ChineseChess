import type {
  JsonValue,
  XiangqiChange,
  XiangqiMove,
} from '../types.ts'

export type {
  JsonObject,
  JsonPrimitive,
  JsonValue,
  XiangqiChange,
  XiangqiGamePhase,
  XiangqiMove,
  XiangqiMoveRequest,
  XiangqiNewGameRequest,
  XiangqiOperation,
  XiangqiResignRequest,
  XiangqiSerializedState,
  XiangqiSide,
  XiangqiUndoRequest,
} from '../types.ts'

/**
 * Minimal game-core port required by the Host service.
 *
 * The game-core adapter is deliberately small: the Host owns lifecycle and
 * revisions while the pure rules package owns legality.
 */
export interface XiangqiGamePort {
  /** Apply one legal move or throw a rule error. */
  move(move: XiangqiMove): void
  /** Return the complete restorable game state as lossless JSON. */
  serialize(): JsonValue
}

export interface XiangqiGameFactory {
  /** Create a fresh initial game. */
  create(): XiangqiGamePort
  /** Rehydrate a game without mutating the stored record. */
  restore(state: JsonValue): XiangqiGamePort
}

export type XiangqiChangeListener = (change: XiangqiChange) => void

export type XiangqiGameIdFactory = () => string

export interface XiangqiHostServiceOptions {
  readonly createGameId?: XiangqiGameIdFactory
}
