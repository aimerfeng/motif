import { readdir, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type * as esbuild from 'esbuild'
import { buildVendor, VENDOR_IDS, type VendorManifest } from '@motif/vendor'

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

export function runtimeOptions(): esbuild.BuildOptions {
  return {
    ...sandboxBuildOptions(),
    entryPoints: [path.join(PREVIEW_ROOT, 'src/runtime/main.tsx')],
    outfile: path.join(DIST, 'runtime.js'),
  }
}

export async function labItemOptions(): Promise<esbuild.BuildOptions> {
  const labDir = path.join(PREVIEW_ROOT, 'src/lab')
  const files = (await readdir(labDir)).filter((file) => file.endsWith('.tsx'))
  return {
    ...sandboxBuildOptions(),
    entryPoints: files.map((file) => path.join(labDir, file)),
    outdir: path.join(DIST, 'items/lab'),
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

export async function writeRuntimeHtml(manifest: VendorManifest) {
  await mkdir(DIST, { recursive: true })
  await writeFile(path.join(DIST, 'runtime.html'), runtimeHtml(manifest))
}

export async function buildVendorInto(): Promise<VendorManifest> {
  return buildVendor({ outDir: path.join(DIST, 'vendor') })
}
