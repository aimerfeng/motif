'use client'

/**
 * 改地址栏（查询参数、hash）而不产生历史记录。
 * Safari 限制 30 秒内最多调用 100 次 replaceState，超出会抛 SecurityError：
 * 调用方要先节流（拖滑杆时每秒能变几十次），这里再兜底，不让它打断页面。
 */
export function replaceUrl(update: (url: URL) => void) {
  const url = new URL(window.location.href)
  update(url)
  if (url.href === window.location.href) return
  try {
    window.history.replaceState(window.history.state, '', url)
  } catch {
    // 超出频率限制时放弃这一次；下一次写入会带上最新状态。
  }
}

/** 节流写地址栏的间隔。 */
export const URL_WRITE_DELAY_MS = 250
