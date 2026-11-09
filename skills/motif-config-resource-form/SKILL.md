---
name: motif-config-resource-form
description: "A create-resource form with provider radio cards, a region select, a storage slider synced to a number field, a compression choice and a live monthly estimate; the workspace variant picks organization, region and plan cards. For cloud, database and hosting consoles. Use when the user asks for Resource Configurator, 资源配置表单, form, provisioning, cloud, slider, radio cards, pricing estimate, workspace or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/config-resource-form"
  motif-item: "config-resource-form"
  params-hash: "b6a979c6"
---

# Resource Configurator (资源配置表单)

A create-resource form with provider radio cards, a region select, a storage slider synced to a number field, a compression choice and a live monthly estimate; the workspace variant picks organization, region and plan cards. For cloud, database and hosting consoles.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/config-resource-form.tsx` — the component (`ConfigResourceForm`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-config-resource-form`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/config-resource-form/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { ConfigResourceForm } from '@/components/motif/config-resource-form/config-resource-form'

<ConfigResourceForm />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #3b82f6 | #3b82f6 | color | Accent |
| `variant` | cluster | cluster | cluster / workspace | Form |
| `storageRange` | 128 | 128 | 32–1024 | In GB |
| `unitPrice` | 0.023 | 0.023 | 0.005–0.1 | Per GB per day; other providers scale from it |
| `showEstimate` | true | true | boolean | Show estimate |
| `radius` | 6 | 6 | 0–14 px | Radius |
| `tone` | plain | plain | plain / card | Surface |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from tremorlabs/tremor-blocks).
