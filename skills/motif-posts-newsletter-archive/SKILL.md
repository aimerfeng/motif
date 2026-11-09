---
name: motif-posts-newsletter-archive
description: "A newsletter’s back catalogue: issues listed by number and date with a one-line teaser and topic tags, a search field and year filter on top, a preview pane with the selected issue’s opening lines and contents, and a subscribe box pinned beside the list. For independent writers, company newsletters and digest products. Use when the user asks for Newsletter Archive, 电子报往期目录, newsletter, archive, issues, subscribe, search, filter, preview, email or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/fraunces, @fontsource-variable/geist, @fontsource-variable/geist-mono, @fontsource-variable/newsreader, @fontsource-variable/space-grotesk, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/posts-newsletter-archive"
  motif-item: "posts-newsletter-archive"
  params-hash: "4cbbbb73"
---

# Newsletter Archive (电子报往期目录)

A newsletter’s back catalogue: issues listed by number and date with a one-line teaser and topic tags, a search field and year filter on top, a preview pane with the selected issue’s opening lines and contents, and a subscribe box pinned beside the list. For independent writers, company newsletters and digest products.

## When to use

- Use as the archive page of a newsletter, a company letter or a digest product. Pass your own issues through the issues prop (number, ISO date, title, teaser, tags, minutes, opening, contents, optional href); they are shown newest first by number, and the year and topic filters are built from them.
- Replace the sample masthead copy with description, author, since (YYYY-MM), nextIssueDate (ISO), cadence and readers; point indexHref at the full index of older issues and rssHref at the feed (an empty string hides either).
- Selection, search, year and topic can be controlled with selected / onSelectedChange, query / onQueryChange, year / onYearChange and tag / onTagChange, for example to sync them with the URL. Wire onSubscribe to your email provider.
- With showPreview off, every row is a plain link to the issue instead of a selectable entry.

## Files

- `assets/posts-newsletter-archive.tsx` — the component (`NewsletterArchive`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-posts-newsletter-archive`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/fraunces @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource-variable/newsreader @fontsource-variable/space-grotesk clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/posts-newsletter-archive/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/geist-mono';`, `@import '@fontsource-variable/newsreader';`, `@import '@fontsource-variable/newsreader/wght-italic.css';`, `@import '@fontsource-variable/fraunces';`, `@import '@fontsource-variable/fraunces/wght-italic.css';`, `@import '@fontsource-variable/space-grotesk';` to the global stylesheet.
4. Use it:

```tsx
import { NewsletterArchive } from '@/components/motif/posts-newsletter-archive/posts-newsletter-archive'

<NewsletterArchive />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #f2a65a | #f2a65a | color | The selected issue, the drop cap, tags and the subscribe button |
| `font` | newsreader | newsreader | newsreader / fraunces / geist / grotesk | Heading font |
| `radius` | 12 | 12 | 0–20 px (best 6–16) | Corner radius |
| `layout` | split | split | split / ledger / inline | On phones the preview always opens under the selected issue |
| `showPreview` | true | true | boolean | Opening lines and contents of the selected issue |
| `showTags` | true | true | boolean | Show topic tags |
| `name` | Ledgerline | Ledgerline | ≤ 18 chars | Newsletter name |
| `heading` | Every letter, since the first one | Every letter, since the first one | ≤ 48 chars | Heading |

## Rules

- Teasers are one sentence about what the reader gets, not a summary of the whole issue. Keep them under about 110 characters.
- Use at most three topic tags per issue from a short fixed vocabulary; tags are for scanning, not SEO.
- Keep the subscribe box beside the list (sticky) on desktop; do not add a second signup form inside the list.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.
