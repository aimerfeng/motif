# Agent Skills / Rules / AI 文档调研（前端设计、UI、动效）

调研日期：2026-09-29。方法：`gh api` 读取仓库元数据、LICENSE 原文与 SKILL.md 原文；官方文档用 WebFetch。星数与推送时间均为当日 API 读数。凡未能核实之处均明确标注「未核实」。

---

## 1. Skill 格式规范

### 1.1 开放标准

Agent Skills 是一个开放标准，规范仓库为 `agentskills/agentskills`（Apache-2.0，文档部分 CC-BY-4.0，见其 README「License」一节），站点 agentskills.io。Claude Code 官方文档明确写道 "Claude Code skills follow the Agent Skills open standard"（code.claude.com/docs/en/skills），并在标准之上扩展了调用控制、subagent、动态上下文注入等字段。

来源：`agentskills/agentskills` 的 `docs/specification.mdx`。

### 1.2 目录结构

```
skill-name/
├── SKILL.md          # 必需：YAML frontmatter + Markdown 正文
├── scripts/          # 可选：可执行代码
├── references/       # 可选：按需加载的文档
├── assets/           # 可选：模板、图片、数据
└── ...               # 任意其他文件
```

### 1.3 frontmatter 字段（标准）

| 字段 | 必需 | 约束 |
|---|---|---|
| `name` | 是 | 1-64 字符；仅小写字母/数字/连字符；不得以连字符开头或结尾；不得含连续连字符 `--`；**必须与父目录名一致** |
| `description` | 是 | 1-1024 字符；应同时写明「做什么」和「何时使用」，含触发关键词 |
| `license` | 否 | 许可证名称或随附许可证文件名 |
| `compatibility` | 否 | 1-500 字符；环境要求 |
| `metadata` | 否 | 字符串到字符串的映射 |
| `allowed-tools` | 否 | 空格分隔的预授权工具（实验性） |

渐进披露（spec 原文）：启动时只加载 name+description（约 100 token）；激活后加载 SKILL.md 正文（建议 <5000 token、<500 行）；scripts/references/assets 按需读取。文件引用用相对路径，且只深入一层。校验工具：`skills-ref validate ./my-skill`（在 agentskills 仓库的 `skills-ref/`）。

### 1.4 Claude Code 的扩展字段（官方文档核实）

`when_to_use`、`argument-hint`、`arguments`、`disable-model-invocation`、`user-invocable`、`disallowed-tools`、`model`、`effort`、`context`(fork)、`agent`、`background`、`hooks`、`paths`（glob，仅在处理匹配文件时自动加载）、`shell`、`metadata`。注意：`description`+`when_to_use` 合计在技能列表中被截断在 1,536 字符。`name` 在 Claude Code 中不是必需的（默认取目录名），但为跨工具兼容我们**必须写**。Cursor 文档另列了 `icon`/`color`/`paths`/`disable-model-invocation`。**结论：Motif 生成的 SKILL.md 只使用标准字段（name/description/license/compatibility/metadata），可选 `paths`，避免依赖私有扩展。**

### 1.5 各工具的安装位置

| 工具 | 项目级 | 全局 | 来源 |
|---|---|---|---|
| Claude Code | `.claude/skills/<name>/SKILL.md` | `~/.claude/skills/<name>/SKILL.md` | code.claude.com 官方文档；支持嵌套子目录与 `--add-dir` |
| Codex | `.agents/skills/`（自 cwd 向上扫描至仓库根） | `$HOME/.agents/skills`；vercel `skills` CLI 表中另写 `~/.codex/skills/` | learn.chatgpt.com/docs/build-skills（WebFetch）；CLI README。可选 `agents/openai.yaml` 配置 UI/调用策略 |
| Cursor | `.agents/skills/`、`.cursor/skills/`，兼容读取 `.claude/skills/`、`.codex/skills/` | `~/.agents/skills/`、`~/.cursor/skills/` | cursor.com/docs/context/skills（WebFetch） |
| Gemini CLI | `.gemini/skills/` 或别名 `.agents/skills/` | `~/.gemini/skills/` 或 `~/.agents/skills/` | geminicli.com/docs/cli/skills（WebFetch） |
| GitHub Copilot / OpenCode / Amp / Cline / Zed / Warp 等 | 多数为 `.agents/skills/` | 各自目录（如 `~/.config/opencode/skills/`） | `vercel-labs/skills` README「Supported Agents」表（列出 75+ 个 agent） |

**趋势：`.agents/skills/` 是事实上的通用项目路径；`.claude/skills/` 被 Claude Code 使用且被 Cursor 兼容读取。** 「复制 Skill」功能应默认给出 `.agents/skills/<name>/` 与 `.claude/skills/<name>/` 两个目标。

### 1.6 安装 CLI

- **`npx skills add <owner/repo>`**（`vercel-labs/skills`，MIT，32.8k★，2026-09-28 仍活跃）。支持 GitHub 简写、完整 URL、树路径、GitLab、本地路径、**直接 SKILL.md 或 .zip/.tar/.tgz 下载 URL**（限制：下载 10 MiB、解压 25 MiB、1000 文件）。选项：`-g` 全局、`-a <agent>`、`-s <skill>`、`--copy`（默认软链）、`-y`、`--all`。另有 `list/find/update/remove/init/use`。`skills use` 可不安装直接把 skill 拼成 prompt 输出到 stdout。
- **`openskills`**（`numman-ali/openskills`，Apache-2.0，10.8k★，最后推送 2026-01-18，较久未更新）：`npx openskills install anthropics/skills`；默认装到 `./.claude/skills`，`--universal` 装到 `./.agent/skills`；在 `AGENTS.md` 里写 `<available_skills>` XML，agent 通过 `npx openskills read <name>` 读取。适合不原生支持 skill 的 agent。
- 我们的站点可让每个作品提供：(a) `npx skills add aimerfeng/motif --skill <name>`（需先把技能库按 `skills/<name>/SKILL.md` 结构放在仓库中，CLI 才能发现——CLI 对仓库布局的发现规则细节未逐条核实）；(b) 「下载 .zip」（CLI 直接支持 zip URL）；(c) 「复制 SKILL.md 文本」。

### 1.7 其他 AI 面向文档格式（辅助）

- **Cursor rules**：`.cursor/rules/*.mdc`（frontmatter：`description`/`globs`/`alwaysApply`）。此点来自既有知识，本次未在官方文档核实。`PatrickJS/awesome-cursorrules` 有 257 个规则文件。
- **AGENTS.md / CLAUDE.md / GEMINI.md**：项目级常驻指令（gsap-skills 仓库同时提供三者与 `.github/copilot-instructions.md`，可作多工具分发的范例）。
- **llms.txt**：文档站给 LLM 的索引。gsap-skills 的 `skills/llms.txt`、code.claude.com 的 `/docs/llms.txt` 均存在。

### 1.8 最小示例：Motif 生成的组件 Skill（动态渐变背景）

```markdown
---
name: motif-animated-gradient-bg
description: Adds an animated multi-stop mesh-gradient background to a hero or section using pure CSS (no JS). Use when the user asks for an animated gradient, aurora, or mesh background, or references the Motif "Animated Gradient Background" effect. Includes the user's tuned parameters.
license: MIT
compatibility: Any framework; needs CSS @property (Chrome 85+, Safari 16.4+, Firefox 128+). Falls back to a static gradient.
metadata:
  author: motif
  source: https://motif.example/e/animated-gradient-bg   # 占位
  version: "1.2.0"
  category: background
  params-hash: "a91f3c"
---

# Animated Gradient Background

## When to use
Hero or full-bleed section backgrounds where ambient, slow motion supports (not competes with) the headline. Do NOT use behind dense body text or data tables.

## Tuned parameters (from the user's Motif session)
| Param | Value | Meaning |
|---|---|---|
| colors | `#1b1464, #6a11cb, #2575fc, #0f2027` | 4 stops, dark-to-light |
| speed | 18s | full loop; keep 12-30s |
| angle | 135deg | base direction |
| blur | 0 | raise for softer aurora |
| grain | 0.04 | noise overlay opacity |

## Steps
1. Copy `assets/gradient-bg.css` into the project stylesheet (or `@import` it).
2. Add `class="motif-gradient-bg"` to the target element; ensure it has `position: relative; overflow: hidden`.
3. Keep foreground text at >= 4.5:1 contrast against the darkest AND lightest stop; if not, add a scrim.
4. Respect `prefers-reduced-motion`: the CSS already stops the animation; do not remove that block.

## Rules
- Animate only via the registered custom property / `background-position`, never `width`/`height`.
- Do not add more than one such background per viewport.
- Tokens are CSS variables (`--mgb-*`); change values there, not inline.

## Files
- `assets/gradient-bg.css` - the effect (source of truth)
- `references/variants.md` - alternatives (aurora, conic, noise)
```

要点：`name` 与目录名一致；description 含「做什么 + 何时用 + 触发词」；参数表把用户调好的值固化；代码放 `assets/`，SKILL.md 只放决策与规则。

---

## 2. 仓库与来源总表

许可证列为**核实后**结果（读了 LICENSE 原文或官方页面）。分级：A = 宽松许可，可再分发/改编（须保留署名与许可证文本）；B = 混合或有条件；C = 仅作参考（无许可证、专有或付费）。

| 仓库 | ★ | 最近推送 | 许可证（核实后） | 分级 | 内容 | 整合方式与价值 |
|---|---|---|---|---|---|---|
| `anthropics/skills` 之 `frontend-design` | 179.0k（整库） | 2026-09-29 | 该文件夹 `LICENSE.txt` = Apache-2.0 | **A** | 反「AI 味」设计准则、两遍式设计计划、排版与动效克制 | 借鉴其结构改写自有 master skill；如逐字复用须保留 Apache-2.0 与 NOTICE。价值：极高 |
| `anthropics/skills` 之 `web-artifacts-builder`、`canvas-design`、`theme-factory`、`algorithmic-art`、`brand-guidelines`、`skill-creator`、`mcp-builder`、`webapp-testing`、`slack-gif-creator`、`claude-api`、`internal-comms`、`academy-guide`、`discernment-nudge` | 同上 | 同上 | 逐文件夹核实 LICENSE.txt 均为 Apache-2.0 | **A**（注意子资源） | 见 3.x；`canvas-design/canvas-fonts` 含 81 个字体文件，各带 OFL 文本；`web-artifacts-builder/scripts/shadcn-components.tar.gz` 内含第三方组件 | 方法论可借鉴（algorithmic-art 的「参数探索 + 种子随机」与 Motif 调参高度契合）。字体/tarball 须按其各自许可分别处理 |
| `anthropics/skills` 之 `docx`、`pdf`、`pptx`、`xlsx` | 同上 | 同上 | LICENSE.txt：「© 2025 Anthropic, PBC. All rights reserved」专有；README 称 source-available, not open source | **C** | 文档生成 skill | 不整合、不再分发。与前端无关 |
| `anthropics/skills` 之 `doc-coauthoring` | 同上 | 同上 | **该文件夹无 LICENSE 文件**；仓库根也无 LICENSE（`gh api .../license` 返回 404） | **C** | 文档协作 | 不整合 |
| `anthropics/claude-code` 之 `plugins/frontend-design` | — | — | 仓库根 LICENSE.md：「© Anthropic PBC. All rights reserved. Use is subject to Commercial Terms」；该插件目录仅有 SKILL.md，无单独许可证 | **C** | 与 skills 仓库内容一致的 frontend-design | 若要引用，只应取 `anthropics/skills` 的 Apache-2.0 版本，勿从此路径取 |
| `vercel-labs/agent-skills` | 31.7k | 2026-08-28 | **无 LICENSE 文件，GitHub 未识别**；README 末尾写「MIT」；部分 skill 的 frontmatter 有 `license: MIT`（如 react-view-transitions），`web-design-guidelines` 无该字段 | **B** | react-best-practices、web-design-guidelines、react-view-transitions、composition-patterns、react-native-skills 等 | 建议整合前联系确认/等其补 LICENSE；`react-view-transitions` 与动效相关，价值高。`web-design-guidelines` 是「运行时抓取远程规则」型 skill |
| `vercel-labs/web-interface-guidelines` | 0.9k | 2026-08-18 | MIT（LICENSE 文件存在） | **A** | 单文件 `command.md`：无障碍、焦点、表单、**Animation**、排版等清单 | 可直接改写为 Motif 的通用质量闸 skill。价值：高 |
| `vercel-labs/skills`（`npx skills`） | 32.8k | 2026-09-28 | MIT | **A** | 安装 CLI，75+ agent 路径表 | 不整合内容，作为分发渠道；路径表是我们生成安装说明的依据 |
| `numman-ali/openskills` | 10.8k | 2026-01-18 | LICENSE 文本为 Apache-2.0（API 显示 NOASSERTION，因版权行格式） | **A** | 通用 skill 加载器 | 作为兼容渠道提及 |
| `agentskills/agentskills` | 25.8k | 2026-08-09 | 代码 Apache-2.0；文档 CC-BY-4.0（README 明写） | **A** | 格式规范 | 格式的权威来源；可引用规范文字（署名） |
| `nextlevelbuilder/ui-ux-pro-max-skill` | 131.5k | 2026-09-27 | MIT（LICENSE 核实，版权 Next Level Builder） | **A**（数据表有上游） | 79 种风格、192 配色、74 字体搭配、119 条 UX 准则、17 个 GSAP 动效预设（`motion.csv`）、22 套技术栈规则；Python 检索脚本；`--design-system --persist` 生成 MASTER.md + 页面覆盖；「Design Dials」variance/motion/density 1-10 | 数据 CSV 可作种子库，但含 Google Fonts、Phosphor 图标等上游数据（`data/google-font-licenses.json`、`phosphor-icons-upstream.json`），字体/图标须各自遵守其许可。MASTER.md + overrides 模式值得借鉴。价值：极高 |
| `greensock/gsap-skills` | 15.8k | 2026-07-29 | MIT（LICENSE 核实，GreenSock 2026） | **A**（**但 GSAP 库本身另有条款**） | 官方 8 个 skill：gsap-core/timeline/scrolltrigger/react/plugins/performance/utils/frameworks + `llms.txt`；同时提供 CLAUDE/AGENTS/GEMINI/copilot 指令 | skill 文本可用。**警告**：GSAP Standard License（gsap.com/standard-license，WebFetch 读取）禁止在「让用户无代码构建可视化动画、并与 Webflow 可视化动画能力竞争」的工具中使用 GSAP。Motif 有「零代码生成并调参」功能，存在落入该条款的风险，见第 5 节 |
| `LottieFiles/motion-design-skill` | 1.8k | 2026-05-18 | MIT | **A** | 通用动效原则：三支柱、动效人格、时长/缓动表、迪士尼原则、编排 1/3 规则、stagger 预算 | 极适合作为 `motif-motion` 的参考骨架。价值：高 |
| `kylezantos/design-motion-principles` | 1.2k | 2026-05-30 | MIT | **A** | Create/Audit 双模式；Emil Kowalski / Jakub Krehel / Jhey Tompkins 三视角；频率门；反「AI 味动效」清单 | 借鉴结构；其自述这些是对公开著作的解读，非作者本人内容（注意不要冒用姓名背书）。价值：高 |
| `addyosmani/web-quality-skills` | 2.9k | 2026-08-24 | MIT | **A** | accessibility / performance / core-web-vitals / seo / best-practices，Lighthouse 证据驱动 | 作为质量闸子 skill 的来源。价值：中高 |
| `plugin87/ux-ui-agent-skills` | 1.5k | 2026-09-16 | MIT | **A** | design-doctrine（验证协议、8 状态、token-by-intent）、a11y-audit、design-component 等；附验证脚本 | 「跑闸门、不许空口宣称」的验证协议值得借鉴。价值：中高 |
| `shadcn-ui/ui` 之 `skills/shadcn` | 124.8k | 2026-09-29 | 仓库 MIT | **A** | 官方 shadcn skill：运行 `shadcn info --json` 注入项目上下文；规则文件 styling/forms/composition/icons/base-vs-radix；`allowed-tools`；`agents/openai.yaml`；`npx skills add shadcn/ui` | **skill 设计的最佳范本**：常驻规则 + Incorrect/Correct 对照 + evals。价值：极高。另有 `migrate-radix-to-base` |
| `magicuidesign/magicui` / `magicuidesign/mcp` | 22.4k / 0.2k | 2026-09-20 / 2026-04-07 | 均 MIT（API 读数） | **A**（Pro 部分未核实） | 动画组件库 + 可搜索安装的 MCP | 组件源码可整合（保留 MIT 声明）。是否有付费 Pro 内容不在这些仓库内，**未核实** |
| `21st-dev/magic-mcp` | 5.9k | 2026-09-09 | ISC | **B** | MCP，搜索 10,000+ React/Tailwind 组件；现称 21st MCP | MCP 代码本身宽松，但其组件库内容来自社区提交，逐组件许可**未核实**，不可批量导入。`21st-dev/skill`（Apache-2.0，11★）为其 skill 封装 |
| Motion（motion.dev）AI Kit | — | — | 官网 docs/ai-kit（WebFetch）：免费层含文档搜索与 best practices；**Motion+ 付费**含 CSS spring 生成、MotionScore、编辑器、450+ 示例源码；页面未给出许可条款 | **C** | 官方 skill + MCP | 仅参考并推荐用户自行安装。Motion 库本体（`motiondivision/motion`）MIT，33.8k★ |
| `PatrickJS/awesome-cursorrules` | 40.9k | 2026-05-30 | 仓库 LICENSE = CC0-1.0 | **B** | 257 个 `.mdc` 规则文件（React/Next/Tailwind/shadcn 等） | CC0 是仓库层面声明，各条规则可能来自第三方，来源**未逐条核实**；质量参差，以泛泛的技术栈规则为主，设计深度低。仅作参考 |
| `ComposioHQ/awesome-claude-skills` | 75.9k | 2026-09-18 | **无许可证** | **C** | 列表 + 内含 Anthropic skill 的拷贝（theme-factory、canvas-design 等）+ 自有 skill | 只作发现渠道；不从此处取内容（应取 Anthropic 原库） |
| `travisvn/awesome-claude-skills` | 15.2k | 2026-04-28 | **无许可证**（仅 README） | **C** | 纯列表 | 发现渠道 |
| `VoltAgent/awesome-agent-skills` | 35.0k | 2026-09-29 | MIT | **A**（列表本身） | 1000+ skill 的目录 | 发现渠道；所列各 skill 许可各异 |
| `Jakubantalik/transitions.dev` | 4.4k | 2026-09-29 | **无 LICENSE 文件**；含 Pro 付费转场（需登录才可拉取） | **C** | 12 个免费 CSS 转场 + `npx transitions-dev` + agent skill | 形态与 Motif 最接近（复制 CSS 片段 + skill）。不能取用其内容；可作产品参考 |
| `CloudAI-X/threejs-skills` | 3.4k | 2026-07-09 | **无 LICENSE 文件** | **C** | 10 个 three.js skill（fundamentals/shaders/postprocessing/…） | 内容不可复用；主题可自写 |
| `scottstts/Threejs-Awesome-Graphics-Agent-Skills` | 0.9k | 2026-09-22 | MIT | **A** | three.js 图形 skill，含 example-gallery、`.codex` | 3D 类目的可整合来源。内容质量**未深读** |
| `v2space-labs/shader-for-interfaces` | 0.1k | 2026-09-01 | MIT | **A** | 界面 GPU 特效 skill：GLSL/WGSL、粒子、r3f 集成、性能与无障碍；`brief-to-effect.md`、`effect-selection.md` | 与 Motif 的着色器类目直接对口；星数低，需审阅质量 |
| `nateherkai/scroll-craft` | 2.9k | 2026-09-04 | MIT | **A** | 滚动驱动落地页：访客旅程、情感曲线、单一签名动作；反「一种手法用满全页」 | 借鉴其「不是什么」反模式写法 |
| `AThevon/genjutsu` | 0.4k | 2026-09-28 | LICENSE 文件为 MIT（API 显示 NOASSERTION，原因未查） | **A**（存疑） | 创意编程 skill：动效、微交互 | 未深读；引用前需再核实 |
| `meodai/skill.color-expert` | 0.6k | 2026-09-23 | CC-BY-4.0 | **A**（须署名） | 色彩科学参考资料 | 配色 skill 的参考来源；CC-BY 要求署名并注明改动 |
| `199-biotechnologies/motion-dev-animations-skill` | 0.1k | 2026-03-30 | MIT | **A** | Motion.dev 动画 skill | 可参考；未深读 |
| `addyosmani/agent-skills`、`nexu-io/open-design`（Apache-2.0）、`dominikmartn/nothing-design-skill`（MIT）、`bitjaru/styleseed`（MIT）、`JimLiu/baoyu-design`（MIT） | 各 0.9k–99.9k | 2026-09 | 仅读了 API 许可证字段，**未读内容** | 未分级 | 通用工程 / 设计系统类 | 列入待查清单 |

### 分级计数（仅统计上表已核实并分级的条目）

- **A**：agentskills 规范、frontend-design 与其余 13 个 Anthropic Apache 文件夹（记 2 行）、web-interface-guidelines、vercel skills CLI、openskills、ui-ux-pro-max、gsap-skills、LottieFiles、design-motion-principles、web-quality-skills、ux-ui-agent-skills、shadcn skill、magicui（+mcp）、VoltAgent 目录、scottstts three.js、shader-for-interfaces、scroll-craft、genjutsu、color-expert（CC-BY）、motion-dev-animations-skill —— 共约 **22 行**。
- **B**：vercel-labs/agent-skills、21st magic-mcp、awesome-cursorrules —— **3 行**。
- **C**：Anthropic docx/pdf/pptx/xlsx、doc-coauthoring、claude-code 插件副本、Motion AI Kit、ComposioHQ、travisvn、transitions.dev、CloudAI-X threejs —— **8 行**。

### 许可证意外发现

1. `anthropics/skills` **仓库根没有 LICENSE**，许可证只在各文件夹内；frontend-design 等为 Apache-2.0，docx/pdf/pptx/xlsx 为专有，doc-coauthoring 无任何许可证文件。
2. **同名 frontend-design 出现两份**：`anthropics/skills` 中为 Apache-2.0；`anthropics/claude-code` 仓库（根 LICENSE.md 为 All rights reserved）中的插件副本不能当作开源。
3. `vercel-labs/agent-skills`（31.7k★）**没有 LICENSE 文件**，只有 README 一行「MIT」。
4. `ComposioHQ` 与 `travisvn` 两大 awesome 库均**无许可证**；前者内部拷贝了 Anthropic skill，应回溯原库。
5. **GSAP 的 Standard License 有「不得用于与 Webflow 竞争的无代码可视化动画构建工具」条款**，虽然 gsap-skills 本身是 MIT。
6. `transitions.dev` 与 CloudAI-X 的 three.js skill 星数高但无许可证；`openskills`、`genjutsu` 在 GitHub API 上显示 NOASSERTION，但文件本身是标准 Apache-2.0 / MIT 文本。

---

## 3. 好的前端设计 Skill 包含什么

以下均基于读到的 SKILL.md 原文。

### 3.1 `anthropics/skills` / `frontend-design`（最新版）

- **角色设定 + 主题落地**：以「拒绝过模板化方案的设计工作室负责人」自居；先确定产品的主体、受众与主要任务，再让行业语汇决定视觉选择。
- **首屏**：以「主题世界里最具代表性的东西」开场；「大数字 + 小标签 + 渐变强调」被点名为默认套路。
- **排版**：字体家族 1-2 个且差异明显；遵循《The Elements of Typographic Style》；行宽 <80 字符；衬线正文行高略大。**明列 AI 味排版**：只给标题里一个词加斜体/变色、全大写标签、无意义的小标签、无内容依据的 01/02/03 编号。
- **结构即信息**：边框、编号、分割线必须承载信息，而非装饰。
- **动效**：非用户触发的动效要节制，「一次编排好的时刻」胜过处处淡入上移；对用户操作的反馈型动效欢迎。
- **AI 味特征清单（5 类）**：奶油底 + 衬线 + 陶土色 (#F4F1EA / #D97757)；近黑底 + 单一酸绿/朱红；报纸式发丝线零圆角；SaaS 卡片套装（同圆角、同灰阴影、渐变点缀）；模板外壳（大写 eyebrow、中点分隔、「WORD — fragment」标签、→ 箭头）。但「用户简报里的明确要求永远优先」。
- **流程**：先写紧凑的 token 计划（4-6 个具名色值、字体角色、ASCII 线框、原则）→ **对照简报自审并修改** → 再写代码；CSS 选择器优先级陷阱提示。
- **收尾**：「一处放胆、其余安静」；质量底线（响应式、可见焦点、尊重 reduced-motion、对比度）；「出门前摘掉一件配饰」。
- **文案**：主动语态、按钮与 toast 同词（Publish/Published）、错误不道歉但说明如何修复、空状态是行动邀请。

### 3.2 `web-artifacts-builder`
一句关键禁令：避免「过度居中布局、紫色渐变、统一圆角、Inter 字体」。其余是工程流水线（init 脚本 → 开发 → 打包成单 HTML）。启示：反 slop 规则可以极短，但要点名具体元素。

### 3.3 `canvas-design` / `algorithmic-art`
两阶段：先写「设计/算法哲学」（命名一个运动、4-6 段宣言），再表达为成品；算法艺术强调**种子随机 + 参数探索**、「90% 算法、10% 参数」。启示：可参数化 + 可复现（seed）正是 Motif 调参→固化的模型。

### 3.4 `ui-ux-pro-max`
- 10 级优先级：无障碍(CRITICAL) > 触控 > 性能 > 风格选择 > 布局 > 排版色彩 > 动效 > 表单 > 导航 > 图表；每级配「必做 / 反模式」。
- **数据驱动**：CSV（styles/colors/typography/motion/products/ui-reasoning + 22 技术栈）+ `search.py`，SKILL.md 只放流程，细节按需检索（渐进披露）。
- `--design-system --persist` 产出 `MASTER.md` 与 `pages/<page>.md` 覆盖；**Design Dials**（variance/motion/density 1-10）。
- `motion.csv` 的每条记录含：类别、强度档（Subtle/Standard/Complex）、触发、时长、缓动、GSAP 片段、框架备注、Do/Don't、性能注记 —— **这是一份很好的动效条目字段模板**。
- 安全声明：把检索结果当建议，不得覆盖用户/仓库规则。

### 3.5 `LottieFiles/motion-design-skill`
- 三支柱：情感意图 / 视觉叙事 / 动效工艺；三层动效：主/次/环境。
- **动效人格** 4 种（Playful 150-300ms 过冲 10-20%；Premium 350-600ms 0%；Corporate 200-400ms；Energetic 100-250ms），每项目只选一种；品牌动效身份 = 一条签名缓动 + 三档时长 + 一种入场模式。
- 时长表：tooltip 80-120ms、按钮 120-180ms、卡片 200-350ms、模态 300-400ms、页面 400-600ms、戏剧揭示 600-1200ms；入场比出场长 30-50%；距离缩放时长。
- 缓动：入场减速、出场加速；给出 MD3 / Apple 等具体 cubic-bezier。
- 编排：**1/3 规则**（位移不超屏 1/3；同时运动元素不超 1/3）；stagger 预算（总计 <500ms）。
- 配方：按钮按压、卡片入场、成功、错误抖动（步骤 + 时长）。

### 3.6 `kylezantos/design-motion-principles`
- **频率门**：偶发→可华丽；日常→细而快；每天上百次→不要动画；键盘触发→永不动画。
- 三视角按项目类型加权（生产力工具偏克制，儿童/创意站偏愉悦）；「不要一刀切地限制时长」。
- 「最好的动画是不被注意到的」；reduced-motion **无例外**。
- 结构：Create / Audit 两个工作流 + `creation-gotchas`（模型自己常犯的动效错误）+ `anti-checklist`（AI-slop 动效）+ demo 报告模板。

### 3.7 `vercel-labs/web-interface-guidelines`（command.md）
可核查的短条目：Animation 一节——尊重 reduced-motion；只动画 transform/opacity；**禁止 `transition: all`**；正确设置 transform-origin；动画可中断；>5s 的自动动效需暂停控件。另有焦点（用 `:focus-visible`，不要裸 `outline:none`）、表单、排版（`text-wrap: balance`、tabular-nums、省略号 `…`）。**适合作为机器可检查的规则清单。**

### 3.8 `vercel-labs/agent-skills` / `react-view-transitions`
「每个 ViewTransition 都必须传达空间关系或连续性；说不出它传达什么就别加」；给出优先级表（共享元素→Suspense 揭示→列表身份→状态变化→路由变化）。启示：动效用「它传达什么」来准入。

### 3.9 `shadcn-ui/ui` / `skills/shadcn`
- 前置命令注入真实项目上下文：`!`npx shadcn@latest info --json``。
- Principles 4 条 + Critical Rules 分文件，每条为 Incorrect/Correct 代码对；语义色而非 `bg-blue-500`、`gap-*` 而非 `space-y-*`、`size-*`、`cn()` 等。
- `user-invocable: false` + `allowed-tools` 限定 CLI；含 `evals/evals.json`；`agents/openai.yaml` 兼容 Codex。

### 3.10 `plugin87/ux-ui-agent-skills` / `design-doctrine`
验证协议（不测量就不许说数字；每个状态都测；渲染并**看**；SKIPPED 不算通过）；五条不可让步项（token 按意图、单一主题源、8 状态、一个主角——展示字号 ≥ 正文 2.5 倍、输出完整）；决策顺序：用户需求 > 无障碍 > 一致性 > 美学 > DX。

### 3.11 GSAP 官方 skill
按主题拆成 8 个小 skill 互相引用（core/timeline/scrolltrigger/react/plugins/performance/utils/frameworks），有「何时推荐 GSAP 而非 CSS」的判断；`gsap.matchMedia()` 处理 reduced-motion；useGSAP 清理。提供 `llms.txt`。

### 3.12 共同规律（总结）

1. **description 是触发器**：写清场景、同义词、用户可能说的话。
2. **规则要具体到可检查**（数字、属性名、禁用清单），并给出反例（AI 味清单）。
3. **先计划、再自审、后实现**（frontend-design、scroll-craft）。
4. **上下文加权**：同一规则随产品类型/动效人格/频率而变（LottieFiles、design-motion-principles）。
5. **渐进披露**：SKILL.md 短，细节放 references/data，按需检索（ui-ux-pro-max、shadcn）。
6. **质量闸门**：无障碍、reduced-motion、性能、响应式作为底线，最好带可运行脚本（plugin87、addyosmani）。
7. **注入真实项目上下文**（shadcn 的 `info --json`），而非泛泛建议。
8. **Do/Don't/性能注记的条目模板**（ui-ux-pro-max motion.csv）。

---

## 4. 推荐的 Motif Skill 分类与参数固化

### 4.1 三层结构

```
motif-design/                      # 1 个总控 skill（常驻场景：任何 UI/动效/着色器任务）
├── SKILL.md                       # 流程：读简报→token 计划→自审→实现→质量闸
├── references/
│   ├── anti-slop.md               # 反 AI 味清单（自写，参考 frontend-design 的结构）
│   ├── motion-principles.md       # 频率门、人格、时长/缓动表、1/3 规则
│   └── a11y-perf-gate.md          # reduced-motion、对比度、只动画 transform/opacity
└── assets/tokens.css

motif-cat-motion/  motif-cat-shaders/  motif-cat-typography/  motif-cat-background/
motif-cat-scroll/  motif-cat-3d/  motif-cat-microinteraction/   # 每类目 1 个
└── SKILL.md + references/(选型表、库选择、性能预算) + evals/

motif-<component-slug>/            # 每个作品 1 个微型 skill（如第 1.8 节示例）
├── SKILL.md   # 何时用、调好的参数、接入步骤、禁忌
├── assets/    # 源码（CSS/TSX/GLSL）
└── references/variants.md
```

命名：统一前缀 `motif-`，避免与用户自有 skill 冲突；`name` = 目录名。总控用 `description` 覆盖宽泛触发；微型 skill 的 description 写具体效果名与同义词；如 skill 数量大，可用 `paths` 或让微型 skill 不自动触发（`disable-model-invocation`）——但这两项是 Claude Code / Cursor 的扩展，其他工具会忽略，需要保证忽略后仍正确。

### 4.2 参数固化方案

- 数据模型：每个作品有 `params.schema.json`（参数名、类型、范围、默认、说明）与用户的 `params.values.json`。
- 下载时由模板渲染：SKILL.md 的「Tuned parameters」表 + `assets/` 代码中的 CSS 变量/常量同时写入用户值；`metadata.params-hash` 便于以后比对与更新。
- 同时保留 **原始默认值**与「安全范围」，让 agent 在用户后续要求「再快一点」时知道边界（借鉴 ui-ux-pro-max 的 dials 与 algorithmic-art 的 seed）。
- 需要随机性的作品固化 `seed`，保证复现。
- 引导 agent 使用 token（CSS 变量），而非把值散落在代码里。
- 每个微型 skill 携带一段 `Rules`（禁忌：不要叠加多个同类背景、不要动画布局属性等），来源于类目 skill，避免每个作品重复撰写。
- 提供 `.zip` 下载与 `npx skills add` 两种路径（见 1.6）；zip 需遵守 CLI 的 10 MiB / 1000 文件上限。

### 4.3 我们自己的评估

参考 shadcn skill 的 `evals/evals.json` 与 skill-creator 的评估设计，为总控与类目 skill 建立小型评测（例：给定简报，检查是否出现「AI 味特征」、是否含 reduced-motion）。此设想的具体格式**未核实**，需读 `anthropics/skills/skills/skill-creator` 后确定。

---

## 5. 风险与未知

1. **GSAP 许可条款**：Standard License 禁止在与 Webflow 可视化动画构建能力竞争的无代码工具中使用。Motif 的「零代码生成 + 调参 + 下载」需要法律层面判断；稳妥策略是让 Motif 自身的预览与生成不依赖 GSAP（用 CSS / WAAPI / Motion(MIT) / three.js），GSAP 仅作为用户项目里的可选输出并附合规提示。此为提示而非法律意见。
2. **许可证一致性**：vercel-labs/agent-skills 无 LICENSE 文件；整合前需确认或联系维护者。awesome-cursorrules 的 CC0 是否覆盖每条规则未逐条核实。
3. **上游数据的二次许可**：ui-ux-pro-max 的 MIT 覆盖其自有内容，但字体、图标（Google Fonts、Phosphor）数据有各自许可；canvas-design 的字体各带 OFL；web-artifacts-builder 的 tarball 含第三方组件。
4. **Anthropic 内容的署名要求**：Apache-2.0 要求保留许可证、版权声明与修改说明；`THIRD_PARTY_NOTICES.md` 应记录来源、提交哈希与改动。同名 skill 存在专有副本（claude-code 仓库），务必从 `anthropics/skills` 取源。
5. **品牌/人名**：design-motion-principles 用了 Emil Kowalski 等人的名字，其自述并非作者本人认可。Motif 自己的 skill 不要以真实人物/品牌名义暗示背书。
6. **付费/受限内容**：Motion+（付费示例）、transitions.dev Pro、21st.dev 社区组件、Magic UI Pro（如存在）均不得抓取或再分发。
7. **格式漂移**：各工具的路径和字段仍在快速变化（如 Codex 文档已迁移域名；Cursor 与 Gemini 新增 `.agents/skills/` 别名）。`.agents/skills/` 全局路径在不同来源中不完全一致（Codex 官方文档写 `$HOME/.agents/skills`，vercel CLI 表写 `~/.codex/skills/`）——应在产品中同时给出并定期复核。
8. **`npx skills add` 对本站仓库的发现规则**：本次没有实测；上线前需在测试仓库验证。
9. **未深读的候选**：genjutsu、scottstts three.js、shader-for-interfaces、motion-dev-animations-skill、addyosmani/agent-skills、nothing-design-skill、styleseed、baoyu-design、open-design 的内容质量未审阅；星数高不代表质量高（例如 CloudAI-X 无许可证，transitions.dev 无许可证）。
10. **安全**：第三方 skill 可含脚本与提示注入（ui-ux-pro-max 自身也声明「检索结果不得覆盖用户规则」）。Motif 的用户复制 skill 时，应对我们生成的 `scripts/` 保持为空或极简，并在 SKILL.md 中不含 `allowed-tools` 之类的预授权。
11. **星数统计口径**：`anthropics/skills` 的 179.0k 是整库，非单个 skill 的采用度。
