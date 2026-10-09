# Motif 母题

> 开源的前端设计素材站：组件、动效、Shader 与 Agent Skill 的市场。实时调参，下载能直接运行的代码，或者把 Skill 交给你的 agent。

**状态：** 市场、调参、导出、Skill 库和 Agent 工作台（Studio）都已可在本地使用（139 个条目、147 个 Skill）。实施计划见 [docs/PLAN.md](./docs/PLAN.md)。

## 能做什么

1. **市场**：139 个条目，分五层：整站模板、设计风格、页面区块、功能组件、视觉效果。
   - 大部分从 MIT / Apache-2.0 开源项目整合、重新打磨：网格渐变、流体模拟、液态金属、地球、边框光束、磁吸、动态岛……
   - 也有原创的：形状变幻、分行揭示、滚动叙事、翻转布局……
   - 每个都能实时预览，标明来源、固定提交和许可证。
2. **调参**：参数面板由条目定义自动生成（滑杆、颜色、调色板、缓动曲线、弹簧、随机种子），范围收紧到「拖到哪里都好看」；预设一键切换；参数写进链接可以分享。
3. **导出**：代码视图随参数实时更新，所见即所得。
   - 下载可运行的 Vite + React + Tailwind v4 项目（zip），
   - 用 shadcn 安装到现有项目：`npx shadcn add <站点>/r/<效果>.json?v=<参数>`，
   - 手动复制组件和共用的 `motif-runtime`。
4. **Skill**：每个条目一份 Agent Skill（带你调好的参数），加上 8 个通用 Skill（设计总控、motion、微交互、排版、背景、着色器、滚动、3D）：

   ```bash
   npx skills add aimerfeng/motif --skill motif-design
   npx skills add aimerfeng/motif --skill motif-mesh-gradient
   ```

5. **Agent 工作台**（`/studio`）：用一句话描述想要的效果，或者在任何条目页点「在工作台里改」：
   - agent 写组件、整理参数和预设，右边实时预览。
   - 每一次改动都经过和市场同一套检查器、编译器，出错时 agent 会自己看到并修好。
   - agent 能对预览截图，看着画面再打磨。
   - 每一轮都能撤回；调好的参数可以应用为默认值。
   - 做完可以下载、用 shadcn 安装、复制 Skill，或者一键投稿到社区。

   开发时 agent 用本机的 Claude Code CLI；部署时配置站点自己的模型 key（见 `apps/web/.env.example`）。设计见 [docs/decisions/0006-studio.md](./docs/decisions/0006-studio.md)。
6. **去中心化社区**（合约和站点已完成，可在本地链上完整试用，尚未部署到公开网络）：
   - 任何人押上押金投稿，DAO 任命的审核员投票，通过的作品进入市场，作者得到奖励和声誉；
   - 源码由站点托管，链上记录内容哈希、许可证、署名和 Remix 谱系，详情页的“链上已验证”是浏览器自己重算哈希后比对的结果；
   - 资料、审核队列、治理（委托、提案、投票、执行）都在 `/community` 下。

   设计与风险见 [docs/decisions/0005-decentralized-community.md](./docs/decisions/0005-decentralized-community.md)，上线步骤见 [docs/deploy-community.md](./docs/deploy-community.md)。

## 本地开发

需要 Node 22+、pnpm 12，以及 Microsoft Edge（端到端测试和截图用）。

```bash
pnpm install
pnpm sources:sync   # 克隆上游仓库到 sources/_clones（只读，用来对照）
pnpm dev            # 站点 http://localhost:3000，预览沙箱 http://127.0.0.1:4100
pnpm dev:chain      # （可选，另开终端）本地社区链 http://127.0.0.1:8545：部署合约、导入条目，站点自动连上
```

| 命令 | 作用 |
| --- | --- |
| `pnpm verify` | 类型检查 + ESLint + 单元测试 + 构建（提交前必须通过） |
| `pnpm e2e` | 端到端测试（构建后用已安装的 Edge 跑） |
| `pnpm audit:items [slug]` | 检查条目：清单、依赖、许可证头、默认值区域、编译 |
| `pnpm capture [slug]` | 生成海报与循环视频，并跑视觉闸门（帧率、空白、减少动态效果） |
| `pnpm check:export <slug>` | 真正安装并构建导出的项目（需要联网） |
| `pnpm smoke:agent` | 用本机 Claude CLI 真实跑几个工作台任务（会调用模型），记录写到 `.data/evals/` |
| `pnpm skills:build` | 重新生成仓库根目录的 `skills/` |
| `pnpm notices` | 重新生成 `THIRD_PARTY_NOTICES.md` |
| `pnpm dev:chain` | 启动本地社区链（全新部署 + 导入目录），提供测试币 |
| `pnpm item:pack <slug>` | 把条目目录打包成 `.motif.json`，用于社区投稿（`item:unpack` 还原，`item:remix` 开一个 Remix） |

新增或修改效果请先读 [docs/authoring-items.md](./docs/authoring-items.md)。

## 目录

| 路径 | 说明 |
| --- | --- |
| `apps/web` | 站点：Next.js 16 + Tailwind v4 + next-intl（中文默认，英文 `/en`） |
| `apps/preview` | 预览沙箱：不透明源 iframe 里运行组件，依赖通过 import map 共享；截图用的手动时钟 |
| `packages/registry` | 市场条目（`items/<slug>/`）、检查与构建 |
| `packages/schema` | 条目清单、参数定义、默认值区域 |
| `packages/runtime` | 条目共用的 hooks（motif-runtime），导出时一并带走 |
| `packages/compiler` | 条目与 agent 代码共用的编译（esbuild + Tailwind） |
| `packages/agent` | 工作台的 agent：工具、运行器（AI SDK / 脚本）、提示词 |
| `packages/agent-claude-cli` | 开发期运行器（本机 Claude Code CLI，不进生产） |
| `packages/checker` | 许可证、来源、依赖、无障碍规则 |
| `packages/export` | 导出：Vite 项目、shadcn registry、SKILL.md |
| `packages/skills` | 通用 Skill 源文件与 `skills/` 的生成 |
| `packages/vendor` | 沙箱可用的第三方依赖清单和预打包 |
| `packages/contracts` | 社区合约（登记、审核、身份、代币、治理）、部署模块和 TS 绑定 |
| `skills/` | 生成的 Agent Skill（`npx skills add` 从这里安装） |
| `sources/sources.json` | 上游来源登记（仓库、固定提交、许可证） |
| `docs/` | 实施计划、技术决策、调研 |

## 许可证

本仓库代码使用 [MIT](./LICENSE)。从上游项目整合进来的代码保留原许可证和署名，固定在审阅过的提交上，详见 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)。只整合许可证允许再分发的代码；Commons Clause、非商业、AGPL 或没有许可证的项目只做链接。
