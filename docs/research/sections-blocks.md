# 调研：Sections（区块）来源——Hero / 定价 / 仪表盘等可整合的页面积木

调研日期：2026-09-29。方法：`gh api repos/.../license` 读取 LICENSE 原文（不只看 spdx_id）、读 README 授权段落、`git/trees` 统计目录、抽样读源码看 import 与外链图片。"未核实"处均已标明。**未做视觉评审**（没有逐个渲染），"为什么好"一栏是依据代码结构、依赖与 README 描述的判断，入库前须逐个渲染确认 2025–2026 观感。

分级：**A** 宽松许可，可带署名整合；**B** 代码宽松但有需替换的素材/依赖/技术栈过旧；**C** 仅链接（Commons Clause / 竞品条款 / NC / 无 license / 付费）。

## 0. 关键结论与许可证意外

1. **shadcn/studio（★1.9k）是 MIT + Commons Clause + "不得用于竞品"**。GitHub 标 `other`，README 徽章写 MIT，但 LICENSE 正文追加了 "No Sale or Redistribution of Components ... whether alone, in a bundle, or as a ported version - without modification" 与 "Competing Products" 条款。我们是组件市场，属于竞品/再分发，**C**。（此前 `components-motion.md` 把它列为"B/未核实"，应下调为 C。）
2. **shadcnblocks 的公开仓库全是 MIT + Commons Clause**（`shadcnblocks/shadcn-ui-blocks` ★401、`shadcnblocks/mainline-nextjs-template` ★360）：明文禁止 "sell, sublicense, or redistribute the components themselves - whether alone, in a bundle, or as a ported version"。**没有可用的 MIT 免费集**。`shadcnblockscom/openshadcnblocks`（0★）无 LICENSE。均 C。
3. **Preline（★6.5k）是"MIT + Preline UI Fair Use License"双重条款**，GitHub spdx 为 `NOASSERTION`。Fair Use 条款禁止用于"直接竞争 Preline UI 的产品或服务"，且再分发须附带该 Fair Use License、署名并链接原仓库，违规可终止授权。市场型产品有落入"竞品"的风险，**C（除非作者书面确认）**。
4. **Once UI 的 `magic-portfolio`（★1.4k）是 CC BY-NC 4.0**（非商业），C。`once-ui-system/nextjs-starter` 是 MIT，但只是起手模板，无区块价值。
5. **magicui 的 `changelog-template`（★206）无 LICENSE**，C；magicui 主仓库本身是干净 MIT（见下），但其网站自身的 sections（含真实用户推文/头像）要区别对待。
6. **Tailark / Flowbite Blocks / TailGrids blocks / Launch UI Pro / Cult UI Premium / ShadcnStore Premium Blocks**：均为付费或另有条款，仓库不含这些内容。Tailark 未找到公开仓库（`tailark/pro-images` 无 LICENSE，仅是素材）；官网 WebFetch 失败，**授权条款未核实，C**。
7. **Tremor**：`tremor-blocks`（MIT）是本次最大的"仪表盘面板"宝库，但自 2025-01 起未更新，Tailwind 版本大概率是 v3（未核实），需要升级。
8. 好消息：**uitripled（★1.3k，MIT）含约 50 个整页区块**，是 A 级里数量最大、覆盖面最全的 Sections 来源（抽查 5 个文件：无 Unsplash 外链，仅依赖 framer-motion / lucide-react）。

## 1. 来源表

数据均为 2026-09-29 `gh api` 实测。

| 仓库 | ★ | 最近推送 | 许可证（核实后） | 分级 | 内容/数量 | 技术栈 | 素材问题 | 整合方式 |
|---|---|---|---|---|---|---|---|---|
| moumen-soliman/uitripled | 1.3k | 2026-08-28 | MIT（LICENSE.md 原文，版权 2026 uitripled） | **A** | `packages/components/react-shadcn/src/components/sections/` 47 个区块 + `navigation/`、`motion-core/`、`cards/`、`stocks-dashboard/` | React 19、Next 16、framer-motion 12、Radix、lucide、recharts 3（部分） | 抽查的 5 个文件无外链图片；team 区块含 github/linkedin/twitter 占位链接 | 首选。逐个渲染筛选；`framer-motion` 统一迁到 `motion/react` |
| karthikmudunuri/eldoraui | 2.0k | 2026-09-26 | MIT | **A** | `apps/www/registry/blocks/` 17 个：bento、cta×3、features、footer、header×2、logo-cloud×4、pricing×2、testimonal×3 | React 19、Tailwind 4、motion、embla-carousel | 抽查未见外链图；logo-cloud 为内联 SVG（品牌 logo，见 B 项说明） | 首选。区块 registry 已就绪 |
| shadcn-ui/ui | 124.8k | 2026-09-29 | MIT | **A** | `apps/v4/registry/new-york-v4/blocks/`：dashboard-01、sidebar-01~16、login-01~05、signup-01~05；`charts/` 72 个（area 10、bar 10、line 10、pie 11、radar 14、radial 6、tooltip 9） | React 19、Tailwind 4、recharts、@tabler/icons | `public/avatars/*.png`（来源未核实）、`data.json` 为虚构数据 | 仪表盘外壳与图表的事实标准，registry schema 直接对齐 |
| tremorlabs/tremor-blocks | 540 | 2025-01-22 | MIT（Tremor Labs，2025） | **A**（陈旧，见风险） | `src/content/components/` 28 类约 350 个：kpi-cards 29、chart-tooltips 21、area-charts 16、filterbar 16、onboarding-feed 16、account 15、chart-compositions 15、grid-lists 15、bar-charts 12、line-charts 12、feature-sections 12、tables 11、table-actions 11、status-monitoring 10、billing-usage 10、logins 10、pricing-sections 8… | React、Tailwind（v3 大概率，未核实）、recharts、Radix、@remixicon/react、tailwind-variants | 未见外链图（抽查 1 个） | 仪表盘面板首选来源；升级到 Tailwind 4，并把 remixicon 换成 lucide |
| magicuidesign/magicui | 22.4k | 2026-09-20 | MIT（LICENSE 与 README 一致；Pro 模板不在仓库） | **A**（registry 组件）/ **B**（网站 sections） | `apps/www/registry/magicui/` 79 个原语，可拼区块：bento-grid、marquee、animated-list、animated-beam、orbiting-circles、globe、number-ticker、safari/iphone/android、hero-video-dialog、code-comparison、dock。`apps/www/components/sections/`（hero/cta/testimonials/showcase 等）是网站自用 | React 19、Tailwind 4、motion 12 | 网站 sections 含真实用户推文/头像，**不可整合**；registry 原语无此问题 | 取 registry 原语作"区块内的动效积木"；网站 sections 仅参考 |
| nolly-studio/cult-ui | 6.2k | 2026-09-23 | MIT；Premium Blocks 不在仓库 | **A** | `registry/default/ui/`：hero-dithering、hero-liquid-metal、hero-heatmap、hero-static-radial-gradient、hero-color-panel、feature-carousel、feature-poll、feature-voting、logo-carousel、mock-browser-window、tweet-grid 等；`registry/blocks.ts` 仅 1 个 block（authentication-01） | React 19、Next 16、Tailwind 4、`@paper-design/shaders-react`（Apache-2.0，已核实） | hero-* 为 WebGL shader 背景，无外链图；feature-carousel 用 next/image 需自备图 | 取 5 个 shader hero 背景 |
| kokonut-labs/kokonutui | 2.1k | 2026-08-20 | MIT | **A** | 仅 `bento-grid`、`morphic-navbar`、`shape-hero` 三个与区块相关；`registry/registry-blocks.ts` 为空 | React 19、Tailwind 4、motion | 未逐个查外链 | 取 3 个 |
| Kiranism/next-shadcn-dashboard-starter | 7.1k | 2026-09-11 | MIT | **A**（数据为虚构，须核对） | `src/app/dashboard/overview/@area_stats/@bar_stats/@pie_stats/@sales` 并行路由；`src/features/overview/` | Next、shadcn、recharts | 头像/数据虚构，未核实来源 | 取图表卡片与 sales 列表 |
| arhamkhnz/next-shadcn-admin-dashboard | 3.1k | 2026-09-29 | MIT | **A** | 多个 dashboard 页：default、crm、finance、analytics、ecommerce、academy；大量 `_components/` KPI / 图表 / 表格 | Next、shadcn、Tailwind 4（未核实版本） | 数据虚构 | 取 KPI 条、pipeline-activity、performance-overview |
| satnaing/shadcn-admin | 15.1k | 2026-09-10 | MIT（仅读了许可证头） | **A**（未深入） | 管理后台模板 | Vite、shadcn | 未核实 | 备选，内容未审阅 |
| mickasmt/next-saas-stripe-starter | 3.0k | 2026-09-28 | MIT | **B** | `components/dashboard/`（settings 卡片、sidebar、empty-state），`components/dashboard/pro/*` 是付费版预览 | Next、shadcn | `pro/` 目录为付费版的截图/占位，别取 | 只取 settings 卡片 |
| markmead/hyperui | 12.2k | 2026-09-26 | MIT（README 与 LICENSE 一致） | **B** | `public/examples/marketing/`、`application/`、`templates/`：纯 HTML + Tailwind。marketing 有 footers 24 文件、blog-cards 13、announcements 12、contact-forms 10、headers 8、feature-grids 8、ctas 8、team-sections 6、stats 6、faqs 6、newsletter-signup 4、logo-clouds 4、testimonials 3、pricing 2、sections 4；application 有 charts 22、stats 12、tables 10、steps 10、timelines 6…；templates：analytics-dashboard 5、saas-landing-page 1 等（数字为**文件数**，含 `-dark` 变体，实际变体数约为其一半，未逐目录核实） | HTML + Tailwind（v4 写法：`size-*`、`text-pretty`） | 头像用 `images.unsplash.com`（抽查 testimonials/1.html） | 零依赖，最易做成"样式变体"；替换 Unsplash 图 |
| launch-ui/launch-ui | 859 | 2026-09-04 | MIT（版权 Mikolaj Dobrucki）；Pro 版另售不在仓库 | **B** | `components/sections/` 8 个：navbar、hero、items（feature/pricing 网格）、logos、faq、stats、cta、footer，README 称各含多个变体（未逐个核实）；`components/ui/`：glow、beam、mockup、layout-lines | React 19、Next 16、Tailwind 4.3、Radix、tw-animate-css（无 motion） | `public/dashboard-{light,dark}.png` 是自家产品截图，`components/logos/launch-ui.tsx` 是自家品牌，须替换 | **props 驱动的写法最接近我们的"可调参数"目标**，作为区块接口范本 |
| shadcnstore/shadcn-dashboard-landing-template | 1.2k | 2026-02-17 | MIT（README 也写 MIT，署名"非强制"）；Premium Blocks 不在仓库 | **B** | `nextjs-version/src/app/landing/components/` 15 个：about、blog、contact、cta、faq、features、footer、hero、logo-carousel、navbar、pricing、stats、team、testimonials + mega-menu；另有 dashboard、dashboard-2、tasks、users、mail、chat、calendar 页 | Next 16、React 19、Tailwind 4.1、recharts 3.6 | team 用 Unsplash 头像；testimonials 用 `notion-avatars.netlify.app` 第三方 API；hero 用自家 dashboard 截图 | 整套 landing 一致性好；替换头像与截图 |
| merakiuilabs/merakiui | 2.7k | 2025-07-11 | MIT（版权 2021 Khatab Wedaa） | **B** | `components/` 纯 HTML：heros 11、contact 13、footers 10、testimonials 8、pricing 7、features 7、teams 7、blog 6、cta 6、navbars 6、faq 5、portfolio 5 | HTML + Tailwind CDN（v3 写法）、含 RTL | 大量 `images.unsplash.com` 外链；设计偏 2021–2023 | 观感偏旧，仅作补充/RTL 参考 |
| ixartz/SaaS-Boilerplate | 7.4k | 2026-09-02 | MIT | **B** | `src/templates/`：Hero、Features、Pricing、FAQ、CTA、Footer、Navbar；`src/features/billing/Pricing*` | Next、next-intl、Clerk 等 | 与 i18n/账户体系耦合，抽出成本高（README 授权细节未核实） | 低优先级 |
| gonzalochale/saas-landing-template | 181 | 2026-03-04 | MIT | **B**（未深入） | `components/`：hero、navbar、pricing、faq、testimonials、footer | Next 16、Tailwind 4.2、framer-motion 12 | 未核实 | 备选 |
| leoMirandaa/shadcn-landing-page / nobruf/shadcn-landing-page | 2.0k / 1.3k | 2024-10-09 / 2025-01-16 | MIT / MIT | **B** | `src/components/`：Hero、Features、Services、Pricing、Testimonials、Team、Statistics、FAQ、Newsletter、HowItWorks、Sponsors、About、Cta、Footer、Navbar | Vite/Next 早期、Tailwind 3 | 停更；nobruf 是 Next 移植版 | 取 HowItWorks / Newsletter / Sponsors 的结构灵感 |
| themesberg/flowbite | 9.4k | 2026-06-27 | MIT | **B** | 仓库是组件库 + 文档；**未发现独立的免费 Sections 集**（Blocks 为付费，未核实其条款） | — | — | 不取 |
| tailgrids/tailgrids | 1.6k | 2026-08-04 | MIT | **B** | 100+ 基础组件；README 明说"500+ Premium UI blocks"为付费，不在仓库 | React、Tailwind | — | 不取区块 |
| htmlstreamofficial/preline | 6.5k | 2026-08-31 | **MIT + Preline UI Fair Use License**（LICENSE 原文；spdx=NOASSERTION） | **C** | 组件与部分 sections | — | 竞品条款、再分发须附带 Fair Use License | 仅链接 |
| shadcnstudio/shadcn-studio | 1.9k | 2026-08-20 | **MIT + Commons Clause + 竞品条款**（LICENSE 原文） | **C** | 698 个文件的区块 | — | — | 仅链接 |
| shadcnblocks/shadcn-ui-blocks、mainline-nextjs-template；shadcnblockscom/openshadcnblocks | 401 / 360 / 0 | 2025-10 / 2025-12 / 2026-07 | MIT + Commons Clause / 同 / 无 LICENSE | **C** | — | — | — | 仅链接 |
| once-ui-system/magic-portfolio | 1.4k | 2026-08-08 | CC BY-NC 4.0 | **C** | — | — | — | 仅链接 |
| magicuidesign/changelog-template | 206 | 2025-07-16 | 无 LICENSE | **C** | — | — | — | 仅链接 |
| tailark（官网 tailark.com） | — | — | 未找到公开仓库，条款未核实 | **C** | — | — | — | 仅链接 |
| daisyUI（saadeghi/daisyui ★42.5k, MIT）、Tailwind Toolbox Landing-Page（MIT，2024-04 停更） | 42.5k / 1.5k | 2026-09-29 / 2024-04-25 | MIT / MIT | 未深入 | daisyUI 是组件类库；Toolbox 是旧版单页模板 | — | — | 本轮未评估 Sections 价值，不列入候选 |

## 2. 候选清单（按区块类型，编号 146 行，部分行合并同类变体）

来源缩写：UIT=uitripled；ELD=eldoraui；LU=launch-ui；SHAD=shadcn-ui/ui；TB=tremor-blocks；MAGIC=magicui；CULT=cult-ui；KOKO=kokonutui；HUI=HyperUI；MRK=Meraki；SS=shadcnstore 模板；ARH=arhamkhnz；KIR=Kiranism；IXZ=ixartz；GON=gonzalochale；LEO=leoMirandaa。
路径前缀：UIT = `packages/components/react-shadcn/src/components/sections/`；ELD = `apps/www/registry/blocks/`；LU = `components/sections/`；SS = `nextjs-version/src/app/landing/components/`；TB = `src/content/components/`；HUI = `public/examples/`；MRK = `components/`；CULT = `registry/default/ui/`（有的在 `apps/www/` 下，需核对）。
"为什么好"为**依据代码结构的判断，未渲染验证**。分级为来源分级；带 B 的写明需替换项。

### 2.1 Hero（18）

| # | 名称 | 来源 | 路径 | 为什么好 | 依赖 | 可调参数建议 |
|---|---|---|---|---|---|---|
| 1 | Hero default（badge + 双按钮 + 产品截图 mockup + glow） | LU (B) | `hero/default.tsx` | props 全部可选且带默认值（title/description/mockup/badge/buttons），接口即范本 | radix-slot、lucide、tw-animate-css | 标题/副标题/按钮数组/是否显示 badge、mockup 换为我们的占位图；glow 颜色 |
| 2 | Glassmorphism Hero | UIT (A) | `glassmorphism-hero-block.tsx` | 玻璃拟态 + framer-motion 入场 | framer-motion、lucide | 主色、模糊强度、标题/CTA 文案 |
| 3 | Glowy Waves Hero | UIT (A) | `glowy-waves-hero.tsx` | 动态波浪光效背景 | framer-motion | 波浪色、速度、文案 |
| 4 | Hero Block | UIT (A) | `hero-block.tsx` | 标准居中 hero | framer-motion | 布局（居中/左对齐）、文案 |
| 5 | New Hero Section | UIT (A) | `new-hero-section.tsx` | 另一种版式 | framer-motion | 同上 |
| 6 | Hero Section | UIT (A) | `hero-section.tsx` | 备选版式 | framer-motion | 同上 |
| 7 | CTA Hero Block | UIT (A) | `cta-hero-block.tsx` | 以转化为中心的 hero | framer-motion | 按钮样式、文案 |
| 8 | Hero Dithering | CULT (A) | `hero-dithering.tsx` | 抖动 shader 背景，观感独特 | @paper-design/shaders-react（Apache-2.0） | 颜色、像素尺寸、速度；须做 reduced-motion 静态降级 |
| 9 | Hero Liquid Metal | CULT (A) | `hero-liquid-metal.tsx` | 液态金属 shader | 同上 | 颜色、速度、形状 |
| 10 | Hero Heatmap | CULT (A) | `hero-heatmap.tsx` | 热力图 shader | 同上 | 色板、强度 |
| 11 | Hero Static Radial Gradient | CULT (A) | `hero-static-radial-gradient.tsx` | 静态径向渐变，零性能负担 | 未核实 | 渐变色、位置 |
| 12 | Hero Color Panel | CULT (A) | `hero-color-panel.tsx` | 色块面板式 hero | 未核实 | 面板颜色 |
| 13 | Shape Hero | KOKO (A) | `components/kokonutui/shape-hero.tsx` | 漂浮几何形状 | motion | 形状颜色、数量、文案 |
| 14 | Landing Hero（渐变 + DotPattern + 双图） | SS (B) | `hero-section.tsx` | 与同套 15 个区块风格一致 | lucide、next/image | 徽章、CTA、截图（换占位） |
| 15 | Marketing Sections 1–4 | HUI (B) | `marketing/sections/1~4.html` | 零依赖 HTML；四个的具体类型未逐个核实 | 无 | 主色 token、文案 |
| 16 | Hero Template | IXZ (B) | `src/templates/Hero.tsx` | 简洁 SaaS hero | next-intl（耦合） | 需去掉 i18n |
| 17 | Heros 系列（11 个） | MRK (B) | `components/heros/*.html` | 变体多但观感偏旧 | Tailwind CDN | 补充用；Unsplash 图必须替换 |
| 18 | Hero | GON (B，未深入) | `components/hero.tsx` | Tailwind 4 + framer-motion 12 | framer-motion | 待审阅 |

### 2.2 Navbar / Header（8）

| # | 名称 | 来源 | 路径 | 为什么好 | 依赖 | 可调参数建议 |
|---|---|---|---|---|---|---|
| 19 | Navbar default / floating | LU (B) | `navbar/default.tsx` + `ui/navbar.tsx`、`navigation-menu.tsx`、`sheet.tsx` | 含下拉菜单、移动端抽屉，README 称有静态与浮动两种 | Radix navigation-menu、dialog | 链接数组、logo 槽、变体 select（static/floating） |
| 20 | Header 01 | ELD (A) | `header-01/` | navbar + nav-menu + theme-toggle，motion 动画 | motion | 链接、logo、是否显示主题切换 |
| 21 | Header 02 | ELD (A) | `header-02/` | 另一版式 | motion | 同上 |
| 22 | Morphic Navbar | KOKO (A) | `components/kokonutui/morphic-navbar.tsx` | 形态变换导航，动效有辨识度 | motion | 项目数组、胶囊颜色 |
| 23 | Animated Navbar | UIT (A) | `navigation/animated-navbar.tsx` | 动画导航 | framer-motion | 链接、激活指示器颜色 |
| 24 | Landing Navbar + Mega Menu | SS (B) | `navbar.tsx`、`src/components/landing/mega-menu.tsx` | 含 mega menu | Radix | 菜单结构 |
| 25 | Headers（4，含 dark） | HUI (B) | `marketing/headers/1~4.html` | 零依赖 | 无 | 主色、链接 |
| 26 | Dock 作浮动导航 | MAGIC (A) | `apps/www/registry/magicui/dock.tsx` | macOS Dock 悬停放大，适合作品集导航 | motion | 图标数组、放大倍率、间距 |

### 2.3 Features / Bento（14）

| # | 名称 | 来源 | 路径 | 为什么好 | 依赖 | 可调参数建议 |
|---|---|---|---|---|---|---|
| 27 | Items（feature/pricing 通用网格） | LU (B) | `items/default.tsx` + `ui/item.tsx` | 通用网格，README 称含 default 与 branded 变体 | 无 motion | 列数、图标/标题/文案数组 |
| 28 | Bento 01 | ELD (A) | `bento-01/`（bento-card、keyboard） | 带键盘交互演示的 bento | motion | 卡片内容数组、网格跨度 |
| 29 | Features 01 | ELD (A) | `features-01/` | 特性区块 | 未核实 | 文案、图标 |
| 30 | Bento Grid Block | UIT (A) | `bento-grid-block.tsx` | 完整 bento 区块 | framer-motion | 网格模板 select、卡片色 |
| 31 | Feature Cards Block | UIT (A) | `feature-cards-block.tsx` | 卡片式 | framer-motion | 列数、悬停效果 |
| 32 | Feature Grid Section | UIT (A) | `feature-grid-section.tsx` | 网格式 | framer-motion | 列数 |
| 33 | Services Grid Block | UIT (A) | `services-grid-block.tsx` | 服务展示网格 | framer-motion | 列数、文案 |
| 34 | Bento Grid（原语） | MAGIC (A) | `apps/www/registry/magicui/bento-grid.tsx` | 原语级，配 marquee/beam 做卡内动效 | motion | 卡片跨度、背景槽 |
| 35 | Bento Grid（原语） | KOKO (A) | `components/kokonutui/bento-grid.tsx` | 备选 bento | motion | 同上 |
| 36 | Feature Sections（12） | TB (A) | `feature-sections/feature-section-01~12.tsx` | 含渐变 Badge、统计条，结构清晰（01 已读） | 内联组件 | 徽章文案、数字数组；需迁 Tailwind 4 |
| 37 | Feature Carousel | CULT (A) | `feature-carousel.tsx` | 特性轮播 | next/image、react-wrap-balancer | 图片槽、自动播放间隔 |
| 38 | Feature Poll / Voting | CULT (A) | `feature-poll.tsx`、`feature-voting.tsx` | 互动式特性投票，少见 | 未核实 | 选项数组 |
| 39 | Features Section | SS (B) | `features-section.tsx` | 与整套 landing 同风格 | lucide | 特性数组 |
| 40 | Feature Grids（8） | HUI (B) | `marketing/feature-grids/*.html` | 零依赖 | 无 | 列数、主色 |

### 2.4 Pricing（11）

| # | 名称 | 来源 | 路径 | 为什么好 | 依赖 | 可调参数建议 |
|---|---|---|---|---|---|---|
| 41 | Pricing default + PricingColumn | LU (B) | `pricing/default.tsx`、`ui/pricing-column.tsx` | 列组件可复用 | radix-slot | 方案数组、高亮列、月/年 |
| 42 | Pricing 01 | ELD (A) | `pricing-01/` | motion 切换动画 | motion | 方案数组、月/年切换 |
| 43 | Pricing 02 | ELD (A) | `pricing-02/` | 备选版式 | 未核实 | 同上 |
| 44 | Pricing Section | UIT (A) | `pricing-section.tsx` | 含 framer-motion 切换 | framer-motion | 方案、货币 |
| 45 | Glassmorphism Pricing | UIT (A) | `glassmorphism-pricing-block.tsx` | 玻璃拟态卡片 | framer-motion | 主色、模糊 |
| 46 | Pricing Sections（8） | TB (A) | `pricing-sections/*.tsx` | 结构成熟（tremor 团队） | Radix | 方案数组 |
| 47 | Pricing | HUI (B) | `marketing/pricing/1~2.html` | 零依赖，仅 2 个 | 无 | 主色 |
| 48 | Pricing Section | SS (B) | `pricing-section.tsx` | 与 landing 一致 | lucide | 方案数组 |
| 49 | Pricing 页 + FAQ + 特性表 | SS (B) | `(dashboard)/pricing/components/{faq-section,features-grid}.tsx` | 完整定价页 | — | — |
| 50 | Pricing（7） | MRK (B) | `components/pricing/*.html` | 变体多但偏旧 | Tailwind CDN | 补充 |
| 51 | Pricing | IXZ (B) | `src/templates/Pricing.tsx`、`src/features/billing/Pricing*.tsx` | 与计费耦合 | next-intl | 不优先 |

### 2.5 Testimonials / Wall of love（10）

| # | 名称 | 来源 | 路径 | 为什么好 | 依赖 | 可调参数建议 |
|---|---|---|---|---|---|---|
| 52 | Testimonial 01（carousel） | ELD (A) | `testimonal-01/`（注意仓库拼写） | embla 轮播 | embla-carousel-react、lucide | 引语数组、自动播放 |
| 53 | Testimonial 02 | ELD (A) | `testimonal-02/` | 备选版式 | 未核实 | 引语数组 |
| 54 | Testimonial 03 | ELD (A) | `testimonal-03/` | 备选版式 | 未核实 | 引语数组 |
| 55 | Testimonial Section | UIT (A) | `testimonial-section.tsx` | 完整区块 | framer-motion | 引语、头像占位 |
| 56 | Testimonials Block | UIT (A) | `testimonials-block.tsx` | 备选 | framer-motion | 同上 |
| 57 | Glassmorphism Testimonials | UIT (A) | `glassmorphism-testimonials-block.tsx` | 只依赖 lucide（已核） | lucide | 主色 |
| 58 | Wall of love（自组） | MAGIC (A) | `magicui/marquee.tsx` + `client-tweet-card.tsx`/`tweet-card.tsx` | 双向 marquee 墙是标志性效果；tweet-card 需去掉真实推文 | motion | 行数、速度、方向、暂停悬停 |
| 59 | Testimonials Section | SS (B) | `testimonials-section.tsx` | 用 notion-avatars 第三方 API 头像 | — | 头像换占位 |
| 60 | Testimonials（3） | HUI (B) | `marketing/testimonials/1~3.html` | 极简单引语（1.html 已读，含 Unsplash 头像与虚构人名） | 无 | 引语、头像 |
| 61 | Testimonials（8：Slider/Centered/Card…） | MRK (B) | `components/testimonials/*.html` | 变体多 | Tailwind CDN | 补充 |

### 2.6 Logo cloud（8）

| # | 名称 | 来源 | 路径 | 为什么好 | 依赖 | 可调参数建议 |
|---|---|---|---|---|---|---|
| 62 | Logo Cloud 01~04 | ELD (A，logo 见 B 说明) | `logo-cloud-01~04/` | 四种版式，内联 SVG | lucide、next/link | logo 数组（换为通用占位）、滚动/静态 |
| 63 | Logos | LU (B) | `logos/default.tsx`、`components/logos/*.tsx` | 静态网格；logos 是 React/Tailwind/GitHub 等品牌 | 无 | 换成我们自己生成的字标 |
| 64 | Glassmorphism Logo Showcase | UIT (A) | `glassmorphism-logo-showcase-block.tsx` | 动画玻璃卡 | framer-motion | 数组 |
| 65 | Our Partners Section | UIT (A) | `our-partners-section.tsx` | 合作伙伴区 | 未核实 | 数组 |
| 66 | Logo Carousel | SS (B) | `logo-carousel.tsx` | 无限滚动 | — | 速度 |
| 67 | Logo Carousel | CULT (A) | `logo-carousel.tsx` | 备选 | 未核实 | 速度 |
| 68 | Logo Clouds（4） | HUI (B) | `marketing/logo-clouds/1~4.html` | 零依赖 | 无 | 数组 |
| 69 | Sponsors | LEO (B) | `src/components/Sponsors.tsx` | 简单 | — | 数组 |

### 2.7 Stats / Metrics（8）

| # | 名称 | 来源 | 路径 | 为什么好 | 依赖 | 可调参数建议 |
|---|---|---|---|---|---|---|
| 70 | Stats（horizontal/tiles/grid） | LU (B) | `stats/default.tsx` | README 称三种布局 | 无 | 布局 select、数字数组 |
| 71 | Stats Counter Block | UIT (A) | `stats-counter-block.tsx` | 计数动画 | framer-motion | 数字、前后缀、时长 |
| 72 | Stats Section | UIT (A) | `stats-section.tsx` | 常规版 | framer-motion | 同上 |
| 73 | Glassmorphism Statistics Card | UIT (A) | `glassmorphism-statistics-card.tsx` | 单卡指标 | framer-motion | 主色 |
| 74 | Glassmorphism Minimal Metrics | UIT (A) | `glassmorphism-minimal-metrics-block.tsx` | 极简指标条 | framer-motion | 数组 |
| 75 | Number Ticker（原语） | MAGIC (A) | `magicui/number-ticker.tsx` | 数字滚动，配任意 stats 布局 | motion | 起止值、方向、小数位 |
| 76 | Stats（3+6） | HUI (B) | `marketing/stats/`、`application/stats/` | 零依赖，营销与后台两套 | 无 | 数组 |
| 77 | Stats Section | SS (B) | `stats-section.tsx` | 同套一致 | — | 数组 |

### 2.8 FAQ（6）

| # | 名称 | 来源 | 路径 | 为什么好 | 依赖 | 可调参数建议 |
|---|---|---|---|---|---|---|
| 78 | FAQ | LU (B) | `faq/default.tsx` | Radix 手风琴，平滑动画 | @radix-ui/react-accordion | 问答数组、单开/多开 |
| 79 | FAQ Accordion Block | UIT (A) | `faq-accordion-block.tsx` | motion 手风琴 | framer-motion | 同上 |
| 80 | FAQ Section | UIT (A) | `faq-section.tsx` | 备选 | framer-motion | 同上 |
| 81 | FAQ | SS (B) | `faq-section.tsx` | 同套 | — | 数组 |
| 82 | FAQs（3） | HUI (B) | `marketing/faqs/1~3.html` | 原生 `<details>`，无 JS | 无 | 数组 |
| 83 | FAQ（5） | MRK (B) | `components/faq/*.html` | 变体 | — | 补充 |

### 2.9 CTA（8）

| # | 名称 | 来源 | 路径 | 为什么好 | 依赖 | 可调参数建议 |
|---|---|---|---|---|---|---|
| 84 | CTA（box / beam） | LU (B) | `cta/default.tsx` + `ui/beam.tsx`、`glow.tsx` | 光束效果 | 无 motion | 标题、按钮、光束颜色 |
| 85 | CTA 01 | ELD (A) | `cta-01/` | 基础 | 未核实 | 文案 |
| 86 | CTA 02 | ELD (A) | `cta-02/`（orbiting-circle、icons） | 轨道图标动效，也可作集成区 | motion | 图标数组、轨道数、速度 |
| 87 | CTA 03 | ELD (A) | `cta-03/`（ripple-bg） | 涟漪背景 | motion | 涟漪色、速度 |
| 88 | CTA Block / Banner | UIT (A) | `cta-block.tsx`、`cta-banner-section.tsx` | 常规与横幅两种 | framer-motion | 文案 |
| 89 | Glassmorphism CTA | UIT (A) | `glassmorphism-cta-block.tsx` | 玻璃拟态 | framer-motion | 主色 |
| 90 | Dynamic Spotlight CTA | UIT (A) | `motion-core/dynamic-spotlight-cta.tsx`（路径为 `components/motion-core/`） | 跟随鼠标聚光 | framer-motion | 聚光半径、颜色 |
| 91 | CTAs（4，含 dark） | HUI (B) | `marketing/ctas/1~4.html` | 零依赖 | 无 | 文案 |

### 2.10 Footer（5）

| # | 名称 | 来源 | 路径 | 为什么好 | 依赖 | 可调参数建议 |
|---|---|---|---|---|---|---|
| 92 | Footer（default/minimal/multi-column） | LU (B) | `footer/default.tsx` + `ui/footer.tsx` | README 称三种版式 | 无 | 链接列数组、版式 select |
| 93 | Footer 01（巨型文字悬停描边） | ELD (A) | `footer-01/`（text-hover-effect、theme-toggler） | 大字悬停效果有记忆点 | motion | 大字内容、渐变色 |
| 94 | Footer Block | UIT (A) | `footer-block.tsx` | 完整 | framer-motion | 链接列 |
| 95 | Footers（12 个左右） | HUI (B) | `marketing/footers/*.html`（24 文件含 dark） | 变体最多的免费 footer 集 | 无 | 链接列、主色 |
| 96 | Footers（10） | MRK (B) | `components/footers/*.html` | 补充 | — | — |

### 2.11 Team / About（5）

| # | 名称 | 来源 | 路径 | 为什么好 | 依赖 | 可调参数建议 |
|---|---|---|---|---|---|---|
| 97 | Team Section Block | UIT (A) | `team-section-block.tsx` | 含社交链接占位，无图 | framer-motion | 成员数组、头像占位 |
| 98 | About Us Section | UIT (A) | `about-us-section.tsx` | 关于我们 | 未核实 | 文案 |
| 99 | Team Section | SS (B) | `team-section.tsx` | Unsplash 头像须替换 | — | 成员数组 |
| 100 | Team Sections（3） | HUI (B) | `marketing/team-sections/*.html` | 零依赖 | 无 | 成员数组 |
| 101 | Teams（7） | MRK (B) | `components/teams/*.html`（Cards、Filter、GridList…） | 含筛选版 | — | — |

### 2.12 Timeline / Changelog（5）

| # | 名称 | 来源 | 路径 | 为什么好 | 依赖 | 可调参数建议 |
|---|---|---|---|---|---|---|
| 102 | Timeline Block | UIT (A) | `timeline-block.tsx` | 通用时间线 | framer-motion | 事件数组、方向 |
| 103 | Glassmorphism Launch Timeline | UIT (A) | `glassmorphism-launch-timeline-block.tsx` | 发布节点式 | framer-motion | 事件数组 |
| 104 | Glassmorphism Product Update | UIT (A) | `glassmorphism-product-update-block.tsx` | 适合作 changelog 卡 | framer-motion | 版本条目 |
| 105 | Interactive Timeline | UIT (A) | `components/motion-core/interactive-timeline.tsx` | 可交互 | framer-motion | 事件数组 |
| 106 | Timelines（3） | HUI (B) | `application/timelines/*.html` | 零依赖 | 无 | — |

（Changelog 页面模板：magicui `changelog-template` 无 LICENSE，C，仅链接。）

### 2.13 Blog / Article list（4）

| # | 名称 | 来源 | 路径 | 为什么好 | 依赖 | 可调参数建议 |
|---|---|---|---|---|---|---|
| 107 | Blog Block | UIT (A) | `blog-block.tsx` | 文章卡片网格 | framer-motion | 卡片数、封面比例 |
| 108 | Notion Blog Page | UIT (A) | `notion-blog-page.tsx` | 文章列表页式 | 未核实 | — |
| 109 | Blog Section | SS (B) | `blog-section.tsx` | 封面用 `ui.shadcn.com/placeholder.svg`，须换成自有占位 | — | — |
| 110 | Blog Cards（13 文件） | HUI (B) | `marketing/blog-cards/*.html` | 零依赖 | 无 | — |

### 2.14 Contact / Newsletter（5）

| # | 名称 | 来源 | 路径 | 为什么好 | 依赖 | 可调参数建议 |
|---|---|---|---|---|---|---|
| 111 | Contact Block / Contact Form Section | UIT (A) | `contact-block.tsx`、`contact-form-section.tsx` | 两种联系区 | framer-motion | 字段数组、提交回调 |
| 112 | Newsletter Signup Block | UIT (A) | `newsletter-signup-block.tsx` | 订阅框 | framer-motion | 占位文案、按钮 |
| 113 | Contact Forms（5）+ Newsletter（2） | HUI (B) | `marketing/contact-forms/`、`newsletter-signup/` | 零依赖 | 无 | — |
| 114 | Contact Section | SS (B) | `contact-section.tsx` | 同套 | — | — |
| 115 | Contact（13） | MRK (B) | `components/contact/*.html` | 变体最多 | — | 补充 |

### 2.15 Comparison / Integrations / Steps / Showcase

| # | 名称 | 来源 | 路径 | 为什么好 | 依赖 | 可调参数建议 |
|---|---|---|---|---|---|---|
| 116 | Feature Comparison Block（对比表） | UIT (A) | `feature-comparison-block.tsx` | 仓库中唯一发现的对比表区块 | framer-motion | 列（方案）数组、行（特性）数组、高亮列 |
| 117 | Code Comparison | MAGIC (A) | `magicui/code-comparison.tsx` | 前后代码对比，开发者产品适用 | shiki 等（未核实） | 两段代码、语言 |
| 118 | Animated Beam（集成图） | MAGIC (A) | `magicui/animated-beam.tsx` | 多图标汇聚到中心，典型 integrations 区 | motion | 节点数组、光束色、曲率 |
| 119 | Orbiting Circles（集成） | MAGIC (A) | `magicui/orbiting-circles.tsx` | 轨道式集成图 | motion | 半径、速度、图标 |
| 120 | n8n Workflow Block | UIT (A) | `n8n-workflow-block.tsx` | 工作流节点图，可作"How it works/集成" | framer-motion | 节点数组 |
| 121 | HowItWorks | LEO (B) | `src/components/HowItWorks.tsx` | 简洁 3 步，停更 | Tailwind 3 | 步骤数组 |
| 122 | Steps（5） | HUI (B) | `application/steps/*.html` | 零依赖 | 无 | — |
| 123 | Browser/Phone 外壳（Safari、iPhone、Android） | MAGIC (A) | `magicui/safari.tsx`、`iphone.tsx`、`android.tsx` | 产品截图外壳 | 无 | 截图槽、深浅 |
| 124 | Mock Browser Window | CULT (A) | `mock-browser-window.tsx` | 备选外壳 | 未核实 | 地址栏文案 |
| 125 | Hero Video Dialog | MAGIC (A) | `magicui/hero-video-dialog.tsx` | 视频弹窗预览 | motion | 视频源、动画样式 |
| 126 | Glassmorphism Listen App | UIT (A) | `glassmorphism-listen-app-block.tsx` | App 展示 | framer-motion | 主色 |
| 127 | Gallery / Projects / Portfolio | UIT (A) | `gallery-grid-block.tsx`、`projects-block.tsx`、`glassmorphism-portfolio-block.tsx` | 作品集类展示 | framer-motion | 图片占位 |

### 2.16 Dashboard panels（KPI / 图表 / 表格 / 活动流）

| # | 名称 | 来源 | 路径 | 为什么好 | 依赖 | 可调参数建议 |
|---|---|---|---|---|---|---|
| 128 | Dashboard-01（sidebar + 指标卡 + 交互面积图 + 表格） | SHAD (A) | `apps/v4/registry/new-york-v4/blocks/dashboard-01/` | 官方级，section-cards / chart-area-interactive / data-table 可拆用（已读 section-cards） | recharts、@tabler/icons | 指标数组、图表色 token、时间范围 |
| 129 | Sidebar 01–16 | SHAD (A) | `blocks/sidebar-01~16/` | 16 种侧栏 | Radix | 菜单数组、折叠模式 |
| 130 | Charts（72） | SHAD (A) | `apps/v4/registry/new-york-v4/charts/chart-*` | area 10、bar 10、line 10、pie 11、radar 14、radial 6、tooltip 9 | recharts | 系列色 token、数据、堆叠 |
| 131 | Login / Signup 01–05 | SHAD (A) | `blocks/login-01~05/`、`signup-01~05/` | 认证块，完整 | Radix | 品牌槽、第三方登录按钮 |
| 132 | KPI Cards（29） | TB (A) | `kpi-cards/kpi-card-01~29.tsx` | 数量最多的 KPI 卡集 | recharts、Radix | 指标、趋势色、迷你图 |
| 133 | Status Monitoring（10） | TB (A) | `status-monitoring/` | 状态/可用性监控条 | 内联 | 服务数组、状态色 |
| 134 | Billing & Usage（10） | TB (A) | `billing-usage/` | 用量进度、账单 | 内联 | 额度、颜色 |
| 135 | Onboarding Feed（16） | TB (A) | `onboarding-feed/` | 活动流/引导清单 | 内联 | 条目数组 |
| 136 | Area / Bar / Line / Donut / Spark（16/12/12/7/6） | TB (A) | `area-charts/`、`bar-charts/`、`line-charts/`、`donut-charts/`、`spark-charts/` | 图表卡片成套 | recharts | 数据、色板 |
| 137 | Chart Compositions（15）+ Tooltips（21） | TB (A) | `chart-compositions/`、`chart-tooltips/` | 组合图与自定义 tooltip | recharts | — |
| 138 | Tables（11）+ Table Actions（11）+ Pagination（8）+ Filterbar（16） | TB (A) | `tables/`、`table-actions/`、`table-pagination/`、`filterbar/` | 表格全家桶 | Radix | 列、筛选项 |
| 139 | Bar Lists / Grid Lists / Empty States | TB (A) | `bar-lists/`（7）、`grid-lists/`（15）、`empty-states/`（10） | 排行、卡片列表、空状态 | 内联 | — |
| 140 | Dashboard 2（metrics / sales-chart / top-products / revenue-breakdown / customer-insights / recent-transactions / quick-actions） | SS (B) | `nextjs-version/src/app/(dashboard)/dashboard-2/components/*.tsx` | 电商面板成套 | recharts 3.6 | JSON 数据、色 token；数据为虚构 |
| 141 | Users stat-cards / data-table | SS (B) | `(dashboard)/users/components/` | 用户管理面板 | — | — |
| 142 | CRM：pipeline-activity、kpi-cards、opportunities-table | ARH (A) | `src/app/(main)/dashboard/crm/_components/` | 活动流 + 管道，较新 | shadcn | — |
| 143 | Default：metric-cards、performance-overview、subscriber-overview | ARH (A) | `src/app/(main)/dashboard/default/_components/` | — | recharts | — |
| 144 | Overview 并行路由（area/bar/pie/sales） | KIR (A) | `src/app/dashboard/overview/@*` | 图表 + 销售列表 | recharts | — |
| 145 | Animated List（活动流原语） | MAGIC (A) | `magicui/animated-list.tsx` | 通知逐条进入的活动流 | motion | 条目数组、间隔 |
| 146 | Stocks Dashboard / Interactive Logs Table | UIT (A) | `components/stocks-dashboard/`、`sections/interactive-logs-table.tsx` | 金融面板与日志表 | recharts、framer-motion | 数据 |

合计编号 146 行；来源分级 A 的行占多数，B 行多为零依赖 HTML 或需换素材。

## 3. 让区块"可调"的做法建议

1. **内容即参数**：区块导出 `content` 对象（标题、副标题、按钮数组、条目数组），全部带默认值——照搬 Launch UI 的 `Hero` props 风格（`title? description? mockup? badge? buttons?`）。数组条目用统一 schema（`{title, description, icon?, image?}`），这样同类区块（feature grid / bento / timeline）可以共用一份内容。
2. **颜色走 token**：只允许 `--brand`、`--brand-foreground`、`--surface`、`--muted`、`--border`、`--radius` 六七个 CSS 变量；区块内禁止写死 `indigo-600` 这类色。HyperUI/Meraki 的 HTML 需要一次性把 `indigo-*`/`blue-*` 替换为 `brand` 语义类。图表色用 `--chart-1..5`，对齐 shadcn。
3. **布局变体 = 一个 select**：例如 `layout: "center" | "split" | "left"`、`columns: 2|3|4`、`style: "solid" | "glass" | "outline"`。把 uitripled 里 `glassmorphism-*` 与普通版合并成同一区块的 `style` 变体，避免市场里出现近似重复条目。
4. **动效开关**：`motion: "full" | "subtle" | "off"`；shader hero（Cult）必须提供静态回退；所有 framer-motion 区块统一注入 `useReducedMotion`（前置文档已指出这类组件普遍缺失）。
5. **导入路径统一**：uitripled 使用 `framer-motion`，其余为 `motion/react`，统一后再入库。
6. **占位素材由我们生成**：
   - **头像**：生成抽象几何/渐变头像（SVG，用名字哈希决定色相），替换 Unsplash、`notion-avatars.netlify.app`、`randomuser` 和 shadcn `public/avatars`（来源未核实）。
   - **产品截图/mockup**：不复制 Launch UI 与 ShadcnStore 的截图；生成"线框风"占位面板（SVG 或纯 CSS 骨架界面，可随主色变化），配合 Safari/iPhone 外壳。
   - **Logo cloud**：不使用第三方品牌 logo（React、Tailwind、GitHub 等属商标）；用生成的中性"字标"（随机字母 + 几何图形）SVG，并保留"替换为你的客户 logo"的插槽。
   - **封面图**：用生成的渐变/噪点 SVG，替换 `ui.shadcn.com/placeholder.svg` 等外链。
   - 所有外链图片改成本地资源，避免 Unsplash 热链与第三方 API 失效。
7. **数据**：仪表盘 `data.json`/内联数据一律改为可由参数或 seed 生成的虚构数据，名字不要沿用来源仓库里的人名（例如 shadcn 示例里的 "Eddie Lake"）。

## 4. 风险

- **视觉质量未渲染验证**：本报告 146 行"为什么好"来自代码与 README；入库前需逐个渲染、截图、剔除观感偏旧或重复者。uitripled 47 个区块尤其需要筛选（存在 hero-block/new-hero-section/hero-section 三个近似项）。
- **Commons Clause 传染性风险**：shadcn-studio、shadcnblocks、react-bits 等 C 级来源的设计不得"照着重写"，只能作灵感链接；不要从其 registry JSON 抓取。
- **第三方素材与商标**：logo cloud 的品牌 logo、真实人物头像、真实用户推文（magicui 网站 sections）均不入库。
- **来源混入的第三方代码**：uitripled、eldoraui、cult-ui 是聚合型个人作者仓库，个别组件可能借鉴其他项目（未逐一核实）；入库时保留每个文件的来源与版权行，并做一次内容相似度抽查。
- **技术栈碎片化**：tremor-blocks 与 Meraki/HyperUI 偏 Tailwind v3 写法；uitripled 要求 `next ^16`（peer）；shader hero 依赖 WebGL。需统一到 React 19 + Tailwind 4 + motion 12。
- **维护与陈旧**：tremor-blocks（2025-01）、Meraki（2025-07）、leoMirandaa（2024-10）、Tailwind Toolbox（2024-04）已停更。
- **Preline / 竞品条款**：即使复制单个 section 也须遵守其 Fair Use License；在没有作者书面确认前不用。
- **许可证会变**：本次核实的是 2026-09-29 的 HEAD；react-bits、animate-ui、shadcn-studio 都是"先 MIT、后加 Commons Clause"的路径，应在 CI 里对入库来源定期重查 LICENSE（可锁定到具体 commit）。
- **未核实项**：Tailark 条款；satnaing/shadcn-admin、gonzalochale 的素材；ixartz README 授权细节；uitripled 全部 47 个文件的外链与依赖（仅抽查 5 个）；HyperUI 各目录 `-dark` 变体的确切占比；tremor-blocks 的 Tailwind 版本；shadcn `public/avatars` 的来源。
