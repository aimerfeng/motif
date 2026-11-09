---
name: motif-device-frames
description: "Vector phone, Android-style phone and browser-window frames that wrap live React screens instead of screenshots, with optional 3D tilt and a soft floor shadow. Made for product heroes, app showcases and changelog visuals. Use when the user asks for Device Frames, 设备外框, mockup, device, phone, browser, frame, showcase or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/device-frames"
  motif-item: "device-frames"
  params-hash: "293b0f73"
---

# Device Frames (设备外框)

Vector phone, Android-style phone and browser-window frames that wrap live React screens instead of screenshots, with optional 3D tilt and a soft floor shadow. Made for product heroes, app showcases and changelog visuals.

## When to use

- Lists, grids and panels whose items enter, reorder or expand.

## Files

- `assets/device-frames.tsx` — the component (`DeviceFrame`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-device-frames`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/device-frames/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { DeviceFrame } from '@/components/motif/device-frames/device-frames'

<DeviceFrame />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `device` | phone | phone | phone / android / browser | Device |
| `tone` | dark | dark | light / dark | Frame tone |
| `url` | tidepool.app | tidepool.app | ≤ 40 chars | Browser window only |
| `mode` | default | default | default / simple | Browser window only |
| `tilt` | 0 | 0 | 0–24 deg (best 0–16) | 3D tilt |
| `shadow` | true | true | boolean | Floor shadow |

## Rules

- Stagger at most ~50 ms per item and cap the total stagger around 400 ms.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from magicuidesign/magicui).
