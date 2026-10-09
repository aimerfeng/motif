/**
 * 用本机 Claude Code CLI（Sonnet 5.5）真实跑几个 Studio 任务，确认 agent 能从一句话做出编译通过、检查干净的条目。
 * 会调用模型，所以不放进 pnpm verify；对话记录和产物写到 .data/evals/<时间>/，方便回头看 agent 的表现。
 *
 *   pnpm smoke:agent                 # 默认的三个任务
 *   pnpm smoke:agent "一句话需求" …   # 自定义任务
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { appendEvent, buildSystemPrompt, runAgent, starterItem, type AgentHost, type Evaluation, type TranscriptEntry } from '@motif/agent'
import { claudeCliRunner } from '@motif/agent-claude-cli'
import { checkItem, type SourceRecord } from '@motif/checker'
import { compileItem } from '@motif/compiler'
import { ITEMS_DIR, loadItemSource, REPO_ROOT } from '@motif/registry'
import { defaultsOf } from '@motif/schema'
import { FONT_FAMILIES, VENDOR_IDS } from '@motif/vendor/manifest'

const TASKS = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['一个缓慢流动的极光背景，冷色调，中间放一句标题', '三个圆点依次弹跳的加载动画，放在一张白色卡片里', 'A pricing card whose border glows softly when hovered, with a monthly / yearly toggle']

const sources = (JSON.parse(await readFile(path.join(REPO_ROOT, 'sources/sources.json'), 'utf8')) as { sources: SourceRecord[] }).sources
const skills = await Promise.all(['motif-design', 'motif-motion'].map(async (name) => ({ name, content: await readFile(path.join(REPO_ROOT, 'packages/skills/library', name, 'SKILL.md'), 'utf8') })))
const system = buildSystemPrompt({ vendorIds: VENDOR_IDS, fonts: FONT_FAMILIES, skills })
const slugs = readdir(ITEMS_DIR)

function host(): AgentHost {
  let version = 0
  return {
    async evaluate(item) {
      const problems = checkItem(item, { sources, vendorIds: VENDOR_IDS, fonts: FONT_FAMILIES }).map((finding) => ({ ...finding }))
      let build: Evaluation['build'] = null
      if (!problems.some((problem) => problem.rule === 'manifest')) {
        const compiled = await compileItem({ files: item.files, entry: item.manifest.demo.file })
        for (const diagnostic of compiled.diagnostics) problems.push({ level: diagnostic.level, rule: 'compile', message: diagnostic.message })
        if (compiled.ok) build = { js: compiled.js, css: compiled.css }
      }
      return { ok: build !== null && !problems.some((problem) => problem.level === 'error'), problems, build, version: ++version }
    },
    async searchMarket(query, limit) {
      const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
      const hits = []
      for (const slug of await slugs) {
        const { manifest } = await loadItemSource(path.join(ITEMS_DIR, slug))
        const text = [manifest.slug, manifest.title.en, manifest.title['zh-CN'], manifest.summary.en, ...manifest.tags].join(' ').toLowerCase()
        if (terms.some((term) => text.includes(term))) hits.push({ slug, title: manifest.title, summary: manifest.summary, kind: manifest.kind, category: manifest.category, tags: manifest.tags })
      }
      return hits.slice(0, limit)
    },
    async readMarketItem(slug) {
      return (await slugs).includes(slug) ? loadItemSource(path.join(ITEMS_DIR, slug)) : null
    },
    // 没有浏览器：check_preview 只能告诉 agent 编译结果。
    async previewStatus() {
      return null
    },
  }
}

const outDir = path.join(REPO_ROOT, '.data/evals', new Date().toISOString().replaceAll(':', '-').slice(0, 19))
await mkdir(outDir, { recursive: true })
const runner = claudeCliRunner()
let failures = 0

for (const [index, task] of TASKS.entries()) {
  const item = starterItem(`smoke-${index + 1}`)
  const transcript: TranscriptEntry[] = [{ role: 'user', text: task, at: Date.now() }]
  let usage = 0
  const started = performance.now()
  const result = await runAgent({
    runner,
    host: host(),
    system,
    prompt: task,
    item,
    values: defaultsOf(item.manifest.params),
    evaluation: null,
    state: undefined,
    signal: AbortSignal.timeout(10 * 60_000),
    onEvent(event) {
      appendEvent(transcript, event)
      if (event.type === 'usage') usage += event.inputTokens + event.outputTokens
      if (event.type === 'tool-call') process.stdout.write(`  · ${event.name}\n`)
    },
  })
  const seconds = Math.round((performance.now() - started) / 1000)
  const ok = result.completed && result.evaluation?.ok === true
  if (!ok) failures++
  const tools = transcript.filter((entry) => entry.role === 'tool').length
  console.log(`${ok ? 'PASS' : 'FAIL'} ${index + 1}. ${task} — ${seconds}s, ${tools} tool calls, ${usage} tokens, title "${result.item.manifest.title?.['zh-CN'] ?? '?'}"`)
  const name = `${index + 1}-${result.item.manifest.slug}`
  await writeFile(path.join(outDir, `${name}.transcript.json`), JSON.stringify({ task, seconds, usage, ok, transcript, problems: result.evaluation?.problems ?? [] }, null, 2))
  await writeFile(path.join(outDir, `${name}.motif.json`), JSON.stringify(result.item, null, 2))
}

console.log(`\n${TASKS.length - failures}/${TASKS.length} passed; transcripts in ${path.relative(REPO_ROOT, outDir)}`)
process.exitCode = failures ? 1 : 0
