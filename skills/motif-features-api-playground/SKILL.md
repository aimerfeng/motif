---
name: motif-features-api-playground
description: "A developer feature block with a live request builder: pick an endpoint and fill two or three parameters, the call is written out as cURL, JavaScript and Python tabs, and pressing Run refreshes a mocked JSON response with syntax colours and a latency badge. For API products, SDK launches and developer homepages. Use when the user asks for API Playground, API 试玩区, api, developer, playground, code, sdk, request, json, docs or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/geist-mono, @fontsource-variable/ibm-plex-sans, @fontsource-variable/inter-tight, @fontsource-variable/jetbrains-mono, @fontsource/ibm-plex-mono, @fontsource/instrument-serif, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/features-api-playground"
  motif-item: "features-api-playground"
  params-hash: "87438ee5"
---

# API Playground (API 试玩区)

A developer feature block with a live request builder: pick an endpoint and fill two or three parameters, the call is written out as cURL, JavaScript and Python tabs, and pressing Run refreshes a mocked JSON response with syntax colours and a latency badge. For API products, SDK launches and developer homepages.

## When to use

- Use on an API product page, an SDK launch or a developer homepage to let visitors try a call without signing up. Replace ENDPOINTS, DEFAULT_VALUES, respond() and the three code writers with your own API; the responses are mocked locally and never hit the network.

## Files

- `assets/features-api-playground.tsx` — the component (`FeaturesApiPlayground`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-features-api-playground`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource-variable/ibm-plex-sans @fontsource-variable/inter-tight @fontsource-variable/jetbrains-mono @fontsource/ibm-plex-mono @fontsource/instrument-serif clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/features-api-playground/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/geist-mono';`, `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource-variable/jetbrains-mono';`, `@import '@fontsource-variable/ibm-plex-sans';`, `@import '@fontsource/ibm-plex-mono/400.css';`, `@import '@fontsource/ibm-plex-mono/500.css';`, `@import '@fontsource/ibm-plex-mono/700.css';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';` to the global stylesheet.
4. Use it:

```tsx
import { FeaturesApiPlayground } from '@/components/motif/features-api-playground/features-api-playground'

<FeaturesApiPlayground />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #7c9cff | #7c9cff | color | Run button, selection and JSON keys; text tints adjust for contrast |
| `theme` | dark | dark | dark / light | Theme |
| `typeface` | geist | geist | geist / jetbrains / plex / editorial | Typefaces |
| `radius` | 14 | 14 | 4–20 px (best 8–16) | Corner radius |
| `layout` | columns | columns | columns / stacked / split | On narrow screens every layout stacks the panes |
| `defaultLanguage` | curl | curl | curl / javascript / python | Default language |
| `showLatency` | true | true | boolean | The millisecond badge beside the status, coloured by speed |
| `heading` | Rates, labels and tracking behind one API | Rates, labels and tracking behind one API | ≤ 64 chars | Heading |
| `subheading` | Change a parameter and press Run. Every call is written out for cURL, JavaScript and Python, and runs against a test key that never buys postage. | Change a parameter and press Run. Every call is written out for cURL, JavaScript and Python, and runs against a test key that never buys postage. | ≤ 170 chars | Subheading |

## Rules

- Keep it to three endpoints with two or three parameters each, so the builder stays one glance wide. Every parameter label is the real wire name in mono, with its type beside it.
- Mocked responses must be deterministic for the same input, including the latency, and invalid input should return a realistic 4xx error object rather than nothing.
- Show the same request in every language tab; the code is generated from the current parameters, never hand-written per state.
- Tabs follow the tablist pattern (arrow keys, Home, End), endpoints and enum values are native radio inputs, the switch has role="switch", and the response status is announced through a polite live region.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.
