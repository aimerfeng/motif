---
name: motif-input-otp
description: "Digits pop into a row of slots with a blinking caret; wrong codes shake red and correct ones hop green in sequence. Paste and SMS autofill just work. Made for two-step sign-in and email confirmation. Use when the user asks for OTP Input, 验证码输入, otp, verification, code, sign-in, input, a11y, autofill or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/input-otp"
  motif-item: "input-otp"
  params-hash: "494e1006"
---

# OTP Input (验证码输入)

Digits pop into a row of slots with a blinking caret; wrong codes shake red and correct ones hop green in sequence. Paste and SMS autofill just work. Made for two-step sign-in and email confirmation.

## When to use

- Use for one-time codes: 2FA, email or SMS confirmation, PIN entry.

## Files

- `assets/input-otp.tsx` — the component (`InputOtp`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-input-otp`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/input-otp/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { InputOtp } from '@/components/motif/input-otp/input-otp'

<InputOtp />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `length` | 6 | 6 | 4–8 (best 4–6) | Length |
| `variant` | boxes | boxes | boxes / underline | Variant |
| `color` | #818cf8 | #818cf8 | color | Accent |
| `radius` | 12 | 12 | 0–26 px (best 6–20) | Corner radius |
| `size` | 52 | 52 | 36–64 px (best 42–60) | Slot size |
| `separator` | true | true | boolean | Even lengths, boxes only |
| `spring` | visualDuration 0.28, bounce 0.35 | visualDuration 0.28, bounce 0.35 | visualDuration 0.05–4 s, bounce 0–0.9 | Pop-in spring |

## Rules

- Drive feedback through the status prop (idle, error, success); the component only animates it. Validate in onComplete and set the status yourself.
- One real input sits under the slots, so keep autoComplete="one-time-code" and do not replace it with separate inputs. Set charset="alphanumeric" for letter codes.
- Always provide a visible heading and a label prop for screen readers ("Verification code").
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from guilhermerodz/input-otp).
