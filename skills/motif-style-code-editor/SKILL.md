---
name: motif-style-code-editor
description: "A code editor's chrome turned into a design language: an activity bar, a tab strip with unsaved dots, line-number gutters beside content blocks, headings and labels coloured by syntax role (keyword, string, number, comment) as Catppuccin's style guide assigns them, a minimap and a status bar, in four flavours. For developer tools, technical blogs and docs. Use when the user asks for Code Editor, 代码编辑器, code editor, ide, catppuccin, syntax highlighting, developer, docs, monospace or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/geist-mono, @fontsource-variable/ibm-plex-sans, @fontsource-variable/inter-tight, @fontsource-variable/jetbrains-mono, @fontsource/ibm-plex-mono, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/style-code-editor"
  motif-item: "style-code-editor"
  params-hash: "54edb3f9"
---

# Code Editor (代码编辑器)

A code editor's chrome turned into a design language: an activity bar, a tab strip with unsaved dots, line-number gutters beside content blocks, headings and labels coloured by syntax role (keyword, string, number, comment) as Catppuccin's style guide assigns them, a minimap and a status bar, in four flavours. For developer tools, technical blogs and docs.

## When to use

- Use for developer tools, CLI and API documentation, technical blogs, changelogs and internal engineering portals whose readers spend their day in an editor.
- Avoid for consumer, lifestyle or marketing-led brands; the chrome reads as a tool, not a story.

## Files

- `assets/style-code-editor.tsx` — the component (`StyleCodeEditor`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-style-code-editor`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource-variable/ibm-plex-sans @fontsource-variable/inter-tight @fontsource-variable/jetbrains-mono @fontsource/ibm-plex-mono clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/style-code-editor/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/jetbrains-mono';`, `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource-variable/geist-mono';`, `@import '@fontsource-variable/geist';`, `@import '@fontsource/ibm-plex-mono/400.css';`, `@import '@fontsource/ibm-plex-mono/500.css';`, `@import '@fontsource/ibm-plex-mono/700.css';`, `@import '@fontsource-variable/ibm-plex-sans';` to the global stylesheet.
4. Use it:

```tsx
import { StyleCodeEditor } from '@/components/motif/style-code-editor/style-code-editor'

<StyleCodeEditor />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `flavor` | mocha | mocha | latte / frappe / macchiato / mocha | Latte is light; the other three are dark |
| `accent` | mauve | mauve | rosewater / flamingo / pink / mauve / red / maroon / peach / yellow / green / teal / sky / sapphire / blue / lavender | Active tab, activity marker, primary button, focus ring and status mode |
| `showGutter` | true | true | boolean | Line-number gutter |
| `showMinimap` | true | true | boolean | Hidden below 1024px |
| `font` | jetbrains | jetbrains | jetbrains / geist / plex / mono | Font |
| `radius` | 6 | 6 | 0–10 px (best 2–8) | Radius |
| `density` | 1 | 1 | 0.85–1.2 x (best 0.9–1.1) | Row, tab and control heights |

## Rules

- Palette is Catppuccin only: one flavor per page (Latte light; Frappé, Macchiato, Mocha dark) and only its 26 named colours. Base is the editor, mantle and crust are the panes around it (sidebar, tab strip, title and status bars), surface0-2 are controls and borders, overlay0-2 are quiet text and decoration.
- Text follows the upstream style guide: body copy and headlines in text, sub-headlines and labels in subtext0/1, subtle text in overlay1, links blue, success green, warnings yellow, errors red, tags and pills blue, text on an accent fill in base (or a dark ink on light Latte accents). Legibility wins: on Latte, darken a colour in OKLCH until it reaches 4.5:1 rather than using the raw pastel for small text.
- Colour means syntax role, never decoration: keyword mauve, string green, number and constant peach, comment and punctuation overlay2 (italic comments), function and property blue, type and attribute yellow, parameter maroon, builtin red, operator sky, enum variant teal, escape and regex pink, macro rosewater. Heading markers use the rainbow order (# red, ## peach, ### yellow).
- Pick one accent from the 14 named colours for UI state only: the active tab top line, the activity bar marker, the primary button, the focus ring and the status bar mode block. Active line number is lavender, the cursor is rosewater, the cursor line is text at 8 to 10%, selections are overlay2 at 20 to 30%.
- Structure is editor chrome: a 48px activity bar, a 240px explorer, a tab strip where unsaved files show a dot instead of the close icon, breadcrumbs, a scrolling document with a line-number gutter and an optional minimap, and a 24px status bar. Every row or content block gets one line number; blocks align their number to the top.
- Type: a monospace (JetBrains Mono, Geist Mono or IBM Plex Mono) for headings, labels, code and numbers; a neutral sans for prose and controls. Headings 700 with slight negative tracking, prefixed by markdown markers. Labels mono 11px uppercase +8% tracking. Section notes are written as // comments.
- Shapes are flat and tight: radius 4 to 8px, 1px surface0 borders, no drop shadows, no gradients, no glow. Depth comes only from the base, mantle, crust stack.
- Motion is the editor's: 120 to 180ms colour and background swaps, a blinking 2px rosewater caret with steps(1), a switch thumb that slides. Nothing bounces or fades in on scroll. Reduced motion stops the caret and all transitions.
- Do not mix flavors, invent hex values, colour text by mood instead of role, use more than one accent for UI state, or put a real product logo in the chrome; use invented project names in demos.
- Apply the tokens everywhere; do not mix in components from another style.
- Keep text contrast accessible even when the style is loud.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from catppuccin/catppuccin).
