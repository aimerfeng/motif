# Motion

## Identity

Pick one motion personality per product and keep it everywhere:

| Personality | Durations | Easing / spring | Overshoot |
| --- | --- | --- | --- |
| Calm / premium | 300–500 ms | `cubic-bezier(0.22, 1, 0.36, 1)` | none |
| Crisp / productive | 150–250 ms | `cubic-bezier(0, 0, 0.3, 1)` | none |
| Friendly | 200–350 ms | spring `visualDuration 0.35, bounce 0.15` | slight |
| Playful | 150–300 ms | spring `visualDuration 0.3, bounce 0.3` | visible |

## Durations (starting points)

| Element | Duration |
| --- | --- |
| Hover, press, toggle feedback | 100–150 ms |
| Tooltip, small popover | 120–180 ms |
| Menu, dropdown | 150–220 ms |
| Card or panel entering | 200–350 ms |
| Modal / sheet | 250–400 ms |
| Page or large view change | 350–500 ms |
| Showcase reveal (once per visit) | 600–1200 ms |

Exits are 20–30% shorter than entrances. Larger distances take longer; a 40px move and a full-screen move should not share a duration.

## Easing

- Entering: decelerate (ease-out). Leaving: accelerate (ease-in). Moving between two on-screen positions: ease-in-out.
- Never enter with ease-in — it feels laggy.
- Prefer springs (motion's `visualDuration` + `bounce`) for things the user drags or throws, and for layout changes.
- For functional UI keep `bounce` ≤ 0.2; reserve visible overshoot for playful moments.

## Choreography

- Stagger lists at 30–60 ms per item and cap the total stagger around 400 ms.
- Move at most a third of the elements on screen at once; the rest stay still so the eye knows where to look.
- Lead with the element the user acted on; follow with its consequences.

## Performance

- Animate `transform` and `opacity` (and `filter`/`clip-path` sparingly on small elements). Never animate `width`, `height`, `top`, `left` or `margin`; use FLIP / layout animations instead.
- Never `transition: all` — list the properties that change.
- Remove `will-change` after the animation; don't set it globally.
- Pause loops offscreen (IntersectionObserver) and in hidden tabs (`visibilitychange`).
- Cap canvas device pixel ratio at 1.5–2 and total pixels on huge screens.

## Reduced motion

`prefers-reduced-motion: reduce` means: remove movement, keep meaning.

- Replace slides, scales, parallax and autoplay loops with a fade or an instant change.
- Stop ambient/background animation on a good-looking still frame.
- Keep feedback that carries information (a checkmark appearing), but make it instant or a short fade.
- In motion: `useReducedMotion()` or `<MotionConfig reducedMotion="user">`.
