---
name: motif-style-dark-pro
description: "Dark-first product UI: page, panel, raised and overlay surfaces layered from the Radix twelve-step dark scales, a 1px inner top highlight on every layer, a soft accent glow behind key panels, dense 13px controls, kbd chips and a command bar. For SaaS apps, developer tools and pro software. Use when the user asks for Dark Pro, 专业暗色, dark, dark mode, saas, developer tools, command palette, dense, radix colors or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/geist-mono, @fontsource-variable/ibm-plex-sans, @fontsource-variable/inter-tight, @fontsource-variable/jetbrains-mono, @fontsource-variable/manrope, @fontsource/ibm-plex-mono, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/style-dark-pro"
  motif-item: "style-dark-pro"
  params-hash: "65516016"
---

# Dark Pro (专业暗色)

Dark-first product UI: page, panel, raised and overlay surfaces layered from the Radix twelve-step dark scales, a 1px inner top highlight on every layer, a soft accent glow behind key panels, dense 13px controls, kbd chips and a command bar. For SaaS apps, developer tools and pro software.

## When to use

- Use for SaaS apps, developer tools, issue trackers, dashboards, editors and other professional software that people keep open all day, and for their marketing pages when they should look like the product.
- Avoid for content-first editorial sites or playful consumer brands; the style is quiet, dense and tool-like.

## Files

- `assets/style-dark-pro.tsx` — the component (`StyleDarkPro`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-style-dark-pro`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource-variable/ibm-plex-sans @fontsource-variable/inter-tight @fontsource-variable/jetbrains-mono @fontsource-variable/manrope @fontsource/ibm-plex-mono clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/style-dark-pro/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/geist-mono';`, `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource-variable/jetbrains-mono';`, `@import '@fontsource-variable/ibm-plex-sans';`, `@import '@fontsource/ibm-plex-mono/400.css';`, `@import '@fontsource/ibm-plex-mono/500.css';`, `@import '@fontsource/ibm-plex-mono/700.css';`, `@import '@fontsource-variable/manrope';` to the global stylesheet.
4. Use it:

```tsx
import { StyleDarkPro } from '@/components/motif/style-dark-pro/style-dark-pro'

<StyleDarkPro />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #3e63dd | #3e63dd | color | Primary actions, the glow and selected states |
| `grayFamily` | slate | slate | slate / gray / mauve / sage / olive / sand | The six Radix dark grays, each with a slight tint |
| `elevationContrast` | 0.5 | 0.5 | 0–1 (best 0.3–0.8) | How far apart the page, panel, raised and overlay layers sit |
| `highlight` | 2 | 2 | 0–3 (best 1–2) | whiteA step for the 1px inner top edge (step 1 is 5%); 0 turns it off |
| `glow` | 0.6 | 0.6 | 0–1 (best 0.35–0.8) | Radial accent light behind key panels |
| `radius` | 8 | 8 | 2–12 px (best 6–10) | Control radius; panels use 1.5 times this |
| `density` | regular | regular | compact / regular / comfortable | Density |
| `font` | geist | geist | geist / inter / plex / manrope | Font |

## Rules

- Palette is one Radix dark gray family (slate by default; gray, mauve, sage, olive or sand) plus one accent. Pair the gray tint with the accent hue as Radix recommends (slate with blue or indigo, sand with orange, sage with teal). Solid steps fill surfaces; the matching alpha scale (A2 to A7) draws every border, divider, hover and selected fill, so the same token works on any layer.
- Depth is four surfaces, never more: page (step 1), panel (between 2 and 3), raised controls (3 to 5) and overlays such as menus and the command bar (4 to 6). Each surface is lighter than the one below it; do not use drop shadows to fake elevation on the page or panel layers. Only raised controls get a hairline blackA shadow and only overlays get the large blackA shadow.
- Every surface above the page carries a 1px inner top highlight from the whiteA scale (inset 0 1px 0, whiteA 1 or 2). It reads as light catching the top edge; keep it at or below whiteA 3 and never add a bottom highlight.
- One soft radial accent glow per screen, behind the most important panel (the command bar, a hero card, a pricing tier). It sits behind the panel, fades to transparent, and is paired with a short accent gradient on the panel top edge. Never glow text, buttons or more than one panel.
- Text is gray 12 for primary content and gray 11 for secondary; gray 10 only for placeholders and icons. Accent text is the accent lifted towards white until it passes 4.5:1 on the lightest surface. Solid accent buttons pick white or near-black ink by contrast. Status uses Radix green, amber and red: step 11 text on a 12 to 16 percent tint with a matching inset border, never solid status blocks.
- Dense by default: 13px UI text, 32px controls (28 compact, 36 comfortable), 36px list rows, 6 to 12px gaps. Headings are 600 weight with -0.025em tracking; numbers, IDs, branches and shortcuts use the mono family. Labels are 11px mono uppercase.
- Keyboard first: every frequent action shows its shortcut in a kbd chip (alpha-3 fill, alpha-5 border, mono 11px). A command bar opened with Cmd K lists actions by group with icons and shortcuts; arrow keys move the selection and Enter runs it. Focus rings are a 2px accent-text outline offset by 2px.
- Motion is quick and functional: 120 to 200ms on colour, background and transform only, a slightly springy ease on the segmented thumb and switch. No scroll animations, no parallax. Respect prefers-reduced-motion by removing transitions.
- Forbidden: pure black (#000) pages, white or light panels, more than one accent hue, gradients on surfaces, glassmorphism blur, coloured text on coloured fills, borders brighter than alpha 7, and large rounded pills for anything except switches and avatars.
- Apply the tokens everywhere; do not mix in components from another style.
- Keep text contrast accessible even when the style is loud.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from radix-ui/colors).
