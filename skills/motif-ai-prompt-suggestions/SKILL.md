---
name: motif-ai-prompt-suggestions
description: "The empty state under a chat composer: category pills (Summary, Code, Design, Research) that swap into full prompts with the category verb highlighted, while typing filters the list and highlights the match; arrow keys and Enter pick one. For assistant home screens and first-run onboarding. Use when the user asks for Prompt Suggestions, 提示词建议, ai, chat, prompt, suggestions, autocomplete, empty state, composer or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/ai-prompt-suggestions"
  motif-item: "ai-prompt-suggestions"
  params-hash: "f9808d67"
---

# Prompt Suggestions (提示词建议)

The empty state under a chat composer: category pills (Summary, Code, Design, Research) that swap into full prompts with the category verb highlighted, while typing filters the list and highlights the match; arrow keys and Enter pick one. For assistant home screens and first-run onboarding.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/ai-prompt-suggestions.tsx` — the component (`PromptSuggestions`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-ai-prompt-suggestions`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/ai-prompt-suggestions/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { PromptSuggestions } from '@/components/motif/ai-prompt-suggestions/ai-prompt-suggestions'

<PromptSuggestions />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #a5b4fc | #a5b4fc | color | Highlighted words and the send button |
| `highlightStyle` | text | text | text / mark / underline | Highlight style |
| `radius` | 24 | 24 | 8–28 px (best 14–26) | Corner radius |
| `layout` | wrap | wrap | wrap / row | Pill layout |
| `maxItems` | 4 | 4 | 2–6 (best 3–5) | Max suggestions |
| `showIcons` | true | true | boolean | Pill icons |
| `stagger` | 0.04 | 0.04 | 0–0.12 s (best 0.02–0.08) | Stagger |
| `placeholder` | Ask anything... | Ask anything... | ≤ 40 chars | Placeholder |

## Rules

- Pass your own groups as [{ label, highlight, items }]; highlight is the phrase emphasised in that group's prompts. onSubmit receives the final text; picking a suggestion only fills the input.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from ibelick/prompt-kit).
