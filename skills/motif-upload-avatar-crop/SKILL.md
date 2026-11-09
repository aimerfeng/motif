---
name: motif-upload-avatar-crop
description: "Pick an image and it opens in a round crop frame you pan by dragging and zoom with a slider or the wheel, with live previews of the avatar at small sizes; Apply exports the cropped PNG. Made for profile settings and team onboarding. Use when the user asks for Avatar Upload & Crop, 头像上传裁剪, avatar, image-crop, upload, profile, form, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/upload-avatar-crop"
  motif-item: "upload-avatar-crop"
  params-hash: "31c88b17"
---

# Avatar Upload & Crop (头像上传裁剪)

Pick an image and it opens in a round crop frame you pan by dragging and zoom with a slider or the wheel, with live previews of the avatar at small sizes; Apply exports the cropped PNG. Made for profile settings and team onboarding.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/upload-avatar-crop.tsx` — the component (`UploadAvatarCrop`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-upload-avatar-crop`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/upload-avatar-crop/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { UploadAvatarCrop } from '@/components/motif/upload-avatar-crop/upload-avatar-crop'

<UploadAvatarCrop />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `shape` | circle | circle | circle / square | Crop shape |
| `accent` | #a78bfa | #a78bfa | color | Accent |
| `radius` | 18 | 18 | 0–40 % (best 8–28) | Square shape only, percent of the side |
| `minZoom` | 1 | 1 | 1–1.5 (best 1–1.2) | Min zoom |
| `maxZoom` | 3 | 3 | 2–6 (best 2.5–4) | Max zoom |
| `outputSize` | 512 | 512 | 128–1024 px (best 256–768) | Output size |
| `showPreviews` | true | true | boolean | Show previews |

## Rules

- Pass the picked File as file (or a data / object URL as src); onCrop receives a PNG data URL. Upload that yourself; the component never sends anything.
- Compose ImageCrop with ImageCropContent, ImageCropZoom, ImageCropPreview, ImageCropReset and ImageCropApply, or use the all-in-one Cropper.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from shadcnblocks/kibo).
