'use client'

import type { ModuleRef } from '@motif/preview/protocol'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { PreviewFrame, type PreviewStatus } from '@/components/preview-frame'

// Studio 路径的最小样本：一段已编译的 ESM，用裸模块名引用 vendor。
const INLINE_MODULE = `
import { jsx } from 'react/jsx-runtime'
import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
export default function Inline({ text }) {
  const [ticks, setTicks] = useState(0)
  useEffect(() => { const id = setInterval(() => setTicks((n) => n + 1), 250); return () => clearInterval(id) }, [])
  return jsx(motion.div, { 'data-testid': 'inline-box', animate: { rotate: ticks * 15 }, style: { margin: 40, width: 80, height: 80, borderRadius: 20, background: '#29d3a1' }, children: text })
}
`

const BROKEN_MODULE = `
export default function Broken() { throw new Error('intentional render failure') }
`

const CASES: { id: string; module: ModuleRef; props?: Record<string, string | number> }[] = [
  { id: 'motion-card', module: { kind: 'url', url: '/lab/motion-card.js' }, props: { label: 'Motif' } },
  { id: 'three-spin', module: { kind: 'url', url: '/lab/three-spin.js' }, props: { color: '#7c6cff' } },
  { id: 'paper-gradient', module: { kind: 'url', url: '/lab/paper-gradient.js' }, props: { speed: 0.6 } },
  { id: 'inline-code', module: { kind: 'code', code: INLINE_MODULE }, props: { text: '' } },
  { id: 'broken', module: { kind: 'code', code: BROKEN_MODULE } },
]

export function PreviewLab() {
  const t = useTranslations('lab')
  const [statuses, setStatuses] = useState<Record<string, PreviewStatus>>({})

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="mb-6 text-2xl font-semibold">{t('previewTitle')}</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {CASES.map((c) => (
          <section key={c.id} data-testid={`case-${c.id}`} data-status={statuses[c.id]?.state ?? 'loading'} className="overflow-hidden rounded-xl border border-black/10 bg-white">
            <PreviewFrame
              title={c.id}
              module={c.module}
              {...(c.props ? { props: c.props } : {})}
              className="block aspect-video w-full"
              onStatus={(status) => setStatuses((prev) => ({ ...prev, [c.id]: status }))}
            />
            <p className="px-4 py-2 font-mono text-xs" data-testid={`status-${c.id}`}>
              {c.id}: {JSON.stringify(statuses[c.id] ?? { state: 'loading' })}
            </p>
          </section>
        ))}
      </div>
    </main>
  )
}
