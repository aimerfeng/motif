# Motif 母题: implementation plan

## Context

The user wants an open-source site for frontend design (public repo `aimerfeng/motif`, MIT, local copy at `C:\Users\10706\Projects\motif`). It gathers components, motion effects, shaders and agent skills from GitHub open source. On the site, users can:

- **Browse the market:** every item has a live preview and its source.
- **Tune:** adjust parameters visually and see the result immediately.
- **Use the agent studio (Studio):** describe an effect in plain language and have an agent generate it or remix a market item, with no code.
- **Export:** download a runnable project zip, copy the component code, install it with `npx shadcn add`, or copy or download the matching agent skill (SKILL.md) into their own project.

The user's priority: **the effects have to be good; that is where the value is.** The research is committed in `docs/research/` (four reports with licenses checked against the actual license text).

## Decisions already made

| Item | Decision |
|---|---|
| Interface language | Chinese and English (next-intl), default `zh-CN` |
| Model | A **key built into the site** (server-side env) behind a provider interface. The user adds the real key later. **Development and testing use the local Claude Code CLI with Sonnet 5.5** (`C:\Users\10706\.local\bin\claude.exe`), with no paid API calls |
| Deployment | Undecided; **local only** for now. Nothing depends on an external CDN at runtime (the user is in China): vendor code and fonts are self-hosted |
| GSAP | Allowed as a dependency; the user will negotiate a license once the effects are good. The agent still prefers motion or CSS by default |
| License boundary | The repo is public. Code that is Commons Clause (react-bits, animate-ui), unlicensed, NC, AGPL, Prosperity (lygia), or Shadertoy under its default CC BY-NC-SA **is never copied in**; we only link to it. Only grade-A sources are integrated, with provenance recorded |
| threeui items of "Neuform export" origin | Accepted. The MIT grant comes from the copyright holder, and `upstream.origin` records the source. Brand logos (`elements` and `brand-orbs`), full landing pages, and assets outside the MIT grant (thumbnails and videos) are not taken |

## Architecture (pnpm 12 workspace, following the tooling conventions in `C:\Users\10706\Projects\interlude`)

```
apps/web             Next.js 16 App Router + Tailwind v4 + next-intl (zh-CN default). Market / detail / Studio / Skills / Docs
apps/preview         Vite static sandbox runtime + /vendor (prebundled ESM) + /items (precompiled curated items)
                     Dev origin 127.0.0.1:4100 vs the host at localhost:3000 (different site, separate process)
packages/schema      ItemManifest / ParamSpec / ItemSource types + zod validation, bake(), paramsHash()
packages/registry    items/<slug>/* → ItemSource; emits shadcn registry.json, r/*.json, search index, NOTICE
packages/runtime     copyable hooks shared by every item: useStageLoop (IO + visibility + reduced-motion + fixed clock),
                     useCanvasSize (DPR / pixel cap), useGL (context loss). Depends only on React; ships as the registry lib motif-runtime
packages/vendor      prebundling + vendor-manifest.json (one source for the import map, the exported package.json, and the agent's dependency allowlist)
packages/checker     one rule set shared by the audit and by agent writes (provenance, allowed SPDX, banned patterns such as lygia/shadertoy, defaults region)
packages/tune        ParamSpec → controls panel (slider, color, palette, select, easing curve, spring, vec2, seed)
packages/export      runs in the browser: fflate zip, single-file copy, skill folder
packages/skills      motif-design master skill, category skills, per-item micro-skill template
packages/agent       tool definitions, prompt assembly, runners (ai-sdk / scripted)
packages/agent-claude-cli  dev only (the Agent SDK is proprietary, so it never goes to production), loaded dynamically
skills/              generated output committed to the repo root, so `npx skills add aimerfeng/motif --skill <name>` works
scripts/             sources.json (pinned upstream SHAs + grades), ingest, audit, capture, dev.mjs
```

Pinned versions: next 16.3, react 19.3, tailwindcss 4.3, motion 13.4 (compatible with v12 code), ai 7.0, zod 4, three 0.186, @paper-design/shaders-react **exactly 0.0.81**, **typescript ~6.0.3** (TypeScript 7 is not supported by typescript-eslint and removed the compiler API), eslint 10, vitest 5, @playwright/test 1.63 (`channel: 'msedge'`).

## Core mechanisms

1. **One item format.** `ItemSource = { manifest: ItemManifest, files }`. Curated items (`items/<slug>/{item.ts, <slug>.tsx, demo.tsx, *.glsl.ts, SOURCE.md}`) and Studio workspaces share this format, and preview, export, skill, registry and checker all read only `ItemSource`.
   - `ParamSpec` is JSON-native, modeled on threeui's controls: number (with a `safe` range), color, palette, select, boolean, text, easing, spring, vec2, seed.
   - Labels are bilingual.
   - `provenance` records kind (upstream/original/agent), repo, paths, sha, spdx, copyright, modifications and assets.
2. **Previews always run in the sandboxed iframe**, curated items included. This keeps market, Studio, thumbnails and exports on the same pipeline and stops the site's styles from leaking into previews.
   - The iframe uses `sandbox="allow-scripts"`, giving it an opaque origin.
   - Messages are validated with zod, checked against `event.source`, carry a per-load nonce, and a heartbeat detects hangs.
   - Curated items are precompiled at build time with native esbuild. Studio compiles through `/api/compile`, also native esbuild, with bare imports marked external and resolved through the import map. The `Compiler` interface leaves room to switch to wasm later.
   - Parameter changes go over postMessage and take effect immediately without a rebuild (the optionsRef pattern).
3. **Baking parameters in.** Each component has a `/* @motif:defaults */ … /* @motif:end */` region, and the checker enforces that it matches the ParamSpec defaults.
   - `bake(source, values)` rewrites only that region. The zip, single-file copy, `/r/[slug].json?v=`, and the skill's `assets/` all go through it.
   - The SKILL.md gets a table (tuned value / default / safe range / meaning) and `metadata.params-hash`.
4. **Export.**
   - A Vite + React + Tailwind 4 starter zip, with the item, motif-runtime inlined, and the skill placed in both `.agents/skills/` and `.claude/skills/`.
   - Single-file copy.
   - A shadcn registry item.
   - Skill: a zip download, copied SKILL.md text, or `npx skills add`.
5. **Skills.** A `motif-design` master skill plus 7 category skills (motion, shaders, typography, background, scroll, 3d, micro-interaction).
   - They are written in our own words, with ideas and attribution from grade-A sources: LottieFiles motion-design, web-interface-guidelines, anthropics frontend-design (Apache), and the shadcn skill structure.
   - Rules come as Incorrect/Correct pairs.
   - A validator checks the name regex, that the name matches the folder, that the description is at most 1024 characters, and that the body is under 500 lines.
   - The Studio agent's system prompt is assembled from these skills.
6. **Agent.** Tools are defined once with zod:
   - `search_market`, `read_item`, `list_files`, `read_file`
   - `write_file` and `edit_file` (a unique exact match), which return compile diagnostics and checker findings immediately
   - `set_params`, `get_preview_status` (runtime errors, blank screen, and fps reported back by the browser), `finish`

   The `AgentRunner.run()` interface emits `AgentEvent`s, which `/api/agent` turns into a UI message stream. There are three runners, selected by `MOTIF_AGENT_PROVIDER`:
   - `anthropic` / `openai-compatible`: AI SDK 7 `ToolLoopAgent` with the built-in env key, rate limiting, and a per-session token budget.
   - `claude-cli`: Agent SDK with `pathToClaudeCodeExecutable`, model `claude-sonnet-5-5`, `tools: []`, only `mcp__motif__*` allowed, and `settingSources: ['user']` to keep the gateway proxy.
   - `scripted`: replays fixtures for tests.
7. **Licenses and provenance.** `sources.json` pins each upstream at a SHA. `pnpm ingest` then:
   - clones the upstream and converts CRLF to LF;
   - writes the SPDX, copyright and "Modified by Motif" headers, plus `SOURCE.md`;
   - runs codemods: framer-motion → motion/react, and `@/lib/utils` → the `cn` from motif-runtime.

   `pnpm audit` blocks any item without provenance, any disallowed license, and any banned pattern. `THIRD_PARTY_NOTICES.md` is generated automatically. Images are our own or CC0; nothing is taken from Unsplash or three.js examples assets.

## First batch: 48 items

| Source | Count | Items |
|---|---|---|
| paper-design/shaders (Apache-2.0, keep NOTICE) | 14 | mesh-gradient, grain-gradient, smoke-ring, warp, swirl, metaballs, neuro-noise, god-rays, dithering, pulsing-border, dot-orbit, spiral, waves, simplex-noise (no perlin/voronoi) |
| threeui (MIT) | 8 | liquid-form, energy-orb, crt, laser, ribbon-field, stream-convergence, bell-field, typography-vortex (raw WebGL/Canvas; loops replaced with runtime hooks) |
| magicui (MIT) | 10 | border-beam, blur-fade, number-ticker, marquee, dock, animated-beam, magic-card, text-animate, retro-grid, particles |
| motion-primitives (MIT) | 9 | text-effect, magnetic, tilt, spotlight, morphing-dialog, sliding-number, infinite-slider, text-scramble, border-trail |
| kokonutui / cult-ui (MIT) | 4 | particle-button, hold-button, dynamic-island, background-paths |
| cobe, WebGL-Fluid (MIT) | 2 | globe, fluid simulation (ported to TypeScript) |
| gl-transitions (MIT/BSD per file) | 1 | image transitions (~10 selectable, with our own images) |

Each item gets 3–5 presets, a bilingual title and description, reduced-motion handling, offscreen pausing, a DPR cap, and a micro-skill. The local CLI drafts the ParamSpec, presets and copy, which are then reviewed. Items built for three r128 (color management differs) and GSAP items go into the second batch.

## Visual quality gate (the core of "the effects have to be good")

`pnpm capture` runs Playwright on Edge with the preview's fixed clock.

**Automated gates:**
- the canvas is not blank (luma variance);
- frames differ between t = 0.5 / 2 / 4 s;
- zero console errors;
- under `reducedMotion: reduce` the item is static or crossfades;
- offscreen, rAF stops;
- 20 mount/unmount cycles produce no context loss;
- 3 viewports;
- fps ≥ 55 at 1440×900, recorded in `qa`.

**Additional checks:**
- **Parameter sweep contact sheet:** min, mid and max for every number parameter, plus every preset. If an extreme looks bad, the range is tightened, so no setting in Tune can look bad.
- **Upstream A/B:** the original and our port side by side at the same time t.
- **Human scorecard** on a dev-only `/qa` page: first impression, motion craft, whether the defaults are the best look, mobile, reduced-motion, and performance. Publish only if the average is ≥ 4 and no score is ≤ 2 (the user is the final taste judge).
- **Gallery loop videos:** step the clock frame by frame and encode with ffmpeg into seamless webm/mp4 (≤ 400 KB) plus a webp poster. The gallery shows **no live WebGL**; hovering plays the video. The detail page keeps a pool of at most 2 warm preview iframes.

## Phases (each ends with `pnpm verify` = lint + test + build green, plus that phase's e2e; commit per phase and push to main)

- **P0 Foundation.** Workspace, TypeScript 6, ESLint flat config with typed rules, Vitest, Playwright (Edge), `dev.mjs` that starts web and preview together, CLAUDE.md/AGENTS.md, `.editorconfig`. Spikes, each concluded in `docs/decisions/`:
  - (a) Next 16 + next-intl + Tailwind 4 + TS-source workspace packages.
  - (b) Prebundled vendor + import map working inside the opaque-origin iframe, with a single shared React instance and CORS `*`.
  - (c) The WebGL context limit on this machine, and GPU vs SwiftShader capture.
  - (d) A hello-tool through the claude-cli runner on Windows.
  - (e) `npx shadcn add` from localhost, and whether a `.claude/skills/` target works.
- **P1 Catalog + Market.**
  - Build out schema, runtime, vendor, the preview protocol, checker/audit and ingest, then take 12 pilot items end to end.
  - Build the market grid and detail page (server-side Shiki highlighting, License tab, NOTICE), plus the site's own design tokens and type system with self-hosted `next/font/local` fonts and a system Chinese stack.
  - Expand to 48 items.
  - Gate: audit clean, capture gates all pass, and e2e covers browse → detail → live preview for every item.
- **P2 Tune + Export.**
  - Tune is a side panel that stays next to the preview. The detail tabs become Code | Install | Skill | License.
  - Build the easing and spring editors, palette, vec2 and seed controls, presets, URL-hash sharing, reset and A/B against defaults, and `bake()`.
  - Build the zip, single-file copy, `/r/[slug].json` and per-item SKILL.md.
  - Gate: bake snapshot tests, `check:export` compiles every item's export, and 3 zips are installed and built by hand.
- **P3 Skills library.** The master skill, 7 category skills, the validator, a drift check on `skills/`, and a `/skills` page.
  - Gate: `npx skills add <local path>` succeeds in a temp project.
- **P4 Studio.**
  - Build `/api/compile`, sessions saved to `.data/sessions`, the three runners, a CodeMirror 6 code view, remix from the market, and "apply as defaults".
  - Sharing via `/r/s/<id>.json`, and all export paths reused.
  - Gate: scripted e2e covers remix and error → auto-fix. `pnpm smoke:agent` (manual, not part of verify) runs 3 real prompts through the local CLI Sonnet 5.5 and saves the transcripts to `.data/evals/`.
- **P5 Polish.**
  - A home-page showpiece, search, and docs.
  - Accessibility and performance: INP, and LCP using posters.
  - A subsetted Chinese display font.
  - A `look_at_preview` screenshot tool so the agent can check its own output visually.
  - A second batch of items: GSAP-based, image-based shaders, animata, smoothui.

**Out of scope for now:** user accounts and user-published market items (needs a database and moderation), production deployment and filings, and the real production model key. These wait for the user's decision.

## Verification (end to end)

1. `pnpm verify` is green: types, ESLint, Vitest (schema, bake, checker, param mapping, agent with MockLanguageModelV4 plus scripted runs), and build.
2. `pnpm audit` has zero findings; `THIRD_PARTY_NOTICES.md` matches the generated output.
3. `pnpm capture` passes all gates for all 48 items, produces the contact sheets for human review, and the scorecard meets the bar.
4. `pnpm e2e` (Edge): browse → detail → Tune → download zip → unzip, `pnpm i && pnpm build` succeeds; copy the skill → `npx skills add` succeeds; Studio scripted remix → preview → export.
5. `pnpm smoke:agent`: the local CLI Sonnet 5.5 completes 3 real generation tasks, each compiling with no errors and passing the checker.
6. At the end of each phase: commit (Conventional Commits, with the attribution line), push to `aimerfeng/motif` main, and report the results and screenshots to the user. GitHub Actions don't run for now because of the account's billing issue, so the local gates are what count.

## Main risks

- **Duplicate vendor instances** (two Reacts, two threes): every vendor bundle externalizes the other vendors, with a smoke test in the preview for each.
- **drei is large:** v1 uses an allowlist of its exports.
- **paper shaders 0.0.x can break without warning:** pin the exact version and diff the captures on every upgrade.
- **localhost vs 127.0.0.1 split** gives process isolation in dev; production needs its own registrable domain for previews.
- **Windows quirks:** CRLF upstream, POSIX paths in generated JSON, pnpm `allowBuilds` (esbuild, sharp), the CLI's `.exe` path.
- **Chinese display font size:** subsetting is needed, otherwise the first screen is slow.
