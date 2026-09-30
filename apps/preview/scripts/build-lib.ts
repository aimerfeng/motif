import { readdir, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type * as esbuild from 'esbuild'
import { buildRegistry, formatFindings, type BuildRegistryResult } from '@motif/registry'
import { buildFonts, buildVendor, VENDOR_IDS, type VendorManifest } from '@motif/vendor'

export const PREVIEW_ROOT = fileURLToPath(new URL('..', import.meta.url))
export const DIST = path.join(PREVIEW_ROOT, 'dist')

/** 沙箱内代码（运行时和条目）共用的 esbuild 选项：所有 vendor 模块都 external，由 import map 提供同一份实例。 */
export function sandboxBuildOptions(): esbuild.BuildOptions {
  return {
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    jsx: 'automatic',
    external: [...VENDOR_IDS],
    define: { 'process.env.NODE_ENV': '"production"' },
    legalComments: 'eof',
    logLevel: 'warning',
  }
}

export function runtimeOptions(dist = DIST): esbuild.BuildOptions {
  return {
    ...sandboxBuildOptions(),
    entryPoints: [path.join(PREVIEW_ROOT, 'src/runtime/main.tsx')],
    outfile: path.join(dist, 'runtime.js'),
  }
}

/** 截图宿主页面的脚本：跑在普通源里，不用 import map，直接打包。 */
export function captureHostOptions(dist = DIST): esbuild.BuildOptions {
  return {
    entryPoints: [path.join(PREVIEW_ROOT, 'src/capture/host.ts')],
    outfile: path.join(dist, 'capture.js'),
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    logLevel: 'warning',
  }
}

const CAPTURE_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Motif capture</title>
    <link rel="icon" href="data:," />
    <style>
      html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: #000; }
      iframe { display: block; width: 100vw; height: 100vh; border: 0; }
    </style>
    <script type="module" src="/capture.js"></script>
  </head>
  <body></body>
</html>
`

export async function labItemOptions(): Promise<esbuild.BuildOptions> {
  const labDir = path.join(PREVIEW_ROOT, 'src/lab')
  const files = (await readdir(labDir)).filter((file) => file.endsWith('.tsx'))
  return {
    ...sandboxBuildOptions(),
    entryPoints: files.map((file) => path.join(labDir, file)),
    outdir: path.join(DIST, 'lab'),
  }
}

// 沙箱页面不允许连外网：脚本只能来自沙箱自己的源、内联 import map 和 blob（Studio 编译出的模块）。
const CSP = [
  "default-src 'none'",
  "script-src 'self' 'unsafe-inline' blob:",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "font-src 'self' data:",
  "connect-src 'self' data: blob:",
  "worker-src 'self' blob:",
].join('; ')

export function runtimeHtml(manifest: VendorManifest): string {
  const importMap = JSON.stringify({ imports: manifest.imports }, null, 2)
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="Content-Security-Policy" content="${CSP}" />
    <title>Motif preview</title>
    <link rel="icon" href="data:," />
    <link rel="stylesheet" href="/fonts/fonts.css" />
    <script type="importmap">
${importMap}
    </script>
    <style>
      html, body, #root { margin: 0; width: 100%; height: 100%; overflow: hidden; }
    </style>
    <script type="module" src="/runtime.js"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`
}

export async function writeRuntimeHtml(manifest: VendorManifest, dist = DIST) {
  await mkdir(dist, { recursive: true })
  await writeFile(path.join(dist, 'runtime.html'), runtimeHtml(manifest))
  await writeFile(path.join(dist, 'capture.html'), CAPTURE_HTML)
}

/** vendor 模块与字体一起构建；字体包的版本并入清单，导出项目时一并写进 package.json。 */
export async function buildVendorInto(dist = DIST): Promise<VendorManifest> {
  const [manifest, fontVersions] = await Promise.all([buildVendor({ outDir: path.join(dist, 'vendor') }), buildFonts({ outDir: path.join(dist, 'fonts') })])
  return { ...manifest, versions: { ...manifest.versions, ...fontVersions } }
}

/** 编译市场条目到 dist/items，并生成站点读取的 catalog.json。 */
export async function buildItemsInto(manifest: VendorManifest, options: { minify: boolean; fresh?: boolean }): Promise<BuildRegistryResult> {
  const result = await buildRegistry({
    outDir: path.join(DIST, 'items'),
    urlBase: '/items/',
    minify: options.minify,
    vendorVersions: manifest.versions,
    fresh: options.fresh ?? false,
  })
  const report = formatFindings(result)
  if (report) console.log(report)
  return result
}
