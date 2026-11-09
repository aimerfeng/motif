---
name: motif-comparison-before-after
description: "The old-way-versus-new-way block: one side lists the manual steps across five tools with their time cost and friction, the hops between tools drawn as a tangle; the other does the same job in three steps. A switch, or a draggable divider on wide screens, moves focus between them, the other side fades to grey while staying readable, and the time saved lights up at the bottom as the saved stretch of the bar fills in. For landing pages that sell a change of workflow. Use when the user asks for Before & After Workflow, 使用前后的流程对比, before-after, comparison, workflow, process, time saved, old vs new, switch, divider, landing or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/geist-mono, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/comparison-before-after"
  motif-item: "comparison-before-after"
  params-hash: "51da857d"
---

# Before & After Workflow (使用前后的流程对比)

The old-way-versus-new-way block: one side lists the manual steps across five tools with their time cost and friction, the hops between tools drawn as a tangle; the other does the same job in three steps. A switch, or a draggable divider on wide screens, moves focus between them, the other side fades to grey while staying readable, and the time saved lights up at the bottom as the saved stretch of the bar fills in. For landing pages that sell a change of workflow.

## When to use

- Use on a landing page that sells a change of workflow: the old manual process on one side, the same job done with your product on the other, and the hands-on time it gives back. Replace BEFORE, AFTER, HANDLED, HOPS and the eyebrow / subcopy with your own flow.

## Files

- `assets/comparison-before-after.tsx` — the component (`ComparisonBeforeAfter`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-comparison-before-after`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/geist-mono clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/comparison-before-after/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/geist-mono';` to the global stylesheet.
4. Use it:

```tsx
import { ComparisonBeforeAfter } from '@/components/motif/comparison-before-after/comparison-before-after'

<ComparisonBeforeAfter />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `heading` | Close the books in fourteen minutes, not six hours | Close the books in fourteen minutes, not six hours | ≤ 72 chars | Heading |
| `product` | Coppice | Coppice | ≤ 14 chars | Used in the “With …” switch, panel label and bars |
| `accent` | #6ee7b7 | #6ee7b7 | color | Colors the new-way side; ink adapts automatically |
| `tone` | dark | dark | dark / light | Tone |
| `stepStyle` | timeline | timeline | timeline / cards / receipt | Step style |
| `radius` | 18 | 18 | 0–28 px (best 4–26) | Corner radius |
| `mode` | switch | switch | switch / divider | The divider appears from 1024px; narrower screens keep the switch |
| `showTimeSaved` | true | true | boolean | Show time saved |

## Rules

- Both sides describe the same job measured the same way (hands-on minutes per run). The totals, the saved figure and the yearly hours are computed from the steps, so keep the minutes honest and they will add up.
- Old-way steps name the tool and one concrete friction ("Duplicate amounts break the lookup"); keep four to seven of them. New-way steps are three short verb phrases with a plain note. No adjectives like "seamless".
- Tools are generic categories and the product mark is invented. Never show real company logos for the "before" tools.
- The switch is a radio group (arrow keys). In divider mode the divider is a slider on screens 1024px and wider (drag, click, arrow keys, Home / End, Enter toggles) and the switch takes over below that. Drive it with focus + onFocusChange, or leave it uncontrolled with defaultFocus. Both keep visual and ARIA state in sync: a controlled parent that ignores a change snaps the divider back.
- Switch mode only animates opacity, colors and transforms. Divider mode is the one deliberate exception: it is a resizable split, so it rewrites grid-template-columns while dragging and during the 0.6 s settle spring and the text reflows with the column. Keep the panels light (no images, no heavy effects) if you use it.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.
