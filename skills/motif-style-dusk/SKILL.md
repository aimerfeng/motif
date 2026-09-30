---
name: motif-style-dusk
description: "A minimal style on the Rosé Pine palette: hairlines instead of shadows, one italic accent word in a serif headline, a faint dusk glow at the top of the page. Three variants (Main, Moon, Dawn), for writing, reading, notes and personal sites. Use when the user asks for Dusk, 暮色, rose pine, minimal, serif, dark, hairline, calm or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/geist-mono, @fontsource-variable/ibm-plex-sans, @fontsource-variable/inter-tight, @fontsource-variable/newsreader, @fontsource/ibm-plex-mono, @fontsource/instrument-serif, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/style-dusk"
  motif-item: "style-dusk"
  params-hash: "3fe24c33"
---

# Dusk (暮色)

A minimal style on the Rosé Pine palette: hairlines instead of shadows, one italic accent word in a serif headline, a faint dusk glow at the top of the page. Three variants (Main, Moon, Dawn), for writing, reading, notes and personal sites.

## When to use

- Use for writing tools, reading apps, note-taking, journals, portfolios and documentation that should feel calm and literate.
- Avoid for high-energy marketing pages or dense data dashboards; the restraint that makes it elegant costs it visual punch.

## Files

- `assets/style-dusk.tsx` — the component (`StyleDusk`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource-variable/ibm-plex-sans @fontsource-variable/inter-tight @fontsource-variable/newsreader @fontsource/ibm-plex-mono @fontsource/instrument-serif clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/style-dusk/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/newsreader';`, `@import '@fontsource-variable/newsreader/wght-italic.css';`, `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';`, `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/geist-mono';`, `@import '@fontsource-variable/ibm-plex-sans';`, `@import '@fontsource/ibm-plex-mono/400.css';`, `@import '@fontsource/ibm-plex-mono/500.css';`, `@import '@fontsource/ibm-plex-mono/700.css';` to the global stylesheet.
4. Use it:

```tsx
import { StyleDusk } from '@/components/motif/style-dusk/style-dusk'

<StyleDusk />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | main | main | main / moon / dawn | Main and Moon are dark; Dawn is light |
| `accent` | iris | iris | iris / rose / foam / gold / pine / love | Accent |
| `radius` | 10 | 10 | 0–20 px (best 4–14) | Radius |
| `borderWidth` | 1 | 1 | 0.5–2 px (best 1–1.5) | Line weight |
| `depth` | 0.35 | 0.35 | 0–1 (best 0.2–0.7) | Only affects raised cards; ordinary cards never cast one |
| `fontPairing` | serif | serif | serif / instrument / sans / plex | Font pairing |

## Rules

- Palette is Rosé Pine (Main, Moon or Dawn), used through named tokens: base for the page, surface for cards, overlay for raised or inset elements, highlight-med for hairlines, muted/subtle/text for type. Never invent colours.
- Colour ratio: 90% base/surface/text, 8% one accent, 2% semantic (foam success, gold warning, love danger). Use one accent per page; iris is the default.
- Depth comes from lines, not shadows. Cards are a surface fill with a 1px highlight-med border. Only one raised element per viewport (a popover, an editor mock) may use the soft shadow, and it must also switch to overlay fill and highlight-high border.
- Radius is small and constant (10px for controls, 15px for cards). Never pill-shaped except badges and switches.
- Type: a text serif (Newsreader or Instrument Serif) at regular 400 weight for headings with -0.02em tracking; a neutral sans at 15px for UI; mono at 12px uppercase with 0.12em tracking for labels and numbers. Put one italic accent-coloured word in a hero headline, and nowhere else.
- Spacing is generous: 64px+ between sections, hairline rules (1px highlight-med) to separate them instead of coloured bands, a narrow reading measure (max 34rem for paragraphs).
- Buttons: one filled accent button per view (text in base colour, weight 600); secondary buttons are overlay fill with a highlight-high border; tertiary are ghost or underlined links. No gradients, no glow.
- Badges are hairline pills with a single 6px coloured dot; only the dot carries colour. Alerts have a 2px coloured bar on the left edge and outline icons at 1.8px stroke.
- The dusk glow at the top of the page is one radial gradient of the accent at 24% alpha plus a faint rose bloom at the top right. Do not add more gradients elsewhere.
- Motion is minimal and quiet: 180 to 340ms eases, the tab underline glides, switches slide. No bounce, no parallax, no autoplay. Respect prefers-reduced-motion.
- Forbidden: drop shadows on regular cards, saturated fills, gradients on controls, uppercase body text, emoji, more than one italic word per headline.
- Apply the tokens everywhere; do not mix in components from another style.
- Keep text contrast accessible even when the style is loud.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from rose-pine/rose-pine-theme).
