import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { callTool, http } from './api.ts'
import { bold, CliError, dim, green, note, yellow, type Context } from './context.ts'
import { applyWrites, codeDir, installCommand, planWrites, type IncomingFile, type PlannedWrite } from './install.ts'

/* 市场相关的命令。都是站点那批商店工具（lib/store/tools.ts）的薄封装：CLI 不重新实现任何业务规则。 */

const print = (text: string) => process.stdout.write(`${text}\n`)
const printJson = (value: unknown) => print(JSON.stringify(value, null, 2))

interface Credits {
  credits: number
  unlocked: boolean | null
}

interface Summary {
  slug: string
  title: string
  titleZh: string
  summary: string
  kind: string
  category: string
  credits: Credits
  page: string
}

const priceLabel = (credits: Credits) => (credits.unlocked ? green('owned') : `${credits.credits} credits`)

export async function search(context: Context, input: { query?: string; kind?: string; category?: string; limit?: number }): Promise<void> {
  const { data } = await callTool<{ results: Summary[]; hint: string; categories?: unknown }>(context, 'search_ui', input)
  if (context.json) {
    printJson(data)
    return
  }
  if (data.results.length === 0) {
    print(`Nothing matched. ${dim('Try fewer or broader words, or: motif custom "<what you need>"')}`)
    return
  }
  const width = Math.max(...data.results.map((result) => result.slug.length))
  for (const result of data.results) {
    print(`${bold(result.slug.padEnd(width))}  ${dim(`${result.kind}/${result.category}`.padEnd(24))} ${priceLabel(result.credits)}`)
    print(`${' '.repeat(width)}  ${result.summary}`)
  }
  print(dim(`\nmotif info <slug> for parameters and presets · motif add <slug> to put it in this project`))
}

interface Param {
  key: string
  type: string
  default: unknown
  min?: number
  max?: number
  options?: { value: string }[]
  label: string
}

interface Details extends Summary {
  params: Param[]
  presets: { id: string; name: string }[]
  guidance: unknown
  npmDependencies: string[]
  license: { spdx?: string; from?: string }
}

function paramRange(param: Param): string {
  if (param.min !== undefined && param.max !== undefined) return `${param.min}…${param.max}`
  if (param.options) return param.options.map((option) => option.value).join(' | ')
  return param.type
}

export async function info(context: Context, slug: string): Promise<void> {
  const { data } = await callTool<Details>(context, 'get_ui', { slug })
  if (context.json) {
    printJson(data)
    return
  }
  print(`${bold(data.title)} ${dim(`(${data.titleZh})`)} · ${data.kind}/${data.category} · ${priceLabel(data.credits)}`)
  print(data.summary)
  print(dim(data.page))
  if (data.params.length > 0) {
    print(`\n${bold('Parameters')} ${dim('(--set key=value)')}`)
    const width = Math.max(...data.params.map((param) => param.key.length))
    for (const param of data.params) print(`  ${param.key.padEnd(width)}  ${dim(paramRange(param).padEnd(22))} default ${JSON.stringify(param.default)}`)
  }
  if (data.presets.length > 0) print(`\n${bold('Presets')} ${dim('(--preset id)')}\n  ${data.presets.map((preset) => preset.id).join(', ')}`)
  if (data.npmDependencies.length > 0) print(`\n${bold('Needs')} ${data.npmDependencies.join(', ')}`)
  print(`\n${bold('License')} ${data.license.spdx ?? 'MIT'}${data.license.from ? dim(` · from ${data.license.from}`) : ''}`)
}

/** --set key=value：值能当 JSON 读就当 JSON（数字、布尔、数组），否则是字符串。 */
export function parseAssignments(pairs: string[]): Record<string, unknown> | undefined {
  if (pairs.length === 0) return undefined
  const values: Record<string, unknown> = {}
  for (const pair of pairs) {
    const split = pair.indexOf('=')
    if (split < 1) throw new CliError(`--set expects key=value, got "${pair}"`)
    const raw = pair.slice(split + 1)
    let value: unknown = raw
    try {
      value = JSON.parse(raw)
    } catch {
      // 不是 JSON：就是字符串本身（比如颜色 #ff0055）。
    }
    values[pair.slice(0, split)] = value
  }
  return values
}

interface RegistryItem {
  name: string
  dependencies: string[]
  registryDependencies: string[]
  files: { path: string; content: string; target?: string }[]
}

interface OrderView {
  id: string
  kind: 'item' | 'custom'
  status: 'awaiting_payment' | 'queued' | 'in_progress' | 'delivered' | 'failed'
  slug: string | null
  studio: string | null
  error: string | null
  next: string
  delivery: { install: string; registryItem: RegistryItem; runtimeItem: RegistryItem; skill: string | null; page: string } | null
  credits?: { charged: number; balance: number }
}

export interface SaveOptions {
  dir?: string
  overwrite: boolean
  dryRun: boolean
}

const MARKS: Record<PlannedWrite['action'], string> = { create: green('+'), overwrite: yellow('~'), unchanged: dim('='), skip: yellow('!') }

/** 把交付的代码写进项目：条目自己的文件，加上它用到的共享运行时。 */
function saveDelivery(order: OrderView, options: SaveOptions): void {
  const delivery = order.delivery!
  const usesRuntime = delivery.registryItem.registryDependencies.length > 0
  const items = usesRuntime ? [delivery.registryItem, delivery.runtimeItem] : [delivery.registryItem]
  const files: IncomingFile[] = items.flatMap((item) => item.files.map((file) => ({ target: file.target ?? file.path, content: file.content })))
  const cwd = process.cwd()
  const base = codeDir(cwd, options.dir)
  const plan = planWrites(base, files, options.overwrite)
  if (!options.dryRun) applyWrites(plan)

  for (const write of plan) print(`  ${MARKS[write.action]} ${path.relative(cwd, write.file) || write.file}${write.action === 'skip' ? yellow('  (exists and differs; pass --overwrite to replace)') : ''}`)
  if (options.dryRun) print(dim('  dry run: nothing was written'))
  const dependencies = [...new Set(items.flatMap((item) => item.dependencies))]
  const install = installCommand(cwd, dependencies)
  if (install) print(`\n${bold('Install its dependencies:')} ${install}`)
  const entry = delivery.registryItem.files[0]?.target?.replace(/\.(tsx?|jsx?)$/, '')
  if (entry) print(`${bold('Import it from:')} @/${entry}`)
  if (delivery.skill) print(dim(`Usage notes for your agent: ${delivery.skill}`))
  print(dim(`Tune it visually: ${delivery.page}`))
}

function describeOrder(order: OrderView): void {
  print(`${bold(`Order ${order.id}`)} · ${order.status}${order.error ? ` · ${order.error}` : ''}`)
  if (order.credits) print(dim(`${order.credits.charged > 0 ? `${order.credits.charged} credits spent` : 'no charge (already owned)'} · ${order.credits.balance} left`))
  if (order.status !== 'delivered') print(order.next)
  if (order.studio) print(dim(`Watch it being built: ${order.studio}`))
}

interface Quote {
  slug: string
  credits: Credits
  balance: number | null
}

export async function add(context: Context, input: { slug: string; preset?: string; values?: Record<string, unknown> }, options: SaveOptions): Promise<void> {
  // dry run 不能花积分。代码要下单才给，所以没买过的条目只报价；买过的再下单不扣，才把会写哪些文件列出来。
  if (options.dryRun) {
    const { data: quote } = await callTool<Quote>(context, 'get_quote', { slug: input.slug })
    if (!quote.credits.unlocked) {
      if (context.json) {
        printJson({ dryRun: true, ...quote })
        return
      }
      print(`${bold(quote.slug)} · ${quote.credits.credits} credits${quote.balance === null ? '' : ` · ${quote.balance} in your account`}`)
      print(dim('  dry run: nothing was bought or written. The files are listed once the item is yours.'))
      return
    }
  }
  const { data } = await callTool<OrderView>(context, 'place_order', { ...input, buyer: 'motif-cli' })
  if (context.json) {
    printJson(data)
    return
  }
  describeOrder(data)
  if (data.delivery) saveDelivery(data, options)
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function order(context: Context, id: string, options: SaveOptions & { save: boolean; wait: boolean }): Promise<void> {
  let { data } = await callTool<OrderView>(context, 'get_order', { orderId: id })
  // 定制单是 agent 现做的，一般几分钟；最多等二十分钟，之后让用户自己再查。
  const deadline = Date.now() + 20 * 60_000
  while (options.wait && (data.status === 'queued' || data.status === 'in_progress') && Date.now() < deadline) {
    note(dim(`  ${data.status}…`))
    await sleep(5000)
    data = (await callTool<OrderView>(context, 'get_order', { orderId: id })).data
  }
  if (context.json) {
    printJson(data)
    return
  }
  describeOrder(data)
  if (data.delivery && options.save) saveDelivery(data, options)
  else if (data.delivery) print(dim(`motif order ${id} --save writes the code into this project`))
}

export async function custom(context: Context, input: { brief: string; base?: string }, options: SaveOptions & { wait: boolean }): Promise<void> {
  const { data } = await callTool<OrderView>(context, 'place_order', { ...input, buyer: 'motif-cli' })
  if (!options.wait) {
    if (context.json) {
      printJson(data)
      return
    }
    describeOrder(data)
    print(dim(`motif order ${data.id} --wait --save waits for it and writes the code into this project`))
    return
  }
  note(`Order ${data.id} placed; waiting for it to be built…`)
  await order(context, data.id, { ...options, save: true, wait: true })
}

interface SkillSummary {
  name: string
  description: string
  general: boolean
  unlocked: boolean | null
}

export async function skills(context: Context, input: { query?: string; general?: boolean }): Promise<void> {
  const { data } = await callTool<{ count: number; price: number; skills: SkillSummary[] }>(context, 'list_skills', input)
  if (context.json) {
    printJson(data)
    return
  }
  for (const skill of data.skills) print(`${bold(skill.name)}${skill.unlocked ? ` ${green('owned')}` : ''}\n  ${dim(skill.description)}`)
  print(dim(`\n${data.count} skills · ${data.price} credits each, once · motif skill <name> saves one into .claude/skills/`))
}

export async function skill(context: Context, name: string, options: SaveOptions): Promise<void> {
  const { data } = await callTool<{ name: string; files: { path: string; content: string }[]; credits: { charged: number; balance: number } }>(context, 'get_skill', { name })
  if (context.json) {
    printJson(data)
    return
  }
  const cwd = process.cwd()
  // 默认放进 Claude Code 找 Skill 的位置；别的 agent 用 --dir 指到它自己的目录。
  const base = path.resolve(cwd, options.dir ?? path.join('.claude', 'skills'), data.name)
  const plan = planWrites(base, data.files.map((file) => ({ target: file.path, content: file.content })), options.overwrite)
  if (!options.dryRun) applyWrites(plan)
  for (const write of plan) print(`  ${MARKS[write.action]} ${path.relative(cwd, write.file) || write.file}${write.action === 'skip' ? yellow('  (exists and differs; pass --overwrite to replace)') : ''}`)
  print(dim(`${data.credits.charged > 0 ? `${data.credits.charged} credits spent` : 'no charge (already owned)'} · ${data.credits.balance} left`))
}

const EXTENSIONS: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }

export async function preview(context: Context, input: { slug: string; preset?: string; values?: Record<string, unknown> }, out: string | undefined): Promise<void> {
  const result = await callTool<{ slug: string; values: unknown; times: number[] }>(context, 'preview_ui', input)
  // 截图默认放到临时目录：不往用户的项目里丢图片。
  const dir = path.resolve(out ?? path.join(os.tmpdir(), 'motif-previews'))
  fs.mkdirSync(dir, { recursive: true })
  const files = (result.images ?? []).map((image, index) => {
    const file = path.join(dir, `${input.slug}-${result.data.times[index] ?? index}s.${EXTENSIONS[image.mediaType] ?? 'png'}`)
    fs.writeFileSync(file, Buffer.from(image.data, 'base64'))
    return file
  })
  if (context.json) {
    printJson({ ...result.data, files })
    return
  }
  for (const file of files) print(file)
}

interface ToolListing {
  mcp: string
  tools: { name: string; description: string; methods: string[]; readOnly: boolean }[]
}

export async function tools(context: Context): Promise<void> {
  const data = await http<ToolListing>(context, 'GET', '/api/agent', { key: null })
  if (context.json) {
    printJson(data)
    return
  }
  for (const entry of data.tools) print(`${bold(entry.name)}${entry.readOnly ? '' : ` ${yellow('spends credits')}`}\n  ${dim(entry.description)}`)
  print(dim(`\nmotif call <tool> '<json input>' · MCP endpoint: ${data.mcp}`))
}

export async function call(context: Context, name: string, rawInput: string | undefined): Promise<void> {
  let input: unknown = {}
  if (rawInput !== undefined) {
    try {
      input = JSON.parse(rawInput)
    } catch {
      throw new CliError('the input is not valid JSON', `example: motif call search_ui '{"query":"pricing"}'`)
    }
  }
  if (typeof input !== 'object' || input === null || Array.isArray(input)) throw new CliError('the input must be a JSON object')
  const result = await callTool<unknown>(context, name, input as Record<string, unknown>)
  // 截图是很长的 base64：不往终端里倒，只说有几张（要图用 motif preview）。
  printJson(result.images ? { data: result.data, images: `${result.images.length} image(s); use "motif preview" to save them` } : result.data)
}
