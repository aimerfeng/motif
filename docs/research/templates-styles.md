# 调研：整站模板（Templates）与设计风格（Styles）来源

调研日期：2026-09-29。与 `components-motion.md` 不重复（动效/组件库不再列入，仅在"风格"里引用其中已有的 magicui 等）。

方法：`gh api repos/...` 取 stars / 最近推送 / SPDX；**所有入表的仓库都读了 LICENSE 全文首段**，A/B 级另读 README 的 License / Credits / Image 段落，并用 `git/trees` 统计文件与素材。`package.json` 只 grep 了关键依赖。

**这份报告没做的事（不要误读）**
- 没有逐个打开 demo 站目视评估。"值得收录的理由"里的视觉判断来自 demo 站描述、star 数和组件清单，**视觉质量必须在整合前由人工看一遍 demo**。
- 图片/字体的原始出处大多在仓库里没有声明，"素材问题"里写"来源未声明"的都按"必须替换"处理。
- 没有逐文件检查版权头，只看仓库级 LICENSE。从 shadcn/ui 派生的组件仍需保留 shadcn 的 MIT 声明。

分级：**A** 宽松许可，可带署名整合；**B** 代码宽松但有需替换/需署名的部分；**C** 只放链接，不拷代码。

---

## 0. 关键结论（许可证意外）

1. **Cruip 三个"免费"模板（open-react-template 4.7k★、tailwind-landing-page-template 4.5k★、tailwind-dashboard-template 2.8k★）仓库里没有 LICENSE 文件**，GitHub 显示 `none`。README 写的是 "Released under the GPL ... don't republish, redistribute, or resell the template"。GPL 加上禁止再分发，对公开市场明确不可用。**C 级**。
2. **once-ui `magic-portfolio`（1.4k★）LICENSE 是 CC BY-NC 4.0**，SPDX 显示 `NOASSERTION`，容易被当成 MIT。禁止商用，**C 级**。同组织的 `magic-docs`（56★）也是 NOASSERTION（未读全文，按 C 处理）。而同组织 `nextjs-starter` 是 MIT，只有骨架。
3. **Preline（6.5k★）是 "MIT + Preline UI Fair Use License" 双重许可**，SPDX 为 `NOASSERTION`。Fair Use 条款禁止 "create any product or service that directly competes with Preline UI"，并要求再分发时附带该许可。我们做的是组件市场，**C 级**。
4. **React95（3.8k★）：MIT，但 LICENSE 首行声明 "Windows and all associated images are the property of Microsoft Corp and are not covered by this license"**。代码可用，图标/图片不可。B 级。
5. **liquidGL（901★）：LICENSE 写 MIT，但明确 "does NOT apply to the contents of the `assets/` directory"（音频、字体等）**，README 只写 "MIT"。只有 `scripts/` 与 `package/` 是 MIT。B 级。
6. **astroplate（Zeon）与 bigspring-light-nextjs（Themefisher）README 明确写：图片仅供演示，"we don't have permission to share those images"**。代码 MIT，所有图片必须换。B 级。
7. **HTML5 UP 系列（及 Astro 移植版如 `area44/astro-multiverse`）是 CC BY 3.0**：要求保留署名链接，且演示图来自 Unsplash。B 级。
8. **tailwindtoolbox/Landing-Page：代码 MIT，但 README 写 "Image Attribution: Free for personal and commercial purpose with attribution"**，B 级。
9. **tweakcn（10.4k★）是 Apache-2.0**（需保留 LICENSE/NOTICE，写明修改）。它的预设里有品牌预设（`twitter`、`vercel`、`supabase`、`claude`、`t3-chat`），不要收入这些，商标与品牌风格风险。
10. **VoltAgent/awesome-design-md（118.8k★，MIT）** 是"从公开网站提取的品牌设计系统 DESIGN.md"（Airbnb、Nike、Tesla、Meta 等）。README 自称 "We do not claim ownership of any site's visual identity"。**MIT 不能给我们授权去仿造第三方品牌视觉**。只借鉴其 DESIGN.md 文档格式，不收品牌条目。B 级（仅参考）。
11. **gruvbox（15.8k★）无 LICENSE 文件**（SPDX none），不可拷贝调色板文件；调色板数值本身是事实，但保守起见 C 级。
12. **`vercel/nextjs-portfolio-starter`（728★）、`leerob/next-mdx-blog`（7.6k★）、`soumyajit4419/Portfolio`（6.5k★）、`codebucks27/Next.js-Developer-Portfolio-Starter-Code`（1.3k★）全部无 LICENSE**，默认保留所有权利，C 级。
13. **GSAP**：ScrewFast 与 awesome-landing-pages 依赖 `gsap`。见 `components-motion.md` 1.2 节的 GSAP 条款，整合时改用 motion / CSS。
14. **einui（liquid glass 组件，152★）：LICENSE 文件是 MIT，README 徽章写 ISC**，自相矛盾，以 LICENSE 为准并建议向作者确认。

---

## 1. 整站模板（Templates）

技术栈列中 TW3 = Tailwind 3，TW4 = Tailwind 4。星数与推送日期为 2026-09-29 查询值。

### 1.1 A 级（可整合，含少量说明）

| 仓库 | ★ | 最近推送 | 许可证（核实后） | 分级 | 类型/页面 | 技术栈 | 素材问题 | 值得收录的理由 |
|---|---|---|---|---|---|---|---|---|
| arthelokyo/astrowind | 6.0k | 2026-09-12 | MIT（LICENSE.md + README 一致） | A | SaaS/产品/服务/落地页；`src/components/widgets/` 含 Hero、Hero2、HeroText、Features(1/2/3)、FeatureTabs、Bento、Pricing、Comparison、Countdown、Announcement、Integrations、Testimonials、FAQs、Contact、Newsletter、Gallery、Projects、Brands、CTA 等；含博客 | Astro 7 + TW4（`@tailwindcss/vite`），typography | 仅 5 张图（`hero-image.png`、`default.png`、`app-store.png`、`google-play.png`、favicon）；App Store / Google Play 图为品牌素材，需换 | 组件最全的开源落地页，Bento/Countdown/Comparison 少见；栈最新；文件结构清晰（212 文件） |
| launch-ui/launch-ui | 859 | 2026-09-04 | MIT（LICENSE.md + README） | A | SaaS 落地页；`src/components/sections/` 含 navbar、hero、logos、items、stats、pricing、faq、cta、footer | Next 16 + React 19 + TW4 + shadcn（radix-slot） | `public/dashboard-light/dark.png` 是其自身产品截图，`og.jpg`；`components/logos/` 含 Figma/GitHub/React/shadcn/Tailwind 品牌 SVG | 原生 React + Tailwind + shadcn，最容易并入 React 目录；小而精（78 文件） |
| gonzalochale/saas-landing-template | 181 | 2026-03-04 | MIT（license.txt） | A | SaaS 落地页：navbar、hero、partners、stats、pricing、testimonials、faq、footer；深浅色切换 | Next 16 + TW4 + shadcn + framer-motion | 仅 1 张 `opengraph-image.png`；partners 区可能含品牌 Logo（未逐个核实） | 素材几乎为零，最干净；38 文件，易移植 |
| RyanFitzgerald/devportfolio | 5.0k | 2026-05-14 | MIT（LICENSE.md，"fully and completely MIT"） | A | 个人作品集单页：Hero、About、Experience、Education、Projects | Astro 5 + TW4 | 无位图，0 个图片文件 | 极简、零素材，作品集类的首选；30 文件 |
| bohd4nx/app-landing | 218 | 2026-09-13 | MIT | A | App 落地页：AppHero、StoreButtons、Features、FAQ、Footer、隐私/条款页 | Next 16 + TW4 + framer-motion | `public/assets/screenshots/1.png` 一张；`StoreButtons.tsx` 与 `fetchStoreData.ts` 会走应用商店数据/徽章，商店徽章是品牌素材，需去除或自绘 | App 落地类唯一新且许可干净的候选 |
| satnaing/astro-paper | 5.1k | 2026-09-18 | MIT | A | 博客/文档站首页、单文章、标签、搜索、归档 | Astro 7 + TW4 + typography | 演示 OG 图与截图 14 张（自身项目截图） | 极简可读性好，博客首页类的最佳候选 |
| chrismwilliams/astro-theme-cactus | 1.7k | 2026-09-22 | MIT | A | 个人站/博客 | Astro 7 + TW4 | 仅 `social-card.png` 与 Roboto Mono ttf（字体许可未核实，建议换 Google Fonts 引用或自托管 OFL 字体） | 等宽风个人站，与"终端风格"搭配 |
| trevortylerlee/astro-micro | 532 | 2026-08-13 | MIT | A | 个人站/博客，内置搜索与评论，零框架 | Astro 6 + TW4 | 演示截图 11 张（自身） | 极小依赖，易移植 |
| saicaca/fuwari | 5.0k | 2026-03-10 | MIT | A | 二次元风博客 | Astro 5 + **TW3** | 11 张 favicon/图 | 风格辨识度高；TW3 需升级，优先级低 |
| timlrx/tailwind-nextjs-starter-blog | 10.6k | 2026-02-08 | MIT | A | 博客/个人站 | Next 15 + TW4 + typography | 17 张图（favicon 与示例，未核实出处） | 星数最高的 Next 博客模板 |
| leoMirandaa/shadcn-landing-page | 2.0k | 2024-10-09 | MIT | A（栈旧） | SaaS 落地页：Navbar、Hero、HeroCards、Sponsors、About、Statistics、Features、Services、HowItWorks、Pricing、Testimonials、Team、FAQ、Cta、Newsletter、Footer | Vite/React 18 + **TW3** + shadcn | 6 张插画 png（`cube-leg.png` 等，来源未声明）；Sponsors 区有品牌 Logo | 区块齐全；已近 2 年未更新，需升级到 TW4 后才可收 |
| PageAI-Pro/page-ui | 1.7k | 2026-07-06 | MIT | A | 落地页组件库（hero、feature、pricing 等）+ 文档站 | React/Next + Tailwind（版本未核实） | `website/public` 下 337 个图片文件，来源未核实 | 区块级素材库，可拆区块；仓库大（974 文件） |
| shadcnstore/shadcn-dashboard-landing-template | 1.2k | 2026-02-17 | MIT | A | 落地页 + 后台，Vite 版与 Next 版 | React + Next + TW4 + shadcn（按 README） | 27 个截图/图，多为自身截图 | 落地页 + 后台一套 |
| shadcnstudio/shadcn-studio | 1.9k | 2026-08-20 | MIT（LICENSE 全文确认，SPDX 显示 NOASSERTION 是因标题格式） | A | 区块/模板集合 + 主题生成器 | Next 15 + TW4 + shadcn + motion | 仓库无位图；区块演示可能引用外链图（未核实） | 1,827 文件，区块量大，可挑选 |
| moumen-soliman/uitripled | 1.3k | 2026-08-28 | MIT | A | 区块/整页（shadcn 与 Base UI 双版本）+ Landing Page Builder | Next/monorepo，framer-motion | 少量 logo/赞助商图 | 有整页与背景生成器 |
| incluud/accessible-astro-starter | 1.2k | 2026-09-12 | MIT | A | 无障碍起步主题：着陆、博客、组件 | Astro 7 + TW4 | Atkinson Hyperlegible 字体（woff2，OFL 出处，需核实并附 OFL 声明）；`astronaut-hero-img.webp` 需换 | WCAG 合规是差异点 |
| themesberg/landwind | 1.0k | 2024-08-18 | MIT | A（栈旧） | SaaS 落地页（23 文件） | TW3 + Flowbite | 少量 favicon | 太旧，仅作 Flowbite 区块参考 |
| Blazity/next-saas-starter | 1.7k | 2026-09-26 | MIT | A（栈旧） | SaaS 落地页 + 博客 | Next 12.1 + React 17 | 8 张示例图 | 依赖极旧，只参考版式，不建议直接收 |
| wasp-lang/open-saas | 16.0k | 2026-09-22 | MIT | A | 全栈 SaaS 起步（含落地页） | Wasp 框架 + React + TW | 素材未核实 | 与 Wasp 强耦合，只取落地页部分，优先级低 |
| nextjs/saas-starter | 16.2k | 2025-12-11 | MIT（Vercel） | A | 全栈 SaaS 起步，含带终端动画的落地页与定价页 | Next + Postgres + Stripe | 未逐项核实 | 后端耦合重，仅取首页样式，优先级低 |
| imfing/hextra | 2.4k | 2026-09-29 | MIT | A | 文档/博客站（Hugo 主题） | Hugo + TW4 | `docs/` 下 12 张示例图 | 文档站首页视觉好，但 Hugo 不是 React，只能移植版式 |
| withastro/starlight | 9.3k | 2026-09-28 | MIT | A | 文档站首页框架（`examples/`） | Astro | 无 | 官方文档站基线；框架而非模板，取其 splash 首页模式 |
| fuma-nama/fumadocs | 13.3k | 2026-09-29 | MIT | A | React 文档框架（含 landing 示例） | Next + TW | 未核实 | React 原生文档站，值得做"文档首页"模板 |
| markmead/hyperui | 12.2k | 2026-09-26 | MIT | A | Tailwind v4 区块集（营销/电商/应用区块，纯 HTML） | Astro 站点 + TW4 | 演示区块里的图片为占位外链（未核实） | 区块粒度最细，星数高，HTML 易转 JSX |

### 1.2 B 级（代码可用，但必须处理素材/署名）

| 仓库 | ★ | 最近推送 | 许可证（核实后） | 分级 | 类型/页面 | 技术栈 | 素材问题 | 值得收录的理由 |
|---|---|---|---|---|---|---|---|---|
| mearashadowfax/ScrewFast | 1.4k | 2026-09-29 | MIT | B | 工业/服务企业站：首页、services、products（详情页）、blog、insights、contact，含法语 i18n | Astro 7 + TW4 + **gsap** | 35 张 avif 照片（`src/images/*.avif`，来源未声明）需全换；gsap 见 `components-motion.md` | 页面最完整（329 文件），适合"企业站"类；换图与去 gsap 后可用 |
| matt765/Tailcast | 409 | 2026-04-12 | MIT | B | 深色 SaaS/内容站：Hero、BentoFeatures、FeaturesDiagonal、FeatureTabs、HowItWorks、Pricing、Team、Testimonials、FAQ、Blog、Careers、Contact、Services、About | Astro 6 + TW4 | 16 张图（blog1~3 等，来源未声明），需换 | 深色高级感，Bento/斜切特色区块，值得收 |
| magicuidesign/portfolio | 1.5k | 2026-01-13 | MIT | B | 个人作品集（Dock、BlurFade、时间线、项目卡、黑客松、联系） | Next 16 + TW4 + motion + shadcn | `public/fonts/` 含 CabinetGrotesk、ClashDisplay（Fontshare 字体，再分发条款**未核实**，建议换）；含 Dillion 本人经历与公司 Logo（buildspace、atomic 等），全部是个人素材 | 视觉在作品集里最佳之一；只取版式与 Magic UI 用法 |
| NextJSTemplates/startup-nextjs | 1.7k | 2025-12-12 | MIT（README 说可商用） | B | SaaS 创业站：首页、about、blog、blog-details、blog-sidebar、contact、signin、signup、error | Next 16 + TW4 | 20 张图（blog/author/hero，来源未声明） | 页面类型多，登录/注册页齐全 |
| zeon-studio/astroplate | 1.2k | 2026-08-16 | MIT | B | 通用起步站 | Astro 7 + React + TW4 | **README：图片不可再分发，全部替换** | 结构好，图必须换 |
| themefisher/bigspring-light-nextjs | 282 | 2026-06-28 | MIT | B | 创意/营销机构站 | Next 16 + TW4 | **同上，图片无再分发权限** | 机构站版式 |
| ixartz/Next-JS-Landing-Page-Starter-Template | 2.1k | 2026-01-18 | MIT | B | SaaS 落地页 | Next 14 + **TW3** | `public/assets/images/` 含 Clerk、Crowdin 等品牌 Logo（`clerk-logo-*.png`、`crowdin-*.png`） | 需升级 TW4 并去品牌 |
| manulthanura/Positivus | 341 | 2025-09-03 | MIT | B | 数字营销机构站 | Astro 5 + **TW3** | README 标注 UI/UX 设计来自 Figma 作者 Olga，该 Figma 稿的许可**未核实**；22 张图 | 风格鲜明（绿/黑对比块），但设计源许可不明，先不收 |
| mirsazzathossain/mirsazzathossain.me | 295 | 2026-09-29 | MIT | B | 个人站 | Astro 7 + TW4 | 286 文件，含作者个人照片与内容，需全清 | 仅作参考 |
| StartBootstrap/startbootstrap-agency | 2.0k | 2024-07-15 | MIT（Start Bootstrap LLC，README 明确 free MIT） | B | 机构一页站 | **Bootstrap 5.2**，无 Tailwind | 30 张图（`dist/assets/img/`，来源未声明）；需整体重写为 Tailwind | 经典一页布局，可移植 |
| StartBootstrap/startbootstrap-creative | 2.1k | 2026-03-25 | MIT | B | 创意/作品集一页站 | Bootstrap 5.2 | 26 张图 | 同上 |
| StartBootstrap/startbootstrap-freelancer | 2.6k | 2024-03-17 | MIT | B | 自由职业者作品集 | Bootstrap 5 | 图未核实 | 同上 |
| tailwindtoolbox/Landing-Page | 1.5k | 2024-04-25 | MIT | B | 简单 SaaS 落地页 | TW（旧） | **README 要求图片署名**；仅 4 文件 | 太简陋，只参考 |
| area44/astro-multiverse | 125 | 2026-09-28 | CC BY 3.0（HTML5 UP 原设计 + 移植） | B | 画廊/作品集（Multiverse 主题） | Astro 7 + TW4 + React | **必须保留 HTML5 UP 署名**；Unsplash 图需换 | 唯一较新的 HTML5 UP 移植，需在页脚保留署名 |
| merakiuilabs/merakiui | 2.7k | 2025-07-11 | MIT | B | Tailwind 区块集（RTL、暗色） | TW（版本未核实） | README 提到示例使用 Unsplash 图 | 区块级参考；2025-07 后未更新 |

### 1.3 C 级（仅放链接，不拷代码）

| 仓库 | ★ | 最近推送 | 许可证（核实后） | 分级 | 类型 | 原因 |
|---|---|---|---|---|---|---|
| cruip/open-react-template | 4.7k | 2025-12-12 | 无 LICENSE 文件；README：GPL，禁止再分发 | C | SaaS 落地页 | 见第 0 节第 1 点 |
| cruip/tailwind-landing-page-template | 4.5k | 2025-12-12 | 同上 | C | SaaS 落地页 | 同上 |
| cruip/tailwind-dashboard-template | 2.8k | 2025-03-02 | 同上 | C | 后台 | 同上 |
| once-ui-system/magic-portfolio | 1.4k | 2026-08-08 | CC BY-NC 4.0 | C | 作品集 | 禁止商用 |
| htmlstreamofficial/preline | 6.5k | 2026-08-31 | MIT + Preline Fair Use（禁止竞品） | C | 组件/区块 | 我们的产品属于其竞品范畴 |
| vercel/nextjs-portfolio-starter | 728 | 2025-11-21 | 无 LICENSE | C | 作品集 | 无授权 |
| leerob/next-mdx-blog | 7.6k | 2026-09-16 | 无 LICENSE | C | 博客 | 无授权 |
| soumyajit4419/Portfolio、codebucks27/Next.js-Developer-Portfolio-Starter-Code | 6.5k、1.3k | 2025-10 / 2026-09 | 均无 LICENSE | C | 作品集 | 无授权 |
| saasyland/saasyland.com | 437 | 2026-09-26 | SPDX NOASSERTION，全文**未读**，按 C | C | SaaS 落地页 | 未核实 |

### 1.4 类型覆盖与缺口

| 类型 | 可用候选 | 缺口 |
|---|---|---|
| SaaS / 产品发布 | astrowind、launch-ui、saas-landing-template、Tailcast、startup-nextjs、shadcn-landing-page | 无 |
| 作品集 / 个人站 | devportfolio、magicui portfolio、cactus、micro | 无 |
| 机构 / 企业 | ScrewFast、bigspring（换图）、SB agency（移植） | 偏少，可自制 |
| App 落地页 | app-landing | 仅 1 个 |
| 博客 / 文档首页 | astro-paper、timlrx blog、starlight、fumadocs、hextra | 无 |
| **活动 / 会议** | 未找到合格件（`gdg-x/hoverboard` 1.2k★ 为 Polymer 旧栈，SPDX NOASSERTION，全文未读；`jekyll-theme-conference` 96★ 体量过小） | **建议自制**，可基于 astrowind 的 Countdown 与 Announcement widget |
| 产品发布 / 等候名单 | 未找到符合条件的独立仓库（GitHub 搜索无 >100★ 结果） | 建议基于 launch-ui + astrowind 自制 |

---

## 2. 设计风格（Styles）

风格采集原则：只收"规则可提炼"的来源。统一打包成 `tokens.css`（CSS 变量 + Tailwind v4 `@theme`）+ `rules.md` + 示例页。

### 2.1 主表

| 仓库 | ★ | 最近推送 | 许可证（核实后） | 分级 | 风格 / 类型 | 风格要点 | 技术栈 | 素材问题 | 值得收录的理由 |
|---|---|---|---|---|---|---|---|---|---|
| ekmas/neobrutalism-components | 5.6k | 2026-09-19 | MIT | A | Neo-brutalism | 已读 `src/styling/globals.css`：`--border-radius:5px`；硬阴影 `4px 4px 0 0 var(--border)`（无模糊）；边框与文字纯黑 `oklch(0% 0 0)`；背景浅蓝 `hsl(214 95% 93%)`，卡片纯白，主色 `hsl(217 100% 66%)`；标题 700、正文 500，DM Sans；按压反向位移 `--reverse-box-shadow` | Next 15、React 19、TW4、shadcn 风格；`src/components/ui/` 63 个文件 | `public/pfps/` 8 张头像（来源未声明，不带走） | 变量化最彻底，换 4 个变量就能换风格；文档站活跃 |
| neobrutalism/neobrutalism（RetroUI） | 1.6k | 2026-08-03 | MIT（LICENCE.md） | A（`public/decor/` 见素材列） | Neo-brutalism / 复古大胆 | 已读 Button：`border-2 border-black`、`shadow-md`、hover 下移 `translate-y-1`、active 再下移并 `shadow-none`；`rounded`（4px）；`font-head` 独立标题字体 | Next 16、TW4、`@base-ui`、motion、cva；`components/retroui/` 约 41 个 + charts | `public/decor/`（剪贴板、花等）共 69 个位图，插画版权**未声明**，不带；字体未核实 | 与 ekmas 同流派但更精致，带图表组件；作者站点名 retroui.dev |
| ANIBIT14/boldkit | 121 | 2026-09-20 | MIT | A（体量小） | Neo-brutalism（React + Vue） | 未逐条核实 token；README 描述 "bold, raw"，含形状元素 `assets/shapes.png` | shadcn + TW4 | 演示图（自身截图） | 新项目，1,600 文件，星数低，作补充 |
| TheOrcDev/8bitcn-ui | 2.0k | 2026-09-23 | MIT | A | 8-bit / 像素 | `components/ui/8bit/styles/retro.css`：`Press Start 2P` 字体，`line-height:1.5`，`letter-spacing:0.5px`，`image-rendering: pixelated`；`components/ui/8bit/` 122 个文件 | Next 16、TW4、radix | 字体通过 Google Fonts `@import` 引用（OFL），我们改为自托管并附 OFL；`public/assets/` 108 张截图不带 | 像素风最完整；shadcn registry 可直接对接 |
| pixelact-ui/pixelact-ui | 113 | 2026-07-29 | MIT | A（体量小） | 像素 / 玩趣 | 未逐条核实 | Vite、TW4、motion；29 个组件 | 仅 `og-image.png` | 星少，作为 8bitcn 的对照 |
| Dksie09/RetroUI（pixel-retroui） | 477 | 2025-05-11 | BSD-3-Clause | B | 像素 | 仓库带 `Minecraft.otf`、`Minecraft-Bold.otf`：**Minecraft 字体版权属 Mojang，许可未核实，不带**；TW3 | React 17-19、TW3 | 字体见左 | 与 neobrutalism/neobrutalism 同名不同项目，注意区分；停更 |
| nostalgic-css/NES.css | 21.8k | 2024-01-17 | MIT | A（停更但稳定） | 8-bit / NES | 推荐字体 Press Start 2P（README 明确其不附带字体）；粗像素边框、角切 | 纯 CSS | 无字体文件 | 星数最高的像素风；停更 2 年半，需检查现代浏览器表现 |
| jdan/98.css | 11.5k | 2025-09-07 | MIT | A | Win98 复古 OS | 3D 斜面边框、灰 `#c0c0c0`、蓝色标题栏 | 纯 CSS | 图标与 UI 图像模仿 Microsoft，商标外观风险，只拿 CSS 规则 | 复古 OS 风格的标杆 |
| botoxparty/XP.css | 3.1k | 2025-03-08 | MIT | A | Win XP 复古 | XP Luna 蓝/绿配色，圆角标题栏 | 纯 CSS | 同上 | 与 98.css 互补 |
| khang-nd/7.css | 2.4k | 2026-03-17 | MIT | A | Win7 Aero（玻璃） | 半透明 Aero 玻璃 + 渐变 | 纯 CSS | 同上 | 玻璃与复古的交叉 |
| React95/React95 | 3.8k | 2026-09-02 | MIT + "Windows and images are Microsoft's property" | B | Win95 React 组件 | 复古灰、斜面 | React + styled-components | Microsoft 图片不能带 | 只取组件规则，图像另绘 |
| webtui/webtui | 2.4k | 2026-08-12 | MIT | A | 终端 / TUI | 模块化 CSS，等宽字符网格、字符边框（`ch` 为单位） | 纯 CSS 模块 | `web/public/gallery/` 截图不带 | 终端风格现代实现，作者有 gallery |
| vinibiavatti1/TuiCss | 2.0k | 2026-06-19 | MIT | A | 终端 / DOS TUI | 蓝底 + 双线框 | 纯 CSS | 无 | 与 webtui 互补 |
| Gioni06/terminal.css | 1.5k | 2026-02-12 | MIT | A | 终端（极简） | 等宽、绿/琥珀单色 | 纯 CSS | 无 | 极简终端 |
| panr/hugo-theme-terminal | 2.8k | 2026-09-21 | MIT | A | 终端博客（Hugo） | 同上 | Hugo | 无 | 仅作视觉参考 |
| saadeghi/daisyui | 42.5k | 2026-09-30 | MIT | A | 主题包，35 个主题（`packages/daisyui/src/themes/*.css`）：retro、cyberpunk、synthwave、cmyk、lofi、wireframe、luxury、valentine、cupcake、pastel、aqua、sunset、dracula、nord、business 等 | 已读 `retro.css`：oklch 令牌（`--color-base-100: oklch(91.637% 0.034 90.515)` 暖米黄），`--radius-selector:.25rem`、`--radius-box:.5rem`，`--border:1px`、`--depth:0`、`--noise:0`；每个主题有 base/primary/secondary/accent/neutral/info/success/warning/error 及各自 content 色 | 纯 CSS 变量，TW4 插件 | 无 | 令牌化最规整，风格粒度小、数量大，最适合批量导入为"配色 + 圆角 + 深度"包 |
| jnsahaj/tweakcn | 10.4k | 2026-09-03 | Apache-2.0 | A（预设数据按 B 处理） | shadcn 主题预设，`utils/theme-presets.ts` 内含约 40 个：neo-brutalism、claymorphism、cyberpunk、retro-arcade、vintage-paper、notebook、bubblegum、candyland、pastel-dreams、doom-64、mono、graphite、catppuccin、elegant-luxury 等 | 数据格式即 shadcn 标准 CSS 变量（含字体、阴影、圆角） | TS 数据 | 预设中含品牌（twitter、vercel、supabase、claude、t3-chat），出处也未在数据文件里声明，不收；需附 Apache-2.0 LICENSE 与修改声明 | 现成的 claymorphism / neo-brutalism / vintage-paper 完整令牌，与 shadcn 直接兼容 |
| jln13x/ui.jln.dev | 1.3k | 2026-09-28 | MIT | B | "10000+ shadcn 主题"合集 | 主题为用户提交，出处与许可未核实 | Next 16、TW3 | 用户内容无授权保证 | 只当灵感来源 |
| catppuccin/catppuccin | 19.8k | 2026-07-25 | MIT | A | 柔和粉彩（Latte/Frappé/Macchiato/Mocha 四档）| 26 色命名调色板，暗/亮成对 | 调色板数据 | 无 | 全生态认可的调色板，适合做"pastel dev"风格 |
| rose-pine/rose-pine-theme | 1.6k | 2026-07-05 | MIT | A | 柔和暗调 | 低饱和 mauve/rose/pine 三主色 | 调色板 | 无 | 优雅暗调 |
| dracula/dracula-theme | 23.6k | 2026-09-24 | MIT | A | 经典暗紫 | 深紫底 + 高饱和霓虹点缀 | 调色板 | 无 | 用户熟悉度高 |
| nordtheme/nord | 6.9k | 2023-10-18 | MIT | A（停更） | 北欧冷灰蓝 | 16 色，冷色低饱和 | 调色板 | 无 | 稳定，停更但无需更新 |
| folke/tokyonight.nvim | 8.2k | 2026-03-24 | Apache-2.0 | A | 东京夜景 | 蓝紫 + 深藏青 | 调色板 | 需附 Apache 声明 | 备选 |
| radix-ui/colors | 1.7k | 2025-12-17 | MIT | A | 中性/极简单色的基础色阶 | 12 级语义色阶（背景/交互/边框/文字），含 P3 与暗色 | CSS/JS | 无 | 做 minimal mono / Swiss 风格的最佳底层 |
| argyleink/open-props | 5.5k | 2026-08-11 | MIT | A | 令牌库（颜色 oklch、阴影、缓动、渐变、字体栈、边框、动画） | `src/props.*.css` 分包 | CSS | 无 | 现成的 easing/shadow/gradient 令牌，避免自造 |
| tinted-theming/schemes | 298 | 2026-09-29 | MIT（版权头 Tinted Theming） | A | Base16/Base24 配色集合 | 每个 scheme 是 16 色 YAML | 数据 | 无；具体数量未核实 | 批量导入配色的数据源 |
| rdev/liquid-glass-react | 6.3k | 2025-06-13 | MIT | A（停更） | Glassmorphism / Liquid Glass | Apple 风折射玻璃；README 与实现依赖 SVG 位移滤镜，跨浏览器兼容性有限（未逐一核实 Safari/Firefox） | React | 无 | 星数最高的 glass 实现 |
| shuding/liquid-glass | 1.2k | 2026-03-26 | MIT | A | Liquid Glass（演示） | 同上思路 | JS | 无 | Vercel 的 Shu Ding，质量可信 |
| VII-Cae/hyalite--liquid-glass | 218 | 2026-09-11 | MIT | A | Liquid Glass | "SDF lens maps + SVG displacement + backdrop-filter，单文件无 WebGL" | JS | 无 | 依赖最少 |
| einui/einui | 152 | 2026-09-25 | MIT（LICENSE），README 徽章为 ISC，自相矛盾 | A（待确认） | Glass 组件（shadcn + Radix + TW4） | 磨砂玻璃 | Next 16、TW4 | 头像图不带 | 现成的 glass 组件 |
| naughtyduk/liquidGL | 901 | 2026-09-28 | MIT（仅 `scripts/` 与 `package/`） | B | WebGL 液态玻璃 | 需 WebGL/WebGPU | JS | `assets/` 下音频与 Neue Haas 字体**不可再分发** | 效果好，但更偏效果而非风格，走 B |
| edwardtufte/tufte-css | 6.6k | 2026-06-24 | MIT | A | 编辑 / 杂志 / 学术 | Tufte 风：衬线（ET Book）、侧注 margin note、窄栏、克制配色 | 纯 CSS | ET Book 字体文件的许可**未核实**（MIT 仓库内含），如带需确认 | 最经典的 editorial 文风来源 |
| picocss/pico | 16.9k | 2026-05-09 | MIT | A | 极简语义 HTML | 无 class 的语义样式，中性配色，可换主题色 | 纯 CSS | 无 | 极简底盘 |
| louismerlin/concrete.css | 635 | 2025-11-18 | MIT | A | Brutalist（网页原生粗野） | 系统字体、默认边框、极少装饰 | 纯 CSS | 无 | 与 neo-brutalism 区分的"raw brutalism" |
| wintermute-cell/magick.css | 1.0k | 2024-06-01 | MIT | A | 玩趣、手绘感 | 单文件，倾斜与弹性 | 纯 CSS | 无 | 玩趣类 |
| papercss/papercss | 4.2k | 2025-07-31 | ISC | A | 手绘 / 草图 | 不规则圆角边框，铅笔感 | SCSS | 无 | 手绘风稳定选择 |
| rough-stuff/rough-notation | 9.7k | 2024-03-18 | MIT | A（停更） | 手绘标注（下划线/圈注） | 手绘动画标注 | JS | 无 | 可作"手绘"风的装饰件 |
| adamgiebl/neumorphism | 6.2k | 2025-10-24 | BSD-3-Clause | A | Neumorphism（软 UI）生成器 | 双向阴影 `light/dark` 凸/凹；无法保证对比度 | JS 工具 | 无 | 用来生成令牌参数；对比度问题见风险 |
| moji2002/1st-pouf | 46 | 2026-08-30 | MIT | A（体量小） | Claymorphism | 未核实细节 | 未核实 | 未核实 | 星很少，claymorphism 优先取 tweakcn 预设 |
| maustinstar/shiny | 1.1k | 2024-07-12 | MIT | A（停更，内容未核实） | Skeuomorphic 拟物 | 未核实 | 未核实 | 未核实 | 拟物类唯一候选，需先看 demo |
| VoltAgent/awesome-design-md | 118.8k | 2026-09-21 | MIT | B（仅参考） | DESIGN.md：品牌设计系统摘要 | 文件格式（颜色、字体、间距、组件规则的 Markdown）本身可借鉴 | Markdown | 内容是第三方品牌视觉的提取，MIT 不能授予品牌仿造权 | 借"DESIGN.md"作为我们风格包 `rules.md` 的格式参考，不收品牌条目 |
| gwannon/Cyberpunk-2077-theme-css | 276 | 2023-05-14 | GPL-3.0 | C | Cyberpunk | GPL，且为 CD Projekt 游戏 UI 仿制 | CSS | 商标与版权风险 | 赛博朋克改用 daisyUI `cyberpunk` 与 tweakcn `cyberpunk` |
| codeAdrian/clay.css | 573 | 2022-11-23 | 无 LICENSE | C | Claymorphism | 无授权 | CSS | - | 不用 |
| morhetz/gruvbox | 15.8k | 2026-09-18 | 无 LICENSE 文件 | C | 复古暖色 | 无授权 | 调色板 | - | 用 tweakcn / daisyUI 等价配色代替 |

### 2.2 风格缺口

| 风格 | 现状 |
|---|---|
| Swiss / International | GitHub 上未找到 >50★ 且活跃的组件集。建议自制：Radix Colors（中性）+ Open Props（字体栈、缓动）+ 网格与大标题排版规则 |
| Bento | 没有独立"风格库"。已知来源：astrowind 的 `Bento.astro`、Tailcast 的 `BentoFeatures.astro`，以及 `components-motion.md` 里的 magicui bento-grid；`hubeiqiao/apple-bento-grid`（232★，MIT）是生成 Apple 风幻灯片的 agent skill，仿 Apple 视觉，仅参考 |
| Y2K / Vaporwave | 只找到 `torch2424/aesthetic-css`（219★，MIT，2022 停更）与 `PioneerVFD`（66★），质量与新鲜度都不够。建议自制 |
| Skeuomorphic | 仅 `maustinstar/shiny`（内容未核实） |
| Editorial / Magazine（现代） | 只有 Tufte CSS（学术向）。杂志风（大标题衬线 + 粗分隔线）建议自制 |

---

## 3. 优先整合清单

### 3.1 模板 Top 12

| # | 仓库 | 具体路径 | 要替换/处理的内容 |
|---|---|---|---|
| 1 | arthelokyo/astrowind | `src/components/widgets/`（Hero、Features、Bento、Pricing、Comparison、Countdown、FAQs、Testimonials、CTA）、`src/pages/`、`src/assets/images/` | 换 `hero-image.png`、`default.png`；删 `app-store.png`、`google-play.png`（品牌）；Astro 组件需重写为 React + TW4，类名可直接沿用 |
| 2 | launch-ui/launch-ui | `src/components/sections/{hero,logos,items,stats,pricing,faq,cta,navbar,footer}/default.tsx`、`app/page.tsx`、`app/globals.css` | 换 `public/dashboard-*.png`、`og.jpg`；删 `components/logos/` 下品牌 SVG，改用自绘占位 |
| 3 | gonzalochale/saas-landing-template | `components/{hero,partners,stats,pricing,testimonials,faq,footer,navbar}.tsx`、`app/page.tsx` | 换 `opengraph-image.png`；`partners` 用自绘占位 Logo |
| 4 | matt765/Tailcast | `src/components/*.astro`（BentoFeatures、FeaturesDiagonal、HowItWorks、Pricing、Team…）、`src/pages/{index,about,services,blog,careers,contact}.astro` | 换全部博客图与 `og-image.png`；Astro 重写为 React |
| 5 | RyanFitzgerald/devportfolio | `src/components/{Hero,About,Experience,Education,Projects,Header,Footer}.astro`、`src/pages/index.astro` | 无图，只换文案；重写为 React |
| 6 | bohd4nx/app-landing | `src/components/{AppHero,Features,FAQ,Footer}/`、`src/app/page.tsx` | 删 `fetchStoreData.ts` 与商店动态数据；`StoreButtons` 改为自绘按钮；换截图 |
| 7 | leoMirandaa/shadcn-landing-page | `src/components/{Hero,HeroCards,Features,Services,HowItWorks,Pricing,Testimonials,Team,FAQ,Newsletter,Footer}.tsx` | 6 张插画重绘；升级 TW3 到 TW4、React 19；Sponsors 换占位 |
| 8 | NextJSTemplates/startup-nextjs | `src/components/{Hero,Features,Pricing,Testimonials,Blog,Contact,Footer}/`、`src/app/{about,blog,contact,signin,signup}/page.tsx` | 换全部 `public/images/`（20 张） |
| 9 | mearashadowfax/ScrewFast | `src/pages/{index,services,products,blog,contact}.astro` 与对应组件 | 换 35 张 avif；去掉 gsap 改用 motion；去掉 `fr/` 多语言 |
| 10 | chrismwilliams/astro-theme-cactus | `src/pages`、`src/components`，配合终端风格 | 字体 Roboto Mono 改为自托管的 OFL 字体并附声明；换 `social-card.png` |
| 11 | magicuidesign/portfolio | `src/components/section/*`、`src/components/magicui/{dock,blur-fade,flickering-grid}.tsx`、`src/app/page.tsx` | 换 `public/fonts/`（Fontshare）；清除个人经历与公司 Logo；magicui 组件已由 `components-motion.md` 覆盖，只取版式 |
| 12 | satnaing/astro-paper | `src/pages`、`src/layouts`、`src/components` | 替换 `src/assets/images/AstroPaper-*.png` 与 OG 图；重写为 React |

补充：文档首页取 `fuma-nama/fumadocs` 或 `withastro/starlight`（首页 splash 版式，均为 MIT）；区块级补充取 `markmead/hyperui` 与 `shadcnstudio/shadcn-studio`。活动/会议、等候名单类需自制。

### 3.2 风格 Top 12

| # | 风格 | 来源与路径 | 打包内容 / 要处理的内容 |
|---|---|---|---|
| 1 | Neo-brutalism | `ekmas/neobrutalism-components`：`src/styling/globals.css`、`src/components/ui/*`（63 个） | 提取 `--border-radius`、`--box-shadow-x/y`、`--main`、`--background` 等；示例页用自绘占位，不带 `public/pfps/` |
| 2 | Neo-brutalism 变体（大胆复古） | `neobrutalism/neobrutalism`：`components/retroui/*` | 只取组件与 cva 规则；不带 `public/decor/` 位图 |
| 3 | 8-bit / 像素 | `TheOrcDev/8bitcn-ui`：`components/ui/8bit/styles/retro.css`、`components/ui/8bit/*` | Press Start 2P 自托管并附 OFL；不带 `public/assets/` 截图 |
| 4 | NES 像素（纯 CSS 版） | `nostalgic-css/NES.css` | 提取边框像素规则；停更，需在现代浏览器验证 |
| 5 | 终端 / TUI | `webtui/webtui`（主）+ `vinibiavatti1/TuiCss`（补充） | 提取字符网格与字符边框规则；不带 `web/public/gallery/` |
| 6 | 复古 OS | `jdan/98.css`（斜面边框、灰阶、蓝标题栏）、`botoxparty/XP.css` | 只取 CSS 规则；图标与 Windows 图形自绘，避免 Microsoft 外观 |
| 7 | 主题配色包（retro、cyberpunk、synthwave、lofi、cmyk、luxury、valentine、cupcake、wireframe） | `saadeghi/daisyui`：`packages/daisyui/src/themes/*.css` | 批量转为 Motif tokens（oklch 变量 + 圆角 + 深度 + 噪点）；保留 MIT 版权行 |
| 8 | Claymorphism / Neo-brutalism / Vintage paper / Notebook / Retro arcade / Mono | `jnsahaj/tweakcn`：`utils/theme-presets.ts`（只取这 6 个中性预设） | 附 Apache-2.0 LICENSE 与修改声明；不收 twitter、vercel、supabase、claude、t3-chat 等品牌预设 |
| 9 | 柔和粉彩（Catppuccin）与暗调（Rosé Pine、Dracula） | `catppuccin/catppuccin`、`rose-pine/rose-pine-theme`、`dracula/dracula-theme` | 提取调色板数值到 tokens；保留各自 MIT 版权行 |
| 10 | Minimal mono / Swiss（自制底层） | `radix-ui/colors`（色阶）+ `argyleink/open-props`：`src/props.{colors-oklch,shadows,easing,fonts,borders}.css` | 需自制网格与排版规则（缺口，见 2.2） |
| 11 | Glassmorphism / Liquid Glass | `VII-Cae/hyalite--liquid-glass`（单文件）、`shuding/liquid-glass`、`rdev/liquid-glass-react`；组件层参考 `einui/einui` | 需增加降级：不支持 SVG 位移滤镜时退回 `backdrop-filter: blur()`；确认 einui 许可 |
| 12 | Editorial / 手绘 | `edwardtufte/tufte-css`（衬线、侧注）+ `papercss/papercss`（手绘）+ `rough-stuff/rough-notation` | 先核实 ET Book 字体许可，不通过则用 OFL 衬线字体替代 |

---

## 4. 风险

1. **视觉质量未目视**：本报告未逐个打开 demo。整合前必须人工看 demo，剔除"星高但不好看"的项（尤其 fuwari、Blazity、shadcn-landing-page 等旧站）。
2. **技术栈落差**：多数 Astro 模板要重写成 React；TW3 项目（fuwari、shadcn-landing-page、Positivus、ixartz、landwind）需升级 TW4 才能收。
3. **素材出处普遍未声明**：即使代码 MIT，图片也可能来自 Unsplash/Pexels/Figma 社区/付费库。凡"来源未声明"的一律替换成我们生成的占位图或 CC0。这些 MIT 仓库不等于图片可再分发（astroplate、bigspring 已明文声明不可）。
4. **品牌资产**：App Store / Google Play 徽章、Clerk/Crowdin 等品牌 Logo、Microsoft/Windows 图形、Minecraft 字体，全部不带。
5. **字体**：CabinetGrotesk/ClashDisplay（Fontshare）、Roboto Mono、ET Book、Atkinson Hyperlegible、Neue Haas（liquidGL）的再分发条款均**未核实**；能走 Google Fonts / OFL 自托管的先走这条路并附 OFL 声明。
6. **MIT 署名要求**：所有 A/B 级拷贝需保留原版权行与 LICENSE；Apache-2.0（tweakcn、tokyonight）需附 LICENSE 与修改声明；CC BY 3.0（HTML5 UP）需页脚署名。建议在每个收录条目里放 `SOURCE.md` 记录仓库、commit、许可证、替换清单。
7. **仓库级 LICENSE 不等于文件级**：未检查文件头；shadcn 派生组件保留 shadcn MIT 声明。
8. **Commons Clause 类陷阱**：与 `components-motion.md` 一致，GitHub 的 SPDX 会显示 `NOASSERTION`（Preline、magic-portfolio、React95、liquidGL、shadcn-studio 都是这个值），必须读全文。本次读过的结果：shadcn-studio 实为纯 MIT，其余均有限制。
9. **停更风险**：NES.css（2024-01）、nord（2023-10）、rough-notation（2024-03）、landwind、StartBootstrap 部分模板停更；风格规则稳定，问题不大，但需验证浏览器兼容。
10. **兼容性与可访问性**：liquid glass 的折射依赖 SVG 位移与 `backdrop-filter`，Safari/Firefox 表现未核实，需降级；neumorphism 对比度天然不足，需要加对比度约束；像素字体 Press Start 2P 长文可读性差，规则里限定只用于标题。
11. **品牌仿造**：不收 awesome-design-md 的品牌条目；不收 Cyberpunk 2077 仿制；tweakcn 的品牌预设不收。
12. **数据未覆盖项**：astrowind 的具体页面数、webtui/NES.css/98.css 的确切文件路径、`tinted-theming/schemes` 的方案数量、`hyperui` 营销区块的具体路径、`moji2002/1st-pouf` 与 `maustinstar/shiny` 的风格细节，均未核实，整合时先读源码确认。
13. **动效降级**：与 `components-motion.md` 的结论一致，这些模板多数无 `prefers-reduced-motion` 处理（未逐个检查），整合时统一注入。
