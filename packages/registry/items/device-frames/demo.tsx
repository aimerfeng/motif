import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { DeviceFrame, defaults, type DeviceFrameProps } from './device-frames'

const LOOP = 8

/** 屏幕配色跟着外框色调走：浅框配浅色界面，深框配深色界面，文字对比度都够。 */
const SCREENS = {
  light: { bg: '#f7f7f5', card: '#ffffff', ink: '#171717', muted: '#5f6368', line: '#e7e5e4', accent: '#0f766e', soft: '#ccfbf1' },
  dark: { bg: '#0d0f12', card: '#171a1f', ink: '#f4f4f5', muted: '#a1a1aa', line: '#26292f', accent: '#2dd4bf', soft: '#134e4a' },
} as const

type Screen = (typeof SCREENS)[keyof typeof SCREENS]

const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3)

const TIDES = [
  { time: '05:42', label: 'Low tide', value: '0.4 m' },
  { time: '11:58', label: 'High tide', value: '3.1 m' },
  { time: '18:10', label: 'Low tide', value: '0.6 m' },
  { time: '00:21', label: 'High tide', value: '2.9 m' },
]

function wave(t: number, x: number) {
  return Math.sin(x * 0.11 + t * 1.3) * 0.5 + Math.sin(x * 0.047 - t * 0.7) * 0.5
}

function PhoneScreen({ s, t }: { s: Screen; t: number }) {
  const p = ease((t % LOOP) / 2.2)
  const height = (0.4 + 2.7 * p).toFixed(1)
  const points = Array.from({ length: 41 }, (_, i) => {
    const x = i * 5
    const y = 34 + wave(t, x) * 9
    return `${x},${y.toFixed(2)}`
  })
  return (
    <div className="flex size-full flex-col gap-[0.9em] px-[1.1em] pt-[3.2em] leading-tight" style={{ background: s.bg, color: s.ink, fontSize: '4.4cqw' }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[0.75em]" style={{ color: s.muted }}>
            Kestrel Point
          </p>
          <p className="text-[1.25em] font-semibold">Today’s tides</p>
        </div>
        <div className="grid size-[2.2em] place-items-center rounded-full text-[0.8em] font-semibold" style={{ background: s.soft, color: s.ink }}>
          KP
        </div>
      </div>

      <div className="rounded-[1em] p-[1em]" style={{ background: s.card, border: `1px solid ${s.line}` }}>
        <p className="text-[0.7em] uppercase tracking-wider" style={{ color: s.muted }}>
          Rising now
        </p>
        <p className="mt-[0.2em] text-[2.4em] font-semibold tabular-nums">
          {height}
          <span className="text-[0.4em] font-normal" style={{ color: s.muted }}>
            {' '}
            m
          </span>
        </p>
        <svg viewBox="0 0 200 60" className="mt-[0.4em] block w-full" aria-hidden>
          <polygon points={`0,60 ${points.join(' ')} 200,60`} fill={s.soft} />
          <polyline points={points.join(' ')} fill="none" stroke={s.accent} strokeWidth="2" />
        </svg>
      </div>

      <div className="flex flex-col">
        {TIDES.map((tide, i) => {
          const on = ease((t % LOOP) * 1.4 - 1.2 - i * 0.35)
          return (
            <div
              key={tide.time}
              className="flex items-center justify-between py-[0.65em]"
              style={{ borderBottom: `1px solid ${s.line}`, opacity: 0.25 + 0.75 * on, transform: `translateY(${(1 - on) * 0.6}em)` }}
            >
              <div>
                <p className="text-[0.85em] font-medium">{tide.label}</p>
                <p className="text-[0.7em]" style={{ color: s.muted }}>
                  {tide.time}
                </p>
              </div>
              <p className="text-[0.85em] font-semibold tabular-nums" style={{ color: s.accent }}>
                {tide.value}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const NAV = ['Overview', 'Stations', 'Alerts', 'Exports']
const KPIS = [
  { label: 'Stations online', value: 128 },
  { label: 'Readings / hour', value: 9640 },
  { label: 'Alerts today', value: 3 },
]

function BrowserScreen({ s, t }: { s: Screen; t: number }) {
  const p = ease((t % LOOP) / 2.6)
  const points = Array.from({ length: 61 }, (_, i) => {
    const x = i * 10
    const y = 90 - (wave(t * 0.5, x) * 28 + Math.sin(i * 0.35) * 18)
    return `${x},${y.toFixed(2)}`
  }).join(' ')
  return (
    <div className="flex size-full leading-tight" style={{ background: s.bg, color: s.ink, fontSize: '1.45cqw' }}>
      <aside className="flex w-[22%] flex-col gap-[0.4em] p-[1.4em]" style={{ borderRight: `1px solid ${s.line}` }}>
        <div className="mb-[1em] flex items-center gap-[0.6em] font-semibold">
          <svg viewBox="0 0 24 24" className="size-[1.4em]" aria-hidden>
            <path d="M2 15c3-4 6-4 10 0s7 4 10 0" fill="none" stroke={s.accent} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M2 9c3-4 6-4 10 0s7 4 10 0" fill="none" stroke={s.accent} strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
          </svg>
          Tidepool
        </div>
        {NAV.map((n, i) => (
          <div key={n} className="rounded-[0.5em] px-[0.8em] py-[0.5em]" style={{ background: i === 0 ? s.soft : undefined, color: i === 0 ? s.ink : s.muted }}>
            {n}
          </div>
        ))}
      </aside>
      <main className="flex min-w-0 flex-1 flex-col gap-[1.2em] p-[1.6em]">
        <div>
          <p className="text-[1.6em] font-semibold">Coastal overview</p>
          <p style={{ color: s.muted }}>Live water levels across the northern network</p>
        </div>
        <div className="grid grid-cols-3 gap-[1em]">
          {KPIS.map((k) => (
            <div key={k.label} className="rounded-[0.8em] p-[1em]" style={{ background: s.card, border: `1px solid ${s.line}` }}>
              <p style={{ color: s.muted }}>{k.label}</p>
              <p className="mt-[0.3em] text-[1.8em] font-semibold tabular-nums">{Math.round(k.value * p).toLocaleString('en-US')}</p>
            </div>
          ))}
        </div>
        <div className="min-h-0 flex-1 rounded-[0.8em] p-[1em]" style={{ background: s.card, border: `1px solid ${s.line}` }}>
          <p className="mb-[0.6em]" style={{ color: s.muted }}>
            Water level, last 24 h
          </p>
          <svg viewBox="0 0 600 180" preserveAspectRatio="none" className="block h-[78%] w-full" aria-hidden>
            {[45, 90, 135].map((y) => (
              <line key={y} x1="0" x2="600" y1={y} y2={y} stroke={s.line} strokeWidth="1" />
            ))}
            <g style={{ clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }}>
              <polygon points={`0,180 ${points} 600,180`} fill={s.soft} opacity="0.7" />
              <polyline points={points} fill="none" stroke={s.accent} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
            </g>
          </svg>
        </div>
      </main>
    </div>
  )
}

export function Demo(props: DeviceFrameProps) {
  const host = useRef<HTMLDivElement>(null)
  const [t, setT] = useState(2.4)
  useFrameLoop(host, ({ time }) => setT(Math.round(time * 60) / 60), { reducedMotion: 'static', staticTime: 2.4 })

  const options = { ...defaults, ...props }
  const s = SCREENS[options.tone === 'light' ? 'light' : 'dark']
  const browser = options.device === 'browser'
  const aspect = options.device === 'android' ? '380/830' : '433/882'

  return (
    <div ref={host} className="grid h-full w-full place-items-center overflow-hidden bg-background bg-[radial-gradient(60%_55%_at_50%_45%,oklch(0.32_0.06_190/0.35),transparent)] p-6">
      {browser ? (
        <div className="w-full max-w-[880px]">
          <DeviceFrame {...props}>
            <div className="size-full [container-type:inline-size]">
              <BrowserScreen s={s} t={t} />
            </div>
          </DeviceFrame>
        </div>
      ) : (
        <div className="max-w-full" style={{ height: 'min(86%, 660px)', aspectRatio: aspect }}>
          <DeviceFrame {...props}>
            <div className="size-full [container-type:inline-size]">
              <PhoneScreen s={s} t={t} />
            </div>
          </DeviceFrame>
        </div>
      )}
    </div>
  )
}
