/** Browser half: sidebar action, frame overlay, fast candidate search, and DSH turn prompt. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
export { XiangqiBoard, XiangqiPage } from './XiangqiPage.tsx';
export type { XiangqiPageProps } from './XiangqiPage.tsx';
export { toXiangqiGameViewModel, turnOf, ucciOf } from './view-model.ts';
export { createXiangqiStore } from './store.ts';
export { createXiangqiOverlay } from './XiangqiOverlay.tsx';
export type { XiangqiClientRemote, XiangqiOverlayProps, PromptDshTurn } from './XiangqiOverlay.tsx';
export { XIANGQI_COLUMNS, XIANGQI_ROWS, } from './types.ts';
export type { XiangqiGameStatus, XiangqiGameViewModel, XiangqiLegalMove, XiangqiMoveRecord, XiangqiMoveRequest, XiangqiPageActions, XiangqiPiece, XiangqiPieceKind, XiangqiPosition, XiangqiSide, } from './types.ts';
/** Required services for the browser slots, sessions, and Remote carrier. */
export declare const inject: string[];
/** Mount the Host Remote and the two additive browser surfaces. */
export declare function apply(ctx: ClientContext): Promise<void>;
//# sourceMappingURL=index.d.ts.map