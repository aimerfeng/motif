---
name: motif-pagination-pages
description: "A highlight glides to the current page while ellipses adapt around it, with first / previous / next / last buttons, a \"Go to page\" field and a rows-per-page select with a \"21–40 of 312\" range label. For tables, search results and archives. Use when the user asks for Pagination, 分页器, pagination, pages, table, navigation, rows per page or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/pagination-pages"
  motif-item: "pagination-pages"
  params-hash: "8d05dd98"
---

# Pagination (分页器)

A highlight glides to the current page while ellipses adapt around it, with first / previous / next / last buttons, a "Go to page" field and a rows-per-page select with a "21–40 of 312" range label. For tables, search results and archives.

## When to use

- Docks, bars and menus where motion explains spatial relationships.

## Files

- `assets/pagination-pages.tsx` — the component (`PaginationPages`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-pagination-pages`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/pagination-pages/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { PaginationPages } from '@/components/motif/pagination-pages/pagination-pages'

<PaginationPages />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #6366f1 | #6366f1 | color | Accent |
| `variant` | outline | outline | outline / solid | Active style |
| `siblings` | 1 | 1 | 0–2 | Pages shown on each side of the current one |
| `showJump` | true | true | boolean | Go to page |
| `showPageSize` | true | true | boolean | Rows per page |
| `radius` | 8 | 8 | 0–18 px (best 4–18) | Corner radius |
| `spring` | visualDuration 0.3, bounce 0.2 | visualDuration 0.3, bounce 0.2 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |

## Rules

- Navigation must stay usable with the keyboard; motion is decoration on top.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from keenthemes/reui).
