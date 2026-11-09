---
name: motif-checkbox-conditional-reveal
description: "Choosing a checkbox or radio option smoothly expands a follow-up field beneath it and moves focus there; deselecting collapses and disables it again. Made for \"Other, please specify\", gift notes and different billing addresses. Use when the user asks for Reveal-on-Select Field, 勾选后展开的追加字段, checkbox, radio, conditional, reveal, expand, form, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/checkbox-conditional-reveal"
  motif-item: "checkbox-conditional-reveal"
  params-hash: "0bf31419"
---

# Reveal-on-Select Field (勾选后展开的追加字段)

Choosing a checkbox or radio option smoothly expands a follow-up field beneath it and moves focus there; deselecting collapses and disables it again. Made for "Other, please specify", gift notes and different billing addresses.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/checkbox-conditional-reveal.tsx` — the component (`RevealField`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-checkbox-conditional-reveal`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/checkbox-conditional-reveal/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { RevealField } from '@/components/motif/checkbox-conditional-reveal/checkbox-conditional-reveal'

<RevealField />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `control` | checkbox | checkbox | checkbox / radio | Control |
| `fieldType` | text | text | text / textarea | Follow-up field |
| `duration` | 150 | 150 | 100–500 ms (best 120–300) | Expand duration |
| `autoFocus` | true | true | boolean | Focus on reveal |
| `showDescription` | true | true | boolean | Show description |
| `radius` | 6 | 6 | 0–14 px | Field radius |
| `accent` | #e4e4e7 | #e4e4e7 | color | Checked fill and focus ring; the check mark picks white or near-black by contrast |

## Rules

- The follow-up field is disabled while collapsed, so it is skipped by Tab and not submitted; read its value only when checked is true.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
