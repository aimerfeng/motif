---
name: motif-style-classic-desktop
description: "Gray bevels, a navy title bar, sunken fields and a teal desktop: the tactile feel of an early windowing desktop, with no operating-system icons or logos. For portfolio easter eggs, tool sites and nostalgic products. Use when the user asks for Classic Desktop, 经典桌面, classic desktop, bevel, window, win98, retro ui, tokens, design system or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/ibm-plex-sans, @fontsource-variable/space-grotesk, @fontsource/ibm-plex-mono, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/style-classic-desktop"
  motif-item: "style-classic-desktop"
  params-hash: "02d96324"
---

# Classic Desktop (经典桌面)

Gray bevels, a navy title bar, sunken fields and a teal desktop: the tactile feel of an early windowing desktop, with no operating-system icons or logos. For portfolio easter eggs, tool sites and nostalgic products.

## When to use

- Use for portfolio easter eggs, utility and tool sites, indie software pages, nostalgic products and playful launch pages that can lean on early-desktop nostalgia.
- Avoid for anything that should feel modern, minimal or premium, and for dense mobile-first apps (the bevels need room).

## Files

- `assets/style-classic-desktop.tsx` — the component (`ClassicDesktop`); the tuned values are baked into its `defaults` object
- `assets/style-classic-desktop.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-style-classic-desktop`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/ibm-plex-sans @fontsource-variable/space-grotesk @fontsource/ibm-plex-mono clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/style-classic-desktop/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/ibm-plex-sans';`, `@import '@fontsource-variable/geist';`, `@import '@fontsource/ibm-plex-mono/400.css';`, `@import '@fontsource/ibm-plex-mono/500.css';`, `@import '@fontsource/ibm-plex-mono/700.css';`, `@import '@fontsource-variable/space-grotesk';` to the global stylesheet.
4. Use it:

```tsx
import { ClassicDesktop } from '@/components/motif/style-classic-desktop/style-classic-desktop'

<ClassicDesktop />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #0a2a7a | #0a2a7a | color | Also used for selection, progress and highlights |
| `desktop` | #008080 | #008080 | color | Desktop color |
| `bevel` | 1 | 1 | 1–3 px (best 1–2) | Bevel thickness |
| `radius` | 0 | 0 | 0–8 px (best 0–6) | Corner radius |
| `fontPairing` | plex-sans | plex-sans | plex-sans / geist / plex-mono / grotesk | Font pairing |
| `density` | 1 | 1 | 0.9–1.2 x (best 0.9–1.15) | Density |
| `gradient` | true | true | boolean | Title bar gradient |

## Rules

- Palette: a flat #c0c0c0 face for every control and window (about 55% of pixels), white sunken fields and client areas (about 20%), a desktop color behind everything (about 15%), one accent for title bars, selection and progress (about 8%), and a tooltip yellow (#ffffe1) for hints. Text is near-black on gray, white on the accent. No other hues except status glyph colors (green, red, gold).
- Depth comes only from 1-3px bevels made of four inset shadows: white and face-light on the top-left, dark and shadow-gray on the bottom-right for raised; reversed for sunken. Never use blur, translucency, rounded pill shapes or soft drop shadows; a hard offset shadow (3px, 38% black) is allowed under windows only.
- Structure: content lives in windows (title bar with icon, title and three drawn controls, optional menu bar, sunken white client area, right-aligned button row). Buttons are raised, sink on press (1px content nudge), and the default action is bold with a black outline. Focus is a 1px dotted inner outline.
- Typography: a humanist sans (IBM Plex Sans) at 13-14px for UI, bold for titles and default buttons; titles are short nouns. Headings are bold and tight; no light weights, no letter-spaced caps.
- Icons are drawn from flat shapes with a 1.5px near-black outline and a few flat fills. Do not use, imitate or trace any operating-system logo, flag, icon, wallpaper or bitmap font. Use neutral names (Menu, Projects, Trash) instead of vendor terms.
- Motion is nearly absent: state changes are instant. If anything moves, it is a stepped progress bar. No fades, springs or easing; reduced motion needs no changes.
- Do not add gradients other than the title bar, glassy highlights, gray outlines thinner than the bevel, or modern card shadows.
- Apply the tokens everywhere; do not mix in components from another style.
- Keep text contrast accessible even when the style is loud.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from jdan/98.css).
