'use client'

import { SPRING_RANGE, type JsonValue, type ParamSpec } from '@motif/schema/core'
import { useId, useState, type CSSProperties, type ReactNode } from 'react'
import { EasingEditor } from './easing-editor'
import { SpringPlot } from './spring-plot'

type Spec<T extends ParamSpec['type']> = Extract<ParamSpec, { type: T }>

export interface ControlProps<T extends ParamSpec['type']> {
  param: Spec<T>
  label: string
  hint?: string | undefined
  value: JsonValue
  changed: boolean
  onChange: (value: JsonValue) => void
  onReset: () => void
}

function decimals(step: number): number {
  const text = String(step)
  return text.includes('.') ? text.split('.')[1]!.length : 0
}

function formatNumber(value: number, step: number): string {
  return value.toFixed(Math.min(decimals(step), 3))
}

/** 标签行：双击标签把这个参数恢复默认；改动过的参数前面有一个小圆点。 */
function Label({ id, label, hint, changed, onReset, children }: { id: string; label: string; hint?: string | undefined; changed: boolean; onReset: () => void; children?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <label htmlFor={id} onDoubleClick={onReset} title={hint} className="flex items-center gap-1.5 text-[12.5px] text-ink-muted select-none">
        <span aria-hidden className={`size-1.5 rounded-full transition-colors duration-150 ${changed ? 'bg-focus' : 'bg-transparent'}`} />
        {label}
      </label>
      {children}
    </div>
  )
}

export function NumberControl({ param, label, hint, value, changed, onChange, onReset }: ControlProps<'number'>) {
  const id = useId()
  const number = typeof value === 'number' ? value : param.default
  const span = param.max - param.min || 1
  const pct = ((number - param.min) / span) * 100
  const style = {
    '--fill': `${pct}%`,
    '--safe-start': param.safe ? `${((param.safe[0] - param.min) / span) * 100}%` : '0%',
    '--safe-end': param.safe ? `${((param.safe[1] - param.min) / span) * 100}%` : '100%',
  } as CSSProperties
  const outside = param.safe && (number < param.safe[0] || number > param.safe[1])
  return (
    <div className="space-y-1.5">
      <Label id={id} label={label} hint={hint} changed={changed} onReset={onReset}>
        <output htmlFor={id} className={`font-mono text-[12px] tabular-nums ${outside ? 'text-[oklch(0.8_0.12_70)]' : 'text-ink'}`}>
          {formatNumber(number, param.step)}
          {param.unit && param.unit !== 'x' ? <span className="text-ink-faint">{param.unit === 'deg' ? '°' : ` ${param.unit}`}</span> : null}
          {param.unit === 'x' ? <span className="text-ink-faint">×</span> : null}
        </output>
      </Label>
      <input
        id={id}
        type="range"
        min={param.min}
        max={param.max}
        step={param.step}
        value={number}
        onChange={(event) => onChange(Number(event.target.value))}
        className="motif-range"
        data-safe={param.safe ? '' : undefined}
        style={style}
      />
    </div>
  )
}

function HexInput({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) {
  const [draft, setDraft] = useState<string | null>(null)
  return (
    <input
      aria-label={label}
      value={draft ?? value}
      spellCheck={false}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => {
        if (draft !== null) {
          const normalized = draft.trim().startsWith('#') ? draft.trim() : `#${draft.trim()}`
          if (/^#[0-9a-f]{6}$/i.test(normalized)) onChange(normalized.toLowerCase())
        }
        setDraft(null)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') event.currentTarget.blur()
      }}
      className="h-7 w-[84px] rounded-md border border-line bg-sunken px-2 font-mono text-[12px] uppercase focus:border-line-strong focus:outline-none"
    />
  )
}

function Swatch({ color, onChange, label }: { color: string; onChange: (value: string) => void; label: string }) {
  return (
    <label className="relative block size-7 shrink-0 cursor-pointer overflow-hidden rounded-md border border-line-strong shadow-[inset_0_0_0_1px_oklch(0_0_0/0.25)]" style={{ background: color }}>
      <span className="sr-only">{label}</span>
      <input type="color" value={color.slice(0, 7)} onChange={(event) => onChange(event.target.value)} className="absolute inset-0 size-full cursor-pointer opacity-0" />
    </label>
  )
}

export function ColorControl({ param, label, hint, value, changed, onChange, onReset }: ControlProps<'color'>) {
  const id = useId()
  const color = typeof value === 'string' ? value : param.default
  return (
    <div className="space-y-1.5">
      <Label id={id} label={label} hint={hint} changed={changed} onReset={onReset} />
      <div className="flex items-center gap-2" id={id}>
        <Swatch color={color} onChange={onChange} label={label} />
        <HexInput value={color} onChange={onChange} label={label} />
      </div>
    </div>
  )
}

export function PaletteControl({ param, label, hint, value, changed, onChange, onReset, addLabel, removeLabel }: ControlProps<'palette'> & { addLabel: string; removeLabel: string }) {
  const id = useId()
  const colors = Array.isArray(value) ? (value as string[]) : param.default
  const update = (index: number, color: string) => onChange(colors.map((c, i) => (i === index ? color : c)))
  return (
    <div className="space-y-1.5">
      <Label id={id} label={label} hint={hint} changed={changed} onReset={onReset} />
      <div className="flex flex-wrap items-center gap-1.5" id={id}>
        {colors.map((color, index) => (
          <Swatch key={index} color={color} onChange={(next) => update(index, next)} label={`${label} ${index + 1}`} />
        ))}
        <button
          type="button"
          aria-label={removeLabel}
          disabled={colors.length <= param.minItems}
          onClick={() => onChange(colors.slice(0, -1))}
          className="grid size-7 place-items-center rounded-md border border-line text-ink-muted transition-colors duration-150 hover:text-ink disabled:opacity-30"
        >
          −
        </button>
        <button
          type="button"
          aria-label={addLabel}
          disabled={colors.length >= param.maxItems}
          onClick={() => onChange([...colors, colors.at(-1) ?? '#ffffff'])}
          className="grid size-7 place-items-center rounded-md border border-line text-ink-muted transition-colors duration-150 hover:text-ink disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  )
}

/** 中文按两个字宽、其他字符按一个字宽粗算文字宽度，用来判断分段按钮放不放得下。 */
function textUnits(text: string): number {
  let units = 0
  for (const char of text) units += char.codePointAt(0)! > 0x2e80 ? 2 : 1
  return units
}

// 面板宽 320px：两段时每段约放得下 22 个字宽，三段 14 个，四段 11 个。
const SEGMENT_BUDGET = 44

export function SelectControl({ param, label, hint, value, changed, onChange, onReset, optionLabel }: ControlProps<'select'> & { optionLabel: (value: string) => string }) {
  const id = useId()
  const current = typeof value === 'string' ? value : param.default
  const count = param.options.length
  const fitsSegments = count <= 4 && param.options.every((option) => textUnits(optionLabel(option.value)) <= Math.floor(SEGMENT_BUDGET / count))
  // 选项名字长（比如字体搭配）时竖排成列表，不截断成看不懂的「Archivo …」。
  if (!fitsSegments && count <= 8) {
    return (
      <div className="space-y-1.5">
        <Label id={id} label={label} hint={hint} changed={changed} onReset={onReset} />
        <div role="radiogroup" id={id} aria-label={label} className="overflow-hidden rounded-lg border border-line bg-sunken text-[12.5px]">
          {param.options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={option.value === current}
              onClick={() => onChange(option.value)}
              className="flex w-full items-center gap-2.5 border-b border-line px-2.5 py-2 text-left text-ink-muted transition-colors duration-150 last:border-b-0 hover:text-ink aria-checked:bg-white/[0.06] aria-checked:text-ink"
            >
              <span aria-hidden className={`size-1.5 shrink-0 rounded-full ${option.value === current ? 'bg-ink' : 'bg-white/15'}`} />
              <span className="min-w-0">{optionLabel(option.value)}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }
  if (fitsSegments) {
    return (
      <div className="space-y-1.5">
        <Label id={id} label={label} hint={hint} changed={changed} onReset={onReset} />
        <div role="radiogroup" id={id} aria-label={label} className="grid rounded-lg border border-line bg-sunken p-0.5 text-[12px]" style={{ gridTemplateColumns: `repeat(${param.options.length}, minmax(0, 1fr))` }}>
          {param.options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={option.value === current}
              onClick={() => onChange(option.value)}
              className="truncate rounded-md px-2 py-1 text-ink-muted transition-colors duration-150 hover:text-ink aria-checked:bg-white/10 aria-checked:text-ink"
            >
              {optionLabel(option.value)}
            </button>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-1.5">
      <Label id={id} label={label} hint={hint} changed={changed} onReset={onReset} />
      <select
        id={id}
        value={current}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-full rounded-lg border border-line bg-sunken px-2 text-[12.5px] focus:border-line-strong focus:outline-none"
      >
        {param.options.map((option) => (
          <option key={option.value} value={option.value}>
            {optionLabel(option.value)}
          </option>
        ))}
      </select>
    </div>
  )
}

export function BooleanControl({ param, label, hint, value, changed, onChange, onReset }: ControlProps<'boolean'>) {
  const id = useId()
  const on = typeof value === 'boolean' ? value : param.default
  return (
    <Label id={id} label={label} hint={hint} changed={changed} onReset={onReset}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
        className="relative h-5 w-9 rounded-full bg-white/12 transition-colors duration-200 aria-checked:bg-ink"
      >
        <span className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-canvas shadow transition-transform duration-200 ease-(--ease-out-soft) ${on ? 'translate-x-4' : 'bg-ink-muted'}`} />
      </button>
    </Label>
  )
}

export function TextControl({ param, label, hint, value, changed, onChange, onReset }: ControlProps<'text'>) {
  const id = useId()
  return (
    <div className="space-y-1.5">
      <Label id={id} label={label} hint={hint} changed={changed} onReset={onReset} />
      <input
        id={id}
        value={typeof value === 'string' ? value : param.default}
        maxLength={param.maxLength}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-full rounded-lg border border-line bg-sunken px-2.5 text-[13px] focus:border-line-strong focus:outline-none"
      />
    </div>
  )
}

export function EasingControl({ param, label, hint, value, changed, onChange, onReset }: ControlProps<'easing'>) {
  const id = useId()
  const curve = (Array.isArray(value) && value.length === 4 ? value : param.default) as [number, number, number, number]
  return (
    <div className="space-y-1.5">
      <Label id={id} label={label} hint={hint} changed={changed} onReset={onReset}>
        <output className="font-mono text-[11px] text-ink-muted tabular-nums">{curve.map((n) => Number(n.toFixed(2))).join(', ')}</output>
      </Label>
      <EasingEditor id={id} value={curve} onChange={onChange} label={label} />
    </div>
  )
}

export function SpringControl({ param, label, hint, value, changed, onChange, onReset, durationLabel, bounceLabel }: ControlProps<'spring'> & { durationLabel: string; bounceLabel: string }) {
  const id = useId()
  const spring = (value !== null && typeof value === 'object' && !Array.isArray(value) ? value : param.default) as { visualDuration: number; bounce: number }
  return (
    <div className="space-y-2">
      <Label id={id} label={label} hint={hint} changed={changed} onReset={onReset} />
      <SpringPlot visualDuration={spring.visualDuration} bounce={spring.bounce} />
      <NumberControl
        param={{ key: `${param.key}-duration`, type: 'number', label: param.label, default: param.default.visualDuration, ...SPRING_RANGE.visualDuration, unit: 's' }}
        label={durationLabel}
        value={spring.visualDuration}
        changed={false}
        onChange={(next) => onChange({ ...spring, visualDuration: next as number })}
        onReset={onReset}
      />
      <NumberControl
        param={{ key: `${param.key}-bounce`, type: 'number', label: param.label, default: param.default.bounce, ...SPRING_RANGE.bounce }}
        label={bounceLabel}
        value={spring.bounce}
        changed={false}
        onChange={(next) => onChange({ ...spring, bounce: next as number })}
        onReset={onReset}
      />
    </div>
  )
}

export function Vec2Control({ param, label, hint, value, changed, onChange, onReset }: ControlProps<'vec2'>) {
  const id = useId()
  const pair = (Array.isArray(value) && value.length === 2 ? value : param.default) as [number, number]
  const axis = (index: 0 | 1, name: string) => (
    <NumberControl
      param={{ key: `${param.key}-${name}`, type: 'number', label: param.label, default: param.default[index], min: param.min, max: param.max, step: param.step }}
      label={name}
      value={pair[index]}
      changed={false}
      onChange={(next) => onChange(index === 0 ? [next as number, pair[1]] : [pair[0], next as number])}
      onReset={onReset}
    />
  )
  return (
    <div className="space-y-2">
      <Label id={id} label={label} hint={hint} changed={changed} onReset={onReset} />
      {axis(0, 'x')}
      {axis(1, 'y')}
    </div>
  )
}

export function SeedControl({ param, label, hint, value, changed, onChange, onReset, shuffleLabel }: ControlProps<'seed'> & { shuffleLabel: string }) {
  const id = useId()
  const seed = typeof value === 'number' ? value : param.default
  return (
    <Label id={id} label={label} hint={hint} changed={changed} onReset={onReset}>
      <span className="flex items-center gap-2">
        <output id={id} className="font-mono text-[12px] tabular-nums">
          {seed}
        </output>
        <button
          type="button"
          aria-label={shuffleLabel}
          title={shuffleLabel}
          onClick={() => onChange(Math.floor(Math.random() * 100_000))}
          className="grid size-7 place-items-center rounded-md border border-line text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink"
        >
          <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <rect x="3.5" y="3.5" width="13" height="13" rx="3" />
            <circle cx="7.5" cy="7.5" r="1" fill="currentColor" />
            <circle cx="12.5" cy="12.5" r="1" fill="currentColor" />
            <circle cx="12.5" cy="7.5" r="1" fill="currentColor" />
            <circle cx="7.5" cy="12.5" r="1" fill="currentColor" />
          </svg>
        </button>
      </span>
    </Label>
  )
}
