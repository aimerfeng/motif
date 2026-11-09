---
name: motif-navbar-service-status
description: "A console header with Overview / Graphs / Backups tabs and status pills for online, uptime and latency next to a power switch with on/off glyphs that dims the pills when off. Made for server, IoT device and deployment consoles. Use when the user asks for Service Status Header, 服务状态顶栏, navbar, header, status, badge, switch, console, dashboard or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/navbar-service-status"
  motif-item: "navbar-service-status"
  params-hash: "84848bfe"
---

# Service Status Header (服务状态顶栏)

A console header with Overview / Graphs / Backups tabs and status pills for online, uptime and latency next to a power switch with on/off glyphs that dims the pills when off. Made for server, IoT device and deployment consoles.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/navbar-service-status.tsx` — the component (`NavbarServiceStatus`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-navbar-service-status`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/navbar-service-status/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { NavbarServiceStatus } from '@/components/motif/navbar-service-status/navbar-service-status'

<NavbarServiceStatus />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `tabs` | Overview, Graphs, Backups | Overview, Graphs, Backups | ≤ 60 chars | Comma-separated, up to 5 |
| `uptime` | 99.9% | 99.9% | ≤ 8 chars | Uptime |
| `latency` | 45ms | 45ms | ≤ 8 chars | Latency |
| `showPower` | true | true | boolean | Power switch |
| `onlineColor` | #10b981 | #10b981 | color | Online dot |
| `pillStyle` | outline | outline | outline / soft / pill | Pill style |
| `height` | 64 | 64 | 48–80 px (best 56–72) | Height |
| `accent` | #18181b | #18181b | color | Accent |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
