---
name: motif-consulting-firm-site
description: "A corporate site for a fictional strategy consultancy: a restrained hero, alternating practice areas, an industries grid, case results with large figures, insights that open in a reading view, offices and a contact form. Navy and slate, small radii, dense but calm. For consultancies, law firms and B2B services. Use when the user asks for Consulting Firm, 咨询公司官网, consulting, corporate, professional-services, law-firm, b2b, insights, stats, contact, serif or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/ibm-plex-sans, @fontsource-variable/newsreader, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/consulting-firm-site"
  motif-item: "consulting-firm-site"
  params-hash: "7da60ddf"
---

# Consulting Firm (咨询公司官网)

A corporate site for a fictional strategy consultancy: a restrained hero, alternating practice areas, an industries grid, case results with large figures, insights that open in a reading view, offices and a contact form. Navy and slate, small radii, dense but calm. For consultancies, law firms and B2B services.

## When to use

- A corporate site for a consultancy, law firm, advisory or other B2B professional-services business: hero, practice areas, industries, results, insights with a reading view, offices and contact.
- Adapt it by editing content.ts (NAV, PRACTICES, INDUSTRIES, RESULTS, INSIGHTS, OFFICES, FOOTER_SECTIONS); the sections in sections.tsx only render that data.

## Files

- `assets/consulting-firm-site.tsx` — the component (`ConsultingFirmSite`); the tuned values are baked into its `defaults` object
- `assets/sections.tsx`
- `assets/insight-detail.tsx`
- `assets/parts.tsx`
- `assets/content.ts`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-consulting-firm-site`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/ibm-plex-sans @fontsource-variable/newsreader clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/consulting-firm-site/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/ibm-plex-sans';`, `@import '@fontsource-variable/newsreader';`, `@import '@fontsource-variable/newsreader/wght-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { ConsultingFirmSite } from '@/components/motif/consulting-firm-site/consulting-firm-site'

<ConsultingFirmSite />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `firmName` | Halden Rowe | Halden Rowe | ≤ 22 chars | Used in the nav, footer, reading view and email domain |
| `headline` | Strategy and operations advice for companies at a turning point. | Strategy and operations advice for companies at a turning point. | ≤ 90 chars | Best under 70 characters |
| `accent` | #1d3461 | #1d3461 | color | Buttons, figures, illustrations and the contents marker derive from it; text tints are darkened or lightened to stay readable |
| `grayFamily` | slate | slate | slate / gray / zinc / neutral / stone | Gray family |
| `serifHeadings` | true | true | boolean | Newsreader for headings and figures; off uses IBM Plex Sans throughout |
| `radius` | 6 | 6 | 0–12 px (best 2–10) | Corner radius |
| `density` | regular | regular | compact / regular / airy | Vertical spacing between sections |
| `dark` | false | false | boolean | Dark mode |

## Rules

- One accent (navy by default) on a single gray family. The accent fills buttons and the progress bar; text in the accent uses --brand-ink, which is darkened or lightened until it reaches 4.5:1. Do not add a second hue.
- Small radii everywhere (--r, default 6px; cards and pictures use 1.5x). Borders are 1px --line; shadows only on the hero snapshot card and the reading-view cover.
- Headings and large figures use --font-head (Newsreader when serifHeadings is on, otherwise IBM Plex Sans 700); body copy is IBM Plex Sans.
- Illustrations are SVG patterns (contour, bars, grid, rings, lines, nodes) tinted from the accent. Never add photographs, stock imagery or real client logos.
- Results are concrete and attributable: a figure, a unit, and one line saying where it was measured. No superlatives.
- Motion is minimal: a short fade-up on the hero, the mobile menu height, the reading view fade and its contents marker. Everything is instant under reduced motion.
- Keep one signature moment per page; every other section stays calm.
- Replace every placeholder text and image before shipping.
- Keep the section order meaningful: promise → proof → details → action.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from mearashadowfax/ScrewFast).
