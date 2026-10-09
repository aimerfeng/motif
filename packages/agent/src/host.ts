import type { Category, ItemSource, Kind, L10n } from '@motif/schema/core'

/**
 * agent 运行时依赖的外部能力。站点（编译走常驻子进程）和 smoke 脚本（直接调编译器）各给一份实现，
 * agent 包本身不碰文件系统、不起进程，也不知道浏览器在哪。
 */
export interface AgentHost {
  /** 检查 + 编译整个条目，和市场构建、社区投稿用同一套规则。 */
  evaluate(item: ItemSource): Promise<Evaluation>
  searchMarket(query: string, limit: number): Promise<MarketHit[]>
  /** 读一个已发布的市场条目（Remix 的参考）。 */
  readMarketItem(slug: string): Promise<ItemSource | null>
  /**
   * 等浏览器报告第 build 版编译产物在预览里的状态，最多等 timeoutMs 毫秒。
   * 浏览器没开着（比如 smoke 脚本）时返回 null，agent 就只能依赖编译结果。
   */
  previewStatus(build: number, timeoutMs: number): Promise<PreviewReport | null>
  /**
   * 在无头浏览器里渲染一版产物，按给定的时刻（秒）各截一张图。
   * 需要服务器上有浏览器，所以是可选的；没有时 agent 只能靠编译结果和 check_preview。
   */
  capture?(request: CaptureRequest): Promise<Screenshot[]>
}

export interface CaptureRequest {
  build: { js: string; css: string }
  exportName: string
  theme: 'dark' | 'light'
  props: Record<string, unknown>
  /** 整页类条目用更大的画布。 */
  page: boolean
  times: number[]
}

export interface Screenshot {
  /** 第几秒的画面。 */
  time: number
  mediaType: 'image/jpeg' | 'image/png'
  /** base64。 */
  data: string
}

export interface Problem {
  level: 'error' | 'warning'
  /** 来源：检查器的规则名，或者 compile（编译器）。 */
  rule: string
  message: string
  file?: string
}

export interface Evaluation {
  /** 编译成功且没有 error 级别的问题。 */
  ok: boolean
  problems: Problem[]
  /** 预览用的编译产物；清单不合法或编译失败时为 null。 */
  build: { js: string; css: string } | null
  /** 第几版产物，单调递增；浏览器报告预览状态时带上它，避免把旧版本的状态算到新版本头上。 */
  version: number
}

export interface MarketHit {
  slug: string
  title: L10n
  summary: L10n
  kind: Kind
  category: Category
  tags: string[]
}

export type PreviewReport =
  /** blank 只有在能检测时才给（沙箱跨源，宿主读不到像素）。 */
  | { state: 'mounted'; ms: number; blank?: boolean }
  | { state: 'error'; phase: string; message: string }
  | { state: 'hung' }

/** 给 agent 看的检查结果：先说结论，再逐条列问题（最多 20 条，够它定位）。 */
export function describeEvaluation(evaluation: Evaluation): string {
  const errors = evaluation.problems.filter((problem) => problem.level === 'error')
  const warnings = evaluation.problems.filter((problem) => problem.level === 'warning')
  const head = evaluation.ok
    ? `Build ${evaluation.version} compiled and passed the checker${warnings.length ? ` with ${warnings.length} warning(s)` : ''}.`
    : `Build ${evaluation.version} has ${errors.length} error(s)${warnings.length ? ` and ${warnings.length} warning(s)` : ''}; fix them before anything else.`
  const lines = [...errors, ...warnings].slice(0, 20).map((problem) => `- [${problem.level}] ${problem.rule}${problem.file ? ` (${problem.file})` : ''}: ${problem.message}`)
  return [head, ...lines].join('\n')
}

export function describePreview(report: PreviewReport | null): string {
  if (report === null) return 'No browser is showing the preview right now, so only the compile result is known.'
  switch (report.state) {
    case 'mounted':
      return report.blank
        ? `The preview mounted in ${report.ms} ms but looks blank (no visible variation). Check that the demo renders something visible and sized to fill its container.`
        : `The preview mounted in ${report.ms} ms without runtime errors.`
    case 'error':
      return `The preview failed during ${report.phase}: ${report.message}`
    case 'hung':
      return 'The preview stopped responding (an infinite loop or a blocked main thread) and was reloaded.'
  }
}
