# 调研：功能组件（Components）——加载 / 反馈 / 输入控件 / 导航与浮层

调研日期：2026-09-29。方法：`gh api repos/.../license` 读取 LICENSE 原文（不只看 SPDX）、浅克隆后读源码与 `package.json`、`git ls-files` 统计目录、`npm view` 核对外部依赖的许可证。"未核实/待核"处均已标明。
本文不重复 `components-motion.md`（magicui、motion-primitives、animata 的动效部分等）已收录的内容，只补功能组件层。

分级沿用前文：**A** 宽松许可，可带署名整合；**B** 代码宽松但有附加条件（来源不明、文档另有许可、依赖/目录例外）；**C** 仅链接，不整合代码。

**重要限制**：本次核实了「许可证、路径存在、依赖、参数名/默认值」，**没有做视觉评审**（没有渲染任何组件）。"为什么好"栏来自源码里能读到的事实（动画参数、a11y 属性、结构），不是审美结论。入库前必须做一轮截图筛选，尤其是 Uiverse galaxy 与 kibo/reui 的 pattern 池。

## 0. 关键结论（许可证意外）

1. **Preline（★6.5k）不是纯 MIT**：LICENSE 是 "MIT + Preline UI Fair Use License" 双许可，GitHub 显示 `NOASSERTION`。Fair Use 条款含：不得用于创建"直接与 Preline UI 竞争的产品或服务"（定义为复制其主要功能的软件/服务）；再分发必须附带 Fair Use 全文并署名链接原仓库；违约可终止授权并要求销毁所有副本。我们是组件市场，**C 级，只链接**。
2. **rare-ui（★1.5k）是 MIT + Commons Clause + Attribution**（LICENSE 首行原文："MIT + Commons Clause License Condition v1.0 + Attribution"），与 react-bits / animate-ui 同类。**C**。
3. **sileo（★1.7k，toast 库）没有 LICENSE 文件**，README 也无许可声明（GitHub license 为空）。**C**。
4. **loaders.css（★10.2k）没有 LICENSE 文件**、GitHub license 为空；但 `package.json` 写 `"license": "MIT"`，README 末尾有完整 MIT 文本。按"有明确文本但缺 LICENSE 文件"处理为 **B**。
5. **coss / apps/ui 的 MIT 声明不完整**：根 `LICENSING.md` 只有一句被截断的话 "The following directory and their subdirectories are licensed under their original"，后面列出 `apps/origin/`、`apps/ui/`；只有 `apps/origin/LICENSE.md` 是完整的 MIT 文本（"Originally Copyright (c) 2025 Origin UI"）。`apps/ui/` 自身没有 LICENSE 文件。故 `apps/origin` 记 A，`apps/ui` 记 **B**（需向作者确认或保守只取 origin）。仓库整体仍是 AGPL-3.0。
6. **Flowbite（★9.4k）**：仓库 MIT，但官网许可页写 "Code licensed MIT, docs CC BY 3.0"，README 声明 Flowbite 名称与 logo 为 Bergside Inc. 商标。组件示例 HTML 位于 `content/components/*.md`（属于 docs，CC BY 3.0 需署名）。**B**。
7. **Uiverse galaxy（★13.3k）**：LICENSE 为 MIT（"Copyright (c) 2023 Uiverse.io"），README 明写署名"非强制但鼓励"。每个文件名是 `作者_随机名.html`，文件内带 `From Uiverse.io by <作者>` 注释。作者是平台用户，版权归属无法逐一核实；抽查一个骨架屏（`bundui_fat-jellyfish-70.html`）与 Flowbite 的骨架屏文档结构高度相似（**仅为观察，未证实抄袭**）。**B**，且仓库自 2024-09-02 未推送。
8. **smoothui 的 `reduced-motion` 覆盖出乎意料地好**：`packages/smoothui/components/` 下有 184 个文件命中 `useReducedMotion`（含测试文件）。对比：ldrs、SpinKit、react-spinners、css-loaders 的动画样式里 **0 处** `prefers-reduced-motion`；Uiverse galaxy loaders 仅 1/718 处理。
9. **shadcn/ui 近期新增了聊天类原语**：`apps/v4/registry/new-york-v4/ui/` 下已有 `bubble.tsx`、`message.tsx`、`marker.tsx`、`attachment.tsx`、`message-scroller.tsx`，还有 `spinner.tsx`、`empty.tsx`、`item.tsx`、`kbd.tsx`、`field.tsx`、`input-group.tsx`、`button-group.tsx`。
10. **animata 的 `skeleton/` 目录不是加载骨架屏**：里面是 category-skeleton、receipt、report、cookie-banner 等"线框风插画卡片"，不要按名字当作 loading 组件收录。
11. **外部 npm 依赖已核**（`npm view`）：`input-otp`、`react-dropzone`、`goober`、`metal-fx`、`border-beam`、`@base-ui/react`、`cmdk`、`dialkit` 均为 MIT。

## 1. 来源总表

| 仓库 | ★ | 最近推送 | 许可证（核实后） | 分级 | 内容/数量 | 技术栈 | 整合方式 |
|---|---|---|---|---|---|---|---|
| GriffinJohnston/ldrs | 2.2k | 2025-10-22 | MIT（LICENSE 全文） | A | `src/elements/*.ts + *.scss` 共 42 个加载器（bouncy…zoomies）；每个有 size/color/speed，部分有 stroke/stroke-length | Web Component（Lit 之外的自写 Base）+ SCSS，Shadow DOM | 取 `.scss` 转成纯 CSS 或 React 组件，保留版权行；官网 uiball.com/ldrs 的"Source"页授权未核实，只用仓库 |
| tobiasahlin/SpinKit | 19.3k | 2020-08-01 | MIT | A | `spinkit.css` 13 类（bounce/chase/circle/circle-fade/flow/fold/grid/plane/pulse/swing/wander/wave…），变量 `--sk-size`、`--sk-color`、`--sk-wander-distance` | 纯 CSS | 直接拆分单个 spinner；久未更新但稳定 |
| lukehaas/css-loaders | 7.1k | 2025-02-21 | MIT | A | `css/load1..load8.css` 8 个（另有 sass/less） | 纯 CSS | 风格偏 2014，低优先级 |
| ConnorAtherton/loaders.css | 10.2k | 2023-05-03 | 无 LICENSE 文件；package.json 与 README 写 MIT | B | `src/animations/*.scss` 约 32 个（ball-*、line-scale-*、pacman…） | SCSS | 只在需要时取；缺 LICENSE 文件需在署名里说明来源 README |
| jh3y/whirl | 1.8k | 2023-01-03 | MIT | A | `src/whirl.config.json`（905 行配置）驱动的纯 CSS spinner 集，成品数量未核实 | CSS + 配置 | 低优先级，未审阅 |
| davidhu2000/react-spinners | 3.4k | 2026-09-28 | MIT | A | `src/*Loader.tsx` 24 个（Pulse/Beat/Sync/Scale/Fade/Clip/Moon/Hash/Puff…），props：`size`、`color`、`speedMultiplier`、`loading` | React 19，行内样式 + 自建 keyframes | 单文件可拆；风格偏经典 |
| dvtng/react-loading-skeleton | 4.2k | 2026-03-05 | MIT | A | `src/Skeleton.tsx`、`skeleton.css`；`baseColor`/`highlightColor`/`duration`/`direction`/`enableAnimation` | React + CSS | 理念是"骨架屏自动匹配真实文字尺寸"，可借鉴其 CSS 与 reduced-motion 处理 |
| Aejkatappaja/phantom-ui | 801 | 2026-07-31 | MIT | A | 1 个 `<phantom-ui>` Web Component：运行时测量真实 DOM 叶子元素生成 shimmer 块 | Lit Web Component（v1.6.1） | 适合作为"骨架屏"分类的引擎型条目；属性见 §2 |
| daisyUI（saadeghi/daisyui） | 42.5k | 2026-09-29 | MIT | A | `packages/daisyui/src/components/*.css` 61 个（loading、skeleton、toast、alert、steps、rating、toggle、otp、fileinput、radialprogress、tab、tooltip、dock…） | Tailwind 插件（CSS） | 单个 CSS 文件可摘出，需带变量与 `@layer` 说明 |
| emilkowalski/sonner | 13.0k | 2026-08-10 | MIT | A | `src/index.tsx`、`styles.css`（615 行）、`state.ts`；常量：可见 3 条、gap 14px、宽 356px、寿命 4000ms、swipe 阈值 45 | React | 首选 toast 引擎；以依赖方式使用，样式可换肤 |
| anl331/goey-toast | 1.3k | 2026-09-05 | MIT | A | 基于 sonner 的 morph toast（v0.5.0）：`src/components/GooeyToast.tsx`、`GooeyToaster.tsx`、`AriaLiveAnnouncer.tsx` | React + framer-motion（peer）+ sonner | 依赖包整合；README 有 spring/bounce/preset 参数 |
| timolins/react-hot-toast | 11.0k | 2026-09-16 | MIT（20 行标准文本） | A | `src/components/{checkmark,error,loader,toast-bar,toast-icon}.tsx`；动效 enter 0.35s / exit 0.4s | React + goober | 其动画图标（对勾/叉/加载环）单独可取 |
| coss / apps/origin | 10.6k（整仓） | 2026-09-29 | `apps/origin/LICENSE.md` 为完整 MIT | A | `apps/origin/registry/default/components/comp-NN.tsx` 约 676 个文件（编号命名，功能需逐个看） | React 19、Tailwind 4、radix-ui、react-aria-components | 只取该目录，逐文件核对；编号难检索 |
| coss / apps/ui | 同上 | 同上 | 仅 LICENSING.md 一句被截断的声明（见 §0-5） | B | `registry/default/ui/` 54 个 + `particles/` 510 个示例（p-toast-1..13、p-otp-field-1..10、p-slider-1..23、p-switch-1..9、p-tabs-1..15、p-drawer-1..14 等） | React 19、Tailwind 4、`@base-ui/react` 1.8.0 | 作者确认许可前不入库；仅做灵感 |
| cosscom/coss 其余部分 | 同上 | 同上 | AGPL-3.0 | C | 其余目录 | — | 不取 |
| shadcn-ui/ui | 124.8k | 2026-09-29 | MIT | A | `apps/v4/registry/new-york-v4/ui/` 63 个原语（含 spinner、empty、kbd、field、input-group、button-group、item、sonner、input-otp、progress、slider、switch、bubble/message/marker…）+ `examples/` 244 个 | React 19、Tailwind 4、radix-ui | 作基础层与对照；按 registry schema 导入 |
| pacocoursey/cmdk | 13.0k | 2025-10-29 | MIT | A | `cmdk/src/index.tsx`、`command-score.ts`；`website/components/cmdk/{vercel,linear,raycast,framer}.tsx` + `website/styles/cmdk/*.scss` 四套主题 | React，依赖 radix dialog/id/compose-refs/primitive | 四套主题是现成的高质量命令面板样式 |
| emilkowalski/vaul | 8.6k | 2025-10-03 | MIT（9 行紧凑 MIT） | A | `src/index.tsx`、`style.css`、`use-snap-points.ts`、`use-scale-background.ts`；`TRANSITIONS.DURATION 0.5s`、`EASE [0.32,0.72,0,1]`、`VELOCITY_THRESHOLD 0.4`、`CLOSE_THRESHOLD 0.25` | React + radix dialog | 抽屉引擎；建议依赖方式 |
| mui/base-ui | 11.0k | 2026-09-29 | MIT（Copyright Material-UI SAS） | A | `docs/src/app/(docs)/react/components/<组件>/demos/<demo>/{tailwind,css-modules}/index.tsx`；drawer 11、autocomplete 11、menu 10、dialog 10、combobox 9、slider 6、otp-field 5、preview-card 4、toast 3… | React，`@base-ui/react` | demo 有 Tailwind 与 CSS Modules 两套，非常适合我们；docs 目录无独立 LICENSE（树中只有根 LICENSE） |
| radix-ui/primitives | 19.3k | 2026-08-08 | MIT | A | 无样式原语；样式示例在 `radix-ui/website`（1.0k★，MIT，2026-07-20） | React | 作依赖，不整合示例 |
| ibelick/prompt-kit | 3.1k | 2026-09-28 | MIT（文件名 `LICENCE.md`，9 行） | A | `components/prompt-kit/*.tsx` 20 个 AI 聊天组件，registry：`public/c/*.json`；keyframes 在 `app/globals.css` | React 19、Next 15、Tailwind 4.1、motion 12、radix | AI"思考中/加载"类的首选来源；需一并带走 globals.css 里的 keyframes |
| elevenlabs/ui | 2.4k | 2026-09-14 | MIT（Copyright Eleven Labs Inc.） | A | `apps/www/registry/elevenlabs-ui/ui/`：orb、bar-visualizer、live-waveform、shimmering-text、audio-player、voice-picker、scrub-bar、matrix 等 + shadcn 全套 | React，`orb` 依赖 three；部分依赖 ElevenLabs SDK | 只取纯前端可视化件；含 SDK 的不取 |
| shadcnblocks/kibo | 3.9k | 2026-05-04 | MIT（LICENSE 无标题行，正文为标准 MIT） | A | `packages/<组件>/index.tsx` 40 个（spinner、dropzone、rating、choicebox、pill、tags、snippet、avatar-stack、banner、announcement、dialog-stack、theme-switcher、status、combobox…）+ `packages/patterns/` 1103 个 shadcn 变体文件 | React，shadcn；dropzone 依赖 react-dropzone | patterns 是"填数量"的池子，需视觉筛选 |
| xxtomm/spell-ui | 1.3k | 2026-08-14 | MIT | A | `registry/spell-ui/*.tsx` 32 个（animated-checkbox、bars-spinner、spinner、copy-button、label-input、exploding-input、flow/pop/rich-button、kbd、color-selector…） | React，多数无 motion 依赖 | 体量小但很多是功能件 |
| educlopez/smoothui | 989 | 2026-09-28 | MIT | A（`gooey-popover` 依赖 GSAP，B） | `packages/smoothui/components/<名>/index.tsx` 约 200 个；功能件：animated-tabs/toggle/stepper/otp/file-upload/progress-bar/input/tooltip、basic-toast、各类 loader、checkbox、radio-group、select、combobox、dialog、drawer、dropdown、pagination、breadcrumb… | React 19、motion 12、radix-ui | 功能件最全的 A 级来源，reduced-motion 覆盖好；每个都是单目录，易导入 |
| nolly-studio/cult-ui | 6.2k | 2026-09-23 | MIT | A（含 `metal-fx`、`border-beam` 两个 MIT npm 依赖） | `apps/www/registry/default/ui/*.tsx` 82 个，功能件：direction-aware-tabs、floating-panel、popover、popover-form、side-panel、sortable-list、timer、color-picker、各类 button… | React 19、motion 12、react-use-measure | 已在前文收录动效部分，此处补功能件 |
| kokonut-labs/kokonutui | 2.1k | 2026-08-20 | MIT | A | `components/kokonutui/*.tsx` 46 个，功能件：loader、ai-loading、ai-text-loading、file-upload、smooth-tab、smooth-drawer、toolbar、action-search-bar、ai-input-search、hold-button、avatar-picker、team-selector | React 19、Next 16、motion 12，个别用 next/image、next-themes | 含 `next/*` 引用的需去 Next 化 |
| codse/animata | 2.8k | 2026-09-14 | MIT | A | `animata/{button 18, preloader 17, progress 2, container 10, tabs 4, overlay 1, graphs 6, accordion 1, list 8}`；无 registry | React 19、Tailwind 4、motion 12 | 需自写转换脚本；`skeleton/` 目录不是加载骨架（见 §0-10） |
| iurvish/uselayouts | 602 | 2026-09-28 | MIT | A | `registry/default/example/<名>.tsx`（含 save-button、delete-button、tactile-button、morphing-input、smooth-dropdown、discrete-tabs、vertical-tabs、dynamic-toolbar、set-timer、create-menu…） | React 19、motion 12/framer-motion | 交互设计感强；注意 `demo/` 文件名与 `example/` 内容不完全对应，以 example 内容为准 |
| keenthemes/reui | 3.6k | 2026-09-16 | MIT（Copyright Keenthemes Inc；另有付费 Pro） | A | `registry-reui/bases/{base,radix}/components/<名>/c-<名>-N.tsx` 约 1179 个变体；`bases/base/reui/*.tsx` 有 stepper、rating、phone-input、sortable、timeline、number-field 等独有件 | React、Tailwind、Base UI 或 Radix 两套 | 静态排版为主，动效含量低；stepper/rating/timeline 值得取 |
| markmead/hyperui | 12.2k | 2026-09-26 | MIT | A | `public/examples/{application,marketing,neobrutalism}/<类>/N.html`（每个含 `-dark` 版）：application/loaders 7、toasts 6、empty-states 5、toggles 4、steps 5、tabs 5、breadcrumbs 5、pagination 3、file-uploaders 2、modals 6… | 纯 HTML + Tailwind | 零依赖，几乎没有动效，适合"无 JS 基础款" |
| merakiui/merakiui | 2.7k | 2025-07-11 | MIT（Copyright 2021 Khatab Wedaa） | A | `components/<类>/*.html`：inputs 13、alerts 9、buttons 10、skeleton 8、tooltip 7、tabs 4、pagination 4 等 | HTML + Tailwind（版本未核实，可能是 v3） | 低优先级 |
| themesberg/flowbite | 9.4k | 2026-06-27 | 代码 MIT；文档 CC BY 3.0；名称/logo 商标 | B | `content/components/*.md` 45 篇（spinner、skeleton、toast、stepper、tabs、popover…）+ `src/components` 58 个 JS | Tailwind + JS | 只在必要时取并按 CC BY 署名；避免使用 "Flowbite" 名称包装 |
| uiverse-io/galaxy | 13.3k | 2024-09-02 | MIT（Uiverse.io），作者为平台用户 | B | 3815 个文件：Buttons 1232、Cards 727、loaders 718、Toggle-switches 261、Inputs 227、Forms 181、Checkboxes 172、Radio-buttons 103、Tooltips 63、Notifications 24；每文件 HTML + 内联 `<style>` | 纯 HTML/CSS，约 25/718 个 loader 用 Tailwind | 只挑经过视觉筛选的少量；文件内的 `From Uiverse.io by <作者>` 注释必须保留 |
| timc1/kbar | 5.3k | 2026-08-10 | MIT（SPDX，标准 21 行） | A（未深入） | 命令面板库 | React | 仅记录，未读源码 |
| react-dropzone/react-dropzone | 11.0k | 2026-09-27 | MIT（LICENSE 头部核实） | A | 文件拖放 hook | React | 作依赖 |
| guilhermerodz/input-otp | 3.3k | 2026-09-10 | MIT | A | OTP 输入原语（`apps/playground` 为示例） | React | shadcn 的 OTP 即基于它 |
| anyblades/float-label-css | 130 | 2026-09-03 | MIT（LICENSE 头部核实） | A（未读源码） | 纯 CSS 浮动标签，声称带旧浏览器降级 | CSS | 仅 SPDX+README，需读源码确认 |
| thmsgbrt/react-simple-pull-to-refresh | 191 | 2026-04-16 后 | MIT（LICENSE 头部核实） | A（未读源码） | 下拉刷新 | React | 唯一找到的可用下拉刷新，需评估样式 |
| pqoqubbw/icons | 8.1k | 2026-08-22 | MIT | A | `icons/*.tsx` 动效图标（含 check、circle-check、clipboard-check、bell 等） | React + motion | 用作成功/复制/通知的动效图标；具体动效未审 |
| Avijit07x/animateicons | 1.2k | 2026-09-29 | MIT | A（未深入） | 动效图标 | React | 仅记录 |
| unovue/inspira-ui | 5.0k | 2026-09-18 | MIT | A（Vue 栈） | Vue 组件 | Vue/Nuxt | 与我们 React 栈不匹配，仅记录 |
| htmlstreamofficial/preline | 6.5k | 2026-08-31 | MIT + Preline Fair Use License（非竞争条款） | C | — | — | 仅链接 |
| swamimalode07/rare-ui | 1.5k | 2026-09-27 | MIT + Commons Clause + Attribution | C | — | — | 仅链接 |
| hiaaryan/sileo | 1.7k | 2026-02-22 | 无 LICENSE | C | toast 库 | — | 仅链接 |
| epic-spinners、loadingio/css-spinner、damianricobelli/stepperize | 3.9k / 1.8k / 1.6k | — | GitHub 的 license 字段为空（未读仓库文件确认） | C（未核实） | — | — | 未逐个确认，先不用 |
| raphaelfabeni/css-loader | 1.2k | 2023-03-03 | GPL-3.0 | C | — | — | 不取 |
| crafter-station/elements | 524 | 2026-08-14 | MIT | A（低相关） | 主要是 AI 智能体面板与 Clerk 认证 blocks | React | 与功能组件层重叠低，跳过 |

未列入：aceternity、hover.dev、skiper-ui 等已在前文判为 C。

## 2. 候选组件清单

约定：来源栏括号内为该来源分级；路径为仓库内相对路径；"依赖"省略 react 与 tailwind；"可调参数建议"中标"源码"的来自读到的 props/默认值，标"建议"的是我们的设定。**除非注明，均未做视觉评审。**

### 2.1 加载与等待（Loading & waiting）

| # | 名称 | 来源 | 路径 | 为什么好 | 依赖 | 可调参数建议 |
|---|---|---|---|---|---|---|
| L01 | 形变类加载器（Reuleaux / Squircle / Trefoil / Infinity / Jelly Triangle） | ldrs (A) | `src/elements/{reuleaux,squircle,trefoil,infinity,jellyTriangle}.scss` | SVG 描边循环，一族形状语言统一；CSS 变量驱动 | 无（需去掉 Web Component 外壳） | size 30–55px、stroke 4–5、stroke-length 0.15–0.25、speed 0.9–1.75s（源码默认） |
| L02 | 点阵类（Dot Pulse / Dot Wave / Dot Stream / Dot Spinner / Bouncy / Bouncy Arc） | ldrs (A) | `src/elements/{dotPulse,dotWave,dotStream,dotSpinner,bouncy,bouncyArc}.scss` | 最常用的"三点/环点"节奏，尺寸随 `--uib-size` 缩放 | 无 | size 40–70、speed 0.9–2.5s（源码） |
| L03 | 环形类（Ring / Ring2 / Tailspin / Line Spinner / Pinwheel / Miyagi） | ldrs (A) | `src/elements/{ring,ring2,tailspin,lineSpinner,pinwheel,miyagi}.scss` | 描边旋转环，Ring2 有 `stroke-length` 控制拖尾 | 无 | stroke 3–5、speed 0.8–2s（源码） |
| L04 | 物理类（Newton's Cradle / Metronome / Hourglass / Momentum / Leapfrog / Treadmill） | ldrs (A) | `src/elements/{newtonsCradle,metronome,hourglass,momentum,leapfrog,treadmill}.scss` | 有物体感的等待动画，辨识度高 | 无 | size 40–78、speed 1.1–2.5s（源码） |
| L05 | 轨道与脉冲（Orbit / Chaotic Orbit / Pulsar / Ping / Ripples / Quantum / Trio / Superballs） | ldrs (A) | `src/elements/{orbit,chaoticOrbit,pulsar,ping,ripples,quantum,trio,superballs}.scss` | 适合"连接中/同步中" | 无 | speed 1.3–2s（源码） |
| L06 | 线条与波形（Line Wobble / Zoomies / Waveform / Cardio / Hatch / Helix / Grid） | ldrs (A) | `src/elements/{lineWobble,zoomies,waveform,cardio,hatch,helix,grid}.scss` | 含线性"进度条式"的不定时等待（Line Wobble、Zoomies）与波形 | 无 | size 35–80、stroke 3.5–5、speed 1–3.5s（源码） |
| L07 | SpinKit Chase / Circle Fade | SpinKit (A) | `spinkit.css`（`.sk-chase`、`.sk-circle-fade`） | 经典且写法极简；变量 `--sk-size`、`--sk-color` | 无 | size、color（源码变量） |
| L08 | SpinKit 其余系列（Bounce / Flow / Fold / Grid / Plane / Pulse / Swing / Wander / Wave） | SpinKit (A) | `spinkit.css` | 一个文件覆盖 9 种，`--sk-wander-distance` 可调 | 无 | size、color、wander-distance |
| L09 | 波形脉冲点（PulseLoader / BeatLoader / SyncLoader / PropagateLoader） | react-spinners (A) | `src/{PulseLoader,BeatLoader,SyncLoader,PropagateLoader}.tsx` | 参数暴露完整；PulseLoader 使用 `cubic-bezier(0.2,0.68,0.18,1.08)`、0.75s、每点错开 0.12s（源码） | 无 | size 15、margin 2、speedMultiplier 1、color（源码默认） |
| L10 | 条形与旋转（ScaleLoader / FadeLoader / RiseLoader / ClipLoader / MoonLoader / HashLoader / PuffLoader / ClockLoader） | react-spinners (A) | `src/*.tsx` | 24 种里的常用款，全部支持 `loading` 开关 | 无 | speedMultiplier、size、color |
| L11 | 经典 loaders.css 全集（Ball Scale Ripple / Line Scale / Pacman 等约 32 个） | loaders.css (B) | `src/animations/*.scss` | 数量大、CSS 单类；风格偏旧 | 无 | 缺 LICENSE 文件，建议仅作补充 |
| L12 | Loader（12 种变体：circular / classic / pulse / pulse-dot / dots / typing / wave / bars / terminal / text-blink / text-shimmer / loading-dots） | prompt-kit (A) | `components/prompt-kit/loader.tsx` + `app/globals.css`（typing、loading-dots、wave、blink、text-blink、bounce-dots、thin-pulse、pulse-dot、shimmer-text、wave-bars keyframes） | 一个组件覆盖 12 种，`sm/md/lg` 三档尺寸，圆形版带 `sr-only` "Loading" | 无（纯 Tailwind + keyframes） | variant、size、text（源码 props） |
| L13 | Text Shimmer（"思考中"文字流光） | prompt-kit (A) | `components/prompt-kit/text-shimmer.tsx` | `duration` 默认 4s、`spread` 默认 20 且被夹在 5–45，防止渐变过宽 | 无 | duration 2–6s、spread 5–45（源码） |
| L14 | Thinking Bar（带停止按钮的思考条） | prompt-kit (A) | `components/prompt-kit/thinking-bar.tsx` | 复用 TextShimmer，带 `onStop`/`stopLabel`/`onClick` | lucide-react | text、stopLabel（源码） |
| L15 | Reasoning（可折叠推理过程） | prompt-kit (A) | `components/prompt-kit/reasoning.tsx` | AI 推理流的展开/折叠标准形态 | lucide-react | 建议：默认折叠、流式结束后自动折叠 |
| L16 | Chain of Thought + Steps | prompt-kit (A) | `components/prompt-kit/chain-of-thought.tsx`、`steps.tsx`（含 steps-with-loader 示例） | 多步骤推理/工具调用的结构化展示 | lucide-react | 建议：每步状态 pending/running/done |
| L17 | Response Stream（打字机/淡入逐块输出） | prompt-kit (A) | `components/prompt-kit/response-stream.tsx` | 有 `mode`（默认 typewriter）、`fadeDuration`、`characterChunkSize` 三个可调项（源码） | 无 | mode、characterChunkSize、fadeDuration |
| L18 | AI Loader（dots / bar / grid + 已用时计数） | smoothui (A) | `packages/smoothui/components/ai-loader/index.tsx` | `showElapsed` 显示已等待秒数（源码注释："长等待需要进度迹象"）；内置 `reduced` 分支 | motion | variant、label、showElapsed（源码） |
| L19 | Motion Loader（12 种：orbit / newton-cradle / pendulum / hourglass / morph-ring / square-snake / comet / radar / cube-flip / wave-bars / breathing-glow / dot-ring） | smoothui (A) | `packages/smoothui/components/motion-loader/index.tsx` | 单组件 12 变体，`color` 默认 `currentColor`，`speed` 倍率，带 `label` 供读屏，内部有 `reduce` 标志 | motion | variant、size（px）、speed 倍率、color（源码 props） |
| L20 | Grid Loader（点阵图案 loader） | smoothui (A) | `packages/smoothui/components/grid-loader/index.tsx` | 预设图案（solo-*、line-h-*、line-v-* 等）+ `mode: pulse/sequence/stagger`，可传自定义矩阵 | motion | pattern、mode、size(sm–xl)、gap、blur、rounded、speed（源码） |
| L21 | Page Preloader（words / stairs / pixel / curtain） | smoothui (A) | `packages/smoothui/components/page-preloader/index.tsx` | 页面开屏/转场遮罩，`onComplete` 回调，可 `container` 局部使用 | motion | variant、duration、words、columns、background（源码） |
| L22 | Skeleton Loader（基础 pulse 骨架） | smoothui (A) | `packages/smoothui/components/skeleton-loader/index.tsx` | 包裹子元素自动保持布局（`invisible` + 覆盖层），带 `aria-busy` | 无 | loading 开关、className；建议改成 shimmer 版（见 L28） |
| L23 | AI Loading（任务序列日志式加载） | kokonut (A) | `components/kokonutui/ai-loading.tsx` | "Searching the web → Analyzing results…"多阶段状态与行文本，无外部依赖 | 无 | 建议：任务序列、每行间隔可配 |
| L24 | AI Text Loading | kokonut (A) | `components/kokonutui/ai-text-loading.tsx` | 82 行小组件，文字轮换加载提示 | motion | 建议：文案列表、轮换间隔 |
| L25 | Loader（309 行） | kokonut (A) | `components/kokonutui/loader.tsx` | 单文件多形态（未逐个核对变体） | motion | 待核 |
| L26 | Spinner + Bars Spinner | spell-ui (A) | `registry/spell-ui/spinner.tsx`、`bars-spinner.tsx` | 零依赖，109/131 行 | 无 | 待核 props |
| L27 | Spinner（多变体） | kibo (A) | `packages/spinner/index.tsx` | 基于 lucide 的 Throbber / Pinwheel / CircleFilled 等（未读全 271 行） | lucide-react、shadcn spinner | variant、size |
| L28 | 结构感知骨架屏 `<phantom-ui>` | phantom-ui (A) | 仓库根：`README.md` 属性表；npm `@aejkatappaja/phantom-ui` | 运行时测量真实 DOM 叶子元素，覆盖同尺寸 shimmer 块；`animation` 支持 shimmer/pulse/breathe/solid；`reveal` 结束淡出；减少动画时改用静态遮罩 | lit（Web Component） | animation、shimmer-direction、shimmer-color 默认 `rgba(128,128,128,0.3)`、duration 默认 1.5s、stagger、reveal（源码 README） |
| L29 | Skeleton（自动适配文字的 shimmer） | react-loading-skeleton (A) | `src/Skeleton.tsx`、`src/skeleton.css` | 默认 1.5s、`ease-in-out`，reduced-motion 下关闭伪元素（skeleton.css:53） | 无 | baseColor、highlightColor、duration、direction ltr/rtl、enableAnimation |
| L30 | Loading（spinner / dots / ring / ball / bars / infinity × xs–xl） | daisyUI (A) | `packages/daisyui/src/components/loading.css` | 6 种形状 × 5 档尺寸，动画包在 `prefers-reduced-motion: no-preference` 里 | Tailwind（daisyUI 变量） | size 档位 |
| L31 | Skeleton（105° 渐变 shimmer） | daisyUI (A) | `packages/daisyui/src/components/skeleton.css` | 1.8s `ease-in-out`，渐变停靠 40/50/60%，`background-size: 200%`，RTL 反向，reduced-motion 下不启动 | Tailwind | 建议：暴露 duration、angle |
| L32 | Spinner / Skeleton / Progress 基础件 | shadcn (A) | `apps/v4/registry/new-york-v4/ui/{spinner,skeleton,progress}.tsx` | Spinner 带 `role="status"` 和 `aria-label="Loading"`；examples 里有 spinner-button、spinner-input-group 等 10 种用法 | lucide-react | size（`size-4` 起） |
| L33 | 骨架屏模式（card / content / form / list / profile / table） | kibo patterns (A) | `packages/patterns/skeleton/<组>/skeleton-<组>-N.tsx`（共 30） | 现成的六类场景骨架 | shadcn | 需与 L28/L31 的 shimmer 合并 |
| L34 | Loaders（7）+ Progress bars | HyperUI (A) | `public/examples/application/loaders/{1..7}.html`、`progress-bars/` | `role="status" aria-label="Loading"` + SVG `animate-spin`，零 JS | 无 | 建议：颜色 token 化 |
| L35 | Spinner + Animated Timeline | animata (A) | `animata/progress/spinner.tsx`、`animata/progress/animatedtimeline.tsx` | 渐变环 spinner（`outerSize`/`childSize` 可调）、动画时间线 | 无 | outerSize、childSize |
| L36 | Split Reveal / Vertical Tiles 页面开屏 | animata (A) | `animata/preloader/split-reveal/*`、`animata/preloader/vertical-tiles.tsx` | 带图片预加载、进度计数、shutter 遮罩的开屏；vertical-tiles 用 motion | motion | 待核 |
| L37 | Ring Chart / Gauge Chart / Progress（环形进度） | animata (A) | `animata/graphs/{ring-chart,gauge-chart,progress}.tsx` | 116/104/53 行，未见外部依赖 | 无 | 建议：value、size、stroke、duration |
| L38 | Radial Progress | daisyUI (A) | `packages/daisyui/src/components/radialprogress.css` | 纯 CSS 圆环进度 | Tailwind | `--value`、`--size`（未核实变量名） |
| L39 | 下拉刷新 | react-simple-pull-to-refresh (A，未读源码) | 仓库根 | 唯一在 GitHub 搜到的活跃 MIT React 方案；样式需我们重做 | 无 | 建议：阈值 80px、弹性、加载态图标 |
| L40 | Orb（AI 状态球） | elevenlabs/ui (A) | `apps/www/registry/elevenlabs-ui/ui/orb.tsx` | 语音/AI 状态视觉；依赖 three，体积较大 | three | 待核 |
| L41 | Shimmering Text / Bar Visualizer / Live Waveform | elevenlabs/ui (A) | `.../ui/{shimmering-text,bar-visualizer,live-waveform}.tsx` | 语音"聆听/说话"状态可视化；仅 shimmering-text 依赖 motion | motion（仅 shimmering-text） | 待核 |
| L42 | Progress / Meter / Spinner（Base UI 版） | coss/ui (B) | `apps/ui/registry/default/particles/p-progress-{1..3}.tsx`、`p-spinner-1.tsx` | Base UI 语义，示例简洁 | @base-ui/react | 许可 B，暂不入库 |
| L43 | 骨架屏 shimmer 卡片（渐变 1.5s） | galaxy (B) | `loaders/vk-uiux_neat-goat-26.html` | 纯 CSS，90° 渐变 `background-size:300%` 位移动画 | 无 | 需保留 Uiverse 作者注释 |
| L44 | 消息骨架（头像 + 两行 + 圆点） | galaxy (B) | `loaders/sahilxkhadka_proud-octopus-27.html` | Tailwind `animate-pulse` 10 行 | Tailwind | 同上 |

### 2.2 反馈（Feedback）

| # | 名称 | 来源 | 路径 | 为什么好 | 依赖 | 可调参数建议 |
|---|---|---|---|---|---|---|
| F01 | Sonner（堆叠 toast） | sonner (A) | `src/index.tsx`、`src/styles.css` | 堆叠/展开、hover 暂停计时（index.tsx:207 `pauseTimer`）、切换标签页暂停、swipe 关闭；reduced-motion 下关闭全部 transition/animation（styles.css:708） | 无（仅 React） | duration 4000ms、visibleToasts 3、gap 14、width 356、swipe 阈值 45（源码常量） |
| F02 | Sonner 加载条（12 条渐隐 loader） | sonner (A) | `src/styles.css`（`.sonner-loader` / `.sonner-loading-bar`） | 可单独摘出作 loading→success 转换图标 | 无 | 建议：条数、周期 |
| F03 | Goey Toast（形变 toast） | goey-toast (A) | `src/components/{GooeyToast,GooeyToaster,AriaLiveAnnouncer}.tsx` | 6 个位置且右侧自动镜像；4 个 preset（smooth/bouncy/subtle/snappy）；自带 aria-live 播报与 `usePrefersReducedMotion` 及测试 | sonner、framer-motion | spring 开关、bounce 0.05–0.8（默认 0.4）、displayDuration 4000、position（源码 README） |
| F04 | react-hot-toast 动画图标（Checkmark / Error / Loader） | react-hot-toast (A) | `src/components/{checkmark,error,loader,toast-icon}.tsx` | 成功对勾、失败叉、加载环三件套；enter 0.35s `cubic-bezier(.21,1.02,.73,1)`，exit 0.4s `cubic-bezier(.06,.71,.55,1)`；`prefersReducedMotion()` 缓存检测（core/utils.ts:8） | goober | duration、position |
| F05 | Toast（Base UI，堆叠 + 变高） | coss/ui (B) | `apps/ui/registry/default/ui/toast.tsx`、`particles/p-toast-{1..13}.tsx` | 按位置自动决定 swipe 方向；update 时用 even/odd 两个 keyframe 名重播动画；13 个示例含"变高堆叠" | @base-ui/react | 许可 B，建议等确认后再取 |
| F06 | Basic Toast | smoothui (A) | `packages/smoothui/components/basic-toast/index.tsx` | 四种类型图标（success/error/info/warning）、`duration`、`onClose`、react-dom portal | motion、lucide-react | type、duration、message |
| F07 | Sonner 用法模式（content / interactive / position / promise / standard，共 24） | kibo patterns (A) | `packages/patterns/sonner/<组>/sonner-<组>-N.tsx` | promise（loading→success/error）与可交互 toast 的现成写法 | shadcn sonner | 需视觉筛选 |
| F08 | Toasts（6）+ Alerts | HyperUI (A) | `public/examples/application/toasts/{1..6}.html`、`alerts/` | `role="alert"`，语义色齐全 | 无 | 建议：加入入/出场过渡 |
| F09 | Alert / Toast 容器 | daisyUI (A) | `packages/daisyui/src/components/{alert,toast}.css` | toast 是位置堆叠容器（九宫格位置）；alert 有 info/success/warning/error | Tailwind | 位置、颜色 token |
| F10 | Alert（20 变体） | reui (A) | `registry-reui/bases/base/components/alert/c-alert-N.tsx` | 语义色 + 图标 + 操作按钮变体 | shadcn | 静态为主 |
| F11 | Announcement / Banner / Status | kibo (A) | `packages/{announcement,banner,status}/index.tsx` | banner 可关闭（use-controllable-state）；status 为状态点 | lucide-react | 变体色 |
| F12 | Empty 状态 | shadcn (A) | `apps/v4/registry/new-york-v4/ui/empty.tsx`；examples：empty-avatar-group、empty-background、empty-icon、empty-input-group、empty-outline | Header/Media/Title/Description/Content 结构清晰 | 无 | media 变体 icon/avatar |
| F13 | Empty 模式（actions / data / search / standard，共 22）+ reui Empty（20） | kibo patterns、reui (A) | `packages/patterns/empty/**`、`registry-reui/bases/base/components/empty/c-empty-N.tsx` | 覆盖搜索无结果、无数据、需引导操作等场景 | shadcn | 需视觉筛选 |
| F14 | 空状态（marketing/empty-content 5 + application/empty-states 5） | HyperUI (A) | `public/examples/marketing/empty-content/`、`application/empty-states/` | 纯 HTML | 无 | — |
| F15 | Button Copy（idle → loading → success） | smoothui (A) | `packages/smoothui/components/button-copy/index.tsx` | 三态；`loadingDuration` 后进入 success，`duration` 默认 2000ms 后复位；多个 timer 统一清理 | motion、lucide-react | loadingDuration、duration（源码） |
| F16 | Copy Button | spell-ui (A) | `registry/spell-ui/copy-button.tsx` | 1500ms 复位，`aria-label` 在 "Copied" / "Copy to clipboard" 间切换 | lucide-react | size sm/default/lg |
| F17 | Snippet（复制代码片段） | kibo (A) | `packages/snippet/index.tsx` | 检测 `navigator.clipboard.writeText` 可用性后再复制，`timeout` 默认 2000ms | lucide-react | timeout |
| F18 | Save Button（保存态形变） | uselayouts (A) | `registry/default/example/save-button.tsx` | 144 行，spring 状态切换，无外部依赖（仅 motion） | motion | 建议：saving/saved 时长 |
| F19 | Delete Button（确认删除） | uselayouts (A) | `registry/default/example/delete-button.tsx` | 内含 `dialConfig`（duration 0.3/0.4）可调；依赖 `dialkit`（MIT） | motion、dialkit | dialConfig |
| F20 | Status Button | animata (A) | `animata/button/status-button.tsx` | 按钮内状态切换，lucide + motion | motion、lucide-react | 待核 |
| F21 | Feedback Bar（👍/👎） | prompt-kit (A) | `components/prompt-kit/feedback-bar.tsx` | AI 回答反馈条 | lucide-react | — |
| F22 | Emoji Reaction / Notification Badge | smoothui (A) | `packages/smoothui/components/{emoji-reaction,notification-badge}/index.tsx` | 反应弹出、角标计数 | motion、lucide-react | 待核 |
| F23 | AI Approval（批准/拒绝确认） | smoothui (A) | `packages/smoothui/components/ai-approval/index.tsx` | 人工确认类反馈；未逐行审阅 | 待核 | — |
| F24 | Alert Dialog 成功模式（5） | kibo patterns (A) | `packages/patterns/alert-dialog/success/alert-dialog-success-{1..5}.tsx` | 成功确认弹窗现成写法 | shadcn | — |
| F25 | 动效图标：check / circle-check / clipboard-check / bell | pqoqubbw/icons (A) | `icons/{check,circle-check,clipboard-check,bell}.tsx` | 成功/复制/通知图标自带动效 | motion | 动效未审 |
| F26 | Notifications 池（24）+ Meraki Alerts（9） | galaxy (B)、meraki (A) | `Notifications/*.html`、`components/alerts/*.html` | 备选池 | 无 | galaxy 需保留作者注释 |

### 2.3 输入与控件（Inputs & controls）

| # | 名称 | 来源 | 路径 | 为什么好 | 依赖 | 可调参数建议 |
|---|---|---|---|---|---|---|
| I01 | Animated Toggle（default / morph / icon） | smoothui (A) | `packages/smoothui/components/animated-toggle/index.tsx` | 三种变体、`icons` 可传自定义 on/off 图标、`size` sm/md/lg、支持受控与非受控 | motion | bounce 0.1、duration 0.25（源码）、variant、size |
| I02 | Animated Checkbox | spell-ui (A) | `registry/spell-ui/animated-checkbox.tsx` | 89 行，motion 描边对勾 | motion | 建议：描边时长 |
| I03 | Checkbox / Radio Group（motion 版） | smoothui (A) | `packages/smoothui/components/{checkbox,radio-group}/index.tsx` | 基于 radix-ui，保留键盘/焦点语义，叠加 motion | radix-ui、motion | — |
| I04 | Choicebox（单选卡片） | kibo (A) | `packages/choicebox/index.tsx` | 单选卡片形态，基于 shadcn radio-group | shadcn | — |
| I05 | Switch / Checkbox / Radio / Slider / Toggle Group 基础件 | shadcn (A) | `apps/v4/registry/new-york-v4/ui/{switch,checkbox,radio-group,slider,toggle-group,toggle}.tsx` | 语义最标准，作为无花哨基线；examples 有 field-switch、field-choice-card 等 | radix-ui | — |
| I06 | Switch 变体（9）、Slider（23）、Checkbox Group（5） | coss/ui (B) | `apps/ui/registry/default/particles/p-{switch,slider,checkbox-group}-N.tsx` | 变体丰富，Base UI 版；许可 B | @base-ui/react | 暂不入库 |
| I07 | Switch（14）/ Slider（12）/ Rating（9） | reui (A) | `registry-reui/bases/base/components/{switch,slider,rating}/c-*-N.tsx` | 变体数量大 | shadcn | 需视觉筛选 |
| I08 | Toggle Switch / Swipe Button / Ripple Button / Shining Button | animata (A) | `animata/button/{toggle-switch,swipe-button,ripple-button,shining-button}.tsx` | 纯 CSS/少依赖（前三者无外部 import），滑动确认与波纹反馈 | 无（shining-button 用 lucide） | 待核 |
| I09 | Arrow Button / Slide Arrow Button / Get Started Button | animata (A) | `animata/button/{arrow-button,slide-arrow-button,get-started-button}.tsx` | 悬停箭头位移类 CTA | lucide-react | — |
| I10 | Hold Button（长按确认）/ Attract Button / Slide Text Button / Social Button | kokonut (A) | `components/kokonutui/{hold-button,attract-button,slide-text-button,social-button}.tsx` | Hold Button 用 cva+motion；已在前文列出 hold-button，这里补另外三个 | motion、lucide-react、cva | — |
| I11 | Gradient Button / Command Button | kokonut (A) | `components/kokonutui/{gradient-button,command-button}.tsx` | 无外部依赖（command-button 仅 lucide） | 无 / lucide-react | — |
| I12 | Glow / Cosmic / Neumorph / Texture 按钮 | cult-ui (A) | `apps/www/registry/default/ui/{glow-button,cosmic-button,neumorph-button,texture-button}.tsx` | glow/cosmic 无外部依赖；texture 用 slot+cva | 无 / cva / motion | — |
| I13 | Metal Button / Border Beam Button | cult-ui (A) | `.../{metal-button,border-beam-button}.tsx` | 依赖 `metal-fx`、`border-beam`（均 MIT，npm 核实） | metal-fx、border-beam | — |
| I14 | Gradient Button Group / Family Button | cult-ui (A) | `.../{gradient-button-group,family-button}.tsx` | 按钮组与多态展开；gradient-button-group 用 next-themes | motion、next-themes | 需去 Next 化 |
| I15 | Tactile Button | uselayouts (A) | `registry/default/example/tactile-button.tsx` | 216 行，spring 按压反馈，forwardRef 组件 | framer-motion | spring 参数 |
| I16 | Smooth Button / Magnetic Button / Dot Morph Button / Power Off Slide | smoothui (A) | `packages/smoothui/components/{smooth-button,magnetic-button,dot-morph-button,power-off-slide}/index.tsx` | 覆盖常规、磁吸、点阵形变、滑动确认 | motion、slot、cva | — |
| I17 | Flow / Pop / Rich Button | spell-ui (A) | `registry/spell-ui/{flow-button,pop-button,rich-button}.tsx` | 均仅依赖 radix slot | @radix-ui/react-slot | — |
| I18 | Label Input（浮动标签） | spell-ui (A) | `registry/spell-ui/label-input.tsx` | 107 行，仅 lucide；有 colors/password 示例（docs/label-input） | lucide-react | — |
| I19 | Animated Input（浮动标签，0.28s） | smoothui (A) | `packages/smoothui/components/animated-input/index.tsx` | props：label、icon、value/defaultValue、disabled；标签动画 0.28s（源码） | motion | duration 0.28 |
| I20 | Float Label CSS | float-label-css (A，未读源码) | 仓库根 | 纯 CSS 浮动标签；README 称有降级 | 无 | 需读源码确认 |
| I21 | Morphing Input | uselayouts (A) | `registry/default/example/morphing-input.tsx` | 125 行，spring `duration 0.25 bounce 0` | motion | duration、bounce |
| I22 | Exploding Input | spell-ui (A) | `registry/spell-ui/exploding-input.tsx` | 403 行，无外部依赖；粒子式提交反馈（未审） | 无 | — |
| I23 | Inline Edit / Set Timer | uselayouts (A) | `registry/default/example/{inline-edit,set-timer}.tsx` | inline-edit 用 `bounce 0.1`；set-timer `stiffness 400` | motion | — |
| I24 | OTP：Animated OTP Input | smoothui (A) | `packages/smoothui/components/animated-o-t-p-input/index.tsx` | 基于 input-otp；`onComplete` 回调、动画时长常量（EASE_OUT_QUINT） | input-otp、motion、lucide-react | maxLength、onComplete |
| I25 | OTP 原语 + 示例 | input-otp (A)、shadcn (A) | npm `input-otp`；`apps/v4/registry/new-york-v4/examples/input-otp-{demo,controlled,pattern,separator}.tsx` | 事实标准，处理粘贴/自动填充 | input-otp | pattern、maxLength |
| I26 | OTP Field（Base UI 官方 demo） | base-ui (A) | `docs/src/app/(docs)/react/components/otp-field/demos/{hero,alphanumeric,grouped,password,focused-placeholder}/tailwind/index.tsx` | 官方 demo，Tailwind 版；含分组/密码/字母数字 | @base-ui/react | — |
| I27 | OTP 模式（behavior / standard / states / use-cases / variants，共 20）+ reui OTP（6） | kibo patterns、reui (A) | `packages/patterns/input-otp/**`、`registry-reui/bases/base/components/input-otp/` | 含错误/成功状态 | shadcn | 需视觉筛选 |
| I28 | Action Search Bar / AI Input Search | kokonut (A) | `components/kokonutui/{action-search-bar,ai-input-search}.tsx` | 350/186 行，搜索+动作建议，键盘可用；motion+lucide | motion、lucide-react | — |
| I29 | Favicon Search / Searchable Dropdown | smoothui (A) | `packages/smoothui/components/{favicon-search,searchable-dropdown}/index.tsx` | 带过滤的搜索控件 | motion、lucide-react、react-dom | 待核 |
| I30 | Dropzone | kibo (A) | `packages/dropzone/index.tsx` | 包装 react-dropzone，暴露 `accept`、`maxSize`、`maxFiles`，有自定义 empty state 示例 | react-dropzone、lucide-react | accept、maxSize、maxFiles |
| I31 | Animated File Upload | smoothui (A) | `packages/smoothui/components/animated-file-upload/index.tsx` | props：accept、maxSize、multiple、disabled、onFilesSelected；spring bounce 0.1/0.2 | motion | — |
| I32 | File Upload（584 行） | kokonut (A) | `components/kokonutui/file-upload.tsx` | 完整上传流程 UI，含状态与进度（未逐行审） | motion、lucide-react | — |
| I33 | File Upload（全页拖放） | prompt-kit (A) | `components/prompt-kit/file-upload.tsx` | 使用 react-dom portal，适合聊天输入的全窗口拖放 | react-dom | — |
| I34 | File Upload（10 变体） | reui (A) | `registry-reui/bases/base/components/file-upload/c-file-upload-N.tsx` | 变体多，静态排版 | shadcn | 需视觉筛选 |
| I35 | Animated Stepper（horizontal / vertical） | smoothui (A) | `packages/smoothui/components/animated-stepper/index.tsx` | `allowClickNavigation`、`currentStep` 受控、`steps[].icon/description/content` | motion | variant、bounce 0.1/0.2、duration 0.3 |
| I36 | Stepper（独有件）+ 15 变体 | reui (A) | `registry-reui/bases/base/reui/stepper.tsx`、`components/stepper/c-stepper-N.tsx` | 可访问的分步件，仅依赖 cn/cva | class-variance-authority | 静态为主 |
| I37 | Steps（5）/ Steps（daisyUI） | HyperUI (A)、daisyUI (A) | `public/examples/application/steps/*.html`、`packages/daisyui/src/components/steps.css` | 零依赖基线 | 无 / Tailwind | — |
| I38 | 分段控件：Animated Tabs（underline / pill / segment） | smoothui (A) | `packages/smoothui/components/animated-tabs/index.tsx` | 共享 `layoutId` 指示器；spring `bounce 0.05 duration 0.25`；`onChange`，受控/非受控 | motion | variant、layoutId |
| I39 | Discrete Tabs / Vertical Tabs | uselayouts (A) | `registry/default/example/{discrete-tabs,vertical-tabs}.tsx` | spring `damping 20`；vertical 使用 0.34s 过渡 | motion | damping、duration |
| I40 | Rating（可访问星级） | kibo (A) | `packages/rating/index.tsx` | 处理 hover 值与键盘焦点（`focusedStar`），支持自定义图标、颜色、大小 | lucide-react、use-controllable-state | icon、size、color（示例：rating-icon/size/colors） |
| I41 | Rating（独有件）/ daisyUI Rating | reui (A)、daisyUI (A) | `registry-reui/bases/base/reui/rating.tsx`、`packages/daisyui/src/components/rating.css` | 前者 cn+react；后者纯 CSS 半星 | 无 / Tailwind | — |
| I42 | Color Picker | cult-ui (A)、kibo (A) | `apps/www/registry/default/ui/color-picker.tsx`、`packages/color-picker/index.tsx` | 两套实现可对照选择 | motion、lucide-react / 待核 | — |
| I43 | Duration Picker / Animated Number Input / Scrubber / Animated Tags | smoothui (A) | `packages/smoothui/components/{duration-picker,animated-number-input,scrubber,animated-tags}/index.tsx` | 数值/时间类小控件 | motion、lucide-react | — |
| I44 | Phone Input / Number Field / Sortable / Timeline | reui (A) | `registry-reui/bases/base/reui/{phone-input,number-field,sortable,timeline}.tsx` | 常规控件的可访问实现 | 待核 | — |
| I45 | Field / Input Group / Button Group / Kbd | shadcn (A) | `apps/v4/registry/new-york-v4/ui/{field,input-group,button-group,kbd}.tsx` | 表单布局与"输入+按钮+提示"的标准组合，examples 覆盖 ~40 种 | radix-ui | — |
| I46 | Theme Toggle / Music Toggle | smoothui (A) | `packages/smoothui/components/{theme-toggle,music-toggle}/index.tsx` | 图标形变开关 | motion、lucide-react | — |
| I47 | Prompt Box / Slide Subscribe | uselayouts (A) | `registry/default/example/{prompt-box,slide-subscribe}.tsx` | prompt-box 带设置分组与 + 菜单选项类型，slide-subscribe 过渡 0.14/0.22s | motion | — |
| I48 | AI Prompt / Prompt Input | kokonut (A)、prompt-kit (A) | `components/kokonutui/ai-prompt.tsx`、`components/prompt-kit/prompt-input.tsx` | 聊天输入框两种实现 | motion / radix | — |
| I49 | 输入/开关/复选/单选池 | galaxy (B) | `Inputs/`(227)、`Toggle-switches/`(261)、`Checkboxes/`(172)、`Radio-buttons/`(103)、`Buttons/`(1232) | 数量池；例：`Toggle-switches/catraco_brown-termite-67.html`（tag: light&dark slide）、`Checkboxes/LeonKohli_average-impala-100.html`（svg、glow）——仅按标签挑选，未看效果 | 无 | 必须先视觉筛选并保留作者注释 |
| I50 | 表单基础款：Inputs（13）、Toggles（4）、Checkboxes、Range、File uploaders（2） | meraki (A)、HyperUI (A)、daisyUI (A) | `components/inputs/`；`public/examples/application/{toggles,checkboxes,range-inputs,file-uploaders}/`；`packages/daisyui/src/components/{toggle,checkbox,range,fileinput,otp,validator}.css` | 无 JS 基线，适合"零依赖"标签 | 无 / Tailwind | — |

### 2.4 导航与浮层（Navigation & overlays）

| # | 名称 | 来源 | 路径 | 为什么好 | 依赖 | 可调参数建议 |
|---|---|---|---|---|---|---|
| N01 | cmdk 命令面板（引擎） | cmdk (A) | `cmdk/src/index.tsx`、`command-score.ts` | 模糊匹配、分组、`Command.Loading`、`shouldFilter={false}` 支持异步 | @radix-ui/react-dialog 等 | 建议：列表最大高度、分组标题样式 |
| N02 | cmdk 四套主题（Vercel / Linear / Raycast / Framer） | cmdk (A) | `website/components/cmdk/{vercel,linear,raycast,framer}.tsx` + `website/styles/cmdk/*.scss` | 现成的四种高完成度视觉；SCSS 需转 Tailwind 或纯 CSS | cmdk、framer（framer 主题依赖 motion，未核） | 主题 token |
| N03 | Command（shadcn 封装）/ kbar | shadcn (A)、kbar (A，未读源码) | `apps/v4/registry/new-york-v4/ui/command.tsx`；kbar 仓库根 | shadcn 版是 cmdk 的标准封装；kbar 带自有动画（未读） | cmdk | — |
| N04 | Autocomplete 命令面板 demo（含键盘快捷键、分组、虚拟化） | base-ui (A) | `docs/src/app/(docs)/react/components/autocomplete/demos/{command-palette,keyboard-shortcuts,grouped,virtualized,async}/tailwind/index.tsx` | 官方示例，Tailwind 与 CSS Modules 双版本 | @base-ui/react | — |
| N05 | Combobox 系列（async、multiple、creatable） | base-ui (A) | `docs/.../combobox/demos/{async-single,async-multiple,creatable,create-items}/tailwind/index.tsx` | 9 个 demo，异步与创建项覆盖全 | @base-ui/react | — |
| N06 | Vaul 抽屉 | vaul (A) | `src/index.tsx`、`style.css`、`use-snap-points.ts`、`use-scale-background.ts` | 拖拽关闭、snap points、背景缩放；过渡 0.5s `[0.32,0.72,0,1]`；速度阈值 0.4、关闭阈值 0.25 | @radix-ui/react-dialog | duration、ease、snapPoints（源码） |
| N07 | Drawer 系列（snap-points、swipe-area、nested、non-modal、mobile-nav、virtual-keyboard-aware…共 11） | base-ui (A) | `docs/.../drawer/demos/<名>/tailwind/index.tsx` | 覆盖软键盘、嵌套、非模态等难点 | @base-ui/react | — |
| N08 | Drawer（14）/ Dialog（6）/ Popover / Tooltip / Preview Card / Menu / Toolbar | coss/ui (B) | `apps/ui/registry/default/ui/*.tsx`、`particles/p-drawer-N.tsx` | 完整 Base UI 套件；许可 B | @base-ui/react | 暂不入库 |
| N09 | Sheet / Dialog / Alert Dialog / Drawer | shadcn (A) | `apps/v4/registry/new-york-v4/ui/{sheet,dialog,alert-dialog,drawer}.tsx` | 标准基线（drawer 基于 vaul） | radix-ui、vaul | side、size |
| N10 | Dropdown / Context Menu / Menubar / Navigation Menu / Popover / Hover Card / Tooltip | shadcn (A) | `.../ui/{dropdown-menu,context-menu,menubar,navigation-menu,popover,hover-card,tooltip}.tsx` | 标准基线；动效用 tw-animate-css | radix-ui | — |
| N11 | Breadcrumb / Pagination / Avatar / Badge / Tabs / Accordion | shadcn (A) | `.../ui/{breadcrumb,pagination,avatar,badge,tabs,accordion}.tsx` | 标准基线 | radix-ui | — |
| N12 | Animated Tooltip | smoothui (A) | `packages/smoothui/components/animated-tooltip/index.tsx` | 仅依赖 motion | motion | — |
| N13 | Dialog / Basic Modal / Drawer / Country Dialog | smoothui (A) | `packages/smoothui/components/{dialog,basic-modal,drawer,country-dialog}/index.tsx` | dialog 基于 radix-ui；basic-modal 用 `usehooks-ts`；country-dialog 带列表选择 | motion、radix-ui、usehooks-ts | — |
| N14 | Dropdown Menu / Basic Dropdown / Context Menu / Select / Combobox | smoothui (A) | `packages/smoothui/components/{dropdown-menu,basic-dropdown,context-menu,select,combobox}/index.tsx` | 菜单类 motion 版 | motion、lucide-react、react-dom | — |
| N15 | Rich Popover / User Account Avatar / Animated Avatar Group | smoothui (A) | `packages/smoothui/components/{rich-popover,user-account-avatar,animated-avatar-group}/index.tsx` | rich-popover 基于 radix popover | @radix-ui/react-popover、motion | — |
| N16 | Pagination / Breadcrumb / Basic Accordion | smoothui (A) | `packages/smoothui/components/{pagination,breadcrumb,basic-accordion}/index.tsx` | motion 版 | motion、lucide-react | — |
| N17 | Direction Aware Tabs | cult-ui (A) | `apps/www/registry/default/ui/direction-aware-tabs.tsx` | 137 行，根据切换方向决定内容滑入方向；react-use-measure | motion、react-use-measure | — |
| N18 | Floating Panel / Popover / Popover Form | cult-ui (A) | `.../ui/{floating-panel,popover,popover-form}.tsx` | 948/352/332 行，形变式浮层与内嵌表单 | motion、lucide-react | — |
| N19 | Side Panel / Expandable / Sortable List / Toolbar Expandable | cult-ui (A) | `.../ui/{side-panel,expandable,sortable-list,toolbar-expandable}.tsx` | 可展开面板与列表排序（前文已列 toolbar-expandable，此处补其余） | motion、react-use-measure、radix scroll-area | — |
| N20 | Intro Disclosure / Onboarding | cult-ui (A) | `.../ui/{intro-disclosure,onboarding}.tsx` | 引导流程组件，676/883 行；intro-disclosure 用 next/image | motion、cva、use-controllable-state | 需去 Next 化 |
| N21 | Smooth Tab / Smooth Drawer / Toolbar | kokonut (A) | `components/kokonutui/{smooth-tab,smooth-drawer,toolbar}.tsx` | smooth-drawer 用 next/image、next/link | motion、lucide-react | 需去 Next 化 |
| N22 | Profile Dropdown / Team Selector / Avatar Picker | kokonut (A) | `components/kokonutui/{profile-dropdown,team-selector,avatar-picker}.tsx` | avatar-picker 与 team-selector 有 reduced-motion 处理（grep 命中） | lucide-react、motion、next/image | — |
| N23 | Fluid Tabs / Gooey Tabs / Shift Tabs | animata (A) | `animata/tabs/{fluid-tabs,gooey-tabs,shift-tabs}.tsx` | shift-tabs 无外部依赖；fluid/gooey 用 motion | motion（shift-tabs 无） | — |
| N24 | Nav Tabs / Sibling Focus Nav / Menu Animation / Announcement Ribbon | animata (A) | `animata/container/{nav-tabs,sibling-focus-nav,announcement-ribbon}.tsx`、`animata/list/menu-animation.tsx` | sibling-focus-nav 无外部依赖；announcement-ribbon 用 next/link | motion / lucide-react | 需去 Next 化 |
| N25 | Modal / FAQ Accordion | animata (A) | `animata/overlay/modal.tsx`、`animata/accordion/faq.tsx` | modal 用 motion+lucide；faq 基于 radix accordion | motion、@radix-ui/react-accordion | — |
| N26 | Smooth Dropdown / Create Menu / Bottom Menu / Dynamic Toolbar | uselayouts (A) | `registry/default/example/{smooth-dropdown,create-menu,bottom-menu,dynamic-toolbar}.tsx` | smooth-dropdown spring `damping 34`；create-menu `bounce 0.3` | motion | damping、bounce |
| N27 | Curve Drawer / Drawer Buttons / Gooey Navbar | uselayouts (A) | `registry/default/example/{curve-drawer,drawer-buttons,gooey-navbar}.tsx` | 形变/弧形抽屉、goo 导航 | motion | — |
| N28 | Avatar Stack / Dialog Stack / Pill / Tags / Theme Switcher | kibo (A) | `packages/{avatar-stack,dialog-stack,pill,tags,theme-switcher}/index.tsx` | dialog-stack 是可叠加多层对话框（484 行）；theme-switcher 用 motion | radix-ui、use-controllable-state、motion | — |
| N29 | Tooltip / Preview Card（官方 demo） | base-ui (A) | `docs/.../tooltip/demos/`（4）、`preview-card/demos/`（4，含 detached-triggers） | detached triggers 让多个触发器共用一个浮层 | @base-ui/react | delay、side |
| N30 | Toast anchored / position（官方 demo） | base-ui (A) | `docs/.../toast/demos/{hero,anchored,position}/tailwind/index.tsx` | 锚定到触发元素的 toast（少见） | @base-ui/react | — |
| N31 | Vertical menu（8）/ Tabs（5）/ Breadcrumbs（5）/ Pagination（3）/ Modals（6）/ Dropdown（3）/ Badges（5） | HyperUI (A) | `public/examples/application/{vertical-menu,tabs,breadcrumbs,pagination,modals,dropdown,badges}/` | 无 JS 静态基线（Modal 需自加逻辑） | 无 | — |
| N32 | 导航 CSS 套件：modal、drawer、dropdown、menu、navbar、tab、tooltip、dock、breadcrumbs、pagination、avatar、badge、indicator | daisyUI (A) | `packages/daisyui/src/components/*.css` | 纯 CSS，含 RTL 与 reduced-motion 处理的一部分 | Tailwind | — |
| N33 | Tooltips 池（63）| galaxy (B) | `Tooltips/*.html` | 备选池 | 无 | 需视觉筛选 |
| N34 | Tooltip（7）/ Tabs / Pagination / Breadcrumbs | meraki (A) | `components/{tooltip,tabs,pagination,breadcrumbs}/*.html` | 纯 HTML | 无 | 低优先级 |

## 3. 各组细节笔记（Craft notes）

以下"读到的事实"来自上面列出的源码；标"建议"的是我们的经验规则，未经真机验证，入库时应做成可调参数并在真实设备上确认。

### 3.1 加载与等待

- **循环周期**：ldrs 42 个加载器的默认 `speed` 集中在 0.9–2.5s（如 tailspin 0.9s、helix 2.5s、hatch 3.5s，`src/elements/*.ts` 的 `applyDefaultProps`）；react-spinners 的 PulseLoader 为 0.75s、点间错开 0.12s、`cubic-bezier(0.2,0.68,0.18,1.08)`（`src/PulseLoader.tsx`）；prompt-kit 的 TextShimmer 默认 4s（`text-shimmer.tsx`）。建议把"每圈时长"做成统一的 `speed` 倍率参数。
- **骨架屏 shimmer**：react-loading-skeleton 默认 1.5s `ease-in-out`（skeleton.css:10、:49）；daisyUI 为 1.8s `ease-in-out`，105° 渐变、停靠 40/50/60%、`background-size:200%`，并在 RTL 下反向（`skeleton.css`）；phantom-ui 默认 1.5s，并支持 shimmer/pulse/breathe/solid 四种模式。建议：默认 1.5s，颜色用 token（亮/暗两套），并暴露方向。
- **骨架尺寸匹配**：react-loading-skeleton 让骨架自动匹配文字行高，phantom-ui 测量真实 DOM 叶子元素——两者都是为了避免内容加载后布局跳动（CLS）。smoothui 的 `skeleton-loader` 则用"隐藏子元素 + 覆盖层"保持布局。
- **reduced-motion**：现状差异很大。ldrs / SpinKit / react-spinners / css-loaders 的样式里没有任何 `prefers-reduced-motion` 处理（grep 0 命中）；daisyUI 把动画包进 `@media (prefers-reduced-motion: no-preference)`；react-loading-skeleton 在 reduce 下隐藏动画伪元素；smoothui 的 motion-loader 内部带 `reduce` 标志；phantom-ui 在 reduce 下改静态遮罩。建议：统一注入"reduce 时改为低频透明度脉冲或静态点"，而不是完全静止（完全静止会让用户误以为卡死）。
- **可访问性**：shadcn Spinner 用 `role="status"` + `aria-label="Loading"`；prompt-kit 圆形 loader 内带 `<span class="sr-only">Loading</span>`；smoothui 骨架屏用 `aria-busy`；HyperUI loader 用 `role="status"`。建议每个 loader 都带可配置的读屏文案。
- **AI 思考状态**：smoothui `ai-loader` 的 `showElapsed` 在源码注释里写明"长等待需要进度迹象"；prompt-kit 提供 Thinking Bar（可停止）、Reasoning（可折叠）、Chain of Thought/Steps（分步）——把"等待"拆成可见的过程。建议：等待超过一定时间后从"点点点"升级为带文字与已用时的形态。
- **延迟出现与最短展示**（建议，通用交互经验，未在上述源码中出现）：短请求不显示 loader（例如 200–300ms 后才出现），一旦出现至少展示约 500ms，避免闪烁。这类逻辑应放在我们提供的 `useDelayedLoading` 之类的小 hook 里。
- **页面级加载**：smoothui page-preloader（words/stairs/pixel/curtain，带 `onComplete`）、animata split-reveal（含图片预加载与进度计数）；原生 View Transitions 见 `components-motion.md`。
- **下拉刷新**：未找到高质量、活跃且许可清晰的 React 方案（react-simple-pull-to-refresh 仅确认了许可证，未读源码）。这是内容缺口，可能需要自研。

### 3.2 反馈

- **Toast 堆叠**：sonner 的常量（`src/index.tsx`）：同时可见 3 条、间距 14px、宽度 356px、默认寿命 4000ms、swipe 阈值 45px、卸载延迟 200ms；transition 400ms（`styles.css`）。hover/展开/文档不可见时暂停计时（`index.tsx:207–241`）。
- **Toast 与 reduced-motion / 读屏**：sonner 在 `prefers-reduced-motion` 下把 toast 及子元素的 transition 与 animation 全部关闭（`styles.css:708`）；react-hot-toast 缓存 `matchMedia('(prefers-reduced-motion: reduce)')` 结果（`core/utils.ts`）；goey-toast 有独立的 `AriaLiveAnnouncer` 与 `usePrefersReducedMotion`，且都有测试文件。建议：错误类 toast 不自动消失或延长时长，并可 Esc/按钮关闭。
- **Toast 更新动画**：coss/ui 的 toast 在同一条 toast 被更新（如 loading → success）时，用 `animate-toast-success-even/odd`、`animate-toast-error-even/odd` 交替 keyframe 重播动画（`toast.tsx` 的 `upsertReplayClassName`）——这个"用奇偶类名重触发动画"的技巧值得借鉴（但该目录许可为 B，需自己实现）。
- **入场/退场曲线**：react-hot-toast 入场 0.35s `cubic-bezier(.21,1.02,.73,1)`（带轻微过冲），退场 0.4s `cubic-bezier(.06,.71,.55,1)`（`toast-bar.tsx`）。goey-toast 的 `bounce` 范围 0.05–0.8、默认 0.4。
- **复制反馈**：spell-ui 复制按钮 1500ms 后复位并切换 `aria-label`（"Copied"/"Copy to clipboard"）；kibo snippet 默认 2000ms，且先检查 `navigator.clipboard.writeText` 是否可用；smoothui button-copy 有 idle→loading→success 三态，`duration` 默认 2000ms，并统一清理多个 timer。
- **空状态**：shadcn `Empty` 的结构（Header / Media / Title / Description / Content）+ `EmptyMedia variant="icon"`；kibo patterns 按"actions / data / search / standard"分类，说明空状态至少要区分"没有数据""搜索无结果""需要引导操作"三种。
- **成功/错误动画**：react-hot-toast 的 checkmark/error/loader 是三个独立的小 SVG 组件；pqoqubbw/icons 提供 check / circle-check / clipboard-check 等动效图标（动效未审）。

### 3.3 输入与控件

- **可访问性优先**：kibo Rating 单独维护 `focusedStar` 与 `hoverValue`（键盘焦点与鼠标悬停分离）；shadcn/Base UI/Radix 系的复选、单选、开关保留原生语义；smoothui 的 checkbox/radio-group 是"radix-ui + motion"叠加，而不是重写。建议：我们做自研花哨版本时也要保持 `role`、键盘操作与焦点环。
- **弹簧参数**（源码）：smoothui animated-tabs `bounce 0.05 / duration 0.25`、animated-toggle `bounce 0.1 / duration 0.25`、animated-progress-bar `stiffness 100 / damping 10 / mass 0.75`、uselayouts morphing-input `duration 0.25 / bounce 0`、smooth-dropdown `damping 34`、set-timer `stiffness 400`。共同点：控件类动画普遍在 0.15–0.3s，bounce 很小（≤0.1）。
- **浮动标签**：smoothui animated-input 标签动画 0.28s；spell-ui label-input 无 motion 依赖；float-label-css 声称纯 CSS 并带降级（README，未读源码）。纯 CSS 版可用 `:placeholder-shown` / `:focus-within`（通用做法，非来自上述源码）。
- **OTP**：几乎所有实现都基于 `input-otp`（smoothui、shadcn、kibo、reui）。Base UI 有自己的 OTP Field（官方 demo 含 alphanumeric、grouped、password、focused-placeholder）。
- **文件拖放**：kibo dropzone 只是包装 react-dropzone 并暴露 `accept`/`maxSize`/`maxFiles`；prompt-kit file-upload 用 react-dom portal 做全窗口拖放。建议：统一拖入态、拒绝态（类型/大小超限）、上传中与完成态四种视觉。
- **按钮反馈**：uselayouts tactile-button 与 kokonut hold-button 属于"按压/长按"反馈；save-button、delete-button、smoothui button-copy 属于"状态机按钮"（idle→busy→done）。

### 3.4 导航与浮层

- **抽屉手势**：vaul 常量：过渡 0.5s、`[0.32, 0.72, 0, 1]`，速度阈值 0.4、拖动关闭阈值 0.25、滚动锁定 100ms（`src/constants.ts`）；有 snap points 与背景缩放。Base UI 的 drawer demo 额外覆盖"虚拟键盘感知""嵌套""非模态"。
- **命令面板**：cmdk 支持 `shouldFilter={false}` 交给服务端过滤，并有 `Command.Loading`（README）；官网四套主题（Vercel/Linear/Raycast/Framer）是视觉参考。
- **焦点管理**：Radix / Base UI 负责焦点捕获、返回焦点、Esc 关闭与 `aria-*`。自研浮层如 cult-ui floating-panel、smoothui basic-modal（用 react-dom portal + `usehooks-ts`）需要逐个复查焦点陷阱与返回焦点——**未核实**它们是否处理。
- **共享布局指示器**：smoothui animated-tabs 用 `layoutId` 做 tab 指示器滑动，cult-ui direction-aware-tabs 根据切换方向决定内容滑入方向。
- **reduced-motion**：smoothui 大量使用 `useReducedMotion`；cult-ui 4 个文件命中；kokonut 3 个；kibo 1 个；animata 21 个文件命中 reduced-motion 相关关键词；vaul 与 cmdk 源码里 0 处。建议统一注入。
- **无 JS 基线**：HyperUI 与 daisyUI 提供无 JS 的 tabs/breadcrumb/pagination/modal 外观，适合作为"零依赖"标签。

## 4. 风险

1. **未做视觉评审**：清单里的"为什么好"是代码事实，不是审美结论；galaxy、kibo patterns（1103）、reui（1179）、coss particles（510）都是数量池，直接入库会拉低平均质量。
2. **Uiverse galaxy 的版权链**：MIT 由平台声明，作者为平台用户，存在"作者提交了他人代码"的风险（已见一例疑似，见 §0-7）；每个文件必须保留 `From Uiverse.io by <作者>` 注释；仓库自 2024-09 未推送，最新内容在 uiverse.io（授权未核实）。
3. **coss/apps/ui 许可不完整**（§0-5）；apps/origin 可用但难检索。
4. **Preline / rare-ui / sileo 及无 LICENSE 仓库**只做链接；不要因为 GitHub 页面写 MIT 徽章就采用（Preline 的徽章不包含 Fair Use 限制）。
5. **loaders.css 缺 LICENSE 文件**；**Flowbite 文档 CC BY 3.0 与商标**；smoothui 的 `gooey-popover` 依赖 GSAP（B）。
6. **外部依赖**：cult-ui 的 `metal-fx`、`border-beam`，uselayouts 的 `dialkit`、multi-step-form 的 `sonner/zod/react-hook-form/date-fns`，elevenlabs orb 的 `three`，smoothui 的 `usehooks-ts`。许可证仅核对了 metal-fx、border-beam、dialkit、input-otp、react-dropzone、goober、cmdk、@base-ui/react；其余（motion、lucide-react、radix-ui、cva、react-use-measure、usehooks-ts、react-hotkeys-hook 等）**未逐个核实**，入库前需自动扫描全部间接依赖。
7. **栈耦合**：kokonut、cult-ui、animata 部分组件引用 `next/image`、`next/link`、`next-themes`，需去 Next 化；prompt-kit 的 keyframes 在全局 CSS 里，拆单文件时会丢动画；ldrs 是 Shadow DOM Web Component，样式不能直接被外部覆盖，需转写。
8. **缺口**：下拉刷新、环形进度的高质量 A 级来源、浮动标签（除 spell-ui / smoothui / float-label-css 外）、成功/错误的"绘制型"对勾动画（除 react-hot-toast 与动效图标外）都偏少，可能需要自研。
9. **仓库活跃度**：SpinKit（2020）、loaders.css（2023）、whirl（2023）、vaul（2025-10）、cmdk（2025-10）、galaxy（2024）较久未推送；稳定但缺少对 React 19 / Tailwind 4 的验证。
10. **计数口径**："约 N 个"来自目录文件数，含 demo/stories/测试可能重复；kibo patterns、reui、coss particles 的数量是"变体文件数"，不是"独立组件数"。
11. **未做的事**：没有渲染或运行任何组件，没有测量性能与包体积；未读 kbar、animateicons、inspira-ui、crafter-station/elements 的源码；未验证 uiball.com/ldrs 与 uiverse.io 网站内容的授权；motion-primitives / magicui 的功能件（如 morphing-dialog、toolbar-expandable）已在前文，未在此重复。
