---
name: motif-motion
description: "Implement UI animation with motion (motion.dev, formerly Framer Motion) in React: springs, entrances and exits, layout and shared-element transitions, staggered lists, gestures, and reduced-motion handling. Use when adding or fixing animations, transitions, AnimatePresence, layout animations, or when motion feels janky, sluggish or too bouncy."
license: MIT
compatibility: React 18+ with motion 12 or 13 (import from "motion/react").
metadata:
  source: "https://github.com/aimerfeng/motif"
---

# Motion in React

Timing values and motion personality come from the `motif-design` skill (its motion reference). This skill is about implementing them correctly with motion.

## Rules

### Import from `motion/react`

```tsx
// Incorrect
import { motion } from 'framer-motion'
// Correct
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
```

### Describe springs by how they look, not by physics constants

`visualDuration` + `bounce` are far easier to tune and to keep consistent than `stiffness`/`damping`/`mass`.

```tsx
// Incorrect — hard to reason about, easy to make wobbly
transition={{ type: 'spring', stiffness: 260, damping: 11 }}
// Correct
transition={{ type: 'spring', visualDuration: 0.35, bounce: 0.15 }}
```

Keep `bounce ≤ 0.2` for menus, dialogs and anything functional.

### Exits need AnimatePresence and a stable key

```tsx
// Incorrect — the element disappears instantly
{open && <motion.div exit={{ opacity: 0 }} />}
// Correct
<AnimatePresence>
  {open && <motion.div key="panel" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} />}
</AnimatePresence>
```

Exit faster than you enter (e.g. 0.25 s in, 0.18 s out).

### Animate layout with `layout`, never width/height

```tsx
// Incorrect — animating size triggers layout every frame
animate={{ width: expanded ? 320 : 120 }}
// Correct — FLIP under the hood, transform only
<motion.div layout style={{ width: expanded ? 320 : 120 }} transition={{ type: 'spring', visualDuration: 0.3, bounce: 0.1 }} />
```

Use `layoutId` for shared-element transitions (a card expanding into a dialog). Put `layout="position"` on children whose size shouldn't stretch.

### Stagger with variants and cap the total

```tsx
const list = { show: { transition: { staggerChildren: 0.04, delayChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }
<motion.ul variants={list} initial="hidden" animate="show">
  {items.slice(0, 12).map((i) => <motion.li key={i.id} variants={item} />)}
</motion.ul>
```

Only stagger the first ~10 items; the rest appear with the last one.

### Respect reduced motion

```tsx
// Correct — app-wide
<MotionConfig reducedMotion="user">{children}</MotionConfig>

// Correct — per component, replace movement with a fade
const reduce = useReducedMotion()
<motion.div initial={{ opacity: 0, y: reduce ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} />
```

For looping or ambient motion, stop it entirely under reduced motion.

### Use motion values for pointer-driven effects

Pointer-following, magnetic or tilt effects must not re-render React on every move.

```tsx
// Incorrect — setState on pointermove
const [x, setX] = useState(0)
// Correct
const x = useMotionValue(0)
const smooth = useSpring(x, { visualDuration: 0.2, bounce: 0 })
<motion.div style={{ x: smooth }} onPointerMove={(e) => x.set(e.nativeEvent.offsetX - 50)} />
```

### Hover and press feedback

```tsx
<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', visualDuration: 0.15, bounce: 0 }} />
```

Press feedback ≤ 150 ms. Don't animate buttons people press dozens of times a day beyond a subtle scale.

## Checklist

- [ ] Every animation answers "what does this tell the user?"
- [ ] Only transform/opacity/filter animate; layout changes use `layout`.
- [ ] Exits exist, are keyed, and are shorter than entrances.
- [ ] Reduced motion handled.
- [ ] Pointer-driven effects use motion values, not state.
