---
name: motif-style-corporate
description: "Dependable enterprise UI: grey neutrals and one trustworthy blue, 4px radii, dense zebra-striped data tables, clear field validation states, breadcrumb page headers and a dark business mode. For B2B products, finance, HR and internal tools. Use when the user asks for Corporate, 企业商务, corporate, enterprise, b2b, admin, data table, forms, business, daisyui corporate or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/geist-mono, @fontsource-variable/ibm-plex-sans, @fontsource-variable/inter-tight, @fontsource-variable/jetbrains-mono, @fontsource-variable/plus-jakarta-sans, @fontsource/ibm-plex-mono, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/style-corporate"
  motif-item: "style-corporate"
  params-hash: "a4b6dd0c"
---

# Corporate (企业商务)

Dependable enterprise UI: grey neutrals and one trustworthy blue, 4px radii, dense zebra-striped data tables, clear field validation states, breadcrumb page headers and a dark business mode. For B2B products, finance, HR and internal tools.

## When to use

- Use for B2B products, finance and accounting, HR and payroll, procurement, CRMs, admin consoles and internal tools where people scan tables and fill forms all day.
- Avoid for marketing-led consumer brands, editorial pages or anything that should feel expressive; the style is deliberately calm and predictable.

## Files

- `assets/style-corporate.tsx` — the component (`StyleCorporate`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-style-corporate`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource-variable/ibm-plex-sans @fontsource-variable/inter-tight @fontsource-variable/jetbrains-mono @fontsource-variable/plus-jakarta-sans @fontsource/ibm-plex-mono clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/style-corporate/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/ibm-plex-sans';`, `@import '@fontsource/ibm-plex-mono/400.css';`, `@import '@fontsource/ibm-plex-mono/500.css';`, `@import '@fontsource/ibm-plex-mono/700.css';`, `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/geist-mono';`, `@import '@fontsource-variable/plus-jakarta-sans';`, `@import '@fontsource-variable/jetbrains-mono';` to the global stylesheet.
4. Use it:

```tsx
import { StyleCorporate } from '@/components/motif/style-corporate/style-corporate'

<StyleCorporate />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #0082ce | #0082ce | color | Primary buttons, links, selected rows and toggles; dark mode uses a deeper shade |
| `grayTone` | neutral | neutral | neutral / slate / stone | Grey tone |
| `radius` | 4 | 4 | 0–8 px (best 2–6) | Radius |
| `borderEmphasis` | 1 | 1 | 0.6–2 (best 0.8–1.6) | Strength of table rules, card and field borders |
| `density` | regular | regular | compact / regular / comfortable | Maps to daisyUI table sm / md / lg and field height |
| `tableStripes` | true | true | boolean | Zebra rows |
| `font` | plex | plex | plex / inter / geist / jakarta | Font |
| `dark` | false | false | boolean | Switches to the daisyUI business theme |

## Rules

- Palette is daisyUI corporate (light) and business (dark): base-100 is the card and field surface, base-200 the zebra row and default button, base-300 the deepest fill; the page canvas sits between base-100 and base-200. One primary blue carries every action, link, focus ring, selected row and switch. Secondary slate and accent teal are for charts and rare highlights only.
- Colour ratio: about 90% greys, 8% primary, 2% semantic colours. Semantic colours (info, success, warning, error) appear only as soft badges, soft alerts, field validation and small icons, never as large fills. Text on a semantic tint uses the darker ink variant, never the raw tone.
- Radius is 4px everywhere (0 to 8px allowed): buttons, fields, cards, badges, tabs. No pills except avatars. Borders are 1px; card borders are the base content at about 11% alpha, field borders 20%, table rules 5%. Depth is 0: no shadows on cards or buttons, separation comes from borders and the canvas tint.
- Type is one neutral sans with a matching mono. Page title 24px/600, section title 18px/600, body 14px/1.5, labels 13px/600, captions 12px muted. All numbers in tables, stats and amounts use tabular figures and are right-aligned; IDs and codes use the mono.
- Every page starts with a header: breadcrumbs (chevron separators, current page not a link), the page title with an optional badge, one line of context in muted text, and actions on the right with the single primary action last.
- Data tables: header row in muted 600 weight, no uppercase; rows separated by 5% rules; zebra rows on base-200; hover adds one step of grey; selected rows get a 8% primary tint and a checked checkbox. A tab row with counts filters the table; pagination and a "Showing 1 to 8 of 128" summary sit under it.
- Forms: label above the field, help text below. Focus draws a 2px base-content outline 2px outside the field. Invalid fields switch the border and outline to the error colour and show the reason in error ink below; valid fields use success. Disabled fields fill with base-200 and drop to 50% text.
- Buttons: primary (primary fill), default (base-200 fill), outline, ghost and error; hover darkens the fill by 7%. Height follows the density: 32, 40 or 48px. Icon-only buttons are square and need an aria-label.
- Motion is functional only: 150 to 200ms ease-out on colour, border and background; the switch thumb slides. No entrance animations, no bounce, no parallax. Respect prefers-reduced-motion.
- Forbidden: gradients, glassmorphism, coloured shadows, more than one accent hue on a screen, decorative illustrations, emoji, centred body copy in app screens, uppercase table headers.
- Apply the tokens everywhere; do not mix in components from another style.
- Keep text contrast accessible even when the style is loud.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from saadeghi/daisyui).
