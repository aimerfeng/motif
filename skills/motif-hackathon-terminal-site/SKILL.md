---
name: motif-hackathon-terminal-site
description: "A hackathon site laid out as a text-mode screen: boxed panes with titles cut into the border, a crontab-style schedule, prize pool, judges, man-page rules, a countdown and a fake shell where you type a handle to register. Switches between warm retro and cool arctic terminal palettes. Use when the user asks for Terminal Hackathon, 终端风黑客松, hackathon, event, terminal, tui, countdown, schedule, monospace, gruvbox, nord or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist-mono, @fontsource-variable/jetbrains-mono, @fontsource/ibm-plex-mono, @fontsource/vt323, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/hackathon-terminal-site"
  motif-item: "hackathon-terminal-site"
  params-hash: "8d620af0"
---

# Terminal Hackathon (终端风黑客松)

A hackathon site laid out as a text-mode screen: boxed panes with titles cut into the border, a crontab-style schedule, prize pool, judges, man-page rules, a countdown and a fake shell where you type a handle to register. Switches between warm retro and cool arctic terminal palettes.

## When to use

- A one-page site for a hackathon, game jam or developer meetup whose audience lives in a terminal: status bar, README hero with a countdown, crontab schedule, prizes, judges, rules and a register shell.
- Replace CRON, SPLITS, JUDGES and RULES in sections.tsx with your own programme; they are plain data and the markup does not need to change.

## Files

- `assets/hackathon-terminal-site.tsx` — the component (`HackathonTerminalSite`); the tuned values are baked into its `defaults` object
- `assets/sections.tsx`
- `assets/hackathon-terminal-site.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-hackathon-terminal-site`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist-mono @fontsource-variable/jetbrains-mono @fontsource/ibm-plex-mono @fontsource/vt323 clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/hackathon-terminal-site/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/jetbrains-mono';`, `@import '@fontsource-variable/geist-mono';`, `@import '@fontsource/ibm-plex-mono/400.css';`, `@import '@fontsource/ibm-plex-mono/500.css';`, `@import '@fontsource/ibm-plex-mono/700.css';`, `@import '@fontsource/vt323/400.css';` to the global stylesheet.
4. Use it:

```tsx
import { HackathonTerminalSite } from '@/components/motif/hackathon-terminal-site/hackathon-terminal-site'

<HackathonTerminalSite />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `eventName` | Nullbyte Hack | Nullbyte Hack | ≤ 24 chars | Event name |
| `dates` | Mar 12–14, 2027 | Mar 12–14, 2027 | ≤ 32 chars | Display text only; set the countdown target with the startsAt prop |
| `prizePool` | $48,000 | $48,000 | ≤ 16 chars | Prize pool |
| `palette` | gruvbox-dark | gruvbox-dark | gruvbox-dark / gruvbox-dark-hard / gruvbox-light / nord | Terminal palette |
| `boxStyle` | square | square | square / round / double | Box style |
| `monoFont` | jetbrains | jetbrains | jetbrains / geist-mono / plex-mono / vt323 | Monospace font |
| `caretBlink` | true | true | boolean | Blinking caret |

## Rules

- Everything is drawn from WebTUI primitives: data-box panes (square, round or double) whose titles are background0 badges sitting on the top border (data-shear="top"), a divided table, badges with caps and 3lh buttons. Keep spacing in lh and ch units so the page stays on the character grid.
- Colors come only from the fixed WebTUI palettes (gruvbox dark, dark hard, light and nord). Use background0..3 and foreground0..2 for structure and the --ht-* accents for prompts, numbers and badges; do not add free colors.
- Pass the real kickoff time as startsAt (ISO 8601 with a timezone); the dates param is display text only. With prefers-reduced-motion the countdown renders once, the caret stops and the typing hint is shown in full.
- The register shell is a real form: a labelled input, Enter submits, results go to a role="log" region. Wire submit to your backend; it never sends anything as shipped.
- One monospace family for the whole page. No images, gradients, shadows or emoji; use invented handles and companies, never real logos.
- Keep one signature moment per page; every other section stays calm.
- Replace every placeholder text and image before shipping.
- Keep the section order meaningful: promise → proof → details → action.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from webtui/webtui).
