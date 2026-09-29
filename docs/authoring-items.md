# 编写市场条目

每个市场条目是 `packages/registry/items/<slug>/` 下的一个目录。先看三个参考条目，它们覆盖了三种典型写法：

| 条目 | 写法 |
| --- | --- |
| `mesh-gradient` | 包装一个 vendor 依赖（`@paper-design/shaders-react`），价值在参数、预设和 Skill |
| `border-beam` | 移植一个 motion + Tailwind 组件（magicui） |
| `liquid-form` | 移植一个原生 WebGL 组件（threeui），渲染循环换成 motif-runtime |

**质量第一。** 这是设计素材站。默认参数就应该是最好看的状态；参数范围内任何值都不能难看；演示要像一个真实产品里的用法。

## 目录结构

```
items/<slug>/
  item.ts          清单（defineItem），slug 必须等于目录名
  <slug>.tsx       组件本体（entry），用户最终拿走的代码
  shaders.ts       可选：GLSL 字符串（role: shader）
  <name>.css       可选：@theme / @keyframes（role: style）
  demo.tsx         预览用的演示（role: demo）
```

所有文件都要列在 `item.ts` 的 `files` 里。

## item.ts

照抄参考条目的结构。要点：

- `title` / `summary`：中英两份。中文要自然，不要像翻译腔；summary 一两句话：看起来是什么样 + 适合用在哪里。
- `category`：background、shader、text、button、card、cursor、navigation、layout、data、transition、3d 之一。
- `runtime`：react、motion、css、svg、canvas2d、webgl、webgl2、three 中用到的。
- `entry.export` 是组件的导出名；`demo.export` 固定为 `Demo`；`demo.theme` 一般是 `dark`，只有为浅色设计的效果才用 `light`。
- `params`：5–10 个真正值得调的参数。每个都有中英 `label`，必要时加 `hint`。范围要收紧到「任何值都好看」；推荐区间写在 `safe`。颜色用 `color`，多色用 `palette`，弹簧用 `spring`（`visualDuration` + `bounce`），缓动用 `easing`（cubic-bezier 四个数）。用 `group` 把参数分组（如 motion、look、layout、interaction）。
- `presets`：3–5 个，每个都是完整、好看、彼此差别明显的风格；名字要有画面感（中文如「夜曲」「余烬」，英文如 Nocturne、Ember），不要直译。
- `dependencies`：代码里 import 的 vendor 模块（不含 react、react-dom、react/jsx-runtime）。
- `perf`：`webgl` 是否用 WebGL；`maxDpr` 是像素比上限（重的着色器用 1.5）。
- `a11y.reducedMotion`：开启「减少动态效果」时的表现，`static`（停在一帧）最常用；只在交互时才动、平时静止的用 `not-animated`。
- `capture`：生成海报和循环视频的提示。卡片、按钮这类小组件设 `zoom`（1.6–2.4），让它在画面里占满；`posterTime` 选最好看的时刻；需要交互才会动而演示又没有自动播放的，`loop: 0`。
- `provenance`：见下文「来源与许可证」。

## 组件文件

```tsx
// SPDX-License-Identifier: MIT
// Copyright (c) Magic UI
// Source: https://github.com/magicuidesign/magicui/blob/d7207e5/apps/www/registry/magicui/border-beam.tsx
// Modified by Motif; see the item's provenance.
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@motif/runtime'

/* @motif:defaults */
export const defaults = { … }
/* @motif:end */

export type BorderBeamProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

export function BorderBeam({ className, style, ...props }: BorderBeamProps) {
  const options = { ...defaults, ...props }
  …
}
```

- **默认值区域不要手写。** 改完 `item.ts` 的 `params` 后运行 `pnpm items:sync-defaults <slug>`，它会按参数重新生成这一段（导出时用户调好的值也写回这里）。
- 组件接收 `Partial<typeof defaults>` 加上 `className`、`style`，背景类组件再加 `children`（叠在效果之上）。
- **只能 import**：`react`、`react-dom`、`motion`、`motion/react`、`three`、`@paper-design/shaders-react`、`cobe`、`@motif/runtime`，以及条目自己的相对路径文件。没有 lucide、clsx、react-use-measure 等：图标直接内联 SVG，`cn` 从 `@motif/runtime` 取，测量尺寸用 `ResizeObserver`。
- 上游的 `framer-motion` 改成 `motion/react`；`@/lib/utils` 的 `cn` 改成 `@motif/runtime`。
- Tailwind v4 的类名可以直接用；主题色用 `bg-background`、`text-foreground`、`text-muted-foreground`、`bg-primary`、`border` 等（变量见 `packages/runtime/src/theme.css`）。自定义动画写在条目自己的 `.css` 文件里（`@theme { --animate-x: … }` + `@keyframes`）。
- 不许出现任何外部 URL、`fetch`、CDN、Google Fonts、统计脚本。图片素材只能是自己生成的或 CC0，并登记在 `provenance.assets`。
- 不要 `transition: all` / `transition-all`，列出真正变化的属性；动画只动 `transform`、`opacity`（以及 `filter`、`clip-path` 等合成层友好的属性）。

### motion 组件

- 用 `useReducedMotion()`：开启时停在一个好看的静止状态，或者改成淡入淡出；功能性反馈（如按下）可以保留但要收敛。
- 弹簧参数优先用 `visualDuration` + `bounce`。

### WebGL / Canvas 组件

照 `liquid-form` 的写法：

- `useCanvasSize(canvasRef, { maxDpr })` 负责尺寸和像素比上限；`onResize` 里重画一帧。
- `useFrameLoop(hostRef, ({ time, delta }) => draw(time), { speed, reducedMotion: 'static', staticTime })` 负责循环：离屏、切到后台时暂停，减少动态效果时只画一帧 `staticTime`。时间用它给的 `time`（已乘 speed），不要自己读 `performance.now()`。
- 参数放进 `optionsRef`，每次渲染更新，改参数不重建 WebGL 上下文。
- `createProgram`、`bindFullscreenQuad` 建程序；监听 `webglcontextlost`（`preventDefault`，丢掉状态）和 `webglcontextrestored`（重新 setup）；卸载时释放资源并 `releaseContext(gl)`。
- 用 `pointermove` 做交互时挂在 host 元素上，并做缓动。
- 用 `delta` 驱动的模拟（粒子、流体）要能承受 `delta` 为 0 和较大的值。

## demo.tsx

```tsx
export function Demo(props: BorderBeamProps) { … }
```

- 接收全部参数作为 props，原样传给组件。演示要铺满画面（最外层 `h-full w-full`）。
- 背景、着色器类：只放效果本身，不加文字。
- 组件类：放在 `bg-background` 上居中，配上真实、克制的内容（英文短文案即可）。不要 lorem ipsum，不要「Unlock your potential」这种空话，不要一堆渐变按钮。
- 需要交互才会动的效果（磁吸、倾斜、聚光等）：演示里加一个「自动播放」，用 `useFrameLoop` 模拟一个缓慢移动的虚拟指针；用户真正移动指针时停止自动播放。组件本体不需要这段逻辑，这样海报和循环视频里也能看到效果。

## 来源与许可证

仓库是公开的。只整合 `sources/sources.json` 里登记过的 A 级来源，固定在登记的 sha。

- 每个来自上游的代码文件（component、lib、shader、style）开头都要有许可证头：`SPDX-License-Identifier` 一行，和 `sources.json` 里该来源的 `copyright` **逐字相同**的版权行，`Source:` 行指向上游文件（用短 sha），以及 `Modified by Motif; see the item's provenance.`（着色器原样照搬时写 `Shader code unchanged.`）。
- `provenance.upstream`：`source` 是 `sources.json` 的 id，`sha` 是完整 sha，`paths` 列出参考过的上游文件，`copyright` 与登记的一致；上游声明了更早的来源时写进 `origin`。
- `provenance.modifications`：诚实列出你改了什么（英文）。
- 绝对不要从 react-bits、animate-ui、Aceternity、Shadertoy、lygia 或任何没有许可证的项目拿代码，也不要照着它们「重写」同名同形的组件。

## 验证（每个条目都必须通过）

```bash
pnpm items:sync-defaults <slug>       # 生成默认值区域
pnpm audit:items <slug>               # 清单、依赖、许可证头、默认值区域、编译：0 个 error
pnpm --filter @motif/registry lint    # 类型检查：你的条目文件里不能有错误
pnpm capture <slug>                   # 海报 + 循环视频 + 闸门：必须 ✓
```

`pnpm capture` 的闸门：能挂载、没有控制台错误、帧率 ≥ 55、海报不是空白、画面确实在动、减少动态效果时静止。生成的海报在 `apps/web/public/media/<slug>/poster.webp`，**一定要亲眼看**（用 sharp 转成 PNG 再看），不好看就改默认参数、`posterTime`、`zoom` 或演示，直到它能放进作品集。
