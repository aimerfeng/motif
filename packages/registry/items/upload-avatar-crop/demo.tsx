import { useDrawnImage, useFrameLoop } from '@motif/runtime'
import { type ChangeEvent, type DragEvent, useRef, useState } from 'react'
import {
  type CropView,
  ImageCrop,
  ImageCropApply,
  ImageCropContent,
  ImageCropPreview,
  ImageCropReset,
  ImageCropZoom,
  type UploadAvatarCropProps,
} from './upload-avatar-crop'

/** 现画一张横幅人像：渐变背景、肩膀、脸和头发。条目里不能放照片。 */
function drawPortrait(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const bg = ctx.createLinearGradient(0, 0, w, h)
  bg.addColorStop(0, '#f6c28b')
  bg.addColorStop(0.55, '#e0789a')
  bg.addColorStop(1, '#5b4bb7')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)
  // 窗户的光斑
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  for (let i = 0; i < 5; i++) ctx.fillRect(40 + i * 120, 30, 70, h * 0.5)
  const cx = w * 0.56
  // 肩膀
  ctx.fillStyle = '#23345c'
  ctx.beginPath()
  ctx.ellipse(cx, h * 1.02, w * 0.3, h * 0.36, 0, 0, Math.PI * 2)
  ctx.fill()
  // 脖子
  ctx.fillStyle = '#c98a68'
  ctx.fillRect(cx - 26, h * 0.52, 52, 70)
  // 头发（后）
  ctx.fillStyle = '#2b1a14'
  ctx.beginPath()
  ctx.ellipse(cx, h * 0.4, 92, 112, 0, 0, Math.PI * 2)
  ctx.fill()
  // 脸
  ctx.fillStyle = '#e2a582'
  ctx.beginPath()
  ctx.ellipse(cx, h * 0.43, 72, 90, 0, 0, Math.PI * 2)
  ctx.fill()
  // 刘海
  ctx.fillStyle = '#2b1a14'
  ctx.beginPath()
  ctx.ellipse(cx - 18, h * 0.29, 80, 44, -0.25, 0, Math.PI * 2)
  ctx.fill()
  // 眼睛、嘴
  ctx.fillStyle = '#2b1a14'
  ctx.beginPath()
  ctx.arc(cx - 26, h * 0.44, 6, 0, Math.PI * 2)
  ctx.arc(cx + 26, h * 0.44, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#a4504a'
  ctx.lineWidth = 5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(cx, h * 0.5, 20, 0.2 * Math.PI, 0.8 * Math.PI)
  ctx.stroke()
}

/** 自动播放：慢慢放大、平移到脸上，再回到全景，10 秒一轮。 */
function scripted(time: number): CropView {
  const t = (time % 10) / 10
  const ease = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * x)
  const k = t < 0.5 ? ease(t * 2) : ease((1 - t) * 2)
  return { zoom: 1 + k * 0.9, x: -0.05 - 0.12 * k + 0.04 * Math.sin(time * 0.9), y: 0.18 * k }
}

export function Demo(props: UploadAvatarCropProps) {
  const host = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const portrait = useDrawnImage('portrait', drawPortrait, { width: 640, height: 440 })
  const [file, setFile] = useState<File | null>(null)
  const [manual, setManual] = useState(false)
  const [autoView, setAutoView] = useState<CropView>({ zoom: 1, x: 0, y: 0 })
  const [saved, setSaved] = useState<string | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (!manual) setAutoView(scripted(time))
    },
    { reducedMotion: 'static', staticTime: 3.2 },
  )

  const stopAuto = () => setManual(true)
  const pick = (f: File | undefined) => {
    if (!f || !f.type.startsWith('image/')) return
    setFile(f)
    setSaved(null)
    setManual(true)
  }

  return (
    <div ref={host} className="grid h-full w-full place-items-center overflow-y-auto bg-background p-4">
      <div
        className="w-full max-w-[340px] rounded-2xl border bg-card p-5 text-card-foreground shadow-2xl shadow-black/30"
        onPointerDownCapture={stopAuto}
        onWheelCapture={stopAuto}
        onKeyDownCapture={stopAuto}
        onDragOver={(e: DragEvent) => e.preventDefault()}
        onDrop={(e: DragEvent) => {
          e.preventDefault()
          pick(e.dataTransfer.files[0])
        }}
      >
        <div className="mb-1 flex items-center justify-between gap-2">
          <div className="text-sm font-semibold">Profile photo</div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-md px-2 py-1 text-xs text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            Choose another
          </button>
          <input ref={inputRef} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden onChange={(e: ChangeEvent<HTMLInputElement>) => pick(e.target.files?.[0])} />
        </div>
        <div className="mb-4 text-xs text-muted-foreground">Drag to reposition, scroll to zoom. Drop an image to replace it.</div>
        <ImageCrop {...props} file={file} src={portrait} view={manual ? undefined : autoView} onCrop={setSaved} className="items-center">
          <ImageCropContent />
          <ImageCropZoom />
          <div className="flex w-full max-w-[277px] items-center gap-3">
            <ImageCropPreview size={48} />
            <ImageCropPreview size={32} />
            <ImageCropPreview size={20} />
            <div className="ml-auto flex items-center gap-1">
              <ImageCropReset />
              <ImageCropApply />
            </div>
          </div>
        </ImageCrop>
        <div role="status" className="mt-4 flex min-h-8 items-center gap-2 text-xs text-muted-foreground">
          {saved ? (
            <>
              <img src={saved} alt="Saved avatar" className="size-8 rounded-full" />
              Saved. This is what teammates will see.
            </>
          ) : (
            'Shown at 48, 32 and 20 px across the app.'
          )}
        </div>
      </div>
    </div>
  )
}
