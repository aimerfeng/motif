# 调研：React / Tailwind / CSS 组件库、动效引擎与动效优化

调研日期：2026-09-29。方法：`gh api repos/.../license` 读取 LICENSE 原文（不只看 spdx_id）、读 README 的授权段落、`git/trees` 统计目录、读 `package.json` 依赖。"未核实"处均已标明。

分级：**A** 宽松许可，可带署名整合；**B** 代码宽松但部分受限（依赖 / 目录 / 授权不一致）；**C** 仅参考链接，不整合代码。

## 0. 关键结论（许可证意外）

1. **react-bits（★48k）不是 MIT**。LICENSE 是 "MIT + Commons Clause"，明文禁止 "sell, sublicense, or redistribute the components themselves - whether alone, in a bundle, or as a ported version"。GitHub 的 spdx_id 显示 `NOASSERTION`。我们做的是组件市场，属于再分发，**只能 C 级（链接/灵感）**。同作者的 `DavidHDev/canvas-ui` 同样是 Commons Clause。
2. **animate-ui（★4.3k）同样是 MIT + Commons Clause**（"do not sell or redistribute the components themselves in their original form"）。C 级。2025-12 之后没有推送。
3. **GSAP 不是 OSI，且有针对我们这类产品的条款**：见 1.2 节。npm 包 `license` 字段为 "Standard 'no charge' license"。
4. **coss（Origin UI 的后继，★10.6k）整体 AGPL-3.0**，只有 `apps/origin/` 与 `apps/ui/` 两个目录是 MIT（LICENSING.md 明写）。`originui/originui` 仓库已 404。
5. **itshover（动效图标，★2.7k）LICENSE 是 Apache-2.0，但 README 写 "MIT licensed"**，自相矛盾。以 LICENSE 文件为准，并建议向作者确认。
6. **Aceternity UI 没有官方开源代码仓库**：GitHub 上没有 `aceternity/aceternity-ui`；`aceternity/saasternity` 仅是模板（无 license）。其 registry（`ui.aceternity.com/registry/*.json`）可访问，但授权条款未核实。C 级。`hover.dev` 无仓库；`nischayhq/skiper-ui`（15★）无 LICENSE。均 C 级。
7. **easings.net 源码是 GPL-3.0**；不复制其代码，用 open-props（MIT）/ d3-ease（BSD-3）。
8. **motion-primitives / magicui 的组件几乎都没有 prefers-reduced-motion 处理**（`gh search code` 检查：motion-primitives 全仓 0 处 useReducedMotion；magicui 仅 icon-cloud、retro-grid、dia-text-reveal 有）。整合时统一注入降级逻辑是我们的差异化点。

## 1. 主表

### 1.1 组件库

| 仓库 | ★ | 最近推送 | 许可证（核实后） | 分级 | 内容/数量 | 技术栈 | 整合方式与价值 |
|---|---|---|---|---|---|---|---|
| magicuidesign/magicui | 22.4k | 2026-09-20 | MIT（LICENSE 与 README 确认，无附加限制；Pro 内容不在仓库） | A | `apps/www/registry/magicui/*.tsx` 79 个，shadcn registry（`apps/www/public/r/*.json`） | React 19.1、Next 15、Tailwind 4.1、motion 12、tw-animate-css | 首选。按 registry JSON 导入，保留 MIT 版权行 |
| ibelick/motion-primitives | 6.4k | 2026-09-28 | MIT | A | `components/core/` 33 个原语；registry：`public/c/registry.json` | React 18、Next 15、Tailwind 4、motion 11 | 首选。代码干净，参数暴露好，适合做可调参数模板 |
| nolly-studio/cult-ui | 6.2k | 2026-09-23 | MIT（README 链接指向 Jordan-Gilliam/ui，作者更名）；另有付费 Premium Blocks，不在仓库 | A | `registry/default/ui/` 82 个，`public/r/*.json` 148 个 | React 19.2、Next 16、Tailwind 4.2、motion 12、three 0.168 | shader/hero 类值得取；含 three 的需核对依赖 |
| codse/animata | 2.8k | 2026-09-14 | MIT | A | `animata/**` 约 403 个 tsx（含 stories）：text 97、widget 69、card 56、button 34、background 23、preloader 21…；无 registry | React 19、Next 16、Tailwind 4.3、motion 12 | 数量最大的 A 级来源，需自写 registry 转换 |
| kokonut-labs/kokonutui | 2.1k | 2026-08-20 | MIT | A | `components/kokonutui/` 46 个，`public/r/*.json` | React 19.2、Next 16、Tailwind 4.3、motion 12 | 交互按钮/AI 输入类质量好 |
| karthikmudunuri/eldoraui | 2.0k | 2026-09-26 | MIT | A | `registry/eldoraui` 46 + example 58 + blocks 17 | React 19、Tailwind 4、motion，部分 three/ogl | 与 magicui 重复度高，去重后取文字/背景 |
| educlopez/smoothui | 989 | 2026-09-28 | MIT | A（个别组件依赖 GSAP，须按 B 处理，如 gooey-popover） | `packages/smoothui/components/` 约 200 个，`apps/docs/app/r/registry.json` | React 19、Next 16、Tailwind 4、motion 12、部分 gsap 3.15 | 品类多；逐个检查是否 import gsap |
| SyntaxUI/syntaxui | 985 | 2026-05-18 | MIT；README Credits 称部分组件取自他人（来源许可未核实） | B | 176 个 tsx，无 registry | React 18、Tailwind 3.4、framer-motion 10（旧） | 技术栈旧、来源混杂，低优先级 |
| ui-layouts/uilayouts | 3.6k | 2026-08-23 | MIT | A | `public/r/*.json` 约 335 个 | React 19.2、Tailwind 4.3、motion 12 | 数量大，未逐个审阅质量 |
| iurvish/uselayouts | 602 | 2026-09-28 | MIT | A | `public/r/*.json` 约 66 个 | React、Tailwind 4、motion | 小而精，未逐个审阅 |
| itshover/itshover | 2.7k | 2026-09-26 | Apache-2.0（LICENSE 文本）；README 称 MIT，矛盾 | B | 277 个 registry JSON（动效图标） | React、motion 12、Tailwind 4 | 图标动效是好品类；入库前确认授权，Apache-2.0 需保留 NOTICE |
| keenthemes/reui | 3.6k | 2026-09-16 | MIT | A（未深入） | shadcn registry 组件集 | — | 偏常规 UI，动效含量待查 |
| selemondev/spark-ui、codewithMUHILAN/Lightswind-UI-Library、seraui/seraui | 634 / 1.1k / 1.3k | 2026-09 / 2026-07 / 2026-02 | MIT（LICENSE 头部确认） | A（未深入） | 动效组件集 | — | 只核实了许可证，内容未审阅，备选 |
| shadcn-ui/ui | 124.8k | 2026-09-29 | MIT | A | 基础 UI + registry 协议 | React 19、Tailwind 4 | 我们的 registry 格式应对齐 shadcn schema（`registry.json` / `r/*.json`） |
| cosscom/coss（Origin UI 后继） | 10.6k | 2026-09-29 | **AGPL-3.0 整体**；仅 `apps/origin/`、`apps/ui/` 为 MIT（LICENSING.md） | B | 3325 个文件的 monorepo | — | 只取两个 MIT 目录并逐文件核对 |
| uiverse-io/galaxy | 13.3k | 2024-09-02 | MIT（LICENSE + README，署名"非强制但鼓励"）；元素为用户提交，来源无法逐一核实 | B | 大量纯 CSS/Tailwind 单元素 | HTML+CSS | 适合"零依赖"分类；仓库自 2024-09 未推送，最新内容在 uiverse.io（授权未核实）；建议保留作者署名 |
| arihantcodes/spectrum-ui | 1.5k | 2026-09-21 | Apache-2.0，但自述基于 Aceternity / Magic UI / shadcn 构建 | B/C | — | — | 含 Aceternity 衍生，来源授权不明，只做参考 |
| shadcnstudio/shadcn-studio | 1.9k | 2026-08-20 | LICENSE 文本为 MIT，GitHub 标 `other`；是否含付费内容未核实 | B | shadcn 区块 | — | 暂不整合 |
| **DavidHDev/react-bits** | 48.3k | 2026-09-29 | **MIT + Commons Clause** | **C** | `src/content/` 212 个 JSX：TextAnimations 33、Backgrounds 58、Animations 40、Components 47、Micro 34；另有 TS/Tailwind 变体、`public/r/*.json` | React 19、Tailwind 4、gsap 3.13、three 0.180、ogl、motion 12 | 仅链接/灵感。不复制、不打包、不移植 |
| DavidHDev/canvas-ui | 4.7k | 2026-09-13 | MIT + Commons Clause | C | — | — | 同上 |
| imskyleen/animate-ui | 4.3k | 2025-12-31 | MIT + Commons Clause（禁止以原始形式出售/再分发） | C | 约 581 个 registry JSON | React 19、Base UI beta、motion 12、Tailwind 4 | 仅参考；"改写后是否算原始形式"是灰区，不冒险 |
| Aceternity UI | 未知 | — | 无公开代码仓库；授权未核实 | C | — | — | 仅链接 |
| hover.dev / skiper-ui / 21st.dev | — | — | hover.dev 无仓库；skiper-ui 无 LICENSE；21st.dev 是聚合平台，社区组件授权由作者决定，未核实 | C | — | — | 仅链接；若做 21st 导入，须按组件读作者声明 |
| ibelick/nim | 752 | 2025-12-18 | 无 LICENSE | C | — | — | 默认保留所有权利 |

### 1.2 动效引擎 / 工具

| 仓库 | ★ | 最近推送 | 许可证（核实后） | 分级 | 说明 | 整合方式与价值 |
|---|---|---|---|---|---|---|
| motiondivision/motion | 33.8k | 2026-09-29 | MIT | A | React 动效库（framer-motion 后继），spring 默认值见 3.1 | 作为组件的 peer 依赖。Motion+ 付费示例不在开源仓库，勿抓取 |
| juliangarnier/anime | 73.2k | 2026-08-21 | MIT（v4.5.0） | A | timeline、stagger、SVG、scroll observer | 非 React、纯 JS 效果 |
| pmndrs/react-spring | 29.2k | 2026-09-29 | MIT（v10.x） | A | 物理弹簧 hooks | 备选，与 motion 重叠 |
| formkit/auto-animate | 13.9k | 2026-07-10 | MIT（v0.10.0） | A | 一行代码给列表增删/重排加过渡 | 契合"零代码"叙事 |
| darkroomengineering/lenis | 16.1k | 2026-09-22 | MIT（v1.3.26） | A | 平滑滚动 | 做"滚动手感"模板；reduced-motion 时关闭 |
| theatre-js/theatre | 12.7k | 2024-08-14 | `@theatre/core` Apache-2.0，`@theatre/studio` **AGPL-3.0**（README 原文） | B | 时间轴编辑器；README 称转私有仓库开发，公开仓库自 2024-08 未更新 | 只用 core；不要打包 studio |
| Popmotion/popmotion | 20.2k | 2024-03-12 | 仓库根无 LICENSE，GitHub 显示 null；`packages/popmotion/package.json` 写 "MIT" | B | 已被 Motion 取代，停更 | 不整合 |
| argyleink/open-props | 5.5k | 2026-08-11 | MIT | A | `src/props.easing.css` 81 条缓动变量（含 `linear()` 弹簧） | 直接借用作缓动预设库 |
| d3/d3-ease | 607 | — | BSD-3-Clause（GitHub 标识） | A | 缓动函数标准实现 | 需要 JS 缓动时用 |
| ai/easings.net | 8.7k | 2026-04-07 | GPL-3.0 | C | 缓动可视化站点 | 只做外链 |
| bramus/view-transitions-demos | 61 | 2026-08-17 | Apache-2.0 | A | View Transitions 示例 | 参考做页面转场模板 |
| **GSAP**（greensock/GSAP，npm `gsap`） | 28.7k | 2026-04-13 | 自定义 "Standard 'no charge' license"（<https://gsap.com/standard-license>），GitHub license 为 null。免费含商用，含 SplitText/MorphSVG 等原付费插件；版权属 Webflow，非 OSI | B | v3.15.0 | 见下 |

**GSAP 许可证要点（已读原文）：**
- Permitted Uses：在任何网站/Web 应用/数字界面中实现或使用（含在其他领域与 Webflow 竞争的公司）。
- **Prohibited Uses：在"允许用户无代码构建可视化动画、并鼓励/诱导/实质协助创建与 Webflow 可视化动画构建能力相竞争的方案"的工具中使用 GSAP。**
- 授权由 Webflow 授予，可被终止；条款可随时修改。原文中没有找到关于"再分发/打包 GSAP 示例代码"的明确条款（grep distribut 仅命中 CodePen 链接文字），**再分发是灰区，未核实**。
- 对 Motif：我们的产品是"agent 生成动效（零代码）并调参"，有被视为 visual animation builder 的风险。**建议：GSAP 依赖组件一律标 B 级、单独分类；agent 默认生成 motion / CSS / WAAPI 方案，不默认 GSAP。上线前向 GSAP 邮件确认并留存回复。**
- 用户下载的代码 `import gsap from "gsap"` 属用户自己使用，需在下载页明示由用户遵守 GSAP 许可；不要把 gsap 源码放进我们的仓库。

## 2. 首批建议上架的约 40 个组件/效果（优先 A 级）

路径为仓库内相对路径，已用 `git/trees` 确认存在（部分参数另读了源码）。"依赖"省略 react、tailwind。

| # | 名称 | 来源 | 路径 | 为什么好 | 依赖 |
|---|---|---|---|---|---|
| 1 | Border Beam | magicui | `apps/www/registry/magicui/border-beam.tsx` | 沿边框运动的光束，`offset-path` + motion，size 50、duration 6s、delay 可调 | motion |
| 2 | Blur Fade | magicui | `.../blur-fade.tsx` | 入场三合一（透明度 + 位移 6px + 模糊 6px，0.4s），useInView once | motion |
| 3 | Number Ticker | magicui | `.../number-ticker.tsx` | 弹簧数字滚动，damping 60 / stiffness 100 | motion |
| 4 | Marquee | magicui | `.../marquee.tsx` | CSS 变量（`--duration:40s`、`--gap:1rem`），几乎零 JS | 无 |
| 5 | Dock | magicui | `.../dock.tsx` | macOS 放大 Dock，magnification 60 / distance 140，spring mass 0.1 / stiffness 150 / damping 12 | motion |
| 6 | Animated Beam | magicui | `.../animated-beam.tsx` | 节点连线光束，适合架构图/集成页 | motion |
| 7 | Shimmer Button | magicui | `.../shimmer-button.tsx` | 高光扫过按钮（依赖未逐行核实） | 待核 |
| 8 | Magic Card | magicui | `.../magic-card.tsx` | 鼠标跟随聚光卡片 | motion |
| 9 | Text Animate | magicui | `.../text-animate.tsx` | 按字/词/字符分割的入场预设集 | motion |
| 10 | Hyper Text / Morphing Text | magicui | `.../hyper-text.tsx`、`morphing-text.tsx` | 文字乱码变形、互相变形 | motion |
| 11 | Light Rays / Retro Grid / Aurora Text | magicui | `.../light-rays.tsx`、`retro-grid.tsx`、`aurora-text.tsx` | 背景与标题光效（retro-grid 已含 reduced-motion） | 待核 |
| 12 | Particles / Confetti | magicui | `.../particles.tsx`、`confetti.tsx` | 粒子背景、庆祝效果 | confetti 的第三方依赖许可需核 |
| 13 | Scroll Progress / Scroll Velocity | magicui | `.../scroll-progress.tsx`、`scroll-based-velocity.tsx` | 滚动联动 | motion |
| 14 | Text Effect | motion-primitives | `components/core/text-effect.tsx` | 5 个预设（blur / fade-in-blur / scale / fade / slide），stagger 0.05s，模糊 12px | motion |
| 15 | Magnetic | motion-primitives | `components/core/magnetic.tsx` | 磁吸悬停，spring stiffness 26.7 / damping 4.1 / mass 0.2，range 100 | motion |
| 16 | Tilt | motion-primitives | `components/core/tilt.tsx` | 3D 倾斜，rotationFactor 默认 15 | motion |
| 17 | Spotlight | motion-primitives | `components/core/spotlight.tsx` | 鼠标跟随聚光，size 200 | motion |
| 18 | Morphing Dialog | motion-primitives | `components/core/morphing-dialog.tsx` | 共享布局动画（layoutId），FLIP 的典型 | motion |
| 19 | Sliding Number / Animated Number | motion-primitives | `components/core/sliding-number.tsx`、`animated-number.tsx` | 逐位滚动数字 | motion |
| 20 | Infinite Slider | motion-primitives | `components/core/infinite-slider.tsx` | 无限轮播 | motion（及测量库，须核） |
| 21 | Text Morph / Scramble / Roll / Loop | motion-primitives | `components/core/text-morph.tsx` 等 | 文字动效一组 | motion |
| 22 | Glow Effect / Border Trail / Progressive Blur | motion-primitives | `components/core/glow-effect.tsx`、`border-trail.tsx`、`progressive-blur.tsx` | 发光、边框光带、渐进模糊 | motion |
| 23 | Transition Panel / Toolbar Expandable | motion-primitives | `components/core/transition-panel.tsx`、`toolbar-expandable.tsx` | 面板切换、展开工具栏 | motion |
| 24 | Dynamic Island | cult-ui | `apps/www/registry/default/ui/dynamic-island.tsx` | 形变，spring 形变示范 | motion |
| 25 | Family Drawer / Expandable Screen | cult-ui | `.../family-drawer.tsx`、`expandable-screen.tsx` | 多视图抽屉、全屏展开 | motion |
| 26 | Hero Liquid Metal / Distorted Glass / Shader Lens Blur | cult-ui | `.../hero-liquid-metal.tsx`、`distorted-glass.tsx`、`shader-lens-blur.tsx` | shader 类，适合我们的 shader 分类。依赖未核实 | 待核 |
| 27 | Particle Button | kokonutui | `components/kokonutui/particle-button.tsx` | 点击粒子爆发 | motion |
| 28 | Hold Button | kokonutui | `.../hold-button.tsx` | 长按填充确认 | motion |
| 29 | Liquid Glass Card | kokonutui | `.../liquid-glass-card.tsx` | 液态玻璃卡片 | 待核 |
| 30 | Background Paths / Beams Background | kokonutui | `.../background-paths.tsx`、`beams-background.tsx` | SVG 路径流动、光束背景 | motion |
| 31 | Card Stack / Glitch Text / Shimmer Text | kokonutui | `.../card-stack.tsx`、`glitch-text.tsx`、`shimmer-text.tsx` | 常用展示件 | motion |
| 32 | Number Flow | smoothui | `packages/smoothui/components/number-flow/index.tsx` | 数字翻滚 | 待核 |
| 33 | Holographic Foil / Liquid Metal | smoothui | `packages/smoothui/components/holographic-foil/`、`liquid-metal/` | 全息箔、液态金属 | 待核 |
| 34 | Boids Ecosystem | animata | `animata/background/boids-ecosystem.tsx` | 群体行为背景，辨识度高（性能未审） | 待核 |
| 35 | Blurry Blob / Shooting Stars / Moving Gradient | animata | `animata/background/*.tsx` | 轻量背景 | 待核 |
| 36 | Flip Card / Card Spread / Glowing Card | animata | `animata/card/flip-card.tsx` 等 | 常见卡片交互 | 待核 |
| 37 | Gooey Filter | smoothui | `packages/smoothui/components/gooey-filter/` | SVG 粘连滤镜（同仓库 gooey-popover 依赖 GSAP，勿混） | 待核 |
| 38 | Auto-animate 列表 | formkit/auto-animate | npm `@formkit/auto-animate` | 一行代码列表过渡 | 自身 |
| 39 | Lenis 平滑滚动 | darkroomengineering/lenis | npm `lenis` | 滚动手感基础设施 | 自身 |
| 40 | View Transitions 页面转场 | bramus/view-transitions-demos | 仓库示例 | 原生 API，Apache-2.0 | 无 |
| 41 | 缓动预设包 | open-props | `src/props.easing.css` | 81 条缓动，含 `linear()` 弹簧 | 无 |

说明：标"待核"的依赖我只看了文件名，没有逐个读源码；第三方间接依赖的许可证入库前需自动扫描。

## 3. 动效细节与优化

### 3.1 可做成调参项的默认值（来自读到的源码）

| 参数 | 默认/范围 | 来源 |
|---|---|---|
| motion 弹簧默认 | stiffness 100、damping 10、mass 1；按时长定义时 duration 800ms、bounce 0.3、visualDuration 0.3s；阻尼比 = 1 − bounce，minDamping 0.05、maxDamping 1；duration 上限 10s | `motiondivision/motion` `packages/motion-dom/src/animation/generators/spring.ts` |
| 磁吸 | stiffness 26.7、damping 4.1、mass 0.2，range 100px | motion-primitives `magnetic.tsx` |
| Dock 放大 | spring mass 0.1 / stiffness 150 / damping 12；magnification 60（magicui）或 80（motion-primitives），distance 140–150 | 两个 `dock.tsx` |
| 数字弹簧 | damping 60 / stiffness 100 | magicui `number-ticker.tsx` |
| 入场 blur-fade | duration 0.4s、offset 6px、blur 6px、useInView once | magicui `blur-fade.tsx` |
| 文字 stagger | staggerChildren 0.05s；模糊 12px；fade-in-blur 位移 y 20px | motion-primitives `text-effect.tsx` |
| 光束循环 | duration 6s，size 50 | magicui `border-beam.tsx` |
| Marquee | 40s/圈，gap 1rem | magicui `marquee.tsx` |
| 3D 倾斜 | rotationFactor 15 | motion-primitives `tilt.tsx` |
| open-props 缓动 | ease-out-3 `cubic-bezier(0,0,.3,1)`，ease-in-out-3 `cubic-bezier(.5,0,.5,1)`，ease-out-5 `cubic-bezier(0,0,0,1)`；`--ease-spring-1..5` 为 `linear()` 弹簧（1 克制，数字越大过冲越大，spring-4 峰值约 1.215） | open-props `src/props.easing.css` |

**以下是我们的建议起点（经验规则，非上述来源的数字），需后续在真机验证：**
- 微交互（按钮、开关、悬停）120–200ms；弹层/面板进入 200–350ms；退出比进入短约 20–30%；大面积转场 ≤ 500ms。
- 进入用 ease-out，退出用 ease-in，位置往返用 ease-in-out；进入不要用 ease-in。
- 弹簧：UI 反馈阻尼比约 0.7–1（bounce 0–0.3）；装饰动效才用低阻尼。motion 里用 `visualDuration + bounce` 比裸 stiffness/damping 更易调。
- 列表 stagger 30–60ms/项，总 stagger 封顶约 400ms。
- 循环装饰动画周期 ≥ 4s；离屏（IntersectionObserver）暂停。

### 3.2 性能规则（官方资料，链接均已确认可访问）

- **只动合成层属性**：优先 `transform`、`opacity`；避免动画 `width/height/top/left/margin`（触发布局）。<https://web.dev/articles/stick-to-compositor-only-properties-and-manage-layer-count>、<https://web.dev/articles/rendering-performance>
- **FLIP**：先测量、用 transform 反向、再播放，把布局动画变成 transform 动画。<https://aerotwist.com/blog/flip-your-animations/>；motion 的 `layout` / `layoutId` 已内置（见 morphing-dialog）。
- **will-change 少用，用完移除**：长期设置会占用合成层内存。<https://developer.mozilla.org/en-US/docs/Web/CSS/will-change>
- **prefers-reduced-motion**：降级不是全部关掉，而是把位移/缩放/视差/自动循环换成淡入淡出或静态，保留有功能意义的反馈。<https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion>、<https://web.dev/articles/prefers-reduced-motion>。motion 中用 `useReducedMotion()` 或 `MotionConfig reducedMotion="user"`。**市场模板应统一带这一层。**
- **滚动驱动动画**：CSS `animation-timeline: scroll()/view()`，需 `@supports` 回退。<https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations>、<https://scroll-driven-animations.style>（该站示例许可证未核实）
- **`linear()` 生成弹簧/回弹曲线**：无需 JS。<https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function/linear>；生成器 <https://linear-easing-generator.netlify.app>（许可证未核实）。
- **View Transitions API**：原生状态/页面转场，避免手写 FLIP。<https://developer.chrome.com/docs/web-platform/view-transitions>
- **输入响应**：动画不应拖累 INP。<https://web.dev/articles/inp>
- 经验规则（无单一权威来源，标注为经验）：帧预算 60fps 约 16.7ms、120fps 约 8.3ms；避免每帧读写交错；canvas/shader 限制 DPR（建议封顶 2）、离屏和页面隐藏时暂停；大面积不做 `blur()` / `backdrop-filter` 动画（blur-fade 的 6px、text-effect 的 12px 只适合小元素）。

### 3.3 可做成 skill 的检查清单
1. 是否只动 transform/opacity？2. 是否有 reduced-motion 分支？3. 弹簧是否用 bounce/visualDuration 暴露？4. 离屏是否暂停？5. 进入/退出缓动是否明确？6. 长列表 stagger 是否封顶？7. shader/canvas 是否限制 DPR 与帧率？

## 4. 风险与未知

- **react-bits / animate-ui 的 Commons Clause 不可绕过**：即使"重写"，若逐行对应也可能构成 "ported version"。团队内不要参考其源码仿写同名同形组件，只放链接。
- **GSAP**：再分发条款未在原文找到明确规定；"visual animation builder" 边界模糊。上线前书面确认。
- **依赖许可证未逐个核实**：canvas-confetti、测量库、cobe、three/ogl 及各 shader 库。入库流水线应自动收集 `package.json` 依赖并扫描许可证。
- **署名**：MIT 要求保留版权与许可文本。registry JSON 通常不带 LICENSE，整合时生成 NOTICE，并在组件页展示作者、来源仓库与 commit。
- **uiverse / 21st.dev / Aceternity registry** 的社区/网站授权未核实，不要爬取。
- **coss / itshover 授权不一致**：需联系作者或逐文件确认。
- **许可证会变**：react-bits 与 animate-ui 都在 MIT 之外附加了 Commons Clause。整合时固定采集时的 commit SHA 并保存当时的 LICENSE 副本。
- **技术栈碎片**：motion 11 vs 12、Tailwind 3 vs 4、tailwindcss-animate vs tw-animate-css、Base UI vs Radix。建议基线 React 19 + Tailwind 4 + motion 12。
- **未做的事**：没有克隆或运行任何组件，没有测量真实性能；"约 N 个"来自目录文件数估计（含 demo/stories 可能重复计数）；未审阅 reui、spark-ui、Lightswind、seraui、shadcn-studio 的具体组件质量；未核实 eldora-ui 的官方站点与仓库 `karthikmudunuri/eldoraui` 的关系以外的信息。
