---
name: motif-link-preview-card
description: "Hovering or focusing an inline link opens a preview card after a short delay, with a picture and a short summary and an arrow pointing at the link; moving between links keeps it open while it glides over and swaps in the new content. Made for articles, docs and chat messages. Use when the user asks for Link Preview Card, 链接预览卡片, preview card, hover card, popover, link, wiki, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/link-preview-card"
  motif-item: "link-preview-card"
  params-hash: "aa20bc8a"
---

# Link Preview Card (链接预览卡片)

Hovering or focusing an inline link opens a preview card after a short delay, with a picture and a short summary and an arrow pointing at the link; moving between links keeps it open while it glides over and swaps in the new content. Made for articles, docs and chat messages.

## When to use

- A functional UI control or state indicator.

## Files

- `assets/link-preview-card.tsx` — the component (`LinkPreviewCard`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-link-preview-card`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/link-preview-card/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { LinkPreviewCard } from '@/components/motif/link-preview-card/link-preview-card'

<LinkPreviewCard />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `openDelay` | 600 | 600 | 0–1200 ms (best 300–800) | Open delay |
| `closeDelay` | 300 | 300 | 0–800 ms (best 150–400) | Close delay |
| `side` | bottom | bottom | bottom / top | Side |
| `width` | 224 | 224 | 192–300 px (best 208–272) | Content width |
| `radius` | 0 | 0 | 0–16 px (best 0–12) | Radius |
| `showArrow` | true | true | boolean | Arrow |
| `spring` | visualDuration 0.35, bounce 0 | visualDuration 0.35, bounce 0 | visualDuration 0.05–4 s, bounce 0–0.9 | Move spring |

## Rules

- Wrap the text in <LinkPreviewCard contents={{ key: <PreviewContent … /> }}> and mark links with <PreviewLink name="key" href=…>; one card is shared by all links inside the root.
- The card is supplementary: everything in it must also be reachable by following the link. Touch pointers do not open it.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from mui/base-ui).
