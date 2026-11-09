import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { WorkspaceWelcomeBanner, type WorkspaceWelcomeBannerProps } from './banner-workspace-welcome'

const LOOP = 8

const NAV = ['Overview', 'Reports', 'Data sources', 'Settings']

export function Demo(props: WorkspaceWelcomeBannerProps) {
  const host = useRef<HTMLDivElement>(null)
  const [closed, setClosed] = useState(false)
  // 演示没有真实点击：按帧时钟在每个周期末尾关掉卡片 1 秒再重新打开（上游演示用 setTimeout 做同样的事）。
  useFrameLoop(
    host,
    ({ time }) => {
      const t = time % LOOP
      const next = props.dismissible !== false && t > 6.2 && t < 7.2
      setClosed((c) => (c === next ? c : next))
    },
    { reducedMotion: 'static', staticTime: 0.5 },
  )
  const light = props.tone === 'light'

  return (
    <div
      ref={host}
      className="h-full w-full overflow-y-auto"
      style={{ background: light ? '#f3f4f6' : '#030712', color: light ? '#111827' : '#f9fafb' }}
    >
      <header className="flex items-center justify-between gap-4 border-b px-4 py-3 sm:px-8" style={{ borderColor: light ? '#e5e7eb' : '#1f2937' }}>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <rect width="20" height="20" rx="5" fill={props.accent ?? '#3b82f6'} />
            <path d="M5 13l3-4 3 2 4-5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Ledgerline
        </div>
        <nav className="flex gap-4 text-sm opacity-70" aria-label="Main">
          {NAV.map((n, i) => (
            <span key={n} className={i > 1 ? 'max-sm:hidden' : undefined}>
              {n}
            </span>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        <WorkspaceWelcomeBanner {...props} open={!closed} />
        <h2 className="mt-10 text-sm font-medium opacity-70">Dashboards</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {['Revenue', 'Active accounts', 'Churn'].map((name) => (
            <div
              key={name}
              className="rounded-lg border border-dashed p-5 text-sm"
              style={{ borderColor: light ? '#d1d5db' : '#1f2937' }}
            >
              <p className="font-medium">{name}</p>
              <p className="mt-1 opacity-60">No data yet</p>
              <div className="mt-6 h-16 rounded-md" style={{ background: light ? '#e5e7eb' : '#0b1220' }} />
            </div>
          ))}
        </div>
        <div className="mt-6 h-64 rounded-lg border border-dashed" style={{ borderColor: light ? '#d1d5db' : '#1f2937' }} />
      </main>
    </div>
  )
}
