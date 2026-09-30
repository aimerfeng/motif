---
name: motif-contact-newsletter
description: "A two-column contact section with details and a working form, or a centered newsletter signup. The form submits locally with a success state and soft glows drift behind. Use when the user asks for Contact & Newsletter, 联系表单 / 订阅框, contact, form, newsletter, subscribe, signup or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/space-grotesk, @fontsource/instrument-serif, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/contact-newsletter"
  motif-item: "contact-newsletter"
  params-hash: "33bde737"
---

# Contact & Newsletter (联系表单 / 订阅框)

A two-column contact section with details and a working form, or a centered newsletter signup. The form submits locally with a success state and soft glows drift behind.

## When to use

- Use as the closing contact section of a landing page, or the newsletter variant above a footer. Wire the form by replacing the submit handler; it never sends data on its own.

## Files

- `assets/contact-newsletter.tsx` — the component (`ContactNewsletter`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/space-grotesk @fontsource/instrument-serif clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/contact-newsletter/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';`, `@import '@fontsource-variable/space-grotesk';` to the global stylesheet.
4. Use it:

```tsx
import { ContactNewsletter } from '@/components/motif/contact-newsletter/contact-newsletter'

<ContactNewsletter />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #7c8cff | #7c8cff | color | Accent |
| `font` | serif | serif | serif / sans / grotesk | Heading font |
| `variant` | contact | contact | contact / newsletter | Variant |
| `density` | comfortable | comfortable | compact / comfortable / spacious | Vertical spacing |
| `heading` |  |  | ≤ 48 chars | Leave empty for the variant’s default copy |
| `subheading` |  |  | ≤ 160 chars | Subheading |
| `buttonLabel` |  |  | ≤ 20 chars | Button label |
| `animate` | true | true | boolean | Entrance & glow motion |

## Rules

- Keep the form to four fields at most. The button text color is derived from the accent luminance, so any accent works.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from moumen-soliman/uitripled).
