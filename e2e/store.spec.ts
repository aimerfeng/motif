import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { expect, test } from '@playwright/test'
import { E2E } from './support/env'

/** 给 agent 的商店（docs/decisions/0008-agent-store.md）：MCP 和 HTTP 两个入口、现成条目和定制单。 */

interface CallResult {
  content: { type: string; text?: string }[]
  isError?: boolean
}

async function connect(): Promise<{ client: Client; call: (name: string, args: Record<string, unknown>) => Promise<{ data: Record<string, unknown>; isError: boolean; text: string }> }> {
  const client = new Client({ name: 'e2e-buyer', version: '0.0.0' })
  await client.connect(new StreamableHTTPClientTransport(new URL(`${E2E.webUrl}/mcp`)))
  const call = async (name: string, args: Record<string, unknown>) => {
    const result = (await client.callTool({ name, arguments: args })) as CallResult
    const text = result.content.find((part) => part.type === 'text')?.text ?? ''
    return { data: result.isError ? {} : (JSON.parse(text) as Record<string, unknown>), isError: result.isError === true, text }
  }
  return { client, call }
}

test('an agent finds, inspects and orders an item over MCP', async () => {
  const { client, call } = await connect()
  try {
    expect(client.getInstructions()).toContain('search_ui')
    expect((await client.listTools()).tools.map((tool) => tool.name)).toEqual(['search_ui', 'get_ui', 'preview_ui', 'get_quote', 'place_order', 'get_order'])

    const search = await call('search_ui', { query: 'loading dots', limit: 3 })
    const results = search.data.results as { slug: string; price: { free: boolean } }[]
    expect(results[0]).toMatchObject({ slug: 'loader-dots', price: { free: true } })

    const details = await call('get_ui', { slug: 'loader-dots' })
    const presets = details.data.presets as { id: string; values: Record<string, unknown> }[]
    expect((details.data.params as unknown[]).length).toBeGreaterThan(0)

    // 生产构建默认不开截图：工具返回原因，agent 改用海报。
    const preview = await call('preview_ui', { slug: 'loader-dots' })
    expect(preview).toMatchObject({ isError: true, text: expect.stringContaining('previews are not available') })

    const order = await call('place_order', { slug: 'loader-dots', preset: presets[1]!.id, values: { size: 17, nonsense: true }, buyer: 'e2e' })
    expect(order.data).toMatchObject({ status: 'delivered', price: { usdc: '0', free: true } })
    const delivery = order.data.delivery as { install: string; registryItem: { files: { path: string; content: string }[] }; runtimeItem: { files: unknown[] } }
    expect(delivery.install).toMatch(/npx shadcn@latest add ".*\/r\/loader-dots\.json\?v=/)
    // 预设打底、参数覆盖，未知的键丢掉：烤进代码的是合并后的值。
    const entry = delivery.registryItem.files.find((file) => file.content.includes('@motif:defaults'))!.content
    expect(entry).toContain('size: 17,')
    expect(entry).toContain("variant: 'bounce',")
    expect(entry).not.toContain('nonsense')
    expect(delivery.runtimeItem.files.length).toBeGreaterThan(0)

    const fetched = await call('get_order', { orderId: order.data.id })
    expect(fetched.data).toMatchObject({ id: order.data.id, status: 'delivered' })
    expect(await call('get_ui', { slug: 'no-such-item' })).toMatchObject({ isError: true, text: expect.stringContaining('search_ui') })
  } finally {
    await client.close()
  }
})

test('a custom order is built by the studio agent and delivered over HTTP', async ({ request }) => {
  const tools = await (await request.get('/api/agent')).json()
  expect(tools.tools.map((tool: { name: string }) => tool.name)).toContain('place_order')

  const quote = await (await request.post('/api/agent/get_quote', { data: { brief: 'A pulsing online badge' } })).json()
  expect(quote.data).toMatchObject({ kind: 'custom', price: { free: true } })

  const placed = await (await request.post('/api/agent/place_order', { data: { brief: 'A small status badge that pulses gently while online.', buyer: 'e2e' } })).json()
  expect(placed.data.status).toBe('queued')
  const id = placed.data.id as string

  // 脚本运行器先改坏再修好、再调一个参数，几秒钟就能交付。等到结束（交付或失败），失败时把原因带进断言信息。
  const fetchOrder = async () => (await (await request.post('/api/agent/get_order', { data: { orderId: id } })).json()).data
  await expect.poll(async () => ['delivered', 'failed'].includes((await fetchOrder()).status), { timeout: 60_000 }).toBe(true)
  const order = await fetchOrder()
  expect(order.status, order.error ?? '').toBe('delivered')
  expect(order.studio).toMatch(/\/studio\//)
  // 安装的是交付时存下的快照（订单号就是凭证）。
  expect(order.delivery.install).toMatch(new RegExp(`/r/o/${id}\\.json"$`))
  expect(order.delivery.registryItem.files.length).toBeGreaterThan(0)
  const registry = await request.get(`/r/o/${id}.json`)
  expect(registry.ok()).toBe(true)
  expect((await registry.json()).files.length).toBeGreaterThan(0)

  // 参数不适用时直接报错，不悄悄忽略。
  for (const data of [{ slug: 'loader-dots', brief: 'both at once' }, { slug: 'loader-dots', base: 'border-beam' }, { brief: 'A glowing pricing card for a SaaS', preset: 'aurora' }]) {
    expect((await request.post('/api/agent/place_order', { data })).status()).toBe(400)
  }
})

test('llms.txt tells agents how to connect', async ({ request }) => {
  const text = await (await request.get('/llms.txt')).text()
  expect(text).toContain('/mcp')
  expect(text).toContain('claude mcp add --transport http motif')
  expect(text).toMatch(/Catalogue: \d+ items/)
})
