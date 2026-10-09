import { bake, defaultsOf, printDefaults, type ItemManifest, type ItemSource, type ParamValues } from '@motif/schema/core'

/**
 * Studio 的工作区就是一个 ItemSource。清单以虚拟文件 item.json 的形式出现在 agent 眼前，
 * 和其他文件一样读写——模型改 JSON 比调一堆专门的「改清单」工具可靠。
 */
export const MANIFEST_PATH = 'item.json'

const FILE_PATH = /^[a-z0-9][a-z0-9._-]*(?:\/[a-z0-9][a-z0-9._-]*)*$/i
const ROLE_BY_EXTENSION: Record<string, ItemManifest['files'][number]['role']> = { tsx: 'component', ts: 'lib', css: 'style', glsl: 'shader', frag: 'shader', vert: 'shader' }
const MAX_FILE_BYTES = 200_000
const MAX_FILES = 40

export type WorkspaceResult = { ok: true; item: ItemSource; note?: string } | { ok: false; error: string }

export function listFiles(item: ItemSource): { path: string; bytes: number; role: string }[] {
  const roles = new Map(item.manifest.files.map((file) => [file.path, file.role]))
  return [
    { path: MANIFEST_PATH, bytes: printManifest(item.manifest).length, role: 'manifest' },
    ...Object.entries(item.files).map(([path, text]) => ({ path, bytes: text.length, role: roles.get(path) ?? 'unlisted' })),
  ]
}

const PRINT_WIDTH = 100

/** 像人手写的 JSON：放得下一行（含缩进不超过 100 字符）的数组和对象写在一行，否则展开。 */
function printJson(value: unknown, indent: string): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  const oneLine = inline(value)
  if (indent.length + oneLine.length <= PRINT_WIDTH) return oneLine
  const inner = `${indent}  `
  if (Array.isArray(value)) return `[\n${value.map((item) => `${inner}${printJson(item, inner)}`).join(',\n')}\n${indent}]`
  const entries = definedEntries(value).map(([key, item]) => `${inner}${JSON.stringify(key)}: ${printJson(item, inner)}`)
  return `{\n${entries.join(',\n')}\n${indent}}`
}

/** 写在一行时带常规的空格：{ "a": 1, "b": [1, 2] }。 */
function inline(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(inline).join(', ')}]`
  const entries = definedEntries(value).map(([key, item]) => `${JSON.stringify(key)}: ${inline(item)}`)
  return entries.length ? `{ ${entries.join(', ')} }` : '{}'
}

function definedEntries(value: object): [string, unknown][] {
  return Object.entries(value).filter(([, item]) => item !== undefined)
}

export function printManifest(manifest: ItemManifest): string {
  return `${printJson(manifest, '')}\n`
}

export function readFile(item: ItemSource, path: string): string | null {
  if (path === MANIFEST_PATH) return printManifest(item.manifest)
  return item.files[path] ?? null
}

export function writeFile(item: ItemSource, path: string, content: string): WorkspaceResult {
  if (path === MANIFEST_PATH) {
    let manifest: unknown
    try {
      manifest = JSON.parse(content)
    } catch (error) {
      return { ok: false, error: `item.json is not valid JSON: ${error instanceof Error ? error.message : String(error)}` }
    }
    if (typeof manifest !== 'object' || manifest === null || Array.isArray(manifest)) return { ok: false, error: 'item.json must be a JSON object' }
    // 字段是否合法交给检查器（它会逐条报告），这里只保证形状是对象。
    return { ok: true, item: { manifest: manifest as ItemManifest, files: item.files } }
  }
  if (!FILE_PATH.test(path) || path.split('/').includes('..')) return { ok: false, error: `"${path}" is not a valid relative file path (lowercase letters, digits, dots, dashes, slashes)` }
  if (content.length > MAX_FILE_BYTES) return { ok: false, error: `files are limited to ${MAX_FILE_BYTES / 1000} KB` }
  const isNew = !(path in item.files)
  if (isNew && Object.keys(item.files).length >= MAX_FILES) return { ok: false, error: `an item can have at most ${MAX_FILES} files` }

  const files = { ...item.files, [path]: content }
  let manifest = item.manifest
  let note: string | undefined
  // 新文件自动登记进清单，省得 agent 再改一次 item.json；角色按扩展名推断。
  if (Array.isArray(manifest.files) && !manifest.files.some((file) => file.path === path)) {
    const role = ROLE_BY_EXTENSION[path.split('.').pop() ?? ''] ?? 'asset'
    manifest = { ...manifest, files: [...manifest.files, { path, role }] }
    note = `Registered ${path} in item.json with role "${role}".`
  }
  return { ok: true, item: { manifest, files }, ...(note ? { note } : {}) }
}

/** 精确替换：old 必须在文件里恰好出现一次，避免改错地方。 */
export function editFile(item: ItemSource, path: string, oldText: string, newText: string): WorkspaceResult {
  const current = readFile(item, path)
  if (current === null) return { ok: false, error: `${path} does not exist` }
  if (oldText === '') return { ok: false, error: 'old_string must not be empty' }
  const first = current.indexOf(oldText)
  if (first === -1) return { ok: false, error: `old_string was not found in ${path}; read the file again and copy the exact text` }
  if (current.indexOf(oldText, first + 1) !== -1) return { ok: false, error: `old_string appears more than once in ${path}; include more surrounding lines so it is unique` }
  return writeFile(item, path, current.slice(0, first) + newText + current.slice(first + oldText.length))
}

export function deleteFile(item: ItemSource, path: string): WorkspaceResult {
  if (path === MANIFEST_PATH) return { ok: false, error: 'item.json cannot be deleted' }
  if (!(path in item.files)) return { ok: false, error: `${path} does not exist` }
  if (path === item.manifest.entry?.file || path === item.manifest.demo?.file) return { ok: false, error: `${path} is the entry or demo file; point item.json at another file first` }
  const files = { ...item.files }
  delete files[path]
  const manifest = Array.isArray(item.manifest.files) ? { ...item.manifest, files: item.manifest.files.filter((file) => file.path !== path) } : item.manifest
  return { ok: true, item: { manifest, files } }
}

/**
 * 条目换了一版之后，预览里的参数怎么延续：用户没动过的参数（值等于旧默认值）跟着新默认值走，
 * 动过的保留；已经删掉的参数丢弃，新参数用默认值。agent 改默认值时，预览才会立刻显示新样子。
 */
export function carryValues(previous: ItemSource, next: ItemSource, values: ParamValues): ParamValues {
  const oldDefaults = Array.isArray(previous.manifest.params) ? defaultsOf(previous.manifest.params) : {}
  const result: ParamValues = {}
  for (const param of Array.isArray(next.manifest.params) ? next.manifest.params : []) {
    const value = values[param.key]
    const untouched = value === undefined || JSON.stringify(value) === JSON.stringify(oldDefaults[param.key])
    result[param.key] = untouched ? param.default : value
  }
  return result
}

/** 「应用为默认值」：把调好的参数写成参数定义的默认值，并重写组件里的默认值区域。 */
export function applyDefaults(item: ItemSource, values: ParamValues): ItemSource {
  const params = item.manifest.params.map((param) => (param.key in values ? { ...param, default: values[param.key] } : param)) as ItemManifest['params']
  const entry = item.manifest.entry.file
  const source = item.files[entry]
  const files = source === undefined ? item.files : { ...item.files, [entry]: bake(source, defaultsOf(params)) }
  return { manifest: { ...item.manifest, params }, files }
}

/** 基于市场条目改：保留上游来源和许可证头（代码仍然源自上游），记下 basedOn。 */
export function remixItem(base: ItemSource, slug: string): ItemSource {
  const provenance = base.manifest.provenance
  return {
    manifest: {
      ...structuredClone(base.manifest),
      slug,
      provenance: {
        ...structuredClone(provenance),
        basedOn: base.manifest.slug,
        modifications: [...provenance.modifications, `Remixed from ${base.manifest.slug} in Motif Studio.`],
      },
    },
    files: { ...base.files },
  }
}

/** 从零开始的起点：一个能跑、能调的柔和渐变背景，agent 在它上面改写成用户要的效果。 */
export function starterItem(slug: string): ItemSource {
  const manifest: ItemManifest = {
    schemaVersion: 1,
    slug,
    status: 'published',
    title: { 'zh-CN': '新效果', en: 'New effect' },
    summary: { 'zh-CN': '在工作台里生成的效果。', en: 'An effect made in Motif Studio.' },
    kind: 'effect',
    category: 'background',
    tags: ['studio'],
    runtime: ['react', 'css'],
    entry: { file: 'effect.tsx', export: 'Effect' },
    demo: { file: 'demo.tsx', export: 'Demo', theme: 'dark' },
    files: [
      { path: 'effect.tsx', role: 'component' },
      { path: 'demo.tsx', role: 'demo' },
    ],
    params: [
      { key: 'colors', type: 'palette', group: 'color', label: { 'zh-CN': '颜色', en: 'Colors' }, default: ['#7c3aed', '#06b6d4', '#f472b6'], minItems: 2, maxItems: 5 },
      { key: 'speed', type: 'number', group: 'motion', label: { 'zh-CN': '速度', en: 'Speed' }, default: 1, min: 0.2, max: 3, step: 0.05, unit: 'x', safe: [0.5, 1.6] },
      { key: 'softness', type: 'number', group: 'look', label: { 'zh-CN': '柔和度', en: 'Softness' }, default: 60, min: 20, max: 120, step: 1, unit: 'px', safe: [40, 90] },
    ],
    presets: [],
    dependencies: ['@motif/runtime'],
    perf: { webgl: false, maxDpr: 2 },
    a11y: { reducedMotion: 'static' },
    provenance: { kind: 'agent', modifications: [], assets: [] },
  }
  const effect = `import { cn, useFrameLoop } from '@motif/runtime'
import { useRef, type CSSProperties, type ReactNode } from 'react'

${printDefaults(defaultsOf(manifest.params))}

export type EffectProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  children?: ReactNode
}

/** 几团颜色沿各自的轨道慢慢漂移、互相晕染。位置写进 CSS 变量，不触发 React 重渲染。 */
export function Effect({ className, style, children, ...props }: EffectProps) {
  const { colors, speed, softness } = { ...defaults, ...props }
  const ref = useRef<HTMLDivElement>(null)

  useFrameLoop(
    ref,
    ({ time }) => {
      const element = ref.current
      if (!element) return
      colors.forEach((_, index) => {
        const angle = time * 0.18 + (index * Math.PI * 2) / colors.length
        element.style.setProperty(\`--x\${index}\`, \`\${50 + Math.cos(angle) * 30}%\`)
        element.style.setProperty(\`--y\${index}\`, \`\${50 + Math.sin(angle * 1.3) * 24}%\`)
      })
    },
    { speed, reducedMotion: 'static', staticTime: 2 },
  )

  const layers = colors.map((color, index) => \`radial-gradient(45% 55% at var(--x\${index}, 50%) var(--y\${index}, 50%), \${color}, transparent 70%)\`).join(', ')

  return (
    <div ref={ref} className={cn('relative isolate overflow-hidden bg-[#0b0b12]', className)} style={style}>
      <div aria-hidden className="absolute -inset-[10%]" style={{ background: layers, filter: \`blur(\${softness}px)\` }} />
      {children && <div className="relative">{children}</div>}
    </div>
  )
}
`
  const demo = `import { Effect, type EffectProps } from './effect'

export function Demo(props: EffectProps) {
  return (
    <Effect {...props} className="grid h-full w-full place-items-center">
      <p className="text-center text-3xl font-semibold tracking-tight text-white/90">Motif Studio</p>
    </Effect>
  )
}
`
  return { manifest, files: { 'effect.tsx': effect, 'demo.tsx': demo } }
}
