---
name: motif-input-phone-country
description: "A country picker with dial code sits flush against the number field; digits are grouped as you type using the selected country’s pattern and the placeholder shows the expected format. Made for sign-up, checkout and two-factor setup. Use when the user asks for Phone Number Input, 带区号的电话输入, input, phone, tel, country, form, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/input-phone-country"
  motif-item: "input-phone-country"
  params-hash: "21d46c67"
---

# Phone Number Input (带区号的电话输入)

A country picker with dial code sits flush against the number field; digits are grouped as you type using the selected country’s pattern and the placeholder shows the expected format. Made for sign-up, checkout and two-factor setup.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/input-phone-country.tsx` — the component (`InputPhoneCountry`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-input-phone-country`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/input-phone-country/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { InputPhoneCountry } from '@/components/motif/input-phone-country/input-phone-country'

<InputPhoneCountry />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `defaultCountry` | US | US | US / GB / DE / FR / CN / JP / IN / BR / AU | Default country |
| `countries` | all | all | all / americas / europe / asia | Countries |
| `pickerStyle` | chip | chip | chip / dial / code | Picker style |
| `showDialCode` | true | true | boolean | Dial code in field |
| `grouping` | true | true | boolean | Group digits |
| `size` | md | md | sm / md / lg | Size |
| `radius` | 6 | 6 | 0–16 px | Corner radius |
| `accent` | #a1a1aa | #a1a1aa | color | Country chip and focus ring |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
