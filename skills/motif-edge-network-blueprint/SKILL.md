---
name: motif-edge-network-blueprint
description: "A site for a fictional edge network drawn as a set of cyanotype engineering sheets: a hero request-path diagram with packets running between users, edge PoPs and the origin, a live metrics ticker, detail drawings, a latency map that zooms by region, usage pricing as a bill of materials and a config-file docs teaser, all with dimension lines. For infrastructure, API and developer-platform products. Use when the user asks for Blueprint Infra Site, 蓝图风基础设施官网, infrastructure, edge, cdn, blueprint, developer, api, diagram, map, pricing, technical or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/geist, @fontsource-variable/geist-mono, @fontsource-variable/ibm-plex-sans, @fontsource-variable/jetbrains-mono, @fontsource-variable/space-grotesk, @fontsource/ibm-plex-mono, clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/edge-network-blueprint"
  motif-item: "edge-network-blueprint"
  params-hash: "55962b77"
---

# Blueprint Infra Site (蓝图风基础设施官网)

A site for a fictional edge network drawn as a set of cyanotype engineering sheets: a hero request-path diagram with packets running between users, edge PoPs and the origin, a live metrics ticker, detail drawings, a latency map that zooms by region, usage pricing as a bill of materials and a config-file docs teaser, all with dimension lines. For infrastructure, API and developer-platform products.

## When to use

- A marketing site for infrastructure, CDN, API or developer-platform products, drawn as a set of engineering sheets: header, request-path hero, live metrics ticker, detail drawings, region latency map, usage pricing, config docs teaser, closing call to action and a title-block footer.
- Replace the request path in topology.tsx with your own architecture (it is plain geometry: nodes, polylines and dimension lines), and the cities in world.ts with your own regions and medians.

## Files

- `assets/edge-network-blueprint.tsx` — the component (`EdgeNetworkBlueprint`); the tuned values are baked into its `defaults` object
- `assets/sections.tsx`
- `assets/topology.tsx`
- `assets/network-map.tsx`
- `assets/details.tsx`
- `assets/parts.tsx`
- `assets/theme.ts`
- `assets/world.ts`
- `assets/edge-network-blueprint.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-edge-network-blueprint`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/geist @fontsource-variable/geist-mono @fontsource-variable/ibm-plex-sans @fontsource-variable/jetbrains-mono @fontsource-variable/space-grotesk @fontsource/ibm-plex-mono clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/edge-network-blueprint/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/space-grotesk';`, `@import '@fontsource-variable/jetbrains-mono';`, `@import '@fontsource-variable/ibm-plex-sans';`, `@import '@fontsource/ibm-plex-mono/400.css';`, `@import '@fontsource/ibm-plex-mono/500.css';`, `@import '@fontsource/ibm-plex-mono/700.css';`, `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/geist-mono';` to the global stylesheet.
4. Use it:

```tsx
import { EdgeNetworkBlueprint } from '@/components/motif/edge-network-blueprint/edge-network-blueprint'

<EdgeNetworkBlueprint />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `brandName` | Keelson | Keelson | ≤ 18 chars | Also names the CLI and the config file |
| `headline` | Serve every request from the city it came from | Serve every request from the city it came from | ≤ 80 chars | Best under 50 characters |
| `paper` | #1b4a85 | #1b4a85 | color | The sheet color: deep for a blueprint, pale for a whiteprint. Mid-tones leave too little contrast, so soft and muted text end up almost as strong as the ink |
| `lineColor` | #eaf1ff | #eaf1ff | color | Shared by line work and text. Below 7:1 against the paper it is pushed toward white or black, keeping its hue; if that is not enough it switches to a light or dark ink |
| `gridSize` | 24 | 24 | 12–40 px (best 16–32) | Every fifth line is heavier |
| `fontPairing` | drafting | drafting | drafting / plex / geist / plotter | Font pairing |
| `showDimensions` | true | true | boolean | Dimension callouts on the request path, the detail drawings and the latency table |
| `packetSpeed` | 1 | 1 | 0.3–2.5 x (best 0.6–1.6) | Packets on the request path and pulses on the map |

## Rules

- Two colors only: paper and ink. Every tone (soft text, muted text, rules, hairlines, grid) is the ink at a lower strength, and muted text never drops below 4.5:1 on the paper or on the tinted panels. Do not add an accent color.
- Everything is line work: 1–1.5px strokes, square corners, no shadows, no gradients except the faint darkening at the edges of the hero sheet. Fills are paper (to knock out lines) or solid ink (primary buttons, the active region filter and response packets).
- Each section is a sheet with a hairline frame, corner registration crosses and a drawing number in the corner. Sheet numbers follow the page order; do not number things that are not a sequence.
- Dimension lines carry real numbers (latency, cold start, counts). Never use them as decoration without a value, and keep their labels in the mono face, uppercase.
- Labels and data use the mono face; headings and body use the display/body face from the font pairing. Numbers use tabular figures.
- Motion explains the system: packets travel the request path, cache misses take the dashed backhaul, the ticker updates twice a second. Under reduced motion everything stops on a representative frame.
- Copy is concrete and technical: real-sounding latencies, prices per unit, file names and CLI commands. No "blazing fast", no "unlock", no invented customer logos.
- Keep one signature moment per page; every other section stays calm.
- Replace every placeholder text and image before shipping.
- Keep the section order meaningful: promise → proof → details → action.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.
