---
name: motif-settings-profile-form
description: "A profile editor with a generated cover banner and avatar you can replace (the cover can also be removed), first and last name, a username with an @ prefix, a website with an https:// add-on and a bio with a characters-left counter. Works as a settings card or a dialog. Made for account settings. Use when the user asks for Edit Profile Form, 个人资料编辑, settings, profile, form, dialog, avatar upload, character counter, account or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/settings-profile-form"
  motif-item: "settings-profile-form"
  params-hash: "6f21ae91"
---

# Edit Profile Form (个人资料编辑)

A profile editor with a generated cover banner and avatar you can replace (the cover can also be removed), first and last name, a username with an @ prefix, a website with an https:// add-on and a bio with a characters-left counter. Works as a settings card or a dialog. Made for account settings.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/settings-profile-form.tsx` — the component (`SettingsProfileForm`); the tuned values are baked into its `defaults` object
- `assets/use-file-upload.ts`
- `assets/use-character-limit.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-settings-profile-form`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/settings-profile-form/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { SettingsProfileForm } from '@/components/motif/settings-profile-form/settings-profile-form'

<SettingsProfileForm />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `presentation` | dialog | dialog | dialog / card | Presentation |
| `coverStyle` | aurora | aurora | aurora / waves / grid | Generated from the accent until an image is uploaded |
| `avatarShape` | circle | circle | circle / rounded | Avatar shape |
| `accent` | #6366f1 | #6366f1 | color | Accent |
| `radius` | 10 | 10 | 4–16 px (best 6–12) | Radius |
| `bioLimit` | 180 | 180 | 140–300 (best 160–240) | Bio limit |
| `showWebsite` | true | true | boolean | Website field |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
