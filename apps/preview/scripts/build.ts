import { rm } from 'node:fs/promises'
import * as esbuild from 'esbuild'
import { buildItemsInto, buildVendorInto, captureHostOptions, DIST, labItemOptions, runtimeOptions, writeRuntimeHtml } from './build-lib.ts'

const started = performance.now()
await rm(DIST, { recursive: true, force: true })
const manifest = await buildVendorInto()
const [registry] = await Promise.all([
  buildItemsInto(manifest, { minify: true }),
  esbuild.build({ ...runtimeOptions(), minify: true }),
  esbuild.build({ ...captureHostOptions(), minify: true }),
  labItemOptions().then((options) => esbuild.build({ ...options, minify: true })),
])
await writeRuntimeHtml(manifest)
console.log(`preview built in ${Math.round(performance.now() - started)} ms → ${DIST} (${registry.catalog.items.length} items)`)
if (registry.errors.length > 0) {
  console.error(`${registry.errors.length} item errors`)
  process.exitCode = 1
}
