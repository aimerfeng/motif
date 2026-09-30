import { createHash } from 'node:crypto'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { checkItem, type Finding, type SourceRecord } from '@motif/checker'
import { compileItem } from '@motif/compiler'
import type { ItemSource } from '@motif/schema'
import { FONT_FAMILIES, VENDOR_IDS } from '@motif/vendor'
import { CATALOG_PATH, type Catalog, type CatalogItem, type CatalogRuntime } from './catalog.ts'
import { loadAllItems, loadSourceRecords, REPO_ROOT } from './load.ts'

export interface BuildRegistryOptions {
  /** 编译产物（<slug>.<hash>.js / .css）写到这里。不传则只检查、不写文件。 */
  outDir?: string
  /** 产物在预览沙箱里的 URL 前缀。 */
  urlBase?: string
  minify?: boolean
  vendorVersions?: Record<string, string>
  /** watch 模式：重新加载改过的 item.ts。 */
  fresh?: boolean
  /** 是否写出 catalog.json（默认写；测试里关掉）。 */
  writeCatalog?: boolean
}

export interface BuildRegistryResult {
  catalog: Catalog
  /** 所有 error 级别的问题（含加载失败），为空才算构建成功。 */
  errors: { slug: string; finding: Finding }[]
}

const hash = (text: string) => createHash('sha256').update(text).digest('hex').slice(0, 10)

/** motif-runtime 的源码与依赖，导出时内联进用户项目。 */
export async function loadRuntime(): Promise<CatalogRuntime> {
  const dir = path.join(REPO_ROOT, 'packages/runtime')
  const src = path.join(dir, 'src')
  const files: Record<string, string> = {}
  for (const file of (await readdir(src)).filter((name) => name.endsWith('.ts')).sort()) {
    files[file] = (await readFile(path.join(src, file), 'utf8')).replaceAll('\r\n', '\n')
  }
  const pkg = JSON.parse(await readFile(path.join(dir, 'package.json'), 'utf8')) as { dependencies?: Record<string, string> }
  const themeCss = (await readFile(path.join(src, 'theme.css'), 'utf8')).replaceAll('\r\n', '\n')
  return { files, dependencies: pkg.dependencies ?? {}, themeCss }
}

/** 检查并编译一个条目。 */
export async function buildItem(item: ItemSource, sources: readonly SourceRecord[], options: BuildRegistryOptions): Promise<CatalogItem> {
  const findings = checkItem(item, { sources, vendorIds: VENDOR_IDS, fonts: FONT_FAMILIES })
  const compiled = await compileItem({ files: item.files, entry: item.manifest.demo.file, minify: options.minify ?? false })
  for (const diagnostic of compiled.diagnostics) {
    const location = diagnostic.file ? `${diagnostic.file}${diagnostic.line ? `:${diagnostic.line}` : ''}` : undefined
    findings.push({ level: diagnostic.level, rule: 'compile', message: diagnostic.message, ...(location ? { file: location } : {}) })
  }

  let build: CatalogItem['build'] = null
  if (compiled.ok) {
    const slug = item.manifest.slug
    const js = `${slug}.${hash(compiled.js)}.js`
    const css = `${slug}.${hash(compiled.css)}.css`
    if (options.outDir) {
      await writeFile(path.join(options.outDir, js), compiled.js)
      await writeFile(path.join(options.outDir, css), compiled.css)
    }
    const base = options.urlBase ?? '/items/'
    build = { js: `${base}${js}`, css: `${base}${css}`, jsBytes: Buffer.byteLength(compiled.js), cssBytes: Buffer.byteLength(compiled.css) }
  }
  return { manifest: item.manifest, files: item.files, build, findings }
}

/** 构建整个目录：检查、编译每个条目，写出产物和 catalog.json。 */
export async function buildRegistry(options: BuildRegistryOptions = {}): Promise<BuildRegistryResult> {
  const [{ items, failures }, sources] = await Promise.all([loadAllItems({ fresh: options.fresh ?? false }), loadSourceRecords()])
  if (options.outDir) {
    await rm(options.outDir, { recursive: true, force: true })
    await mkdir(options.outDir, { recursive: true })
  }

  const [built, runtime] = await Promise.all([Promise.all(items.map((item) => buildItem(item, sources, options))), loadRuntime()])
  const catalog: Catalog = { generatedAt: new Date().toISOString(), vendor: options.vendorVersions ?? {}, runtime, items: built }
  if (options.writeCatalog ?? true) await writeCatalog(catalog)

  const errors: BuildRegistryResult['errors'] = []
  for (const failure of failures) {
    errors.push({ slug: path.basename(failure.dir), finding: { level: 'error', rule: 'load', message: failure.message } })
  }
  for (const item of built) {
    for (const finding of item.findings) if (finding.level === 'error') errors.push({ slug: item.manifest.slug, finding })
  }
  return { catalog, errors }
}

export async function writeCatalog(catalog: Catalog): Promise<void> {
  const file = path.join(REPO_ROOT, CATALOG_PATH)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, `${JSON.stringify(catalog, null, 2)}\n`)
}

/** 删除 outDir 里不再被 catalog 引用的旧产物（watch 模式下增量重建后调用）。 */
export async function pruneOutputs(outDir: string, catalog: Catalog, urlBase = '/items/'): Promise<void> {
  const keep = new Set(catalog.items.flatMap((item) => (item.build ? [item.build.js, item.build.css] : [])).map((url) => url.slice(urlBase.length)))
  for (const file of await readdir(outDir)) if (!keep.has(file)) await rm(path.join(outDir, file), { force: true })
}

export function formatFindings(result: BuildRegistryResult): string {
  const lines: string[] = []
  for (const item of result.catalog.items) {
    for (const finding of item.findings) {
      lines.push(`${finding.level === 'error' ? '✖' : '⚠'} ${item.manifest.slug}${finding.file ? ` ${finding.file}` : ''} [${finding.rule}] ${finding.message}`)
    }
  }
  for (const { slug, finding } of result.errors) if (finding.rule === 'load') lines.push(`✖ ${slug} [load] ${finding.message}`)
  return lines.join('\n')
}
