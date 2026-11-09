---
name: motif-auth-glow-tiles
description: "An email and password sign-in form beside a field of rounded tiles. Every few seconds a random handful slowly picks up an accent glow while the last set fades, so the background breathes. Includes SSO buttons and a terms line, in a split layout or as a card floating over the tiles. Use when the user asks for Glowing Tile Sign-In, 光格背景登录页, auth, sign-in, login, form, tiles, grid, glow or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/auth-glow-tiles"
  motif-item: "auth-glow-tiles"
  params-hash: "948920c2"
---

# Glowing Tile Sign-In (光格背景登录页)

An email and password sign-in form beside a field of rounded tiles. Every few seconds a random handful slowly picks up an accent glow while the last set fades, so the background breathes. Includes SSO buttons and a terms line, in a split layout or as a card floating over the tiles.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/auth-glow-tiles.tsx` — the component (`AuthGlowTiles`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-auth-glow-tiles`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/auth-glow-tiles/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { AuthGlowTiles } from '@/components/motif/auth-glow-tiles/auth-glow-tiles'

<AuthGlowTiles />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `brandName` | Larchmont | Larchmont | ≤ 24 chars | Brand name |
| `accent` | #3b82f6 | #3b82f6 | color | Accent |
| `tone` | dark | dark | dark / light | Tone |
| `cardStyle` | split | split | split / floating | Split shows only the form on narrow screens |
| `tileSize` | 36 | 36 | 20–56 px (best 28–44) | Tile size |
| `tileGap` | 8 | 8 | 4–16 px | Tile gap |
| `litCount` | 40 | 40 | 10–120 (best 20–70) | Each set is random between half and one and a half times this |
| `cycleSeconds` | 3 | 3 | 1.5–8 s (best 2.5–5) | Cycle |
| `glowStrength` | 1 | 1 | 0.4–2 (best 0.8–1.5) | Glow strength |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from tremorlabs/tremor-blocks).
