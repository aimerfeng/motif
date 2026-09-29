import { rm } from 'node:fs/promises'
import * as esbuild from 'esbuild'
import { buildVendorInto, DIST, labItemOptions, runtimeOptions, writeRuntimeHtml } from './build-lib.ts'

const started = performance.now()
await rm(DIST, { recursive: true, force: true })
const manifest = await buildVendorInto()
await Promise.all([esbuild.build({ ...runtimeOptions(), minify: true }), esbuild.build({ ...(await labItemOptions()), minify: true })])
await writeRuntimeHtml(manifest)
console.log(`preview built in ${Math.round(performance.now() - started)} ms → ${DIST}`)
