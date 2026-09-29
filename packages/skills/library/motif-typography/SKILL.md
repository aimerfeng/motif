---
name: motif-typography
description: "Set and animate type for web UIs: display and text pairings, scales, line length, numerals, and animated headlines (split-text reveals, scramble, morph, ticker) that stay accessible. Use when choosing fonts, fixing typographic hierarchy, or adding a text animation or animated number."
license: MIT
compatibility: Any web stack; examples use React with motion and Tailwind CSS v4.
metadata:
  source: "https://github.com/aimerfeng/motif"
---

# Typography and text motion

## Setting type

- Two roles: display (headings) and text (everything else). A third, mono, only for code and data.
- Choose the display face for the subject. Self-host fonts and subset them (CJK fonts especially — a full Chinese font is several MB).
- Scale: pick a ratio (1.2–1.333) and stick to it. Display sizes can break the scale for one hero line.
- Body line length 60–75 characters (CJK: 30–40 characters). Line height 1.5–1.7 for text, 1.0–1.15 for display.
- Headings: `text-wrap: balance`. Paragraphs: `text-wrap: pretty`.
- Negative tracking on large display type (−0.02 to −0.04em); never on small text.
- Numbers that change or align: `font-variant-numeric: tabular-nums`.

## Animating text

### Keep the text readable by assistive tech

Splitting into spans breaks screen readers unless you label the whole.

```tsx
// Incorrect — announced letter by letter
<h1>{letters.map((l, i) => <span key={i}>{l}</span>)}</h1>
// Correct
<h1 aria-label={text}>
  <span aria-hidden>{letters.map((l, i) => <motion.span key={i} …>{l}</motion.span>)}</span>
</h1>
```

### Split by the right unit

- Words for headlines (natural reading rhythm), characters only for short words or effects like scramble.
- Stagger 20–40 ms per character or 50–80 ms per word; total reveal under ~800 ms.
- Animate once when the heading enters the viewport, not on every re-render.

### Reveals that feel good

```tsx
const word = { hidden: { opacity: 0, y: '0.4em', filter: 'blur(6px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)' } }
// transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
```

Keep blur ≤ 8px and only on short text; blur is expensive on large areas.

### Animated numbers

- Use tabular numerals so digits don't shift horizontally.
- Count with a spring on a motion value, render with `Intl.NumberFormat` for locale-correct grouping.
- Don't animate numbers the user is trying to read precisely (prices in a checkout).

### Reduced motion

Show the final text immediately. For tickers, show the final value.

## Checklist

- [ ] ≤ 2 families (+ mono); fonts self-hosted and subset.
- [ ] Line length and line height in range; balanced headings.
- [ ] Animated text has an accessible label and animates once.
- [ ] Tabular numerals for changing numbers.
- [ ] Final state shown under reduced motion.
