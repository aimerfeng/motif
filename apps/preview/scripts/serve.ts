import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'
import * as esbuild from 'esbuild'
import { buildVendorInto, DIST, labItemOptions, runtimeOptions, writeRuntimeHtml } from './build-lib.ts'

const HOST = process.env.MOTIF_PREVIEW_HOST ?? '127.0.0.1'
const PORT = Number(process.env.MOTIF_PREVIEW_PORT ?? 4100)
const watch = process.argv.includes('--watch')

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
}

if (watch) {
  const manifest = await buildVendorInto()
  await writeRuntimeHtml(manifest)
  const contexts = await Promise.all([esbuild.context(runtimeOptions()), esbuild.context(await labItemOptions())])
  await Promise.all(contexts.map((context) => context.watch()))
}

const server = createServer((request, response) => {
  void (async () => {
    const url = new URL(request.url ?? '/', `http://${HOST}:${PORT}`)
    const pathname = url.pathname === '/' ? '/runtime.html' : decodeURIComponent(url.pathname)
    const filePath = path.join(DIST, pathname)
    // 沙箱页面是不透明源，加载模块脚本走 CORS（Origin: null），所以所有响应都要允许任意源。
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    response.setHeader('X-Content-Type-Options', 'nosniff')
    response.setHeader('Cache-Control', watch ? 'no-store' : 'public, max-age=300')
    if (!filePath.startsWith(DIST + path.sep)) {
      response.writeHead(403).end()
      return
    }
    try {
      const info = await stat(filePath)
      if (!info.isFile()) throw new Error('not a file')
      response.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] ?? 'application/octet-stream' })
      createReadStream(filePath).pipe(response)
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('not found')
    }
  })()
})

server.listen(PORT, HOST, () => {
  console.log(`preview sandbox on http://${HOST}:${PORT}${watch ? ' (watching)' : ''}`)
})
