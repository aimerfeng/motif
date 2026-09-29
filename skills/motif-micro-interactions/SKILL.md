---
name: motif-micro-interactions
description: "Design small interactive feedback: button press and hover, toggles, hold-to-confirm, copy feedback, success and error states, magnetic and tilt effects, cursor followers. Use when a control feels dead or laggy, when adding delight to a primary action, or when deciding whether something should animate at all."
license: MIT
compatibility: Any web stack; examples use React with motion and Tailwind CSS v4.
metadata:
  source: "https://github.com/aimerfeng/motif"
---

# Micro-interactions

A micro-interaction is feedback: it confirms that the interface heard the user. Speed and honesty matter more than flourish.

## Decide whether to animate

| How often is it used? | What to do |
| --- | --- |
| Once (onboarding, first success) | Can be expressive and a little slow |
| Occasionally (settings, sharing) | Short and clear |
| Constantly (typing, list navigation, every click) | Instant, or a barely-there fade |
| From the keyboard | Don't animate |

## Rules

### Respond within 100 ms

The first visual change must start immediately on `pointerdown`, not after a network request.

```tsx
<motion.button whileTap={{ scale: 0.97 }} transition={{ type: 'spring', visualDuration: 0.12, bounce: 0 }} />
```

### Hover is a hint, press is the answer

Hover: subtle (color, 1–2% scale, border light). Press: scale down 2–4%. Never move the element away from the pointer on hover.

### Use the same words everywhere

The button, the loading label and the confirmation share a verb: `Publish` → `Publishing…` → `Published`.

### Destructive actions: hold or confirm

Hold-to-confirm (≈1–1.5 s with visible progress) prevents accidents without a modal. Releasing early must cancel cleanly.

### Magnetic, tilt and cursor effects

- Drive them with motion values or refs, never React state per pointer event.
- Limit the pull (≤ 8–12px for magnetic buttons, ≤ 10° tilt).
- Disable on touch devices (`@media (pointer: coarse)`) and under reduced motion.

### Success and error

- Success: brief (≤ 600 ms), then return to a stable state.
- Error: a short shake (2–3 oscillations, ≤ 8px, ≤ 300 ms) plus a message saying how to fix it. The shake alone is not accessible — always pair it with text.

### Particles and confetti

Reserve for genuinely celebratory moments (first publish, completed purchase). Keep under ~1 s, cap particle counts, and skip entirely under reduced motion.

## Checklist

- [ ] Feedback starts on pointerdown, within 100 ms.
- [ ] Animation intensity matches frequency of use.
- [ ] Labels share one verb across states.
- [ ] Pointer effects off on touch and under reduced motion.
- [ ] Errors say how to fix them.
