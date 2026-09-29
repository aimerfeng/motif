# Motif 母题

> 开源的前端设计素材站：组件、动效、Shader 与 Agent Skill 的市场，用 agent 零代码生成、微调，然后打包下载。

**状态：** P0 基础设施完成（工作区、站点骨架、预览沙箱）。实施计划见 [docs/PLAN.md](./docs/PLAN.md)。

## 想做成什么样

1. **项目市场（Market）**：从 GitHub 上许可证允许再分发的开源项目里整理组件、动效、WebGL/Shader 效果，每个条目都带实时预览、示例代码、来源和许可证。
2. **Agent 工作台（Studio）**：用自然语言描述想要的效果，agent 从市场条目出发生成或改写组件，不用写代码。
3. **微调（Tune）**：用可视化面板调颜色、速度、缓动、尺寸等参数，实时预览。
4. **导出（Export）**：
   - 下载成可以直接运行的项目（zip），
   - 复制单个组件的源码，或者用 `shadcn` registry 命令安装，
   - 把对应的 **Skill**（`SKILL.md`）复制到自己的项目里，让自己的 agent 也能做出同样的效果。

## 本地开发

需要 Node 22+ 和 pnpm 12。

```bash
pnpm install
pnpm dev      # 站点 http://localhost:3000，预览沙箱 http://127.0.0.1:4100
pnpm verify   # 类型检查 + ESLint + 单元测试 + 构建
pnpm e2e      # 端到端测试（本地用已安装的 Microsoft Edge）
```

## 目录

| 路径 | 说明 |
| --- | --- |
| `apps/web` | 站点：Next.js 16 + Tailwind v4 + next-intl（中文默认，英文 `/en`） |
| `apps/preview` | 预览沙箱：不透明源 iframe 里运行组件，依赖通过 import map 共享 |
| `packages/vendor` | 沙箱可用的第三方依赖清单和预打包 |
| `e2e/` | Playwright 端到端测试 |
| `docs/PLAN.md` | 实施计划 |
| `docs/decisions/` | 技术决策记录 |
| `docs/research/` | 上游开源项目调研：内容、许可证、能否再分发 |
| `sources/` | 上游项目的来源登记（仓库、固定 commit、许可证） |

## 许可证

本仓库代码使用 [MIT](./LICENSE)。从上游项目整合进来的代码保留原许可证和署名，详见 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)。
