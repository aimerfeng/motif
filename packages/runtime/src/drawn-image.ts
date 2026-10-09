import { useEffect, useRef, useState } from 'react'

export interface DrawnImageOptions {
  width: number
  height: number
  /** 画之前要加载完的字体，写成 CSS font 简写，例如 `'400 200px "Archivo Black"'`。 */
  fonts?: string[]
  /**
   * 画完后裁到不透明像素的包围盒，四周留这么多像素。适合文字、标志：
   * 着色器按图片整体缩放，四周的透明空白会让图形变小。
   */
  trim?: number
}

/** 裁到不透明像素的包围盒（四周留 padding）；整张透明时原样返回。 */
function trimmed(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, padding: number): HTMLCanvasElement {
  const { data, width, height } = context.getImageData(0, 0, canvas.width, canvas.height)
  let top = height
  let left = width
  let right = -1
  let bottom = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3]! === 0) continue
      if (x < left) left = x
      if (x > right) right = x
      if (y < top) top = y
      if (y > bottom) bottom = y
    }
  }
  if (right < 0) return canvas
  const out = document.createElement('canvas')
  out.width = right - left + 1 + padding * 2
  out.height = bottom - top + 1 + padding * 2
  out.getContext('2d')?.drawImage(canvas, left, top, right - left + 1, bottom - top + 1, padding, padding, right - left + 1, bottom - top + 1)
  return out
}

/**
 * 用 Canvas 画一张图，返回 PNG 的 data URL。给需要图片输入的着色器用：条目里不能放二进制素材，图都现画。
 * key 变化时重画，draw 用到的参数都要拼进 key；draw 本身通过 ref 读取最新的版本。
 * 字体先加载完再画，不会画成后备字体。服务端渲染和第一次画完之前返回空字符串。
 */
export function useDrawnImage(key: string, draw: (context: CanvasRenderingContext2D, width: number, height: number) => void, options: DrawnImageOptions): string {
  const [url, setUrl] = useState('')
  const drawRef = useRef(draw)
  drawRef.current = draw
  const { width, height, fonts = [], trim } = options
  const fontList = fonts.join('\n')

  useEffect(() => {
    let cancelled = false
    const wanted = fontList ? fontList.split('\n') : []
    Promise.all(wanted.map((font) => document.fonts.load(font)))
      .catch(() => [])
      .then(() => {
        if (cancelled) return
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(width))
        canvas.height = Math.max(1, Math.round(height))
        const context = canvas.getContext('2d')
        if (!context) return
        drawRef.current(context, canvas.width, canvas.height)
        setUrl((trim === undefined ? canvas : trimmed(canvas, context, trim)).toDataURL('image/png'))
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [key, width, height, fontList, trim])

  return url
}

/**
 * 把图片地址变成加载好的 HTMLImageElement；加载完之前返回 null。
 * 着色器的参数每帧都在变时用它：传字符串的话，每次更新参数都会重新解码一遍图片。
 */
export function useImageElement(url: string): HTMLImageElement | null {
  const [element, setElement] = useState<HTMLImageElement | null>(null)
  useEffect(() => {
    if (!url) return
    let cancelled = false
    const image = new Image()
    image.onload = () => {
      if (!cancelled) setElement(image)
    }
    image.src = url
    return () => {
      cancelled = true
    }
  }, [url])
  return element
}
