---
name: motif-footer-link-columns
description: "A classic multi-column footer: brand mark, newsletter field, link columns, social glyphs and a legal row. Variants add a call-to-action band on top or a back-to-top button. The dependable end of a marketing site. Use when the user asks for Link Column Footer, 多栏链接页脚, footer, links, newsletter, columns, social or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/footer-link-columns"
  motif-item: "footer-link-columns"
  params-hash: "0fc9831f"
---

# Link Column Footer (多栏链接页脚)

A classic multi-column footer: brand mark, newsletter field, link columns, social glyphs and a legal row. Variants add a call-to-action band on top or a back-to-top button. The dependable end of a marketing site.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/footer-link-columns.tsx` — the component (`FooterLinkColumns`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-footer-link-columns`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/footer-link-columns/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { FooterLinkColumns } from '@/components/motif/footer-link-columns/footer-link-columns'

<FooterLinkColumns />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `brand` | Ledgerly | Ledgerly | ≤ 20 chars | Brand name |
| `accent` | #0d9488 | #0d9488 | color | Accent color |
| `tone` | light | light | light / dark | Tone |
| `variant` | plain | plain | plain / cta / top | Variant |
| `columns` | 5 | 5 | 2–5 | Link columns |
| `showNewsletter` | true | true | boolean | Show newsletter |
| `showSocial` | true | true | boolean | Show social icons |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from markmead/hyperui).
