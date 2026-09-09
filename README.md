# DSH 中国象棋插件

在 DeepSeek Harness（DSH）Web 界面中打开独立的中国象棋棋盘，与 DSH 模型对弈。

- 用户执红方，DSH 执黑方。
- 棋盘是标准 9×10 布局，楚河汉界、九宫和棋子初始位置完整保留。
- Host 端负责棋规、合法性、轮次和版本校验，客户端只负责交互展示。
- 棋局只保存在 DSH Host 进程内存里，**不写入任何用户任务会话历史**；切换 DSH 聊天不会重开棋局，
  DSH 重启或插件重载后自然回到未开局状态，下次打开直接创建新局。
- 黑方决策走 Host 后台轻量调用：优先使用当前会话待生效的模型选择（`modelSelection.pending`），
  没有待生效选择时再使用最近请求头；切换模型或思考程度后无需先发送聊天消息。
- 支持最小化棋盘、悔棋、新局、认输和棋谱复制；模型请求失败后可一键"重新请求 DSH 落子"。
- 多个标签页/窗口共享同一份全局棋局与 AI 状态：任一页面都能看到"AI 正在计算"，也能取消同一次决策。

> **版本兼容**：v0.1.19 适配 DSH **0.1.5-alpha.1**（`dsh`/profile 依赖全 0.1.5-alpha.1 线）。
> 构建完全自包含，遵守 DSH `ModuleLoader` 规范与异步 Disposer 资源回收合约。

## 安装

### 从 GitHub Release 安装（推荐）

需要已安装 DSH，并使用 `web` profile：

```powershell
dsh plugin --profile web add "https://github.com/TryDing-T/dsh-Plugin--ChineseChess/releases/download/v0.1.19/deepseek-ai-dsh-plugin-xiangqi-0.1.19.tgz"
```

安装完成后重启 DSH，在左侧插件入口点击“下盘象棋”。如果你使用的不是 `web`，把 `web` 换成实际 profile 名称。

Release 附件包含预构建的 Host、Web 和 Typert 产物，并附 `SHA256SUMS.txt` 校验文件。
安装无需执行构建脚本，也无需额外放开 profile 的安装脚本权限。

也可以安装固定版本标签；仓库保留同版本预构建产物，没有 `prepare` 安装脚本：

```powershell
dsh plugin --profile web add "https://github.com/TryDing-T/dsh-Plugin--ChineseChess/archive/refs/tags/v0.1.19.tar.gz"
```

验证插件层是否挂载：

```powershell
dsh --profile web --dump-config | Select-String "xiangqi"
```

### 从本地安装包安装

```powershell
dsh plugin --profile web add ".\deepseek-ai-dsh-plugin-xiangqi-0.1.19.tgz"
```

本地安装包可从 Release 下载；从源码生成安装包见下方开发命令。

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
  新版本不再产生 `xiangqi/change` 事件。
- 旧版本（≤0.1.16）的历史会话若包含未标记 `ignorable: true` 的 `xiangqi/change`，
  当前 DSH 可能拒绝读取；升级本插件不会自动修复它。请保留原始历史文件，单独诊断格式和迁移问题。
  本插件不修改 Core 事件清单，也不删除、覆盖或自动改写旧会话。
- 插件卸载：取消模型请求，并等待所有模型流结束后才完成卸载；已取消但仍在收尾的旧请求也会等待。
  不增加模型思考超时，晚到结果不会提交落子。

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
pnpm install --frozen-lockfile
npm run typecheck
npm test
npm run check:typert
npm pack
```

依赖锁定在 `pnpm-lock.yaml`；类型和构建使用 0.1.5-alpha.1 npm 包，不依赖相邻 DSH 源码目录。
构建顺序为：清空 `lib` → Host 类型编译 → 官方 Typert 生成器 → Host 打包 → Client 类型编译与打包。
`scripts/generate-typert.mjs` 在临时工作区内注册插件源码与已安装依赖的公开类型，调用官方生成器，结束后清理临时文件。
`npm run check:typert` 检查生成产物与源码是否一致，不手工维护 descriptor 或 codec。

`npm test` 会先构建，再运行规则、Host 生命周期、模型路由、React 界面和构建后 Client Loader 测试；
`npm pack` 会执行同一组检查。构建、单测和 Loader 测试不替代真实 Web 操作及真实模型验收。

## v0.1.19 更新

- 适配 DSH 0.1.5-alpha.1，独立构建符合 ModuleLoader 协议的 Client bundle。
- 立即采用待生效的模型选择；选择默认思考程度时不继承旧模型的思考设置。
- 卸载等待全部模型流结束，保持取消后不落子、无本地引擎兜底的行为。
- Typert 产物改为自动生成，增加 Host 回归测试和构建产物加载验证。
- 同步 Release 安装命令，明确旧会话兼容范围。

主要目录：

- `src/host`：Host 服务、内存态运行状态、模型路由快照与卸载闸门。
- `src/game`：棋盘状态、合法走法、序列化、记谱和本地候选搜索。
- `src/client`：侧边栏入口、棋盘界面、多标签页状态同步与最小化交互。
- `tests`：棋规、AI 候选、Host 服务、路由快照、生命周期与 React 界面测试。

## 速度设计

本地搜索参考了 [shibing624/chinese-chess-ai](https://github.com/shibing624/chinese-chess-ai) 的 Alpha-Beta、走法排序和评估思路，并适配到本插件自己的合法走法内核。搜索只负责在 Host 内筛选候选，不替代 DSH 模型的最终判断，也不绕过 Host 的 revision 和合法性校验。

## 许可证

[MIT](./LICENSE)。引用的开源项目请遵守其各自许可证和版权声明。
