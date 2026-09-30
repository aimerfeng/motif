import type { Category, ItemSource, Kind, ParamSpec, ParamValues } from '@motif/schema'
import { printDefaults } from '@motif/schema'
import { fontImports, itemUrl, npmDependencies, usesRuntime, rewriteRuntimeImport, type ExportContext } from './context.ts'
import { bundleRuntime } from './runtime-bundle.ts'

/** Skill 的目录名与 name 字段：统一 motif- 前缀，避免和用户自己的 skill 冲突。 */
export function skillName(slug: string): string {
  return `motif-${slug}`.slice(0, 64)
}

interface Guide {
  use: string[]
  rules: string[]
}

/** 各层级的默认建议；分类有更具体的建议时用分类的。写进每个条目 Skill 的「When to use」和「Rules」。 */
const KIND_GUIDE: Record<Kind, Guide> = {
  template: {
    use: ['A starting point for a whole website or landing page. Adapt the copy, colors and sections to the product rather than shipping it as is.'],
    rules: [
      'Keep one signature moment per page; every other section stays calm.',
      'Replace every placeholder text and image before shipping.',
      'Keep the section order meaningful: promise → proof → details → action.',
    ],
  },
  style: {
    use: ['Give a product a coherent visual language: color tokens, typography, borders, shadows, radius and motion together.'],
    rules: ['Apply the tokens everywhere; do not mix in components from another style.', 'Keep text contrast accessible even when the style is loud.'],
  },
  section: {
    use: ['A building block for a page. Combine sections into a landing page or drop one into an existing page.'],
    rules: ['Match container width and vertical rhythm with the neighbouring sections.', 'Headings say something specific about the product; avoid generic marketing phrases.'],
  },
  component: {
    use: ['A functional UI control or state indicator.'],
    rules: ['Keyboard and screen-reader behaviour must work; the animation sits on top of that.', 'Feedback starts within 100 ms of the interaction.'],
  },
  effect: {
    use: ['A visual effect for moments that deserve attention.'],
    rules: ['Use it sparingly: one such effect per viewport.'],
  },
}

const CATEGORY_GUIDE: Partial<Record<Category, Guide>> = {
  loader: {
    use: ['Indeterminate waits longer than ~300 ms: fetching, processing, generating.'],
    rules: ['Show it only after a short delay (~300 ms) so fast responses never flash a spinner.', 'Give it an accessible name (role="status" and a label); stop it under reduced motion or slow it right down.'],
  },
  skeleton: {
    use: ['Placeholders that mirror the layout of content that is loading.'],
    rules: ['Match the real layout so nothing jumps when content arrives.', 'Keep the shimmer subtle and slow; replace it with a static tint under reduced motion.'],
  },
  progress: {
    use: ['Determinate work where the remaining amount is known: uploads, steps, installs.'],
    rules: ['Never move backwards; ease the bar but keep it honest.', 'Expose value with role="progressbar" and aria-valuenow.'],
  },
  toast: {
    use: ['Brief confirmation of an action the user just took, or a non-blocking error.'],
    rules: ['Keep messages short and use the same verb as the action.', 'Toasts that contain actions must stay until dismissed and be reachable by keyboard.'],
  },
  background: {
    use: ['Full-bleed hero or section backgrounds where slow ambient motion supports the headline.', 'Behind short, large text — not behind dense body copy, tables or forms.'],
    rules: ['Use at most one animated background per viewport.', 'Check text contrast against the lightest and darkest parts; add a scrim if needed.'],
  },
  shader: {
    use: ['A single focal visual: hero art, section dividers, product moments.'],
    rules: ['Mount one instance per viewport; browsers allow roughly 16 live WebGL contexts per page.', 'Keep the DPR cap; large canvases on 4K screens get expensive fast.'],
  },
  text: {
    use: ['Headlines and short labels that deserve a moment of attention.'],
    rules: ['Animate a headline once per view, not on every re-render.', 'Keep the text readable and selectable; never animate body copy.'],
  },
  button: {
    use: ['Primary calls to action where feedback on press or hover adds confidence.'],
    rules: ['Feedback must start within 100 ms of the interaction.', 'Keep the effect on one button per view; secondary buttons stay calm.'],
  },
  card: {
    use: ['Pricing, feature or sign-in cards that should draw the eye.'],
    rules: ['Highlight one card in a group, not all of them.', 'The effect must not reduce the legibility of the card content.'],
  },
  cursor: { use: ['Playful or editorial pages where the pointer is part of the experience.'], rules: ['Never hide the system cursor on touch devices or in forms.'] },
  navigation: { use: ['Docks, bars and menus where motion explains spatial relationships.'], rules: ['Navigation must stay usable with the keyboard; motion is decoration on top.'] },
  layout: { use: ['Lists, grids and panels whose items enter, reorder or expand.'], rules: ['Stagger at most ~50 ms per item and cap the total stagger around 400 ms.'] },
  data: { use: ['Numbers, stats and small data displays that change over time.'], rules: ['Use tabular numerals so digits do not jump horizontally.'] },
  transition: { use: ['Moments that swap one image, slide or view for another.'], rules: ['Keep transitions under ~800 ms for UI; longer only for showcase sequences.'] },
  '3d': { use: ['Showpiece visuals: globes, objects, spatial scenes.'], rules: ['Provide a static fallback for low-power devices and reduced motion.'] },
}

const REDUCED_MOTION: Record<string, string> = {
  static: 'holds a single still frame',
  crossfade: 'switches to simple crossfades',
  slowed: 'plays at a quarter of the speed',
  'not-animated': 'is not animated',
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.map((v) => formatValue(v)).join(', ')
  if (value !== null && typeof value === 'object') return Object.entries(value).map(([k, v]) => `${k} ${formatValue(v)}`).join(', ')
  return String(value)
}

function rangeOf(param: ParamSpec): string {
  switch (param.type) {
    case 'number':
    case 'vec2': {
      const unit = param.type === 'number' && param.unit ? ` ${param.unit}` : ''
      const safe = param.type === 'number' && param.safe ? ` (best ${param.safe[0]}–${param.safe[1]})` : ''
      return `${param.min}–${param.max}${unit}${safe}`
    }
    case 'select':
      return param.options.map((option) => option.value).join(' / ')
    case 'palette':
      return `${param.minItems}–${param.maxItems} colors`
    case 'text':
      return `≤ ${param.maxLength} chars`
    case 'spring':
      return 'visualDuration s, bounce 0–1'
    case 'easing':
      return 'cubic-bezier'
    default:
      return param.type
  }
}

export interface SkillOptions {
  hash: string
}

/** 生成条目的 SKILL.md（agentskills.io 格式，只用标准字段）。 */
export function skillMarkdown(item: ItemSource, values: ParamValues, context: ExportContext, options: SkillOptions): string {
  const { manifest } = item
  const name = skillName(manifest.slug)
  const license = manifest.provenance.upstream?.spdx ?? 'MIT'
  const deps = Object.keys(npmDependencies(item, context))
  const base = CATEGORY_GUIDE[manifest.category] ?? KIND_GUIDE[manifest.kind]
  // 条目自己的说明优先：用途替换通用用途，规则排在通用规则前面。
  const guide: Guide = {
    use: manifest.guidance?.use?.length ? manifest.guidance.use : base.use,
    rules: [...(manifest.guidance?.rules ?? []), ...base.rules],
  }
  const entry = manifest.entry
  const assetFiles = manifest.files.filter((file) => file.role !== 'demo' && file.role !== 'asset')
  const title = `${manifest.title.en} (${manifest.title['zh-CN']})`
  const trigger = [manifest.title.en, manifest.title['zh-CN'], ...manifest.tags].join(', ')
  const description = `${manifest.summary.en} Use when the user asks for ${trigger} or a similar effect. Includes the parameters tuned on Motif.`

  const rows = manifest.params.map((param) => {
    const meaning = (param.hint ?? param.label).en.replaceAll('|', '/')
    return `| \`${param.key}\` | ${formatValue(values[param.key] ?? param.default)} | ${formatValue(param.default)} | ${rangeOf(param)} | ${meaning} |`
  })

  const importPath = `@/components/motif/${manifest.slug}/${entry.file.replace(/\.tsx?$/, '')}`
  const lines = [
    '---',
    `name: ${name}`,
    `description: ${JSON.stringify(description.slice(0, 1024))}`,
    `license: ${license}`,
    `compatibility: React 18+ with Tailwind CSS v4.${deps.length ? ` Needs ${deps.join(', ')}.` : ''}`,
    'metadata:',
    `  source: ${JSON.stringify(itemUrl(context, manifest.slug))}`,
    `  motif-item: ${JSON.stringify(manifest.slug)}`,
    `  params-hash: ${JSON.stringify(options.hash)}`,
    '---',
    '',
    `# ${title}`,
    '',
    manifest.summary.en,
    '',
    '## When to use',
    '',
    ...guide.use.map((line) => `- ${line}`),
    '',
    '## Files',
    '',
    ...assetFiles.map((file) => `- \`assets/${file.path}\`${file.path === entry.file ? ` — the component (\`${entry.export}\`); the tuned values are baked into its \`defaults\` object` : ''}`),
    ...(usesRuntime(item) ? ['- `assets/motif-runtime.ts` — small shared hooks the component imports; place it at `src/lib/motif-runtime.ts`'] : []),
    '',
    '## Install',
    '',
    `1. ${deps.length ? `Install dependencies: \`npm install ${deps.join(' ')}\`.` : 'No extra dependencies beyond React.'}`,
    `2. Copy the files from \`assets/\` into \`src/components/motif/${manifest.slug}/\`${usesRuntime(item) ? ' (and `motif-runtime.ts` into `src/lib/`)' : ''}. Keep the license header comments.`,
    `3. The project needs Tailwind CSS v4. If it does not define the shadcn-style color tokens (\`--background\`, \`--foreground\`, \`--primary\` …), add \`assets/theme.css\` to the global stylesheet.`,
    ...(fontImports(item).length > 0
      ? [`   Fonts (self-hosted, OFL): add ${fontImports(item).map((specifier) => `\`@import '${specifier}';\``).join(', ')} to the global stylesheet.`]
      : []),
    `4. Use it:`,
    '',
    '```tsx',
    `import { ${entry.export} } from '${importPath}'`,
    '',
    `<${entry.export} />`,
    '```',
    '',
    '## Tuned parameters',
    '',
    'Change them through props, or edit the `defaults` object in the component. Stay inside the ranges; the "best" range is where the effect looks its best.',
    '',
    '| Param | Value | Default | Range | Meaning |',
    '| --- | --- | --- | --- | --- |',
    ...rows,
    '',
    '## Rules',
    '',
    ...guide.rules.map((line) => `- ${line}`),
    `- Respect \`prefers-reduced-motion\`: this component already ${REDUCED_MOTION[manifest.a11y.reducedMotion] ?? 'handles it'} when it is set. Keep that behavior.`,
    '- Animate only `transform`, `opacity` and other compositor-friendly properties; never use `transition: all`.',
    ...(manifest.perf.webgl ? [`- WebGL: device pixel ratio is capped at ${manifest.perf.maxDpr}; rendering pauses when offscreen or in a hidden tab. Keep both.`] : []),
    `- License: ${license}. Keep the header comments in each file${manifest.provenance.upstream ? ` (originally from ${manifest.provenance.upstream.repo})` : ''}.`,
    '',
  ]
  return lines.join('\n')
}

/** Skill 目录里的全部文件（相对 `<skillName>/`）：SKILL.md + assets。 */
export function skillFiles(item: ItemSource, values: ParamValues, context: ExportContext, options: SkillOptions & { bakedEntry: string }): Record<string, string> {
  const { manifest } = item
  const files: Record<string, string> = { 'SKILL.md': skillMarkdown(item, values, context, options) }
  for (const file of manifest.files) {
    if (file.role === 'demo' || file.role === 'asset') continue
    const code = file.path === manifest.entry.file ? options.bakedEntry : item.files[file.path] ?? ''
    files[`assets/${file.path}`] = rewriteRuntimeImport(code, '@/lib/motif-runtime')
  }
  if (usesRuntime(item)) files['assets/motif-runtime.ts'] = bundleRuntime(context.runtime.files)
  files['assets/theme.css'] = context.runtime.themeCss
  return files
}

export { printDefaults }
