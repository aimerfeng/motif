import { createRequire } from 'node:module'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as esbuild from 'esbuild'
import { VENDOR_ENTRIES, vendorFileName, type VendorEntry } from './manifest.ts'

const PACKAGE_ROOT = fileURLToPath(new URL('..', import.meta.url))
const require = createRequire(path.join(PACKAGE_ROOT, 'package.json'))
const ENTRY_NAMESPACE = 'motif-vendor-entry'
const IDENTIFIER = /^[A-Za-z_$][\w$]*$/

export interface VendorManifest {
  /** 裸模块名 → 相对 base 的 URL，直接用于 import map。 */
  imports: Record<string, string>
  /** npm 包名 → 实际打包的版本。 */
  versions: Record<string, string>
}

/**
 * 把所有 vendor 模块放进同一次 esbuild 构建（开启 code splitting）。
 * 同一个依赖图里 React 只有一份，motion、three 等引用的是同一个实例；每个入口文件只是再导出共享 chunk 里的内容。
 */
export async function buildVendor(options: { outDir: string; basePath?: string; minify?: boolean }): Promise<VendorManifest> {
  const { outDir, basePath = '/vendor/', minify = true } = options
  await rm(outDir, { recursive: true, force: true })
  await mkdir(outDir, { recursive: true })

  const entryById = new Map(VENDOR_ENTRIES.map((entry) => [entry.id, entry]))

  await esbuild.build({
    entryPoints: VENDOR_ENTRIES.map((entry) => ({ in: `${ENTRY_NAMESPACE}:${entry.id}`, out: vendorFileName(entry.id) })),
    outdir: outDir,
    bundle: true,
    splitting: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    minify,
    legalComments: 'eof',
    chunkNames: 'chunks/[name]-[hash]',
    define: { 'process.env.NODE_ENV': '"production"' },
    logLevel: 'warning',
    plugins: [
      {
        name: 'motif-vendor-entries',
        setup(build) {
          build.onResolve({ filter: new RegExp(`^${ENTRY_NAMESPACE}:`) }, (args) => ({
            path: args.path.slice(ENTRY_NAMESPACE.length + 1),
            namespace: ENTRY_NAMESPACE,
          }))
          build.onLoad({ filter: /.*/, namespace: ENTRY_NAMESPACE }, (args) => {
            const entry = entryById.get(args.path)
            if (!entry) throw new Error(`unknown vendor entry: ${args.path}`)
            return { contents: entryModule(entry), resolveDir: PACKAGE_ROOT, loader: 'js' }
          })
        },
      },
    ],
  })

  const imports: Record<string, string> = {}
  for (const entry of VENDOR_ENTRIES) imports[entry.id] = `${basePath}${vendorFileName(entry.id)}.js`

  const versions: Record<string, string> = {}
  for (const pkg of new Set(VENDOR_ENTRIES.map((entry) => entry.pkg))) versions[pkg] = await packageVersion(pkg)

  const manifest: VendorManifest = { imports, versions }
  await writeFile(path.join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  return manifest
}

/** CommonJS 模块的具名导出要在 Node 里 require 一次再枚举，ESM 模块直接 `export *`。 */
function entryModule(entry: VendorEntry): string {
  const specifier = JSON.stringify(entry.id)
  if (entry.format === 'esm') return `export * from ${specifier};\n`

  const exported = require(entry.id) as Record<string, unknown>
  const names = Object.keys(exported).filter((name) => name !== 'default' && IDENTIFIER.test(name))
  return [
    `import __module from ${specifier};`,
    'export default __module;',
    `export const { ${names.join(', ')} } = __module;`,
    '',
  ].join('\n')
}

/** 有的包的 exports 不暴露 package.json，所以从入口文件向上找名字匹配的 package.json。 */
async function packageVersion(pkg: string): Promise<string> {
  let dir = path.dirname(require.resolve(pkg))
  for (;;) {
    try {
      const json = JSON.parse(await readFile(path.join(dir, 'package.json'), 'utf8')) as { name?: string; version?: string }
      if (json.name === pkg && json.version) return json.version
    } catch {
      // 这一层没有 package.json，继续向上。
    }
    const parent = path.dirname(dir)
    if (parent === dir) throw new Error(`cannot find package.json for ${pkg}`)
    dir = parent
  }
}
