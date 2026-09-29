# 0004 工具链版本与坑

- 状态：已采纳（2026-09-29）

1. **TypeScript 固定 `~6.0.3`。** typescript-eslint 8.71 的 peer 要求 `<6.1.0`；TypeScript 7 还移除了 typed lint 和 Next 类型检查依赖的经典编译器 API。等 typescript-eslint 支持后再升级。
2. **pnpm 12 的安装脚本白名单**写在 `pnpm-workspace.yaml` 的 `allowBuilds`：esbuild、sharp、`@tailwindcss/oxide`、ffmpeg-static 放行；`@parcel/watcher`、`@swc/core` 有预编译的可选依赖，不需要跑安装脚本。pnpm 12 默认有「最短发布时间」策略，新发布的包会被自动写进 `minimumReleaseAgeExclude`。
3. **Next 16 的中间件文件叫 `proxy.ts`。** next-intl 的 matcher 写成 `'/((?!api|_next|_vercel|.*\..*).*)'`。两个坑：
   - 不要在排除列表里写带 `/` 的前缀（如 `r/`），会让整个 matcher 失效；registry 的 `/r/*.json` 本来就因为带扩展名被排除。
   - `\.` 在 JS 字符串里必须是两个反斜杠，写成 `\.` 会变成匹配任意字符，把所有页面都排除掉。
4. **页面类型 `PageProps` / `LayoutProps` 来自 `.next/types`。** `apps/web` 的 `lint` 先跑 `next typegen` 再跑 `tsc`，新克隆的仓库也能直接检查类型。
5. **`apps/web/AGENTS.md` 与 `CLAUDE.md` 由 `next dev` 自动生成**，提醒 agent 先读 `node_modules/next/dist/docs/`。随代码一起提交，否则每次 dev 都会重新出现未提交的改动。
6. **语言路由**：next-intl `localePrefix: 'as-needed'`，中文（默认）没有前缀，英文是 `/en/...`；访问 `/zh-CN/...` 会 307 到无前缀地址。
7. **shadcn registry 安装验证**（计划 P0 的 spike e）挪到 P2 做：registry 输出在 P2 才存在，届时在临时项目里验证 `npx shadcn add` 和 `.claude/skills/` 目标。
