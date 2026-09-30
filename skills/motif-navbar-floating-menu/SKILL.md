---
name: motif-navbar-floating-menu
description: "A frosted pill navbar whose hover highlight glides between links on a spring, with a Products mega menu of three icon rows and a gradient feature card. Also a full-width bar variant, collapsing to a hamburger on phones. Use when the user asks for Floating Navbar with Mega Menu, 悬浮导航与大菜单, navbar, header, mega menu, floating, glass, dropdown or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/navbar-floating-menu"
  motif-item: "navbar-floating-menu"
  params-hash: "b3dc69a0"
---

# Floating Navbar with Mega Menu (悬浮导航与大菜单)

A frosted pill navbar whose hover highlight glides between links on a spring, with a Products mega menu of three icon rows and a gradient feature card. Also a full-width bar variant, collapsing to a hamburger on phones.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/navbar-floating-menu.tsx` — the component (`NavbarFloatingMenu`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/navbar-floating-menu/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { NavbarFloatingMenu } from '@/components/motif/navbar-floating-menu/navbar-floating-menu'

<NavbarFloatingMenu />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `brand` | Halcyon | Halcyon | ≤ 18 chars | Brand name |
| `cta` | Get started | Get started | ≤ 20 chars | Button label |
| `accent` | #7c8cff | #7c8cff | color | Accent color |
| `tone` | dark | dark | dark / light | Tone |
| `radius` | 999 | 999 | 0–999 px (best 12–999) | Radius |
| `blur` | 16 | 16 | 0–32 px (best 8–24) | Glass blur |
| `layout` | floating | floating | floating / bar | Style |

## Rules

- Four to five top-level links at most; only one of them opens a mega menu, and it lists three items plus one feature card.
- The navbar sits on top of page content, so keep the glass background translucent and let the blur do the separation; do not add a solid fill.
- One filled accent button on the right (the primary action); Sign in stays a quiet text link.
- Navigation is a real nav with buttons and aria-expanded; keep keyboard focus opening the menu.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from launch-ui/launch-ui).
