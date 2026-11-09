// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Tremor Labs, Inc.
// Source: https://github.com/tremorlabs/tremor-blocks/blob/b319e8d/src/content/components/billing-usage/billing-usage-09.tsx
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode, type SVGProps } from 'react'

/* @motif:defaults */
export const defaults = {
  accent: '#3b82f6',
  variant: 'cluster',
  storageRange: 128,
  unitPrice: 0.023,
  showEstimate: true,
  radius: 6,
  tone: 'plain',
}
/* @motif:end */

export type Provider = 'nimbus' | 'stratus' | 'kelvin' | 'harbor'

export type ConfigResourceFormProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 受控值（演示自动播放用）；不传时用内部状态。 */
  provider?: Provider
  onProviderChange?: (p: Provider) => void
  storage?: number
  onStorageChange?: (gb: number) => void
  plan?: string
  onPlanChange?: (plan: string) => void
}

// 按亮度选主色上的文字颜色
function inkFor(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!m) return '#ffffff'
  const n = parseInt(m[1], 16)
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const l = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
  return l > 0.36 ? '#0b0b0f' : '#ffffff'
}

type Region = { value: string; label: string; multiplier: number }

const regionOptions: Record<Provider, Region[]> = {
  nimbus: [
    { value: 'us-east-2', label: 'Ohio (us-east-2)', multiplier: 1.0 },
    { value: 'us-east-1', label: 'N. Virginia (us-east-1)', multiplier: 1.1 },
    { value: 'us-west-2', label: 'Oregon (us-west-2)', multiplier: 1.0 },
    { value: 'eu-central-1', label: 'Frankfurt (eu-central-1)', multiplier: 1.2 },
    { value: 'eu-west-1', label: 'Ireland (eu-west-1)', multiplier: 1.2 },
    { value: 'eu-west-2', label: 'London (eu-west-2)', multiplier: 1.3 },
    { value: 'ap-northeast-1', label: 'Tokyo (ap-northeast-1)', multiplier: 1.4 },
    { value: 'ap-south-1', label: 'Mumbai (ap-south-1)', multiplier: 0.9 },
    { value: 'ap-southeast-1', label: 'Singapore (ap-southeast-1)', multiplier: 1.3 },
    { value: 'ap-southeast-2', label: 'Sydney (ap-southeast-2)', multiplier: 1.3 },
    { value: 'ca-central-1', label: 'Montreal (ca-central-1)', multiplier: 1.1 },
  ],
  stratus: [
    { value: 'east-us', label: 'East US (eastus)', multiplier: 1.0 },
    { value: 'east-us-2', label: 'East US 2 (eastus2)', multiplier: 1.1 },
    { value: 'south-central-us', label: 'South Central US (south-central-us)', multiplier: 1.2 },
    { value: 'westus2', label: 'West US 2 (westus2)', multiplier: 1.0 },
    { value: 'germany-west-central', label: 'Germany West Central (germany-west-central)', multiplier: 1.3 },
    { value: 'switzerland-north', label: 'Switzerland North (switzerland-north)', multiplier: 1.4 },
  ],
  kelvin: [
    { value: 'us-south-1', label: 'Texas (us-south-1)', multiplier: 1.1 },
    { value: 'us-central-1', label: 'Chicago (us-central-1)', multiplier: 1.0 },
    { value: 'us-west-3', label: 'San Diego (us-west-3)', multiplier: 1.2 },
    { value: 'eu-north-1', label: 'Stockholm (eu-north-1)', multiplier: 1.3 },
    { value: 'eu-east-1', label: 'Warsaw (eu-east-1)', multiplier: 1.4 },
    { value: 'ap-west-1', label: 'Karachi (ap-west-1)', multiplier: 0.8 },
    { value: 'ap-east-1', label: 'Hong Kong (ap-east-1)', multiplier: 1.5 },
    { value: 'af-south-1', label: 'Cape Town (af-south-1)', multiplier: 0.9 },
    { value: 'sa-east-1', label: 'São Paulo (sa-east-1)', multiplier: 1.2 },
  ],
  harbor: [
    { value: 'us-east-3', label: 'Miami (us-east-3)', multiplier: 1.2 },
    { value: 'us-west-4', label: 'Las Vegas (us-west-4)', multiplier: 1.1 },
    { value: 'ca-central-1', label: 'Toronto (ca-central-1)', multiplier: 1.0 },
    { value: 'eu-west-3', label: 'Madrid (eu-west-3)', multiplier: 1.3 },
    { value: 'ap-south-east-2', label: 'Sydney (ap-south-east-2)', multiplier: 1.5 },
  ],
}

// 上游的 basePrices 比例（0.023 / 0.025 / 0.045 / 0.074），按 unitPrice 缩放
const priceRatio: Record<Provider, number> = { nimbus: 1, stratus: 0.025 / 0.023, kelvin: 0.045 / 0.023, harbor: 0.074 / 0.023 }

// 虚构的云服务商标志（替代上游的真实品牌 SVG）
const Nimbus = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path fill="#38bdf8" d="M7 18a5 5 0 0 1-.6-9.96A6 6 0 0 1 17.8 9.1 4.5 4.5 0 0 1 17.5 18H7Z" />
    <path fill="#fff" d="M9 14h7v1.6H9z" opacity=".85" />
  </svg>
)
const Stratus = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path fill="#6366f1" d="M3 6h18l-3 4H3z" />
    <path fill="#818cf8" d="M3 11h15l-3 4H3z" />
    <path fill="#a5b4fc" d="M3 16h12l-3 4H3z" />
  </svg>
)
const Kelvin = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...props}>
    <circle cx="12" cy="12" r="9" fill="#f97316" />
    <path fill="#fde68a" d="M13.5 4.5 8 13h3.5l-1 6.5L16 11h-3.5z" />
  </svg>
)
const Harbor = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path fill="#14b8a6" d="M12 2 21 7v10l-9 5-9-5V7z" />
    <path fill="#ccfbf1" d="M12 7v10M8 12h8" stroke="#ccfbf1" strokeWidth="2" strokeLinecap="round" />
  </svg>
)
const cloudProviderIcons: Record<Provider, (p: SVGProps<SVGSVGElement>) => ReactNode> = { nimbus: Nimbus, stratus: Stratus, kelvin: Kelvin, harbor: Harbor }

const plans = [
  { name: 'Hobby', features: ['1,000 requests per day', '3 environments', 'Up to 10 user seats', 'Community support'], price: 40, isRecommended: false },
  { name: 'Premium', features: ['100,000 requests per day', '10 environments', 'Up to 50 user seats', 'Priority chat support'], price: 80, isRecommended: true },
  { name: 'Enterprise', features: ['Unlimited requests per day', 'Unlimited environments and user seats', 'SAML Single-Sign-On (SSO)', '99.99% SLA'], price: 160, isRecommended: false },
]

const highlights = ['Runs on audited open-source tooling', 'Data stays in the region you pick', 'Switch plans any time, prorated daily']

// ---------- 替代 Tremor 的基础组件 ----------

const focusRing = 'outline-none focus-visible:ring-2 focus-visible:ring-[var(--acc)] focus-visible:ring-offset-2 focus-visible:ring-offset-background'
const inputCls =
  'block w-full rounded-[var(--r)] border bg-background px-2.5 py-2 text-sm text-foreground shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-[var(--acc)] focus:ring-2 focus:ring-[color-mix(in_oklab,var(--acc)_30%,transparent)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
const btnSecondary = cn('inline-flex items-center justify-center whitespace-nowrap rounded-[var(--r)] border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-xs transition-colors hover:bg-muted', focusRing)
const btnGhost = cn('inline-flex items-center justify-center whitespace-nowrap rounded-[var(--r)] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted', focusRing)
const btnPrimary = cn('inline-flex items-center justify-center whitespace-nowrap rounded-[var(--r)] bg-[var(--acc)] px-3 py-2 text-sm font-medium text-[var(--acc-ink)] shadow-xs transition-[filter] hover:brightness-110', focusRing)

function Label({ htmlFor, id, className, children }: { htmlFor?: string; id?: string; className?: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} id={id} className={cn('text-sm font-medium text-foreground', className)}>
      {children}
    </label>
  )
}

// 替代 radix Select：原生 select 加自绘箭头
function Select({ id, value, onChange, children, className }: { id: string; value: string; onChange: (v: string) => void; children: ReactNode; className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, 'cursor-pointer appearance-none truncate pr-9')}>
        {children}
      </select>
      <svg viewBox="0 0 24 24" className="pointer-events-none absolute inset-y-0 right-2.5 my-auto size-4 text-muted-foreground" fill="currentColor" aria-hidden>
        <path d="M12 16 6 10h12z" />
      </svg>
    </div>
  )
}

// 替代 radix RadioGroup（卡片与圆点共用）：方向键切换，roving tabindex
function useRadioKeys<T extends string>(values: readonly T[], value: T, onChange: (v: T) => void) {
  return (e: KeyboardEvent<HTMLElement>) => {
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!dir) return
    e.preventDefault()
    const i = values.indexOf(value)
    const next = values[(i + dir + values.length) % values.length]
    onChange(next)
    e.currentTarget.querySelectorAll<HTMLElement>('[role=radio]')[values.indexOf(next)]?.focus()
  }
}

// 单选项上按空格 / 回车选中
function activate(e: KeyboardEvent<HTMLElement>, select: () => void) {
  if (e.key !== " " && e.key !== "Enter") return
  e.preventDefault()
  select()
}

function RadioCardIndicator({ checked, className }: { checked: boolean; className?: string }) {
  const reduced = useReducedMotion()
  return (
    <span
      aria-hidden
      className={cn(
        'relative flex size-4 shrink-0 items-center justify-center rounded-full border shadow-sm transition-colors',
        checked ? 'border-transparent bg-[var(--acc)]' : 'border-border bg-background',
        className,
      )}
    >
      <AnimatePresence initial={false}>
        {checked && (
          <motion.span
            className="size-1.5 shrink-0 rounded-full bg-[var(--acc-ink)]"
            initial={reduced ? { opacity: 0 } : { scale: 0 }}
            animate={reduced ? { opacity: 1 } : { scale: 1 }}
            exit={reduced ? { opacity: 0 } : { scale: 0 }}
            transition={{ type: 'spring', visualDuration: 0.2, bounce: 0.3 }}
          />
        )}
      </AnimatePresence>
    </span>
  )
}

function radioCardCls(checked: boolean) {
  return cn(
    'group relative w-full cursor-pointer rounded-[var(--r)] border bg-background p-4 text-left shadow-sm transition-[border-color,box-shadow]',
    checked ? 'border-[var(--acc)] ring-1 ring-[var(--acc)]' : 'border-border hover:border-muted-foreground/40',
    focusRing,
  )
}

// 替代 radix Slider：role=slider，指针拖动 + 键盘
function Slider({ value, onChange, min = 0, max, step = 1, labelledBy, valueText }: { value: number; onChange: (v: number) => void; min?: number; max: number; step?: number; labelledBy: string; valueText: string }) {
  const track = useRef<HTMLDivElement>(null)
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step))
  const fromPointer = (x: number) => {
    const r = track.current?.getBoundingClientRect()
    if (!r || r.width === 0) return
    onChange(clamp(min + ((x - r.left) / r.width) * (max - min)))
  }
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    fromPointer(e.clientX)
    ;(e.currentTarget.querySelector('[role=slider]') as HTMLElement | null)?.focus()
  }
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const big = Math.max(step, Math.round((max - min) / 10))
    const map: Record<string, number> = { ArrowRight: value + step, ArrowUp: value + step, ArrowLeft: value - step, ArrowDown: value - step, PageUp: value + big, PageDown: value - big, Home: min, End: max }
    if (!(e.key in map)) return
    e.preventDefault()
    onChange(clamp(map[e.key]))
  }
  return (
    <div
      className="relative flex h-5 w-full cursor-pointer touch-none select-none items-center"
      onPointerDown={onPointerDown}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e.clientX)
      }}
    >
      <div ref={track} className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted">
        <div className="absolute inset-y-0 left-0 h-full w-full origin-left rounded-full bg-[var(--acc)]" style={{ transform: `scaleX(${pct / 100})` }} />
      </div>
      <div
        role="slider"
        tabIndex={0}
        aria-labelledby={labelledBy}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={valueText}
        onKeyDown={onKeyDown}
        className={cn('absolute top-1/2 block size-[17px] shrink-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-muted-foreground/50 bg-white shadow transition-shadow outline-none focus-visible:ring-2 focus-visible:ring-[var(--acc)] focus-visible:ring-offset-2 focus-visible:ring-offset-background')}
        style={{ left: `${pct}%` }}
      />
    </div>
  )
}

// 带单位的数字输入（billing-usage-10 的 GB 输入框）
function UnitInput({ id, value, onChange, min, max, unit, label, className }: { id?: string; value: number; onChange: (v: number) => void; min: number; max: number; unit: string; label: string; className?: string }) {
  return (
    <div className={cn('relative shrink-0', className)}>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        className={cn(inputCls, 'pr-9 tabular-nums')}
        value={value}
        min={min}
        max={max}
        aria-label={label}
        onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0)))}
      />
      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-sm text-muted-foreground" aria-hidden>
        {unit}
      </span>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-muted-foreground" fill="currentColor" aria-hidden>
      <path d="m10 15.17 9.19-9.2 1.42 1.42L10 18 3.64 11.64l1.41-1.41z" />
    </svg>
  )
}
function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-[var(--acc)]" fill="currentColor" aria-hidden>
      <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Zm-1-6 7.07-7.07-1.41-1.41L11 13.17 8.17 10.34l-1.41 1.41L11 16Z" />
    </svg>
  )
}
function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6Zm11-3v8h-2V6.41l-7.79 7.8-1.42-1.42L17.59 5H13V3h8Z" />
    </svg>
  )
}

function Estimate({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 rounded-[var(--r)] border bg-card p-5 text-card-foreground shadow-xs">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-medium tabular-nums text-foreground" aria-live="polite">
        {value}
      </p>
    </div>
  )
}

// ---------- 主组件 ----------

/** 创建资源表单：billing-usage-09 的计算集群，或 form-layout-06 的工作区（移植自 Tremor Blocks）。 */
export function ConfigResourceForm({ className, style, provider, onProviderChange, storage, onStorageChange, plan, onPlanChange, ...props }: ConfigResourceFormProps) {
  const { accent, variant, storageRange, unitPrice, showEstimate, radius, tone } = { ...defaults, ...props }
  const uid = useId()
  const maxStorage = Math.max(8, Math.round(storageRange))

  const [innerProvider, setInnerProvider] = useState<Provider>('nimbus')
  const cloudProvider = provider ?? innerProvider
  const [region, setRegion] = useState(regionOptions.nimbus[0].value)
  const setCloudProvider = (p: Provider) => {
    setInnerProvider(p)
    // 上游在 useEffect 里重置地区；这里在切换时直接重置
    setRegion(regionOptions[p][0].value)
    onProviderChange?.(p)
  }
  const regions = regionOptions[cloudProvider]
  const activeRegion = regions.find((r) => r.value === region) ?? regions[0]

  const [innerStorage, setInnerStorage] = useState(Math.min(32, maxStorage))
  const storageVolume = Math.min(maxStorage, Math.max(1, storage ?? innerStorage))
  const setStorageVolume = (v: number) => {
    setInnerStorage(v)
    onStorageChange?.(v)
  }
  const [activeHours, setActiveHours] = useState(6)
  const [compression, setCompression] = useState<'true' | 'false'>('false')

  const [innerPlan, setInnerPlan] = useState(plans[1].name)
  const selectedPlan = plan ?? innerPlan
  const setPlan = (p: string) => {
    setInnerPlan(p)
    onPlanChange?.(p)
  }
  const [org, setOrg] = useState('1')
  const [workspaceRegion, setWorkspaceRegion] = useState('1')

  const providers = Object.keys(regionOptions) as Provider[]
  const providerKeys = useRadioKeys(providers, cloudProvider, setCloudProvider)
  const compressionKeys = useRadioKeys(['true', 'false'] as const, compression, setCompression)
  const planNames = plans.map((p) => p.name)
  const planKeys = useRadioKeys(planNames, selectedPlan, setPlan)

  const calculatePrice = () => {
    const activeHourMultiplier = 0.05
    const compressionMultiplier = compression === 'true' ? 0.7 : 1.0
    const basePrice = unitPrice * priceRatio[cloudProvider]
    const regionMultiplier = activeRegion?.multiplier || 1.0
    const storagePrice = basePrice * storageVolume * regionMultiplier * compressionMultiplier
    const activeHoursPrice = activeHours * activeHourMultiplier
    const totalPricePerDay = storagePrice + activeHoursPrice
    const totalPricePerMonth = totalPricePerDay * 30
    const priceRangeLow = (totalPricePerMonth * 0.8 * 10).toFixed(0)
    const priceRangeHigh = (totalPricePerMonth * 1.2 * 10).toFixed(0)
    return `${priceRangeLow} - ${priceRangeHigh} USD`
  }

  const vars = { ['--acc' as string]: accent, ['--acc-ink' as string]: inkFor(accent), ['--r' as string]: `${radius}px`, ...style }
  const shell = cn('w-full text-foreground', tone === 'card' && 'rounded-[calc(var(--r)+6px)] border bg-card p-5 text-card-foreground shadow-sm sm:p-8', className)

  if (variant === 'workspace') {
    const current = plans.find((p) => p.name === selectedPlan) ?? plans[0]
    return (
      <div className={shell} style={vars}>
        <form onSubmit={(e) => e.preventDefault()}>
          <h3 className="text-lg font-semibold text-foreground">Create new workspace</h3>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="mt-6 min-w-0 lg:col-span-7">
              <div className="space-y-4 md:space-y-6">
                <div className="md:flex md:items-end md:space-x-4">
                  <div>
                    <Label htmlFor={`${uid}-org`}>Organization</Label>
                    <Select id={`${uid}-org`} value={org} onChange={setOrg} className="mt-2 w-full md:w-40">
                      <option value="1">Fernway Labs</option>
                      <option value="2">Oakline Studio</option>
                      <option value="3">Pallet Works</option>
                    </Select>
                  </div>
                  <div className="mt-4 md:mt-0 md:w-full">
                    <Label htmlFor={`${uid}-ws`}>Workspace name</Label>
                    <input type="text" id={`${uid}-ws`} name="workspace" placeholder="Type..." defaultValue="analytics-prod" className={cn(inputCls, 'mt-2')} />
                  </div>
                </div>
                <div>
                  <Label htmlFor={`${uid}-wregion`}>Region</Label>
                  <Select id={`${uid}-wregion`} value={workspaceRegion} onChange={setWorkspaceRegion} className="mt-2">
                    <option value="1">EU-West (Frankfurt)</option>
                    <option value="2">US-East (Boston)</option>
                    <option value="3">US-West (San Francisco)</option>
                  </Select>
                  <p className="mt-2 text-xs text-muted-foreground">For best performance, choose a region closest to your operations</p>
                </div>
              </div>
              <h4 id={`${uid}-plan`} className="mt-14 text-sm font-medium text-foreground">
                Plan type<span className="text-red-500">*</span>
              </h4>
              <div role="radiogroup" aria-labelledby={`${uid}-plan`} className="mt-4 space-y-4" onKeyDown={planKeys}>
                {plans.map((p) => {
                  const checked = p.name === selectedPlan
                  return (
                    <div key={p.name} role="radio" aria-checked={checked} tabIndex={checked ? 0 : -1} onClick={() => setPlan(p.name)} onKeyDown={(e) => { activate(e, () => { setPlan(p.name) }) }} className={cn(radioCardCls(checked), 'p-0')}>
                      <div className="flex items-start space-x-4 p-6">
                        <RadioCardIndicator checked={checked} className="mt-1" />
                        <div className="w-full min-w-0">
                          <p className="flex flex-wrap items-center gap-1.5 leading-none">
                            <span className="text-sm font-semibold text-foreground">{p.name}</span>
                            {p.isRecommended ? <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">recommended</span> : null}
                          </p>
                          <ul role="list" className="mt-3 divide-y text-sm text-muted-foreground">
                            {p.features.map((f) => (
                              <li key={f} className="flex items-center gap-2 py-2">
                                <CheckIcon />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="flex items-center justify-between rounded-b-[var(--r)] border-t bg-muted/50 px-6 py-3">
                        <span className="inline-flex items-center gap-1 text-sm text-foreground underline decoration-[var(--acc)] underline-offset-4">
                          Learn more
                          <ExternalIcon />
                        </span>
                        <div>
                          <span className="text-lg font-semibold text-foreground">${p.price}</span>
                          <span className="text-sm text-muted-foreground">/mo</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="min-w-0 space-y-6 lg:col-span-5">
              <div className="rounded-[var(--r)] bg-muted/50 p-6 ring-1 ring-inset ring-border">
                <h4 className="text-sm font-semibold text-foreground">Which plan best fits your needs?</h4>
                <p className="mt-2 text-sm/6 text-muted-foreground">Start on Hobby while you prototype. Premium adds the environments and seats most teams need once a workspace goes to production.</p>
                <ul role="list" className="mt-4 text-sm text-foreground">
                  {highlights.map((h) => (
                    <li key={h} className="flex items-center gap-x-2 py-2.5">
                      <CheckCircleIcon />
                      <span className="truncate">{h}</span>
                    </li>
                  ))}
                </ul>
                <a href="#plans" className={cn('mt-4 inline-flex items-center gap-1 rounded-sm text-sm text-foreground underline decoration-[var(--acc)] underline-offset-4', focusRing)}>
                  Learn more about our workspace plans
                  <ExternalIcon />
                </a>
              </div>
              {showEstimate && <Estimate label="Estimated monthly costs" value={`${current.price} USD`} />}
            </div>
          </div>
          <div className="my-10 h-px w-full bg-border" aria-hidden />
          <div className="flex items-center justify-end space-x-4">
            <button type="button" className={btnSecondary}>
              Cancel
            </button>
            <button type="submit" className={btnPrimary}>
              Update
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className={cn(shell, 'mx-auto max-w-xl')} style={vars}>
      <h1 className="text-xl font-semibold text-foreground">Create a new compute cluster</h1>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">You have full control over the resources provisioned.</p>
      <form onSubmit={(e) => e.preventDefault()} className="mt-8">
        <div className="flex flex-col gap-6">
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-foreground">Cloud Provider</legend>
            <div role="radiogroup" aria-label="Select cloud provider" className="mt-2 grid grid-cols-1 gap-4 text-sm md:grid-cols-2" onKeyDown={providerKeys}>
              {providers.map((p) => {
                const Icon = cloudProviderIcons[p]
                const checked = p === cloudProvider
                return (
                  <div key={p} role="radio" aria-checked={checked} tabIndex={checked ? 0 : -1} onClick={() => setCloudProvider(p)} onKeyDown={(e) => { activate(e, () => { setCloudProvider(p) }) }} className={cn(radioCardCls(checked), 'flex items-start justify-between')}>
                    <div>
                      <div className="flex items-center gap-2">
                        <Icon className="size-5 shrink-0" aria-hidden="true" />
                        <span className="font-semibold capitalize leading-6 text-foreground">{p}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{regionOptions[p].length} regions available</p>
                    </div>
                    <RadioCardIndicator checked={checked} className="mt-1" />
                  </div>
                )
              })}
            </div>
          </fieldset>
          <div className="space-y-2">
            <Label htmlFor={`${uid}-region`}>Region</Label>
            <Select id={`${uid}-region`} value={activeRegion.value} onChange={setRegion} className="w-full">
              {regions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label id={`${uid}-storage-label`} htmlFor={`${uid}-storage`}>
              Storage (GB)
            </Label>
            <div className="mt-2 flex flex-nowrap items-center gap-4">
              <Slider value={storageVolume} onChange={setStorageVolume} min={1} max={maxStorage} labelledBy={`${uid}-storage-label`} valueText={`${storageVolume} GB`} />
              <UnitInput id={`${uid}-storage`} value={storageVolume} onChange={setStorageVolume} min={1} max={maxStorage} unit="GB" label="Storage in GB" className="w-24" />
            </div>
          </div>
          <div className="flex flex-col items-start gap-8 sm:flex-row">
            <div className="w-full space-y-2 sm:w-auto">
              <Label id={`${uid}-hours-label`}>Active hours per day (h)</Label>
              <div className="flex flex-nowrap items-center gap-4 sm:w-56">
                <Slider value={activeHours} onChange={setActiveHours} max={24} labelledBy={`${uid}-hours-label`} valueText={`${activeHours} hours`} />
                <UnitInput value={activeHours} onChange={setActiveHours} min={0} max={24} unit="h" label="Active hours" className="w-16" />
              </div>
            </div>
            <fieldset className="space-y-2">
              <legend className="block text-sm/7 font-medium text-foreground">Would you like to auto compress your data?</legend>
              <div role="radiogroup" className="flex gap-6 pt-2.5" onKeyDown={compressionKeys}>
                {(['true', 'false'] as const).map((v) => {
                  const checked = compression === v
                  return (
                    <div key={v} role="radio" aria-checked={checked} tabIndex={checked ? 0 : -1} onClick={() => setCompression(v)} onKeyDown={(e) => { activate(e, () => { setCompression(v) }) }} className={cn('flex cursor-pointer items-center gap-x-3 rounded-sm text-sm text-foreground', focusRing)}>
                      <RadioCardIndicator checked={checked} />
                      {v === 'true' ? 'Yes' : 'No'}
                    </div>
                  )
                })}
              </div>
            </fieldset>
          </div>
          {showEstimate && (
            <div className="mt-4">
              <Estimate label="Estimated monthly costs" value={calculatePrice()} />
            </div>
          )}
          <div className="mt-6 flex justify-between">
            <a href="#back" className={btnGhost}>
              Back
            </a>
            <button type="submit" className={btnPrimary} disabled={!storageVolume}>
              Continue
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
