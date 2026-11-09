---
name: motif-contact-routing-form
description: "A “How can we help?” block that routes before it asks: pick Sales, Support, Press or Partnerships and the form below reshapes into the fields that team needs, easing in and out, with who picks it up, how fast they reply and a faster alternative channel. For company contact pages that triage inbound requests. Use when the user asks for Routed Contact Form, 按需分流的联系表单, contact, form, routing, triage, support, sales, conditional fields, radio cards or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/bricolage-grotesque, @fontsource-variable/geist, @fontsource-variable/geist-mono, @fontsource-variable/inter-tight, @fontsource/instrument-serif, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/contact-routing-form"
  motif-item: "contact-routing-form"
  params-hash: "8c94c292"
---

# Routed Contact Form (按需分流的联系表单)

A “How can we help?” block that routes before it asks: pick Sales, Support, Press or Partnerships and the form below reshapes into the fields that team needs, easing in and out, with who picks it up, how fast they reply and a faster alternative channel. For company contact pages that triage inbound requests.

## When to use

- The main block of a company contact page where inbound mail splits across teams (sales, support, press, partnerships). Swap the TOPICS table for your own teams, people, response times and fallback channels (alt.href holds placeholder #anchors; point them at your booking page, status page, press kit and partner guide).
- Wire delivery with onSubmit(topic, formData): it runs after native validation passes, and formData carries every field by name plus a hidden topic field. Return a promise to show a sending state; the confirmation appears when it resolves, and a rejection keeps the form filled with an inline error. Without onSubmit nothing leaves the page and the confirmation shows locally.

## Files

- `assets/contact-routing-form.tsx` — the component (`ContactRoutingForm`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-contact-routing-form`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/bricolage-grotesque @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource-variable/inter-tight @fontsource/instrument-serif clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/contact-routing-form/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/geist-mono';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';`, `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource-variable/bricolage-grotesque';` to the global stylesheet.
4. Use it:

```tsx
import { ContactRoutingForm } from '@/components/motif/contact-routing-form/contact-routing-form'

<ContactRoutingForm />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `heading` | How can we help? | How can we help? | ≤ 48 chars | Heading |
| `accent` | #ff8a4c | #ff8a4c | color | Button ink follows the accent’s luminance; accents that are too dark or too light are nudged until they read |
| `tone` | dark | dark | dark / light | Tone |
| `font` | serif | serif | serif / sans / grotesk | Heading font |
| `layout` | split | split | split / stacked | The split layout stacks into one column in narrow containers |
| `topicStyle` | cards | cards | cards / list / tabs | Topic picker |
| `showResponseTime` | true | true | boolean | Show response time |
| `radius` | 14 | 14 | 0–24 px (best 4–20) | Corner radius |

## Rules

- Route first, ask second: each topic lists only the rows its team needs in TOPICS[i].rows, and the row() switch renders each row key. Rows shared between topics (identity, message) keep their key so typed text survives a topic switch; only the rows that differ ease in and out.
- Every topic states who picks it up, how fast they reply and one faster alternative (call, status page, press kit, partner guide). Keep response times honest and specific; for support, the selected severity changes the promise.
- The topic picker is a radiogroup with a roving tab stop (arrow keys, Home, End). Chip and severity choices are native radio inputs, so keep them as inputs if you restyle.
- Pass topic and onTopicChange to control the picker from outside, for example to preselect Support from a ?topic= link.
- Accent colours only move along OKLCH lightness (hue and as much chroma as fits are kept): fills reach 3:1 against the page, card and footer surfaces, the button ink is white or near-black and reaches 4.5:1 on the fill, and accent text reaches 4.6:1 on every surface it sits on, including the tinted selected row. Any accent reads in both tones and still looks like the colour that was picked.
- Focus is handled for keyboard and screen-reader users: buttons show a focus-visible outline, a successful send moves focus to the confirmation heading (described by its body text), and Send another returns focus to the first field. Keep these if you restyle the confirmation.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.
