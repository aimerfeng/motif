---
name: motif-input-search-generate
description: "A pill field whose icon button flips it between search and image-generate modes; the placeholder letters blur in one by one and generate mode gets a tinted ring. For AI search bars and asset libraries. Use when the user asks for Search / Generate Field, 搜索生成切换框, search, ai, generate, input, placeholder, morph or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/input-search-generate"
  motif-item: "input-search-generate"
  params-hash: "be118d4a"
---

# Search / Generate Field (搜索生成切换框)

A pill field whose icon button flips it between search and image-generate modes; the placeholder letters blur in one by one and generate mode gets a tinted ring. For AI search bars and asset libraries.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/input-search-generate.tsx` — the component (`InputSearchGenerate`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-input-search-generate`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/input-search-generate/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { InputSearchGenerate } from '@/components/motif/input-search-generate/input-search-generate'

<InputSearchGenerate />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `mode` | search | search | search / generate | Initial mode |
| `searchPlaceholder` | Search anything... | Search anything... | ≤ 32 chars | Search placeholder |
| `generatePlaceholder` | Generate Image | Generate Image | ≤ 32 chars | Generate placeholder |
| `flipStagger` | 0.02 | 0.02 | 0–0.06 s (best 0.01–0.04) | Letter stagger |
| `accent` | #a855f7 | #a855f7 | color | Generate accent |
| `radius` | 999 | 999 | 8–999 px (best 12–999) | Corner radius |
| `width` | 384 | 384 | 280–560 px | Max width |
| `spring` | visualDuration 0.25, bounce 0 | visualDuration 0.25, bounce 0 | visualDuration 0.05–4 s, bounce 0–0.9 | Icon spring |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from iurvish/uselayouts).
