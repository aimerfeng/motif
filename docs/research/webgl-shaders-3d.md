# WebGL / Shader / 3D / Canvas 特效：GitHub 来源调研

调研日期：2026-09-29。所有星数/推送时间来自 `gh api repos/OWNER/REPO`，许可证均已读取 LICENSE 原文（或说明为何读不到）。未能核实的内容会明确标注「未核实」。

分级说明：**A** = 宽松许可，可整合（保留署名）；**B** = 代码宽松但含受限部分（素材/字体/依赖/第三方来源）；**C** = 仅参考/链接，不整合代码。

---

## 1. MengTo/threeui 深度解析

- 检查的 commit：`68802d5428071ada5c20db8094b1649e6bb770ed`（"Sync Community package from ThreeUI (#14)"），浅克隆于 `sources/_clones/threeui`。
- ★ 6312，MIT（LICENSE：`Copyright (c) 2026 Meng To`），最近推送 2026-09-03，未归档。
- 定位：这是 ThreeUI 商业产品的 **"Community 免费子集"**，由私有主仓库自动同步（`scripts/sync-community-from-main.mjs`，失败即关闭，过滤掉 Pro/Beta）。主站完整目录 `FULL_THREEUI_COLLECTION_COUNT = 378`，公开仓库只含其中一部分；Pro 通过 OAuth CLI 付费下发（`@designcodeio/threeui-cli`，仅安装器，MIT，不含 Pro 源码）。
- 赞助模式：README 顶部有付费赞助位（$500-$3000/月）。

### 1.1 仓库结构

| 路径 | 内容 |
|---|---|
| `src/shaders/<name>/` | 每个组件一个目录（约 50 个），含 `.tsx` 渲染器、`*Shaders.ts`（GLSL 字符串）、`sources/*.html`（自包含的原始 HTML 场景），共 323 个 src 文件（70 html / 57 tsx / 29 ts / 8 js / 8 css / 5 webp / 3 svg / 1 woff2） |
| `src/data/shaders.tsx` | 生成文件（约 1.7 万行，含 CRLF），`READY_SHADERS` 数组：每项含 id、category、label、tags、description、runtime、origin、sourceFiles、contract（props 说明）、controls（可调参数）、variants |
| `src/package-components/*.ts` | 约 107 个薄包装，一个变体一个 npm 子路径入口 |
| `src/components/` | 目录站 UI：BrowsePage、SearchDialog、ShaderDocumentation（详情页 + 控件 + Code 标签）、PreviewFpsMeter、`buildSkillMarkdown.js`（每个组件一份 agent skill 文本）、McpDocumentation |
| `public/source-code.json` | 32.8MB，Code 标签用的完整源码包（43 个组件，含 sha256/行数/assets） |
| `public/*.html`、`public/landing-pages/`、`public/sketchbook/` | 整页 HTML 场景及其图片/字体/three.min.js |
| `assets/` | 仅 `preview.jpg`、`preview.webm`（仓库宣传图） |
| `scripts/` | sync、generate-library-entry、audit-public/audit-build（发布边界检查）、library-package.test、package-install-smoke |
| `packages/cli/` | Pro 安装 CLI（MIT，不含 Pro 内容） |

### 1.2 打包方式

- npm 包：**`@designcodeio/threeui`**，v1.2.0，license MIT，unpacked 约 54.7MB（`npm view` 已确认）。
- `vite.lib.config.js`：库模式、仅 ES 格式、`preserveModules`；`react/react-dom/three/three128/three165` 为 external；入口 = `src/index.ts` + `src/package-components/*.ts`。
- 导出：`.`、`./style.css`、`./components/*`、`./assets/*`。peerDependencies：react >=18 <20、react-dom、three >=0.149 <1；dependencies 里同时装了 `three@0.128.0`（别名 three128）和 `three@0.165.0`（three165），因为不同组件的原始源码依赖不同 three 版本（r128/r134/r136/r149/r160/r165 都出现过）。
- 整页 HTML 类组件需要把 `lib-dist/assets/` 拷到应用 public 目录，或用 `sourceUrl` / `assetBaseUrl` prop 覆盖。
- **没有** r3f/drei/postprocessing 依赖（grep import 结果：react 77 次、three128/three165/three 少量、`three/addons/postprocessing/*` 1 处）。全部是原生 three.js / 原生 WebGL / Canvas 2D / DOM+CSS。这一点对 Motif 很重要：可以做到零依赖。

### 1.3 数量（注意 README 与数据不一致）

- 我从 `shaders.tsx` 解析：**43 个父组件，104 条路由记录（其中 61 条是 variantOf 子条目），163 个变体**。与 `public/community-sync-report.json`（43 / 104 / 163，生成于 2026-08-31）一致。
- README 声称「50 个父组件、111 条路由、141 个变体 + 23 个单例 = 164」，与代码数据不符（README 可能滞后或统计口径不同）。**以代码数据为准**，此差异未能解释。
- 类别（父级条目按数据里的 category 字段）：Landing Pages 2、Hero 3、Backgrounds（含 Predictive Arc/CRT/Elements 等）、Text Animation、Buttons（Rectangle Buttons 单个家族就有 22 个变体）、UI Elements（Brand Orbs 23 个变体）、Three.js、Sections、CSS。104 条记录的类别分布：Backgrounds 29、Buttons 20、Three.js 20、Text Animation 14、UI Elements 9、CSS 5、Hero 3、Landing Pages 2、Sections 2。

### 1.4 目录/预览/调参机制

- 目录：`READY_SHADERS` 静态数组 → `createCatalogResults` 把 父组件×变体 展开成浏览结果；搜索基于 id/label/tags/description/runtime 的归一化匹配。路由 `routes.js`，SEO `seo.js`。
- 预览：React 组件懒加载（`lazy(() => import(...))`）实时渲染；整页 HTML 类用「sandboxed full-document renderer」（iframe，见 `passes` 字段）。缩略图/预览视频取自 `https://threeui.com/thumbnails/*.jpg`，**不在仓库内**。
- 调参：`controls` 是声明式 schema，种类 `range`（min/max/step/default）、`choice`、`checkpoint`（可视化选项）、`color`、`text`。常见 key：speed、hue、saturation、brightness、opacity、size、density、length、particleAmount、mode(dark/light)、noiseScale、morph、metal、mouseAmount、camera、glow、headingFont/bodyFont/primaryColor 等。`contract` 字段描述 props（如 `pixelRatio: adaptive ≤ 2`）。
- 性能实践：`liquid-form` 里 `Math.min(devicePixelRatio, 1.5)`；`IntersectionObserver`+`visibilitychange` 暂停出现在 PreviewFpsMeter、AnimatedTopDock、BellField、BrandOrbs 等（约 20 个文件出现 dpr/IO 相关调用，并非所有组件都有）。
- **agent skill**：`src/components/buildSkillMarkdown.js` 为每个组件内置一段 `name: add-<id>` 的 SKILL 文本（"Build X from its verified source ... Use when Codex needs to implement..."），并有 `/api/mcp`（search_catalog / get_catalog_item / get_item_source / get_item_prompt）。与 Motif「复制匹配的 agent skill」几乎同构，是直接竞品/参照。

### 1.5 三份许可文件逐字要点

**ASSET-LICENSES.md**
1. 「Community 组件包含 ThreeUI 自制的图片、纹理与场景素材……这些文件属于 MIT 许可的 Community 发布。」`assets/preview.jpg` / `preview.webm` 也是 MIT。
2. 第三方素材：Fragment Mono、Instrument Serif、Newsreader、Lexend、Onest 字体 = SIL OFL 1.1（版权声明与许可证文本在 FONT-LICENSES.md）；打包的 Three.js 运行时 = MIT（保留上游版权/SPDX 头）。
3. 「公开同步显式移除了私有源快照使用的 SF Pro 字体文件，改用系统字体回退。」（我 grep 到 SF Pro 仅作为 font-family 回退名出现，仓库内无 SF Pro 字体文件——已核实。但 `shaders.tsx` 中 Rectangle Buttons 的 `asset` 描述仍写着「5 local SF Pro font subsets」，是陈旧描述，需忽略。）
4. **外部目录媒体**：缩略图/预览视频从 `https://threeui.com` 加载，「不复制进本仓库，且**不在本仓库 MIT 许可范围内**」。→ 我们不能拷贝其缩略图/预览视频。
5. 部分 HTML 场景引用公共 CDN 的开源库及 ThreeUI 托管的公共图片/视频端点，这些远程文件不随仓库分发。
6. 「不包含任何 Pro 或 Beta 组件源码或组件专属素材。」

**FONT-LICENSES.md**：列出 5 套字体的版权行（Fragment Mono 2022、Instrument Serif 2022、Newsreader 2020、Lexend 2018（含保留字体名 "RevReading Lexend"）、Onest 2021），并附完整 OFL 1.1 文本。OFL 要点：可随软件打包/再分发/修改，但**不得单独出售字体本身**；每份副本须带版权声明+许可证；修改版不得使用保留字体名；字体须始终以 OFL 分发（不能改成 MIT）。仓库内实际字体文件：`src/shaders/fonts/fragment-mono.woff2`、`public/landing-pages/inner-green-assets/lexend-latin.woff2`、`public/landing-pages/meng-to-sketchbook/instrument-serif(.italic).woff2`、`newsreader.woff2`（及 `secret-pathways-assets/fonts.css`，其字体来源我未逐个核实）。

**THIRD_PARTY_NOTICES.md**：React/React DOM（MIT）、Vite（MIT）、Three.js（MIT，打包运行时保留许可头）、上述 OFL 字体、caniuse-lite（CC BY 4.0，仅开发工具链数据）。并说明 Community 源码索引可能引用单个源文件中的标准包 import；Pro/Beta 模块、鉴权、支付运行时不分发。

### 1.6 我们能否再分发？结论

**结论：B 级。**
- 组件代码（TSX/GLSL/HTML）与 ThreeUI 自制图片：MIT，可整合，需保留 `Copyright (c) 2026 Meng To` 与 MIT 文本。
- 5 套 OFL 字体：可再分发，需带版权声明 + OFL 文本，不得单卖字体，不得改名后声称原名。
- 缩略图/预览视频（threeui.com）：**不可拷贝**，我们需自己渲染缩略图。
- 品牌标记风险（**重要发现，仓库许可证不能解决**）：`elements` 组件内嵌 OpenAI / Anthropic / Claude 的矢量路径（描述写 "Embedded OpenAI vector path"、"Embedded Anthropic vector path"、"Embedded Claude vector path"）；`brand-orbs` 提供 23 个品牌标记点阵球（其 HTML 中出现 Claude/Gemini/OpenAI 字样）。MIT 无法授予第三方商标/logo 权利。**不建议整合这些**，或替换成通用形状。
- 来源不明风险：`origin` 字段显示大量条目来自「Neuform export」（42 条 + 若干混合）、「Owner-selected HTML」（18）、「Sable V1」、「The Bookshelf」、「Elemental Marks」、「Text on a Path / II」、「Aura local HTML」、「MengTo/towers」。这些是作者声明「owner-supplied」，但 Neuform 看起来是某个设计工具的导出；作者是否拥有全部原创权、是否含第三方代码，**无法从仓库验证**。MIT 声明由作者负责，我们至多依赖其声明并保留署名。建议优先选纯 GLSL/Canvas 的小型效果，避免整页落地页类。
- 外部依赖：HTML 场景里用了 `cdn.tailwindcss.com`（46 处）、iconify（35）、**GSAP 3.12.x 从 cdnjs（29+26 处）**——GSAP 不是 MIT（GSAP 标准许可，个人/商用免费但限制「构建与其竞争的可视化动画工具」，我未逐条核实当前条款），且有 `static.cloudflareinsights.com` 分析信标（5 处出现在 source-code.json / 少量 html 内）与 `cdn.skypack.dev/three@0.136.0`、`shaders@3.0.445`（jsdelivr，即 paper-design/shaders 的 npm 包）。整合时须剥离分析信标并本地化依赖。
- 所有品牌落地页（Kage / Sylva / Sketchbook 含新加坡地标插画 / Working Volumes / Field Manuals 书封）是内容性作品，**不适合放进通用组件市场**。

### 1.7 全部父组件清单（43 个，数据自 `src/data/shaders.tsx`）

「可调参数」为解析出的 controls key（最多前 8 个）；整页 HTML 类只暴露字体/字号/主色。

| # | 组件 | 分类 | 运行时 | 变体数 | 可调参数(controls key) | 来源(origin 字段) | 说明 |
|---|---|---|---|---|---|---|---|
| 1 | Kage | Landing Pages | Full HTML + DOM/CSS + Three.js | 0 | headingFont, bodyFont, headingWeight, bodyWeight, primaryColor, headingSize, bodySize, headingLetterSpacing | Owner-supplied HTML Pages source | The complete authored Kage temple experience, preserved as an interactive full-page document with its original navigation, scroll scenes, an |
| 2 | Complete Shelf | Hero | Full HTML + DOM/CSS + Three.js r165 | 0 | headingFont, bodyFont, headingWeight, bodyWeight, primaryColor, headingSize, bodySize, headingLetterSpacing | Owner-supplied HTML Pages source | The complete Working Volumes bookshelf page with all seven tools, its responsive editorial interface, and authored Three.js presentation. |
| 3 | Bestsellers Book Showcase | Hero | Full HTML + DOM/CSS + embedded media | 0 | headingFont, bodyFont, headingWeight, bodyWeight, primaryColor, headingSize, bodySize, headingLetterSpacing | Owner-supplied HTML Pages source | The complete Field Manuals book showcase, preserved unchanged with its editorial layout, authored motion, interactions, and embedded media. |
| 4 | Sylva | Hero | Full HTML + DOM/CSS + local Three.js | 1 | headingFont, bodyFont, headingWeight, bodyWeight, primaryColor, headingSize, bodySize, headingLetterSpacing | Owner-supplied HTML Pages source | The complete Sylva Living Green page, preserved with its Three.js scene, local typography, card imagery, and embedded liquid-metal buttons.  |
| 5 | Sketchbook | Landing Pages | Full HTML + DOM/CSS + JavaScript | 0 | headingFont, bodyFont, headingWeight, bodyWeight, primaryColor, headingSize, bodySize, headingLetterSpacing | Owner-supplied HTML Pages source | A tactile personal portfolio built as a Singapore sketchbook, with nine illustrated plates, curled page turns, a draggable magnifying glass, |
| 6 | Predictive Arc | Backgrounds | Canvas 2D + Raw WebGL + Three.js r128 | 8 | mode, speed, hue, saturation, brightness | Neuform export | Eight animated arc, signal, ribbon, void, and halftone scenes collected in one Canvas 2D, raw-WebGL, and Three.js family. |
| 7 | Liquid Form | Backgrounds | Raw WebGL | 0 | speed, morph, noiseScale, mouseAmount, metal, camera, tintHue, tintAmount | Neuform export | A centered silver ray-marched liquid form with authored studio reflections and pointer-responsive camera drift. |
| 8 | CRT | Backgrounds | Raw WebGL + Canvas 2D | 4 | speed, typeSpeed, motion, hue, saturation, brightness, opacity | Neuform export | One sharpened curved-glass CRT tube driving four screens: the Matrix-era boot terminal, a monochrome film leader, a noise-torn blue signal f |
| 9 | Globe | Backgrounds | Raw WebGL + Canvas 2D | 1 | speed, scale, smokeScale, smokeStrength, smokeSpeed, hue, saturation, glow | HTML Pages + Neuform export | The original layered FBM energy sphere with translucent rim glow and depth-aware star field. |
| 10 | Spark Badge | Backgrounds | Canvas 2D | 1 | speed, particleAmount, rainAmount, turbulence, spread | HTML Pages | A luminous credential badge held together by curl-noise embers, carved typography, rain occlusion, waterline sparks, and an adaptive particl |
| 11 | Elements | Backgrounds | Raw WebGL2 + Canvas 2D | 5 | speed, size, particleAmount, hue, saturation, brightness, opacity | Elemental Marks + HTML Pages + Neuform export | Water, lightning, fire, condensation, and a painterly generative tree collected as one elemental family across WebGL2 and Canvas 2D. |
| 12 | Typography Vortex | Text Animation | Canvas 2D | 0 | mode, speed, ringGrowth, opacity, dissolveRadius, particleAmount, suctionDuration | Sable V1 | Sable’s complete rotating typography vortex with crisp prerendered rings, drifting glyphs, pointer dissolution, particle dust, and click suc |
| 13 | Semantic Bloom | Text Animation | Canvas 2D + DOM/CSS | 0 | mode, text, size, opacity | Owner-selected HTML | A customizable Codex wordmark that draws a viscous particle organism toward its letters, illuminating the text as the network searches and r |
| 14 | Text Path Studies | Text Animation | Canvas 2D | 6 | mode, scale, opacity, hue, saturation, brightness | Text on a Path collection | Six interactive Canvas 2D typography studies spanning a globe, flowing outlines, morphing glyphs, cloth physics, ripples, and a particle sph |
| 15 | Gallery Heading | Text Animation | Canvas 2D | 4 | mode, font, weight, headlineSize, hue, saturation, brightness | Owner-selected HTML | An oversized headline ringed by twelve 4:3 plates — one flat colour each, shaded by a procedural noise field rather than a gradient — that h |
| 16 | Shader Buttons | Buttons | Raw WebGL + Canvas 2D + CSS | 6 | mode, hue, saturation, brightness | Neuform + owner-selected HTML | Six authored shader and canvas button treatments collected into one interactive family. |
| 17 | Rectangle Buttons | Buttons | DOM + CSS | 22 | mode, hue, saturation, brightness | HTML Pages | Twenty-two authored rectangle-button and animated CTA treatments collected into one family. |
| 18 | Circle Buttons | Buttons | DOM + CSS | 3 | mode, hue, saturation, brightness | ThreeUI | Three compact circular icon controls using the exact Dark Glass, Launch, and Dot Border material systems. |
| 19 | Liquid Metal Button | Buttons | Raw WebGL 2 + DOM/CSS | 3 | - | Owner-selected HTML | A prismatic liquid-metal control in Sign up pill, Liquid Orb, and configurable Play Circle variants, with pointer-following bloom and press  |
| 20 | Character Carousel | UI Elements | DOM + CSS | 2 | speed, scale, opacity, hue, saturation, brightness | HTML Pages | Two authored editorial character-card carousels collected as a light filmstrip and a dark responsive wave. |
| 21 | Gallery | UI Elements | Three.js r149 | 0 | speed, scale, opacity, hue, saturation, brightness | Aura local HTML | The isolated Vantrix hero image ribbon: sixteen curved editorial panels orbiting a vertical cylindrical rail on a quiet paper grid. |
| 22 | Sylva Living World | Three.js | Three.js r149 | 1 | - | Owner-selected HTML Pages scene | The original procedural moss-root world with pale flowers, ferns, drifting pollen, scan light, and a landing butterfly. |
| 23 | Temple Night | Three.js | Three.js r149 | 1 | - | HTML Pages | Kage’s procedural Kyoto mountain temple after dark, with the exact authored architecture, rain, mist, leaves, pointer wisps, camera composit |
| 24 | Landscape | Three.js | Three.js r149 | 7 | - | MengTo/towers | A tower-free procedural terrain whose light, sky, fog, stars, rain, lightning, snow, grass, and stones move through seven authored environme |
| 25 | Country Towers | Three.js | Three.js r149 + Canvas 2D | 6 | - | MengTo/towers | Six country-specific towers assembling above a procedural landscape: Japanese, Chinese, Vietnamese, Thai, Khmer, and Ottoman. |
| 26 | Bookshelf | Three.js | Three.js r165 | 0 | - | The Bookshelf | The exact seven-volume Bookshelf collection with its authored room, carousel shelf, individual cover artwork, foil, pages, inspection, openi |
| 27 | Structure Flow | Three.js | Three.js r128–r160 | 13 | speed, pointSize, opacity, maskStart, maskSolid | Neuform export | Thirteen authored Three.js field studies collected as one family, spanning particle domes, horizons, orbital systems, matrices, topology, fl |
| 28 | Warp Field | Three.js | Three.js r128 | 4 | speed, streakOpacity, tileOpacity, fov, hue, saturation, brightness | Neuform export | Nexus’s focused hero warp: 400 emerald additive streaks and 40 luminous tiles streaming through an authored deep-space fog field. |
| 29 | Engraved Certificate | UI Elements | Canvas 2D + DOM/CSS | 0 | hue, saturation, brightness | Neuform export | A responsive engraved certificate: plate field, dual guilloche rosettes, and a drifting harmonic pass that auto-cycles through four cam stat |
| 30 | Woven Cloth | Three.js | Three.js r160 | 4 | hue, saturation, brightness | Neuform export with first-party companion cloths | A Three.js woven-cloth simulation with Woven Cloth typography printed into its procedural textile so every letter deforms with the fabric, a |
| 31 | Performance Gauges | CSS | DOM + CSS | 4 | hue, saturation, brightness | Neuform export | Four layered CSS instruments — tachometer, speedometer, turbo boost, and EV power — each isolated to one full-bleed dial with polar tick geo |
| 32 | Uplink Loader | CSS | DOM + CSS + JavaScript | 0 | - | Owner-selected HTML | A cinematic secure-uplink loader with stepped progress, illuminated telemetry ticks, neon readouts, technical corner markers, mirrored side  |
| 33 | Koi Studies | CSS | DOM + CSS 3D + Canvas 2D + WebGL | 0 | - | Owner-supplied HTML Pages source | A tactile stack of three Japanese koi studies with CSS 3D depth, pointer tilt, drag and keyboard navigation, pixel-mask reveals, and animate |
| 34 | Article Headings | Text Animation | DOM/CSS + Canvas 2D | 3 | mode, duration, stagger, scrambleLength, preserveChance, tailChance | Sable V1 + owner-selected HTML + Neuform export | Three expressive text treatments collected in one family: a chromatic intro, a particle wordmark, and an audio-reactive identity lockup. |
| 35 | Animated Top Dock | CSS | DOM + CSS + WebGL + Three.js r128 | 4 | proximity, spring, damping, widthGrowth, heightGrowth, drop | Sable V1 + ThreeUI original | Sable’s proximity-spring menu in four fits: the authored centred dock, a modern command bar, a fitted pixel-terminal strip, and a vertical r |
| 36 | Sketchbook | CSS | DOM + CSS 3D | 0 | - | Sketchbook | The exact Singapore paper sketchbook with nested-strip page curls, direct dragging, tilt, zoom, a movable magnifying glass, and its complete |
| 37 | Constellation Field | Backgrounds | Canvas 2D + Raw WebGL | 8 | mode, speed, size, strokeWidth, length, density, opacity, hue | Neuform export | A family of particle networks, gateways, interface lines, defense traces, and topographic fields gathered into one configurable collection. |
| 38 | Portal Field | Backgrounds | Three.js r134 + Raw WebGL + Canvas 2D | 5 | speed, size, length, density, opacity, hue, saturation, brightness | Neuform export + HTML Pages | Five ambient field backgrounds collected across Three.js, raw WebGL, and Canvas 2D renderers. |
| 39 | Diagnostics Panel | UI Elements | Canvas 2D | 3 | mode, speed, size, opacity, hue, saturation, brightness | Neuform export | Three diagnostic illustration variants — layered planes, node cubes, and a flowing mesh — each isolated without page chrome or copy. |
| 40 | Skeuomorphic Toggle | UI Elements | DOM/CSS + Three.js + Raw WebGL | 4 | mode, speed, size, opacity, hue, saturation, brightness | Preserved Neuform export + ThreeUI original variants | Four takes on one switch: the preserved tactile skeuomorphic export plus flat modern, Three.js glass, and shader-lit treatments, each matchi |
| 41 | Laser | Backgrounds | Raw WebGL | 4 | speed, size, length, density, opacity, hue, saturation, brightness | ThreeUI original variants + preserved Neuform export | Four pointer-reactive laser scenes spanning a preserved matrix junction, atmospheric blade, vanishing array, and halftone relay. |
| 42 | Wireframe Forms | UI Elements | Canvas 2D | 3 | mode, speed, size, length, density, opacity, hue, saturation | Neuform export | A family of rotating wireframe forms, with the cube, crossed cylinders, and nested sphere isolated as individual variants. |
| 43 | Brand Orbs | UI Elements | Canvas 2D | 23 | size, mode, speed | HTML Pages — inspired by Thinking Orbs | Twenty-three animated brand marks rebuilt as small and medium dimensional dot orbs for AI status, product activity, and compact loading stat |

---

## 2. 主表：来源仓库与许可证（核实后）

「核实方式」：**读原文** = 我读了 LICENSE 文本；**仅 API** = 只有 GitHub 的 spdx_id，未读全文。

| 仓库 | ★ | 最近推送 | 许可证（核实后） | 分级 | 内容/数量 | 技术栈 | 整合方式与价值 |
|---|---|---|---|---|---|---|---|
| MengTo/threeui | 6312 | 2026-09-03 | MIT（读原文）+ 字体 OFL 1.1；缩略图/预览不在许可内；含品牌 logo 路径 | **B** | 43 父组件 / 104 路由 / 163 变体；含 skill/MCP 机制 | 原生 three r128-r165 / raw WebGL / Canvas2D / DOM+CSS | 选取纯 GLSL/Canvas 效果整合，保留 MIT 头；避开品牌 logo、整页落地页、CDN(GSAP/Tailwind/分析信标)。其 controls schema 与 skill 文本结构值得借鉴 |
| paper-design/shaders | 3492 | 2026-09-29 | **Apache-2.0**（读原文）+ `NOTICE`（"Copyright 2026 Paper / Powered by Paper Shaders"）；个别 shader 头注释指向 Shadertoy 原算法 | **A**（注意 2 个 shader） | 33 个 shader（mesh-gradient、grain-gradient、smoke-ring、liquid-metal、god-rays、halftone-cmyk、fluted-glass、water、gem-smoke 等） | 零依赖 WebGL2；`@paper-design/shaders` v0.0.81 与 `-react` | **首选**。整合须保留 Apache 许可证 + NOTICE，修改的文件标注改动。`perlin-noise.ts` 头写 "Original algorithm: shadertoy.com/view/NlSGDz"，`voronoi.ts` 写 "…/view/ldl3W8"——Shadertoy 默认 CC BY-NC-SA，Paper 是否取得授权未核实，这两个先降为 C。`docs/src/shader-defs/*-def.ts` 有参数 min/max/step 定义、`docs/registry.json`（shadcn registry）、`generate-llms-txt.ts`，可直接借鉴调参 schema。README 要求 pin 版本（0.0.x 会有破坏性变更） |
| ruucm/shadergradient | 2620 | 2026-09-23 | **MIT**（`packages/shadergradient/package.json` 写 MIT，README 末尾写 "MIT © ruucm, stone-skipper"）；**GitHub 无根 LICENSE 文件**（license API 404，spdx 为 none） | **B** | plane/sphere/waterPlane × defaults/cosmic/glass/positionMix 多套 GLSL；10 个 HDR 环境预设 | three 0.169 + r3f + `@react-spring/three` + three-stdlib | 渐变背景价值高。缺根 LICENSE 文件是瑕疵（需保留 package.json 的声明并联系作者确认）；GLSL 里带 hughsk/glsl-noise（MIT，Ashima）需保留署名；HDR 预设文件名与 Poly Haven 一致（CC0），实际托管位置/许可未核实 |
| tengbao/vanta | 7093 | 2024-03-03（停更） | MIT（读原文头部，版权 2020 Teng Bao） | **B** | 14 个效果：birds、cells、clouds、clouds2、dots、fog、globe、halo、net、rings、ripple、topology、trunk、waves | three r134 / p5 | 效果源文件有派生痕迹：birds "Adapted from threejs.org/examples/canvas_geometry_birds"、"Based on openprocessing visualID=6910"；fog 引用 thebookofshaders + Morgan McGuire 的 Shadertoy 4dS3Wd；trunk 来自 kgolid/p5ycho。上游许可未逐个核实，只整合 net/waves/globe/dots/rings 类无显式外部出处的 |
| shuding/cobe | 5909 | 2026-09-22 | MIT（读原文头部） | **A** | 单一效果：5KB 地球（v2.0.1） | 原生 WebGL（无依赖） | 直接整合/重写为「Globe」。参数：phi、theta、dark、diffuse、mapSamples、mapBrightness、baseColor、markerColor、glowColor、markers、arcs、arcColor、arcWidth、arcHeight、scale、offset |
| PavelDoGreat/WebGL-Fluid-Simulation | 16669 | 2024-11-12 | MIT（读原文，2017 Pavel Dobryakov） | **A** | 单文件流体（script.js） | 原生 WebGL | 热门效果。仓库还含 `dat.gui.min.js`（MIT 但需另保留）、图标字体 iconfont.ttf 与 logo/badge 图片（来源未核实，不要拷贝）。参数：SIM_RESOLUTION、DYE_RESOLUTION、DENSITY_DISSIPATION、VELOCITY_DISSIPATION、PRESSURE、CURL、SPLAT_RADIUS、BLOOM 等（来自我对该项目的印象，未在本次逐行核实） |
| gl-transitions/gl-transitions | 2143 | 2026-06-22 | MIT（读原文），且**每个 .glsl 头部自带 `// License:`**：123 MIT、1 BSD 3-Clause、1 BSD 2-Clause、1 MIT（格式不同）；共 125 个 transition 全部有声明 | **A** | 125 个图像转场 GLSL | 纯 GLSL（`transition(uv)`+progress uniform） | 极好的「图片切换/转场」品类；保留每个文件的 Author/License 头。GitHub spdx 显示 NOASSERTION 只是因为 LICENSE.md 文件名 |
| oframe/ogl | 4661 | 2025-04-13 | **Unlicense**（`package.json` "license": "Unlicense"，README 末尾附 Unlicense 全文；GitHub 无 LICENSE 文件所以 spdx=none） | **A** | 核心库 + 49 个 examples（mouse-flowmap、post-fluid-distortion、gpgpu-particles、post-bloom、msdf-text、skydome 等） | 极小 WebGL 库 | 公共领域，最轻的运行时；examples 里的模型/贴图资产许可未核实，只取代码 |
| mrdoob/three.js | 116064 | 2026-09-29 | MIT（读原文）；**examples 内资产各有独立许可**：DamagedHelmet = CC BY-NC（读原文）；LeePerrySmith = CC BY 3.0；`textures/lensflare` = CC BY-NC-SA 3.0；`examples/fonts` = MgOpen 字体许可 | **B** | 298 个 webgl_*.html + 233 个 webgpu_*.html 示例，`jsm/tsl/` 74 个文件（TSL 节点） | three / WebGPU / TSL | 只取代码，绝不拷贝 examples 的模型/贴图/字体。TSL 值得作为「WebGPU 品类」的技术储备 |
| pmndrs/react-three-fiber | 32611 | 2026-09-29 | MIT（仅 API） | **A**（运行时依赖） | 渲染器，非效果库 | React + three | 作为 r3f 类效果的运行时依赖，不整合其源码 |
| pmndrs/drei | 9905 | 2026-09-28 | MIT（仅 API）；`drei-assets` 仓库**无 LICENSE**（spdx none），README 归属：HDRI Haven（Poly Haven，CC0）、LUTs 来自 Rockestock、贴图来自 Kenney | **A** 代码 / **C** drei-assets | 约 119 个组件：Sparkles、Stars、Cloud、Float、MeshDistortMaterial、MeshTransmissionMaterial、MeshReflectorMaterial、Caustics、Sky、Trail、Grid 等 | r3f | 用作依赖或参考实现；Environment 预设默认从 CDN 加载资产，商用时应自托管并核实 Poly Haven/CC0 归属 |
| pmndrs/postprocessing | 2870 | 2026-09-27 | **Zlib**（读原文：不得虚假声称原创、修改版须标注、不得移除声明；署名非强制） | **A** | Bloom、DoF、SSAO、Glitch、Pixelation、Vignette 等效果 | three | 依赖使用；整合到代码中需保留 zlib 声明 |
| pmndrs/react-postprocessing | 1395 | 2026-09-27 | MIT（仅 API） | **A** | postprocessing 的 r3f 封装 | r3f | 同上 |
| pmndrs/maath | 1296 | 2026-09-27 | MIT（仅 API；仓库现名 pmndrs/math） | **A** | 数学工具（easing、随机点分布、缓动阻尼） | TS | 依赖/取片段 |
| pmndrs/uikit | 3245 | 2026-09-01 | MIT ×2（读原文：Bela Bohlender 2024 + Coconut Capital 2023 两份 MIT 并列；spdx=NOASSERTION 因双声明） | **A** | r3f/three 内 UI 组件 | three | 需同时保留两份版权行 |
| pmndrs/leva | 6242 | 2025-11-09 | MIT（仅 API） | **A** | 调参 GUI（Paper 的 docs 用它） | React | 可作 Motif「调参面板」参考；我们自己的 controls schema 更合适 |
| pmndrs/lamina | 1108 | 2025-06-22（已归档） | MIT（仅 API） | **A** 但**已归档** | 分层材质 | r3f | 不建议新增依赖 |
| martinlaxenaire/curtainsjs | 1827 | 2025-04-03 | MIT（仅 API） | **A**（仅 API） | 图片/视频 WebGL 平面效果库 | 原生 WebGL | 图片扭曲/悬停效果的参考；`darkroomengineering/curtainsjs` 路径 404（我按作者仓库核实）；作者另有 gpu-curtains（未核实） |
| FunTechInc/use-shader-fx | 417 | 2025-04-07 | MIT（读原文头部，2024） | **A** | `fxs/`：3D、effects、interactions、noises、simulations 等目录（具体数量未统计） | r3f + three | 流体/噪声/交互 hook；停更一年半，作参考 |
| fand/vfx-js | 1148 | 2026-09-10 | MIT（读原文头部） | **A** | 把 DOM 元素变成 WebGL 特效的库（内置若干 shader preset，数量未统计） | 原生 WebGL | 「文字/图片 DOM 特效」品类候选 |
| gre/gl-react | 3008 | 2026-09-19 | MIT（读原文头部） | **A** | 声明式 GLSL React 封装 | React | 仅参考 |
| greggman/twgl.js | 3007 | 2026-09-09 | MIT（仅 API） | **A**（仅 API） | WebGL 小工具库 | 原生 WebGL | 辅助库，非效果 |
| ashima/webgl-noise | 2997 | 2024-11-15 | MIT（仅 API） | **A**（仅 API） | 经典 simplex/classic noise GLSL | GLSL | 噪声基础件，取片段需保留 Ashima 版权头 |
| hughsk/glsl-noise | 406 | 2015-12-27 | MIT（仅 API） | **A**（仅 API） | noise GLSL 包（含 periodic 3d） | GLSL | 同上，shadergradient 使用了它。`stackgl/glsl-noise` 路径 404 |
| glslify/glslify | 2286 | 2022-06-29 | MIT（读原文：Chris Dickinson + stackgl 2015） | **A** | GLSL 模块系统 | Node | 构建工具，非效果 |
| patriciogonzalezvivo/lygia | 3451 | 2026-09-14 | **Prosperity Public License 3.0.0**（读原文：仅非商业免费；商业用途只有 30 天试用） | **C** | 大型 GLSL 函数库 | GLSL | **不整合**，只链接。⚠️ 注意：任何依赖 `#include "lygia/..."` 的第三方 shader 也被污染 |
| patriciogonzalezvivo/thebookofshaders | 7035 | 2026-02-28 | **All rights reserved**（读原文头："I am the sole copyright owner of this Work"） | **C** | 教程 | GLSL | 仅链接学习 |
| patriciogonzalezvivo/glslViewer | 5334 | 2026-09-27 | BSD-3-Clause（仅 API） | A 但**非 web 效果** | 桌面 shader 查看器 | C++ | 不相关，仅列出 |
| DavidHDev/react-bits | 48272 | 2026-09-29 | **MIT + Commons Clause**（读原文：可用于应用/网站/产品，但「不得出售、再许可或**再分发组件本身——单独、成套或移植版本**」） | **C** | 大量 React 动效/背景组件 | React/OGL/three | **不能收录/再分发**（我们的市场本质就是再分发）。只能链接或作灵感（且不得移植） |
| DavidHDev/canvas-ui | 4728 | 2026-09-13 | **MIT + Commons Clause**（读原文首行，同一作者同款条款） | **C** | canvas 组件库 | canvas/WebGL | 同上 |
| hydra-synth/hydra-synth | 396 | 2026-07-16 | **AGPL-3.0**（仅 API） | **C** | 实时视频合成器 | JS/WebGL | AGPL 传染，不整合。`ertdfgcvb/Hydra`、`ojack/hydra-synth` 路径核实：后者重定向到 hydra-synth/hydra-synth |
| MengTo/kage | 1681 | 2026-08-09 | **无 LICENSE**（license API 404，spdx none）→ 默认保留所有权利 | **C** | Kage 落地页 | three | 不整合（threeui 中的 Kage 是 MIT 的另一份，见上） |
| latentcat/latentbox | 2273 | 2026-09-28 | CC BY-NC-ND 4.0（读原文首行） | **C** | 资源库站点 | — | 非商用+禁改，不可用 |
| tsparticles/tsparticles | 8983 | 2026-09-29 | MIT（读原文头部） | **A** | 粒子引擎 + 大量预设 | canvas | 粒子/彩带/烟花类的现成来源；预设 JSON 化，天然可调参 |
| pixijs/filters | 1135 | 2026-02-13 | MIT（读原文头部） | **A** | 约几十种 2D 滤镜（glow、bloom、CRT、glitch、ascii…，数量未统计） | PixiJS | 依赖 PixiJS，体积大，可作参考 |
| williamngan/pts | 5346 | 2026-09-28 | Apache-2.0（仅 API） | **A**（仅 API） | 创意编码库 | canvas/SVG | 参考 |
| vasturiano/globe.gl / three-globe | 3187 / 1636 | 2026-08-22 / 2026-04-04 | MIT（读原文头部） | **A** | 数据地球 | three | 数据可视化地球，较重；cobe 更轻 |
| nateherkai/scroll-craft | 2853 | 2026-09-04 | MIT（读原文头部） | 相关（非 WebGL 库） | 「构建沉浸式滚动网站」agent skill | — | 与 Motif 的「agent skill」直接相关，可学习其 skill 结构（内容未深读） |
| nolangz/pixel2motion | 2358 | 2026-08-21 | MIT（读原文头部） | 相关 | AI logo 动画 skill | — | 同上，未深读 |
| openshaders/openshaders | 254 | 2026-09-09 | MIT（读原文头部） | 尚无内容 | 仅 README+logo，"coming soon"，计划含 shadcn registry、React 组件 | — | **潜在直接竞品**；目前无代码可整合，持续关注 |
| sockmaster27/svader | 465 | 2026-09-29 | MIT（读原文头部） | A（仅 Svelte） | GPU 渲染 Svelte 组件 | Svelte | 仅当我们支持 Svelte |
| gfxfundamentals/webgl-fundamentals | 5021 | 2025-02-26 | BSD-3-Clause 风格（读原文头部） | 参考 | 教程 | — | 学习用 |
| Codrops 各 demo 仓库（codrops/*） | 见下 | 见下 | 近年新仓库是 **MIT**（读了 ScrollTextMotion 的 LICENSE 与 README，版权 "2009-2025 Codrops"）；**老仓库无 LICENSE 文件**（如 PageTransitions、RainEffect、LiquidDistortion、ScrollSpiral，spdx none），README 仅指向 `tympanus.net/codrops/licensing/`——该页对我返回 403，**条款未能核实** | 新：**B**；旧：**C** | 近期 MIT：RotatingOnScrollAnimations、KineticTypePageTransition、3DCarousel、SlideshowAnimations(305★)、Staggered3DGridAnimations(98★)、GooeyTextHoverEffect(158★)、WebGLBlobs(94★, 2021)。老 WebGL：RainEffect 1779★(2022)、LiquidDistortion 474★(2017)、ScrollSpiral 234★(2017) | GSAP/three/canvas | 即使是 MIT 仓库，demo 里常带图片素材（Unsplash 等）与 GSAP，需逐个检查；老仓库当 C |
| Shadertoy 上的 shader | — | — | **默认 CC BY-NC-SA 3.0**（这是我已知的 Shadertoy 条款；本次 WebFetch 该站返回 403，**未能在线复核**）；除非 shader 头部明确写了其他许可（iq 等作者常自行标 MIT） | **C**（除非显式声明） | — | GLSL | 一律不整合；见到「Original from shadertoy」的注释都要追到原作者的许可 |

（本次没有单独深挖：twgl 之外的 `hydra` 原站、`curtains` 现行仓库 gpu-curtains、`PavelDoGreat` 之外的其他流体实现、WebGPU 独立示例库——除 three.js 自带 TSL/WebGPU 示例外，未发现值得单列的高星宽松仓库。）

### 分级计数（上表以「仓库」为单位，不含 Codrops 拆分）

- **A**：paper-design/shaders、cobe、WebGL-Fluid-Simulation、gl-transitions、ogl、r3f、drei（代码）、postprocessing、react-postprocessing、maath、uikit、leva、curtainsjs、use-shader-fx、vfx-js、gl-react、twgl、ashima/webgl-noise、hughsk/glsl-noise、glslify、tsparticles、pixijs/filters、pts、globe.gl/three-globe、svader = 约 26。
- **B**：threeui、shadergradient、vanta、three.js（examples 资产）、Codrops 新仓库 = 5。
- **C**：lygia、thebookofshaders、react-bits、canvas-ui、hydra-synth、MengTo/kage、latentbox、drei-assets、Shadertoy、Codrops 老仓库 = 10。

---

## 3. 优先上架的约 30 个效果

约定：路径均为仓库内路径；「参数」是用户会调的项。标 ⚠ 的有额外注意。

| # | 效果 | 仓库 | 路径 | 依赖 | 可调参数 |
|---|---|---|---|---|---|
| 1 | Mesh Gradient（流动色块渐变） | paper-design/shaders | `packages/shaders/src/shaders/mesh-gradient.ts` | 无 | colors(≤10)、distortion、swirl、grainMixer、grainOverlay、speed |
| 2 | Grain Gradient（颗粒渐变） | paper-design/shaders | `.../grain-gradient.ts` | 无 | colors、colorBack、softness、intensity、noise、shape |
| 3 | Smoke Ring（烟环） | paper-design/shaders | `.../smoke-ring.ts` | 无 | colors、colorBack、thickness、radius、innerShape、noiseIterations、noiseScale |
| 4 | Liquid Metal（液态金属，作用于图片/形状） | paper-design/shaders | `.../liquid-metal.ts` | 无 | colorBack、colorTint、image、shape、repetition、softness、shiftRed/Blue、distortion、contour、angle |
| 5 | Warp（扭曲渐变） | paper-design/shaders | `.../warp.ts` | 无 | colors、proportion、softness、distortion、swirl、swirlIterations、shape、shapeScale |
| 6 | Swirl（螺旋色带） | paper-design/shaders | `.../swirl.ts` | 无 | colors、bandCount、twist、center、proportion、softness、noise、noiseFrequency |
| 7 | Metaballs | paper-design/shaders | `.../metaballs.ts` | 无 | colors、colorBack、count、size |
| 8 | Neuro Noise | paper-design/shaders | `.../neuro-noise.ts` | 无 | colorFront/Mid/Back、brightness、contrast |
| 9 | God Rays | paper-design/shaders | `.../god-rays.ts` | 无 | colors、colorBloom、bloom、intensity、density、spotty、midSize、midIntensity |
| 10 | Dithering（抖动点阵） | paper-design/shaders | `.../dithering.ts` | 无 | colorBack/Front、shape、type、size |
| 11 | Halftone CMYK（图片半调） | paper-design/shaders | `.../halftone-cmyk.ts` | 无 | image、四色、size、gridNoise、type、softness、contrast、grain* |
| 12 | Fluted Glass（沟槽玻璃，作用于图片） | paper-design/shaders | `.../fluted-glass.ts` | 无 | image、size、shape、angle、distortion、blur、highlights、shadows、margin |
| 13 | Water（水面焦散） | paper-design/shaders | `.../water.ts` | 无 | image、colorHighlight、highlights、layering、waves、caustic、size |
| 14 | Gem Smoke | paper-design/shaders | `.../gem-smoke.ts` | 无 | image、shape、colors、innerDistortion、outerDistortion、glow |
| 15 | Simplex Noise / Pulsing Border / Spiral / Waves / Dot Orbit / Dot Grid | paper-design/shaders | `.../simplex-noise.ts`、`pulsing-border.ts`、`spiral.ts`、`waves.ts`、`dot-orbit.ts`、`dot-grid.ts` | 无 | colors、scale、speed、size 等（各自 `shader-defs/*-def.ts` 有完整表）。⚠ `perlin-noise.ts`、`voronoi.ts` 先不上 |
| 16 | 3D 渐变 plane/sphere/water（Cosmic、Glass 风格） | ruucm/shadergradient | `packages/shadergradient/src/shaders/{defaults,cosmic,glass,positionMix}/{plane,sphere,waterPlane}/*.glsl` | three + r3f + react-spring；⚠ 无根 LICENSE | color1/2/3、uSpeed、uStrength、uDensity、grain、环境预设、相机角度（参数名未逐个核实） |
| 17 | 地球 Globe | shuding/cobe | `src/`（单库） | 无 | phi、theta、dark、diffuse、mapBrightness、baseColor、markerColor、glowColor、markers、arcs、scale |
| 18 | 流体模拟（鼠标搅动） | PavelDoGreat/WebGL-Fluid-Simulation | `script.js` | 无（勿拷贝 dat.gui/图标/logo） | 分辨率、耗散、压力、涡度(curl)、splat 半径、bloom、sunrays、颜色 |
| 19 | 125 种图像转场 | gl-transitions/gl-transitions | `transitions/*.glsl` | 无 | progress、各自 uniform（如 GlitchMemories 无额外参数） |
| 20 | 鼠标流场扭曲 | oframe/ogl | `examples/mouse-flowmap.html`、`post-fluid-distortion.html` | ogl（Unlicense）；⚠ 示例贴图未核实 | 流场半径、衰减、强度 |
| 21 | GPGPU 粒子 | oframe/ogl | `examples/gpgpu-particles.html` | ogl | 粒子数、速度、颜色 |
| 22 | 液态 3D 形体（光线步进液态银） | MengTo/threeui | `src/shaders/liquid-form/{LiquidFormBackground.tsx,liquidFormShaders.ts}` | 无（raw WebGL） | speed、morph、noiseScale、mouseAmount、metal、camera、tintHue、tintAmount（已核实 props） |
| 23 | CRT 曲面屏 | MengTo/threeui | `src/shaders/crt/` | 无 | speed、typeSpeed、motion、hue、saturation、brightness、opacity |
| 24 | 能量球（FBM 球体+星场） | MengTo/threeui | `src/shaders/energy-orb/` | 无 | speed、scale、smokeScale/Strength/Speed、hue、glow、starDensity/Speed/Size |
| 25 | 激光/矩阵/刀锋（4 变体） | MengTo/threeui | `src/shaders/laser/` | 无 | speed、size、length、density、opacity、hue |
| 26 | 粒子网络 / 星座 / 等高线（Canvas2D+WebGL） | MengTo/threeui | `src/shaders/constellation-field/`、`portal-field/` | 无 | mode、speed、size、length、density、opacity、hue |
| 27 | Three.js 星云/流体/曲速（Structure Flow 13 变体、Warp Field） | MengTo/threeui | `src/shaders/structure-flow/`、`src/shaders/{ribbon-field,emerald-horizon}/`（目录名已核实存在，Warp Field 具体目录未定位） | three r128/r160 | speed、waveScale、hue、glow、particleSize 等 |
| 28 | 鼠标交互液态金属按钮 | MengTo/threeui | `src/shaders/liquid-metal-button/` | raw WebGL2（⚠ 场景引用远程 Inter 样式表，需本地化） | 变体 Sign up pill / Liquid Orb / Play Circle |
| 29 | 图片粒子/半调 | MengTo/threeui + paper | `src/shaders/neuform-isolated/sources/amber-halftone.html` 等 | ⚠ Neuform 来源，来源不明，宜优先用 paper 的 halftone | mode、speed、hue |
| 30 | 网络/波浪/地球 3D 背景 | tengbao/vanta | `src/vanta.net.js`、`vanta.waves.js`、`vanta.globe.js`、`vanta.dots.js`、`vanta.rings.js` | three r134 | color、backgroundColor、points、spacing、maxDistance、mouseControls 等（参数名来自我对 Vanta 的印象，未核实） |
| 31 | 粒子预设（彩带/烟花/雪/连线） | tsparticles/tsparticles | 预设包 | canvas | 数量、颜色、速度、连线距离 |

（第 22-28 项要求：整合时每个文件头加 `Copyright (c) 2026 Meng To` + MIT，并在 THIRD_PARTY_NOTICES 注明 threeui commit `68802d5`。）

---

## 4. WebGL 细节与性能

以下规则中，**「已在源码核实」** 指我在上述仓库源码中看到了对应实现；**「通用经验」** 指业界共识，我在本次没有逐条取到官方文档页面，写入前请再次核对官方文档。

1. **限制 DPR / 像素总量**。已在源码核实：threeui `liquid-form` 用 `Math.min(devicePixelRatio, 1.5)`，其 contract 写 `pixelRatio ≤ 2`；paper-design 的 ShaderMount 提供 `minPixelRatio`（默认 2，可在 1x 屏上超采样抗锯齿）与 `maxPixelCount`（总像素上限，`shader-mount.ts`）。Motif 规则：预览 DPR ≤1.5（画廊小卡片 ≤1），全屏详情 ≤2；按 `canvas 像素数` 而不仅是 DPR 限制。
2. **离屏/隐藏时暂停**。已在源码核实：paper 的 ShaderMount `setupIntersectionObserver` + `visibilitychange`，在元素离开视口或标签页隐藏时把有效速度置 0；threeui 的 PreviewFpsMeter、AnimatedTopDock、BellFieldBackground、BrandOrbs 使用 IntersectionObserver。规则：所有画廊卡片必须 IO 暂停（rootMargin 提前少量），并处理 `visibilitychange`。
3. **画廊里同屏预览的 WebGL 上下文数量**（对我们最重要）。已在源码核实：paper 每个 ShaderMount 一个独立 canvas/上下文；threeui 每个预览也是独立上下文。通用经验：Chromium 约 16 个活动上下文，超过后最旧的会被丢弃并在控制台警告 "Too many active WebGL contexts"（Firefox/Safari 也有各自上限，移动端更低；此数字为我的既有认知，**本次未在线验证**，需实测）。建议方案：(a) 画廊默认展示**预渲染的静态缩略图/短视频**，仅悬停或进入「激活区」时才创建上下文；(b) 最多同时保持 N（如 4-6）个活动上下文，其余销毁；(c) 或用**单个共享 canvas + scissor** 渲染多个卡片（three.js 官方有「multiple elements」示例思路，未核实具体文件名）；(d) 监听 `webglcontextlost`/`webglcontextrestored`。
4. **r3f `frameloop="demand"`**：静态或低频变化的场景（渐变、单帧）使用 demand 模式，仅在 props/交互变化时 `invalidate()`；持续动画则保持 always 并配合规则 2。通用经验（r3f 文档 "Scaling performance" 一节），本次未取文档。drei 的 `PerformanceMonitor` 可根据帧率自适应降 DPR（drei 目录中存在，未细读）。
5. **纹理尺寸**：预览用 ≤1024（移动 ≤512）；用 2 的幂 + mipmaps 仅在需要时；用 KTX2/basis（three.js 自带 `jsm/libs/basis`）或 WebP 压缩纹理；HDR 用 1k 版本（shadergradient 的预设即 `*_1k.hdr`）。噪声纹理尽量用程序化噪声而不是位图（paper 传入 `get-shader-noise-texture.ts` 生成小噪声纹理）。
6. **精度与循环**：移动端 fragment 用 `mediump` 时长时间累加 `u_time` 会出现精度抖动（paper 的 shader 声明 `precision mediump float`，并对时间做处理，具体实现未核实）；循环次数用常量，避免动态大循环（FBM 迭代数做成有上限参数，如 smoke-ring 的 `noiseIterations`）。
7. **移动端降级**：检测 `matchMedia('(pointer:coarse)')`/低端设备时：降 DPR、降 FBM 迭代/粒子数、关闭后处理（bloom/DoF）、必要时回退到静态图或 CSS 渐变。threeui 的 contract 里用 `fidelity`/`adaptive` 之类字段暴露这一层（`portal-field`：`speed,fidelity,scale`）。
8. **`prefers-reduced-motion`**：速度设 0 渲染静帧（paper 的 `speed=0`/`frame` 参数天然支持「静止但可指定时间帧」）。**我在 threeui 里没有 grep 到 `prefers-reduced-motion` 命中**（grep 计数列表中未出现该关键字的独立统计，不能断言全部缺失），Motif 应在通用运行时层统一实现，而不是逐个组件。
9. **资源释放**：卸载时 dispose geometry/material/texture/renderTarget，调用 `renderer.dispose()`，并 `renderer.forceContextLoss()`（three.js）；取消 rAF；移除 IO/RO 监听。
10. **抗锯齿与 preserveDrawingBuffer**：默认关闭 antialias（用超采样代替）、不设 `preserveDrawingBuffer`（截图/缩略图生成时才临时打开）。通用经验。
11. **Resize**：用 ResizeObserver 而非 window resize（threeui BellField 已采用），并对 resize 做节流。
12. **FPS 自检**：threeui 的 `PreviewFpsMeter.tsx` 用 rAF 采样（≥55 好 / ≥45 关注 / 否则慢，>25ms 计慢帧），可借鉴为预览页的性能徽章，并作为收录门槛（例如 1 万粒子在中端机需 ≥50fps）。

参考链接：
- paper-design/shaders `packages/shaders/src/shader-mount.ts`：https://github.com/paper-design/shaders/blob/main/packages/shaders/src/shader-mount.ts
- threeui `PreviewFpsMeter.tsx`：https://github.com/MengTo/threeui/blob/main/src/components/PreviewFpsMeter.tsx
- threeui `liquid-form`：https://github.com/MengTo/threeui/tree/main/src/shaders/liquid-form
- r3f 性能文档（未取回，需自行核对）：https://r3f.docs.pmnd.rs/advanced/scaling-performance
- three.js 文档与 examples：https://threejs.org/docs/ ，https://threejs.org/examples/

---

## 5. 风险与未知

1. **threeui 的 README 数字与代码不符**（50/111/141 vs 43/104/163），且源码有陈旧描述（SF Pro 字体）。整合前以 commit `68802d5` 为准重新审计，并固定 SHA。
2. **threeui 来源链**：大量组件标注 "Neuform export"/"Owner-selected HTML" 等来源。作者声明 MIT 但我们无法验证其对上游内容的权利。含 OpenAI/Anthropic/Claude/Gemini 品牌标记的 `elements`、`brand-orbs` 存在**商标风险**，MIT 不覆盖。
3. **threeui 依赖与 CDN**：GSAP、Tailwind CDN、iconify、Skypack、Cloudflare 分析信标不能直接带入我们的产品；GSAP 当前授权条款我没有核实。
4. **threeui 缩略图/预览**：明确不在 MIT 范围内（ASSET-LICENSES.md），必须自己生成。
5. **threeui 是商业产品的免费子集**：其自动同步 + Pro 付费 + MCP，与 Motif 的定位重叠；可能出现许可证调整（历史未查）。这里只查看了当前 HEAD，**没有审阅 git 历史里的 LICENSE 变化**。
6. **paper-design/shaders**：Apache-2.0 要求保留 NOTICE 且标注修改；`perlin-noise`/`voronoi` 引用 Shadertoy 原算法，授权链未知；README 说 0.0.x 会有破坏性更新，需 pin 版本。
7. **shadergradient**：无根 LICENSE 文件，只有 package.json 与 README 声明；HDR 资产的实际托管来源/许可未核实。
8. **Vanta**：多个效果派生自他人作品（three.js 示例、openprocessing、p5ycho、Shadertoy），上游许可未逐个核实；仓库 2024-03 后无更新。
9. **three.js examples / drei-assets**：代码 MIT，但模型/纹理/字体有各自许可，已确认存在 CC BY-NC、CC BY-NC-SA 资产，**绝不能整包拷贝**。drei-assets 本身无 LICENSE。
10. **Codrops**：老仓库无 LICENSE 文件、其网站条款页对我 403，条款未核实，按 C 处理；新仓库 MIT 但素材需逐个检查。
11. **Shadertoy 默认 CC BY-NC-SA**：在线复核失败（403），基于已知条款；任何标注来自 Shadertoy 的代码都按 C，除非头部有显式宽松声明。
12. **Commons Clause 家族**（react-bits、canvas-ui）：spdx 显示 NOASSERTION，靠读原文才能发现；作者为同一人，条款明确禁止再分发。
13. **AGPL/非商业/无许可**：hydra-synth（AGPL）、lygia（Prosperity 非商业）、thebookofshaders（保留所有权利）、MengTo/kage（无许可）、latentbox（NC-ND）一律不整合。GLSL 里出现 `#include "lygia/..."` 的第三方 shader 要连带排除。
14. **未核实清单**：仅用 API 而未读全文的许可证（见主表「仅 API」）；WebGL-Fluid-Simulation 与 Vanta 的具体参数名；WebGL 上下文上限的准确数字与浏览器差异；r3f `frameloop`/three 多元素示例的官方文档页；gpu-curtains、pixijs/filters、tsparticles 的详细目录；WebGPU/TSL 独立效果库未做深度调研。
15. **上线前流程建议**：每个入库效果记录 `{repo, path, commit SHA, SPDX, 版权行, 第三方出处, 素材列表}`，做自动化审计脚本（参考 threeui 的 `audit-public.mjs`），并在页面「代码」标签内附带许可证头。
