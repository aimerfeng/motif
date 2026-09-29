# Anti-slop

Generated UI tends to converge on the same few looks. Each is fine once; together they read as "made by a template". If the brief explicitly asks for one of these, do it — otherwise choose something that comes from the subject.

## Looks to avoid by default

| Pattern | Why it reads as generic | Instead |
| --- | --- | --- |
| Cream background, serif display, terracotta accent | The default "tasteful" palette of 2024–2026 generators | Derive the palette from the subject's own world (materials, era, place) |
| Near-black page with one acid-green or neon accent | The default "technical" look | Use value and texture contrast; let the content provide color |
| Purple-to-blue gradient hero, glowing orbs | Instantly recognizable stock SaaS | One well-tuned effect with the subject's colors, or none |
| Card grid with identical radius, identical grey shadow, gradient icon chips | Reads as a component library demo | Vary scale and density; not everything is a card |
| Eyebrow in uppercase tracking + big number + small label + arrow link | Template scaffolding | Headings that say something specific |
| Numbering sections 01 / 02 / 03 without a sequence | Decoration pretending to be structure | Number only real steps |
| Emphasizing one word of every heading in italic or color | A tic, not a system | Emphasis once per page, if at all |
| Everything centered | Makes long pages monotonous | Use a grid; align to edges; center only moments |
| Inter/system font everywhere | Not wrong, just anonymous | Pick a display face with character for headings |

## Motion slop

- Every section fading up by 20px as you scroll.
- Hover lift + shadow grow on every card.
- Infinite pulsing on call-to-action buttons.
- Parallax on text.
- Page-load choreography longer than 600 ms before the user can act.
- Springs with visible wobble on functional UI (menus, dialogs).

## Copy slop

- "Unlock your potential", "Supercharge your workflow", "Seamless", "Revolutionary".
- Buttons whose label differs from the resulting toast (`Save` → "Changes updated"). Use the same verb.
- Error messages that apologize but don't say how to fix it.
- Empty states that describe emptiness instead of inviting the next action.
