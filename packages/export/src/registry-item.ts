import type { ItemSource, ParamValues } from '@motif/schema'
import { itemUrl, npmDependencies, rewriteRuntimeImport, usesRuntime, type ExportContext } from './context.ts'
import { bundleRuntime } from './runtime-bundle.ts'

/** shadcn registry-item 的最小类型（https://ui.shadcn.com/schema/registry-item.json）。 */
export interface RegistryItemJson {
  $schema: string
  name: string
  type: 'registry:component' | 'registry:lib'
  title: string
  description: string
  dependencies: string[]
  registryDependencies: string[]
  files: { path: string; type: 'registry:component' | 'registry:lib' | 'registry:file'; content: string; target?: string }[]
  meta?: Record<string, unknown>
}

const SCHEMA = 'https://ui.shadcn.com/schema/registry-item.json'

/** motif-runtime 本身作为一个 registry:lib，条目通过 registryDependencies 引用它。 */
export function runtimeRegistryItem(context: ExportContext): RegistryItemJson {
  return {
    $schema: SCHEMA,
    name: 'motif-runtime',
    type: 'registry:lib',
    title: 'motif-runtime',
    description: 'Hooks shared by Motif components: frame loop with offscreen pause and reduced-motion handling, canvas sizing, WebGL helpers.',
    dependencies: Object.entries(context.runtime.dependencies).map(([pkg, range]) => `${pkg}@${range}`),
    registryDependencies: [],
    files: [{ path: 'registry/motif/lib/motif-runtime.ts', type: 'registry:lib', content: bundleRuntime(context.runtime.files), target: 'lib/motif-runtime.ts' }],
  }
}

/**
 * 条目的 registry item：`npx shadcn add <origin>/r/<slug>.json` 安装。
 * 所有文件落在 components/motif/<slug>/，保持条目内部的相对导入可用；参数值已写进 defaults。
 */
export function itemRegistryItem(item: ItemSource, values: ParamValues, context: ExportContext, options: { bakedEntry: string; hash: string }): RegistryItemJson {
  const { manifest } = item
  const dir = `components/motif/${manifest.slug}`
  const files: RegistryItemJson['files'] = []
  for (const file of manifest.files) {
    if (file.role === 'demo' || file.role === 'asset') continue
    const code = file.path === manifest.entry.file ? options.bakedEntry : item.files[file.path] ?? ''
    files.push({
      path: `registry/motif/${manifest.slug}/${file.path}`,
      type: file.path.endsWith('.css') ? 'registry:file' : 'registry:component',
      content: rewriteRuntimeImport(code, '@/lib/motif-runtime'),
      target: `${dir}/${file.path}`,
    })
  }
  const npm = npmDependencies(item, context)
  delete npm.clsx
  delete npm['tailwind-merge']
  return {
    $schema: SCHEMA,
    name: manifest.slug,
    type: 'registry:component',
    title: manifest.title.en,
    description: manifest.summary.en,
    dependencies: Object.entries(npm).map(([pkg, range]) => `${pkg}@${range}`),
    registryDependencies: usesRuntime(item) ? [`${context.origin}/r/motif-runtime.json`] : [],
    files,
    meta: { motif: { slug: manifest.slug, params: manifest.params, values, hash: options.hash, source: itemUrl(context, manifest.slug) } },
  }
}
