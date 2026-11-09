import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { ColorPickerPanel, hslToHex, type ColorPickerPanelProps } from './color-picker-panel'

/** 一轮 10 秒：色相慢慢转一圈，指示点在色板里画一个小椭圆。 */
function scripted(time: number) {
  const t = (time % 10) / 10
  const a = t * Math.PI * 2
  const hue = (221 + t * 360) % 360
  const saturation = 78 + 14 * Math.sin(a * 2)
  const lightness = 52 + 8 * Math.cos(a * 2)
  return hslToHex(hue, saturation, lightness)
}

function luminance([r, g, b]: number[]) {
  const c = [r, g, b].map((v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}

export function Demo(props: ColorPickerPanelProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<string | null>(null)
  const [manual, setManual] = useState(false)
  const [rgba, setRgba] = useState<[number, number, number, number]>([37, 99, 235, 1])

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setAuto((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  const stop = () => setManual(true)
  const [r, g, b, a] = rgba
  const css = `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`
  const ink = luminance([r, g, b]) > 0.4 ? '#0a0a0a' : '#ffffff'

  return (
    <div ref={host} className="grid h-full w-full place-items-center overflow-y-auto bg-background p-4" onPointerDownCapture={stop} onKeyDownCapture={stop}>
      <div className="flex w-full max-w-[640px] flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center">
        <ColorPickerPanel {...props} value={manual ? undefined : (auto ?? undefined)} onChange={setRgba} />
        <div className="flex w-full max-w-[260px] flex-col gap-3 text-sm">
          <div>
            <h2 className="font-semibold">Brand color</h2>
            <p className="mt-1 text-xs text-muted-foreground">Used for buttons, links and focus rings across the Northwind workspace.</p>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">Preview</span>
              <span className="font-mono text-[11px] text-muted-foreground">{Math.round(a * 100)}%</span>
            </div>
            <button type="button" className="mt-2 h-9 w-full rounded-md text-sm font-medium" style={{ background: css, color: a < 0.5 ? 'var(--foreground)' : ink }}>
              Invite teammates
            </button>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="size-3 shrink-0 rounded-full" style={{ background: css }} />
              <span className="font-medium underline underline-offset-2" style={{ textDecorationColor: css }}>
                Read the setup guide
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
