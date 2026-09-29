---
name: motif-scroll
description: "Build scroll-linked and scroll-triggered motion for landing pages and storytelling: reveal-on-view, progress indicators, sticky scenes, parallax, horizontal sections and CSS scroll-driven animations. Use when adding animations tied to scrolling, a scroll progress bar, sticky storytelling sections, or when scroll effects feel janky or excessive."
license: MIT
compatibility: Modern browsers; CSS scroll-driven animations need a fallback where unsupported. Examples use CSS and motion for React.
metadata:
  source: "https://github.com/aimerfeng/motif"
---

# Scroll motion

Scrolling is the user's input. Scroll-linked motion must follow it faithfully and never fight it.

## Rules

### One signature scroll moment per page

Pick the one section that deserves a scroll-driven scene. Everything else simply appears (a quick fade on first view, or nothing). Fading every section up by 20px is the most common scroll slop.

### Prefer CSS scroll-driven animations

They run off the main thread.

```css
.reveal {
  animation: reveal linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 60%;
}
@keyframes reveal { from { opacity: 0; transform: translateY(16px); } }
@supports not (animation-timeline: view()) { .reveal { animation: none; } }
@media (prefers-reduced-motion: reduce) { .reveal { animation: none; } }
```

Progress bar: `animation-timeline: scroll(root)` on a `scale-x` from 0 to 1 with `transform-origin: left`.

### Triggered reveals run once

```tsx
<motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} />
```

### Don't hijack scrolling

- No scroll-jacking (changing scroll speed or snapping unexpectedly) on content pages.
- Smooth-scroll libraries (e.g. Lenis) change how the whole page feels; use them only on showcase pages, and disable under reduced motion.
- Sticky scenes: limit to ~2–3 viewport heights; longer feels like being trapped.

### Parallax

Small offsets only (≤ 10–15% of the element's height), on images and decoration — never on text people are reading.

### Performance

- Animate transform/opacity only; don't read layout (`getBoundingClientRect`) inside scroll handlers.
- For JS-driven effects use `useScroll` + `useTransform` (motion) or a single rAF-throttled handler.

### Reduced motion

Disable parallax, sticky scene transforms and scroll-linked movement. Content must be fully readable without them.

## Checklist

- [ ] At most one scroll-driven scene; the rest is calm.
- [ ] CSS scroll timelines where possible, with a fallback.
- [ ] Reveals happen once.
- [ ] No scroll-jacking on content pages.
- [ ] Everything readable with reduced motion.
