import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { ThemePreviewPicker, type ThemePreviewPickerProps, type ThemeValue } from './radio-theme-preview'

const ORDER: ThemeValue[] = ['light', 'dark', 'system']
const STEP = 2.5

export function Demo(props: ThemePreviewPickerProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(0)
  const [manual, setManual] = useState<ThemeValue | null>(null)
  const count = props.options === 'pair' ? 2 : 3

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = Math.floor(time / STEP) % count
      setAuto((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 0.5 },
  )

  const current = manual && ORDER.indexOf(manual) < count ? manual : ORDER[auto % count]!

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-4">
      <div className="w-full max-w-[340px] rounded-xl border bg-card p-5 shadow-xl shadow-black/20">
        <div className="mb-4">
          <div className="text-sm leading-5 font-semibold">Appearance</div>
          <div className="text-xs leading-4 text-muted-foreground">Applies to this workspace on every device.</div>
        </div>
        <ThemePreviewPicker {...props} value={current} onValueChange={setManual} />
      </div>
    </div>
  )
}
