---
name: motif-badge-status
description: "A status badge with a breathing halo: online, busy, away, offline, live, syncing. Color morphs and the label slides when the state changes, and screen readers announce it. Made for service health pages, member lists and live markers. Use when the user asks for Pulsing Status Badge, 脉冲状态徽章, badge, status, presence, pulse, live, indicator, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/badge-status"
  motif-item: "badge-status"
  params-hash: "98cf57e8"
---

# Pulsing Status Badge (脉冲状态徽章)

A status badge with a breathing halo: online, busy, away, offline, live, syncing. Color morphs and the label slides when the state changes, and screen readers announce it. Made for service health pages, member lists and live markers.

## When to use

- Use for a single, current state of an entity (service, person, stream, sync job). For counts or categories use a plain badge.

## Files

- `assets/badge-status.tsx` — the component (`BadgeStatus`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-badge-status`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/badge-status/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { BadgeStatus } from '@/components/motif/badge-status/badge-status'

<BadgeStatus />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `status` | online | online | online / busy / away / offline / live / syncing | Status |
| `variant` | soft | soft | soft / outline / solid | Variant |
| `size` | md | md | sm / md / lg | Size |
| `radius` | 999 | 999 | 4–999 px (best 6–999) | 999 gives a full pill |
| `pulse` | 1.8 | 1.8 | 0.8–3.2 s (best 1.2–2.6) | Pulse period |
| `spring` | visualDuration 0.36, bounce 0.2 | visualDuration 0.36, bounce 0.2 | visualDuration 0.05–4 s, bounce 0–0.9 | Switch spring |
| `label` |  |  | ≤ 18 chars | Leave empty for the default name |

## Rules

- Change the status prop to update the badge in place; it is role="status" with aria-live="polite", so the text change is announced. Always keep the text, never rely on the dot color alone.
- Use the label prop for domain wording ("Building", "Deploying") and keep it under two words.
- One pulsing badge per row is plenty. Use offline or away (no pulse) for inactive entities so the eye goes to the live ones.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from shadcnblocks/kibo).
