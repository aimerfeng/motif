---
name: motif-shop-product-cards
description: "Product cards in several styles: a second angle on hover, a wishlist heart that pops, New and Save badges, strike-through sale prices, color dots and quick add-to-cart, with all imagery drawn in SVG. For collection rows and recommendation strips. Use when the user asks for Product Card Set, 商品卡片组, product, card, ecommerce, shop, wishlist, collection or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs clsx, motion, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/shop-product-cards"
  motif-item: "shop-product-cards"
  params-hash: "b363e6d7"
---

# Product Card Set (商品卡片组)

Product cards in several styles: a second angle on hover, a wishlist heart that pops, New and Save badges, strike-through sale prices, color dots and quick add-to-cart, with all imagery drawn in SVG. For collection rows and recommendation strips.

## When to use

- A building block for a page. Combine sections into a landing page or drop one into an existing page.

## Files

- `assets/shop-product-cards.tsx` — the component (`ShopProductCards`); the tuned values are baked into its `defaults` object
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-shop-product-cards`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install clsx motion tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/shop-product-cards/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
4. Use it:

```tsx
import { ShopProductCards } from '@/components/motif/shop-product-cards/shop-product-cards'

<ShopProductCards />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `cardStyle` | boxed | boxed | boxed / reveal / swatch / ribbon | Card style |
| `accent` | #facc15 | #facc15 | color | Accent |
| `tone` | light | light | light / dark | Tone |
| `radius` | 0 | 0 | 0–24 px | Radius |
| `aspect` | portrait | portrait | portrait / square / tall | Image aspect |
| `columns` | 3 | 3 | 2–4 | On wide screens |
| `showWishlist` | true | true | boolean | Wishlist button |
| `showQuickAdd` | true | true | boolean | Add to cart |

## Rules

- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file (originally from markmead/hyperui).
