'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import type { Address } from 'viem'
import { Link } from '@/i18n/navigation'
import { PersonLink, type Person } from './people'
import { useCommunity } from './wallet'

export interface QueueEntry {
  itemId: string
  slug: string
  title: string | null
  version: number
  submitter: Person
  deadline: string
  overdue: boolean
  votes: number
  quorum: number
  voters: Address[]
  conflicted: Address[]
}

/** 进行中的审核。审核员可以只看自己还没投、也不需要回避的那些。 */
export function ReviewQueue({ entries }: { entries: QueueEntry[] }) {
  const t = useTranslations('community.review')
  const { address, account } = useCommunity()
  const [mine, setMine] = useState(false)
  const actionable = (entry: QueueEntry) => !entry.overdue && address !== null && !entry.voters.includes(address) && !entry.conflicted.includes(address)
  const visible = mine ? entries.filter(actionable) : entries

  return (
    <div>
      {account?.curator && (
        <label className="mb-4 inline-flex cursor-pointer items-center gap-2 text-[13.5px] text-ink-muted">
          <input type="checkbox" checked={mine} onChange={(event) => setMine(event.target.checked)} className="accent-[var(--color-ink)]" />
          {t('onlyMine')}
        </label>
      )}
      {visible.length === 0 ? (
        <p className="text-[14px] text-ink-faint">{mine ? t('nothingForYou') : t('empty')}</p>
      ) : (
        <ul className="divide-y divide-line border-y border-line" data-testid="review-queue">
          {visible.map((entry) => (
            <li key={`${entry.itemId}-${entry.version}`} className="grid gap-2 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6">
              <div className="min-w-0">
                <Link href={`/community/items/${entry.itemId}?v=${entry.version}`} className="text-[15px] font-medium hover:underline hover:decoration-line-strong hover:underline-offset-4">
                  {entry.title ?? entry.slug}
                </Link>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 text-[12.5px] text-ink-faint">
                  <span className="font-mono">{entry.slug}</span>
                  <span>{entry.version === 1 ? t('newItem') : t('newVersion', { version: entry.version })}</span>
                  <span>
                    {t('by')} <PersonLink person={entry.submitter} />
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-5 text-[12.5px] tabular-nums">
                <span className="text-ink-muted">{t('votes', { votes: entry.votes, quorum: entry.quorum })}</span>
                <span className={entry.overdue ? 'text-danger' : 'text-ink-faint'}>{entry.overdue ? t('overdue') : entry.deadline}</span>
                {address && entry.voters.includes(address) && <span className="text-success">{t('youVoted')}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
