# Motif 母题:平台基础设施调研

调研日期:2026-09-29。星数/许可证/最近 push 均来自 `gh api repos/...`(许可证另读了 LICENSE 原文);文档类结论来自官方文档抓取。**标注「未验证」的条目未做一手核实。**

---

## 0. 结论速览(推荐栈)

| 层 | 推荐 | 备选 |
|---|---|---|
| 站点框架 | **Next.js App Router(MIT)+ Tailwind v4**;市场页 SSG/ISR,预览为纯客户端岛 | Astro(纯静态画廊更轻,但 Studio 交互重,需混合) |
| 预览沙箱 | **自建:esbuild-wasm + import map + 跨源 sandbox iframe**(参考 llamacoder 的实现思路);依赖**自托管/预打包**到自有 CDN | Sandpack 仅用 Static/Runtime 模式做兜底;**不用 Nodebox、不用 WebContainers** |
| 注册表 | **shadcn registry 格式**(`registry.json` + `registry-item.json`,`shadcn build` 产出静态 JSON,`npx shadcn add <url>` / `@motif/xxx`) | 无 |
| 打包下载 | **fflate**(MIT,体积小、可流式) | jszip(MIT/GPL 双许可,选 MIT 即可) |
| 调参面板 | **自研薄层 + Zod/JSON-Schema → 控件映射**,底层渲染用 **tweakpane 或 leva**(均 MIT);DialKit 作为 UI/交互参考 | lil-gui(体积最小,适合 WebGL 沙箱内) |
| Agent SDK | **Vercel AI SDK(当前 latest 为 7.x,Apache-2.0)** 的 `ToolLoopAgent` + `useChat`;provider 用 `@ai-sdk/openai-compatible` | 直接用 OpenAI 兼容 REST(自写循环) |
| 聊天 UI | 自写或 assistant-ui(MIT) | — |
| 模型策略 | **BYOK 为默认**(浏览器直连或经无状态代理),可选站点托管 key + 配额;国内首选 Qwen/Kimi/GLM/DeepSeek(均为 OpenAI 兼容) | — |
| 存储/DB | 官方市场条目:Git 仓库即数据源(MDX/JSON);用户发布:Postgres(Neon/Supabase)+ 对象存储(R2/OSS) | — |
| 文档/代码高亮 | **fumadocs(MIT)+ shiki(MIT)** | — |
| 缩略图 | **Playwright(Apache-2.0)** 在 CI 中截图/录屏 | — |
| 部署 | 海外:Vercel 或 Cloudflare;**国内可达性**:静态资源 + 预览依赖放国内可访问的 CDN(见 §2.4) | — |

**沙箱裁决**:选 esbuild-wasm + import map + 跨源 sandbox iframe 自建。WebContainers 生产商用需付费(且价格不公开);Sandpack 的 Node 运行时 Nodebox 是非 OSI 许可;Sandpack 内置打包器已停滞。

---

## 1. 开源 v0 / bolt / lovable 类 Agent 构建器

| 项目 | Stars | 许可证(已读 LICENSE) | 最近 push | 预览方式 | 模型 / SDK | 备注 |
|---|---|---|---|---|---|---|
| stackblitz-labs/bolt.diy | 19.9k | MIT(© StackBlitz) | 2026-02-07(近半年无更新) | **WebContainers**(`@webcontainer/api 1.6.1-internal.1`) | Vercel AI SDK **4.3.16**(旧),多 provider(含 DeepSeek、Anthropic、OpenAI 等) | Remix + Vite。**代码 MIT,但其依赖的 WebContainer API 商用另有条款,见 §2.2** |
| e2b-dev/fragments | 6.4k | Apache-2.0 | 2026-09-28 | **E2B 云沙箱**(`@e2b/code-interpreter`) | AI SDK 3.3.x(旧),OpenAI/Anthropic/Google/Mistral/Fireworks/Together;可选 Morph Apply | Next.js 14 + shadcn。需 E2B key/付费云 |
| Nutlope/llamacoder | 7.1k | MIT | 2026-09-15 | **esbuild-wasm + esm.sh/本地 vendor + 沙箱 iframe**(已从 Sandpack 迁出,`architecture.md` 有说明) | Together AI(Llama 等) | 最贴近我们的方案;有错误桥回传给 LLM「一键修复」 |
| firecrawl/open-lovable | 28.6k | MIT | 2025-11-19(近 10 个月无更新) | **云沙箱**(Vercel Sandbox 默认 / E2B) | Anthropic、OpenAI,可选 Morph | 主打「克隆网站」,依赖 Firecrawl 抓取 |
| onlook-dev/onlook | 26.8k | Apache-2.0 | 2026-08-25 | CodeSandbox SDK 云沙箱 + iframe,可视化编辑写回 JSX | AI SDK + OpenRouter,Morph/Relace fast-apply | 「可视化改代码」思路与我们的调参面板有共通处;依赖付费云沙箱 |
| vercel-labs/coding-agent-template | 1.8k | Apache-2.0(LICENSE 原文确认,GitHub 显示 NOASSERTION) | 2026-08-25 | Vercel Sandbox | 多 coding agent CLI | 参考多 agent 编排 |
| vercel-labs/json-render | 18.4k | Apache-2.0 | 2026-09-25 | 渲染 JSON 描述的 UI | — | 「LLM 输出受限 schema、客户端渲染」思路可参考(**用途未深入验证**) |

Agent 循环共性(README/依赖层面确认,细节未逐文件核实):流式 LLM 输出 → 结构化产物(文件列表/artifact)→ 写入虚拟文件系统 → 触发预览重建;fast-apply 模型(Morph/Relace)用于降低整文件重写的 token。**对 Motif 的启示**:我们的产物是「单个组件 + 参数 schema」,规模远小于全栈应用,不需要云沙箱和 Node 运行时;用 tool-call 做 `write_file` / `patch_file` / `set_params_schema` 即可。

新晋者:`gh search repos` 只搜到几个 <5 星的 lovable 替代品,无值得借鉴的;OpenHands(MIT,89k)、sst/opencode(MIT,210k)是通用编码 agent,体量过大,不适合直接嵌入。

**可借鉴代码优先级**:llamacoder 的 `lib/preview/*`(html 模板、错误桥、import map)>> fragments(agent 交互 UI)> bolt.diy(artifact 解析协议)。

---

## 2. 预览 / 沙箱方案

### 2.1 对比

| 方案 | 许可证 | 运行位置 | 可自托管 | 适合度 |
|---|---|---|---|---|
| **esbuild-wasm + import map + iframe** | esbuild MIT | 纯浏览器 | 完全(wasm、依赖自托管) | **最佳**:启动快、可控、无商业条款 |
| Sandpack `@codesandbox/sandpack-react`(2.20.0) | Apache-2.0(仓库根 LICENSE) | 浏览器;默认从 `*-sandpack.codesandbox.io` 加载打包器 | `bundlerURL` 参数可指向自托管(官方文档确认参数存在;自托管完整流程的官方页 404,**未验证**) | 可用但仓库最近 push 2025-04,维护停滞;llamacoder 因「现代库支持不足」已迁出 |
| Sandpack 的 Nodebox(Node 模式) | **Sustainable Use License**(非 OSI,限制商用分发,`nodebox-runtime` LICENSE 原文确认;GitHub 显示 NOASSERTION,最近 push 2023-11) | 浏览器 | — | **避免** |
| StackBlitz WebContainers(`@webcontainer/api` 1.6.4,包声明 MIT,**但 API 使用受商用条款约束**) | 见 2.2 | 浏览器(需 COOP/COEP 跨源隔离) | 仅企业版可自托管 | 过重,不需要 Node |
| react-live(4.6k★,MIT,9 月仍在更新) | MIT | 浏览器,Sucrase 转译 | 是 | 适合简单文档内嵌 demo;不支持多文件/import 任意包 |
| Babel standalone | MIT | 浏览器,体积大(数 MB) | 是 | esbuild-wasm 更快、更好 |
| E2B / Vercel Sandbox / CodeSandbox SDK | 服务商条款 | 云 | 否 | 成本高、延迟大、中国可达性差;无必要 |
| Tailwind v4 浏览器版 `@tailwindcss/browser`(MIT) | MIT | 浏览器 | 是 | 适合在预览 iframe 内即时生成 CSS;官方定位为开发/原型用途(体积/性能不适合大规模生产)——**性能为经验判断,未测** |

### 2.2 WebContainers 商用条款(已核实官方页 webcontainers.io/enterprise)

- 原文:「Licensing is required for **production** usage of the API in a commercial, for-profit setting.」
- 触发条件:用 API 满足「customers, prospective customers, and/or employees」的需要。原型/PoC 不需要。
- 价格:**页面不公开**,需联系销售。企业版另含自托管/VPC、私有 npm registry、SSO。
- 结论:Motif 是开源、MIT 的网站,若将来有任何盈利/公司运营,使用 WebContainers 需付费商业许可;且这与「MIT 可自由 fork 自部署」的定位冲突(fork 者也会踩条款)。**不用**。bolt.diy 虽为 MIT,其核心能力依赖此条款约束的 API,借代码需避开该部分。

### 2.3 安全模型

1. LLM/用户代码在 `<iframe sandbox="allow-scripts">` 中运行(**不加 `allow-same-origin`**),使其成为不透明源,无法读取宿主 cookie/localStorage。
2. 更强:预览 iframe 加载自独立域(如 `preview.motif.xxx`),宿主与预览用 `postMessage` 通信,并校验 `event.source`。
3. 预览页设 CSP:`connect-src` 白名单(禁止外发用户数据)、`script-src` 仅允许自有 CDN 与 inline(esbuild 产物需要 blob/inline)。
4. 沙箱内 stub `localStorage/sessionStorage`(llamacoder 已这样做)。
5. 注入错误桥:`window.onerror`、`unhandledrejection`、构建错误回传给宿主,供 Agent 自动修复。
6. 无限循环防护:iframe 无法被父页面强杀主线程,需 Web Worker 内构建 + 预览 iframe 心跳超时后销毁重建。
7. WebGL 上下文与 GPU 耗尽属于可用性风险而非安全,但同样需限流(见 §5.4)。

### 2.4 中国可达性(重要)

- 搜索结果(greatfire 检测,最后测试 2026-03-04)显示 `cdn.jsdelivr.net` 在大陆被判为**不可达**(检测服务本身提示可能已变化,**未自测**)。jsDelivr 自称有中国 POP(其对比页),与 greatfire 结果矛盾,**结论不确定,需在目标网络实测**。
- esm.sh(MIT,4.2k★,9 月仍活跃)基于 Cloudflare;wmtips 将其列为中国 Public CDN 第 4 位,但这只是站点使用统计,**不代表大陆稳定可达**,**未验证**。unpkg 同为 Cloudflare 系,**未验证**。
- **设计对策(推荐)**:预览所需的固定依赖集(react、react-dom、motion、three、@react-three/fiber、drei、gsap、clsx、tailwind-merge、lucide 等)**构建期预打包成 ESM 文件,放自有域名/国内 CDN(如阿里云 OSS+CDN、腾讯 COS)**,import map 指向它们(llamacoder 的 `public/preview-vendor` 就是这个做法)。仅对白名单外的包回退到 esm.sh,并允许配置镜像域名。这也带来离线/自托管能力。
- 若面向大陆用户提供服务,域名需 ICP 备案;放大陆 CDN 需备案。托管在海外则面临间歇性访问问题。**取舍需产品决策**。
- 模型 API:见 §6,均有国内直连端点,不依赖翻墙。

### 2.5 性能

- esbuild-wasm ~数 MB(一次性加载,可缓存),单文件小组件构建通常为毫秒~百毫秒级(经验判断,**未在本项目测量**)。
- 预览页数量多时:构建放 Web Worker;画廊页不要一开始就构建所有预览,见 §5.4。

---

## 3. 注册表与分发

### 3.1 shadcn registry(已读官方文档)

- 文件:`registry.json`(总索引)+ 每项 `registry-item.json`;`shadcn build` 将其编译为可托管的静态 JSON。
- `type` 取值:`registry:base | block | component | font | lib | hook | ui | page | file | style | theme | item`。
- file 对象:`path`、`type`、`target`(`registry:page`/`registry:file` 必填);target 支持 `@components/`、`@ui/`、`@lib/`、`@hooks/` 占位。
- 其它字段:`dependencies`(npm)、`registryDependencies`(其它 registry 项)、`cssVars`(theme/light/dark)、`css`(`@layer`、`@keyframes`、`@utility`、`@plugin`)、`envVars`、`docs`、`categories`、`meta`(自定义)。
- 安装:`npx shadcn add <url>`;命名空间:`components.json` 中配置 `@name` 注册表后 `npx shadcn add @name/item`;支持鉴权 header(私有注册表)。
- `shadcn` CLI 当前 npm 版本 4.6.5(shadcn-ui/ui,MIT,124.8k★,今日仍在更新)。
- magicui(MIT,22.4k★)等即以此方式发布。**未逐文件核实其 registry 构建脚本**。

**Motif 映射**:一个市场条目 = 一个 registry item;组件 → `registry:component`;shader/GLSL → `registry:file` 或 `registry:lib`;动画关键帧 → `css`;调参 schema 放 `meta.motif.params`(JSON Schema)——CLI 会忽略未知的 meta,同一份数据驱动网站调参面板。

**Agent Skill 分发**:SKILL.md 遵循 agentskills.io 规范(已读):目录含必需的 `SKILL.md`,frontmatter 必填 `name`(≤64,小写字母数字连字符,须与目录名一致)与 `description`(≤1024),可选 `license`、`compatibility`、`metadata`、`allowed-tools`;正文建议 <500 行,分 `scripts/ references/ assets/`。Motif 为每个效果生成配套 SKILL.md(参数说明、用法、注意事项),提供复制/下载;并可用 registry item(`registry:file`,target 指向 `.claude/skills/<name>/SKILL.md`)一条命令安装——**该 target 用法是设计设想,未验证 CLI 是否允许写入任意目录**。

### 3.2 打包 zip

| 库 | 许可证 | 备注 |
|---|---|---|
| fflate 0.8.x | MIT(101arrowz/fflate,3.0k★,2026-05) | 体积小、速度快、支持流式;首选 |
| jszip 3.10.x | 双许可:**MIT 或 GPLv3,任选**(LICENSE 原文确认;GitHub 显示 NOASSERTION,不是缺许可) | 生态广;需在 NOTICE 中声明选 MIT |

### 3.3 「在 StackBlitz / CodeSandbox 打开」

- `@stackblitz/sdk` 1.11.x,MIT:`openProject` 可 POST 文件表单打开,但打开的页面在 StackBlitz 站点运行 WebContainers,**是用户在 StackBlitz 上的使用,与我们自身的商用许可无关**(此判断为个人理解,建议向 StackBlitz 确认)。
- CodeSandbox:`codesandbox-sdk` 仓库无许可证文件(`license: null`),不引用其代码;可用其公开的 "define" URL/表单 POST 方式打开(**未验证当前状态**)。
- 推荐作为可选出口,不是核心依赖。

---

## 4. 调参面板

| 库 | 版本 | 许可证 | 最近 push | 特点 |
|---|---|---|---|---|
| leva | 0.10.1 | MIT | 2025-11 | React 原生 hook,支持 folder、颜色、曲线(plugin-bezier/spring/plot);pmndrs 生态,与 R3F 契合 |
| tweakpane | 4.0.5 | MIT | 2026-03 | 框架无关,插件体系,外观好;可在 iframe 内使用 |
| lil-gui | — | MIT | 2025-10 | 极小(约 30KB 级,未测),API 简单 |
| DialKit | 未确认发布版本 | MIT(© 2026 Josh Puckett) | 2026-09-25 | 新库(1.2k★),React/Vue/Solid/Svelte/vanilla,支持时间线与动画曲线编辑与版本对比 |
| Theatre.js | — | Apache-2.0 | **2024-08 起无更新** | 时间轴动画工具,不是参数面板;不推荐做依赖 |

**从 schema 自动生成控件**:以上库均无内置「Zod/JSON Schema → 控件」。leva/DialKit 采用「默认值推断类型」(数字 `[24, 0, 64]` 表示 值/最小/最大、字符串 `#hex` 表示颜色)。推荐:

1. 每个组件导出 `params`(JSON Schema 子集,自定义扩展字段):`{ type:"number", default, minimum, maximum, step, "x-motif-ui":"slider|color|easing|select|vec2" }`。用 Zod v4 的 `z.toJSONSchema()` 从组件的 props schema 生成(Zod v4 已内置,**具体 API 未在本次验证**)。
2. 平台侧写一个 ~150 行的映射函数:JSON Schema → leva 的 `useControls` schema 或 tweakpane binding。
3. 参数以 JSON 通过 `postMessage` 送入预览 iframe,组件用 props 接收(不重新构建,仅重渲染),实现「即时预览」。
4. LLM 生成组件时同时输出 `params` schema(tool `set_params_schema`),这样调参面板也是「零代码」的。
5. 调参结果的导出:序列化为 props 默认值,回写到导出的源码里。

**推荐**:面板 UI 在宿主页渲染(不在沙箱内),用 tweakpane 或 leva;沙箱内只接收值。leva 与 React 集成最省事;若担心 leva 维护节奏(最近 push 2025-11),tweakpane 更稳。

---

## 5. 站点框架与文档

### 5.1 Next.js vs Vite SPA vs Astro

| | Next.js App Router | Vite + React SPA | Astro |
|---|---|---|---|
| SEO(每个组件一页) | 好(SSG/ISR,metadata API) | 差(需预渲染方案) | 最好(默认 0 JS) |
| 大量实时预览 | 预览为 client component;iframe 天然与框架解耦 | 好 | islands,好 |
| Studio 交互重(流式聊天、状态) | 好 | 好 | 需 React island,可行 |
| API 路由(代理、BYOK) | 内建 | 需另起服务 | 需适配器 |
| 与 shadcn/fumadocs/AI SDK 生态 | 最紧密(fumadocs 基于 Next;AI SDK 文档以 Next 为例) | 一般 | 一般 |
| 许可证 | MIT | MIT | MIT(LICENSE 原文确认;GitHub 显示 NOASSERTION) |

**选 Next.js**。市场列表/详情页 SSG + 每项 `generateMetadata`;预览 iframe 指向独立预览域,页面首屏用静态缩略图,滚入视口后再挂载实时预览。

### 5.2 文档与代码高亮

- fumadocs(fuma-nama/fumadocs,MIT,13.3k★,今日活跃;`fumadocs-core` 16.15.x):Next 原生,MDX,搜索;适合「使用文档/Skill 说明」。市场条目详情页自己写,不必强用 fumadocs。
- shiki(MIT,13.8k★):服务端(RSC)渲染代码高亮,零客户端 JS;编辑器内的实时代码视图可用 shiki 或 CodeMirror(**后者本次未调研**)。

### 5.3 缩略图/视频

- Playwright(Apache-2.0,96.9k★):CI 中启动 Chromium(需开 WebGL:`--use-gl=swiftshader` 或 `--enable-unsafe-swiftshader`,**具体 flag 需实测**),加载预览页固定时间步后截图;`recordVideo` 录 webm 再用 ffmpeg 转 mp4/webp。为可重复,预览组件应支持「确定性时间」参数(如 `?t=1.2`)。
- 用户发布的条目:提交后由后台任务(GitHub Actions / 队列 worker)生成缩略图。

### 5.4 单页多 WebGL canvas

浏览器对活动 WebGL 上下文数量有限(Chrome 约 16,超出会丢弃最早的——经验值,**未在本次实测**)。策略:
1. 画廊首屏只放静态图/循环 mp4,悬停或进入视口(IntersectionObserver)才挂载实时预览,离开即卸载。
2. 同时最多 N(≈4–6)个实时 WebGL 预览,队列化。
3. 也可用「单个共享 canvas + scissor 视口」渲染多个 three 场景(drei 的 `<View>` 就是此模式)——但会与「每个预览一个独立沙箱 iframe」冲突,故市场列表用缩略图,详情页才起真实沙箱。
4. 尊重 `prefers-reduced-motion` 与页面不可见时暂停 rAF。

---

## 6. Agent 层

### 6.1 Vercel AI SDK

- `ai` npm latest = **7.0.122**(dist-tags 另有 `ai-v5`=5.0.269、`ai-v6`=6.0.296、beta/canary);仓库 Apache-2.0(LICENSE 原文确认;GitHub 显示 NOASSERTION)。`@ai-sdk/react` 4.0.125;`@ai-sdk/openai-compatible` 3.0.59;`@ai-sdk/openai` 4.0.81。
- 官方 Agent 文档(已读):`new ToolLoopAgent({ model, instructions, tools, stopWhen })`,默认 20 步,`stopWhen: isStepCount(50)`;工具用 `tool({ description, inputSchema: z.object(...), execute })`;服务端 `createAgentUIStreamResponse({ agent, uiMessages })`;客户端 `useChat<InferAgentUIMessage<typeof agent>>()`。
- 注意:文档提示 v5/v6/v7 的 agent API 与生命周期回调有差异;fragments/bolt.diy 用的是 v3/v4,**不可照搬其 API**。v7 相当新,`isStepCount` 等命名以官方文档为准,落地前 pin 版本并读 v6→v7 迁移说明(本次**未读迁移指南**)。
- 备选:assistant-ui(MIT,12.4k★,`@assistant-ui/react` 0.15.x 尚未 1.0)做聊天 UI 与 AI SDK 对接;Motif 聊天界面简单,自写更可控。

### 6.2 Studio 的工具设计(建议)

`list_files`、`read_file`、`write_file`(整文件)、`patch_file`(搜索替换,失败则回退整写)、`set_params_schema`、`get_preview_errors`(读取沙箱错误桥)、`search_market`(检索已有效果作为起点/引用)。循环:生成 → 沙箱构建 → 错误回传 → 自动修复,上限 3~5 轮。注意使用 skill(SKILL.md)/系统提示注入「motion / three / Tailwind 的约束」,以及固定的可用依赖清单(与 §2.4 预打包一致)。

### 6.3 BYOK vs 服务端 key

| | BYOK | 服务端 key |
|---|---|---|
| 成本 | 零(开源站无需承担) | 需付费/限额/防滥用 |
| 隐私/合规 | key 存浏览器(localStorage/加密),请求可浏览器直连 provider(受 CORS 限制,部分厂商不支持)或经无状态代理转发 | 集中管理 |
| 体验门槛 | 用户需自备 key | 开箱即用 |
| 建议 | **默认 BYOK**,并提供「自定义 baseURL + 模型名」(OpenAI 兼容);可选站点试用额度(登录+限速) | |

BYOK 若走服务端代理,**代理不得记录/持久化 key**;直连需 provider 允许 CORS(未逐家验证)。

### 6.4 国内可用的 OpenAI 兼容模型与工具调用

| 厂商 | 兼容端点 | 工具调用 | 核实程度 |
|---|---|---|---|
| DeepSeek | `https://api.deepseek.com`(另有 Anthropic 兼容 `/anthropic`) | 文档抓取页未提及 function calling(该页仅覆盖入门);**是否支持及模型名需查看专门章节,未验证**。当前文档列出模型名 `deepseek-flash`、`deepseek-v4-pro` | 部分 |
| 阿里 Qwen / DashScope | `.../compatible-mode/v1`(北京区域端点带 WorkspaceId,见文档) | **支持**,含 `parallel_tool_calls`;Qwen-Max/Plus/Flash/Coder 系列列出 | 已读文档 |
| Moonshot Kimi | `https://api.moonshot.cn/v1` | **支持**(`tools` 参数 + `tool` 角色消息),`kimi-k2.7-code`、`kimi-k2.6` 支持思考模式下多步工具调用;另有 `kimi-k3` | 已读文档 |
| 智谱 GLM | (OpenAI 兼容 base URL 本次未抓取,**未验证**) | **支持** function calling,但 `tool_choice` 只支持 `auto` | 已读文档 |

以上模型代号来自各厂商当日文档页,我无法独立核对其真实可用性/价格。**使用 `@ai-sdk/openai-compatible` 一套代码接入全部;工具调用质量(尤其是多文件 patch)需要用 Motif 自己的评测集实测后再定默认模型。**

---

## 7. 存储 / DB(用户发布市场)

- **阶段一(官方精选)**:条目放 Git 仓库(`registry/<name>/…` + `meta.json`),CI 运行 `shadcn build` 和缩略图生成,产物为静态文件,零后端。
- **阶段二(用户发布)**:Postgres(Neon/Supabase,**均未核对当前定价**)存元数据/作者/审核状态/统计;源码文件与缩略图放对象存储(Cloudflare R2 / 阿里云 OSS);registry JSON 由服务端动态生成(`/r/<user>/<name>.json`)。必须做:提交时静态扫描 + 沙箱内试运行 + 人工/社区举报;条目内含的 `dependencies` 限制为白名单。
- 若要托管用户账号:Auth.js/better-auth(**未调研**)。避免 AGPL 组件(例如调研中见到的 Postiz 为 AGPL-3.0,不适合借用)。

## 8. 部署

- 海外:Vercel(Next 原生)或 Cloudflare Pages/Workers;预览域单独绑定,且不同源。
- 大陆访问:静态预览依赖放国内 CDN(需备案),或接受海外访问的不稳定。**尚需产品层面决策,并实测**。
- 独立于其它产品(OmniBoard/webcanvas/shanka/interlude):不共用账号与 API,仅可借鉴代码。

---

## 9. 许可证注意事项汇总

| 项 | 风险 |
|---|---|
| WebContainers(`@webcontainer/api`) | **商业生产使用需付费许可**,价格不公开;bolt.diy 的 MIT 不能豁免此项 |
| Nodebox(Sandpack Node 模式) | Sustainable Use License,非 OSI,限制商用;避免 |
| Sandpack 本体 | Apache-2.0,可用;但停滞,且默认走 `codesandbox.io` 托管打包器(其服务条款/带宽/可达性**未核实**) |
| jszip | MIT/GPLv3 双许可,选 MIT;GitHub 显示 NOASSERTION 属正常 |
| vercel/ai、coding-agent-template | Apache-2.0(LICENSE 原文确认);GitHub API 显示 NOASSERTION 系识别问题 |
| codesandbox-sdk | 无 LICENSE,不要复制其代码 |
| Theatre.js | Apache-2.0,但 2024-08 后无更新 |
| Postiz 等 AGPL 项目 | 与 MIT 分发冲突,不借用 |
| 用户生成内容 | 用户发布条目需明确授权(如要求 MIT/CC0),SKILL.md 内 `license` 字段必填 |
| 模型输出 | 各厂商条款对生成代码的商用/再分发的约束**未核实** |

## 10. 风险与未知项

1. **国内可达性未实测**:jsDelivr/esm.sh/unpkg 在大陆的稳定性结论互相矛盾,须实测并以自托管预打包为主。
2. **AI SDK v7 较新**:API 变动风险,需 pin 版本;可用的 `ToolLoopAgent`/`isStepCount` 命名以 7.x 文档为准。
3. **国产模型的工具调用质量**未评测;DeepSeek 的 function calling 支持未在本次确认;GLM 的兼容 base URL 未确认。
4. **WebGL 多实例上限**、SwiftShader 在 CI 中的 WebGL 截图可行性,均需实测。
5. **esbuild-wasm 在 Worker 内构建的实际耗时**未在本项目测量。
6. **Sandpack 自托管打包器**的完整流程未验证(官方页 404)。
7. `npx shadcn add` 是否允许将 SKILL.md 写到 `.claude/skills/`(非源码目录)未验证。
8. 沙箱逃逸:自建沙箱需自行做安全评审(CSP、独立源、postMessage 校验);这是自建方案相对托管方案的主要责任。
9. 用户发布内容审核与滥用(挖矿脚本、外联跟踪、超大 shader 拖垮 GPU)需要专门设计。
10. 备案/合规:面向大陆提供 AI 生成内容服务可能涉及生成式 AI 备案等要求,**本次未调研,需咨询**。

## 附:已核验仓库清单

| 仓库 | 星数 | SPDX / LICENSE 原文 | 最近 push |
|---|---|---|---|
| stackblitz-labs/bolt.diy | 19,925 | MIT | 2026-02-07 |
| e2b-dev/fragments | 6,379 | Apache-2.0 | 2026-09-28 |
| Nutlope/llamacoder | 7,136 | MIT | 2026-09-15 |
| firecrawl/open-lovable | 28,609 | MIT | 2025-11-19 |
| onlook-dev/onlook | 26,830 | Apache-2.0 | 2026-08-25 |
| codesandbox/sandpack | 6,246 | Apache-2.0 | 2025-04-24 |
| codesandbox/nodebox-runtime | 893 | Sustainable Use License | 2023-11-29 |
| stackblitz/webcontainer-core | 4,646 | MIT(仓库文档/示例;API 商用另见条款) | 2025-04-22 |
| shadcn-ui/ui | 124,849 | MIT | 2026-09-29 |
| magicuidesign/magicui | 22,426 | MIT | 2026-09-20 |
| pmndrs/leva | 6,242 | MIT | 2025-11-09 |
| cocopon/tweakpane | 4,599 | MIT | 2026-03-15 |
| georgealways/lil-gui | 1,640 | MIT | 2025-10-12 |
| joshpuckett/dialkit | 1,183 | MIT | 2026-09-25 |
| theatre-js/theatre | 12,709 | Apache-2.0 | 2024-08-14 |
| vercel/ai | 27,036 | Apache-2.0(原文) | 2026-09-29 |
| assistant-ui/assistant-ui | 12,355 | MIT | 2026-09-29 |
| fuma-nama/fumadocs | 13,253 | MIT | 2026-09-29 |
| shikijs/shiki | 13,834 | MIT | 2026-09-11 |
| esm-dev/esm.sh | 4,179 | MIT | 2026-09-21 |
| FormidableLabs/react-live | 4,611 | MIT | 2026-09-23 |
| 101arrowz/fflate | 3,026 | MIT | 2026-05-16 |
| Stuk/jszip | 10,386 | MIT 或 GPLv3(原文) | 2026-09-09 |
| stackblitz/sdk | 50 | MIT | 2026-07-01 |
| codesandbox/codesandbox-sdk | 112 | 无 | 2026-06-18 |
| microsoft/playwright | 96,873 | Apache-2.0 | (未取) |
| vercel/next.js | 142,895 | MIT | (未取) |
| withastro/astro | 62,924 | MIT(原文) | (未取) |
| vercel-labs/coding-agent-template | 1,789 | Apache-2.0(原文) | 2026-08-25 |
| vercel-labs/json-render | 18,423 | Apache-2.0 | 2026-09-25 |
