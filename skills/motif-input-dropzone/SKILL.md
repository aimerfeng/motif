---
name: motif-input-dropzone
description: "When a file is dragged in, the dashed border starts to flow and the icon bobs; on drop each file slides into a list with its own progress bar. Click or keyboard opens the picker too. Made for ticket attachments, profile uploads and media libraries. Use when the user asks for File Dropzone, 拖放上传区, dropzone, file-upload, drag-and-drop, progress, form, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/input-dropzone"
  motif-item: "input-dropzone"
  params-hash: "ddf1012e"
---

# File Dropzone (拖放上传区)

When a file is dragged in, the dashed border starts to flow and the icon bobs; on drop each file slides into a list with its own progress bar. Click or keyboard opens the picker too. Made for ticket attachments, profile uploads and media libraries.

## When to use

- Use for attaching or importing files in forms. It handles drag, click and keyboard selection; you own the actual upload.

## Files

- `assets/input-dropzone.tsx` — the component (`InputDropzone`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-input-dropzone`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/input-dropzone/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { InputDropzone } from '@/components/motif/input-dropzone/input-dropzone'

<InputDropzone />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | dashed | dashed | dashed / soft | Variant |
| `color` | #38bdf8 | #38bdf8 | color | Accent |
| `radius` | 18 | 18 | 6–32 px (best 10–24) | Corner radius |
| `height` | 156 | 156 | 110–240 px (best 130–200) | Zone height |
| `spring` | visualDuration 0.34, bounce 0.25 | visualDuration 0.34, bounce 0.25 | visualDuration 0.05–4 s, bounce 0–0.9 | Spring |
| `title` | Drop files here or | Drop files here or | ≤ 32 chars | A "browse" link follows it |
| `hint` | PNG, JPG or PDF up to 10 MB | PNG, JPG or PDF up to 10 MB | ≤ 48 chars | Hint |

## Rules

- onDrop receives the raw File objects; start real uploads there and mirror progress by passing files={[{ id, name, size, progress }]} (progress 0 to 1). Without a files prop the component simulates progress so it looks alive in previews only.
- Set accept and maxFiles to match the server rules and say them in the hint text. Never rely on the hint alone for validation.
- The zone is a role="button" with a hidden file input; do not wrap it in another label or button.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from shadcnblocks/kibo).
