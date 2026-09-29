---
name: motif-backgrounds
description: "Design animated and decorative backgrounds for heroes and sections: mesh and grain gradients, aurora, noise, particles, grids and shader fields, with readable text on top. Use when adding a hero background, animated gradient, ambient effect or texture, or when a background hurts readability or performance."
license: MIT
compatibility: Any web stack; examples use CSS and React with Tailwind CSS v4.
metadata:
  source: "https://github.com/aimerfeng/motif"
---

# Backgrounds

A background supports the content in front of it. If people notice the background before the headline, it is too loud.

## Rules

### One animated background per viewport

Stacking a gradient, particles and a grid in one hero produces noise. Pick one; if you need texture, add static grain.

### Text must stay readable everywhere

Check contrast against the **lightest and darkest** regions the animation can produce, not the average.

```tsx
// Correct — a scrim sized to the text, not a flat dark overlay on everything
<div className="relative isolate">
  <AnimatedBackground className="absolute inset-0 -z-10" />
  <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-linear-to-t from-black/60 to-transparent" />
  <h1>…</h1>
</div>
```

### Prefer CSS when it's enough

A slow gradient can be pure CSS: register a custom property and animate it, so no JavaScript runs.

```css
@property --angle { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
.bg { background: conic-gradient(from var(--angle), #1b1464, #6a11cb, #2575fc, #1b1464); animation: spin 24s linear infinite; }
@keyframes spin { to { --angle: 360deg; } }
@media (prefers-reduced-motion: reduce) { .bg { animation: none; } }
```

Reach for WebGL (see `motif-shaders`) when you need noise, distortion or depth.

### Slow is premium

Ambient loops: 12–30 s per cycle, speed well under what feels "lively" in isolation. Fast backgrounds feel cheap and tire the eye.

### Avoid banding

Dark gradients band on 8-bit displays. Add 2–4% monochrome grain (an SVG `feTurbulence` image or shader noise) on top.

### Layout

- Background layers are `absolute inset-0 -z-10` inside a `relative isolate` container, so they never capture pointer events meant for content and never overflow.
- Reserve the space: the background must not cause layout shift when it mounts.
- Use `pointer-events: none` unless the background is interactive on purpose.

### Performance

- Pause when offscreen and in hidden tabs.
- Canvas backgrounds: cap DPR at 1.5; they are rarely looked at closely.
- Particles: budget ~150 on mobile, ~400 on desktop; draw in one pass.

### Reduced motion

Freeze on a good-looking frame. A background is never essential motion.

## Checklist

- [ ] Only one animated layer in view.
- [ ] Text contrast holds over every frame.
- [ ] Cycle ≥ 12 s; nothing flashes.
- [ ] Grain on dark gradients.
- [ ] Paused offscreen; static under reduced motion.
