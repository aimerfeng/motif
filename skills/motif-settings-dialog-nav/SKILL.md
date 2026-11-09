---
name: motif-settings-dialog-nav
description: "A large settings modal with its own left navigation and a breadcrumb header; switching sections slides the right pane, and on phones the nav becomes a back-stack. For app-wide preferences opened from an avatar menu. Use when the user asks for Settings Dialog, 设置弹窗, settings, dialog, modal, sidebar, preferences, shadcn or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/settings-dialog-nav"
  motif-item: "settings-dialog-nav"
  params-hash: "f0eaaa47"
---

# Settings Dialog (设置弹窗)

A large settings modal with its own left navigation and a breadcrumb header; switching sections slides the right pane, and on phones the nav becomes a back-stack. For app-wide preferences opened from an avatar menu.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/settings-dialog-nav.tsx` — the component (`SettingsDialog`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-settings-dialog-nav`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/settings-dialog-nav/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { SettingsDialog } from '@/components/motif/settings-dialog-nav/settings-dialog-nav'

<SettingsDialog />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #7c8cff | #7c8cff | color | Accent |
| `width` | 800 | 800 | 640–960 px (best 700–880) | Max width |
| `radius` | 10 | 10 | 0–24 px (best 6–16) | Radius |
| `navStyle` | muted | muted | muted / accent / bar | Active nav style |
| `panelTransition` | slide | slide | slide / fade / none | Pane transition |
| `dim` | 0.5 | 0.5 | 0.1–0.85 (best 0.3–0.7) | Backdrop dim |
| `spring` | visualDuration 0.35, bounce 0.1 | visualDuration 0.35, bounce 0.1 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from shadcn-ui/ui).
