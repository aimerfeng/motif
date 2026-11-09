---
name: motif-navbar-app-header
description: "An in-app header with logo, nav links with an active underline, search, a language select, theme toggle, help menu, a notification bell with an unread panel and an avatar account menu; collapses into a hamburger popover on phones. Made for SaaS dashboards. Use when the user asks for App Header, 应用顶栏, navbar, header, app, dashboard, notifications, account menu, search, saas or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/navbar-app-header"
  motif-item: "navbar-app-header"
  params-hash: "4f3d5e80"
---

# App Header (应用顶栏)

An in-app header with logo, nav links with an active underline, search, a language select, theme toggle, help menu, a notification bell with an unread panel and an avatar account menu; collapses into a hamburger popover on phones. Made for SaaS dashboards.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/navbar-app-header.tsx` — the component (`NavbarAppHeader`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-navbar-app-header`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/navbar-app-header/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { NavbarAppHeader } from '@/components/motif/navbar-app-header/navbar-app-header'

<NavbarAppHeader />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `brandName` | Kestrel | Kestrel | ≤ 18 chars | Brand name |
| `layout` | inline | inline | inline / centered / stacked | Layout |
| `showSearch` | true | true | boolean | Search |
| `showLanguage` | true | true | boolean | Language select |
| `showNotifications` | true | true | boolean | Notifications |
| `activeStyle` | underline | underline | underline / pill / text | Active link |
| `height` | 64 | 64 | 52–80 px (best 56–72) | Height |
| `accent` | #8b5cf6 | #8b5cf6 | color | Accent |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
