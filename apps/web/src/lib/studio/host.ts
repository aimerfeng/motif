import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { modelConfigFromEnv, type AgentHost, type Evaluation, type MarketHit, type Problem } from '@motif/agent'
import { checkItem } from '@motif/checker'
import type { ItemSource } from '@motif/schema'
import { FONT_FAMILIES, VENDOR_IDS } from '@motif/vendor/manifest'
import { getItem, getPublishedItems } from '@/lib/catalog'
import { compileInWorker } from '@/lib/community/compile'
import { HttpError } from '@/lib/community/http'
import { loadSources } from '@/lib/community/submission'
import { searchListings } from '@/lib/store/search'
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
      // 编译进程忙（排队满了）是暂时的，不是这个条目的问题：抛给调用方（接口回 503，agent 的工具会重试），
      // 不能记成一次编译失败存进会话，否则预览会无故变空。
      if (error instanceof HttpError) throw error
      problems.push({ level: 'error', rule: 'compile', message: error instanceof Error ? error.message : String(error) })
    }
  }
  return { ok: build !== null && !problems.some((problem) => problem.level === 'error'), problems, build, version }
}

/** 市场搜索：和商店给外部 agent 的 search_ui 用同一套检索（中英文、同义词、按命中多少排序）。 */
async function searchMarket(query: string, limit: number): Promise<MarketHit[]> {
  const items = await getPublishedItems()
  const listings = items.map(({ manifest }) => ({ manifest, source: 'catalog' as const, author: null }))
  return searchListings(listings, { query, limit }).map(({ manifest }) => ({
    slug: manifest.slug,
    title: manifest.title,
    summary: manifest.summary,
    kind: manifest.kind,
    category: manifest.category,
    tags: manifest.tags,
  }))
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
    // 模型看不了图（MOTIF_AGENT_VISION=false）时不给截图；本机 CLI 和脚本运行器没有这项配置，按能看图处理。
    ...(captureAvailable() && (modelConfigFromEnv(process.env)?.vision ?? true) ? { capture: capturePreview } : {}),
  }
}

// 拼进系统提示词的设计 skill：总纲 + 动效。目录以 packages/skills/library 为准。
const LIBRARY_DIR = path.resolve(/*turbopackIgnore: true*/ process.cwd(), '../..', 'packages/skills/library')
const PROMPT_SKILLS = ['motif-design', 'motif-motion']

export async function promptSkills(): Promise<{ name: string; content: string }[]> {
  return Promise.all(PROMPT_SKILLS.map(async (name) => ({ name, content: await readFile(path.join(/*turbopackIgnore: true*/ LIBRARY_DIR, name, 'SKILL.md'), 'utf8') })))
}
