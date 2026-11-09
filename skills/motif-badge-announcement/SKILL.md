---
name: motif-badge-announcement
description: "The small pill above a hero headline: a flowing gradient hairline with gradient text, or a shine sweeping over muted text, plus a divider and an arrow that nudges on hover. For launch notes, new-feature links and changelog teasers. Use when the user asks for Announcement Pill, 公告胶囊, badge, announcement, pill, gradient text, shimmer, hero or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/badge-announcement"
  motif-item: "badge-announcement"
  params-hash: "89b45fb6"
---

# Announcement Pill (公告胶囊)

The small pill above a hero headline: a flowing gradient hairline with gradient text, or a shine sweeping over muted text, plus a divider and an arrow that nudges on hover. For launch notes, new-feature links and changelog teasers.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/badge-announcement.tsx` — the component (`BadgeAnnouncement`); the tuned values are baked into its `defaults` object
- `assets/badge-announcement.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-badge-announcement`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/badge-announcement/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { BadgeAnnouncement } from '@/components/motif/badge-announcement/badge-announcement'

<BadgeAnnouncement />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | gradient | gradient | gradient / shiny | Style |
| `text` | Introducing Lumen 2.0 | Introducing Lumen 2.0 | ≤ 36 chars | Text |
| `colorFrom` | #ffaa40 | #ffaa40 | color | Gradient style |
| `colorTo` | #9c40ff | #9c40ff | color | Gradient style |
| `speed` | 1 | 1 | 0.5–2 (best 0.8–1.5) | Gradient speed |
| `shimmerWidth` | 100 | 100 | 40–240 px | Shiny style |
| `radius` | 999 | 999 | 4–999 px (best 8–999) | Corner radius |
| `leadIcon` | party | party | party / sparkles / none | Lead icon |
| `arrow` | true | true | boolean | Arrow |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).
