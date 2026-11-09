---
name: motif-ai-agent-steps
description: "A vertical timeline that grows as an agent works: each step spins, then turns into a check, and expands to show its sub-steps. Tool calls render as cards with a status badge (Processing, Ready, Completed, Error) and colored JSON input and output. For agentic copilots, coding agents and automation builders. Use when the user asks for Agent Run Steps, 智能体执行步骤, ai, agent, steps, tool-call, timeline, chat, collapsible, chain-of-thought or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/ai-agent-steps"
  motif-item: "ai-agent-steps"
  params-hash: "2b9dedb5"
---

# Agent Run Steps (智能体执行步骤)

A vertical timeline that grows as an agent works: each step spins, then turns into a check, and expands to show its sub-steps. Tool calls render as cards with a status badge (Processing, Ready, Completed, Error) and colored JSON input and output. For agentic copilots, coding agents and automation builders.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/ai-agent-steps.tsx` — the component (`AgentRunSteps`); the tuned values are baked into its `defaults` object
- `assets/ai-agent-steps.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-ai-agent-steps`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/ai-agent-steps/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { AgentRunSteps } from '@/components/motif/ai-agent-steps/ai-agent-steps'

<AgentRunSteps />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #a78bfa | #a78bfa | color | Spinner, check marks and the connector |
| `iconStyle` | status | status | status / topic / dot | Step icons |
| `connector` | line | line | line / dashed / none | Connector |
| `radius` | 10 | 10 | 0–18 px (best 4–14) | Tool card radius |
| `showToolPayload` | true | true | boolean | Show tool payloads |
| `collapseDone` | true | true | boolean | Collapse finished steps |
| `stepInterval` | 1.6 | 1.6 | 0.8–3 s (best 1.2–2.4) | Demo only: roughly how long each step runs |

## Rules

- Pass the run as steps: each has an id, a title, a status (pending, running, done, error), optional items (sub-steps) and tools (ToolPart with state input-streaming, input-available, output-available or output-error). Re-render with new steps as the agent reports progress.
- With collapseDone the running step stays open and finished steps fold; a user toggle sticks until that step changes status.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from ibelick/prompt-kit).
