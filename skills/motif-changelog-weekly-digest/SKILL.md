---
name: motif-changelog-weekly-digest
description: "A dense changelog grouped by week under sticky week headers. Every change is one row with a type glyph, a one-line summary, an area tag and the author’s initials; minor fixes fold into an expandable bundle and a filter row narrows by type. For fast-shipping products that have outgrown card timelines. Use when the user asks for Weekly Changelog Digest, 按周汇总的更新日志, changelog, release notes, weekly, digest, filter, sticky header, product updates or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/geist-mono, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/changelog-weekly-digest"
  motif-item: "changelog-weekly-digest"
  params-hash: "30ad3304"
---

# Weekly Changelog Digest (按周汇总的更新日志)

A dense changelog grouped by week under sticky week headers. Every change is one row with a type glyph, a one-line summary, an area tag and the author’s initials; minor fixes fold into an expandable bundle and a filter row narrows by type. For fast-shipping products that have outgrown card timelines.

## When to use

- Use for a high-volume changelog page where releases ship several times a week. Replace the WEEKS array with real entries: one row per change (type, summary, area, day, author) and a separate minor list per week.
- The filter and the fold state can be controlled with filter / onFilterChange and expanded / onExpandedChange, for example to sync the filter with the URL.

## Files

- `assets/changelog-weekly-digest.tsx` — the component (`ChangelogWeeklyDigest`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-changelog-weekly-digest`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/geist-mono clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/changelog-weekly-digest/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/geist-mono';` to the global stylesheet.
4. Use it:

```tsx
import { ChangelogWeeklyDigest } from '@/components/motif/changelog-weekly-digest/changelog-weekly-digest'

<ChangelogWeeklyDigest />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #b4f05a | #b4f05a | color | New-feature glyphs, the this-week marker and the active filter |
| `filterStyle` | segmented | segmented | segmented / pills / underline | Filter style |
| `radius` | 10 | 10 | 0–16 px (best 6–14) | Corner radius |
| `density` | cozy | cozy | compact / cozy / roomy | Density |
| `weeks` | 4 | 4 | 2–4 | Weeks shown |
| `showAuthors` | true | true | boolean | Show authors |
| `collapseMinor` | true | true | boolean | When off, every minor fix gets its own row |
| `heading` | Shipped, week by week | Shipped, week by week | ≤ 40 chars | Heading |

## Rules

- Keep each summary to one line (under about 70 characters) and written as the user-visible outcome, not the ticket title.
- Only three change types: new, improved, fixed. Typos, copy tweaks and one-pixel fixes go in the minor list, never as headline rows.
- Week headers must stay sticky inside the page scroll container; do not wrap the list in an element with overflow hidden.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.
