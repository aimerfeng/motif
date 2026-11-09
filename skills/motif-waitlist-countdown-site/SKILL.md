---
name: motif-waitlist-countdown-site
description: "A coming-soon page for a sunrise lamp that is not out yet: an SVG lamp whose face glows from night purple to morning gold, a live countdown to launch day, a waitlist form that answers with your place in line and a referral link, a build-log timeline and an FAQ. For hardware, apps or books before launch. Use when the user asks for Pre-Launch Waitlist, 预发布候补页, pre-launch, coming soon, waitlist, countdown, referral, timeline, faq, hardware or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/bricolage-grotesque, @fontsource-variable/fraunces, @fontsource-variable/geist, @fontsource-variable/ibm-plex-sans, @fontsource-variable/inter-tight, @fontsource-variable/manrope, @fontsource/instrument-serif, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/waitlist-countdown-site"
  motif-item: "waitlist-countdown-site"
  params-hash: "6a137b85"
---

# Pre-Launch Waitlist (预发布候补页)

A coming-soon page for a sunrise lamp that is not out yet: an SVG lamp whose face glows from night purple to morning gold, a live countdown to launch day, a waitlist form that answers with your place in line and a referral link, a build-log timeline and an FAQ. For hardware, apps or books before launch.

## When to use

- A coming-soon page for a product that is not on sale yet (hardware, an app, a book) whose only goal is to collect an email address.
- Keep the upstream order: promise, countdown, form, then the sections that earn the signup (what is coming, build log, facts, FAQ) and a final call to action back to the form.

## Files

- `assets/waitlist-countdown-site.tsx` — the component (`WaitlistCountdownSite`); the tuned values are baked into its `defaults` object
- `assets/sections.tsx`
- `assets/waitlist-form.tsx`
- `assets/lamp.tsx`
- `assets/parts.tsx`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-waitlist-countdown-site`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/bricolage-grotesque @fontsource-variable/fraunces @fontsource-variable/geist @fontsource-variable/ibm-plex-sans @fontsource-variable/inter-tight @fontsource-variable/manrope @fontsource/instrument-serif clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/waitlist-countdown-site/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource-variable/manrope';`, `@import '@fontsource-variable/fraunces';`, `@import '@fontsource-variable/fraunces/wght-italic.css';`, `@import '@fontsource-variable/bricolage-grotesque';`, `@import '@fontsource-variable/ibm-plex-sans';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';`, `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { WaitlistCountdownSite } from '@/components/motif/waitlist-countdown-site/waitlist-countdown-site'

<WaitlistCountdownSite />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `brandName` | Aubade | Aubade | ≤ 20 chars | Brand name |
| `headline` | A lamp that wakes you with sunrise, not a siren | A lamp that wakes you with sunrise, not a siren | ≤ 80 chars | Best under 60 characters |
| `accent` | #fb923c | #fb923c | color | Accent color |
| `launchInDays` | 38 | 38 | 1–180 (best 7–120) | For the preview only; pass a real launchAt date to the component in production |
| `dawnCycleSpeed` | 1 | 1 | 0.25–3 x (best 0.5–2) | 1 runs night → morning → night in 10 seconds |
| `fontPairing` | inter | inter | inter / fraunces / bricolage / serif | Font pairing |
| `dark` | true | true | boolean | Dark mode |
| `showReferral` | true | true | boolean | After signing up, show a link that moves you 25 places up per friend |
| `radius` | 8 | 8 | 0–20 px (best 4–14) | Corner radius |

## Rules

- Pass a real launchAt (ISO 8601 with a time zone) in production. launchInDays only places the preview date relative to page load, which would reset on every visit; a countdown that resets destroys trust.
- The waitlist form only changes local state and derives the queue number and referral link from the email. Wire it to your email tool and return the real position before shipping.
- The form asks for one field plus consent. Put anything else (name, country, base finish) in the invitation email, not here.
- The lamp illustration keeps its own night-to-morning palette in every theme; the accent is used for buttons, taglines and the build-log markers only. Accent text uses var(--accent-ink), adjusted until it is readable.
- Only state facts you can stand behind before launch: no testimonials, no invented press logos, no "sold out" claims.
- Keep one signature moment per page; every other section stays calm.
- Replace every placeholder text and image before shipping.
- Keep the section order meaningful: promise → proof → details → action.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from arthelokyo/astrowind).
