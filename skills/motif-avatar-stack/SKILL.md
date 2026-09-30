---
name: motif-avatar-stack
description: "A row of overlapping gradient avatars: the one under the pointer lifts, its neighbors part and a name card pops above. Presence dots included, extra people fold into +N. Made for collaborators on a document, project members and reviewers. Use when the user asks for Avatar Stack, 头像堆叠, avatar, stack, presence, collaborators, team, hover, spring or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/avatar-stack"
  motif-item: "avatar-stack"
  params-hash: "3c2b8098"
---

# Avatar Stack (头像堆叠)

A row of overlapping gradient avatars: the one under the pointer lifts, its neighbors part and a name card pops above. Presence dots included, extra people fold into +N. Made for collaborators on a document, project members and reviewers.

## When to use

- Use to show who is present or involved (collaborators, reviewers, members) in a header or list row, where the count matters more than each face.

## Files

- `assets/avatar-stack.tsx` — the component (`AvatarStack`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/avatar-stack/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { AvatarStack } from '@/components/motif/avatar-stack/avatar-stack'

<AvatarStack />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `size` | 48 | 48 | 28–72 px (best 36–60) | Avatar size |
| `overlap` | 14 | 14 | 0–28 px (best 6–20) | Overlap |
| `maxVisible` | 5 | 5 | 2–8 (best 3–6) | Max visible |
| `shape` | circle | circle | circle / squircle | Shape |
| `spread` | 10 | 10 | 0–20 px (best 4–14) | Neighbor spread |
| `spring` | visualDuration 0.3, bounce 0.3 | visualDuration 0.3, bounce 0.3 | visualDuration s, bounce 0–1 | Spring |
| `color` | #8b5cf6 | #8b5cf6 | color | Focus color |
| `showStatus` | true | true | boolean | Presence dots |

## Rules

- Pass people as [{ name, role?, hue?, status? }]; there are no photos, avatars are initials on generated gradients. Order the most relevant people first: only maxVisible are shown and the rest fold into +N.
- Set ring to the color of the surface behind the stack (for example var(--card)) so the separating outline blends in.
- Each avatar is focusable with a full aria-label (name, role, status), and focus shows the same name card as hover.
- Keyboard and screen-reader behaviour must work; the animation sits on top of that.
- Feedback starts within 100 ms of the interaction.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from shadcnblocks/kibo).
