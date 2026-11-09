---
name: motif-relative-time-zones
description: "A relative timestamp like \"3 hours ago\" that, on hover or focus, shows the same moment in UTC and a few cities with day/night marks; also works as an always-on world clock list. For logs, deploys and distributed teams. Use when the user asks for Timestamp with Time Zones, 多时区时间戳, time, timezone, timestamp, clock, popover, relative-time or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/relative-time-zones"
  motif-item: "relative-time-zones"
  params-hash: "60aa528f"
---

# Timestamp with Time Zones (多时区时间戳)

A relative timestamp like "3 hours ago" that, on hover or focus, shows the same moment in UTC and a few cities with day/night marks; also works as an always-on world clock list. For logs, deploys and distributed teams.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/relative-time-zones.tsx` — the component (`RelativeTimeZones`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-relative-time-zones`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/relative-time-zones/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { RelativeTimeZones } from '@/components/motif/relative-time-zones/relative-time-zones'

<RelativeTimeZones />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `variant` | popover | popover | popover / list | Variant |
| `zones` | team | team | team / americas / apac | Zones |
| `hour12` | false | false | boolean | 12-hour clock |
| `showSeconds` | true | true | boolean | Show seconds |
| `showDayNight` | true | true | boolean | Day/night marks |
| `accent` | #38bdf8 | #38bdf8 | color | Used for the underline and the sun icon |
| `radius` | 10 | 10 | 0–20 px (best 6–16) | Corner radius |

## Rules

- Pass `date` (the event moment) for the popover variant; pass `time` to control "now", or omit it to tick live once per second.
- Use `zoneList` for custom zones (IANA names). The compound parts (RelativeTime, RelativeTimeZone, RelativeTimeZoneLabel/Date/Display) are exported for custom layouts.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from shadcnblocks/kibo).
