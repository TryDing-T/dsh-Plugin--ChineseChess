# DSH 中国象棋插件

在 DeepSeek Harness（DSH）Web 界面中打开独立的中国象棋棋盘，与 DSH 模型对弈。

- 用户执红方，DSH 执黑方。
- 棋盘是标准 9×10 布局，楚河汉界、九宫和棋子初始位置完整保留。
- Host 端负责棋规、合法性、轮次和版本校验，客户端只负责交互展示。
- 棋局只保存在 DSH Host 进程内存里，**不写入任何用户任务会话历史**；切换 DSH 聊天不会重开棋局，
  DSH 重启或插件重载后自然回到未开局状态，下次打开直接创建新局。
- 黑方决策走 Host 后台轻量调用：路由使用 Agent 会话请求头快照（provider/model/思考程度）
  与显式覆盖解析，与 DSH 0.1.2 的 `model/selection` 记录语义一致。
- 支持最小化棋盘、悔棋、新局、认输和棋谱复制；模型请求失败后可一键"重新请求 DSH 落子"。
- 多个标签页/窗口共享同一份全局棋局与 AI 状态：任一页面都能看到"AI 正在计算"，也能取消同一次决策。

> **版本兼容**：v0.1.18 适配 DSH **0.1.2-alpha.3**（`dsh`/profile 依赖全 0.1.2-alpha.3 线）。
> 依赖 `dsh-client-store`/`dsh-util-values` 等 0.1.2 新包；不再使用已在 0.1.2 移除的
> `dsh-client-runtime` 与 Client 侧 `session.models` RPC（模型路由改由 Host 会话请求头兜底）。

## 安装

### 从 GitHub tag 压缩包安装（推荐）

需要已安装 DSH，并使用 `web` profile：

```powershell
dsh plugin --profile web add "https://github.com/TryDing-T/dsh-Plugin--ChineseChess/archive/refs/tags/v0.1.18.tar.gz"
```

安装完成后重启 DSH，在左侧插件入口点击“下盘象棋”。如果你使用的不是 `web`，把 `web` 换成实际 profile 名称。

仓库已经提交 Host 和 Web 的预构建产物，Git 安装阶段不需要执行构建脚本，因此不需要额外修改 profile 的
`pnpm-workspace.yaml`。

也可以直接安装仓库地址；当前版本没有 `prepare`，不会要求 profile 允许安装阶段构建：

```powershell
dsh plugin --profile web add "https://github.com/TryDing-T/dsh-Plugin--ChineseChess.git"
```

验证插件层是否挂载：

```powershell
dsh --profile web --dump-config | Select-String "xiangqi"
```

### 从本地安装包安装

```powershell
npm pack
dsh plugin --profile web add ".\deepseek-ai-dsh-plugin-xiangqi-0.1.18.tgz"
```

仓库已提交可直接运行的 `lib` 产物（含 typert 手写生成与 browser bundle）。

## 对弈方式

点击红方棋子，再点击合法落点即可落子。红方完成落子后，插件会：

1. 当前 DSH Host 还没有棋局时，首次打开棋盘会初始化一局；
2. 只有点击“新局”时才主动创建一局新的全局棋局（旧棋局立即退役，无法被延迟请求复活）；
3. 切换 DSH 聊天时读取并继续当前全局棋局；关闭页面、最小化都不影响 Host 内存中的对局；
   DSH 进程重启后棋局随内存消失，下次打开直接开始新局；
4. Host 根据当前规则局面生成最多 5 个合法候选，并固定 `gameId + revision + positionId`；
5. 通过 Host 后台轻量调用请求候选选择，重新检查 revision、局面事实和候选合法性后提交黑方走法；
6. 插件卸载或热重载时会取消进行中的模型请求，已返回的旧结果一律作废，绝不改变棋局。

因此它不是纯本地 AI：本地搜索只在 Host 内压缩候选，大模型仍然负责最终判断。模型失败、取消、输出协议错误或候选过期时，revision 不变，也不会静默切换到本地引擎——棋盘会停在黑方回合并提供"重新请求 DSH 落子"按钮。思考程度跟随会话模型选择器的自定义取值（如 off/xhigh/max），由 Host 路由解析原样透传。后台轻量调用不会自动生成完整的聊天 reasoning 记录。

## 规则边界

- 将死与困毙都按中国象棋规则判负：一方无合法着法即输，由对方获胜（没有国际象棋式困毙和棋）。
- 长将、长捉、重复局面等待判规则目前**不自动判定**；如遇循环局面请手动悔棋或开新局。

## 状态与生命周期

- 同一 DSH 进程内：切换聊天、关闭棋盘页面、最小化都不会丢棋局；多个标签页看到一致的棋盘与
  "AI 正在计算 / 等待重试 / 已取消 / 模型调用失败"状态。
- DSH 重启或插件 HMR 重载后：棋局随进程内存消失，**没有任何磁盘持久化文件**；
  旧版本（≤0.1.16）曾写入用户任务会话的 `xiangqi/change` 事件仍可正常加载，新版本不再产生该类事件。
- 插件卸载：正在等待的模型请求被立即取消，晚到的模型结果不会提交任何落子。

棋盘右上角的“最小化棋盘”可以把棋盘收成右下角悬浮条，点击“恢复棋盘”继续对弈。

## DSH Bundle 入口

`package.json` 声明了：

```json
{
  "dsh": {
    "bundle": {
      "patch": "./cordis.patch.yml"
    }
  }
}
```

`cordis.patch.yml` 会注册 `@deepseek-ai/dsh-plugin-xiangqi`，入口 ID 为 `xiangqi`。这是 `dsh plugin --profile <name> add` 自动识别和挂载插件的关键。

## 开发

```powershell
npm install
npm run typecheck
npm test
npm run build
npm pack
```

类型与测试解析全部来自 `node_modules` 的 0.1.2-alpha.3 npm 包，不依赖 DSH 源码工作区；
`tsdown` 的 client 打包预设来自本机 `_DSHarness-alpha3`（0.1.2-alpha.3 克隆，`packages/client/tsdown.client.ts`），
构建前需在 `_DSHarness-alpha3/packages/extensions/xiangqi-validation/` 放置同名 `package.json` 化身
（预设的 workspaceManifest glob 需要识别插件名），源码树自 0.1.2 起不再提交生成的 typert 产物。

主要目录：

- `src/host`：Host 服务、内存态运行状态、模型路由快照与卸载闸门。
- `src/game`：棋盘状态、合法走法、序列化、记谱和本地候选搜索。
- `src/client`：侧边栏入口、棋盘界面、多标签页状态同步与最小化交互。
- `tests`：棋规、AI 候选、Host 服务、路由快照、生命周期与 React 界面测试。

## 速度设计

本地搜索参考了 [shibing624/chinese-chess-ai](https://github.com/shibing624/chinese-chess-ai) 的 Alpha-Beta、走法排序和评估思路，并适配到本插件自己的合法走法内核。搜索只负责在 Host 内筛选候选，不替代 DSH 模型的最终判断，也不绕过 Host 的 revision 和合法性校验。

## 许可证

[MIT](./LICENSE)。引用的开源项目请遵守其各自许可证和版权声明。
