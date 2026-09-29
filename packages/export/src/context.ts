import type { ItemSource, ParamValues } from '@motif/schema'
import { VENDOR_ENTRIES } from '@motif/vendor/manifest'

/** 导出时需要的站点级信息（来自 catalog.json）。 */
export interface ExportContext {
  /** 站点地址，例如 https://motif.dev；用于 registry URL 和 Skill 里的来源链接。 */
  origin: string
  /** 条目的来源链接；默认是站点的详情页，仓库里提交的 skill 改成指向 GitHub 上的条目目录。 */
  itemUrl?: (slug: string) => string
  /** vendor 包名 → 版本（沙箱里实际使用的版本）。 */
  vendor: Record<string, string>
  runtime: {
    /** packages/runtime/src 下的源码，文件名 → 文本。 */
    files: Record<string, string>
    /** motif-runtime 自己的 npm 依赖（clsx、tailwind-merge）及版本范围。 */
    dependencies: Record<string, string>
    /** 主题变量（packages/runtime/src/theme.css）。 */
    themeCss: string
  }
}

export interface ExportInput {
  item: ItemSource
  /** 用户调好的参数值（完整的一组，含未改动的默认值）。 */
  values: ParamValues
  context: ExportContext
}

export function itemUrl(context: ExportContext, slug: string): string {
  return context.itemUrl ? context.itemUrl(slug) : `${context.origin}/market/${slug}`
}

const RUNTIME_ID = '@motif/runtime'
const REACT_IDS = new Set(['react', 'react/jsx-runtime', 'react-dom', 'react-dom/client'])

/** 条目依赖对应的 npm 包及版本范围（不含 React 和 motif-runtime，后者随导出内联）。 */
export function npmDependencies(item: ItemSource, context: ExportContext): Record<string, string> {
  const deps: Record<string, string> = {}
  for (const id of item.manifest.dependencies) {
    if (id === RUNTIME_ID || REACT_IDS.has(id)) continue
    const entry = VENDOR_ENTRIES.find((candidate) => candidate.id === id)
    const pkg = entry?.pkg ?? id
    const version = context.vendor[pkg]
    deps[pkg] = version ? `^${version}` : 'latest'
  }
  if (item.manifest.dependencies.includes(RUNTIME_ID)) Object.assign(deps, context.runtime.dependencies)
  return Object.fromEntries(Object.entries(deps).sort(([a], [b]) => a.localeCompare(b)))
}

export function usesRuntime(item: ItemSource): boolean {
  return item.manifest.dependencies.includes(RUNTIME_ID) || Object.values(item.files).some((code) => code.includes(`'${RUNTIME_ID}'`))
}

/** 把 `from '@motif/runtime'` 改成导出目标里的实际路径。 */
export function rewriteRuntimeImport(code: string, specifier: string): string {
  return code.replaceAll(/(from\s+)(['"])@motif\/runtime\2/g, `$1$2${specifier}$2`)
}
