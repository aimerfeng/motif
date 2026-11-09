// SPDX-License-Identifier: MIT
// Copyright (c) 2024 Guilherme Rodz
// Source: https://github.com/guilhermerodz/input-otp/blob/cf81845/apps/website/src/app/(docs)/_components/anatomy/isometric.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'

/* @motif:defaults */
export const defaults = {
  separation: 72,
  tilt: true,
  reveal: true,
  accent: '#f39c4a',
  plate: '#3dd2f5',
  showLabels: true,
}
/* @motif:end */

export type LayerId = 'container' | 'slots' | 'input'

export type IsometricLayerExplodeProps = Partial<typeof defaults> & {
  /** 受控覆盖（演示自动播放用）：传了就不跟随内部状态。 */
  forced?: { tilt?: boolean; focused?: LayerId | null; value?: string }
  className?: string
  style?: CSSProperties
}

/** 舞台格子的尺寸固定：揭开输入框时的字距按它计算。 */
const SLOT_W = 48
const SLOT_H = 56
const LENGTH = 6

const LAYERS: {
  id: LayerId
  z: number
  tone: 'cyan' | 'plain' | 'amber'
  title: string
  blurb: string
  code: string
}[] = [
  {
    id: 'container',
    z: 0,
    tone: 'cyan',
    title: 'The container',
    blurb:
      'Relatively positioned, pointer-events: none, user-select: none. Renders nothing; it exists to establish the coordinate space the other two live in.',
    code: `<div
  data-input-otp-container
  style="position: relative; pointer-events: none; user-select: none"
  class={containerClassName}
>`,
  },
  {
    id: 'slots',
    z: 1,
    tone: 'plain',
    title: 'Your slots',
    blurb:
      'Whatever your render function returns. Painted first, so anything above wins the hit test — which is fine, because they are decoration and should never receive a click.',
    code: `<div className="flex">
  {slots.map((slot, i) => <Slot key={i} {...slot} />)}
</div>`,
  },
  {
    id: 'input',
    z: 2,
    tone: 'amber',
    title: 'The real input',
    blurb:
      'Absolutely positioned across the whole container and painted last, so it takes every click. The only node in the field with pointer-events: all — which is why one tap anywhere lands the caret on the slot you aimed at.',
    code: `<div style="position: absolute; inset: 0; pointer-events: none">
  <input data-input-otp style="… pointer-events: all" />
</div>`,
  },
]

export function IsometricLayerExplode({ forced, className, style, ...props }: IsometricLayerExplodeProps) {
  const options = { ...defaults, ...props }
  const [tiltState, setTilt] = useState(options.tilt)
  const [explode, setExplode] = useState(options.separation)
  const [reveal, setReveal] = useState(options.reveal)
  const [focusedState, setFocused] = useState<LayerId | null>(null)
  const [valueState, setValue] = useState('482')
  const [inputFocused, setInputFocused] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)

  // 参数变化时同步到内部状态（控件仍可以在此基础上调）。
  useEffect(() => setTilt(options.tilt), [options.tilt])
  useEffect(() => setExplode(options.separation), [options.separation])
  useEffect(() => setReveal(options.reveal), [options.reveal])

  const tilt = forced?.tilt ?? tiltState
  const focused = forced && 'focused' in forced ? (forced.focused ?? null) : focusedState
  const value = forced?.value ?? valueState

  usePeelPitch(stageRef, reveal)

  const separation = tilt ? explode : 0
  const dim = (id: LayerId) => focused !== null && focused !== id
  const active = focused ? LAYERS.find((l) => l.id === focused) : null
  const activeIndex = inputFocused ? Math.min(value.length, LENGTH - 1) : -1

  return (
    <div
      className={cn('otp-stage w-full overflow-hidden rounded-xl border border-border/70 bg-background text-foreground', className)}
      ref={stageRef}
      style={{ ['--amber' as string]: options.accent, ['--cyan' as string]: options.plate, ...style }}
    >
      {/* ————— Controls ————— */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-border/70 bg-muted/20 px-4 py-3 sm:px-5">
        <Toggle checked={tilt} onChange={setTilt}>
          Isometric view
        </Toggle>

        <label className={cn('flex items-center gap-2 text-xs', tilt ? 'text-muted-foreground' : 'text-muted-foreground/40')}>
          Separation
          <input
            type="range"
            min={0}
            max={140}
            step={4}
            value={explode}
            disabled={!tilt}
            onChange={(e) => setExplode(Number(e.target.value))}
            className="h-1 w-28 accent-(--amber) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--amber)"
          />
          <span className="w-9 font-mono text-[0.6875rem] text-muted-foreground/70">{separation}px</span>
        </label>

        <Toggle checked={reveal} onChange={setReveal}>
          Reveal the input
        </Toggle>

        {focused && (
          <button
            type="button"
            onClick={() => setFocused(null)}
            className="ml-auto rounded-md border border-border/70 px-2 py-1 text-[0.6875rem] text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-(--amber)"
          >
            Show all layers
          </button>
        )}
      </div>

      {/* ————— Board ————— */}
      <div
        className={cn(
          'bg-dot-grid relative flex items-center justify-center overflow-hidden px-4 transition-[padding] duration-700 motion-reduce:transition-none',
          tilt ? 'py-24 sm:py-28' : 'py-16',
          reveal && 'otp-peel-color otp-peel-caret otp-peel-bg',
          reveal && 'otp-peel-selection otp-peel-tracking',
        )}
      >
        <div className="otp-iso-board relative" style={{ ['--tilt' as string]: tilt ? 1 : 0, ['--explode' as string]: separation } as CSSProperties}>
          {/* z 0 — the container's plate. */}
          <div aria-hidden className={cn('otp-stage-floor pointer-events-none absolute inset-0 transition-opacity duration-300', dim('container') && 'opacity-25')} />

          {/* 手写的最小 OTP 字段：结构与 input-otp 一致（容器 → 格子 → 盖在上面的透明 input）。 */}
          <div
            data-input-otp-container
            className="group flex items-center"
            style={{ position: 'relative', cursor: 'text', userSelect: 'none', pointerEvents: 'none', ['--root-height' as string]: `${SLOT_H}px` }}
          >
            {/* z 1 — the slot row, lifted to the middle plane. */}
            <div className={cn('otp-iso-slots flex', dim('slots') && 'opacity-25')}>
              {Array.from({ length: LENGTH }, (_, idx) => (
                <StageSlot key={idx} char={value[idx] ?? null} isActive={idx === activeIndex} hasFakeCaret={idx === activeIndex && value.length < LENGTH} index={idx} className="h-14 w-12" />
              ))}
            </div>

            {/* z 2 — the real input's wrapper. */}
            <div className="otp-iso-input" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              <input
                data-input-otp
                aria-label="Verification code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={LENGTH}
                value={value}
                onChange={(e) => setValue(e.target.value.replace(/\D/g, '').slice(0, LENGTH))}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                spellCheck={false}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  textAlign: 'left',
                  opacity: 1,
                  color: 'transparent',
                  pointerEvents: 'all',
                  background: 'transparent',
                  caretColor: 'transparent',
                  border: '0 solid transparent',
                  outline: '0 solid transparent',
                  boxShadow: 'none',
                  lineHeight: 1,
                  letterSpacing: '-.5em',
                  fontSize: 'var(--root-height)',
                  fontFamily: 'monospace',
                  fontVariantNumeric: 'tabular-nums',
                }}
              />
            </div>
          </div>

          {/* z 2 — the input's plane, outlined so it reads as a sheet even when the value is short. */}
          <div
            aria-hidden
            className={cn(
              'otp-iso-plane-outline pointer-events-none absolute rounded-sm border border-dashed border-(--amber)/50 bg-(--amber)/5 transition-opacity duration-300',
              dim('input') && 'opacity-20',
            )}
            style={{ inset: 0, width: SLOT_W * LENGTH, height: SLOT_H, opacity: tilt || reveal ? undefined : 0 }}
          />

          {/* The input plane's shadow on the floor. */}
          {tilt && separation > 8 && (
            <div aria-hidden className="pointer-events-none absolute rounded-sm border border-dashed border-(--amber)/20" style={{ inset: 0, width: SLOT_W * LENGTH, height: SLOT_H }} />
          )}
        </div>
      </div>

      {/* ————— Layers ————— */}
      {options.showLabels && (
        <div className="border-t border-border/70 px-4 py-4 sm:px-5">
          <p className="mb-2.5 text-[0.6875rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase">Paint order — bottom to top</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {LAYERS.map((layer) => (
              <LayerChip
                key={layer.id}
                tone={layer.tone}
                z={layer.z}
                title={layer.title}
                active={focused === null || focused === layer.id}
                onClick={() => setFocused(focused === layer.id ? null : layer.id)}
              >
                {focused === null ? layer.blurb.split('.')[0] + '.' : null}
              </LayerChip>
            ))}
          </div>

          {active && (
            <div className="mt-3.5">
              <p className="max-w-2xl text-[0.875rem] leading-6 text-muted-foreground">{active.blurb}</p>
              <pre className="mt-2.5 overflow-x-auto font-mono text-[0.6875rem] leading-5 text-[color-mix(in_oklab,var(--amber)_45%,var(--color-foreground))]">{active.code}</pre>
            </div>
          )}

          {!active && (
            <p className="mt-3 text-[0.8125rem] leading-6 text-muted-foreground">
              Pick a layer to isolate it. The field stays live in every view — click into the tilted board and type.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function StageSlot({ char, isActive, hasFakeCaret, className }: { char: string | null; isActive: boolean; hasFakeCaret: boolean; index: number; className?: string }) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        'border-y border-r border-foreground/20 bg-foreground/[0.02]',
        'first:rounded-l-md first:border-l last:rounded-r-md',
        'text-[1.375rem] font-medium text-foreground tabular-nums',
        'outline-0 outline-offset-0 outline-foreground/80 outline-solid',
        'transition-[outline-width,opacity] duration-200',
        isActive && 'z-10 outline-2',
        className,
      )}
    >
      <span style={{ width: SLOT_W, height: SLOT_H }} className="absolute" />
      <span className="relative">{char}</span>

      {hasFakeCaret && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="h-7 w-px bg-foreground motion-safe:animate-caret-blink" />
        </span>
      )}
    </div>
  )
}

/** 三个层的彩色图例 / 标签。 */
function LayerChip({
  tone,
  z,
  title,
  active,
  onClick,
  children,
}: {
  tone: 'cyan' | 'amber' | 'plain'
  z: number
  title: string
  active?: boolean
  onClick?: () => void
  children?: ReactNode
}) {
  const tones = {
    cyan: 'border-(--cyan)/40 bg-(--cyan)/[0.07]',
    amber: 'border-(--amber)/40 bg-(--amber)/[0.07]',
    plain: 'border-border/70 bg-foreground/[0.03]',
  }
  const swatches = {
    cyan: 'border-(--cyan)/70',
    amber: 'border-(--amber)/70',
    plain: 'border-foreground/40',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'w-full rounded-lg border px-3 py-2.5 text-left text-foreground/80 transition-[opacity,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--amber)',
        tones[tone],
        active ? 'ring-1 ring-foreground/25 ring-inset' : 'opacity-60 hover:opacity-100',
        !onClick && 'cursor-default',
      )}
    >
      <span className="flex items-center gap-2">
        <span aria-hidden className={cn('h-2.5 w-5 shrink-0 rounded-sm border border-dashed', swatches[tone])} />
        <span className="font-mono text-[0.625rem] text-muted-foreground">z {z}</span>
        <span className="text-[0.8125rem] font-medium text-foreground">{title}</span>
      </span>
      {children && <span className="mt-1 block text-[0.75rem] leading-5 text-muted-foreground">{children}</span>}
    </button>
  )
}

function Toggle({ checked, onChange, disabled, children }: { checked: boolean; onChange: (next: boolean) => void; disabled?: boolean; children: ReactNode }) {
  return (
    <label className={cn('flex items-center gap-2 text-xs', disabled ? 'cursor-not-allowed text-muted-foreground/50' : 'cursor-pointer text-muted-foreground hover:text-foreground')}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 accent-(--amber) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--amber)"
      />
      {children}
    </label>
  )
}

/**
 * 量出输入框真实的字符步进，写入让每个字符正好落在一个格子上的字距。
 * 按浏览器实际解析到的 monospace 字体测量，而不是按 em 猜。
 */
function usePeelPitch(stageRef: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const stage = stageRef.current
    if (!stage || !enabled) return

    const input = stage.querySelector<HTMLInputElement>('[data-input-otp]')
    if (!input) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { fontFamily } = getComputedStyle(input)
    ctx.font = `22px ${fontFamily}`
    const advance = ctx.measureText('0').width
    if (!advance) return

    stage.style.setProperty('--peel-spacing', `${SLOT_W - advance}px`)
    stage.style.setProperty('--peel-indent', `${(SLOT_W - advance) / 2}px`)
  }, [stageRef, enabled])
}
