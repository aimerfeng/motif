// SPDX-License-Identifier: MIT
// Copyright (c) 2023 — Present shadcnblocks
// Source: https://github.com/shadcnblocks/kibo/blob/3d63cdb/packages/image-crop/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type RefObject,
  type SyntheticEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

/* @motif:defaults */
export const defaults = {
  shape: 'circle',
  accent: '#a78bfa',
  radius: 18,
  minZoom: 1,
  maxZoom: 3,
  outputSize: 512,
  showPreviews: true,
}
/* @motif:end */

type Options = typeof defaults

/** 裁剪视图：zoom 为相对「刚好铺满裁剪框」的倍数，x / y 为图片中心相对裁剪框中心的偏移（以裁剪框边长为 1）。 */
export type CropView = { zoom: number; x: number; y: number }

const INITIAL_VIEW: CropView = { zoom: 1, x: 0, y: 0 }

/** 读出颜色的相对亮度，用来给强调色按钮选黑或白字。 */
function inkFor(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return '#ffffff'
  const n = Number.parseInt(m[1]!, 16)
  const lin = (c: number) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.4 ? '#0a0a0a' : '#ffffff'
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** 把视图限制在合法范围：缩放在 [minZoom, maxZoom]，图片始终盖满裁剪框。 */
function clampView(view: CropView, natural: { w: number; h: number } | null, o: Options): CropView {
  const zoom = clamp(view.zoom, o.minZoom, Math.max(o.minZoom, o.maxZoom))
  if (!natural) return { zoom, x: 0, y: 0 }
  const m = Math.min(natural.w, natural.h)
  const W = (natural.w / m) * zoom
  const H = (natural.h / m) * zoom
  return { zoom, x: clamp(view.x, -(W - 1) / 2, (W - 1) / 2), y: clamp(view.y, -(H - 1) / 2, (H - 1) / 2) }
}

const dataUrlBytes = (url: string) => Math.ceil(((url.length - url.indexOf(',') - 1) * 3) / 4)

/** 按当前视图把裁剪框内的图像画到画布上，导出 PNG；超过 maxImageSize 时逐步缩小输出尺寸。 */
const getCroppedPngImage = (image: HTMLImageElement, view: CropView, size: number, circle: boolean, maxImageSize: number): string => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Context is null, this should never happen.')

  const w = image.naturalWidth
  const h = image.naturalHeight
  const m = Math.min(w, h)
  const W = (w / m) * view.zoom
  const H = (h / m) * view.zoom
  const sx = ((-0.5 - (view.x - W / 2)) / W) * w
  const sy = ((-0.5 - (view.y - H / 2)) / H) * h

  canvas.width = Math.round(size)
  canvas.height = Math.round(size)
  ctx.imageSmoothingQuality = 'high'
  if (circle) {
    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2)
    ctx.clip()
  }
  ctx.drawImage(image, sx, sy, w / W, h / H, 0, 0, canvas.width, canvas.height)

  const url = canvas.toDataURL('image/png')
  if (dataUrlBytes(url) > maxImageSize && size > 32) return getCroppedPngImage(image, view, size * 0.9, circle, maxImageSize)
  return url
}

type ImageCropContextType = {
  options: Options
  imgSrc: string
  view: CropView
  natural: { w: number; h: number } | null
  imgRef: RefObject<HTMLImageElement | null>
  setView: (view: CropView) => void
  onImageLoad: (e: SyntheticEvent<HTMLImageElement>) => void
  applyCrop: () => void
  resetCrop: () => void
}

const ImageCropContext = createContext<ImageCropContextType | null>(null)

const useImageCrop = () => {
  const context = useContext(ImageCropContext)
  if (!context) throw new Error('ImageCrop components must be used within ImageCrop')
  return context
}

export type ImageCropProps = Partial<Options> & {
  /** 用户选的图片文件。 */
  file?: File | null
  /** 或者直接给一个图片地址（data URL / object URL）。 */
  src?: string
  maxImageSize?: number
  /** 点 Apply 后拿到裁好的 PNG data URL。 */
  onCrop?: (croppedImage: string) => void
  /** 受控视图（演示自动播放用）；不传则组件自己管理。 */
  view?: CropView
  onViewChange?: (view: CropView) => void
  children: ReactNode
  className?: string
  style?: CSSProperties
}

export const ImageCrop = ({ file, src, maxImageSize = 1024 * 1024 * 5, onCrop, view: viewProp, onViewChange, children, className, style, ...props }: ImageCropProps) => {
  const options = { ...defaults, ...props }
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [fileSrc, setFileSrc] = useState('')
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null)
  const [ownView, setOwnView] = useState<CropView>(INITIAL_VIEW)

  useEffect(() => {
    if (!file) {
      setFileSrc('')
      return
    }
    const reader = new FileReader()
    reader.addEventListener('load', () => setFileSrc(reader.result?.toString() || ''))
    reader.readAsDataURL(file)
    setOwnView({ ...INITIAL_VIEW, zoom: options.minZoom })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file])

  const imgSrc = fileSrc || src || ''
  const view = clampView(viewProp ?? ownView, natural, options)

  const setView = (next: CropView) => {
    const clamped = clampView(next, natural, options)
    if (!viewProp) setOwnView(clamped)
    onViewChange?.(clamped)
  }

  const onImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget
    setNatural({ w: naturalWidth, h: naturalHeight })
  }

  const applyCrop = () => {
    if (!(imgRef.current && natural)) return
    onCrop?.(getCroppedPngImage(imgRef.current, view, options.outputSize, options.shape === 'circle', maxImageSize))
  }

  const resetCrop = () => setView({ ...INITIAL_VIEW, zoom: options.minZoom })

  return (
    <ImageCropContext.Provider value={{ options, imgSrc, view, natural, imgRef, setView, onImageLoad, applyCrop, resetCrop }}>
      <div className={cn('flex flex-col gap-4', className)} style={{ '--crop-accent': options.accent, '--crop-ink': inkFor(options.accent), ...style } as CSSProperties}>
        {children}
      </div>
    </ImageCropContext.Provider>
  )
}

const frameRadius = (o: Options) => (o.shape === 'circle' ? '9999px' : `${o.radius}%`)

/** 图片在裁剪框（边长 1）里的位置；frame 是实际像素边长。 */
function imageStyle(view: CropView, natural: { w: number; h: number } | null, frame: number): CSSProperties {
  if (!natural) return { opacity: 0 }
  const m = Math.min(natural.w, natural.h)
  return {
    width: `${(natural.w / m) * 100}%`,
    height: `${(natural.h / m) * 100}%`,
    transform: `translate(-50%, -50%) translate(${view.x * frame}px, ${view.y * frame}px) scale(${view.zoom})`,
  }
}

export type ImageCropContentProps = { style?: CSSProperties; className?: string }

export const ImageCropContent = ({ style, className }: ImageCropContentProps) => {
  const { imgSrc, view, natural, setView, onImageLoad, imgRef, options } = useImageCrop()
  const hostRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const [frame, setFrame] = useState(0)
  const drag = useRef<{ id: number; x: number; y: number; view: CropView } | null>(null)
  const viewRef = useRef(view)
  viewRef.current = view
  const setViewRef = useRef(setView)
  setViewRef.current = setView

  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setFrame(el.clientWidth))
    ro.observe(el)
    setFrame(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  // 滚轮缩放需要非 passive 监听才能阻止页面滚动。
  useEffect(() => {
    const el = hostRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const v = viewRef.current
      setViewRef.current({ ...v, zoom: v.zoom * Math.exp(-e.deltaY * 0.0015) })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !frame) return
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, view }
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId || !frame) return
    setView({ ...d.view, x: d.view.x + (e.clientX - d.x) / frame, y: d.view.y + (e.clientY - d.y) / frame })
  }
  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.id === e.pointerId) drag.current = null
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 0.1 : 0.025
    const moves: Record<string, Partial<CropView>> = {
      ArrowLeft: { x: view.x - step },
      ArrowRight: { x: view.x + step },
      ArrowUp: { y: view.y - step },
      ArrowDown: { y: view.y + step },
      '+': { zoom: view.zoom * 1.1 },
      '=': { zoom: view.zoom * 1.1 },
      '-': { zoom: view.zoom / 1.1 },
    }
    const move = moves[e.key]
    if (!move) return
    e.preventDefault()
    setView({ ...view, ...move })
  }

  return (
    <div
      ref={hostRef}
      role="group"
      aria-roledescription="image cropper"
      aria-label="Crop area. Drag or use arrow keys to move, scroll or press plus and minus to zoom."
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      className={cn(
        'relative aspect-square w-full max-w-[277px] cursor-grab touch-none select-none overflow-hidden rounded-xl border bg-muted outline-none active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-[var(--crop-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
      style={style}
    >
      {/* 裁剪框外的部分：同一张图，压暗。 */}
      <div className="absolute inset-[10%]">
        {imgSrc && (
          <img alt="" aria-hidden draggable={false} src={imgSrc} className="pointer-events-none absolute left-1/2 top-1/2 max-w-none origin-center opacity-40" style={imageStyle(view, natural, frame)} />
        )}
      </div>
      <div ref={frameRef} className="absolute inset-[10%] overflow-hidden" style={{ borderRadius: frameRadius(options) }}>
        {imgSrc && (
          <img alt="crop" ref={imgRef} draggable={false} onLoad={onImageLoad} src={imgSrc} className="pointer-events-none absolute left-1/2 top-1/2 max-w-none origin-center" style={imageStyle(view, natural, frame)} />
        )}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-[10%] ring-2 ring-[var(--crop-accent)]" style={{ borderRadius: frameRadius(options) }} />
    </div>
  )
}

export type ImageCropZoomProps = { className?: string; label?: string }

/** 缩放滑块（原生 range，键盘可用）。 */
export const ImageCropZoom = ({ className, label = 'Zoom' }: ImageCropZoomProps) => {
  const { view, setView, options } = useImageCrop()
  const glyph = (plus: boolean) => (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <path d={plus ? 'M8 11h6M11 8v6M20 20l-3.5-3.5' : 'M8 11h6M20 20l-3.5-3.5'} />
    </svg>
  )
  return (
    <div className={cn('flex w-full max-w-[277px] items-center gap-2', className)}>
      {glyph(false)}
      <input
        type="range"
        aria-label={label}
        min={options.minZoom}
        max={Math.max(options.minZoom, options.maxZoom)}
        step={0.01}
        value={view.zoom}
        onChange={(e) => setView({ ...view, zoom: Number(e.target.value) })}
        className="h-1.5 min-w-0 flex-1 cursor-pointer accent-[var(--crop-accent)]"
      />
      {glyph(true)}
    </div>
  )
}

export type ImageCropPreviewProps = { size: number; className?: string }

/** 实时预览：小尺寸下最终头像的样子。 */
export const ImageCropPreview = ({ size, className }: ImageCropPreviewProps) => {
  const { imgSrc, view, natural, options } = useImageCrop()
  if (!options.showPreviews) return null
  return (
    <div aria-hidden className={cn('relative shrink-0 overflow-hidden bg-muted', className)} style={{ width: size, height: size, borderRadius: frameRadius(options) }}>
      {imgSrc && <img alt="" draggable={false} src={imgSrc} className="pointer-events-none absolute left-1/2 top-1/2 max-w-none origin-center" style={imageStyle(view, natural, size)} />}
    </div>
  )
}

const buttonBase =
  'inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium outline-none transition-[background-color,opacity] focus-visible:ring-2 focus-visible:ring-[var(--crop-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50'

export type ImageCropApplyProps = ComponentProps<'button'>

export const ImageCropApply = ({ children, onClick, className, ...props }: ImageCropApplyProps) => {
  const { applyCrop, natural } = useImageCrop()
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    applyCrop()
    onClick?.(e)
  }
  return (
    <button type="button" disabled={!natural} onClick={handleClick} className={cn(buttonBase, 'bg-[var(--crop-accent)] text-[var(--crop-ink)] hover:opacity-90', className)} {...props}>
      {children ?? (
        <>
          <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2v14a2 2 0 0 0 2 2h14" />
            <path d="M18 22V8a2 2 0 0 0-2-2H2" />
          </svg>
          Apply
        </>
      )}
    </button>
  )
}

export type ImageCropResetProps = ComponentProps<'button'>

export const ImageCropReset = ({ children, onClick, className, ...props }: ImageCropResetProps) => {
  const { resetCrop } = useImageCrop()
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    resetCrop()
    onClick?.(e)
  }
  return (
    <button type="button" aria-label={children ? undefined : 'Reset crop'} onClick={handleClick} className={cn(buttonBase, 'w-9 px-0 text-muted-foreground hover:bg-muted hover:text-foreground', className)} {...props}>
      {children ?? (
        <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      )}
    </button>
  )
}

export type CropperProps = Omit<ImageCropProps, 'children'>

/** 一体化用法：裁剪区 + 缩放滑块 + 预览 + 按钮。 */
export const Cropper = ({ className, style, ...props }: CropperProps) => (
  <ImageCrop className={className} style={style} {...props}>
    <ImageCropContent />
    <ImageCropZoom />
    <div className="flex items-center gap-3">
      <ImageCropPreview size={48} />
      <ImageCropPreview size={32} />
      <div className="ml-auto flex items-center gap-1">
        <ImageCropReset />
        <ImageCropApply />
      </div>
    </div>
  </ImageCrop>
)

export type UploadAvatarCropProps = CropperProps
export const UploadAvatarCrop = Cropper
