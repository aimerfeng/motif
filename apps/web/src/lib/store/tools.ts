import { KINDS } from '@motif/schema/core'
import { defaultsOf, type ItemManifest, type ParamValues } from '@motif/schema'
import { z } from 'zod'
import { marketSource } from '@/lib/community/market-source'
import { HttpError } from '@/lib/community/http'
import { rateLimit } from '@/lib/community/rate-limit'
import { mediaFor } from '@/lib/media'
import { captureAvailable, capturePreview } from '@/lib/studio/capture'
import { evaluateItem } from '@/lib/studio/host'
import { sanitizeValues } from '@/lib/studio/sessions'
import { storeListings } from './listings'
import { searchListings, type Listing } from './search'
import { enqueueCustomOrder, loadOrder, newOrderId, orderView, saveOrder, type Order } from './orders'
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
      const results = searchListings(await storeListings(), { query: input.query, kind: input.kind, category: input.category, limit: input.limit ?? 8 })
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
      times: z.array(z.number().min(0).max(12)).max(3).optional().describe('Seconds into the animation to capture (default 0.8 and 2.5)'),
    },
    async run(input, { request }) {
      rateLimit(request, 'store-preview', 10)
      if (!captureAvailable()) throw new HttpError(503, 'previews are not available on this server; use the poster from get_ui')
      const item = await requireItem(input.slug)
      const evaluation = await evaluateItem(item, 1)
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
      const pricing = pricingFromEnv()
      const now = Date.now()
      const base: Omit<Order, 'kind' | 'price' | 'status'> = { id: newOrderId(), createdAt: now, updatedAt: now, buyer: input.buyer ?? null }
      if (input.slug) {
        const item = await requireItem(input.slug)
        const price = itemPrice(pricing)
        const order = await saveOrder({ ...base, kind: 'item', price, status: price.free ? 'delivered' : 'awaiting_payment', slug: item.manifest.slug, values: tunedValues(item.manifest, input.preset, input.values) })
        return { data: await orderView(order, origin) }
      }
      rateLimit(request, 'store-custom-order', 3)
      if (input.base) await requireItem(input.base)
      const price = customPrice(pricing)
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
