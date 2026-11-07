/*
 * 站点的鼠标样式开关（docs/decisions/0010 第 3 节）。只在精确指针 + 可悬停的设备上启用；
 * 开启「减少动态效果」时照样启用，但细圈不滞后、变形不做过渡（去掉运动，保留含义）。
 * 用户在页脚可以关掉，记在这个浏览器里。只在浏览器里调用。
 */

export const CURSOR_KEY = 'motif-cursor'
const CHANGE = 'motif:cursor'

const FINE_POINTER = '(pointer: fine) and (hover: hover)'
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

/** 设备合不合适（有鼠标、能悬停）。不合适时页脚的开关也不出现。 */
export function cursorSupported(): boolean {
  return window.matchMedia(FINE_POINTER).matches
}

/** 减少动态效果：细圈直接贴着指针，不做弹性跟随。 */
export function cursorStill(): boolean {
  return window.matchMedia(REDUCED_MOTION).matches
}

/** 用户的选择：默认开。 */
export function cursorPreferred(): boolean {
  try {
    return localStorage.getItem(CURSOR_KEY) !== 'off'
  } catch {
    return true
  }
}

export function cursorEnabled(): boolean {
  return cursorSupported() && cursorPreferred()
}

export function setCursorPreferred(on: boolean): void {
  try {
    if (on) localStorage.removeItem(CURSOR_KEY)
    else localStorage.setItem(CURSOR_KEY, 'off')
  } catch {
    // 存不了就只在这一页生效。
  }
  window.dispatchEvent(new Event(CHANGE))
}

/** 给 useSyncExternalStore 用：开关、别的标签页改了偏好、接上或拔掉鼠标、系统改了减少动态效果。 */
export function subscribeCursor(notify: () => void): () => void {
  const queries = [window.matchMedia(FINE_POINTER), window.matchMedia(REDUCED_MOTION)]
  window.addEventListener(CHANGE, notify)
  window.addEventListener('storage', notify)
  for (const query of queries) query.addEventListener('change', notify)
  return () => {
    window.removeEventListener(CHANGE, notify)
    window.removeEventListener('storage', notify)
    for (const query of queries) query.removeEventListener('change', notify)
  }
}
