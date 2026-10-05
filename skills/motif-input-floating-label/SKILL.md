---
name: motif-input-floating-label
description: "The label sits inside the empty field and lifts to the corner on focus or input while the border lights up with an accent halo. Password fields get a reveal toggle and errors unfold with a small shake. Made for sign-in, sign-up and profile forms. Use when the user asks for Floating Label Input, 浮动标签输入框, input, floating-label, form, text-field, password, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/input-floating-label"
  motif-item: "input-floating-label"
  params-hash: "b3b9a95a"
---

# Floating Label Input (浮动标签输入框)

The label sits inside the empty field and lifts to the corner on focus or input while the border lights up with an accent halo. Password fields get a reveal toggle and errors unfold with a small shake. Made for sign-in, sign-up and profile forms.

## When to use

- Use for text fields in forms where vertical space is tight and the label must stay visible after the user types.

## Files

- `assets/input-floating-label.tsx` — the component (`InputFloatingLabel`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-input-floating-label`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/input-floating-label/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { InputFloatingLabel } from '@/components/motif/input-floating-label/input-floating-label'

<InputFloatingLabel />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | outline | outline | outline / filled / underline | Variant |
| `color` | #a78bfa | #a78bfa | color | Accent |
| `radius` | 12 | 12 | 0–24 px (best 6–18) | Corner radius |
| `size` | md | md | sm / md / lg | Size |
| `spring` | visualDuration 0.3, bounce 0.15 | visualDuration 0.3, bounce 0.15 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |
| `label` | Email address | Email address | ≤ 28 chars | Label |
| `placeholder` | you@company.com | you@company.com | ≤ 28 chars | Appears once the label has floated |

## Rules

- The label prop is the visible label and the accessible name (a real <label htmlFor>). Never use the placeholder as the only label.
- Pass error to show a red state with role="alert" text; pass hint for neutral helper text. Standard input props (type, name, autoComplete, required) go straight through.
- type="password" gets a built-in show/hide button; do not add a second one.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from educlopez/smoothui).
