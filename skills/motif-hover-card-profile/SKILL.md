---
name: motif-hover-card-profile
description: "Hovering or focusing a name opens a card after a short delay with a gradient avatar, handle, bio, mutual friends and a Follow button, and it stays open while the pointer is inside; an article-preview variant is included. Made for mentions in comments, team pages and feeds. Use when the user asks for Profile Hover Card, 用户悬停名片, hover card, popover, profile, mention, avatar, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/hover-card-profile"
  motif-item: "hover-card-profile"
  params-hash: "37a8ebe2"
---

# Profile Hover Card (用户悬停名片)

Hovering or focusing a name opens a card after a short delay with a gradient avatar, handle, bio, mutual friends and a Follow button, and it stays open while the pointer is inside; an article-preview variant is included. Made for mentions in comments, team pages and feeds.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/hover-card-profile.tsx` — the component (`ProfileHoverCard`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-hover-card-profile`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/hover-card-profile/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ProfileHoverCard } from '@/components/motif/hover-card-profile/hover-card-profile'

<ProfileHoverCard />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | profile | profile | profile / preview | Card |
| `accent` | #e4e4e7 | #e4e4e7 | color | Accent |
| `showMutuals` | true | true | boolean | Mutual friends |
| `showFollow` | true | true | boolean | Follow button |
| `cardWidth` | 256 | 256 | 240–340 px (best 256–320) | Card width |
| `radius` | 6 | 6 | 0–16 px (best 4–12) | Radius |
| `side` | bottom | bottom | bottom / top | Side |
| `openDelay` | 700 | 700 | 0–1200 ms (best 300–800) | Open delay |
| `closeDelay` | 300 | 300 | 0–800 ms (best 150–400) | Close delay |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
