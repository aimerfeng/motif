import { createHash, randomBytes } from 'node:crypto'
import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { exportRegistryItem, runtimeRegistryItem, skillName, type ExportContext } from '@motif/export'
import { defaultsOf, type ItemSource, type ParamValues } from '@motif/schema'
import { getCatalog } from '@/lib/catalog'
import { HttpError } from '@/lib/community/http'
import { marketSource } from '@/lib/community/market-source'
import { encodeValues } from '@/lib/share'
import { getRunner } from '@/lib/studio/runner'
import { abortRun, createSession, sanitizeValues, startRun } from '@/lib/studio/sessions'
import { loadSession } from '@/lib/studio/store'
import type { Price } from './pricing'

/**
 * 商店的订单（docs/decisions/0008-agent-store.md）。订单存成文件，订单号足够长，本身就是凭证。
 * 交付物（代码、安装命令）在读取时按当前的导出流程生成；定制单另存一份交付时的条目快照。
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
  /** 定制单交付时的条目快照：之后工作台会话再被改动或清理，交付物都不变。 */
  delivered?: { item: ItemSource; values: ParamValues }
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
  // 临时文件名每次都不同：同一张单并发写盘时不会互相覆盖临时文件。
  const temp = `${target}.${randomBytes(6).toString('hex')}.tmp`
  await writeFile(temp, JSON.stringify(saved))
  await rename(temp, target)
  return saved
}

// ---------------------------------------------------------------- 定制单的制作队列

/** 同时最多做几个定制单：每个都要跑一整轮 agent（几分钟、几十次模型调用）。 */
const MAX_CONCURRENT = 2
/** 排队的上限：再多就让 agent 过会儿再来，而不是让队伍无限变长、每单都等上几个小时。 */
const MAX_QUEUED = 20
/** 一单最多做多久。模型调用卡住时到点中止，不让它一直占着制作位。 */
const RUN_TIMEOUT_MS = 15 * 60_000
/** 重启时只接着做最近一天下的单；更早的就算失败，免得开发机每次启动都替几天前的单花模型额度。 */
const RESUME_WINDOW_MS = 24 * 60 * 60_000

// 队列挂在 globalThis 上：/mcp 和 /api/agent/* 分开打包，从 MCP 下的单要能在 HTTP 接口里查到进度。
const { queue, active } = ((globalThis as { __motifOrders?: { queue: string[]; active: Set<string> } }).__motifOrders ??= { queue: [], active: new Set() })

/** 排队的定制单太多时抛 503。 */
export function assertQueueRoom(): void {
  if (queue.length >= MAX_QUEUED) throw new HttpError(503, 'the custom order queue is full; try again in a few minutes')
}

export function enqueueCustomOrder(id: string): void {
  if (queue.includes(id) || active.has(id)) return
  queue.push(id)
  pump()
}

function pump() {
  while (active.size < MAX_CONCURRENT && queue.length > 0) {
    const id = queue.shift()!
    active.add(id)
    void makeCustomOrder(id)
      .catch((error: unknown) => console.error(`[store] order ${id} failed unexpectedly`, error))
      .finally(() => {
        active.delete(id)
        pump()
      })
  }
}

/** 条目和参数的指纹：用来判断 agent 到底有没有动手（只调了参数也算，调好的样子就是交付物）。 */
function fingerprint(item: ItemSource, values: ParamValues): string {
  return createHash('sha256').update(JSON.stringify({ item, values })).digest('hex')
}

/** 记录失败。写盘本身也可能失败（磁盘满），那就只记日志，不能让异常从队列里冒出去。 */
async function failOrder(order: Order, error: string): Promise<void> {
  await saveOrder({ ...order, status: 'failed', error }).catch((cause: unknown) => console.error(`[store] could not record the failure of ${order.id}`, cause))
}

async function makeCustomOrder(id: string): Promise<void> {
  let order = await loadOrder(id)
  if (!order?.brief || order.status === 'delivered' || order.status === 'failed') return
  try {
    const runner = await getRunner()
    if (!runner) throw new Error('no model is configured on this server, so custom orders cannot be made')
    const session = await createSession(order.base ?? null)
    const before = fingerprint(session.item, session.values)
    order = await saveOrder({ ...order, status: 'in_progress', sessionId: session.id })
    // 跑完整一轮：事件流读到底就是这一轮结束（结果由工作台写盘）。超时就中止这一轮。
    const timer = setTimeout(() => abortRun(session.id, 'the order took too long and was stopped'), RUN_TIMEOUT_MS)
    try {
      const reader = startRun(session, order.brief!, runner).getReader()
      while (!(await reader.read()).done) {
        // 只需要等它跑完。
      }
    } finally {
      clearTimeout(timer)
    }
    const finished = await loadSession(session.id)
    // 交付的条件：这一轮以「完成」收尾，条目确实改过，而且通过了检查和编译。
    // 只看检查结果不够：起点（空白模板或原条目）本来就能通过，agent 出错或什么都没做时也会“通过”。
    const ending = finished?.transcript.findLast((entry) => entry.role === 'notice')
    const changed = finished ? fingerprint(finished.item, finished.values) !== before : false
    if (finished?.evaluation?.ok && changed && ending?.kind === 'done') {
      await saveOrder({ ...order, status: 'delivered', delivered: { item: finished.item, values: finished.values } })
      return
    }
    const problems = finished?.evaluation?.problems.filter((problem) => problem.level === 'error').map((problem) => problem.message) ?? []
    const reason =
      ending?.kind === 'aborted' || ending?.kind === 'error'
        ? `the agent stopped before finishing: ${ending.text}`
        : problems.length > 0
          ? `the result did not pass the checker: ${problems.slice(0, 3).join('; ')}`
          : !changed
            ? 'the agent did not change anything'
            : 'the agent did not finish a working item'
    await failOrder(order, reason)
  } catch (error) {
    await failOrder(order, error instanceof Error ? error.message : String(error))
  }
}

/** 排队或制作中的订单不在这个进程的队列里：说明进程中途重启过，而且没能接着做（见 resumeOrders）。 */
function orphaned(order: Order): boolean {
  return (order.status === 'queued' || order.status === 'in_progress') && !active.has(order.id) && !queue.includes(order.id)
}

/** 多久清理一次旧订单，以及各类订单留多久。 */
const PRUNE_INTERVAL_MS = 60 * 60_000
const KEEP_UNFINISHED_MS = 30 * 86_400_000
const KEEP_ITEM_ORDERS_MS = 180 * 86_400_000
const housekeeping = ((globalThis as { __motifOrderHousekeeping?: { resumed: boolean; prunedAt: number } }).__motifOrderHousekeeping ??= { resumed: false, prunedAt: 0 })

async function allOrders(): Promise<Order[]> {
  const names = await readdir(ORDERS_DIR).catch(() => [] as string[])
  const orders = await Promise.all(names.filter((name) => name.endsWith('.json')).map((name) => loadOrder(name.slice(0, -'.json'.length))))
  return orders.filter((order): order is Order => order !== null)
}

/**
 * 进程启动时调用一次（instrumentation.ts）：把重启前没做完的免费定制单重新排进队列，太旧的记为失败。
 * 「一个进程一份队列」的前提见 ADR 0008；多实例部署要换成共享的任务队列。
 */
export async function resumeOrders(): Promise<void> {
  if (housekeeping.resumed) return
  housekeeping.resumed = true
  const now = Date.now()
  const unfinished = (await allOrders()).filter((order) => order.kind === 'custom' && (order.status === 'queued' || order.status === 'in_progress')).sort((a, b) => a.createdAt - b.createdAt)
  for (const order of unfinished) {
    if (now - order.createdAt > RESUME_WINDOW_MS || !order.price.free) {
      await failOrder(order, 'the server restarted while this order was being made; place it again')
      continue
    }
    const { sessionId: _discarded, ...rest } = order
    await saveOrder({ ...rest, status: 'queued' })
    enqueueCustomOrder(order.id)
  }
  if (unfinished.length > 0) console.info(`[store] resumed ${unfinished.length} unfinished custom order(s)`)
}

/** 清理旧订单：没做成、没付款的留 30 天，现成条目的订单留 180 天（随时可以重新下单）；交付了的定制单一直留着。 */
export async function pruneOrders(): Promise<void> {
  const now = Date.now()
  if (now - housekeeping.prunedAt < PRUNE_INTERVAL_MS) return
  housekeeping.prunedAt = now
  // 写到一半进程退出留下的临时文件，一天后清掉。
  for (const name of await readdir(ORDERS_DIR).catch(() => [] as string[])) {
    if (!name.endsWith('.tmp')) continue
    const file = path.join(/*turbopackIgnore: true*/ ORDERS_DIR, name)
    const modified = await stat(file).then((info) => info.mtimeMs, () => now)
    if (now - modified > 86_400_000) await rm(file, { force: true })
  }
  for (const order of await allOrders()) {
    const age = now - order.updatedAt
    const expired =
      ((order.status === 'failed' || order.status === 'awaiting_payment') && age > KEEP_UNFINISHED_MS) || (order.kind === 'item' && order.status === 'delivered' && age > KEEP_ITEM_ORDERS_MS)
    if (expired) await rm(path.join(/*turbopackIgnore: true*/ ORDERS_DIR, `${order.id}.json`), { force: true })
  }
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

/** 定制单交付的条目：交付时存下的快照；早期的订单没有快照，回退到会话里通过检查的当前版本。 */
export async function deliveredItem(order: Order): Promise<{ item: ItemSource; values: ParamValues } | null> {
  if (order.delivered) return order.delivered
  const session = order.sessionId ? await loadSession(order.sessionId) : null
  return session?.evaluation?.ok ? { item: session.item, values: session.values } : null
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
    const snapshot = await deliveredItem(order)
    if (!snapshot) return null
    item = snapshot.item
    values = snapshot.values
    registryUrl = `${origin}/r/o/${order.id}.json`
    page = `${origin}/studio/${order.sessionId ?? ''}`
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
  const delivery = current.status === 'delivered' ? await deliveryFor(current, origin) : null
  // 交付过但现在给不出代码：条目已经从市场下架。如实说，不让 agent 去读一个 null。
  const gone = current.status === 'delivered' && delivery === null
  return {
    id: current.id,
    kind: current.kind,
    status: current.status,
    price: current.price,
    createdAt: new Date(current.createdAt).toISOString(),
    slug: current.slug ?? null,
    brief: current.brief ?? null,
    studio: current.sessionId ? `${origin}/studio/${current.sessionId}` : null,
    error: gone ? 'this item is no longer in the market, so its code can no longer be delivered' : (current.error ?? null),
    next: gone ? 'Search for a similar item with search_ui, or place a custom order.' : NEXT[current.status],
    delivery,
  }
}
