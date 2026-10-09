import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { AgentHost, Evaluation, MarketHit, Problem } from '@motif/agent'
import { checkItem } from '@motif/checker'
import type { ItemSource } from '@motif/schema'
import { FONT_FAMILIES, VENDOR_IDS } from '@motif/vendor/manifest'
import { getItem, getPublishedItems } from '@/lib/catalog'
import { compileInWorker } from '@/lib/community/compile'
import { loadSources } from '@/lib/community/submission'
import { captureAvailable, capturePreview } from './capture'
import { waitForPreview } from './preview-reports'

/**
 * 检查 + 编译一个条目：和市场构建、社区投稿同一个检查器、同一个编译子进程。
 * version 由调用方给（会话里单调递增），浏览器回报预览状态时用它对版本。
 */
export async function evaluateItem(item: ItemSource, version: number): Promise<Evaluation> {
  const problems: Problem[] = checkItem(item, { sources: await loadSources(), vendorIds: VENDOR_IDS, fonts: FONT_FAMILIES })
  let build: Evaluation['build'] = null
  // 清单本身不合法时没法确定入口，不编译。
  if (!problems.some((problem) => problem.rule === 'manifest') && typeof item.manifest.demo?.file === 'string') {
    try {
      const compiled = await compileInWorker({ files: item.files, entry: item.manifest.demo.file })
      for (const diagnostic of compiled.diagnostics) {
        const file = diagnostic.file ? `${diagnostic.file}${diagnostic.line ? `:${diagnostic.line}` : ''}` : undefined
        problems.push({ level: diagnostic.level, rule: 'compile', message: diagnostic.message, ...(file ? { file } : {}) })
      }
      if (compiled.ok) build = { js: compiled.js, css: compiled.css }
    } catch (error) {
      problems.push({ level: 'error', rule: 'compile', message: error instanceof Error ? error.message : String(error) })
    }
  }
  return { ok: build !== null && !problems.some((problem) => problem.level === 'error'), problems, build, version }
}

/** 市场搜索：标题、简介、标签、分类里都要包含每个关键词（中英文都比）。 */
async function searchMarket(query: string, limit: number): Promise<MarketHit[]> {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  const items = await getPublishedItems()
  return items
    .map(({ manifest }) => {
      const text = [manifest.slug, manifest.title.en, manifest.title['zh-CN'], manifest.summary.en, manifest.summary['zh-CN'], manifest.kind, manifest.category, ...manifest.tags].join(' ').toLowerCase()
      const score = terms.reduce((sum, term) => sum + (text.includes(term) ? 1 : 0), 0)
      return { manifest, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ manifest }) => ({ slug: manifest.slug, title: manifest.title, summary: manifest.summary, kind: manifest.kind, category: manifest.category, tags: manifest.tags }))
}

export function studioHost(sessionId: string, nextVersion: () => number): AgentHost {
  return {
    evaluate: (item) => evaluateItem(item, nextVersion()),
    searchMarket,
    async readMarketItem(slug) {
      const item = await getItem(slug)
      return item ? { manifest: item.manifest, files: item.files } : null
    },
    previewStatus: (build, timeoutMs) => waitForPreview(sessionId, build, timeoutMs),
    ...(captureAvailable() ? { capture: capturePreview } : {}),
  }
}

// 拼进系统提示词的设计 skill：总纲 + 动效。目录以 packages/skills/library 为准。
const LIBRARY_DIR = path.resolve(/*turbopackIgnore: true*/ process.cwd(), '../..', 'packages/skills/library')
const PROMPT_SKILLS = ['motif-design', 'motif-motion']

export async function promptSkills(): Promise<{ name: string; content: string }[]> {
  return Promise.all(PROMPT_SKILLS.map(async (name) => ({ name, content: await readFile(path.join(/*turbopackIgnore: true*/ LIBRARY_DIR, name, 'SKILL.md'), 'utf8') })))
}
