---
name: motif-style-terminal
description: "Monospace all the way down: hairline borders, inverse-video buttons, one phosphor accent, a blinking caret and prompt-style sections. For developer tools, CLI docs and technical blogs. Use when the user asks for Terminal, 终端, terminal, tui, monospace, cli, developer, tokens, design system or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist-mono, @fontsource-variable/jetbrains-mono, @fontsource/ibm-plex-mono, @fontsource/vt323, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/style-terminal"
  motif-item: "style-terminal"
  params-hash: "a7d8af01"
---

# Terminal (终端)

Monospace all the way down: hairline borders, inverse-video buttons, one phosphor accent, a blinking caret and prompt-style sections. For developer tools, CLI docs and technical blogs.

## When to use

- Use for developer tools, CLI and API documentation, technical blogs, status pages and hacker-event sites where the audience lives in a terminal.
- Avoid for consumer, lifestyle or image-led brands.

## Files

- `assets/style-terminal.tsx` — the component (`Terminal`); the tuned values are baked into its `defaults` object
- `assets/style-terminal.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-style-terminal`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist-mono @fontsource-variable/jetbrains-mono @fontsource/ibm-plex-mono @fontsource/vt323 clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/style-terminal/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/jetbrains-mono';`, `@import '@fontsource-variable/geist-mono';`, `@import '@fontsource/ibm-plex-mono/400.css';`, `@import '@fontsource/ibm-plex-mono/500.css';`, `@import '@fontsource/ibm-plex-mono/700.css';`, `@import '@fontsource/vt323/400.css';` to the global stylesheet.
4. Use it:

```tsx
import { Terminal } from '@/components/motif/style-terminal/style-terminal'

<Terminal />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #5af78e | #5af78e | color | Prompt, caret, primary button and selected state |
| `radius` | 2 | 2 | 0–8 px (best 0–6) | Corner radius |
| `borderWidth` | 1 | 1 | 1–2 px (best 1–2) | Line width |
| `fontPairing` | jetbrains | jetbrains | jetbrains / geist-mono / plex-mono / vt323 | Font pairing |
| `glow` | 0.5 | 0.5 | 0–1 (best 0–0.8) | Phosphor glow |
| `density` | 1 | 1 | 0.85–1.2 x (best 0.9–1.15) | Density |
| `mode` | dark | dark | dark / light | Mode |
| `scanlines` | true | true | boolean | Scanlines |

## Rules

- Typography: one monospace family for everything (JetBrains Mono, Geist Mono, IBM Plex Mono or VT323). Body 15px / line-height 1.6, headings only differ by size and weight 700, never by family. Markdown-style prefixes (## , ### , $ ) mark levels; tight negative tracking only on the display size.
- Palette ratio: about 80% near-black ground (tinted 4% by the accent) and dim surfaces, 12% foreground text (#d5dde4) and dim comments (#7d8a96), 6% the phosphor accent, 2% tag colors (yellow, cyan, pink) used only for status. Light mode inverts to warm paper with near-black ink. Text is never pure white.
- Borders are 1px hairlines in a translucent foreground, with the accent reserved for the active or focused element. Radius is 0-4px. No box shadows except the accent glow on the featured card and the window; no fills except flat surface tints.
- Buttons are inverse-video blocks in the accent (dark text on accent); on hover they invert to an outline. Secondary buttons render as [ bracketed ] text, ghost buttons get a > prefix, switches read [x] / [ ], alerts start with [i], [ok] or [!], and inputs are prefixed by a $ label.
- Sections start with a prompt line (~/shell $ show palette) above the heading. Use code-like content in demos: commands, logs, version numbers; never lorem ipsum.
- Motion is minimal and instant: 60ms linear color swaps and a blinking block caret with steps(1). No easing, no movement, no fades. Reduced motion stops the caret.
- Do not use gradients, rounded 12px+ cards, drop shadows, emoji, illustrations or more than one accent color per screen. Do not mix a proportional font into the interface.
- Apply the tokens everywhere; do not mix in components from another style.
- Keep text contrast accessible even when the style is loud.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from webtui/webtui).
