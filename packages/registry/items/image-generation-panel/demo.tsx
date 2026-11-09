// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Eduardo Calvo
// Source: https://github.com/educlopez/smoothui/blob/b6312bc/apps/docs/examples/image-generation-panel.tsx
// Modified by Motif; see the item's provenance.
import { useFrameLoop, usePrefersReducedMotion } from '@motif/runtime'
import { useEffect, useRef, useState } from 'react'
import { defaults, ImageGenerationPanel, type ImageGenerationImage, type ImageGenerationPanelProps, type ImageGenerationStatus } from './image-generation-panel'

const SCRIPTED_PROMPT = 'saturated color fields, heavy optical blur, fine film grain'
const PRESETS = [
  { id: 'film', label: '35mm film' },
  { id: 'soft', label: 'soft light' },
  { id: 'wide', label: 'wide angle' },
]
const SCRIPTED_CHIP = ', soft light'

// 一轮 9 秒：打字 → 点一个风格标签 → 排队 → 逐张出图 → 停留。时间全部来自 useFrameLoop。
const CYCLE = 9
const LEAD_IN = 0.4
const TYPE = 0.026
const CHIP_AT = 2.15
const QUEUE_AT = 2.5
const QUEUE = 0.5
const RAMP = 3.2
/** 减少动态效果时停在出图完成之后。 */
const STATIC_TIME = 7
/** 两位小数就够了：整个进度最多重渲染约 100 次。 */
const PROGRESS_QUANTUM = 100

type Frame = { prompt: string; typing: boolean; status: ImageGenerationStatus; progress: number; batch: number }
/** 用户接手之后的状态；startedAt 为 null 表示还没生成。 */
type Manual = { prompt: string; startedAt: number | null; batch: number }

function runFrame(prompt: string, batch: number, elapsed: number): Frame {
  if (elapsed < QUEUE) return { prompt, typing: false, status: 'queued', progress: 0, batch }
  if (elapsed < QUEUE + RAMP) {
    const progress = Math.round(((elapsed - QUEUE) / RAMP) * PROGRESS_QUANTUM) / PROGRESS_QUANTUM
    return { prompt, typing: false, status: 'generating', progress, batch }
  }
  return { prompt, typing: false, status: 'done', progress: 1, batch }
}

function scripted(time: number): Frame {
  const batch = Math.floor(time / CYCLE)
  const t = time - batch * CYCLE
  const typed = Math.max(0, Math.min(SCRIPTED_PROMPT.length, Math.floor((t - LEAD_IN) / TYPE)))
  const prompt = SCRIPTED_PROMPT.slice(0, typed) + (t >= CHIP_AT ? SCRIPTED_CHIP : '')
  if (t < QUEUE_AT) return { prompt, typing: true, status: 'idle', progress: 0, batch }
  return runFrame(prompt, batch, t - QUEUE_AT)
}

function manualFrame(manual: Manual, time: number): Frame {
  if (manual.startedAt === null) return { prompt: manual.prompt, typing: false, status: 'idle', progress: 0, batch: manual.batch }
  return runFrame(manual.prompt, manual.batch, time - manual.startedAt)
}

const sameFrame = (a: Frame, b: Frame) => a.prompt === b.prompt && a.typing === b.typing && a.status === b.status && a.progress === b.progress && a.batch === b.batch

/* ---- 结果图：现画的色场 + 胶片颗粒，外加一张很小的预览给马赛克那一层 ---- */

type Artwork = { src: string; preview: string; alt: string }

const PALETTES: { name: string; base: string; colors: string[] }[] = [
  { name: 'Coral and lavender', base: '#2a1638', colors: ['#ff7a59', '#c3a6ff', '#ff4d8d', '#ffd1a8'] },
  { name: 'Amber and violet', base: '#1d0f33', colors: ['#ffb020', '#7c3aed', '#ff6a3d', '#f7d36b'] },
  { name: 'Cobalt and pink', base: '#0b1a4a', colors: ['#2f5bff', '#ff5fa2', '#7fd3ff', '#b14dff'] },
  { name: 'Cyan and tangerine', base: '#06262e', colors: ['#22d3ee', '#ff8a3d', '#0ea5a4', '#ffd166'] },
  { name: 'Moss and lime', base: '#0f2414', colors: ['#a3e635', '#14b8a6', '#facc15', '#4ade80'] },
  { name: 'Rose and indigo', base: '#1e1240', colors: ['#fb7185', '#6366f1', '#f0abfc', '#38bdf8'] },
]
const ART_SIZE = 448
const PREVIEW_SIZE = 28
const GRAIN = 26

function random(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let x = Math.imul(state ^ (state >>> 15), 1 | state)
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

function rgba(hex: string, alpha: number) {
  const value = Number.parseInt(hex.slice(1), 16)
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`
}

function paint(palette: (typeof PALETTES)[number], index: number): Artwork | null {
  const canvas = document.createElement('canvas')
  canvas.width = ART_SIZE
  canvas.height = ART_SIZE
  const context = canvas.getContext('2d')
  if (!context) return null
  const rand = random(index * 7919 + 17)
  context.fillStyle = palette.base
  context.fillRect(0, 0, ART_SIZE, ART_SIZE)
  // 大块的径向色场叠在一起，本身就像重度失焦的光斑。
  palette.colors.forEach((color, layer) => {
    const x = ART_SIZE * (0.12 + rand() * 0.76)
    const y = ART_SIZE * (0.12 + rand() * 0.76)
    const radius = ART_SIZE * (0.42 + rand() * 0.4)
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius)
    gradient.addColorStop(0, rgba(color, 0.95))
    gradient.addColorStop(0.55, rgba(color, 0.42))
    gradient.addColorStop(1, rgba(color, 0))
    context.globalCompositeOperation = layer === palette.colors.length - 1 ? 'screen' : 'source-over'
    context.fillStyle = gradient
    context.fillRect(0, 0, ART_SIZE, ART_SIZE)
  })
  context.globalCompositeOperation = 'source-over'
  const pixels = context.getImageData(0, 0, ART_SIZE, ART_SIZE)
  const data = pixels.data
  for (let i = 0; i < data.length; i += 4) {
    const grain = (rand() - 0.5) * GRAIN
    data[i] = data[i]! + grain
    data[i + 1] = data[i + 1]! + grain
    data[i + 2] = data[i + 2]! + grain
  }
  context.putImageData(pixels, 0, 0)

  const small = document.createElement('canvas')
  small.width = PREVIEW_SIZE
  small.height = PREVIEW_SIZE
  small.getContext('2d')?.drawImage(canvas, 0, 0, PREVIEW_SIZE, PREVIEW_SIZE)
  return {
    src: canvas.toDataURL('image/jpeg', 0.9),
    preview: small.toDataURL('image/png'),
    alt: `${palette.name} colour field with soft blur and film grain`,
  }
}

const tileSeed = (batch: number, index: number) => String(1000 + ((batch * 7919 + index * 104729 + 4211) % 9000))
const batchSeed = (batch: number) => String(20000 + ((batch * 48271 + 31337) % 70000))

/** 让四张图的整块高度留在画面里：按画幅和列数算面板的最大宽度。 */
function panelWidth(count: number, ratio: string, minimal: boolean) {
  const [w, h] = ratio.split('/').map(Number)
  const r = w && h ? w / h : 1
  const cols = count === 1 ? 1 : count === 3 ? 3 : 2
  const rows = Math.ceil(count / cols)
  const budget = minimal ? 560 : 460
  const tile = ((budget - (rows - 1) * 10) * r) / rows
  return Math.min(576, Math.round(cols * tile + (cols - 1) * 10 + 30))
}

export function Demo(props: ImageGenerationPanelProps) {
  const host = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const clock = useRef(0)
  const manual = useRef<Manual | null>(null)
  const [frame, setFrame] = useState<Frame>(() => scripted(0))
  const frameRef = useRef(frame)
  frameRef.current = frame
  const [art, setArt] = useState<Artwork[]>([])
  const [picked, setPicked] = useState<string | null>(null)

  const count = props.count ?? defaults.count
  const aspectRatio = props.aspectRatio ?? defaults.aspectRatio
  const [ratio, setRatio] = useState(aspectRatio)
  const [ratioProp, setRatioProp] = useState(aspectRatio)
  if (ratioProp !== aspectRatio) {
    setRatioProp(aspectRatio)
    setRatio(aspectRatio)
  }

  useEffect(() => {
    setArt(PALETTES.map(paint).filter((artwork): artwork is Artwork => artwork !== null))
  }, [])

  const update = (time: number) => {
    clock.current = time
    const next = manual.current ? manualFrame(manual.current, time) : scripted(time)
    setFrame((prev) => (sameFrame(prev, next) ? prev : next))
  }

  useFrameLoop(host, ({ time }) => update(time), { reducedMotion: 'static', staticTime: STATIC_TIME })

  // 用户一碰面板就停掉脚本：保留当前提示词和已经出完的图。
  const takeOver = (): Manual => {
    if (!manual.current) {
      const current = frameRef.current
      const hasResults = current.status === 'generating' || current.status === 'done'
      manual.current = {
        prompt: current.prompt.length > 0 ? current.prompt : SCRIPTED_PROMPT,
        startedAt: hasResults ? Number.NEGATIVE_INFINITY : null,
        batch: current.batch,
      }
    }
    return manual.current
  }

  const generate = () => {
    const current = takeOver()
    manual.current = { ...current, startedAt: reduced ? Number.NEGATIVE_INFINITY : clock.current, batch: current.batch + 1 }
    setPicked(null)
    update(clock.current)
  }

  const images: ImageGenerationImage[] =
    art.length > 0 && (frame.status === 'generating' || frame.status === 'done')
      ? Array.from({ length: count }, (_, index) => {
          const artwork = art[(frame.batch * count + index) % art.length]!
          return { ...artwork, id: `${frame.batch}-${index}`, seed: tileSeed(frame.batch, index) }
        })
      : []

  return (
    <div
      ref={host}
      className="h-full w-full overflow-y-auto bg-background bg-[radial-gradient(60%_50%_at_50%_0%,oklch(0.32_0.06_330/0.35),transparent)]"
      onFocusCapture={() => takeOver()}
      onPointerDownCapture={() => takeOver()}
    >
      <div className="flex min-h-full flex-col items-center justify-center gap-3 p-4 sm:p-6">
        <ImageGenerationPanel
          {...props}
          aspectRatio={aspectRatio}
          className="shadow-2xl shadow-black/40"
          images={images}
          onAspectRatioChange={setRatio}
          onGenerate={generate}
          onPromptChange={(value) => {
            takeOver().prompt = value
            update(clock.current)
          }}
          onSelect={(image) => setPicked(image.seed ?? image.id)}
          onVariations={generate}
          presets={PRESETS}
          progress={frame.progress}
          prompt={frame.prompt}
          seed={frame.status === 'idle' ? undefined : batchSeed(frame.batch)}
          status={frame.status}
          style={{ maxWidth: panelWidth(count, ratio, props.chrome === 'minimal') }}
          typing={frame.typing}
        />
        <p aria-live="polite" className="min-h-4 text-muted-foreground text-xs">
          {picked ? `Seed ${picked} picked for upscaling` : ''}
        </p>
      </div>
    </div>
  )
}
