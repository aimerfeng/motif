---
name: motif-theme-toggle-reveal
description: "A sun / moon button that switches light and dark through the View Transitions API, the new theme expanding from the button (or the viewport centre) as a circle, square, diamond, hexagon, triangle or star. For site headers and settings menus. Use when the user asks for Theme Reveal Toggle, 主题切换揭幕, theme, dark-mode, view-transitions, clip-path, toggle or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/theme-toggle-reveal"
  motif-item: "theme-toggle-reveal"
  params-hash: "f0c3d3b2"
---

# Theme Reveal Toggle (主题切换揭幕)

A sun / moon button that switches light and dark through the View Transitions API, the new theme expanding from the button (or the viewport centre) as a circle, square, diamond, hexagon, triangle or star. For site headers and settings menus.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/theme-toggle-reveal.tsx` — the component (`ThemeToggleReveal`); the tuned values are baked into its `defaults` object
- `assets/theme-toggle-reveal.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-theme-toggle-reveal`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/theme-toggle-reveal/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ThemeToggleReveal } from '@/components/motif/theme-toggle-reveal/theme-toggle-reveal'

<ThemeToggleReveal />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | circle | circle | circle / square / rectangle / diamond / hexagon / triangle / star | Reveal shape |
| `duration` | 400 | 400 | 200–1500 ms (best 300–900) | Duration |
| `fromCenter` | false | false | boolean | From viewport centre |
| `iconSize` | 24 | 24 | 16–32 px | Icon size |

## Rules

- The component toggles the "dark" class on <html> inside document.startViewTransition; your theme must key off that class. Include the item CSS so the root view-transition snapshots are not cross-faded.
- Uncontrolled it writes "theme" to localStorage; pass theme + onThemeChange (e.g. next-themes) to own persistence yourself.
- Without the View Transitions API, or with reduced motion, the theme switches instantly.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).
