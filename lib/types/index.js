/** Host package entry for the DSH Chinese chess bundle. */
import { XiangqiService } from "./host/dsh-service.js";
export { XiangqiService };
export { XiangqiError, XiangqiHostService } from "./host/service.js";
export { createXiangqiGameFactory } from "./host/game-adapter.js";
export { XIANGQI_TOOL_NAME, createXiangqiToolSpec, executeXiangqiTool } from "./host/dsh-tool.js";
export default XiangqiService;
//# sourceMappingURL=index.js.map