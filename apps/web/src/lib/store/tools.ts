import { createHash } from 'node:crypto'
import { KINDS } from '@motif/schema/core'
import type { Evaluation } from '@motif/agent'
import { defaultsOf, type ItemManifest, type ItemSource, type ParamValues } from '@motif/schema'
import { z } from 'zod'
import { marketSource } from '@/lib/community/market-source'
import { HttpError } from '@/lib/community/http'
import { dailyCap, rateLimit } from '@/lib/community/rate-limit'
import { mediaFor } from '@/lib/media'
import { captureAvailable, capturePreview } from '@/lib/studio/capture'
import { evaluateItem } from '@/lib/studio/host'
import { sanitizeValues } from '@/lib/studio/sessions'
import { storeListings } from './listings'
import { categoryOverview, searchListings, type Listing } from './search'
import { assertQueueRoom, enqueueCustomOrder, loadOrder, newOrderId, orderView, pruneOrders, saveOrder, type Order } from './orders'
import { customPrice, itemPrice, pricingFromEnv } from './pricing'

/**
 * 商店给 agent 的工具（docs/decisions/0008-agent-store.md）。只定义一次：
 * MCP 服务（/mcp）和 HTTP 接口（/api/agent/<工具名>）都从这里生成。
 */

export interface ToolContext {
  request: Request
  /** 交付物里的地址用这个站点地址拼。 */
  origin: string
}

export interface ToolResult {
  data: unknown
  images?: { data: string; mediaType: string }[]
}

export interface StoreTool<Shape extends z.ZodRawShape = z.ZodRawShape> {
  name: string
  title: string
  description: string
  input: Shape
  run: (input: z.infer<z.ZodObject<Shape>>, context: ToolContext) => Promise<ToolResult>
}

const tool = <Shape extends z.ZodRawShape>(definition: StoreTool<Shape>) => definition

const slug = z.string().min(1).max(64).describe('Item slug, as returned by search_ui')
const values = z.record(z.string(), z.unknown()).optional().describe('Parameter values to tune the item (see get_ui for keys and ranges). Unknown keys and out-of-range values are dropped.')

/** 每天全站最多做多少次预览截图、接多少张定制单（都要花服务器算力或模型额度）。 */
const DAILY_PREVIEWS = Number(process.env.MOTIF_STORE_DAILY_PREVIEWS) || 2000
const DAILY_CUSTOM_ORDERS = Number(process.env.MOTIF_STORE_DAILY_CUSTOM_ORDERS) || 40

/** 目录条目的编译结果：同一个条目每次预览都重新编译没有意义。条目内容变了（重新部署）缓存键就变了。 */
const builds = ((globalThis as { __motifStoreBuilds?: Map<string, Promise<Evaluation>> }).__motifStoreBuilds ??= new Map())

function cachedEvaluation(item: ItemSource): Promise<Evaluation> {
  const key = `${item.manifest.slug}:${createHash('sha1').update(JSON.stringify(item)).digest('hex')}`
  let evaluation = builds.get(key)
  if (!evaluation) {
    evaluation = evaluateItem(item, 1)
    // 编译失败（包括编译进程忙）不缓存，下次重试。
    evaluation.then((result: Evaluation) => !result.build && builds.delete(key)).catch(() => builds.delete(key))
    builds.set(key, evaluation)
    if (builds.size > 200) builds.delete(builds.keys().next().value!)
  }
  return evaluation
}

async function requireItem(name: string) {
  const item = await marketSource(name)
  if (!item) throw new HttpError(404, `no item named "${name}"; use search_ui to find one`)
  return item
}

/** 预设和参数合在一起，再丢掉非法的值、补上默认值。 */
function tunedValues(manifest: ItemManifest, preset: string | undefined, overrides: Record<string, unknown> | undefined): ParamValues {
  const fromPreset = preset ? manifest.presets.find((entry) => entry.id === preset)?.values : undefined
  if (preset && !fromPreset) throw new HttpError(400, `"${manifest.slug}" has no preset "${preset}"; see get_ui`)
  return sanitizeValues({ manifest, files: {} }, { ...defaultsOf(manifest.params), ...fromPreset, ...overrides })
}

function listingSummary(listing: Listing, origin: string) {
  const { manifest } = listing
  const media = mediaFor(manifest.slug)
  return {
    slug: manifest.slug,
    title: manifest.title.en,
    titleZh: manifest.title['zh-CN'],
    summary: manifest.summary.en,
    kind: manifest.kind,
    category: manifest.category,
    tags: manifest.tags,
    source: listing.source,
    price: itemPrice(pricingFromEnv()),
    poster: media.poster ? `${origin}${media.poster}` : null,
    page: `${origin}/market/${manifest.slug}`,
  }
}

export const STORE_TOOLS = [
  tool({
    name: 'search_ui',
    title: 'Search UI',
    description:
      'Search the Motif catalogue of production-quality UI: whole-site templates, design styles, page sections, components (loaders, toasts, inputs, toggles, tabs, dialogs …) and visual effects (shaders, text, backgrounds). Describe what you need in a few words. Returns slugs, prices (open-source items are free) and poster images.',
    input: {
      query: z.string().max(200).optional().describe('What you need, e.g. "pricing card glowing border" or "loading dots"'),
      kind: z.enum(KINDS).optional().describe('Limit to one level: template, style, section, component or effect'),
      category: z.string().max(40).optional().describe('Limit to one category, e.g. hero, pricing, loader, shader'),
      limit: z.number().int().min(1).max(30).optional().describe('How many results (default 8)'),
    },
    async run(input, { origin }) {
      const listings = await storeListings()
      const results = searchListings(listings, { query: input.query, kind: input.kind, category: input.category, limit: input.limit ?? 8 })
      if (results.length === 0) {
        return {
          data: {
            results: [],
            hint: 'Nothing matched. Try fewer or broader words, search by one of these categories, or place_order with a brief for a custom build.',
            categories: categoryOverview(listings, input.kind),
          },
        }
      }
      return { data: { results: results.map((listing) => listingSummary(listing, origin)), hint: 'Call get_ui for parameters and presets, preview_ui to see it with your values, then place_order.' } }
    },
  }),

  tool({
    name: 'get_ui',
    title: 'Get UI details',
    description: 'Everything about one item: what it is for, its tunable parameters (types, defaults, ranges), presets, usage rules, dependencies, license and price.',
    input: { slug },
    async run({ slug: name }, { origin }) {
      const item = await requireItem(name)
      const { manifest } = item
      const media = mediaFor(manifest.slug)
      return {
        data: {
          slug: manifest.slug,
          title: manifest.title.en,
          titleZh: manifest.title['zh-CN'],
          summary: manifest.summary.en,
          kind: manifest.kind,
          category: manifest.category,
          tags: manifest.tags,
          price: itemPrice(pricingFromEnv()),
          params: manifest.params.map((param) => ({ ...param, label: param.label.en, hint: param.hint?.en })),
          presets: manifest.presets.map((preset) => ({ id: preset.id, name: preset.name.en, values: preset.values })),
          guidance: manifest.guidance ?? null,
          npmDependencies: manifest.dependencies.filter((dependency) => dependency !== '@motif/runtime'),
          fonts: manifest.fonts,
          reducedMotion: manifest.a11y.reducedMotion,
          license: manifest.provenance.kind === 'upstream' ? { spdx: manifest.provenance.upstream?.spdx, from: manifest.provenance.upstream?.repo } : { spdx: 'MIT', from: 'Motif' },
          media: { poster: media.poster ? `${origin}${media.poster}` : null, loop: media.loopMp4 ? `${origin}${media.loopMp4}` : null },
          page: `${origin}/market/${manifest.slug}`,
        },
      }
    },
  }),

  tool({
    name: 'preview_ui',
    title: 'Preview UI',
    description: 'Render the item with your parameter values (or a preset) in a headless browser and return screenshots, so you can check it fits before ordering.',
    input: {
      slug,
      preset: z.string().max(64).optional().describe('Preset id from get_ui; values override it'),
      values,
      times: z.array(z.number().min(0).max(12)).min(1).max(3).optional().describe('Seconds into the animation to capture, 1 to 3 values (default 0.8 and 2.5)'),
    },
    async run(input, { request }) {
      rateLimit(request, 'store-preview', 10)
      if (!captureAvailable()) throw new HttpError(503, 'previews are not available on this server; use the poster from get_ui')
      const item = await requireItem(input.slug)
      dailyCap('store-previews', DAILY_PREVIEWS)
      const evaluation = await cachedEvaluation(item)
      if (!evaluation.build) throw new HttpError(500, 'this item failed to build')
      const tuned = tunedValues(item.manifest, input.preset, input.values)
      const shots = await capturePreview({
        build: evaluation.build,
        exportName: item.manifest.demo.export,
        theme: item.manifest.demo.theme,
        props: tuned,
        page: item.manifest.kind === 'template' || item.manifest.kind === 'section',
        times: input.times ?? [0.8, 2.5],
      })
      return { data: { slug: item.manifest.slug, values: tuned, times: shots.map((shot) => shot.time) }, images: shots.map((shot) => ({ data: shot.data, mediaType: shot.mediaType })) }
    },
  }),

  tool({
    name: 'get_quote',
    title: 'Get a quote',
    description:
      'Price an order before placing it: either an existing item (slug) or a custom UI built to your brief. Prices are in USDC; paying in MOTIF gets a discount. Open-source catalogue items are free.',
    input: {
      slug: slug.optional(),
      brief: z.string().max(2000).optional().describe('For a custom order: what to build, in plain words'),
    },
    async run(input) {
      if (!input.slug === !input.brief) throw new HttpError(400, 'give either "slug" (an existing item) or "brief" (a custom order)')
      const pricing = pricingFromEnv()
      if (input.slug) {
        await requireItem(input.slug)
        return { data: { kind: 'item', slug: input.slug, price: itemPrice(pricing), delivery: 'immediate', currencies: ['USDC', 'MOTIF'] } }
      }
      return { data: { kind: 'custom', price: customPrice(pricing), delivery: 'a few minutes: an agent builds it and it passes the same checks as the catalogue', currencies: ['USDC', 'MOTIF'] } }
    },
  }),

  tool({
    name: 'place_order',
    title: 'Place an order',
    description:
      'Order an existing item (slug, optionally tuned with preset/values) or a custom UI (brief, optionally starting from an existing item as base). Free items are delivered immediately with code; custom orders are built by an agent, poll get_order until delivered. Keep the returned order id: it is the only way to get the order back.',
    input: {
      slug: slug.optional(),
      preset: z.string().max(64).optional().describe('Preset id from get_ui (existing items only)'),
      values,
      brief: z.string().min(10).max(2000).optional().describe('Custom order: what to build. Be specific about content, look, motion and size.'),
      base: slug.optional().describe('Custom order: start from this existing item instead of a blank one'),
      buyer: z.string().max(80).optional().describe('Who is ordering, e.g. "claude-code for acme.dev" (shown on the order)'),
    },
    async run(input, { request, origin }) {
      if (!input.slug === !input.brief) throw new HttpError(400, 'give either "slug" (an existing item) or "brief" (a custom order)')
      // 不适用的参数不悄悄忽略：agent 以为调了参数、其实没生效，拿到的东西会和预期不一样。
      if (input.slug && input.base) throw new HttpError(400, '"base" only applies to custom orders (with "brief"); to order an existing item, pass just "slug"')
      if (input.brief && (input.preset || input.values)) throw new HttpError(400, '"preset" and "values" only apply to existing items (with "slug"); describe the look you want in "brief" instead')
      void pruneOrders().catch((error: unknown) => console.error('[store] prune failed', error))
      const pricing = pricingFromEnv()
      const now = Date.now()
      const base: Omit<Order, 'kind' | 'price' | 'status'> = { id: newOrderId(), createdAt: now, updatedAt: now, buyer: input.buyer ?? null }
      if (input.slug) {
        rateLimit(request, 'store-order', 30)
        const item = await requireItem(input.slug)
        const price = itemPrice(pricing)
        const order = await saveOrder({ ...base, kind: 'item', price, status: price.free ? 'delivered' : 'awaiting_payment', slug: item.manifest.slug, values: tunedValues(item.manifest, input.preset, input.values) })
        return { data: await orderView(order, origin) }
      }
      rateLimit(request, 'store-custom-order', 3)
      if (input.base) await requireItem(input.base)
      const price = customPrice(pricing)
      if (price.free) {
        assertQueueRoom()
        dailyCap('store-custom-orders', DAILY_CUSTOM_ORDERS)
      }
      const order = await saveOrder({ ...base, kind: 'custom', price, status: price.free ? 'queued' : 'awaiting_payment', brief: input.brief!, base: input.base ?? null })
      if (price.free) enqueueCustomOrder(order.id)
      return { data: await orderView(order, origin) }
    },
  }),

  tool({
    name: 'get_order',
    title: 'Get an order',
    description: 'Status of an order. Once delivered it includes the code: shadcn registry JSON with every file (path + content), an install command, the shared runtime and a skill URL.',
    input: { orderId: z.string().max(40).describe('The id returned by place_order') },
    async run({ orderId }, { origin }) {
      const order = await loadOrder(orderId)
      if (!order) throw new HttpError(404, 'no such order')
      return { data: await orderView(order, origin) }
    },
  }),
]

export const STORE_INSTRUCTIONS = `Motif is a market of production-quality UI for agents: whole-site templates, design styles, page sections, components and visual effects. Every item is tunable (parameters with safe ranges and presets), license-checked and ships as working React + Tailwind code.

Typical flow: search_ui → get_ui → preview_ui (optional, returns screenshots) → place_order → get_order for the code. If nothing fits, place_order with a brief and an agent builds a custom item (poll get_order).
Prices are in USDC (paying in MOTIF is discounted). Open-source catalogue items are free.`

export function findTool(name: string): StoreTool | undefined {
  return STORE_TOOLS.find((entry) => entry.name === name) as StoreTool | undefined
}
