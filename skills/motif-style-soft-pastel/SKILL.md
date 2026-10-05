---
name: motif-style-soft-pastel
description: "A rounded, friendly style on the Catppuccin palette: pastel-tinted cards, buttons on a thick edge that presses down, a dotted-paper backdrop. Four flavors (one light, three dark) and nine accents, for habit, learning and lifestyle apps. Use when the user asks for Soft Pastel, 柔和粉彩, pastel, catppuccin, soft, rounded, friendly, cute or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/bricolage-grotesque, @fontsource-variable/fraunces, @fontsource-variable/jetbrains-mono, @fontsource-variable/manrope, @fontsource-variable/outfit, @fontsource-variable/plus-jakarta-sans, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/style-soft-pastel"
  motif-item: "style-soft-pastel"
  params-hash: "f7c9d5d8"
---

# Soft Pastel (柔和粉彩)

A rounded, friendly style on the Catppuccin palette: pastel-tinted cards, buttons on a thick edge that presses down, a dotted-paper backdrop. Four flavors (one light, three dark) and nine accents, for habit, learning and lifestyle apps.

## When to use

- Use for friendly consumer products: habit and wellness trackers, learning apps, kids and family tools, personal dashboards, indie product sites that want warmth over authority.
- Avoid for finance, security or enterprise admin surfaces where a playful tone undermines trust.

## Files

- `assets/style-soft-pastel.tsx` — the component (`StyleSoftPastel`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-style-soft-pastel`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/bricolage-grotesque @fontsource-variable/fraunces @fontsource-variable/jetbrains-mono @fontsource-variable/manrope @fontsource-variable/outfit @fontsource-variable/plus-jakarta-sans clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/style-soft-pastel/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/bricolage-grotesque';`, `@import '@fontsource-variable/plus-jakarta-sans';`, `@import '@fontsource-variable/outfit';`, `@import '@fontsource-variable/fraunces';`, `@import '@fontsource-variable/fraunces/wght-italic.css';`, `@import '@fontsource-variable/manrope';`, `@import '@fontsource-variable/jetbrains-mono';` to the global stylesheet.
4. Use it:

```tsx
import { StyleSoftPastel } from '@/components/motif/style-soft-pastel/style-soft-pastel'

<StyleSoftPastel />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `flavor` | latte | latte | latte / frappe / macchiato / mocha | Latte is light; the other three are dark |
| `accent` | mauve | mauve | mauve / pink / flamingo / peach / yellow / green / teal / blue / lavender | Accent |
| `radius` | 20 | 20 | 10–32 px (best 14–28) | Radius |
| `borderWidth` | 2 | 2 | 1–3 px (best 1.5–2.5) | Border width |
| `depth` | 0.6 | 0.6 | 0–1 (best 0.3–0.9) | Thickness of the button edge and softness of card shadows |
| `fontPairing` | bricolage | bricolage | bricolage / outfit / fraunces / manrope | Font pairing |

## Rules

- Palette is Catppuccin, nothing else. Use the named tokens (base, mantle, crust for surfaces; surface0-2 and overlay0-2 for lines; text, subtext1, subtext0 for type) and pick one accent from the 14 named colours. Never invent hex values or mix flavors on one page.
- Colour ratio: 70% base/mantle, 20% pastel tints (an accent at 16 to 22% over base), 10% saturated accent. The saturated accent is reserved for the primary button, the active tab or switch and one focal illustration.
- Cards are pastel-tinted rather than white: background is a named colour at 18% over base with a border of the same colour at 44%. Use at most three different tints in one viewport and vary them by meaning, not decoration.
- Buttons have a solid bottom edge (1px + 4px x depth) in a darker mix of their colour and no blur; hover lifts 2px, active presses the button down onto its edge. Never add a glow.
- Shapes are round: card radius 20px, controls 72% of that, chips and switches fully rounded. Borders are 2px and always visible; a card without a border looks unfinished.
- Shadows are soft and tinted with the accent mixed into crust, never neutral black. Shadow depth controls both the card shadow and the button edge thickness.
- Type: a rounded or friendly grotesk for headings at 700 weight and -0.03em tracking, a humanist sans for body. Highlight one word per headline with the marker underline (.cp-hl). Body text is subtext0, headings are text.
- Text on tinted surfaces uses the tone mixed 62% with text colour so pastel chips stay readable. Check contrast on Latte: accent text uses accent-ink, a darker mix.
- Motion is springy and short (140 to 320ms with a slight overshoot). Small celebratory moments are fine; nothing loops. Respect prefers-reduced-motion.
- Background is the base colour with a faint dot grid (overlay0 at 30%, 24px pitch). Decorative rotation of up to 3 degrees is allowed on showcase cards only, never on forms.
- Forbidden: gradients on buttons, pure black or white, neon colours, sharp 0-radius corners, drop shadows without tint, more than one saturated accent.
- Apply the tokens everywhere; do not mix in components from another style.
- Keep text contrast accessible even when the style is loud.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from catppuccin/catppuccin).
