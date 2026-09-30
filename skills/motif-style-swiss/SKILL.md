---
name: motif-style-swiss
description: "A strict twelve-column grid, the Radix twelve-step grey scale and one accent, flush-left tight grotesk headlines, sections divided by rules instead of colour blocks, no shadows and no gradients. Optional column overlay. For studios, institutions, publications, documentation and anything that wants clarity and order. Use when the user asks for Swiss, 瑞士国际主义, swiss, international style, grid, grotesk, minimal, typographic, radix colors or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/geist-mono, @fontsource-variable/ibm-plex-sans, @fontsource-variable/inter-tight, @fontsource-variable/space-grotesk, @fontsource/ibm-plex-mono, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/style-swiss"
  motif-item: "style-swiss"
  params-hash: "94962fd4"
---

# Swiss (瑞士国际主义)

A strict twelve-column grid, the Radix twelve-step grey scale and one accent, flush-left tight grotesk headlines, sections divided by rules instead of colour blocks, no shadows and no gradients. Optional column overlay. For studios, institutions, publications, documentation and anything that wants clarity and order.

## When to use

- Use for design studios and portfolios, research and cultural institutions, publications, documentation, dashboards that value density and order, and any brand that wants to feel rigorous.
- Avoid for playful or emotional products; the style is deliberately impersonal.

## Files

- `assets/style-swiss.tsx` — the component (`StyleSwiss`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource-variable/ibm-plex-sans @fontsource-variable/inter-tight @fontsource-variable/space-grotesk @fontsource/ibm-plex-mono clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/style-swiss/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/space-grotesk';`, `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/geist-mono';`, `@import '@fontsource-variable/ibm-plex-sans';`, `@import '@fontsource/ibm-plex-mono/400.css';`, `@import '@fontsource/ibm-plex-mono/500.css';`, `@import '@fontsource/ibm-plex-mono/700.css';` to the global stylesheet.
4. Use it:

```tsx
import { StyleSwiss } from '@/components/motif/style-swiss/style-swiss'

<StyleSwiss />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #e5484d | #e5484d | color | The only colour on the page |
| `radius` | 0 | 0 | 0–6 px (best 0–4) | Radius |
| `borderWidth` | 1 | 1 | 1–2 px (best 1–2) | Thick rules are three times this |
| `showGrid` | true | true | boolean | Overlay the 12 columns to check alignment |
| `fontPairing` | grotesk | grotesk | grotesk / neutral / geist / plex | Font pairing |
| `dark` | false | false | boolean | Dark |

## Rules

- Everything sits on a twelve-column grid inside a 1200px container with 24px gutters and margins (12px and 16px under 640px). Every block spans whole columns; use the column overlay to check. Text starts on a column edge, never floats between columns.
- Palette is the Radix gray scale (steps 1 to 12, light or dark) plus exactly one accent colour. Step 1 is the page, 3 is a filled panel, 6 is a soft rule, 11 is muted text, 12 is text, rules and the primary button. The accent appears at most once or twice per screen: a link, a primary action, one shape.
- Structure comes from rules, not boxes. Every section opens with a thick rule (3x the rule weight) in step 12, with a numbered mono label "(02) Colour" in columns 1 to 3 and the title in columns 4 to 12. Rows inside a section are separated by 1px soft rules.
- Type: one grotesk family. Display at 600 weight, -0.045em tracking, line height 0.92, flush left, ragged right, sized big (hero 96 to 134px). Headings 600, -0.035em. Body 15 to 18px at line height 1.4 to 1.5, muted step 11 for secondary copy. Labels in mono, 11px, uppercase, +6% tracking. Sizes follow a scale (11, 15, 18, 28, 48, 96) and skip nothing arbitrary.
- Asymmetry is the composition: text in the right nine columns, labels in the left three; a large flat geometric shape (a circle or a square) in accent colour is the only illustration. No photography effects, no icons beyond arrows.
- No shadows, no gradients, no blur, no rounded pills. Radius is 0 (up to 4px at most). Depth is expressed with fills of gray step 3 or a solid step 12 panel.
- Buttons are rectangles: step 12 fill with step 1 text, the label left and an arrow right; hover switches the fill to the accent. The single most important button per view uses the accent fill and turns black on hover. Text links are underlined by a 1px rule and turn accent on hover.
- Inputs are step 3 fills with only a bottom rule; on focus the rule turns accent and doubles in weight. Tabs are plain text with a thick accent underline that slides.
- Motion is minimal and mechanical: 160 to 220ms with ease-in-out, only colour, background and the tab underline move. No bounce, no fades on scroll. Respect prefers-reduced-motion.
- Forbidden: more than one accent colour, coloured status backgrounds (use solid, outline or accent badges), box shadows, gradients, centred body text, decorative icons, emoji.
- Apply the tokens everywhere; do not mix in components from another style.
- Keep text contrast accessible even when the style is loud.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from radix-ui/colors).
