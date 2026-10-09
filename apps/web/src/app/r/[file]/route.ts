import { exportRegistryItem, runtimeRegistryItem, type ExportContext } from '@motif/export'
import { defaultsOf } from '@motif/schema'
import { getCatalog } from '@/lib/catalog'
import { marketSource } from '@/lib/community/market-source'
import { decodeValues } from '@/lib/share'

const HEADERS = { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=300' }

/**
 * shadcn registry：`npx shadcn add <origin>/r/<slug>.json?v=<参数>`。
 * v 是站点分享链接里同一份编码的参数，逐个校验后写进组件的 defaults。
 */
export async function GET(request: Request, { params }: RouteContext<'/r/[file]'>) {
  const { file } = await params
  if (!file.endsWith('.json')) return new Response('not found', { status: 404 })
  const slug = file.slice(0, -'.json'.length)
  const url = new URL(request.url)
  const catalog = await getCatalog()
  const context: ExportContext = { origin: url.origin, vendor: catalog.vendor, runtime: catalog.runtime }

  if (slug === 'motif-runtime') return Response.json(runtimeRegistryItem(context), { headers: HEADERS })

  // 目录条目和审核通过的社区作品都能用 shadcn 安装。
  const item = await marketSource(slug)
  if (!item) return Response.json({ error: `no item named "${slug}"` }, { status: 404, headers: HEADERS })
  const defaults = defaultsOf(item.manifest.params)
  const values = decodeValues(url.searchParams.get('v') ?? '', item.manifest.params, defaults)
  const json = await exportRegistryItem(item, values, context)
  return Response.json(json, { headers: HEADERS })
}
