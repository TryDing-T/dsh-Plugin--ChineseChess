import { XiangqiHostService } from './service.ts';
import type { XiangqiSerializedState, XiangqiSide } from './types.ts';
export declare const XIANGQI_TOOL_NAME = "xiangqi_game";
export type XiangqiToolAction = 'new_game' | 'get' | 'move' | 'undo' | 'resign';
export interface XiangqiToolArgs {
    readonly action: XiangqiToolAction;
    readonly game_id?: string;
    readonly session_id?: string;
    readonly revision?: number;
    readonly from?: string;
    readonly to?: string;
    readonly side?: XiangqiSide;
}
export interface XiangqiToolResult {
    readonly ok: true;
    readonly action: XiangqiToolAction;
    readonly state: XiangqiSerializedState;
    readonly message: string;
}
/** Minimal execution shape needed by this pure adapter. */
export interface XiangqiToolExecution {
    /** The DSH exec signal is intentionally opaque at this dependency-free seam. */
    readonly signal?: unknown;
    readonly agent?: unknown;
}
/**
 * DSH-shaped definition without importing DSH packages.
 *
 * The plugin directory currently has no package.json/node_modules, so importing
 * @deepseek-ai/dsh-tools here would make the Host layer unbuildable. The shape
 * intentionally mirrors rc.7 defineTool and is consumed by the main-thread
 * adapter through `defineTool(createXiangqiToolSpec(service))`.
 */
export interface XiangqiToolDefinition {
    readonly name: string;
    readonly description: string;
    readonly parameters: Record<string, unknown>;
    readonly output: {
        readonly schema: Record<string, unknown>;
        readonly render: (args: unknown, value: XiangqiToolResult) => readonly {
            type: 'text';
            text: string;
        }[];
        readonly presentationMeta?: (args: unknown, value: XiangqiToolResult) => Record<string, unknown>;
    };
    readonly timeoutMs: number;
    readonly isConcurrencySafe: (args: XiangqiToolArgs) => boolean;
    readonly execute: (args: XiangqiToolArgs, exec: XiangqiToolExecution | unknown) => Promise<XiangqiToolResult>;
}
/** Execute the model command without relying on a DSH runtime import. */
export declare function executeXiangqiTool(service: XiangqiHostService, rawArgs: unknown): XiangqiToolResult;
/**
 * Create the minimal model-facing tool contract.
 *
 * Main-thread integration should pass this object to the verified rc.7
 * `defineTool` and then call `ctx.tools.register(...)`; see dsh-service.ts.
 */
export declare function createXiangqiToolSpec(service: XiangqiHostService): XiangqiToolDefinition;
//# sourceMappingURL=dsh-tool.d.ts.map