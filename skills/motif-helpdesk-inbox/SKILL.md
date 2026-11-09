---
name: motif-helpdesk-inbox
description: "A support tool screen: a queue rail with counts and tag dots, a ticket table with status and priority badges and status filter pills, and a ticket view with the conversation, an internal-note marker and a composer that switches between Reply and Internal note. For help desks and shared inboxes. Use when the user asks for Help Desk Inbox, 客服工单收件箱, help desk, support, inbox, tickets, table, composer, app shell or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/helpdesk-inbox"
  motif-item: "helpdesk-inbox"
  params-hash: "09f60230"
---

# Help Desk Inbox (客服工单收件箱)

A support tool screen: a queue rail with counts and tag dots, a ticket table with status and priority badges and status filter pills, and a ticket view with the conversation, an internal-note marker and a composer that switches between Reply and Internal note. For help desks and shared inboxes.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/helpdesk-inbox.tsx` — the component (`HelpdeskInbox`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-helpdesk-inbox`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/helpdesk-inbox/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';` to the global stylesheet.
4. Use it:

```tsx
import { HelpdeskInbox } from '@/components/motif/helpdesk-inbox/helpdesk-inbox'

<HelpdeskInbox />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `brand` | Orbitly | Orbitly | ≤ 18 chars | Brand |
| `accent` | #4f46e5 | #4f46e5 | color | Accent |
| `view` | queue | queue | queue / ticket | Start on |
| `density` | comfortable | comfortable | compact / comfortable / spacious | Density |
| `showRail` | true | true | boolean | When off, the queues open from the menu button |
| `tone` | light | light | light / dark | Surface |

## Rules

- The inbox fills its parent (h-full): give it a fixed-height container such as h-dvh or a sized panel. Below lg the queue rail, and below xl the ticket details, become drawers.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from markmead/hyperui).
