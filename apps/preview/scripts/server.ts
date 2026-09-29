import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer, type Server } from 'node:http'
import path from 'node:path'
import { DIST } from './build-lib.ts'

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

/** 预览沙箱的静态服务：只读 dist，所有响应允许任意源（不透明源加载模块脚本走 CORS，Origin 为 null）。 */
export function startPreviewServer(options: { host: string; port: number; noCache: boolean; root?: string }): Promise<Server> {
  const { host, port, noCache, root = DIST } = options
  const server = createServer((request, response) => {
    void (async () => {
      const url = new URL(request.url ?? '/', `http://${host}:${port}`)
      const pathname = url.pathname === '/' ? '/runtime.html' : decodeURIComponent(url.pathname)
      const filePath = path.join(root, pathname)
      response.setHeader('Access-Control-Allow-Origin', '*')
      response.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
      response.setHeader('X-Content-Type-Options', 'nosniff')
      response.setHeader('Cache-Control', noCache ? 'no-store' : 'public, max-age=300')
      if (!filePath.startsWith(root + path.sep)) {
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
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(port, host, () => resolve(server))
  })
}
