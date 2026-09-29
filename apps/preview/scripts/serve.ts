import { watch as watchFs } from 'node:fs'
import path from 'node:path'
import * as esbuild from 'esbuild'
import { ITEMS_DIR, REPO_ROOT } from '@motif/registry'
import { buildItemsInto, buildVendorInto, captureHostOptions, labItemOptions, runtimeOptions, writeRuntimeHtml } from './build-lib.ts'
import { startPreviewServer } from './server.ts'

const HOST = process.env.MOTIF_PREVIEW_HOST ?? '127.0.0.1'
const PORT = Number(process.env.MOTIF_PREVIEW_PORT ?? 4100)
const watch = process.argv.includes('--watch')

if (watch) {
  let manifest = await buildVendorInto()
  await writeRuntimeHtml(manifest)
  await buildItemsInto(manifest, { minify: false })
  const contexts = await Promise.all([
    esbuild.context(runtimeOptions()),
    esbuild.context(captureHostOptions()),
    esbuild.context(await labItemOptions()),
  ])
  await Promise.all(contexts.map((context) => context.watch()))

  // 条目或 motif-runtime 改动后重建（整个目录重建也只要一两百毫秒）。runtime 属于 vendor，要连 vendor 一起重建。
  let pending: ReturnType<typeof setTimeout> | undefined
  let vendorDirty = false
  let running = Promise.resolve()
  const schedule = (withVendor: boolean) => {
    vendorDirty ||= withVendor
    clearTimeout(pending)
    pending = setTimeout(() => {
      const rebuildVendor = vendorDirty
      vendorDirty = false
      running = running.then(async () => {
        const started = performance.now()
        if (rebuildVendor) {
          manifest = await buildVendorInto()
          await writeRuntimeHtml(manifest)
        }
        const result = await buildItemsInto(manifest, { minify: false, fresh: true })
        console.log(`rebuilt ${result.catalog.items.length} items in ${Math.round(performance.now() - started)} ms, ${result.errors.length} errors`)
      })
      running.catch((error: unknown) => console.error(error))
    }, 120)
  }
  watchFs(ITEMS_DIR, { recursive: true }, () => schedule(false))
  watchFs(path.join(REPO_ROOT, 'packages/runtime/src'), { recursive: true }, () => schedule(true))
}

await startPreviewServer({ host: HOST, port: PORT, noCache: watch })
console.log(`preview sandbox on http://${HOST}:${PORT}${watch ? ' (watching)' : ''}`)
