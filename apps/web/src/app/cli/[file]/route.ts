import { cliFiles } from '@/lib/cli'
import { publicOrigin } from '@/lib/site'

/*
 * motif 命令行的下载地址：
 *   /cli/motif-<版本>.tgz  npm 能装的包，`npx -y <这个地址> setup` 不用安装就能跑
 *   /cli/motif.mjs         单个文件，`node motif.mjs` 直接跑
 * 版本号只是为了让地址随版本变（npx 按地址缓存），路由不看它：写进 agent 配置里的旧地址要一直能用，
 * 所以任何版本号都给当前这一版。也正因为同一个地址的内容会变，不能标成 immutable，靠 ETag 重新验证。
 */

const CACHE = 'public, max-age=300, must-revalidate'

export async function GET(request: Request, { params }: RouteContext<'/cli/[file]'>) {
  const { file } = await params
  const tarball = /^motif(-[\w.+-]+)?\.tgz$/.test(file)
  if (!tarball && file !== 'motif.mjs') return new Response('not found', { status: 404 })

  const files = cliFiles(publicOrigin(request))
  // 正常部署不会走到这里（pnpm build 会先构建 CLI）；本地只起了站点时会。
  if (!files) return new Response('the CLI has not been built: run "pnpm --filter @motif/cli build"', { status: 503 })

  const headers = { 'Cache-Control': CACHE, ETag: files.etag, 'Access-Control-Allow-Origin': '*', 'X-Content-Type-Options': 'nosniff' }
  if (request.headers.get('if-none-match') === files.etag) return new Response(null, { status: 304, headers })
  if (tarball) return new Response(new Uint8Array(files.tarball), { headers: { ...headers, 'Content-Type': 'application/gzip' } })
  return new Response(files.script, { headers: { ...headers, 'Content-Type': 'text/javascript; charset=utf-8' } })
}
