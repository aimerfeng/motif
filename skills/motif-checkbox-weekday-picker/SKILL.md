---
name: motif-checkbox-weekday-picker
description: "A row of day toggles: picked days fill with the accent, unavailable ones dim, and a summary line reads \"Weekdays\" or \"Every Mon, Wed\". Made for alarms, recurring meetings and delivery windows. Use when the user asks for Weekday Picker, 星期选择器, weekday, checkbox, recurring, schedule, days, form, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/checkbox-weekday-picker"
  motif-item: "checkbox-weekday-picker"
  params-hash: "55ca3893"
---

# Weekday Picker (星期选择器)

A row of day toggles: picked days fill with the accent, unavailable ones dim, and a summary line reads "Weekdays" or "Every Mon, Wed". Made for alarms, recurring meetings and delivery windows.

## When to use

- Use to pick any number of days for a weekly recurrence: alarms, classes, delivery days, meeting repeats. For a single calendar date use a date picker; for exactly one of a few options use a segmented control.

## Files

- `assets/checkbox-weekday-picker.tsx` — the component (`WeekdayPicker`); the tuned values are baked into its `defaults` object
- `assets/checkbox-weekday-picker.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-checkbox-weekday-picker`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/checkbox-weekday-picker/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { WeekdayPicker } from '@/components/motif/checkbox-weekday-picker/checkbox-weekday-picker'

<WeekdayPicker />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `shape` | circle | circle | circle / squircle / square | Shape |
| `accent` | #2b68ef | #2b68ef | color | Fill of the picked days; the letters use white or near-black, whichever contrasts more (4.5:1 or better on any color) |
| `connect` | false | false | boolean | Back-to-back picked days merge into one bar |
| `labelStyle` | initial | initial | initial / short | Short names stretch circles into pills and fall back to initials when space runs out |
| `size` | 40 | 40 | 30–52 px (best 34–46) | Largest size; in a narrow container the whole row scales down to fit |
| `gap` | 8 | 8 | 2–14 px (best 4–10) | Gap |
| `firstDay` | monday | monday | monday / sunday / saturday | Week starts on |
| `locale` | en | en | en / zh / ja / de / fr | Day names and the wording of the summary |
| `showSummary` | true | true | boolean | A line below that reads "Weekdays" or "Every Mon, Wed", announced to screen readers |

## Rules

- Values are ISO weekday numbers (1 = Monday … 7 = Sunday), always sorted ascending whatever firstDay is.
- Controlled: value + onValueChange. Uncontrolled: defaultValue. Days that cannot be picked go in unavailable; they render dashed and dimmed, are never part of the value and the summary ignores them.
- Each day is a native checkbox labelled with the full day name (Tab moves, Space toggles); the summary is an aria-live region that also describes the group.
- Set locale to the UI language and firstDay to the user region (Sunday in the US, Monday in most of Europe and China). Pass label to rename the group heading, hideLabel when a visible heading already exists.
- Keep the accent one solid color; the letters on picked days use white or near-black, whichever has the higher contrast, so they clear WCAG AA (4.5:1) on any accent.
- The row scales down to fit its container (to 28px per day, about 250px for the whole row), so it works in a phone-width form; short labels fall back to initials when a day gets too narrow for them.
- Import checkbox-weekday-picker.css once; it holds the ripple and the summary fade.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from origin-space/originui).
