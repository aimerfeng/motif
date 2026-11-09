---
name: motif-onboarding-checklist
description: "A setup card with an overall progress meter and steps that are done, in progress or pending; the active step expands with its explanation and action, and finishing it ticks it off and opens the next. For first-run dashboards in commerce and SaaS. Use when the user asks for Onboarding Checklist, 新手引导清单, dashboard, onboarding, checklist, accordion, progress, setup or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/onboarding-checklist"
  motif-item: "onboarding-checklist"
  params-hash: "b288603d"
---

# Onboarding Checklist (新手引导清单)

A setup card with an overall progress meter and steps that are done, in progress or pending; the active step expands with its explanation and action, and finishing it ticks it off and opens the next. For first-run dashboards in commerce and SaaS.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/onboarding-checklist.tsx` — the component (`OnboardingChecklist`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-onboarding-checklist`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/onboarding-checklist/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { OnboardingChecklist } from '@/components/motif/onboarding-checklist/onboarding-checklist'

<OnboardingChecklist />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `title` | Set up your store | Set up your store | ≤ 32 chars | Title |
| `accent` | #eab308 | #eab308 | color | Accent |
| `progressStyle` | bar | bar | bar / ring / segments | Progress style |
| `radius` | 10 | 10 | 0–20 px | Radius |
| `showBadges` | true | true | boolean | Show badges |
| `spring` | visualDuration 0.35, bounce 0.1 | visualDuration 0.35, bounce 0.1 | visualDuration 0.05–4 s, bounce 0–0.9 | Expand spring |
| `autoAdvance` | true | true | boolean | Open next on finish |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from keenthemes/reui).
