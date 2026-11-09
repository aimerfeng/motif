---
name: motif-workflow-node-canvas
description: "Trigger, action and condition nodes on a dotted canvas joined by curves; dragging a node drags its connections along, and new nodes link to the last one. For automation and integration product pages. Use when the user asks for Workflow Builder Canvas, 工作流编排画布, workflow, nodes, automation, canvas, drag, integrations or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/workflow-node-canvas"
  motif-item: "workflow-node-canvas"
  params-hash: "982ea0da"
---

# Workflow Builder Canvas (工作流编排画布)

Trigger, action and condition nodes on a dotted canvas joined by curves; dragging a node drags its connections along, and new nodes link to the last one. For automation and integration product pages.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/workflow-node-canvas.tsx` — the component (`WorkflowNodeCanvas`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-workflow-node-canvas`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/workflow-node-canvas/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { WorkflowNodeCanvas } from '@/components/motif/workflow-node-canvas/workflow-node-canvas'

<WorkflowNodeCanvas />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #34d399 | #34d399 | color | Accent |
| `nodePalette` | spectrum | spectrum | spectrum / accent | Node colors |
| `curveStyle` | bezier | bezier | bezier / step / straight | Connection shape |
| `gridStyle` | dots | dots | dots / lines / none | Canvas grid |
| `flowDash` | true | true | boolean | Flowing dashes |
| `snapToGrid` | false | false | boolean | Snap to grid |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from moumen-soliman/uitripled).
