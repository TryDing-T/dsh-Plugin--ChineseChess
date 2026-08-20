# DSH 中国象棋插件

在 DeepSeek Harness（DSH）Web 界面中打开独立的中国象棋棋盘，与 DSH 当前会话的模型对弈。

- 用户执红方，DSH 执黑方。
- 棋盘是标准 9×10 布局，楚河汉界、九宫和棋子初始位置完整保留。
- Host 端负责棋规、合法性、轮次和版本校验，客户端只负责交互展示。
- 红方落子后，浏览器先做快速候选搜索，再交给当前 DSH 模型做最终判断。
- 支持当前会话模型选择器、最小化棋盘、悔棋、新局、认输和棋谱复制。

## 安装

### 从 GitHub tag 压缩包安装（推荐）

需要已安装 DSH，并使用 `web` profile：

```powershell
dsh plugin --profile web add "https://github.com/TryDing-T/dsh-Plugin--ChineseChess/archive/refs/tags/v0.1.9.tar.gz"
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
npm run build
npm pack
dsh plugin --profile web add ".\deepseek-ai-dsh-plugin-xiangqi-0.1.8.tgz"
```

## 对弈方式

点击红方棋子，再点击合法落点即可落子。红方完成落子后，插件会：

1. 在浏览器本地用浅层 Alpha-Beta 搜索快速生成候选走法；
2. 把当前 FEN、局面版本和候选走法交给当前 DSH 模型；
3. 由模型通过 `xiangqi_game` 工具选择黑方走法；
4. 由 Host 再次校验并提交最终走法。

因此它不是纯本地 AI：本地搜索用于压缩候选和降低等待时间，大模型仍然负责最终判断。模型推理等级由 DSH 当前会话的模型选择器控制；追求速度时建议使用 Low 或 Medium，High 会明显增加等待时间。

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

主要目录：

- `src/host`：Host 服务、规则校验和 DSH 工具。
- `src/game`：棋盘状态、合法走法、序列化、记谱和本地候选搜索。
- `src/client`：侧边栏入口、棋盘界面、棋谱和最小化交互。
- `tests`：棋规、AI 候选、Host 工具和 React 界面测试。

## 速度设计

本地搜索参考了 [shibing624/chinese-chess-ai](https://github.com/shibing624/chinese-chess-ai) 的 Alpha-Beta、走法排序和评估思路，并适配到本插件自己的合法走法内核。它只负责快速筛选候选，不替代 DSH 模型的最终判断，也不绕过 Host 的合法性校验。

## 许可证

本插件代码按仓库现有许可发布。引用的开源项目请遵守其各自许可证和版权声明。
