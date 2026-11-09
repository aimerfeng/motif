---
name: motif-banner-workspace-welcome
description: "A dismissible welcome card for a fresh workspace: a heading and blurb with a Get started button and tutorials link, three starter steps with links, or a step-by-step create-your-first-dashboard guide. Sits at the top of an empty dashboard. Use when the user asks for Workspace Welcome Banner, 工作区欢迎横幅, banner, welcome, onboarding, dashboard, empty-state, getting-started or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/banner-workspace-welcome"
  motif-item: "banner-workspace-welcome"
  params-hash: "1b1a442c"
---

# Workspace Welcome Banner (工作区欢迎横幅)

A dismissible welcome card for a fresh workspace: a heading and blurb with a Get started button and tutorials link, three starter steps with links, or a step-by-step create-your-first-dashboard guide. Sits at the top of an empty dashboard.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/banner-workspace-welcome.tsx` — the component (`WorkspaceWelcomeBanner`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-banner-workspace-welcome`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/banner-workspace-welcome/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { WorkspaceWelcomeBanner } from '@/components/motif/banner-workspace-welcome/banner-workspace-welcome'

<WorkspaceWelcomeBanner />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | steps | steps | intro / steps / highlight / dashboard | Variant |
| `title` | Welcome to your workspace | Welcome to your workspace | ≤ 48 chars | Title |
| `description` | Follow the steps below or browse our developer documentation to start using the platform. | Follow the steps below or browse our developer documentation to start using the platform. | ≤ 220 chars | Description |
| `accent` | #3b82f6 | #3b82f6 | color | Buttons, links and markers |
| `tone` | dark | dark | dark / light | Tone |
| `decor` | false | false | boolean | Tinted surface |
| `dismissible` | true | true | boolean | Dismissible |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from tremorlabs/tremor-blocks).
