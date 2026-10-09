---
name: motif-wallet-card-stack
description: "Bank cards stacked as if held in your hand: the selected one lifts toward you, the rest tilt back, a specular sheen follows the pointer and hiding the balance blurs digits into dots one by one. Made for account switchers in finance, payment and membership apps. Use when the user asks for Wallet Card Stack, 卡片钱包, wallet, card, stack, finance, balance, 3d, a11y or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/wallet-card-stack"
  motif-item: "wallet-card-stack"
  params-hash: "50cadcf5"
---

# Wallet Card Stack (卡片钱包)

Bank cards stacked as if held in your hand: the selected one lifts toward you, the rest tilt back, a specular sheen follows the pointer and hiding the balance blurs digits into dots one by one. Made for account switchers in finance, payment and membership apps.

## When to use

- Numbers, stats and small data displays that change over time.

## Files

- `assets/wallet-card-stack.tsx` — the component (`WalletCardStack`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-wallet-card-stack`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/wallet-card-stack/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { WalletCardStack } from '@/components/motif/wallet-card-stack/wallet-card-stack'

<WalletCardStack />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `palette` | #1f4d3a, #1d2a44, #b4532a | #1f4d3a, #1d2a44, #b4532a | 2–4 colors | Assigned to the cards in order |
| `radius` | 16 | 16 | 8–28 px (best 10–24) | Corner radius |
| `grain` | 0.14 | 0.14 | 0–0.3 (best 0.05–0.22) | Fine printed-card noise |
| `stackOffset` | 14 | 14 | 8–24 px (best 10–20) | Stack offset |
| `tilt` | 7 | 7 | 0–12 deg (best 3–10) | Back tilt |
| `spring` | visualDuration 0.3, bounce 0.1 | visualDuration 0.3, bounce 0.1 | visualDuration 0.05–4 s, bounce 0–0.9 | Switch spring |

## Rules

- Pass accounts as { id, label, balance, currency, last4, holder, expiry }; never put full card numbers in props. Card colors come from the palette in order.
- The stack is a listbox of options: arrow keys move the selection and focus. The balance toggle is a real button with aria-pressed; hidden state masks digits but keeps the currency symbol.
- Controlled: activeId + onActiveChange, hidden + onHiddenChange. No card-network logos are included on purpose; add your own only if you have the rights.
- Use tabular numerals so digits do not jump horizontally.
- Respect `prefers-reduced-motion`: this component already is not animated when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from educlopez/smoothui).
