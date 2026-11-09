---
name: motif-notification-action-cards
description: "Floating notification cards for real events: message sent with View / Undo, a file-share invite with Accept / Decline, an event reminder with Notify me, a version update with Install / Later; an optional bar counts down the auto-dismiss and pauses on hover. Made for app-level notifications. Use when the user asks for Actionable Notifications, 可操作通知卡片, notification, toast, actions, countdown, undo, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/notification-action-cards"
  motif-item: "notification-action-cards"
  params-hash: "8914f702"
---

# Actionable Notifications (可操作通知卡片)

Floating notification cards for real events: message sent with View / Undo, a file-share invite with Accept / Decline, an event reminder with Notify me, a version update with Install / Later; an optional bar counts down the auto-dismiss and pauses on hover. Made for app-level notifications.

## When to use

- Brief confirmation of an action the user just took, or a non-blocking error.

## Files

- `assets/notification-action-cards.tsx` — the component (`NotificationActionCard`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-notification-action-cards`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/notification-action-cards/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { NotificationActionCard } from '@/components/motif/notification-action-cards/notification-action-cards'

<NotificationActionCard />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `type` | update | update | message / invite / reminder / update / action | Type |
| `showProgress` | true | true | boolean | Countdown bar |
| `duration` | 5 | 5 | 2–12 s (best 4–8) | Duration |
| `position` | bottom-right | bottom-right | bottom-right / bottom-left / bottom-center / top-right / top-left / top-center | Position |
| `tone` | success | success | success / info / warning / error | Icon and countdown bar color |
| `elevation` | raised | raised | flat / raised / floating | Elevation |
| `radius` | 6 | 6 | 0–20 px (best 4–14) | Corner radius |

## Rules

- Mount it inside a position: relative container (or give it className="fixed") — it pins itself to the chosen corner.
- Keep the pause-on-hover/focus and the close button: they are what makes the auto-dismiss accessible. Under reduced motion the countdown is frozen and the card stays until closed.
- Keep messages short and use the same verb as the action.
- Toasts that contain actions must stay until dismissed and be reachable by keyboard.
- Respect `prefers-reduced-motion`: this component already switches to simple crossfades when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
