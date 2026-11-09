---
name: motif-alert-inline-callouts
description: "Info, success, warning and error callouts in neutral, outline or left-accent styles, with an icon, a message, an optional link action or list, and an optional dismiss button. Made for forms, settings and docs. Use when the user asks for Inline Alerts, 内联提示条, alert, callout, banner, form, validation, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/alert-inline-callouts"
  motif-item: "alert-inline-callouts"
  params-hash: "2df729e4"
---

# Inline Alerts (内联提示条)

Info, success, warning and error callouts in neutral, outline or left-accent styles, with an icon, a message, an optional link action or list, and an optional dismiss button. Made for forms, settings and docs.

## When to use

- Brief confirmation of an action the user just took, or a non-blocking error.

## Files

- `assets/alert-inline-callouts.tsx` — the component (`InlineAlert`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-alert-inline-callouts`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/alert-inline-callouts/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { InlineAlert } from '@/components/motif/alert-inline-callouts/alert-inline-callouts'

<InlineAlert />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `tone` | warning | warning | info / success / warning / error | Tone |
| `variant` | neutral | neutral | neutral / outline / accent | Style |
| `message` | Some information is missing! | Some information is missing! | ≤ 80 chars | Message |
| `showIcon` | true | true | boolean | Show icon |
| `action` | Link | Link | ≤ 20 chars | Leave empty to hide |
| `dismissible` | false | false | boolean | Dismissible |
| `density` | comfortable | comfortable | comfortable / compact | Density |
| `radius` | 6 | 6 | 0–16 px (best 4–12) | Corner radius |

## Rules

- Keep messages short and use the same verb as the action.
- Toasts that contain actions must stay until dismissed and be reachable by keyboard.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
