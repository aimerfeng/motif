/**
 * 手动时钟：截图和录屏时让每一帧都可复现。
 *
 * 安装后 requestAnimationFrame 的回调只在 advanceTo 时执行，performance.now / Date.now 返回手动设定的时间；
 * CSS 动画和 Web Animations 被暂停并跳到同一时刻。必须在条目模块加载之前安装：
 * motion 等库在模块初始化时就拿走了 requestAnimationFrame 的引用。
 */
const real = {
  requestAnimationFrame: window.requestAnimationFrame.bind(window),
  cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
  performanceNow: performance.now.bind(performance),
}

let installed = false
let now = 0
let nextId = 1
let queue = new Map<number, FrameRequestCallback>()
const epoch = Date.now()

export function installManualClock(): void {
  if (installed) return
  installed = true
  window.requestAnimationFrame = (callback) => {
    const id = nextId++
    queue.set(id, callback)
    return id
  }
  window.cancelAnimationFrame = (id) => {
    queue.delete(id)
  }
  performance.now = () => now
  Date.now = () => epoch + now
}

export function isManualClock(): boolean {
  return installed
}

/** 等浏览器真正合成两帧，保证截图拿到的是最新画面。 */
function nextPaint(): Promise<void> {
  return new Promise((resolve) => real.requestAnimationFrame(() => real.requestAnimationFrame(() => resolve())))
}

export async function advanceTo(ms: number, onError: (error: unknown) => void): Promise<void> {
  now = ms
  // 回调里再请求的帧留到下一次推进，与真实 rAF 的语义一致。
  const callbacks = [...queue.values()]
  queue = new Map()
  for (const callback of callbacks) {
    try {
      callback(now)
    } catch (error) {
      onError(error)
    }
  }
  for (const animation of document.getAnimations()) {
    animation.pause()
    animation.currentTime = ms
  }
  await nextPaint()
}

/** 用真实时钟测一段时间内的帧率；超过 25ms 的帧计为慢帧。 */
export function measureFrames(ms: number): Promise<{ fps: number; slowFrames: number }> {
  return new Promise((resolve) => {
    const start = real.performanceNow()
    let last = start
    let frames = 0
    let slowFrames = 0
    const tick = (time: number) => {
      frames++
      if (time - last > 25) slowFrames++
      last = time
      if (time - start >= ms) resolve({ fps: Math.round((frames * 1000) / (time - start)), slowFrames })
      else real.requestAnimationFrame(tick)
    }
    real.requestAnimationFrame(tick)
  })
}
