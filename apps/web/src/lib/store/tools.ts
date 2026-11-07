import { createHash } from 'node:crypto'
import { KINDS } from '@motif/schema/core'
import type { Evaluation } from '@motif/agent'
import { defaultsOf, type ItemManifest, type ItemSource, type ParamValues } from '@motif/schema'
import { z } from 'zod'
import { marketSource } from '@/lib/community/market-source'
import { HttpError } from '@/lib/community/http'
import { dailyCap, rateLimit } from '@/lib/community/rate-limit'
import { applyCredit, balanceOf, isUnlocked, unlock, unlocksOf } from '@/lib/credits/ledger'
import { creditCosts } from '@/lib/credits/pricing'
import { listAllSkills, skillFilesFor } from '@/lib/skills'
import { mediaFor } from '@/lib/media'
import { track } from '@/lib/stats/track'
import { captureAvailable, capturePreview } from '@/lib/studio/capture'
import { evaluateItem } from '@/lib/studio/host'
import { getRunner } from '@/lib/studio/runner'
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
  /** 带了 API 密钥（Authorization: Bearer mk_…）的站点用户；没带是 null（docs/decisions/0009）。 */
  userId: string | null
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

/** 拿代码、拿 Skill、下定制单都要花积分，所以要知道是谁：没带 API 密钥就告诉 agent 去哪里拿。 */
function requireBuyer(context: ToolContext): string {
  if (context.userId) return context.userId
  throw new HttpError(
    401,
    `this needs a Motif API key (it spends credits). Create one at ${context.origin}/account/keys and reconnect with the header "Authorization: Bearer <key>", e.g. claude mcp add --transport http motif ${context.origin}/mcp --header "Authorization: Bearer <key>"`,
  )
}

/** 条目或 Skill 在积分上的价格：解锁一次，以后对这个用户永久免费。没带密钥时 unlocked 为 null。 */
function creditPrice(kind: 'item' | 'skill', target: string, userId: string | null) {
  const costs = creditCosts()
  return { credits: kind === 'item' ? costs.unlockItem : costs.unlockSkill, unlocked: userId ? isUnlocked(userId, kind, target) : null }
}

/** 预设和参数合在一起，再丢掉非法的值、补上默认值。 */
function tunedValues(manifest: ItemManifest, preset: string | undefined, overrides: Record<string, unknown> | undefined): ParamValues {
  const fromPreset = preset ? manifest.presets.find((entry) => entry.id === preset)?.values : undefined
  if (preset && !fromPreset) throw new HttpError(400, `"${manifest.slug}" has no preset "${preset}"; see get_ui`)
  return sanitizeValues({ manifest, files: {} }, { ...defaultsOf(manifest.params), ...fromPreset, ...overrides })
}

function listingSummary(listing: Listing, origin: string, userId: string | null) {
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
    credits: creditPrice('item', manifest.slug, userId),
    poster: media.poster ? `${origin}${media.poster}` : null,
    page: `${origin}/market/${manifest.slug}`,
  }
}

export const STORE_TOOLS = [
  tool({
    name: 'search_ui',
    title: 'Search UI',
    description:
      'Search the Motif catalogue of production-quality UI: whole-site templates, design styles, page sections, components (loaders, toasts, inputs, toggles, tabs, dialogs …) and visual effects (shaders, text, backgrounds). Describe what you need in a few words. Returns slugs, prices in credits and poster images.',
    input: {
      query: z.string().max(200).optional().describe('What you need, e.g. "pricing card glowing border" or "loading dots"'),
      kind: z.enum(KINDS).optional().describe('Limit to one level: template, style, section, component or effect'),
      category: z.string().max(40).optional().describe('Limit to one category, e.g. hero, pricing, loader, shader'),
      limit: z.number().int().min(1).max(30).optional().describe('How many results (default 8)'),
    },
    async run(input, { origin, userId }) {
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
      return { data: { results: results.map((listing) => listingSummary(listing, origin, userId)), hint: 'Call get_ui for parameters and presets, preview_ui to see it with your values, then place_order.' } }
    },
  }),

  tool({
    name: 'get_ui',
    title: 'Get UI details',
    description: 'Everything about one item: what it is for, its tunable parameters (types, defaults, ranges), presets, usage rules, dependencies, license and price in credits.',
    input: { slug },
    async run({ slug: name }, { origin, userId }) {
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
          credits: creditPrice('item', manifest.slug, userId),
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
      'Price an order before placing it: either an existing item (slug) or a custom UI built to your brief. Orders are paid in Motif credits from the account of your API key; an item, once bought, stays free for that account.',
    input: {
      slug: slug.optional(),
      brief: z.string().max(2000).optional().describe('For a custom order: what to build, in plain words'),
    },
    async run(input, { userId }) {
      if (!input.slug === !input.brief) throw new HttpError(400, 'give either "slug" (an existing item) or "brief" (a custom order)')
      const pricing = pricingFromEnv()
      const balance = userId ? balanceOf(userId) : null
      if (input.slug) {
        await requireItem(input.slug)
        return { data: { kind: 'item', slug: input.slug, price: itemPrice(pricing), credits: creditPrice('item', input.slug, userId), balance, delivery: 'immediate' } }
      }
      return { data: { kind: 'custom', price: customPrice(pricing), credits: { credits: creditCosts().customOrder, unlocked: null }, balance, delivery: 'a few minutes: an agent builds it and it passes the same checks as the catalogue' } }
    },
  }),

  tool({
    name: 'place_order',
    title: 'Place an order',
    description:
      'Order an existing item (slug, optionally tuned with preset/values) or a custom UI (brief, optionally starting from an existing item as base). Needs an API key: the price is paid in credits. Items are delivered immediately with code (an item you bought before costs nothing again); custom orders are built by an agent, poll get_order until delivered. Keep the returned order id: it is the only way to get the order back.',
    input: {
      slug: slug.optional(),
      preset: z.string().max(64).optional().describe('Preset id from get_ui (existing items only)'),
      values,
      brief: z.string().min(10).max(2000).optional().describe('Custom order: what to build. Be specific about content, look, motion and size.'),
      base: slug.optional().describe('Custom order: start from this existing item instead of a blank one'),
      buyer: z.string().max(80).optional().describe('Who is ordering, e.g. "claude-code for acme.dev" (shown on the order)'),
    },
    async run(input, context) {
      const { request, origin } = context
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
        const buyer = requireBuyer(context)
        const item = await requireItem(input.slug)
        // 先确认参数合法再扣积分：参数写错的单不该花钱。
        const values = tunedValues(item.manifest, input.preset, input.values)
        const paid = unlock(buyer, 'item', item.manifest.slug, creditCosts().unlockItem)
        // agent 通过 MCP 拿走了代码：排行榜的「拿走」（按账号去重）。
        void track({ userId: buyer }, item.manifest.slug, 'take')
        const price = itemPrice(pricing)
        const order = await saveOrder({ ...base, kind: 'item', price, status: price.free ? 'delivered' : 'awaiting_payment', slug: item.manifest.slug, values })
        return { data: { ...(await orderView(order, origin)), credits: { charged: paid.charged, balance: paid.balance } } }
      }
      rateLimit(request, 'store-custom-order', 3)
      const buyer = requireBuyer(context)
      if (input.base) await requireItem(input.base)
      const price = customPrice(pricing)
      if (price.free) {
        assertQueueRoom()
        dailyCap('store-custom-orders', DAILY_CUSTOM_ORDERS)
        // 没配模型的服务器做不了定制单：先说清楚，不扣积分。
        if (!(await getRunner())) throw new HttpError(503, 'custom orders are not available on this server right now (no model is configured)')
      }
      // 排进队列之前先扣：余额不够就不占队列里的位置。还在等 USDC 付款的单（旧的定价方式）不扣积分。
      const cost = price.free ? creditCosts().customOrder : 0
      const { balance } = cost > 0 ? applyCredit({ userId: buyer, delta: -cost, kind: 'custom-order', ref: base.id, note: input.brief!.slice(0, 80) }) : { balance: balanceOf(buyer) }
      // 记下谁付了多少：做失败时退回（lib/store/orders.ts 的 failOrder）。
      const order = await saveOrder({ ...base, kind: 'custom', price, status: price.free ? 'queued' : 'awaiting_payment', brief: input.brief!, base: input.base ?? null, buyerId: buyer, credits: cost })
      if (price.free) enqueueCustomOrder(order.id)
      return { data: { ...(await orderView(order, origin)), credits: { charged: cost, balance } } }
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

  tool({
    name: 'list_skills',
    title: 'List skills',
    description:
      'Every agent skill Motif offers: general design skills (motion, typography, shaders, scroll, 3D …) and one skill per catalogue item with its tuned parameters. Returns names, descriptions and prices in credits; call get_skill to get one.',
    input: {
      query: z.string().max(200).optional().describe('Filter by words in the name or description'),
      general: z.boolean().optional().describe('Only the general design skills (true) or only per-item skills (false)'),
    },
    async run(input, { userId }) {
      const words = (input.query ?? '').toLowerCase().split(/\s+/).filter(Boolean)
      const skills = (await listAllSkills()).filter(
        (skill) => (input.general === undefined || skill.general === input.general) && words.every((word) => `${skill.name} ${skill.description}`.toLowerCase().includes(word)),
      )
      const owned = new Set(userId ? unlocksOf(userId, 'skill') : [])
      return {
        data: {
          count: skills.length,
          price: creditCosts().unlockSkill,
          skills: skills.map((skill) => ({ name: skill.name, description: skill.description, general: skill.general, unlocked: userId ? owned.has(skill.name) : null })),
          hint: 'get_skill returns every file of a skill (SKILL.md plus references); save them under .claude/skills/<name>/ in the project.',
        },
      }
    },
  }),

  tool({
    name: 'get_skill',
    title: 'Get a skill',
    description:
      'Download one skill: every file (SKILL.md, references, assets) as path + content. Needs an API key; the first download costs credits, later ones are free. Save the files under .claude/skills/<name>/.',
    input: { name: z.string().min(1).max(80).describe('Skill name from list_skills, e.g. motif-design or motif-mesh-gradient') },
    async run({ name }, context) {
      rateLimit(context.request, 'store-skill', 30)
      const buyer = requireBuyer(context)
      const files = await skillFilesFor(name, context.origin)
      if (!files) throw new HttpError(404, `no skill named "${name}"; use list_skills`)
      const paid = unlock(buyer, 'skill', name, creditCosts().unlockSkill)
      return { data: { name, install: `.claude/skills/${name}/`, files: Object.entries(files).map(([path, content]) => ({ path, content })), credits: { charged: paid.charged, balance: paid.balance } } }
    },
  }),

  tool({
    name: 'get_balance',
    title: 'Get credit balance',
    description: 'The credit balance of the account behind your API key, and what things cost.',
    input: {},
    async run(_input, context) {
      const buyer = requireBuyer(context)
      const costs = creditCosts()
      return {
        data: {
          balance: balanceOf(buyer),
          prices: { item: costs.unlockItem, skill: costs.unlockSkill, customOrder: costs.customOrder },
          buyMore: `${context.origin}/pricing`,
        },
      }
    },
  }),
]

export const STORE_INSTRUCTIONS = `Motif is a market of production-quality UI for agents: whole-site templates, design styles, page sections, components and visual effects. Every item is tunable (parameters with safe ranges and presets), license-checked and ships as working React + Tailwind code.

Typical flow: search_ui → get_ui → preview_ui (optional, returns screenshots) → place_order → get_order for the code. If nothing fits, place_order with a brief and an agent builds a custom item (poll get_order).
Skills: list_skills → get_skill.
Browsing (search, details, previews, quotes) is free. Getting code, skills and custom builds is paid in Motif credits and needs an API key from /account/keys, sent as "Authorization: Bearer <key>". Something you bought once stays free for your account. get_balance shows what is left.`

export function findTool(name: string): StoreTool | undefined {
  return STORE_TOOLS.find((entry) => entry.name === name) as StoreTool | undefined
}
