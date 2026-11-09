---
name: motif-navbar-collab-presence
description: "A document header with a back arrow and title, history, comments and invite icon buttons, and a row of live collaborator avatars with green presence dots and a +3 overflow. Made for editors, whiteboards and design files. Use when the user asks for Collaboration Header, 协作文档顶栏, navbar, header, avatar, presence, collaboration, editor or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/navbar-collab-presence"
  motif-item: "navbar-collab-presence"
  params-hash: "9c27228f"
---

# Collaboration Header (协作文档顶栏)

A document header with a back arrow and title, history, comments and invite icon buttons, and a row of live collaborator avatars with green presence dots and a +3 overflow. Made for editors, whiteboards and design files.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/navbar-collab-presence.tsx` — the component (`NavbarCollabPresence`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-navbar-collab-presence`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/navbar-collab-presence/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { NavbarCollabPresence } from '@/components/motif/navbar-collab-presence/navbar-collab-presence'

<NavbarCollabPresence />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `docTitle` | Basic UI | Basic UI | ≤ 40 chars | Document title |
| `collaborators` | Kelly King, Martha Johnson, Linda Green, Omar Diaz, Priya Nair, Tom Becker | Kelly King, Martha Johnson, Linda Green, Omar Diaz, Priya Nair, Tom Becker | ≤ 160 chars | Comma-separated; names beyond the visible count go into +N |
| `maxVisible` | 3 | 3 | 1–5 | Visible avatars |
| `presenceColor` | #10b981 | #10b981 | color | Presence dot |
| `showActions` | true | true | boolean | Action buttons |
| `height` | 64 | 64 | 48–80 px (best 56–72) | Height |
| `accent` | #6366f1 | #6366f1 | color | Avatar accent |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
