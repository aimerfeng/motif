// SPDX-License-Identifier: MIT
// Copyright (c) 2023 — Present shadcnblocks
// Source: https://github.com/shadcnblocks/kibo/blob/3d63cdb/packages/color-picker/index.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@/lib/motif-runtime'
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'

/* @motif:defaults */
export const defaults = {
  defaultColor: '#2563eb',
  format: 'hex',
  showAlpha: true,
  showEyedropper: true,
  swatches: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#2563eb', '#8b5cf6', '#ec4899'],
  radius: 6,
  width: 320,
}
/* @motif:end */

/* ---------- 颜色换算（替代 npm color） ---------- */

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export function parseHex(input: string): [number, number, number, number] | null {
  let hex = input.trim().replace(/^#/, '')
  if (/^[0-9a-f]{3,4}$/i.test(hex)) hex = hex.split('').map((c) => c + c).join('')
  if (!/^([0-9a-f]{6}|[0-9a-f]{8})$/i.test(hex)) return null
  const n = (i: number) => parseInt(hex.slice(i, i + 2), 16)
  return [n(0), n(2), n(4), hex.length === 8 ? n(6) / 255 : 1]
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  if (d === 0) return [0, 0, l * 100]
  const s = d / (1 - Math.abs(2 * l - 1))
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  h *= 60
  if (h < 0) h += 360
  return [h, s * 100, l * 100]
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100
  l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [f(0) * 255, f(8) * 255, f(4) * 255]
}

export function hslToHex(h: number, s: number, l: number) {
  return '#' + hslToRgb(h, s, l).map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('').toUpperCase()
}

function hexToHsla(hex: string) {
  const rgba = parseHex(hex)
  if (!rgba) return null
  const [h, s, l] = rgbToHsl(rgba[0], rgba[1], rgba[2])
  return { h, s, l, a: rgba[3] * 100 }
}

/* ---------- Context ---------- */

type ColorPickerContextValue = {
  hue: number
  saturation: number
  lightness: number
  alpha: number
  mode: string
  setHue: (hue: number) => void
  setSaturation: (saturation: number) => void
  setLightness: (lightness: number) => void
  setAlpha: (alpha: number) => void
  setMode: (mode: string) => void
}

const ColorPickerContext = createContext<ColorPickerContextValue | undefined>(undefined)

export const useColorPicker = () => {
  const context = useContext(ColorPickerContext)
  if (!context) throw new Error('useColorPicker must be used within a ColorPickerProvider')
  return context
}

export type ColorPickerProps = Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'> & {
  /** 受控值：#rrggbb 或 #rrggbbaa。 */
  value?: string
  defaultValue?: string
  defaultMode?: string
  /** [r, g, b, alpha 0–1] */
  onChange?: (value: [number, number, number, number]) => void
}

export const ColorPicker = ({ value, defaultValue = '#000000', defaultMode = 'hex', onChange, className, ...props }: ColorPickerProps) => {
  const initial = hexToHsla(value ?? '') ?? hexToHsla(defaultValue) ?? { h: 0, s: 100, l: 50, a: 100 }
  const [hue, setHue] = useState(initial.h)
  const [saturation, setSaturation] = useState(initial.s)
  const [lightness, setLightness] = useState(initial.l)
  const [alpha, setAlpha] = useState(initial.a)
  const [mode, setMode] = useState(defaultMode)

  useEffect(() => setMode(defaultMode), [defaultMode])

  // Update color when controlled value changes
  useEffect(() => {
    const next = value ? hexToHsla(value) : null
    if (!next) return
    // 灰色没有色相：保留当前色相，避免滑块跳回 0。
    if (next.s > 0) setHue(next.h)
    setSaturation(next.s)
    setLightness(next.l)
    setAlpha(next.a)
  }, [value])

  // Notify parent of changes
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  useEffect(() => {
    const rgb = hslToRgb(hue, saturation, lightness)
    onChangeRef.current?.([rgb[0], rgb[1], rgb[2], alpha / 100])
  }, [hue, saturation, lightness, alpha])

  return (
    <ColorPickerContext.Provider value={{ hue, saturation, lightness, alpha, mode, setHue, setSaturation, setLightness, setAlpha, setMode }}>
      <div className={cn('flex size-full flex-col gap-4', className)} {...props} />
    </ColorPickerContext.Provider>
  )
}

/* ---------- Selection ---------- */

export type ColorPickerSelectionProps = HTMLAttributes<HTMLDivElement>

/** 与上游相同的 x/y → 饱和度/亮度映射，这里反推出指示点位置。 */
function positionFrom(saturation: number, lightness: number) {
  const x = clamp(saturation / 100, 0, 1)
  const top = x < 0.01 ? 100 : 50 + 50 * (1 - x)
  return { x, y: clamp(top > 0 ? 1 - lightness / top : 1, 0, 1) }
}

export const ColorPickerSelection = memo(({ className, style, ...props }: ColorPickerSelectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { hue, saturation, lightness, setSaturation, setLightness } = useColorPicker()
  const { x: positionX, y: positionY } = positionFrom(saturation, lightness)

  const backgroundGradient = `linear-gradient(0deg, rgba(0,0,0,1), rgba(0,0,0,0)),
            linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,0)),
            hsl(${hue}, 100%, 50%)`

  const apply = useCallback(
    (x: number, y: number) => {
      setSaturation(x * 100)
      const topLightness = x < 0.01 ? 100 : 50 + 50 * (1 - x)
      setLightness(topLightness * (1 - y))
    },
    [setSaturation, setLightness],
  )

  const handlePointerMove = useCallback(
    (event: { clientX: number; clientY: number }) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      apply(clamp((event.clientX - rect.left) / rect.width, 0, 1), clamp((event.clientY - rect.top) / rect.height, 0, 1))
    },
    [apply],
  )

  useEffect(() => {
    if (!isDragging) return
    const handlePointerUp = () => setIsDragging(false)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [isDragging, handlePointerMove])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 0.1 : 0.01
    const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
    const move = moves[event.key]
    if (!move) return
    event.preventDefault()
    apply(clamp(positionX + move[0], 0, 1), clamp(positionY + move[1], 0, 1))
  }

  return (
    <div
      className={cn('relative size-full cursor-crosshair touch-none rounded outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background', className)}
      onPointerDown={(e) => {
        e.preventDefault()
        e.currentTarget.focus()
        setIsDragging(true)
        handlePointerMove(e)
      }}
      onKeyDown={onKeyDown}
      ref={containerRef}
      role="slider"
      tabIndex={0}
      aria-label="Saturation and brightness"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(saturation)}
      aria-valuetext={`Saturation ${Math.round(saturation)}%, lightness ${Math.round(lightness)}%`}
      style={{ background: backgroundGradient, ...style }}
      {...props}
    >
      <div
        className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
        style={{ left: `${positionX * 100}%`, top: `${positionY * 100}%`, boxShadow: '0 0 0 1px rgba(0,0,0,0.5)' }}
      />
    </div>
  )
})

ColorPickerSelection.displayName = 'ColorPickerSelection'

/* ---------- Slider（替代 radix Slider） ---------- */

type SliderProps = {
  value: number
  max: number
  onValueChange: (value: number) => void
  label: string
  valueText?: string
  className?: string
  trackClassName?: string
  trackStyle?: CSSProperties
  children?: ReactNode
}

function Slider({ value, max, onValueChange, label, valueText, className, trackClassName, trackStyle, children }: SliderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const fromPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = ref.current!.getBoundingClientRect()
    // 与 radix 一致：滑块圆心在两端各内缩半个滑块宽。
    onValueChange(Math.round(clamp((event.clientX - rect.left - 8) / (rect.width - 16), 0, 1) * max))
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const big = max / 10
    const map: Record<string, number> = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -big, PageUp: big }
    let next: number | null = null
    if (event.key in map) next = value + map[event.key] * (event.shiftKey && Math.abs(map[event.key]) === 1 ? 10 : 1)
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = max
    if (next === null) return
    event.preventDefault()
    onValueChange(clamp(Math.round(next), 0, max))
  }
  const pct = clamp(value / max, 0, 1)
  return (
    <div
      ref={ref}
      className={cn('relative flex h-4 w-full touch-none items-center', className)}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        fromPointer(e)
        ;(e.currentTarget.querySelector('[role=slider]') as HTMLElement | null)?.focus()
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e)
      }}
    >
      <div className={cn('relative my-0.5 h-3 w-full grow rounded-full', trackClassName)} style={trackStyle}>
        {children}
      </div>
      <div
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.round(value)}
        aria-valuetext={valueText}
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        className="absolute block h-4 w-4 -translate-x-1/2 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
        style={{ left: `calc(8px + (100% - 16px) * ${pct})` }}
      />
    </div>
  )
}

export type ColorPickerHueProps = { className?: string }

export const ColorPickerHue = ({ className }: ColorPickerHueProps) => {
  const { hue, setHue } = useColorPicker()
  return (
    <Slider
      className={className}
      max={360}
      label="Hue"
      valueText={`${Math.round(hue)}°`}
      onValueChange={setHue}
      value={hue}
      trackClassName="bg-[linear-gradient(90deg,#FF0000,#FFFF00,#00FF00,#00FFFF,#0000FF,#FF00FF,#FF0000)]"
    />
  )
}

export type ColorPickerAlphaProps = { className?: string }

const CHECKER: CSSProperties = {
  backgroundImage: 'repeating-conic-gradient(var(--muted) 0% 25%, transparent 0% 50%)',
  backgroundSize: '8px 8px',
  backgroundPosition: 'center',
}

export const ColorPickerAlpha = ({ className }: ColorPickerAlphaProps) => {
  const { alpha, setAlpha } = useColorPicker()
  return (
    <Slider className={className} max={100} label="Opacity" valueText={`${Math.round(alpha)}%`} onValueChange={setAlpha} value={alpha} trackStyle={CHECKER}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent to-foreground/50" />
    </Slider>
  )
}

/* ---------- Eye dropper ---------- */

type EyeDropperCtor = new () => { open: () => Promise<{ sRGBHex: string }> }

export type ColorPickerEyeDropperProps = { className?: string; style?: CSSProperties }

export const ColorPickerEyeDropper = ({ className, style }: ColorPickerEyeDropperProps) => {
  const { setHue, setSaturation, setLightness, setAlpha } = useColorPicker()
  const [supported, setSupported] = useState(true)
  useEffect(() => setSupported(typeof window !== 'undefined' && 'EyeDropper' in window), [])

  const handleEyeDropper = async () => {
    try {
      const EyeDropper: unknown = Reflect.get(window, 'EyeDropper')
      if (typeof EyeDropper !== 'function') return
      const result = await new (EyeDropper as EyeDropperCtor)().open()
      const color = hexToHsla(result.sRGBHex)
      if (!color) return
      setHue(color.h)
      setSaturation(color.s)
      setLightness(color.l)
      setAlpha(100)
    } catch {
      // 用户按 Esc 取消时会抛错，忽略即可。
    }
  }

  return (
    <button
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-input bg-background text-muted-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      style={style}
      onClick={handleEyeDropper}
      disabled={!supported}
      type="button"
      aria-label="Pick a color from the screen"
      title={supported ? 'Pick from screen' : 'Eyedropper is not supported in this browser'}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m2 22 1-1h3l9-9" />
        <path d="M3 21v-3l9-9" />
        <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z" />
      </svg>
    </button>
  )
}

/* ---------- Output（替代 shadcn Select） ---------- */

const formats = ['hex', 'rgb', 'css', 'hsl']

export const ColorPickerOutput = ({ className, style }: { className?: string; style?: CSSProperties }) => {
  const { mode, setMode } = useColorPicker()
  return (
    <div className={cn('relative h-8 w-20 shrink-0', className)}>
      <select
        aria-label="Color format"
        value={mode}
        onChange={(e) => setMode(e.target.value)}
        className="h-full w-full cursor-pointer appearance-none rounded-md border border-input bg-background pr-7 pl-3 text-xs shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        style={style}
      >
        {formats.map((format) => (
          <option key={format} value={format}>
            {format.toUpperCase()}
          </option>
        ))}
      </select>
      <svg className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  )
}

/* ---------- Format ---------- */

const inputBase =
  'h-8 w-full min-w-0 border border-input bg-secondary px-2 text-xs text-foreground tabular-nums shadow-none transition-colors outline-none focus-visible:relative focus-visible:z-10 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'

const PercentageInput = ({ value, className, style }: { value: number; className?: string; style?: CSSProperties }) => (
  <div className="relative shrink-0">
    <input readOnly type="text" aria-label="Opacity percent" value={Math.round(value)} className={cn(inputBase, 'w-[3.25rem] rounded-l-none', className)} style={style} />
    <span className="absolute top-1/2 right-2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
  </div>
)

export type ColorPickerFormatProps = HTMLAttributes<HTMLDivElement> & { showAlpha?: boolean; radius?: number }

export const ColorPickerFormat = ({ className, showAlpha = true, radius = 6, ...props }: ColorPickerFormatProps) => {
  const { hue, saturation, lightness, alpha, mode, setHue, setSaturation, setLightness } = useColorPicker()
  const hex = hslToHex(hue, saturation, lightness)
  const [draft, setDraft] = useState<string | null>(null)
  const left: CSSProperties = { borderTopLeftRadius: radius, borderBottomLeftRadius: radius }
  const right: CSSProperties = { borderTopRightRadius: radius, borderBottomRightRadius: radius }
  const both = { ...left, ...right }

  const commit = () => {
    if (draft === null) return
    const next = hexToHsla(draft)
    if (next) {
      if (next.s > 0) setHue(next.h)
      setSaturation(next.s)
      setLightness(next.l)
    }
    setDraft(null)
  }

  const percent = showAlpha ? <PercentageInput value={alpha} style={right} /> : null

  if (mode === 'hex') {
    return (
      <div className={cn('relative flex w-full items-center -space-x-px rounded-md shadow-sm', className)} style={both} {...props}>
        <input
          className={cn(inputBase, 'rounded-none font-mono uppercase')}
          style={showAlpha ? left : both}
          aria-label="Hex color"
          spellCheck={false}
          type="text"
          value={draft ?? hex}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') setDraft(null)
          }}
        />
        {percent}
      </div>
    )
  }

  if (mode === 'rgb' || mode === 'hsl') {
    const values = mode === 'rgb' ? hslToRgb(hue, saturation, lightness) : [hue, saturation, lightness]
    const labels = mode === 'rgb' ? ['Red', 'Green', 'Blue'] : ['Hue', 'Saturation', 'Lightness']
    return (
      <div className={cn('flex w-full items-center -space-x-px rounded-md shadow-sm', className)} style={both} {...props}>
        {values.map((value, index) => (
          <input
            className={cn(inputBase, 'rounded-none')}
            style={index === 0 ? (showAlpha || values.length > 1 ? left : both) : index === values.length - 1 && !showAlpha ? right : undefined}
            key={index}
            aria-label={labels[index]}
            readOnly
            type="text"
            value={Math.round(value)}
          />
        ))}
        {percent}
      </div>
    )
  }

  if (mode === 'css') {
    const rgb = hslToRgb(hue, saturation, lightness).map((value) => Math.round(value))
    return (
      <div className={cn('w-full rounded-md shadow-sm', className)} style={both} {...props}>
        <input className={cn(inputBase, 'w-full font-mono')} style={both} aria-label="CSS color" readOnly type="text" value={`rgba(${rgb.join(', ')}, ${Math.round(alpha)}%)`} />
      </div>
    )
  }

  return null
}

/* ---------- Swatches（Motif 追加） ---------- */

export const ColorPickerSwatches = ({ colors, radius = 6, className }: { colors: string[]; radius?: number; className?: string }) => {
  const { hue, saturation, lightness, setHue, setSaturation, setLightness, setAlpha } = useColorPicker()
  const current = hslToHex(hue, saturation, lightness)
  return (
    <div role="group" aria-label="Swatches" className={cn('flex flex-wrap gap-1.5', className)}>
      {colors.map((color) => {
        const selected = color.toUpperCase() === current
        return (
          <button
            key={color}
            type="button"
            aria-label={color.toUpperCase()}
            aria-pressed={selected}
            onClick={() => {
              const next = hexToHsla(color)
              if (!next) return
              if (next.s > 0) setHue(next.h)
              setSaturation(next.s)
              setLightness(next.l)
              setAlpha(100)
            }}
            className={cn(
              'size-6 shrink-0 shadow-[inset_0_0_0_1px_rgb(0_0_0/0.15)] transition-[box-shadow,transform] duration-150 hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none motion-reduce:hover:scale-100',
              selected && 'ring-2 ring-foreground ring-offset-2 ring-offset-background',
            )}
            style={{ background: color, borderRadius: Math.max(2, radius * 0.66) }}
          />
        )
      })}
    </div>
  )
}

/* ---------- 组装好的面板（上游 example 的布局） ---------- */

export type ColorPickerPanelProps = Partial<typeof defaults> & {
  value?: string
  onChange?: ColorPickerProps['onChange']
  className?: string
  style?: CSSProperties
}

export function ColorPickerPanel({ value, onChange, className, style, ...props }: ColorPickerPanelProps) {
  const { defaultColor, showAlpha, showEyedropper, format, swatches, radius, width } = { ...defaults, ...props }
  return (
    <ColorPicker
      value={value}
      defaultValue={defaultColor}
      defaultMode={format}
      onChange={onChange}
      className={cn('h-auto border bg-background p-4 shadow-sm', className)}
      style={{ width: `min(100%, ${width}px)`, borderRadius: radius + 4, ...style }}
    >
      <ColorPickerSelection className="h-40 w-full" style={{ borderRadius: Math.max(0, radius - 2) }} />
      <div className="flex items-center gap-4">
        {showEyedropper ? <ColorPickerEyeDropper style={{ borderRadius: radius }} /> : null}
        <div className="grid w-full gap-1">
          <ColorPickerHue />
          {showAlpha ? <ColorPickerAlpha /> : null}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ColorPickerOutput style={{ borderRadius: radius }} />
        <ColorPickerFormat showAlpha={showAlpha} radius={radius} />
      </div>
      {swatches.length > 0 ? <ColorPickerSwatches colors={swatches} radius={radius} /> : null}
    </ColorPicker>
  )
}
