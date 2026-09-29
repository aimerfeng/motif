# Quality gate

Run this before calling the work done. Measure instead of assuming: if you can render the page, render it and look at it.

## Accessibility

- [ ] Text contrast ≥ 4.5:1 (≥ 3:1 for text ≥ 24px or bold ≥ 19px), including text over images, gradients and effects — check the lightest and darkest regions behind it.
- [ ] Every interactive element is reachable and operable by keyboard, with a visible `:focus-visible` style (never a bare `outline: none`).
- [ ] `prefers-reduced-motion: reduce` is handled: ambient motion stops, movement becomes fades or instant changes.
- [ ] Anything that moves, blinks or scrolls automatically for more than 5 seconds can be paused.
- [ ] Buttons are `<button>`, links are `<a href>`; icons-only controls have an accessible name.
- [ ] Touch targets are at least 44×44px on touch devices.

## Motion

- [ ] Each animation can be explained in one sentence (what it communicates).
- [ ] Only compositor-friendly properties animate; no `transition: all`.
- [ ] Animations are interruptible — a second click mid-animation does the right thing.
- [ ] Transform origins make physical sense (menus grow from their trigger).
- [ ] Loops pause offscreen and in hidden tabs.

## Layout and type

- [ ] Works from 360px to 1920px wide without horizontal scroll.
- [ ] Line length for body text 60–75 characters; headings use `text-wrap: balance`.
- [ ] Numbers in tables/stats use `font-variant-numeric: tabular-nums`.
- [ ] Ellipses are `…`, quotes are typographic, units have a non-breaking space where needed.

## Performance

- [ ] No layout shift when fonts, images or effects load (reserve space).
- [ ] At most one WebGL canvas per viewport; DPR capped; offscreen canvases paused or unmounted.
- [ ] Fonts are self-hosted and subset; no render-blocking third-party CSS.
- [ ] Interaction to next paint stays under 200 ms on a mid-range laptop.

## States

- [ ] Loading, empty, error, success, disabled and long-content states are designed, not left to defaults.
