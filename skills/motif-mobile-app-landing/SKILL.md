---
name: motif-mobile-app-landing
description: "A dark mobile-app site: three phones drawn in JSX float in front of track lines, followed by a bento of features, a four-screen gallery, ratings and reviews, pricing and FAQ. No store badges, no screenshots. Use when the user asks for Mobile App Landing, 手机 App 落地页, app, mobile, landing, dark, phone mockup, pricing, reviews or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/bricolage-grotesque, @fontsource-variable/geist, @fontsource-variable/geist-mono, @fontsource-variable/ibm-plex-sans, @fontsource-variable/inter-tight, @fontsource-variable/jetbrains-mono, @fontsource-variable/manrope, @fontsource-variable/space-grotesk, @fontsource-variable/syne, @fontsource/archivo-black, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/mobile-app-landing"
  motif-item: "mobile-app-landing"
  params-hash: "eb974168"
---

# Mobile App Landing (手机 App 落地页)

A dark mobile-app site: three phones drawn in JSX float in front of track lines, followed by a bento of features, a four-screen gallery, ratings and reviews, pricing and FAQ. No store badges, no screenshots.

## When to use

- A marketing page for a consumer mobile app (fitness, habits, finance, notes). Phone mockups carry the whole story, so the app needs two or three screens worth showing.
- Replace the running screens in phones.tsx with your own screens drawn in JSX. Keep each one to a single idea: a headline number, a list or a chart.

## Files

- `assets/mobile-app-landing.tsx` — the component (`MobileAppLanding`); the tuned values are baked into its `defaults` object
- `assets/sections.tsx`
- `assets/phones.tsx`
- `assets/parts.tsx`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install @fontsource-variable/bricolage-grotesque @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource-variable/ibm-plex-sans @fontsource-variable/inter-tight @fontsource-variable/jetbrains-mono @fontsource-variable/manrope @fontsource-variable/space-grotesk @fontsource-variable/syne @fontsource/archivo-black clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/mobile-app-landing/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource/archivo-black/400.css';`, `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource-variable/space-grotesk';`, `@import '@fontsource-variable/ibm-plex-sans';`, `@import '@fontsource-variable/bricolage-grotesque';`, `@import '@fontsource-variable/manrope';`, `@import '@fontsource-variable/syne';`, `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/geist-mono';`, `@import '@fontsource-variable/jetbrains-mono';` to the global stylesheet.
4. Use it:

```tsx
import { MobileAppLanding } from '@/components/motif/mobile-app-landing/mobile-app-landing'

<MobileAppLanding />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `brandName` | Cadence | Cadence | ≤ 16 chars | Brand name |
| `accent` | #ff6a3d | #ff6a3d | color | Accent color |
| `fontPair` | archivo | archivo | archivo / grotesk / bricolage / syne | Font pairing |
| `radius` | 12 | 12 | 4–20 px (best 8–16) | Corner radius |
| `dark` | true | true | boolean | Dark mode |
| `headline` | A running plan that changes when you do | A running plan that changes when you do | ≤ 80 chars | Best under 50 characters |
| `subhead` | Cadence adjusts every session to your sleep, your legs and your calendar, so you can train for a race without a spreadsheet. | Cadence adjusts every session to your sleep, your legs and your calendar, so you can train for a race without a spreadsheet. | ≤ 200 chars | Hero sub-headline |

## Rules

- Never add store badges, store logos or fetched store data. Download buttons are ordinary buttons with a generic phone icon and plain text.
- Phone screens always use a dark UI regardless of the page mode, so they read as real device screenshots in both light and dark pages. Only the accent color changes.
- Keep the section order: header, hero with phones and app info, stats, bento features, screen gallery, ratings and reviews, pricing, FAQ, CTA, footer.
- The accent drives primary buttons, progress rings, route lines and the full-bleed CTA block. Everything else is warm neutral.
- Reviews are written like real store reviews: a specific title, first-person detail, one or two four-star reviews with honest complaints. Do not use invented celebrity names or real handles.
- Copy is short and physical (kilometres, minutes, weeks). Avoid "revolutionary", "unlock" and exclamation marks.
- Keep one signature moment per page; every other section stays calm.
- Replace every placeholder text and image before shipping.
- Keep the section order meaningful: promise → proof → details → action.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from bohd4nx/app-landing).
