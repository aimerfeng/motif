import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { ThemeToggleScenes, type ThemeToggleScenesProps, type ThemeToggleValue } from './theme-toggle-scenes'

/** 自动播放每 1.6 秒切到下一个主题：浅色 → 深色 →（跟随系统）。 */
const STEP = 1.6

const ORDER: ThemeToggleValue[] = ['light', 'dark', 'system']

const NOTE: Record<ThemeToggleValue, string> = {
  light: 'Light, always',
  dark: 'Dark, always',
  system: 'Follows your OS setting',
}

export function Demo(props: ThemeToggleScenesProps) {
  const host = useRef<HTMLDivElement>(null)
  const showSystem = props.showSystem ?? true
  const count = showSystem ? 3 : 2
  const [tick, setTick] = useState(0)
  const [manual, setManual] = useState<ThemeToggleValue | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = Math.floor(time / STEP)
      setTick((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 2.8 },
  )

  const picked = manual ?? ORDER[tick % count]!
  const theme: ThemeToggleValue = !showSystem && picked === 'system' ? 'light' : picked

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-[radial-gradient(60%_60%_at_50%_100%,oklch(0.32_0.08_280/0.35),transparent)] bg-background p-4">
      <div className="w-full max-w-[420px] rounded-2xl border bg-card/70 p-4 shadow-2xl shadow-black/30 sm:p-5">
        <div className="text-sm font-semibold text-foreground">Appearance</div>
        <p className="mt-1 text-xs text-muted-foreground">Choose how the dashboard looks on this device.</p>
        <div className="mt-4 grid min-h-[136px] place-items-center rounded-xl border border-border/60 bg-background/60 px-2 py-4">
          <ThemeToggleScenes {...props} theme={theme} onThemeChange={setManual} />
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground">Theme</span>
          <span className="font-medium text-foreground">{NOTE[theme]}</span>
        </div>
      </div>
    </div>
  )
}
