---
name: motif-input-password-strength
description: "A password field with a reveal toggle, a strength meter that fills and shifts from red through amber to green, and a live checklist of rules that tick off as you type. Made for sign-up, password reset and account security forms. Use when the user asks for Password Strength Field, 密码强度输入框, input, password, strength, form, checklist, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/input-password-strength"
  motif-item: "input-password-strength"
  params-hash: "8dbe807a"
---

# Password Strength Field (密码强度输入框)

A password field with a reveal toggle, a strength meter that fills and shifts from red through amber to green, and a live checklist of rules that tick off as you type. Made for sign-up, password reset and account security forms.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/input-password-strength.tsx` — the component (`InputPasswordStrength`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-input-password-strength`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/input-password-strength/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { InputPasswordStrength } from '@/components/motif/input-password-strength/input-password-strength'

<InputPasswordStrength />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `meterStyle` | bar | bar | bar / segments | Meter style |
| `segments` | 4 | 4 | 3–6 | Segmented style only |
| `minLength` | 8 | 8 | 6–16 | Minimum length |
| `requireSymbol` | false | false | boolean | Require a symbol |
| `showChecklist` | true | true | boolean | Checklist |
| `weakColor` | #ef4444 | #ef4444 | color | Weak color |
| `strongColor` | #10b981 | #10b981 | color | Strong color |
| `radius` | 6 | 6 | 0–16 px | Corner radius |

## Rules

- The meter is a hint, not validation: still enforce the same rules on the server.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
