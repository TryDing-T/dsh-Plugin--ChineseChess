/** Browser half: sidebar action, frame overlay, and generated DSH Remote bridge. */
import type { Context as ClientContext } from '@deepseek-ai/cordis';
export { XiangqiBoard, XiangqiPage } from './XiangqiPage.tsx';
export type { XiangqiPageProps } from './XiangqiPage.tsx';
export { liveStatusTextOf, toXiangqiGameViewModel, turnOf, ucciOf } from './view-model.ts';
export { createXiangqiStore } from './store.ts';
export { createXiangqiOverlay } from './XiangqiOverlay.tsx';
export type { XiangqiClientRemote, XiangqiOverlayProps } from './XiangqiOverlay.tsx';
export { XIANGQI_COLUMNS, XIANGQI_ROWS, } from './types.ts';
export type { XiangqiGameStatus, XiangqiGameViewModel, XiangqiLegalMove, XiangqiMoveRecord, XiangqiMoveRequest, XiangqiPageActions, XiangqiPiece, XiangqiPieceKind, XiangqiPosition, XiangqiSide, } from './types.ts';
/**
 * The outer Client plugin mounts the generated Remote; the UI itself runs in
 * a child fiber.
 */
export declare const name = "dsh-plugin-xiangqi/client";
export declare const inject: string[];
/** Mount the Host Remote, then activate the UI in a child with the exact namespace injection. */
export declare function apply(ctx: ClientContext): Promise<() => Promise<void>>;
//# sourceMappingURL=index.d.ts.map