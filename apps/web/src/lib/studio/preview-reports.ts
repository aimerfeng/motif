import type { PreviewReport } from '@motif/agent'

/*
 * 浏览器把预览的状态（挂载成功、运行时报错、空白）报给服务端，agent 的 check_preview 在这里等。
 * 只在内存里：状态只对正在进行的那一轮有意义。页面和接口路由分开打包，所以挂在 globalThis 上共用一份。
 */

interface Entry {
  version: number
  report: PreviewReport
}

interface Waiter {
  version: number
  resolve: (report: PreviewReport | null) => void
}

const shared = ((globalThis as { __motifPreviewReports?: { latest: Map<string, Entry>; waiters: Map<string, Set<Waiter>>; seen: Map<string, number> } }).__motifPreviewReports ??= {
  latest: new Map(),
  waiters: new Map(),
  seen: new Map(),
})

/** 浏览器还开着这个会话的页面吗（最近 30 秒报过状态或心跳）。 */
export function hasViewer(sessionId: string): boolean {
  return Date.now() - (shared.seen.get(sessionId) ?? 0) < 30_000
}

export function touchViewer(sessionId: string): void {
  shared.seen.set(sessionId, Date.now())
}

export function reportPreview(sessionId: string, version: number, report: PreviewReport): void {
  touchViewer(sessionId)
  const current = shared.latest.get(sessionId)
  if (current && current.version > version) return
  shared.latest.set(sessionId, { version, report })
  for (const waiter of shared.waiters.get(sessionId) ?? []) {
    if (version >= waiter.version) waiter.resolve(report)
  }
}

/** 等第 version 版（或更新的）预览状态；没有浏览器在看时立刻返回 null。 */
export function waitForPreview(sessionId: string, version: number, timeoutMs: number): Promise<PreviewReport | null> {
  const current = shared.latest.get(sessionId)
  if (current && current.version >= version) return Promise.resolve(current.report)
  if (!hasViewer(sessionId)) return Promise.resolve(null)
  return new Promise((resolve) => {
    const waiters = shared.waiters.get(sessionId) ?? new Set<Waiter>()
    shared.waiters.set(sessionId, waiters)
    const waiter: Waiter = {
      version,
      resolve: (report) => {
        clearTimeout(timer)
        waiters.delete(waiter)
        resolve(report)
      },
    }
    // 超时说明预览一直没挂载上（比如一直在加载），当作卡住处理。
    const timer = setTimeout(() => waiter.resolve({ state: 'hung' }), timeoutMs)
    waiters.add(waiter)
  })
}
