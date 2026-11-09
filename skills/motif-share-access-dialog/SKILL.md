---
name: motif-share-access-dialog
description: "A share panel: emails turn into chips with a role picker, members are listed with their access, and the link row has a visibility menu and a copy button with feedback. For documents, projects and design files. Use when the user asks for Share & Access Dialog, 共享权限弹窗, share, invite, permissions, dialog, dropdown, input-group, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/share-access-dialog"
  motif-item: "share-access-dialog"
  params-hash: "3dd0f1ab"
---

# Share & Access Dialog (共享权限弹窗)

A share panel: emails turn into chips with a role picker, members are listed with their access, and the link row has a visibility menu and a copy button with feedback. For documents, projects and design files.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/share-access-dialog.tsx` — the component (`ShareAccessDialog`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-share-access-dialog`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/share-access-dialog/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ShareAccessDialog } from '@/components/motif/share-access-dialog/share-access-dialog'

<ShareAccessDialog />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #6366f1 | #6366f1 | color | Accent |
| `radius` | 12 | 12 | 4–20 px (best 8–16) | Corner radius |
| `presentation` | dialog | dialog | dialog / inline | Presentation |
| `showLinkAccess` | true | true | boolean | Show link access |
| `members` | 3 | 3 | 1–5 | Members shown |
| `spring` | visualDuration 0.35, bounce 0.15 | visualDuration 0.35, bounce 0.15 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |
| `width` | 420 | 420 | 340–520 px (best 380–480) | Width |

## Rules

- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from keenthemes/reui).
