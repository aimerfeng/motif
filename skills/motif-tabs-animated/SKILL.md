---
name: motif-tabs-animated
description: "A spring-driven indicator glides to the next tab while the panel slides in from the direction you moved. Underline, pill and segment styles, fully keyboard-driven. Made for settings pages, detail views and dashboards. Use when the user asks for Animated Tabs, 滑动指示选项卡, tabs, indicator, layout, spring, a11y, keyboard or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/tabs-animated"
  motif-item: "tabs-animated"
  params-hash: "17a0eed5"
---

# Animated Tabs (滑动指示选项卡)

A spring-driven indicator glides to the next tab while the panel slides in from the direction you moved. Underline, pill and segment styles, fully keyboard-driven. Made for settings pages, detail views and dashboards.

## When to use

- Use for switching between sibling views of the same object (settings sections, a record's detail views). For page navigation prefer real links.

## Files

- `assets/tabs-animated.tsx` — the component (`TabsAnimated`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-tabs-animated`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/tabs-animated/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { TabsAnimated } from '@/components/motif/tabs-animated/tabs-animated'

<TabsAnimated />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | underline | underline | underline / pill / segment | Variant |
| `color` | #8b5cf6 | #8b5cf6 | color | Accent |
| `size` | md | md | sm / md / lg | Size |
| `radius` | 10 | 10 | 4–20 px (best 6–14) | For pill and segment styles |
| `stretch` | false | false | boolean | Stretch to width |
| `spring` | visualDuration 0.3, bounce 0.12 | visualDuration 0.3, bounce 0.12 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |

## Rules

- Pass items as { value, label, icon?, badge?, content? }. Give every item content to get the animated tabpanel, or omit content and render your own panels keyed by the onValueChange value.
- Keep it controlled or uncontrolled, not both. The tablist is keyboard-navigable (Arrow keys, Home, End) with automatic activation; do not add extra tabIndex handling.
- Labels stay short (one or two words). Do not nest a second tablist inside a panel with the same accent.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from educlopez/smoothui).
