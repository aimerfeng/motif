---
name: motif-terminal
description: "A terminal window that plays itself: commands type out letter by letter, output fades in line by line, install tasks spin and then tick, and it rests on a blinking caret before replaying. Pausable, with the full transcript available to screen readers. For CLI landing pages, install guides and docs intros. Use when the user asks for Terminal, 终端回放, terminal, cli, typing, code, install, shell, developer or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist-mono, @fontsource-variable/jetbrains-mono, @fontsource/ibm-plex-mono, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/terminal"
  motif-item: "terminal"
  params-hash: "450fad18"
---

# Terminal (终端回放)

A terminal window that plays itself: commands type out letter by letter, output fades in line by line, install tasks spin and then tick, and it rests on a blinking caret before replaying. Pausable, with the full transcript available to screen readers. For CLI landing pages, install guides and docs intros.

## When to use

- Use to show what a CLI does in a few lines: install, scaffold, deploy. Keep the session short (under ten lines, two commands at most) so a visitor sees the whole story in one pass.

## Files

- `assets/terminal.tsx` — the component (`Terminal`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-terminal`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist-mono @fontsource-variable/jetbrains-mono @fontsource/ibm-plex-mono clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/terminal/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist-mono';`, `@import '@fontsource-variable/jetbrains-mono';`, `@import '@fontsource/ibm-plex-mono/400.css';`, `@import '@fontsource/ibm-plex-mono/500.css';`, `@import '@fontsource/ibm-plex-mono/700.css';` to the global stylesheet.
4. Use it:

```tsx
import { Terminal } from '@/components/motif/terminal/terminal'

<Terminal />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `speed` | 1 | 1 | 0.5–2 x (best 0.75–1.5) | Scales typing, output and tasks together |
| `loop` | true | true | boolean | When off it plays once and the title bar offers a replay button |
| `prompt` | ❯ | ❯ | ❯ / $ / > / % | Prompt |
| `caret` | block | block | block / bar / underline | Caret |
| `accent` | #9db1ff | #9db1ff | color | Prompt, caret and spinner color |
| `font` | geist | geist | geist / jetbrains / plex | Font |
| `chrome` | traffic | traffic | traffic / mono / none | Window dots |
| `radius` | 12 | 12 | 4–20 px (best 8–16) | Window radius |
| `title` | ~/code — zsh | ~/code — zsh | ≤ 40 chars | Window title |

## Rules

- Compose the session from TerminalCommand (typed, string children), TerminalLine (output; tone muted / success / info / warning / error, optional delay in seconds) and TerminalTask (spinner for duration seconds, then the done text).
- The window keeps its final height from the start; lines that have not played yet are invisible, so nothing below it jumps.
- The animated text is hidden from screen readers and a complete transcript is rendered for them instead; keep the pause / replay button.
- Show real-looking but invented commands and output; never paste real tokens, keys or internal hostnames.
- Use tabular numerals so digits do not jump horizontally.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).
