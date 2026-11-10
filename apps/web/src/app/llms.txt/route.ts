import { CLIENTS } from '@motif/cli/clients'
import { KINDS } from '@motif/schema/core'
import { cliCommand } from '@/lib/cli'
import { storeListings } from '@/lib/store/listings'
import { creditCosts } from '@/lib/credits/pricing'
import { STORE_INSTRUCTIONS, STORE_TOOLS } from '@/lib/store/tools'
import { publicOrigin } from '@/lib/site'

/**
 * /llms.txt：用自然语言告诉 agent 这个站点是什么、怎么接入、怎么下单（docs/decisions/0008-agent-store.md）。
 * 接入方式的顺序和 /agents 一致：先是一条命令的自动配置，再是手动的几种（docs/decisions/0011-cli-and-agent-onboarding.md）。
 * 目录的规模和价格按当前数据生成。
 */
export async function GET(request: Request) {
  const origin = publicOrigin(request)
  const listings = await storeListings()
  const counts = KINDS.map((kind) => `${listings.filter((listing) => listing.manifest.kind === kind).length} ${kind}s`).join(', ')
  const costs = creditCosts()
  const text = `# Motif

> ${STORE_INSTRUCTIONS.split('\n')[0]}

Catalogue: ${listings.length} items (${counts}). Every item has tunable parameters with safe ranges, presets, usage rules for agents, a pinned upstream license, and ships as React + Tailwind v4 code that installs with shadcn.

## Connect

- One command (recommended): \`${cliCommand(origin, 'setup')}\`. It finds the coding agents on this machine (${CLIENTS.map((client) => client.label).join(', ')}), adds Motif to each as an MCP server and signs the user in from the browser. Needs Node.js 18+. No key is written into the agent's config.
- MCP over stdio, set up by hand: the server command is \`${cliCommand(origin, 'mcp')}\`; sign in once with \`${cliCommand(origin, 'login')}\`. Per-agent config files: ${origin}/agents
- MCP (Streamable HTTP), for hosted agents with no shell: ${origin}/mcp with the header \`Authorization: Bearer <api key>\`
  - Claude Code: \`claude mcp add --transport http motif ${origin}/mcp --header "Authorization: Bearer <api key>"\`
- Command line: the same package is a CLI (\`${cliCommand(origin, 'search pricing')}\`, \`add <slug>\`, \`custom "<brief>"\`, \`--help\` for the rest). In CI set MOTIF_API_KEY instead of signing in.
- API key: a signed-in user creates one at ${origin}/account/keys. Browsing works without it; code, skills and custom orders need it.
- Plain HTTP: GET ${origin}/api/agent lists the tools with JSON Schemas; call one with POST ${origin}/api/agent/<tool>, a JSON body and the same Authorization header.

## Tools

${STORE_TOOLS.map((tool) => `- ${tool.name}: ${tool.description}`).join('\n')}

## Ordering

1. search_ui with what you need, then get_ui for parameters and presets.
2. preview_ui to see it with your values (screenshots).
3. place_order with the slug (and values or a preset). It is delivered at once: the order contains every file (path + content), an install command and a skill URL.
4. Nothing fits? place_order with a brief: an agent builds a custom item that passes the same checks. Poll get_order until it is delivered.

5. Skills: list_skills, then get_skill for every file of one.

Prices are in Motif credits, paid from the account of your API key (${origin}/pricing): an item ${costs.unlockItem}, a skill ${costs.unlockSkill}, a custom order ${costs.customOrder}. Anything bought once stays free for that account. get_balance shows what is left.
Keep order ids: they are the only way to fetch an order again.

## Humans

- Market: ${origin}/market
- Studio (the same agent, interactive): ${origin}/studio
- Connect an agent: ${origin}/agents
- Docs: ${origin}/docs
`
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=300' } })
}
