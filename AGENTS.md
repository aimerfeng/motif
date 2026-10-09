# AGENTS.md

写代码前先读 `docs/PLAN.md`（实施计划）和 `docs/decisions/`（已定的技术决策）。上游项目的调研和许可证结论在 `docs/research/`。

## 项目结构

| 路径 | 说明 |
| --- | --- |
| `apps/web` | 站点：Next.js 16 App Router + Tailwind v4 + next-intl（默认 `zh-CN`，英文走 `/en`） |
| `apps/preview` | 预览沙箱：不透明源 iframe 里跑组件；esbuild 构建运行时和条目，静态服务在 `127.0.0.1:4100` |
| `packages/vendor` | 沙箱可用的第三方依赖清单 + 预打包（一次 esbuild 构建，保证 React 只有一份） |
| `packages/contracts` | 社区合约（Solidity，Hardhat 3 + OpenZeppelin）和 TS 绑定（内容哈希、ABI、链上事件归约器）；设计见 `docs/decisions/0005-decentralized-community.md` |
| `apps/web/src/lib/community` | 社区的服务端：链配置、事件同步、源码存储、投稿检查（编译在子进程里）；页面在 `app/[locale]/community` |
| `e2e` | Playwright，本地用已安装的 Edge |

## 常用命令

- `pnpm dev`：同时启动站点（`localhost:3000`）和预览沙箱（`127.0.0.1:4100`）。
- `pnpm dev:chain`：（可选）本地社区链（`127.0.0.1:8545`），全新部署合约并导入条目；开发模式的站点自动连上。
- `pnpm verify`：类型检查 + ESLint + 单元测试 + 构建。**提交前必须通过。**
- `pnpm e2e`：端到端测试（自己起 3100 / 4110 端口的服务）。
- 改了合约之后运行 `pnpm --filter @motif/contracts abi` 重新导出 ABI（`pnpm verify` 会检查它是否过期）。

## 开发原则

1. **效果质量第一。** 这是设计素材站，每个条目的默认参数就应该是最好看的状态；调参范围内的任何值都不能难看。
2. **许可证先行。** 仓库是公开的，只整合允许再分发的上游代码（MIT、Apache-2.0、ISC、BSD、Zlib、Unlicense、CC0）。Commons Clause、无许可证、NC、AGPL、Prosperity（lygia）、Shadertoy 默认条款的代码不能拷进仓库，只能链接。每个整合的文件都要保留原版权头并记录来源（仓库、固定 commit、路径）。
3. **沙箱里只有一份 React。** 沙箱内的代码（运行时、条目、Studio 生成的代码）一律把 vendor 模块设为 external，由 import map 提供。新增依赖要加到 `packages/vendor/src/manifest.ts`。
4. **不依赖外部 CDN。** 用户在国内：字体、依赖、图片都自托管，不用 Google Fonts / jsDelivr / unpkg。
5. **单一事实来源。** 同一份数据只在一个地方定义（例如依赖清单、参数 schema），其他地方从它生成。
6. **不做 hack。** 遇到问题找根因；需要取舍时写进 `docs/decisions/`。

## 代码约定

- TypeScript 严格模式，固定在 `~6.0.3`（TypeScript 7 还不被 typescript-eslint 支持）。
- 工作区内部包直接导出 `./src/index.ts`，不单独构建。
- 注释用中文，解释「为什么」，不复述代码。
- 提交信息用 Conventional Commits，带 scope，例如 `feat(preview): …`、`fix(web): …`、`docs: …`。
- `apps/web/AGENTS.md` 由 `next dev` 自动生成：Next 16 与训练数据里的 Next 有差异，改 Next 相关代码前先看 `apps/web/node_modules/next/dist/docs/`。
