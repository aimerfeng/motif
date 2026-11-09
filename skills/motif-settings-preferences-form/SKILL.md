---
name: motif-settings-preferences-form
description: "Grouped settings cards with profile fields, channel switches, an event-by-channel notification matrix, selects and editor toggles. Any edit slides up a sticky unsaved-changes bar with reset and save, and validation errors show inline. For account, notification and editor preference pages. Use when the user asks for Preferences Form with Save Bar, 偏好设置表单, settings, preferences, form, notifications, switch, save bar, validation or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/settings-preferences-form"
  motif-item: "settings-preferences-form"
  params-hash: "5cfac7f7"
---

# Preferences Form with Save Bar (偏好设置表单)

Grouped settings cards with profile fields, channel switches, an event-by-channel notification matrix, selects and editor toggles. Any edit slides up a sticky unsaved-changes bar with reset and save, and validation errors show inline. For account, notification and editor preference pages.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/settings-preferences-form.tsx` — the component (`SettingsPreferencesForm`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-settings-preferences-form`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/settings-preferences-form/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { SettingsPreferencesForm } from '@/components/motif/settings-preferences-form/settings-preferences-form'

<SettingsPreferencesForm />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #6366f1 | #6366f1 | color | Accent |
| `layout` | stacked | stacked | stacked / split | Layout |
| `density` | comfortable | comfortable | comfortable / compact | Density |
| `radius` | 12 | 12 | 0–20 px (best 6–16) | Radius |
| `saveBarPosition` | bottom | bottom | bottom / top | Save bar position |
| `spring` | visualDuration 0.35, bounce 0.2 | visualDuration 0.35, bounce 0.2 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |
| `showDescriptions` | true | true | boolean | Show descriptions |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from keenthemes/reui).
