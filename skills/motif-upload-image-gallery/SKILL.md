---
name: motif-upload-image-gallery
description: "An empty dashed dropzone that turns into a thumbnail grid as images arrive, each with a remove button and an Add more action, plus a file limit and size errors. A single-image mode fills the zone with the preview. Made for product photos, listings and portfolios. Use when the user asks for Image Upload Grid, 图片上传网格, upload, image, dropzone, gallery, file-upload, form, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/upload-image-gallery"
  motif-item: "upload-image-gallery"
  params-hash: "24587ad1"
---

# Image Upload Grid (图片上传网格)

An empty dashed dropzone that turns into a thumbnail grid as images arrive, each with a remove button and an Add more action, plus a file limit and size errors. A single-image mode fills the zone with the preview. Made for product photos, listings and portfolios.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/upload-image-gallery.tsx` — the component (`UploadImageGallery`); the tuned values are baked into its `defaults` object
- `assets/use-file-upload.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-upload-image-gallery`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/upload-image-gallery/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { UploadImageGallery } from '@/components/motif/upload-image-gallery/upload-image-gallery'

<UploadImageGallery />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `mode` | grid | grid | grid / single | Mode |
| `columns` | 3 | 3 | 2–4 (best 2–4) | Narrow containers always use two |
| `aspect` | square | square | square / landscape / portrait | Thumbnail aspect |
| `thumbRadius` | 6 | 6 | 0–16 px (best 4–12) | Thumbnail radius |
| `accent` | #fafafa | #fafafa | color | Remove buttons and focus ring |
| `maxFiles` | 6 | 6 | 2–12 (best 3–9) | Max files |
| `maxSizeMB` | 5 | 5 | 1–20 (best 2–10) | Max size (MB) |

## Rules

- The component validates count, size and type in the browser only; repeat the same checks on the server. onFilesChange receives { file, id, preview } entries; upload the File objects yourself.
- Previews are object URLs; the hook revokes them on remove and unmount, so copy the File if you need it after removal.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
