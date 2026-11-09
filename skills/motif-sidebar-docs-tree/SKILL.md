---
name: motif-sidebar-docs-tree
description: "A documentation sidebar where sections expand into nested links, the current page is highlighted and its branch opens automatically, with an optional filter box on top. Made for docs sites, handbooks and knowledge bases. Use when the user asks for Docs Navigation Sidebar, 文档导航树侧栏, sidebar, docs, tree, navigation, knowledge base, filter or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/sidebar-docs-tree"
  motif-item: "sidebar-docs-tree"
  params-hash: "9c05e49b"
---

# Docs Navigation Sidebar (文档导航树侧栏)

A documentation sidebar where sections expand into nested links, the current page is highlighted and its branch opens automatically, with an optional filter box on top. Made for docs sites, handbooks and knowledge bases.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/sidebar-docs-tree.tsx` — the component (`DocsTreeSidebar`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-sidebar-docs-tree`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/sidebar-docs-tree/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { DocsTreeSidebar } from '@/components/motif/sidebar-docs-tree/sidebar-docs-tree'

<DocsTreeSidebar />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `brandName` | Lumen Docs | Lumen Docs | ≤ 24 chars | Brand name |
| `showFilter` | true | true | boolean | Show filter |
| `activeStyle` | soft | soft | soft / solid / bar | Current page style |
| `guides` | false | false | boolean | Indent guides |
| `accent` | #6366f1 | #6366f1 | color | Solid style text picks white or near-black by contrast |
| `indent` | 20 | 20 | 12–28 px (best 16–24) | Indent |
| `width` | 272 | 272 | 220–340 px (best 240–300) | Sidebar width |

## Rules

- Pass your own items record (id → name, href, children) and rootId; mark the current page with `current` so its branch opens on load.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
