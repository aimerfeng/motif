---
name: motif-auth-magic-link
description: "An email-only sign-in card. Submitting morphs it into a check-your-inbox state: a letter slides into an envelope that seals itself, followed by the masked address, a resend countdown and a way back to change the email. Made for passwordless sign-in and waitlist confirmation. Use when the user asks for Magic Link Sign-in, 邮箱魔法链接登录, auth, sign-in, magic link, passwordless, email, login, waitlist, form or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/space-grotesk, @fontsource/instrument-serif, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/auth-magic-link"
  motif-item: "auth-magic-link"
  params-hash: "f0142dce"
---

# Magic Link Sign-in (邮箱魔法链接登录)

An email-only sign-in card. Submitting morphs it into a check-your-inbox state: a letter slides into an envelope that seals itself, followed by the masked address, a resend countdown and a way back to change the email. Made for passwordless sign-in and waitlist confirmation.

## When to use

- Use as the whole sign-in or waitlist page for passwordless email auth. Wire onSend to your auth provider (it may return a promise) and onResend to the same call.

## Files

- `assets/auth-magic-link.tsx` — the component (`AuthMagicLink`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-auth-magic-link`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/space-grotesk @fontsource/instrument-serif clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/auth-magic-link/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';`, `@import '@fontsource-variable/space-grotesk';` to the global stylesheet.
4. Use it:

```tsx
import { AuthMagicLink } from '@/components/motif/auth-magic-link/auth-magic-link'

<AuthMagicLink />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `brandName` | Kestrel | Kestrel | ≤ 24 chars | Brand name |
| `mode` | signin | signin | signin / waitlist | Purpose |
| `accent` | #5e5ce6 | #5e5ce6 | color | Accent |
| `font` | serif | serif | serif / sans / grotesk | Heading font |
| `radius` | 20 | 20 | 4–28 px (best 10–24) | Inputs and buttons follow proportionally |
| `background` | aurora | aurora | aurora / grid / plain | Backdrop |
| `showProviders` | true | true | boolean | Sign-in purpose only |
| `resendSeconds` | 30 | 30 | 15–120 s (best 20–60) | Resend cooldown |
| `spring` | visualDuration 0.5, bounce 0.18 | visualDuration 0.5, bounce 0.18 | visualDuration 0.05–4 s, bounce 0–0.9 | Morph spring |

## Rules

- onSend receives the trimmed email; throw or reject to show the inline error. Without onSend the component only simulates sending.
- The sent state masks the address (first and last letter of the local part) and starts a resend cooldown of resendSeconds; keep the cooldown at 20 seconds or more so people do not hammer the button.
- Provider buttons are generic SSO and passkey actions with neutral icons; wire them with onProvider. Never swap in real company logos without the brand guidelines that allow it.
- Keep the copy short: one heading, one sentence of explanation, one primary button. Do not add a password field to this flow.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from shadcn-ui/ui).
