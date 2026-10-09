import { exportRegistryItem, type ExportContext } from '@motif/export'
import { getCatalog } from '@/lib/catalog'
import { decodeValues } from '@/lib/share'
import { loadSession } from '@/lib/studio/store'

const HEADERS = { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' }

/**
 * Studio 会话的 shadcn registry：`npx shadcn add <origin>/r/s/<会话 id>.json?v=<参数>`。
 * 会话 id 就是分享凭证；条目只在通过检查、编译成功时才能安装。
 */
export async function GET(request: Request, { params }: RouteContext<'/r/s/[file]'>) {
  const { file } = await params
  if (!file.endsWith('.json')) return new Response('not found', { status: 404 })
  const session = await loadSession(file.slice(0, -'.json'.length))
  if (!session) return Response.json({ error: 'no such studio session' }, { status: 404, headers: HEADERS })
  if (!session.evaluation?.ok) return Response.json({ error: 'this item does not pass the checker yet' }, { status: 409, headers: HEADERS })

  const url = new URL(request.url)
  const catalog = await getCatalog()
  const context: ExportContext = { origin: url.origin, vendor: catalog.vendor, runtime: catalog.runtime }
  const values = decodeValues(url.searchParams.get('v') ?? '', session.item.manifest.params, session.values)
  return Response.json(await exportRegistryItem(session.item, values, context), { headers: HEADERS })
}
