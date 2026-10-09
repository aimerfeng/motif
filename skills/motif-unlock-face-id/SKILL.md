---
name: motif-unlock-face-id
description: "Four rounded brackets and a minimal face draw themselves stroke by stroke while a scan line sweeps. A failed scan shakes, success resolves into a check and the gated content sharpens out of its blur. Made for vaults, private albums and sensitive data. Use when the user asks for Face Unlock, 刷脸解锁, face-id, unlock, biometric, scan, security, svg, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/unlock-face-id"
  motif-item: "unlock-face-id"
  params-hash: "218aa288"
---

# Face Unlock (刷脸解锁)

Four rounded brackets and a minimal face draw themselves stroke by stroke while a scan line sweeps. A failed scan shakes, success resolves into a check and the gated content sharpens out of its blur. Made for vaults, private albums and sensitive data.

## When to use

- Primary calls to action where feedback on press or hover adds confidence.

## Files

- `assets/unlock-face-id.tsx` — the component (`UnlockFaceId`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-unlock-face-id`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/unlock-face-id/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { UnlockFaceId } from '@/components/motif/unlock-face-id/unlock-face-id'

<UnlockFaceId />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `color` | #0d9488 | #0d9488 | color | Scan color |
| `successColor` | #16a34a | #16a34a | color | Success color |
| `size` | 132 | 132 | 80–200 px (best 100–168) | Glyph size |
| `strokeWidth` | 4 | 4 | 2.5–6 (best 3–5) | Stroke width |
| `scanDuration` | 1.8 | 1.8 | 0.8–3 s (best 1.2–2.6) | Scan time |
| `idleMessage` | Look at your device to unlock | Look at your device to unlock | ≤ 40 chars | Idle message |
| `successMessage` | Identity confirmed. Unlocked. | Identity confirmed. Unlocked. | ≤ 40 chars | Success message |

## Rules

- The glyph is a real button (aria-label from the label prop) and the message below is an aria-live status; keep both when restyling.
- Drive it with status ("idle" | "scanning" | "success" | "error") when the real check happens elsewhere; leave status out for a self-contained demo scan.
- Pass the protected content as children: it stays blurred and non-interactive until status is "success".
- Feedback must start within 100 ms of the interaction.
- Keep the effect on one button per view; secondary buttons stay calm.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from educlopez/smoothui).
