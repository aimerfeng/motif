'use client'

import { useTranslations } from 'next-intl'
import { useState, useSyncExternalStore } from 'react'
import { CopyBlock } from '@/components/copy-block'
import { CopyCommand } from '@/components/copy-command'
import { ItemTabs } from '@/components/item/item-tabs'
import type { AgentGuide, AgentOs } from '@/lib/agent-clients'

const SYSTEMS: AgentOs[] = ['unix', 'windows']

/** 浏览器所在的系统不会变，没有可订阅的东西。 */
const never = () => () => undefined
const detectOs = (): AgentOs => (/Windows/i.test(navigator.userAgent) ? 'windows' : 'unix')

function Guide({ guide, os, login }: { guide: AgentGuide; os: AgentOs; login: string }) {
  const t = useTranslations('agents.clients')
  const manual = guide.manual[os]
  return (
    <div className="grid gap-x-10 gap-y-8 lg:grid-cols-2">
      <div className="min-w-0 space-y-3">
        <h3 className="text-[13px] font-medium">{t('auto')}</h3>
        <p className="text-[13.5px] leading-relaxed text-ink-muted">{t('autoLead')}</p>
        <CopyCommand text={guide.setup} />
        <p className="text-[12.5px] leading-relaxed text-ink-faint">{t('project')}</p>
      </div>
      <div className="min-w-0 space-y-3">
        <h3 className="text-[13px] font-medium">{t('manual')}</h3>
        {manual.kind === 'file' ? (
          <>
            <p className="text-[13.5px] leading-relaxed text-ink-muted">{t('manualFile')}</p>
            <CopyBlock text={manual.snippet} label={manual.file} />
          </>
        ) : (
          <>
            <p className="text-[13.5px] leading-relaxed text-ink-muted">{t('manualCommand')}</p>
            <CopyCommand text={manual.text} />
          </>
        )}
        <p className="pt-1 text-[13.5px] leading-relaxed text-ink-muted">{t('manualLogin')}</p>
        <CopyCommand text={login} />
      </div>
    </div>
  )
}

/**
 * 每个 agent 的接入说明：选 agent、选系统，给出自动（一条命令）和手动（配置片段）两种做法。
 * 系统先按浏览器猜（服务端不知道，按 unix 渲染，水合之后换过来），用户点过就听用户的。
 */
export function AgentClients({ guides, login }: { guides: AgentGuide[]; login: string }) {
  const t = useTranslations('agents.clients')
  const detected = useSyncExternalStore<AgentOs>(never, detectOs, () => 'unix')
  const [chosen, setChosen] = useState<AgentOs | null>(null)
  const os = chosen ?? detected

  return (
    <div className="space-y-6">
      <div role="group" aria-label={t('os')} className="inline-flex rounded-full border border-line p-1">
        {SYSTEMS.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={os === value}
            onClick={() => setChosen(value)}
            className="rounded-full px-3.5 py-1 text-[12.5px] text-ink-muted transition-colors duration-150 hover:text-ink aria-pressed:bg-ink aria-pressed:text-canvas"
          >
            {t(value)}
          </button>
        ))}
      </div>
      <ItemTabs tabs={guides.map((guide) => ({ id: guide.id, label: guide.label, content: <Guide guide={guide} os={os} login={login} /> }))} />
    </div>
  )
}
