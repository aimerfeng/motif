import { checkItem } from '@motif/checker'
import { compileItem } from '@motif/compiler'
import type { ItemSource } from '@motif/schema'
import { FONT_FAMILIES, VENDOR_IDS } from '@motif/vendor/manifest'
import type { AgentEvent, AgentHost, Evaluation, PreviewReport } from '../src/index.ts'

/** 测试用的宿主：真实的检查器和编译器，市场用一个固定条目代替，预览状态由测试指定。 */
export function testHost(options: { market?: ItemSource[]; preview?: PreviewReport | null } = {}): AgentHost & { evaluations: Evaluation[] } {
  let version = 0
  const evaluations: Evaluation[] = []
  return {
    evaluations,
    async evaluate(item) {
      const problems = checkItem(item, { sources: [], vendorIds: VENDOR_IDS, fonts: FONT_FAMILIES }).map((finding) => ({ ...finding }))
      let build: Evaluation['build'] = null
      if (!problems.some((problem) => problem.rule === 'manifest')) {
        const compiled = await compileItem({ files: item.files, entry: item.manifest.demo.file })
        for (const diagnostic of compiled.diagnostics) problems.push({ level: diagnostic.level, rule: 'compile', message: diagnostic.message })
        if (compiled.ok) build = { js: compiled.js, css: compiled.css }
      }
      const evaluation: Evaluation = { ok: build !== null && !problems.some((problem) => problem.level === 'error'), problems, build, version: ++version }
      evaluations.push(evaluation)
      return evaluation
    },
    async searchMarket(query) {
      return (options.market ?? [])
        .filter((item) => item.manifest.slug.includes(query))
        .map(({ manifest }) => ({ slug: manifest.slug, title: manifest.title, summary: manifest.summary, kind: manifest.kind, category: manifest.category, tags: manifest.tags }))
    },
    async readMarketItem(slug) {
      return options.market?.find((item) => item.manifest.slug === slug) ?? null
    },
    async previewStatus() {
      return options.preview === undefined ? { state: 'mounted', ms: 40, blank: false } : options.preview
    },
  }
}

export function collect(): { events: AgentEvent[]; onEvent: (event: AgentEvent) => void } {
  const events: AgentEvent[] = []
  return { events, onEvent: (event) => events.push(event) }
}
