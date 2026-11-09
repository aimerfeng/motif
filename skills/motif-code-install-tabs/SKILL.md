---
name: motif-code-install-tabs
description: "A dark code block with pnpm / npm / yarn / bun tabs that rewrite the same install command, an underline that marks the active manager, a copy button, and the choice remembered for the next block on the page. Made for docs, READMEs and component pages. Use when the user asks for Install Command Tabs, 安装命令切换, cli, install, package-manager, tabs, copy, docs, code or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist-mono, @fontsource-variable/jetbrains-mono, @fontsource/ibm-plex-mono, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/code-install-tabs"
  motif-item: "code-install-tabs"
  params-hash: "560a615b"
---

# Install Command Tabs (安装命令切换)

A dark code block with pnpm / npm / yarn / bun tabs that rewrite the same install command, an underline that marks the active manager, a copy button, and the choice remembered for the next block on the page. Made for docs, READMEs and component pages.

## When to use

- Numbers, stats and small data displays that change over time.

## Files

- `assets/code-install-tabs.tsx` — the component (`CliCommands`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-code-install-tabs`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist-mono @fontsource-variable/jetbrains-mono @fontsource/ibm-plex-mono clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/code-install-tabs/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist-mono';`, `@import '@fontsource-variable/jetbrains-mono';`, `@import '@fontsource/ibm-plex-mono/400.css';`, `@import '@fontsource/ibm-plex-mono/500.css';`, `@import '@fontsource/ibm-plex-mono/700.css';` to the global stylesheet.
4. Use it:

```tsx
import { CliCommands } from '@/components/motif/code-install-tabs/code-install-tabs'

<CliCommands />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `command` | shadcn@latest add comp-149 | shadcn@latest add comp-149 | ≤ 64 chars | Everything after the package-manager runner |
| `defaultManager` | pnpm | pnpm | pnpm / npm / yarn / bun | Default manager |
| `rememberChoice` | true | true | boolean | Syncs every block on the page and persists to localStorage |
| `accent` | #fafafa | #fafafa | color | Underline color |
| `radius` | 6 | 6 | 0–16 px (best 4–12) | Corner radius |
| `font` | geist | geist | geist / jetbrains / plex | Mono font |

## Rules

- Use tabular numerals so digits do not jump horizontally.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
