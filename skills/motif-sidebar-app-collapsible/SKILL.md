---
name: motif-sidebar-app-collapsible
description: "The standard app sidebar: a team switcher on top, grouped navigation with collapsible submenus, a projects list and a user menu at the bottom. It collapses to an icon rail with tooltips and can sit flush, floating or inset. Made for dashboards and SaaS products. Use when the user asks for Collapsible App Sidebar, 可收起应用侧栏, sidebar, app shell, dashboard, navigation, collapsible, icon rail, shadcn or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/sidebar-app-collapsible"
  motif-item: "sidebar-app-collapsible"
  params-hash: "99f3f14a"
---

# Collapsible App Sidebar (可收起应用侧栏)

The standard app sidebar: a team switcher on top, grouped navigation with collapsible submenus, a projects list and a user menu at the bottom. It collapses to an icon rail with tooltips and can sit flush, floating or inset. Made for dashboards and SaaS products.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/sidebar-app-collapsible.tsx` — the component (`AppSidebar`); the tuned values are baked into its `defaults` object
- `assets/sidebar-app-collapsible.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-sidebar-app-collapsible`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/sidebar-app-collapsible/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { AppSidebar } from '@/components/motif/sidebar-app-collapsible/sidebar-app-collapsible'

<AppSidebar />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | sidebar | sidebar | sidebar / floating / inset | Variant |
| `collapsed` | false | false | boolean | Collapsed to icons |
| `width` | 256 | 256 | 224–304 px (best 240–288) | Expanded width |
| `showProjects` | true | true | boolean | Show projects |
| `brandName` | Halcyon Inc | Halcyon Inc | ≤ 24 chars | Team name |
| `accent` | #6366f1 | #6366f1 | color | The mark glyph picks white or near-black by contrast |
| `radius` | 10 | 10 | 4–16 px (best 6–14) | Radius |
| `spring` | visualDuration 0.25, bounce 0 | visualDuration 0.25, bounce 0 | visualDuration 0.05–4 s, bounce 0–0.9 | Collapse spring |

## Rules

- AppSidebar is the whole app shell: pass page content as children; below 768px container width the sidebar becomes a slide-in sheet opened by the header trigger.
- Collapsing is controlled by `collapsed`; listen to `onCollapsedChange` (trigger, rail or Cmd/Ctrl+B) when you keep the state yourself.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from shadcn-ui/ui).
