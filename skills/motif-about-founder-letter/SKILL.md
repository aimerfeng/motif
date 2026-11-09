---
name: motif-about-founder-letter
description: "A letter from the founder set like a printed page: letterhead, a three-line drop cap, a pull quote that moves into the margin on wide screens, an initials portrait with name and title, and a handwritten signature that writes itself stroke by stroke when the reader reaches it. Paper tone, measure and type pairing are adjustable. For about pages, manifestos and funding announcements. Use when the user asks for Founder's Letter, 创始人的信, about, letter, founder, signature, editorial, drop cap, pull quote, manifesto, announcement or a similar effect. Includes the parameters tuned on Motif."
license: MIT
compatibility: React 18+ with Tailwind CSS v4. Needs @fontsource-variable/fraunces, @fontsource-variable/geist, @fontsource-variable/inter-tight, @fontsource-variable/newsreader, @fontsource-variable/playfair-display, @fontsource/ibm-plex-mono, @fontsource/instrument-serif, clsx, tailwind-merge.
metadata:
  source: "https://github.com/aimerfeng/motif/tree/main/packages/registry/items/about-founder-letter"
  motif-item: "about-founder-letter"
  params-hash: "3f10d60a"
---

# Founder's Letter (创始人的信)

A letter from the founder set like a printed page: letterhead, a three-line drop cap, a pull quote that moves into the margin on wide screens, an initials portrait with name and title, and a handwritten signature that writes itself stroke by stroke when the reader reaches it. Paper tone, measure and type pairing are adjustable. For about pages, manifestos and funding announcements.

## When to use

- A short personal letter on an about page, a manifesto, or a funding or milestone announcement: three or four paragraphs signed by one person. For a long essay use an article layout instead.

## Files

- `assets/about-founder-letter.tsx` — the component (`AboutFounderLetter`); the tuned values are baked into its `defaults` object
- `assets/signature.ts`
- `assets/about-founder-letter.css`
- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`
- No `assets/` folder next to this file? It was copied on its own: fetch the files with `npx skills add aimerfeng/motif --skill motif-about-founder-letter`, then set the values from Tuned parameters below.

## Install

1. Install dependencies: `npm install @fontsource-variable/fraunces @fontsource-variable/geist @fontsource-variable/inter-tight @fontsource-variable/newsreader @fontsource-variable/playfair-display @fontsource/ibm-plex-mono @fontsource/instrument-serif clsx tailwind-merge`.
2. Copy the files from `assets/` into `src/components/motif/about-founder-letter/` (and `motif-runtime.ts` into `src/lib/`). Keep the license header comments.
3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (`--background`, `--foreground`, `--primary` …), add `assets/theme.css` to the global stylesheet.
   Fonts (self-hosted, OFL): add `@import '@fontsource-variable/fraunces';`, `@import '@fontsource-variable/fraunces/wght-italic.css';`, `@import '@fontsource-variable/newsreader';`, `@import '@fontsource-variable/newsreader/wght-italic.css';`, `@import '@fontsource/instrument-serif/400.css';`, `@import '@fontsource/instrument-serif/400-italic.css';`, `@import '@fontsource-variable/geist';`, `@import '@fontsource-variable/playfair-display';`, `@import '@fontsource-variable/playfair-display/wght-italic.css';`, `@import '@fontsource-variable/inter-tight';`, `@import '@fontsource/ibm-plex-mono/400.css';`, `@import '@fontsource/ibm-plex-mono/500.css';`, `@import '@fontsource/ibm-plex-mono/700.css';` to the global stylesheet.
4. Use it:

```tsx
import { AboutFounderLetter } from '@/components/motif/about-founder-letter/about-founder-letter'

<AboutFounderLetter />
```

## Tuned parameters

Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.

| Param | Value | Default | Range | Meaning |
| --- | --- | --- | --- | --- |
| `accent` | #27468a | #27468a | color | Used by the signature, drop cap and quote mark; pushed toward the text colour until it reads clearly on the paper |
| `paperTone` | ivory | ivory | ivory / linen / kraft / night | Paper tone |
| `fontPairing` | literary | literary | literary / modern / editorial / typewriter | Type pairing |
| `measure` | 62 | 62 | 50–72 (best 56–68) | Roughly how many characters per line of body text |
| `signatureStyle` | script | script | script / quick / initials | Signature |
| `signDuration` | 2.4 | 2.4 | 1.2–4 s (best 1.8–3.2) | How long the signature takes to write once it is reached |
| `showPortrait` | true | true | boolean | Initials portrait |
| `heading` | Why we took the money, and what it won’t change | Why we took the money, and what it won’t change | ≤ 64 chars | Heading |

## Rules

- Edit LETTER for the copy and SIGNER for the name, title, place and date. Keep it to three or four paragraphs and 120-220 words; the first paragraph carries the drop cap and the pull quote follows it in the DOM, so on narrow containers it sits inline between the first and second paragraphs and leads into the line it quotes later on. The heading may be left empty: the h2 is then dropped and the section is labelled "Letter from <name>".
- The pull quote repeats a sentence from the body, so it is aria-hidden; pick the one line a skimmer should remember and keep it under 120 characters.
- The wide layout (960px and up) is pure CSS: a grid with the text column at the chosen measure and a margin column where the quote sits beside the second and third paragraphs (placed by grid-row, so DOM order does not matter there). Below that the quote stays inline after the first paragraph with a rule on its left. The breakpoint follows the section’s own width through @container afl, not the viewport, so a section placed in a narrow column keeps the single-column layout with the quote inline.
- The signature is drawn from hand-built cursive glyphs in signature.ts (only the letters of the demo name exist). To sign with another name, add glyphs in the same format or replace the strokes with your own single-line SVG paths; keep one path per pen stroke so the writing order stays natural.
- The signature writes itself once when 60% of it is visible (IntersectionObserver); its frame loop is mounted only while it is writing and stops once the last stroke is down. Under reduced motion it is drawn complete. replayEvery is for demos only and keeps the loop running.
- The ink colour is pushed toward the text colour until it reaches 4.5:1 on the paper, so any accent stays legible on every tone; keep body text in the paper ink, not the accent.
- Match container width and vertical rhythm with the neighbouring sections.
- Headings say something specific about the product; avoid generic marketing phrases.
- Respect `prefers-reduced-motion`: this component already holds a single still frame when it is set. Keep that behavior.
- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.
- License: MIT. Keep the header comments in each file.
