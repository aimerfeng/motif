---
name: motif-online-magazine
description: "A multi-author online magazine: masthead and section nav, a cover story with a generated illustration next to a most-read list, story cards filtered by Culture, Science and Food, and a long-read view with a sidebar for search, related stories, tags and a newsletter box. Use when the user asks for Online Magazine, 在线杂志, magazine, editorial, blog, news, article, sidebar, newsletter, dark-mode or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/inter-tight, @fontsource-variable/newsreader, @fontsource-variable/playfair-display, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/online-magazine"
  motif-item: "online-magazine"
  params-hash: "201b55e4"
---

# Online Magazine (在线杂志)

A multi-author online magazine: masthead and section nav, a cover story with a generated illustration next to a most-read list, story cards filtered by Culture, Science and Food, and a long-read view with a sidebar for search, related stories, tags and a newsletter box.

## When to use

- A home page plus article view for a multi-author publication: masthead, section nav, cover story with a most-read list, section-filtered story cards with pagination, and a long read with a sidebar.
- Replace COVER_STORY, POSTS, MOST_READ and the article copy with your CMS data; covers are generated SVG illustrations, so swap them for real photography with the same aspect ratios.

## Files

- `assets/online-magazine.tsx` — the component (`OnlineMagazine`); the tuned values are baked into its `defaults` object
- `assets/sections.tsx`
- `assets/parts.tsx`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-online-magazine`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/inter-tight @fontsource-variable/newsreader @fontsource-variable/playfair-display clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/online-magazine/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource-variable/newsreader';`, `@import '@fontsource-variable/newsreader/wght-italic.css';`, `@import '@fontsource-variable/playfair-display';`, `@import '@fontsource-variable/playfair-display/wght-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { OnlineMagazine } from '@/components/motif/online-magazine/online-magazine'

<OnlineMagazine />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `masthead` | The Longhand | The Longhand | ≤ 22 chars | Masthead |
| `accent` | #4a6cf7 | #4a6cf7 | color | Tags, buttons and emphasis; text uses an automatically readable shade |
| `headlineFont` | sans | sans | sans / serif / display | Headline font |
| `coverStyle` | mixed | mixed | mixed / waves / orbits / blocks | Cover illustrations |
| `dark` | true | true | boolean | Dark mode |
| `density` | comfortable | comfortable | comfortable / compact | Density |
| `columns` | 3 | 3 | 2–3 | Cards per row on wide screens |
| `showSidebar` | true | true | boolean | Article sidebar |

## Rules

- One accent color for tags, buttons, the active tab and emphasis. Accent text always goes through --accent-text, which is adjusted for contrast; use --primary only for fills.
- Cards keep the upstream rhythm: cover on top with a pill tag, title, a one-sentence dek above a hairline, then byline (initials avatar, role) and date.
- Sidebar boxes share one shape: card background, soft shadow in light mode, a bordered title row (px-8 py-4) and padded content.
- No photos, author portraits or real brand logos: generated covers, gradient initials and an invented masthead mark only. Share buttons are generic (link, email, save), not social network logos.
- Copy reads like real journalism: specific places, numbers and named sources. No lorem ipsum.
- Keep one signature moment per page; every other section stays calm.
- Replace every placeholder text and image before shipping.
- Keep the section order meaningful: promise → proof → details → action.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from NextJSTemplates/startup-nextjs).
