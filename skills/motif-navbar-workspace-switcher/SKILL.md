---
name: motif-navbar-workspace-switcher
description: "A slash-separated header (logo / Personal account ▾ / Main project ▾) where each crumb is a switcher with search and a create action, followed by Dashboard / Docs / API reference links and the account menu. Made for multi-tenant developer platforms. Use when the user asks for Workspace Switcher Bar, 工作区切换顶栏, navbar, header, breadcrumb, switcher, workspace, dashboard, saas or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/navbar-workspace-switcher"
  motif-item: "navbar-workspace-switcher"
  params-hash: "74da0c46"
---

# Workspace Switcher Bar (工作区切换顶栏)

A slash-separated header (logo / Personal account ▾ / Main project ▾) where each crumb is a switcher with search and a create action, followed by Dashboard / Docs / API reference links and the account menu. Made for multi-tenant developer platforms.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/navbar-workspace-switcher.tsx` — the component (`NavbarWorkspaceSwitcher`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-navbar-workspace-switcher`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/navbar-workspace-switcher/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { NavbarWorkspaceSwitcher } from '@/components/motif/navbar-workspace-switcher/navbar-workspace-switcher'

<NavbarWorkspaceSwitcher />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `brandName` | Northwind | Northwind | ≤ 20 chars | Brand name |
| `separator` | slash | slash | slash / chevron / dot | Separator |
| `levels` | 2 | 2 | 1–2 | 1 = project only, 2 = account + project |
| `showTabs` | true | true | boolean | Nav links |
| `showPlanBadge` | true | true | boolean | Plan badge |
| `height` | 64 | 64 | 48–80 px (best 56–72) | Height |
| `accent` | #18181b | #18181b | color | Accent |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
