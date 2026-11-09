import { useFrameLoop } from '@motif/runtime'
import { useEffect, useRef, useState } from 'react'
import type { FileMetadata } from './use-file-upload'
import { UploadImageGallery, type UploadImageGalleryProps } from './upload-image-gallery'

/** 现画的「商品照」：渐变底 + 简单的静物剪影，代替上游的远程图片。 */
const SHOTS = [
  { name: 'ceramic-vase.jpg', bg: ['#e7d8c9', '#b99a7f'], ink: '#5b4636', shape: 'vase' },
  { name: 'desk-lamp.jpg', bg: ['#1f2a37', '#3b4f66'], ink: '#f3c96b', shape: 'lamp' },
  { name: 'linen-chair.jpg', bg: ['#cfd8c4', '#8fa085'], ink: '#3e4a3a', shape: 'chair' },
  { name: 'glass-bottle.jpg', bg: ['#2b2140', '#5a3f7a'], ink: '#c7b6ef', shape: 'bottle' },
  { name: 'oak-stool.jpg', bg: ['#f1e4d3', '#d6a77a'], ink: '#7a4b2a', shape: 'stool' },
  { name: 'tea-cup.jpg', bg: ['#d9e6ee', '#89a9bd'], ink: '#2f4858', shape: 'cup' },
] as const

function drawShot(ctx: CanvasRenderingContext2D, s: number, shot: (typeof SHOTS)[number]) {
  const g = ctx.createLinearGradient(0, 0, s * 0.4, s)
  g.addColorStop(0, shot.bg[0])
  g.addColorStop(1, shot.bg[1])
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
  // 地面与影子
  ctx.fillStyle = 'rgba(0,0,0,0.12)'
  ctx.fillRect(0, s * 0.72, s, s * 0.28)
  ctx.beginPath()
  ctx.ellipse(s * 0.5, s * 0.74, s * 0.22, s * 0.035, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.22)'
  ctx.fill()
  ctx.fillStyle = shot.ink
  ctx.strokeStyle = shot.ink
  ctx.lineCap = 'round'
  const c = s / 2
  ctx.beginPath()
  switch (shot.shape) {
    case 'vase':
      ctx.moveTo(c - s * 0.05, s * 0.28)
      ctx.bezierCurveTo(c - s * 0.05, s * 0.38, c - s * 0.18, s * 0.45, c - s * 0.15, s * 0.6)
      ctx.quadraticCurveTo(c - s * 0.13, s * 0.74, c, s * 0.74)
      ctx.quadraticCurveTo(c + s * 0.13, s * 0.74, c + s * 0.15, s * 0.6)
      ctx.bezierCurveTo(c + s * 0.18, s * 0.45, c + s * 0.05, s * 0.38, c + s * 0.05, s * 0.28)
      ctx.fill()
      break
    case 'lamp':
      ctx.lineWidth = s * 0.025
      ctx.moveTo(c - s * 0.1, s * 0.73)
      ctx.lineTo(c + s * 0.1, s * 0.73)
      ctx.moveTo(c, s * 0.73)
      ctx.lineTo(c - s * 0.08, s * 0.48)
      ctx.lineTo(c + s * 0.06, s * 0.32)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(c + s * 0.02, s * 0.27)
      ctx.lineTo(c + s * 0.2, s * 0.36)
      ctx.lineTo(c + s * 0.1, s * 0.44)
      ctx.fill()
      ctx.beginPath()
      ctx.fillStyle = 'rgba(243,201,107,0.18)'
      ctx.moveTo(c + s * 0.15, s * 0.4)
      ctx.lineTo(c + s * 0.42, s * 0.72)
      ctx.lineTo(c + s * 0.05, s * 0.72)
      ctx.fill()
      break
    case 'chair':
      ctx.roundRect(c - s * 0.16, s * 0.3, s * 0.32, s * 0.24, s * 0.04)
      ctx.roundRect(c - s * 0.2, s * 0.5, s * 0.4, s * 0.1, s * 0.03)
      ctx.fill()
      ctx.lineWidth = s * 0.02
      ctx.beginPath()
      ctx.moveTo(c - s * 0.16, s * 0.6)
      ctx.lineTo(c - s * 0.18, s * 0.73)
      ctx.moveTo(c + s * 0.16, s * 0.6)
      ctx.lineTo(c + s * 0.18, s * 0.73)
      ctx.stroke()
      break
    case 'bottle':
      ctx.roundRect(c - s * 0.03, s * 0.2, s * 0.06, s * 0.14, s * 0.01)
      ctx.roundRect(c - s * 0.11, s * 0.36, s * 0.22, s * 0.38, s * 0.05)
      ctx.fill()
      ctx.fillStyle = 'rgba(255,255,255,0.25)'
      ctx.fillRect(c - s * 0.07, s * 0.42, s * 0.025, s * 0.26)
      break
    case 'stool':
      ctx.ellipse(c, s * 0.44, s * 0.17, s * 0.045, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.lineWidth = s * 0.03
      ctx.beginPath()
      ctx.moveTo(c - s * 0.12, s * 0.46)
      ctx.lineTo(c - s * 0.16, s * 0.73)
      ctx.moveTo(c + s * 0.12, s * 0.46)
      ctx.lineTo(c + s * 0.16, s * 0.73)
      ctx.moveTo(c, s * 0.48)
      ctx.lineTo(c, s * 0.73)
      ctx.stroke()
      break
    default:
      ctx.moveTo(c - s * 0.16, s * 0.48)
      ctx.lineTo(c + s * 0.16, s * 0.48)
      ctx.quadraticCurveTo(c + s * 0.15, s * 0.72, c, s * 0.72)
      ctx.quadraticCurveTo(c - s * 0.15, s * 0.72, c - s * 0.16, s * 0.48)
      ctx.fill()
      ctx.lineWidth = s * 0.025
      ctx.beginPath()
      ctx.arc(c + s * 0.18, s * 0.56, s * 0.05, -Math.PI / 2, Math.PI / 2)
      ctx.stroke()
  }
}

function useShots(): FileMetadata[] {
  const [shots, setShots] = useState<FileMetadata[]>([])
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 320
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    setShots(
      SHOTS.map((shot, i) => {
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        drawShot(ctx, 320, shot)
        return { id: `shot-${i}`, name: shot.name, size: 1_200_000 + i * 310_000, type: 'image/jpeg', url: canvas.toDataURL('image/jpeg', 0.86) }
      }),
    )
  }, [])
  return shots
}

/** 一轮 10 秒：拖入 -> 图片陆续出现 -> 一张超出大小报错 -> 删掉一张 -> 清空重来。 */
function scripted(time: number, single: boolean, maxSizeMB: number) {
  const t = time % 10
  const dragging = (t >= 1.0 && t < 2.2) || (!single && t >= 5.0 && t < 5.8)
  let shown: number[] = []
  let error = ''
  if (single) {
    if (t >= 2.2 && t < 8.6) shown = [3]
  } else {
    if (t >= 2.2) shown = [0, 1, 2]
    if (t >= 3.1) shown = [0, 1, 2, 3]
    if (t >= 4.0) shown = [0, 1, 2, 3, 4]
    if (t >= 5.8 && t < 7.6) error = `Some files exceed the maximum size of ${maxSizeMB}MB.`
    if (t >= 7.6) shown = [0, 2, 3, 4]
    if (t >= 9.2) shown = []
  }
  return { key: `${dragging}|${shown.join(',')}|${error}`, dragging, shown, error }
}

export function Demo(props: UploadImageGalleryProps) {
  const host = useRef<HTMLDivElement>(null)
  const shots = useShots()
  const single = props.mode === 'single'
  const maxSizeMB = props.maxSizeMB ?? 5
  const [frame, setFrame] = useState(() => scripted(5.6, single, maxSizeMB))
  const [manual, setManual] = useState(false)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time, single, maxSizeMB)
      setFrame((prev) => (prev.key === next.key ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 5.6 },
  )

  const maxFiles = props.maxFiles ?? 6
  const previewFiles = frame.shown.map((i) => shots[i]).filter((s): s is FileMetadata => s !== undefined).slice(0, single ? 1 : maxFiles)

  return (
    <div ref={host} onPointerDown={() => setManual(true)} className="grid h-full w-full place-items-center overflow-hidden bg-background p-4 sm:p-6">
      <div className="w-full max-w-[460px] rounded-2xl border bg-card/70 p-5 shadow-2xl shadow-black/30">
        <h2 className="text-base font-semibold">{single ? 'Cover photo' : 'Product photos'}</h2>
        <p className="mt-0.5 mb-4 text-xs text-muted-foreground">
          {single ? 'Shown at the top of your shop page.' : 'The first photo becomes the listing thumbnail.'}
        </p>
        <UploadImageGallery
          {...props}
          initialFiles={undefined}
          previewFiles={manual ? undefined : previewFiles}
          dragging={manual ? undefined : frame.dragging}
          error={manual ? undefined : frame.error || undefined}
        />
      </div>
    </div>
  )
}
