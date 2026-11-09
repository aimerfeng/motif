---
name: motif-settings-api-keys
description: "A table of API keys with masked secrets that reveal on click, copy feedback, permission badges, last-used time, expiry status and revoke. A newly created key shows its full secret once in a highlighted row. For developer settings in SaaS and platforms. Use when the user asks for API Keys Manager, API 密钥管理, api keys, tokens, developer, table, secrets, settings or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/settings-api-keys"
  motif-item: "settings-api-keys"
  params-hash: "eccba548"
---

# API Keys Manager (API 密钥管理)

A table of API keys with masked secrets that reveal on click, copy feedback, permission badges, last-used time, expiry status and revoke. A newly created key shows its full secret once in a highlighted row. For developer settings in SaaS and platforms.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/settings-api-keys.tsx` — the component (`SettingsApiKeys`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-settings-api-keys`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/settings-api-keys/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { SettingsApiKeys } from '@/components/motif/settings-api-keys/settings-api-keys'

<SettingsApiKeys />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #6366f1 | #6366f1 | color | Accent |
| `maskStyle` | dots | dots | dots / stars / blur | Mask style |
| `density` | comfortable | comfortable | comfortable / compact | Density |
| `radius` | 12 | 12 | 0–24 px (best 8–16) | Radius |
| `showScopes` | true | true | boolean | Show permissions |
| `rows` | 4 | 4 | 1–4 | Keys |
| `spring` | visualDuration 0.35, bounce 0.15 | visualDuration 0.35, bounce 0.15 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |

## Rules

- Never ship real secrets to the client: the table should receive masked values and fetch the full secret only on explicit reveal, and a newly created key is shown once.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from keenthemes/reui).
