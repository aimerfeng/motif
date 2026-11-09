---
name: motif-sidebar-calendar-lists
description: "A calendar app's side panel: an account row on top, a month grid date picker, collapsible groups of calendars with colored check toggles and a New Calendar button at the bottom. For scheduling, booking and planner apps. Use when the user asks for Calendar App Sidebar, 日历应用侧栏, sidebar, calendar, date picker, scheduling, collapsible, app shell, shadcn or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/sidebar-calendar-lists"
  motif-item: "sidebar-calendar-lists"
  params-hash: "0447b793"
---

# Calendar App Sidebar (日历应用侧栏)

A calendar app's side panel: an account row on top, a month grid date picker, collapsible groups of calendars with colored check toggles and a New Calendar button at the bottom. For scheduling, booking and planner apps.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/sidebar-calendar-lists.tsx` — the component (`CalendarSidebar`); the tuned values are baked into its `defaults` object
- `assets/sidebar-calendar-lists.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-sidebar-calendar-lists`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/sidebar-calendar-lists/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { CalendarSidebar } from '@/components/motif/sidebar-calendar-lists/sidebar-calendar-lists'

<CalendarSidebar />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `side` | left | left | left / right | Side |
| `width` | 256 | 256 | 240–320 px (best 248–296) | Width |
| `weekStart` | sunday | sunday | sunday / monday | Week starts on |
| `showWeekNumbers` | false | false | boolean | Week numbers |
| `accent` | #2563eb | #2563eb | color | Selected day and avatar fill; the ink picks white or near-black by contrast |
| `calendarPalette` | #2563eb, #16a34a, #f59e0b, #e11d48 | #2563eb, #16a34a, #f59e0b, #e11d48 | 1–6 colors | Cycled across the calendars in order |
| `radius` | 10 | 10 | 4–16 px (best 6–14) | Radius |

## Rules

- CalendarSidebar is the whole app shell: pass page content as children and put a SidebarTrigger in your header; below 768px container width the sidebar becomes a slide-in sheet.
- The selected day is a "YYYY-MM-DD" string: control it with `selected` + `onSelectedChange`, and pass `today` when the server and client may disagree on the date.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from shadcn-ui/ui).
