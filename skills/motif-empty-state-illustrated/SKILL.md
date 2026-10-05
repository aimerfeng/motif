---
name: motif-empty-state-illustrated
description: "Four inline SVG illustrations: no results, empty inbox, no files yet and offline, with a title, description and primary and secondary actions. The art floats gently and follows your accent. For lists, search pages and first-run guidance. Use when the user asks for Illustrated Empty State, 插画空状态, empty state, illustration, svg, no results, inbox, offline, onboarding or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/empty-state-illustrated"
  motif-item: "empty-state-illustrated"
  params-hash: "02b77362"
---

# Illustrated Empty State (插画空状态)

Four inline SVG illustrations: no results, empty inbox, no files yet and offline, with a title, description and primary and secondary actions. The art floats gently and follows your accent. For lists, search pages and first-run guidance.

## When to use

- Use where a list, search or page can legitimately be empty. Pick the scenario that matches the reason: no results (search), caught up (inbox), first use (files), offline (connectivity).

## Files

- `assets/empty-state-illustrated.tsx` — the component (`EmptyStateIllustrated`); the tuned values are baked into its `defaults` object
- `assets/empty-state-illustrated.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-empty-state-illustrated`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/empty-state-illustrated/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { EmptyStateIllustrated } from '@/components/motif/empty-state-illustrated/empty-state-illustrated'

<EmptyStateIllustrated />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | no-results | no-results | no-results / inbox / no-files / offline | Scenario |
| `accent` | #8b5cf6 | #8b5cf6 | color | Colors the illustration highlights and the primary button |
| `size` | 220 | 220 | 120–320 px (best 160–260) | Illustration width |
| `float` | true | true | boolean | Animate |
| `title` |  |  | ≤ 48 chars | Leave empty to use the scenario’s default copy |
| `description` |  |  | ≤ 140 chars | Description |
| `actionLabel` |  |  | ≤ 24 chars | Primary action |
| `secondaryLabel` |  |  | ≤ 24 chars | Secondary action |

## Rules

- Say why it is empty and what to do next; the primary action should be the most likely next step.
- The illustration is decorative and aria-hidden; the heading is labelled by aria-labelledby, so keep the title text meaningful.
- Do not stack several empty states on one screen; show one per empty region.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.
