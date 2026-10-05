---
name: motif-changelog-timeline
description: "Release notes with version and date, tags, a checklist of changes and hand-drawn wireframe art. Switch to a node rail for a more timeline feel. Made for a product changelog page. Use when the user asks for Changelog Timeline, 更新日志时间线, changelog, timeline, release notes, product updates or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/geist-mono, @fontsource-variable/space-grotesk, @fontsource/instrument-serif, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/changelog-timeline"
  motif-item: "changelog-timeline"
  params-hash: "3e6392ee"
---

# Changelog Timeline (更新日志时间线)

Release notes with version and date, tags, a checklist of changes and hand-drawn wireframe art. Switch to a node rail for a more timeline feel. Made for a product changelog page.

## When to use

- Use for a product changelog or release-notes page. Entries are plain data (version, date, tags, notes); replace the ENTRIES array with real releases.

## Files

- `assets/changelog-timeline.tsx` — the component (`ChangelogTimeline`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-changelog-timeline`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource-variable/space-grotesk @fontsource/instrument-serif clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/changelog-timeline/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/geist-mono';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';`, `@import '@fontsource-variable/space-grotesk';` to the global stylesheet.
4. Use it:

```tsx
import { ChangelogTimeline } from '@/components/motif/changelog-timeline/changelog-timeline'

<ChangelogTimeline />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #7c8cff | #7c8cff | color | Accent |
| `font` | serif | serif | serif / sans / grotesk | Heading font |
| `layout` | split | split | split / rail | Layout |
| `entries` | 4 | 4 | 2–5 | Entries |
| `heading` | What’s new in Halcyon | What’s new in Halcyon | ≤ 36 chars | Heading |
| `subheading` | Release notes for every shipped change, newest first. | Release notes for every shipped change, newest first. | ≤ 90 chars | Subheading |
| `showVisuals` | true | true | boolean | Show illustrations |
| `animate` | true | true | boolean | Entrance animation |

## Rules

- Keep the illustrations abstract wireframes. Never ship screenshots or real product logos inside a changelog entry template.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from moumen-soliman/uitripled).
