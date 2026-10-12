import { KINDS } from '@motif/schema/core'
import { storeListings } from '@/lib/store/listings'
import { customPrice, pricingFromEnv } from '@/lib/store/pricing'
import { STORE_INSTRUCTIONS, STORE_TOOLS } from '@/lib/store/tools'
import { publicOrigin } from '@/lib/site'

/**
 * /llms.txt：用自然语言告诉 agent 这个站点是什么、怎么接入、怎么下单（docs/decisions/0008-agent-store.md）。
 * 目录的规模和价格按当前数据生成。
 */
export async function GET(request: Request) {
  const origin = publicOrigin(request)
  const listings = await storeListings()
  const counts = KINDS.map((kind) => `${listings.filter((listing) => listing.manifest.kind === kind).length} ${kind}s`).join(', ')
  const custom = customPrice(pricingFromEnv())
  const text = `# Motif

> ${STORE_INSTRUCTIONS.split('\n')[0]}

Catalogue: ${listings.length} items (${counts}). Every item has tunable parameters with safe ranges, presets, usage rules for agents, a pinned upstream license, and ships as React + Tailwind v4 code that installs with shadcn.

## Connect

- MCP (Streamable HTTP): ${origin}/mcp
  - Claude Code: \`claude mcp add --transport http motif ${origin}/mcp\`
- Plain HTTP: GET ${origin}/api/agent lists the tools with JSON Schemas; call one with POST ${origin}/api/agent/<tool> and a JSON body.

## Tools

${STORE_TOOLS.map((tool) => `- ${tool.name}: ${tool.description}`).join('\n')}

## Ordering

1. search_ui with what you need, then get_ui for parameters and presets.
2. preview_ui to see it with your values (screenshots).
3. place_order with the slug (and values or a preset). Open-source items are free and delivered at once: the order contains every file (path + content), an install command and a skill URL.
4. Nothing fits? place_order with a brief: an agent builds a custom item that passes the same checks. Poll get_order until it is delivered.

Prices are in USDC; paying in MOTIF is discounted. Custom orders currently cost ${custom.usdc} USDC.
Keep order ids: they are the only way to fetch an order again.

## Humans

- Market: ${origin}/market
- Studio (the same agent, interactive): ${origin}/studio
- Docs: ${origin}/docs
`
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=300' } })
}
