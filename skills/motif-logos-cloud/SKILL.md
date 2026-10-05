---
name: motif-logos-cloud
description: "Eight invented brand wordmarks, each set in its own typeface with a simple geometric glyph, as a seamless scrolling strip or a hairline-divided grid. A trust strip for under the hero. Use when the user asks for Logo Cloud, 客户 Logo 墙, logos, logo cloud, trusted by, wordmarks, marquee, social proof or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/bricolage-grotesque, @fontsource-variable/fraunces, @fontsource-variable/geist, @fontsource-variable/jetbrains-mono, @fontsource-variable/space-grotesk, @fontsource-variable/syne, @fontsource/archivo-black, @fontsource/dm-serif-display, @fontsource/instrument-serif, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/logos-cloud"
  motif-item: "logos-cloud"
  params-hash: "c1886853"
---

# Logo Cloud (客户 Logo 墙)

Eight invented brand wordmarks, each set in its own typeface with a simple geometric glyph, as a seamless scrolling strip or a hairline-divided grid. A trust strip for under the hero.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/logos-cloud.tsx` — the component (`LogosCloud`); the tuned values are baked into its `defaults` object
- `assets/logos-cloud.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-logos-cloud`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/bricolage-grotesque @fontsource-variable/fraunces @fontsource-variable/geist @fontsource-variable/jetbrains-mono @fontsource-variable/space-grotesk @fontsource-variable/syne @fontsource/archivo-black @fontsource/dm-serif-display @fontsource/instrument-serif clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/logos-cloud/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/syne';`, `@import '@fontsource/archivo-black/400.css';`, `@import '@fontsource/dm-serif-display/400.css';`, `@import '@fontsource/dm-serif-display/400-italic.css';`, `@import '@fontsource-variable/fraunces';`, `@import '@fontsource-variable/fraunces/wght-italic.css';`, `@import '@fontsource-variable/jetbrains-mono';`, `@import '@fontsource-variable/bricolage-grotesque';`, `@import '@fontsource-variable/space-grotesk';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { LogosCloud } from '@/components/motif/logos-cloud/logos-cloud'

<LogosCloud />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `heading` | Trusted by product teams who ship every week | Trusted by product teams who ship every week | ≤ 80 chars | Lead line |
| `count` | 1,200+ | 1,200+ | ≤ 10 chars | Count |
| `accent` | #8b7bff | #8b7bff | color | Accent color |
| `colorGlyphs` | false | false | boolean | Accent-colored glyphs |
| `tone` | dark | dark | dark / light | Tone |
| `layout` | marquee | marquee | marquee / grid | Layout |
| `duration` | 36 | 36 | 12–90 s (best 20–60) | Loop duration |
| `pauseOnHover` | true | true | boolean | Pause on hover |

## Rules

- Never use real company logos or trademarks. The wordmarks here are invented; to show real customers, replace them with logos you have written permission to display.
- Keep logos monochrome (current text color) so no single brand dominates; use the accent glyph option sparingly.
- Use six to ten marks at similar visual weight and keep the section quiet: it supports the hero, it does not compete with it.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from karthikmudunuri/eldoraui).
