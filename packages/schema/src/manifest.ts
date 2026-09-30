import { z } from 'zod'
import { checkParamValue, L10nSchema, ParamSpecSchema, type JsonValue } from './params.ts'

/**
 * 市场的层级，从大到小：整站模板、设计风格、页面区块、功能组件、视觉效果。
 * 每个层级有自己的分类；分类名在所有层级里唯一（界面文案按分类名取）。
 */
export const KINDS = ['template', 'style', 'section', 'component', 'effect'] as const
export type Kind = (typeof KINDS)[number]

export const CATEGORIES_BY_KIND = {
  template: ['landing', 'saas', 'portfolio', 'product', 'agency', 'blog', 'event', 'app'],
  style: ['minimal', 'bold', 'retro', 'glass', 'editorial', 'technical', 'playful'],
  section: ['hero', 'navbar', 'features', 'pricing', 'testimonials', 'logos', 'stats', 'faq', 'cta', 'footer', 'team', 'changelog', 'posts', 'contact', 'showcase', 'dashboard'],
  component: ['loader', 'skeleton', 'progress', 'toast', 'button', 'input', 'toggle', 'tabs', 'menu', 'dialog', 'tooltip', 'badge', 'avatar', 'empty-state', 'navigation', 'data', 'layout'],
  effect: ['background', 'shader', 'text', 'card', 'cursor', 'transition', '3d'],
} as const satisfies Record<Kind, readonly string[]>

export type Category = (typeof CATEGORIES_BY_KIND)[Kind][number]
export const CATEGORIES: readonly Category[] = KINDS.flatMap((kind) => CATEGORIES_BY_KIND[kind])

export function kindOfCategory(category: Category): Kind {
  return KINDS.find((kind) => (CATEGORIES_BY_KIND[kind] as readonly string[]).includes(category))!
}

export const RUNTIMES = ['react', 'motion', 'css', 'svg', 'canvas2d', 'webgl', 'webgl2', 'three'] as const
export type Runtime = (typeof RUNTIMES)[number]

/** 允许整合进仓库的上游许可证（A 级）。 */
export const ALLOWED_SPDX = ['MIT', 'Apache-2.0', 'ISC', 'BSD-2-Clause', 'BSD-3-Clause', 'Zlib', 'Unlicense', 'CC0-1.0'] as const
export type AllowedSpdx = (typeof ALLOWED_SPDX)[number]

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const FILE_PATH = /^[a-z0-9][a-z0-9._-]*(?:\/[a-z0-9][a-z0-9._-]*)*$/i

const JsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(JsonValueSchema), z.record(z.string(), JsonValueSchema)]),
)

export const ProvenanceSchema = z.object({
  /** upstream：整合自上游；original：Motif 原创；agent：Studio 里由 agent 生成。 */
  kind: z.enum(['upstream', 'original', 'agent']),
  /** 基于哪个市场条目改出来的（remix）。 */
  basedOn: z.string().regex(SLUG).optional(),
  upstream: z
    .object({
      /** sources/sources.json 里的 id。 */
      source: z.string(),
      repo: z.string(),
      sha: z.string().regex(/^[0-9a-f]{40}$/),
      paths: z.array(z.string()).min(1),
      spdx: z.enum(ALLOWED_SPDX),
      copyright: z.array(z.string()).min(1),
      /** 上游自己声明的更早来源（例如 threeui 的 "Neuform export"）。 */
      origin: z.string().optional(),
    })
    .optional(),
  /** 相对上游做了哪些改动（Apache-2.0 要求标注修改）。 */
  modifications: z.array(z.string()),
  /** 条目自带的图片、字体等素材及其许可证。 */
  assets: z.array(z.object({ path: z.string(), spdx: z.string(), source: z.string() })),
})
export type Provenance = z.infer<typeof ProvenanceSchema>

export const PresetSchema = z.object({
  id: z.string().regex(SLUG),
  name: L10nSchema,
  values: z.record(z.string(), JsonValueSchema),
})
export type Preset = z.infer<typeof PresetSchema>

export const ItemManifestSchema = z
  .object({
    schemaVersion: z.literal(1),
    slug: z.string().regex(SLUG),
    status: z.enum(['draft', 'published']),
    title: L10nSchema,
    summary: L10nSchema,
    kind: z.enum(KINDS),
    category: z.enum(CATEGORIES as [Category, ...Category[]]),
    tags: z.array(z.string()),
    runtime: z.array(z.enum(RUNTIMES)).min(1),
    /** 组件本体：导出给用户使用的文件和导出名。 */
    entry: z.object({ file: z.string().regex(FILE_PATH), export: z.string() }),
    /** 预览用的演示：接收全部参数作为 props，负责摆放组件和演示内容。 */
    demo: z.object({
      file: z.string().regex(FILE_PATH),
      export: z.string(),
      theme: z.enum(['dark', 'light']),
    }),
    files: z
      .array(z.object({ path: z.string().regex(FILE_PATH), role: z.enum(['component', 'lib', 'shader', 'style', 'demo', 'asset']) }))
      .min(1),
    params: z.array(ParamSpecSchema),
    presets: z.array(PresetSchema),
    /** 用到的 vendor 模块（裸模块名）；版本由 vendor 清单统一决定。 */
    dependencies: z.array(z.string()),
    perf: z.object({ webgl: z.boolean(), maxDpr: z.number().min(1).max(3) }),
    /** 用户开启「减少动态效果」时的表现。 */
    a11y: z.object({ reducedMotion: z.enum(['static', 'crossfade', 'slowed', 'not-animated']) }),
    /**
     * 生成海报和循环视频的参数：posterTime 海报取第几秒；loop 循环视频多长（0 表示不生成，适合需要交互才会动的条目）；
     * zoom 放大倍数，卡片、按钮这类小组件用 1.5–2.5，让它在画面里占得更满。
     */
    capture: z
      .object({
        posterTime: z.number().min(0).max(20).optional(),
        loop: z.number().min(0).max(12).optional(),
        zoom: z.number().min(1).max(3).optional(),
      })
      .optional(),
    provenance: ProvenanceSchema,
  })
  .superRefine((manifest, ctx) => {
    if (kindOfCategory(manifest.category) !== manifest.kind) {
      ctx.addIssue({ code: 'custom', path: ['category'], message: `category "${manifest.category}" does not belong to kind "${manifest.kind}"` })
    }
    const paths = new Set(manifest.files.map((file) => file.path))
    if (!paths.has(manifest.entry.file)) ctx.addIssue({ code: 'custom', path: ['entry', 'file'], message: 'entry file is not listed in files' })
    if (!paths.has(manifest.demo.file)) ctx.addIssue({ code: 'custom', path: ['demo', 'file'], message: 'demo file is not listed in files' })

    const keys = new Set<string>()
    manifest.params.forEach((param, index) => {
      if (keys.has(param.key)) ctx.addIssue({ code: 'custom', path: ['params', index, 'key'], message: `duplicate param key "${param.key}"` })
      keys.add(param.key)
      const problem = checkParamValue(param, param.default)
      if (problem) ctx.addIssue({ code: 'custom', path: ['params', index, 'default'], message: problem })
    })

    manifest.presets.forEach((preset, index) => {
      for (const [key, value] of Object.entries(preset.values)) {
        const param = manifest.params.find((p) => p.key === key)
        if (!param) {
          ctx.addIssue({ code: 'custom', path: ['presets', index, 'values', key], message: `unknown param "${key}"` })
          continue
        }
        const problem = checkParamValue(param, value)
        if (problem) ctx.addIssue({ code: 'custom', path: ['presets', index, 'values', key], message: problem })
      }
    })

    if (manifest.provenance.kind === 'upstream' && !manifest.provenance.upstream) {
      ctx.addIssue({ code: 'custom', path: ['provenance', 'upstream'], message: 'upstream items must record their upstream source' })
    }
  })

export type ItemManifest = z.infer<typeof ItemManifestSchema>

/** 条目的完整内容：清单 + 所有文件的文本。市场条目和 Studio 工作区都是这个形状。 */
export interface ItemSource {
  manifest: ItemManifest
  files: Record<string, string>
}

/** 在 item.ts 里声明条目清单，只做类型检查，原样返回。 */
export function defineItem(manifest: ItemManifest): ItemManifest {
  return manifest
}
