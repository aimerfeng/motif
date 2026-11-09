---
name: motif-style-raw-web
description: "The brutalist web, on purpose: a serif or mono, underlined blue links that turn purple once visited, grey bevelled table borders, hr rules, no radius, no shadows and buttons that look like bare form controls. The structure is the design. For manifestos, personal sites, art and indie projects. Use when the user asks for Raw Web, 原生网页粗野派, brutalist web, raw html, web 1.0, hypertext, personal site, manifesto, default styles, design system or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/ibm-plex-sans, @fontsource-variable/newsreader, @fontsource/ibm-plex-mono, @fontsource/vt323, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/style-raw-web"
  motif-item: "style-raw-web"
  params-hash: "deb047b8"
---

# Raw Web (原生网页粗野派)

The brutalist web, on purpose: a serif or mono, underlined blue links that turn purple once visited, grey bevelled table borders, hr rules, no radius, no shadows and buttons that look like bare form controls. The structure is the design. For manifestos, personal sites, art and indie projects.

## When to use

- Use for manifestos, personal home pages, artist and writer sites, indie software pages, zines, reading lists, changelogs and any project that wants to look hand-written and permanent rather than marketed.
- Avoid for products that must look polished or trustworthy to a mainstream audience (banking, healthcare, enterprise sales); the bareness is the message.

## Files

- `assets/style-raw-web.tsx` — the component (`RawWeb`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-style-raw-web`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/ibm-plex-sans @fontsource-variable/newsreader @fontsource/ibm-plex-mono @fontsource/vt323 clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/style-raw-web/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/newsreader';`, `@import '@fontsource-variable/newsreader/wght-italic.css';`, `@import '@fontsource-variable/ibm-plex-sans';`, `@import '@fontsource/ibm-plex-mono/400.css';`, `@import '@fontsource/ibm-plex-mono/500.css';`, `@import '@fontsource/ibm-plex-mono/700.css';`, `@import '@fontsource/vt323/400.css';` to the global stylesheet.
4. Use it:

```tsx
import { RawWeb } from '@/components/motif/style-raw-web/style-raw-web'

<RawWeb />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `font` | serif | serif | serif / sans / mono / split | One family for the whole page; code, dates and the meta line are always mono |
| `textSize` | 18 | 18 | 16–20 px (best 17–19) | Size of serif body text; the sans and mono have larger faces and are set 8% and 14% smaller so they read the same. Headings follow the browser default ratios (h1 is 2.25×) |
| `ground` | #ffffff | #ffffff | color | Text picks black or white by contrast; rules, button faces and bevel edges are derived from it. Mid tones such as #808080 leave no room for coloured links, so they are lifted to a light tint or dropped to a dark one, keeping the hue |
| `linkColor` | #0000ee | #0000ee | color | Pushed toward the text colour until it reaches 4.5:1 on the ground |
| `visitedColor` | #551a8b | #551a8b | color | Visited link |
| `borderStyle` | bevel | bevel | bevel / solid / double / dashed | One style for tables, rules, the column divider, fieldsets and code; bevel also raises buttons and sinks fields |
| `maxWidth` | 1000 | 1000 | 560–1280 px (best 640–1120) | Maximum width of the page column; below about 800px the sidebar drops under the main text |
| `density` | 1 | 1 | 0.8–1.3 x (best 0.9–1.2) | Paragraph spacing, line height and table cell padding |

## Rules

- The structure is the design. Write semantic HTML (h1 to h6, p, ul, ol, dl, table, hr, fieldset, details, address) and style the elements, not classes. Besides controls, a page needs only a page column, an optional sidebar split, an inline nav list and a meta line.
- Colour: one ground (white by default) and pure black or pure white ink chosen by contrast. Keep the ground near white, a light grey such as #c0c0c0, or near black. On a mid tone (relative luminance between 0.05 and 0.45, e.g. #808080, #ff0000, #2b6cb0) no coloured link can reach 4.5:1, so lift such a ground to a light tint or drop it to a dark one, keeping its hue.
- Links are blue (#0000ee) and visited links purple (#551a8b); any link colour is pushed toward the ink until it reaches 4.5:1 on the ground. A link turns red while pressed, or blue when the link or visited colour is already close to red, so the pressed state always shows. Rules are the ground mixed 45% toward the ink and muted text 64% (pushed further until it reaches 4.5:1). The button face is the ground 7% toward the ink on a near-white page, the ground itself on a light grey page and the ground 10% toward white on a dark page. A yellow mark highlight is the only other colour, apart from 88x31 badges.
- Links are always underlined (1px, offset 0.16em, 2px on hover) and always look like links: never turn a text link into a pill or a button. Navigation is an inline list of links separated by vertical bars. The current page stays a link marked aria-current="page", drawn in bold ink without the underline. No hamburger menus.
- Type: one family at browser-default ratios. Body 16 to 20px for a serif at line height about 1.5; set a sans about 8% and a mono about 14% smaller so they read at the same size. h1 2.25em, h2 1.5em, h3 1.17em, all bold 700, sentence case, almost no tracking. A name or title in the header may go up to 3.2em, nothing bigger. Code, dates, file sizes and the meta line are mono. Buttons, labels and fields use a plain UI face like native controls, at 0.84em (0.9em when it is also the body face): IBM Plex Sans beside serif or sans text, the mono on a mono or mono-headed page.
- Borders: pick one style for the whole page. Bevel is the old browser table: an outset table edge, inset cells with 2px cellspacing, a groove hr, raised 2px buttons and sunken 2px fields. Light falls from the top left, so raised parts have their light edge top-left and sunken parts their dark edge top-left. On a near-white page both edges are darker than the ground, because a white highlight would vanish. The alternatives are 1px solid grey, 3px double or 1px dashed. Radius is always 0.
- Layout: one centred column (560 to 1280px, 16px gutters on phones) in source order; at most one sidebar, divided from the main text by a vertical rule in the border style. Sections are separated by hr and headings, never by cards, coloured bands, hero images or full-bleed backgrounds.
- Controls look like bare form controls: grey face, 1px grey border (2px bevel in bevel mode), no radius. The default button has an extra 1px ink frame. Keyboard focus must visibly change every control, the default button included: buttons get a 2px ink ring plus a dotted inner rectangle, links a 2px dotted outline, fields a 2px link-coloured outline. Use native checkboxes, radios, select and details with accent-color set to the link colour. Always show a visible label above a field, and group radios or related checkboxes in a fieldset with a visible legend.
- Tables are for data: header cells on the button-face grey, text left-aligned, numbers right-aligned with tabular figures. Wrap wide tables in a horizontal scroller so the page itself never scrolls sideways at 360px.
- Ornament is period-correct and rare: a last-modified line, a visitor counter (read out once: the digits are aria-hidden behind one text label), a webring line, a row of 88x31 badges in VT323 with invented labels. Never real brand badges, animated GIFs or under-construction signs.
- Motion: almost none. Underlines thicken on hover, button faces change in 60ms or less, and only live data (a counter, a clock) changes on its own. Respect prefers-reduced-motion.
- Forbidden: rounded corners, drop shadows, gradients, blur or glass, icon fonts, decorative illustrations, links without underlines, more than one border style per page, placeholder-only labels.
- Apply the tokens everywhere; do not mix in components from another style.
- Keep text contrast accessible even when the style is loud.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.
