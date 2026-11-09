---
name: motif-banner-announcement
description: "Slim top bars for news: an icon, a message with a Learn more link whose arrow nudges on hover, an optional New badge and buttons, a subscribe link, an update variant whose button turns into Updating… with a spinner, and a dismiss button. Made for product announcements, release notes and maintenance notices. Use when the user asks for Announcement Bar, 公告栏, banner, announcement, notice, release, topbar or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/banner-announcement"
  motif-item: "banner-announcement"
  params-hash: "62fc8781"
---

# Announcement Bar (公告栏)

Slim top bars for news: an icon, a message with a Learn more link whose arrow nudges on hover, an optional New badge and buttons, a subscribe link, an update variant whose button turns into Updating… with a spinner, and a dismiss button. Made for product announcements, release notes and maintenance notices.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/banner-announcement.tsx` — the component (`AnnouncementBar`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-banner-announcement`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/banner-announcement/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { AnnouncementBar } from '@/components/motif/banner-announcement/banner-announcement'

<AnnouncementBar />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | buttons | buttons | link / inline / learn / buttons / pill / feature / subscribe / update | Variant |
| `message` | It‘s live and ready to use! Start exploring the latest addition to your toolkit. | It‘s live and ready to use! Start exploring the latest addition to your toolkit. | ≤ 110 chars | Message |
| `badgeLabel` |  |  | ≤ 12 chars | Leave empty to hide |
| `align` | start | start | start / center | Align |
| `theme` | dark | dark | dark / light / accent | Theme |
| `dismissible` | true | true | boolean | Dismissible |
| `accent` | #f4f4f5 | #f4f4f5 | color | Primary button and accent-fill background |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
