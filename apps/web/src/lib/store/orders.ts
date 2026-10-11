import { randomBytes } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { exportRegistryItem, runtimeRegistryItem, skillName, type ExportContext } from '@motif/export'
import { defaultsOf, type ItemSource, type ParamValues } from '@motif/schema'
import { getCatalog } from '@/lib/catalog'
import { marketSource } from '@/lib/community/market-source'
import { encodeValues } from '@/lib/share'
import { getRunner } from '@/lib/studio/runner'
import { createSession, sanitizeValues, startRun } from '@/lib/studio/sessions'
import { loadSession } from '@/lib/studio/store'
import type { Price } from './pricing'

/**
 * 商店的订单（docs/decisions/0008-agent-store.md）。订单存成文件，订单号足够长，本身就是凭证。
 * 交付物（代码、安装命令）在读取时按当前的导出流程生成，不存进订单。
 */

export type OrderStatus = 'awaiting_payment' | 'queued' | 'in_progress' | 'delivered' | 'failed'

export interface Order {
  id: string
  createdAt: number
  updatedAt: number
  kind: 'item' | 'custom'
  /** 下单的 agent 自报的名字，只用来显示。 */
  buyer: string | null
  price: Price
  status: OrderStatus
  /** 现成条目：哪个条目、什么参数。 */
  slug?: string
  values?: ParamValues
  /** 定制单：需求、起点条目、做它的工作台会话。 */
  brief?: string
  base?: string | null
  sessionId?: string
  error?: string
}

const ORDERS_DIR = process.env.MOTIF_ORDERS_DATA ?? path.resolve(/*turbopackIgnore: true*/ process.cwd(), '../..', '.data/orders')
const ORDER_ID = /^ord_[A-Za-z0-9_-]{22}$/

export function newOrderId(): string {
  return `ord_${randomBytes(16).toString('base64url')}`
}

export function isOrderId(value: string): boolean {
  return ORDER_ID.test(value)
}

export async function loadOrder(id: string): Promise<Order | null> {
  if (!isOrderId(id)) return null
  try {
    return JSON.parse(await readFile(path.join(/*turbopackIgnore: true*/ ORDERS_DIR, `${id}.json`), 'utf8')) as Order
  } catch {
    return null
  }
}

/** 先写临时文件再改名：写到一半进程退出也不会留下半个 JSON。 */
export async function saveOrder(order: Order): Promise<Order> {
  await mkdir(ORDERS_DIR, { recursive: true })
  const saved = { ...order, updatedAt: Date.now() }
  const target = path.join(/*turbopackIgnore: true*/ ORDERS_DIR, `${order.id}.json`)
  const temp = `${target}.${process.pid}.tmp`
  await writeFile(temp, JSON.stringify(saved))
  await rename(temp, target)
  return saved
}

// ---------------------------------------------------------------- 定制单的制作队列

/** 同时最多做几个定制单：每个都要跑一整轮 agent（几分钟、几十次模型调用）。 */
const MAX_CONCURRENT = 2
// 队列挂在 globalThis 上：/mcp 和 /api/agent/* 分开打包，从 MCP 下的单要能在 HTTP 接口里查到进度。
const { queue, active } = ((globalThis as { __motifOrders?: { queue: string[]; active: Set<string> } }).__motifOrders ??= { queue: [], active: new Set() })

export function enqueueCustomOrder(id: string): void {
  queue.push(id)
  pump()
}

function pump() {
  while (active.size < MAX_CONCURRENT && queue.length > 0) {
    const id = queue.shift()!
    active.add(id)
    void makeCustomOrder(id).finally(() => {
      active.delete(id)
      pump()
    })
  }
}

async function makeCustomOrder(id: string): Promise<void> {
  let order = await loadOrder(id)
  if (!order?.brief) return
  try {
    const runner = await getRunner()
    if (!runner) throw new Error('no model is configured on this server, so custom orders cannot be made')
    const session = await createSession(order.base ?? null)
    order = await saveOrder({ ...order, status: 'in_progress', sessionId: session.id })
    // 跑完整一轮：事件流读到底就是这一轮结束（结果由工作台写盘）。
    const reader = startRun(session, order.brief!, runner).getReader()
    while (!(await reader.read()).done) {
      // 只需要等它跑完。
    }
    const finished = await loadSession(session.id)
    if (finished?.evaluation?.ok) {
      await saveOrder({ ...order, status: 'delivered' })
    } else {
      const problems = finished?.evaluation?.problems.filter((problem) => problem.level === 'error').map((problem) => problem.message) ?? []
      await saveOrder({ ...order, status: 'failed', error: problems.length > 0 ? `the result did not pass the checker: ${problems.slice(0, 3).join('; ')}` : 'the agent did not finish a working item' })
    }
  } catch (error) {
    await saveOrder({ ...order, status: 'failed', error: error instanceof Error ? error.message : String(error) })
  }
}

/** 排队或制作中的订单不在这个进程的队列里：说明进程中途重启过，订单不会再有进展。 */
function orphaned(order: Order): boolean {
  return (order.status === 'queued' || order.status === 'in_progress') && !active.has(order.id) && !queue.includes(order.id)
}

// ---------------------------------------------------------------- 交付

export interface Delivery {
  /** 一条命令装进现有项目（需要项目里已经配好 shadcn）。 */
  install: string
  /** shadcn registry 条目：files 里是每个文件的路径和内容，可以直接写进项目。 */
  registryItem: unknown
  /** 组件共用的运行时（@/lib/motif-runtime），只需要装一次。 */
  runtimeItem: unknown
  /** 给 agent 的说明（参数、规则、用法）。 */
  skill: string | null
  /** 人可以打开的页面：市场详情页，或定制单的工作台。 */
  page: string
}

export interface OrderView {
  id: string
  kind: Order['kind']
  status: OrderStatus
  price: Price
  createdAt: string
  slug: string | null
  brief: string | null
  /** 定制单在工作台里的页面，人可以打开看进度、接着改。 */
  studio: string | null
  error: string | null
  next: string
  delivery: Delivery | null
}

const NEXT: Record<OrderStatus, string> = {
  awaiting_payment: 'Payment is not open yet (phase 1 of the store). Free items and free custom orders are delivered without payment.',
  queued: 'Waiting for a free agent. Call get_order again in a minute.',
  in_progress: 'An agent is building it. Custom orders usually take a few minutes; call get_order again later.',
  delivered: 'Done. Write delivery.registryItem.files into the project (or run delivery.install), plus delivery.runtimeItem once per project.',
  failed: 'This order failed; see error. You can place a new order with a clearer brief.',
}

async function exportContext(origin: string): Promise<ExportContext> {
  const catalog = await getCatalog()
  return { origin, vendor: catalog.vendor, runtime: catalog.runtime }
}

async function deliveryFor(order: Order, origin: string): Promise<Delivery | null> {
  const context = await exportContext(origin)
  let item: ItemSource
  let values: ParamValues
  let registryUrl: string
  let page: string
  if (order.kind === 'item') {
    const source = await marketSource(order.slug!)
    if (!source) return null
    item = source
    values = sanitizeValues(source, order.values)
    const encoded = encodeValues(values, defaultsOf(source.manifest.params))
    registryUrl = `${origin}/r/${order.slug}.json${encoded ? `?v=${encoded}` : ''}`
    page = `${origin}/market/${order.slug}`
  } else {
    const session = order.sessionId ? await loadSession(order.sessionId) : null
    if (!session?.evaluation?.ok) return null
    item = session.item
    values = session.values
    registryUrl = `${origin}/r/s/${session.id}.json`
    page = `${origin}/studio/${session.id}`
  }
  return {
    install: `npx shadcn@latest add "${registryUrl}"`,
    registryItem: await exportRegistryItem(item, values, context),
    runtimeItem: runtimeRegistryItem(context),
    skill: order.kind === 'item' ? `${origin}/skill/${skillName(item.manifest.slug)}.md` : null,
    page,
  }
}

export async function orderView(order: Order, origin: string): Promise<OrderView> {
  const current = orphaned(order) ? await saveOrder({ ...order, status: 'failed', error: 'the server restarted while this order was being made; place it again' }) : order
  return {
    id: current.id,
    kind: current.kind,
    status: current.status,
    price: current.price,
    createdAt: new Date(current.createdAt).toISOString(),
    slug: current.slug ?? null,
    brief: current.brief ?? null,
    studio: current.sessionId ? `${origin}/studio/${current.sessionId}` : null,
    error: current.error ?? null,
    next: NEXT[current.status],
    delivery: current.status === 'delivered' ? await deliveryFor(current, origin) : null,
  }
}
