import { exportRegistryItem, type ExportContext } from '@motif/export'
import { getCatalog } from '@/lib/catalog'
import { decodeValues } from '@/lib/share'
import { publicOrigin } from '@/lib/site'
import { deliveredItem, loadOrder } from '@/lib/store/orders'

const HEADERS = { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' }

/**
 * 定制单的 shadcn registry：`npx shadcn add <origin>/r/o/<订单号>.json`。订单号就是凭证。
 * 装的是交付时存下的快照，之后工作台会话再怎么改都不影响已经交付的东西。
 */
export async function GET(request: Request, { params }: RouteContext<'/r/o/[file]'>) {
  const { file } = await params
  if (!file.endsWith('.json')) return new Response('not found', { status: 404 })
  const order = await loadOrder(file.slice(0, -'.json'.length))
  if (!order || order.kind !== 'custom') return Response.json({ error: 'no such custom order' }, { status: 404, headers: HEADERS })
  if (order.status !== 'delivered') return Response.json({ error: `this order is ${order.status.replace('_', ' ')}, not delivered yet` }, { status: 409, headers: HEADERS })

  const snapshot = await deliveredItem(order)
  if (!snapshot) return Response.json({ error: 'the delivered item is no longer available' }, { status: 410, headers: HEADERS })

  const url = new URL(request.url)
  const catalog = await getCatalog()
  const context: ExportContext = { origin: publicOrigin(request), vendor: catalog.vendor, runtime: catalog.runtime }
  const values = decodeValues(url.searchParams.get('v') ?? '', snapshot.item.manifest.params, snapshot.values)
  return Response.json(await exportRegistryItem(snapshot.item, values, context), { headers: HEADERS })
}
