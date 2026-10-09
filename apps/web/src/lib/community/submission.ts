import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { checkItem, type Finding, type SourceRecord } from '@motif/checker'
import { COMMUNITY_LICENSE, contentHash } from '@motif/contracts'
import type { ItemSource, L10n } from '@motif/schema'
import { FONT_FAMILIES, VENDOR_IDS } from '@motif/vendor/manifest'
import type { Hex } from 'viem'
import { compileInWorker } from './compile'

/*
 * 投稿检查：和市场条目用同一个检查器、同一个编译器，所以“能投上去”就等于“能在市场里正常运行和导出”。
 * 浏览器里的预检和上传时的复检都走这里，服务端从不信任浏览器给的结论。
 */

export const SUBMISSION_LIMITS = { files: 80, bytes: 1_500_000 } as const

export interface SubmissionReport {
  ok: boolean
  findings: Finding[]
  contentHash: Hex | null
  slug: string | null
  title: L10n | null
  license: string
  upstream: { repo: string; sha: string } | null
  /** 清单里声明的 Remix 来源（provenance.basedOn）。 */
  basedOn: string | null
  build: { js: string; css: string } | null
}

/**
 * 社区投稿可以整合 sources/sources.json 之外的上游仓库：登记表是维护者整合时用的白名单，
 * 社区投稿的上游许可证由审核员核实（许可证本身仍然必须在白名单里，链上也会再校验一次）。
 */
const COMMUNITY_RELAXED_RULES = new Set(['provenance/source', 'provenance/sha'])

const SOURCES_FILE = path.resolve(/*turbopackIgnore: true*/ process.cwd(), '../..', 'sources/sources.json')
let sources: Promise<SourceRecord[]> | null = null
export function loadSources(): Promise<SourceRecord[]> {
  sources ??= readFile(SOURCES_FILE, 'utf8').then((text) => (JSON.parse(text) as { sources: SourceRecord[] }).sources)
  return sources
}

/** 把请求体里的 JSON 收窄成 ItemSource 的形状（字段的细节交给检查器）。返回字符串表示形状不对。 */
export function parseItemSource(raw: unknown): ItemSource | string {
  if (typeof raw !== 'object' || raw === null) return 'expected an object with "manifest" and "files"'
  const { manifest, files } = raw as Record<string, unknown>
  if (typeof manifest !== 'object' || manifest === null || Array.isArray(manifest)) return '"manifest" must be an object'
  if (typeof files !== 'object' || files === null || Array.isArray(files)) return '"files" must be an object of path → text'
  const entries = Object.entries(files)
  if (entries.length === 0 || entries.length > SUBMISSION_LIMITS.files) return `"files" must contain 1–${SUBMISSION_LIMITS.files} files`
  let bytes = 0
  for (const [file, text] of entries) {
    if (typeof text !== 'string') return `file "${file}" must be text`
    bytes += Buffer.byteLength(text)
  }
  if (bytes > SUBMISSION_LIMITS.bytes) return `files exceed ${SUBMISSION_LIMITS.bytes / 1_000_000} MB`
  return { manifest: manifest as ItemSource['manifest'], files: files as Record<string, string> }
}

export async function inspectSubmission(item: ItemSource): Promise<SubmissionReport> {
  const findings = checkItem(item, { sources: await loadSources(), vendorIds: VENDOR_IDS, fonts: FONT_FAMILIES }).map((finding): Finding =>
    COMMUNITY_RELAXED_RULES.has(finding.rule)
      ? { ...finding, level: 'warning', message: `${finding.message} (community submissions: curators verify this upstream by hand)` }
      : finding,
  )
  const manifestValid = !findings.some((finding) => finding.rule === 'manifest')
  if (manifestValid && item.manifest.status !== 'published') {
    findings.push({ level: 'error', rule: 'community/status', message: 'set manifest.status to "published" before submitting' })
  }

  let build: SubmissionReport['build'] = null
  if (manifestValid) {
    const compiled = await compileInWorker({ files: item.files, entry: item.manifest.demo.file, minify: true })
    for (const diagnostic of compiled.diagnostics) {
      const location = diagnostic.file ? `${diagnostic.file}${diagnostic.line ? `:${diagnostic.line}` : ''}` : undefined
      findings.push({ level: diagnostic.level, rule: 'compile', message: diagnostic.message, ...(location ? { file: location } : {}) })
    }
    if (compiled.ok) build = { js: compiled.js, css: compiled.css }
  }

  const upstream = manifestValid ? item.manifest.provenance.upstream : undefined
  return {
    ok: build !== null && !findings.some((finding) => finding.level === 'error'),
    findings,
    contentHash: manifestValid ? await contentHash(item) : null,
    slug: manifestValid ? item.manifest.slug : null,
    title: manifestValid ? item.manifest.title : null,
    license: upstream?.spdx ?? COMMUNITY_LICENSE,
    upstream: upstream ? { repo: upstream.repo, sha: upstream.sha } : null,
    basedOn: manifestValid ? (item.manifest.provenance.basedOn ?? null) : null,
    build,
  }
}
