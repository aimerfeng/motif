---
name: motif-style-industrial
description: "A workshop interface: graphite steel panels with corner rivets, yellow-and-black hazard stripes, stencil-style uppercase labels, punched tag badges and blur-free 2px hard shadows. For construction, logistics, tools and manufacturing. Use when the user asks for Industrial, 工业重型, industrial, hazard stripes, steel, construction, logistics, utilitarian, tokens or a similar effect. Includes the parameters tuned on Motif."
license: Apache-2.0
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/ibm-plex-sans, @fontsource-variable/space-grotesk, @fontsource/archivo-black, @fontsource/ibm-plex-mono, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/style-industrial"
  motif-item: "style-industrial"
  params-hash: "93945803"
---

# Industrial (工业重型)

A workshop interface: graphite steel panels with corner rivets, yellow-and-black hazard stripes, stencil-style uppercase labels, punched tag badges and blur-free 2px hard shadows. For construction, logistics, tools and manufacturing.

## When to use

- Use for construction, heavy haulage and logistics, manufacturing, tools and hardware, fleet and field-operations dashboards, maker spaces and anything that should feel like equipment rather than software.
- Avoid for wellness, luxury, fashion or calm editorial products; the hazard colour and hard shadows are deliberately loud.

## Files

- `assets/style-industrial.tsx` — the component (`StyleIndustrial`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-style-industrial`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/ibm-plex-sans @fontsource-variable/space-grotesk @fontsource/archivo-black @fontsource/ibm-plex-mono clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/style-industrial/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource/archivo-black/400.css';`, `@import '@fontsource-variable/space-grotesk';`, `@import '@fontsource-variable/ibm-plex-sans';`, `@import '@fontsource/ibm-plex-mono/400.css';`, `@import '@fontsource/ibm-plex-mono/500.css';`, `@import '@fontsource/ibm-plex-mono/700.css';` to the global stylesheet.
4. Use it:

```tsx
import { StyleIndustrial } from '@/components/motif/style-industrial/style-industrial'

<StyleIndustrial />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `hazardColor` | #f7b500 | #f7b500 | color | Stripes, primary button and tags; text on it switches between ink and white by luminance |
| `steelTone` | light | light | light / dark | Steel tone |
| `stripeAngle` | 45 | 45 | 30–60 deg (best 35–55) | Stripe angle |
| `stripeWidth` | 14 | 14 | 8–24 px (best 10–20) | Width of each band on hazard strips; small controls use a scaled-down version |
| `rivets` | true | true | boolean | Panel rivets |
| `radius` | 6 | 6 | 0–12 px (best 0–8) | Panels use this; buttons and inputs use 60% of it |
| `displayFont` | archivo | archivo | archivo / grotesk / plex | Display font |
| `shadowOffset` | 2 | 2 | 0–6 px (best 1–4) | Offset of the zero-blur drop; pressing a button collapses it |

## Rules

- Base tokens come from the tweakcn Graphite preset: light background #f0f0f0, card #f5f5f5, foreground #333333, primary #606060, secondary #e0e0e0, muted text #666666, border #d0d0d0, destructive #cc3333, chart teal #476666; dark background #1a1a1a, card #202020, foreground #d9d9d9, primary #a0a0a0. Keep the steel neutrals; only the hazard colour may change.
- Colour ratio: about 85% graphite steel, 8% hazard colour, 5% ink (#1a1a1a), 2% semantic (teal for OK, #cc3333 for alarms). Use exactly one hazard colour per product.
- The hazard colour is a fill, never a text colour on steel. Text on the hazard colour is ink or white, chosen by luminance. Hazard stripes are the hazard colour alternating with that same ink at one shared angle and width token.
- Stripes mark edges and states only: page or section bands, the left edge of alerts, the fill of an active meter, the track of an enabled switch. Never put stripes behind text and never use them as a page background.
- Panels are steel plates: a 1px mid-steel edge (#909090 light, #585858 dark), a faint top sheen and brushed grain, and a hard offset shadow with zero blur in hsl(0 0% 20%) (black in dark mode). Rivets sit at the four corners of panels only, not on buttons, inputs or tags.
- Every raised control has the same hard shadow, offset on both axes by one token (2px by default). Pressing a button translates it by the offset and collapses the shadow to zero; there are no soft or blurred shadows anywhere.
- Type: Archivo Black (or a heavy grotesk) in uppercase for display and button labels; IBM Plex Sans for body copy; IBM Plex Mono at 700 weight, uppercase, 0.12em to 0.16em tracking for labels, codes, units and values. Numbers are always mono with tabular figures.
- Tags are luggage-style badges: chamfered left corners, a punched hole with an eyelet ring, mono uppercase text and the hard drop shadow.
- Shape: one small radius token (0 to 8px) for panels; controls use 60% of it. No pills, no circles except rivets, eyelets and status lamps.
- Motion is mechanical: 90 to 150ms ease-out press and toggle, and a slow conveyor movement on active striped meters. Nothing bounces. Under prefers-reduced-motion the conveyor stops and transitions are removed.
- Forbidden: blurred shadows, glows, glass, pastel colours, gradients other than the steel sheen, more than one hazard colour, real safety-sign pictograms or real equipment brands and logos.
- Apply the tokens everywhere; do not mix in components from another style.
- Keep text contrast accessible even when the style is loud.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: Apache-2.0. Keep the header comments in each file (originally from jnsahaj/tweakcn).
