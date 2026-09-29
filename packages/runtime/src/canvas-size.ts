import { useEffect, useRef, type RefObject } from 'react'

export interface CanvasSize {
  /** 画布的像素尺寸（已乘以 dpr 并受 maxPixels 限制）。 */
  width: number
  height: number
  dpr: number
}

export interface CanvasSizeOptions {
  /** 设备像素比上限，高分屏上避免渲染过多像素。 */
  maxDpr?: number
  /** 画布总像素上限（例如 4K 全屏时再降一档）。 */
  maxPixels?: number
  onResize?: (size: CanvasSize) => void
}

/**
 * 让 canvas 的绘图缓冲区跟随它的 CSS 尺寸，同时限制 DPR 和总像素数。
 * 返回一个 ref，里面始终是最新尺寸，渲染循环里直接读，不会触发重渲染。
 */
export function useCanvasSize(canvasRef: RefObject<HTMLCanvasElement | null>, options: CanvasSizeOptions = {}): RefObject<CanvasSize> {
  const { maxDpr = 2, maxPixels = 2560 * 1440 } = options
  const size = useRef<CanvasSize>({ width: 1, height: 1, dpr: 1 })
  const onResize = useRef(options.onResize)
  onResize.current = options.onResize

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const update = () => {
      const rect = canvas.getBoundingClientRect()
      let dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
      const pixels = rect.width * rect.height * dpr * dpr
      if (pixels > maxPixels) dpr *= Math.sqrt(maxPixels / pixels)
      const width = Math.max(1, Math.round(rect.width * dpr))
      const height = Math.max(1, Math.round(rect.height * dpr))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
      size.current = { width, height, dpr }
      onResize.current?.(size.current)
    }
    const observer = new ResizeObserver(update)
    observer.observe(canvas)
    update()
    return () => observer.disconnect()
  }, [canvasRef, maxDpr, maxPixels])

  return size
}
