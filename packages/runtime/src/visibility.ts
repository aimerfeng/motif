import { useEffect, useState, type RefObject } from 'react'

/**
 * 元素是否值得继续动画：在视口内（或接近视口）且页面没有被隐藏。
 * 离屏或切到后台时返回 false，调用方应暂停 requestAnimationFrame。
 */
export function useIsActive(ref: RefObject<Element | null>, rootMargin = '64px'): boolean {
  const [inView, setInView] = useState(true)
  const [pageVisible, setPageVisible] = useState(true)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry?.isIntersecting ?? true), { rootMargin })
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref, rootMargin])

  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState !== 'hidden')
    update()
    document.addEventListener('visibilitychange', update)
    return () => document.removeEventListener('visibilitychange', update)
  }, [])

  return inView && pageVisible
}
