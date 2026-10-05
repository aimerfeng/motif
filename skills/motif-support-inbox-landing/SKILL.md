---
name: motif-support-inbox-landing
description: "A light, rounded product site: a floating pill navbar, a hero where a flowing shader gradient holds a three-pane inbox, then alternating features, a review wall, an accent stats band and pricing. Use when the user asks for Shared Inbox Landing, 共享收件箱产品页, product, saas, landing, light, shader, pricing, testimonials or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/fraunces, @fontsource-variable/ibm-plex-sans, @fontsource-variable/manrope, @fontsource-variable/outfit, @fontsource-variable/plus-jakarta-sans, @fontsource/ibm-plex-mono, @paper-design/shaders-react, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/support-inbox-landing"
  motif-item: "support-inbox-landing"
  params-hash: "90da953e"
---

# Shared Inbox Landing (共享收件箱产品页)

A light, rounded product site: a floating pill navbar, a hero where a flowing shader gradient holds a three-pane inbox, then alternating features, a review wall, an accent stats band and pricing.

## When to use

- A product marketing site for a collaborative, workflow-style SaaS (help desk, CRM, scheduling, docs). Friendly, light and rounded rather than technical.
- Works best when you can show the core screen in the hero. Replace the inbox mockup with your own product UI built in JSX or SVG.

## Files

- `assets/support-inbox-landing.tsx` — the component (`SupportInboxLanding`); the tuned values are baked into its `defaults` object
- `assets/sections.tsx`
- `assets/mockups.tsx`
- `assets/parts.tsx`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-support-inbox-landing`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/fraunces @fontsource-variable/ibm-plex-sans @fontsource-variable/manrope @fontsource-variable/outfit @fontsource-variable/plus-jakarta-sans @fontsource/ibm-plex-mono @paper-design/shaders-react clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/support-inbox-landing/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/plus-jakarta-sans';`, `@import '@fontsource-variable/manrope';`, `@import '@fontsource-variable/fraunces';`, `@import '@fontsource-variable/fraunces/wght-italic.css';`, `@import '@fontsource-variable/outfit';`, `@import '@fontsource-variable/ibm-plex-sans';`, `@import '@fontsource/ibm-plex-mono/400.css';`, `@import '@fontsource/ibm-plex-mono/500.css';`, `@import '@fontsource/ibm-plex-mono/700.css';` to the global stylesheet.
4. Use it:

```tsx
import { SupportInboxLanding } from '@/components/motif/support-inbox-landing/support-inbox-landing'

<SupportInboxLanding />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `brandName` | Harbor | Harbor | ≤ 18 chars | Brand name |
| `accent` | #0d9488 | #0d9488 | color | Accent color |
| `fontPair` | jakarta | jakarta | jakarta / manrope / fraunces / outfit | Font pairing |
| `radius` | 12 | 12 | 4–20 px (best 8–16) | Corner radius |
| `dark` | false | false | boolean | Dark mode |
| `headline` | Support that feels like one conversation, not forty tickets | Support that feels like one conversation, not forty tickets | ≤ 90 chars | Best under 60 characters |
| `subhead` | Email, chat and web forms land in a single shared inbox. Everyone sees who is replying, and customers never have to repeat themselves. | Email, chat and web forms land in a single shared inbox. Everyone sees who is replying, and customers never have to repeat themselves. | ≤ 200 chars | Hero sub-headline |

## Rules

- Keep the section order: floating navbar, hero with shader panel and product UI, partners, two alternating feature rows, steps, testimonials, accent stats band, pricing, FAQ, CTA, footer.
- The mesh-gradient panel behind the hero mockup is derived from the accent color. Do not hard-code its colors; change the accent instead.
- Use the accent color for one solid band (stats), primary buttons and small marks. Keep everything else on tinted neutrals so pages with any accent stay calm.
- Rounded pill controls (buttons, nav, toggles) and large radius cards are part of the voice. Keep the radius param between 8 and 16.
- Copy is plain and specific: invented but believable customer names, numbers with units, no exclamation marks or superlatives.
- No photos or logos of real companies: people are gradient initials, partners are invented SVG wordmarks, screens are JSX.
- Keep one signature moment per page; every other section stays calm.
- Replace every placeholder text and image before shipping.
- Keep the section order meaningful: promise → proof → details → action.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- WebGL: device pixel ratio is capped at 1.5; rendering pauses when offscreen or in a hidden tab. Keep both.
- License: MIT. Keep the header comments in each file (originally from gonzalochale/saas-landing-template).
