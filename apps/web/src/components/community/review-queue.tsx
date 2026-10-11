'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import type { Address } from 'viem'
import { CheckIcon, ClockIcon, ReviewIcon } from '@/components/icons'
import { Link } from '@/i18n/navigation'
import { personLabel, type Person } from './people'
import { EmptyState, VoteMeter } from './ui'
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
    <div className="space-y-4">
      {account?.curator && entries.length > 0 && (
        <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-ink-muted">
          <input type="checkbox" checked={mine} onChange={(event) => setMine(event.target.checked)} className="accent-[var(--color-ink)]" />
          {t('onlyMine')}
          <span className="font-mono text-[12px] text-ink-faint tabular-nums">{entries.filter(actionable).length}</span>
        </label>
      )}
      {visible.length === 0 ? (
        <EmptyState icon={mine ? CheckIcon : ReviewIcon} title={mine ? t('nothingForYou') : t('empty')} />
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line" data-testid="review-queue">
          {visible.map((entry) => {
            const voted = address !== null && entry.voters.includes(address)
            return (
              <li key={`${entry.itemId}-${entry.version}`}>
                <Link
                  href={`/community/items/${entry.itemId}?v=${entry.version}`}
                  className="grid gap-3 px-5 py-4 transition-colors duration-150 hover:bg-raised sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-medium">{entry.title ?? entry.slug}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-ink-faint">
                      <span className="rounded-full bg-sunken px-2 py-px">{entry.version === 1 ? t('newItem') : t('newVersion', { version: entry.version })}</span>
                      <span className="font-mono">{entry.slug}</span>
                      <span>
                        {t('by')} {personLabel(entry.submitter)}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-[12.5px] tabular-nums">
                    <span className="flex items-center gap-2 text-ink-muted">
                      <VoteMeter votes={entry.votes} quorum={entry.quorum} />
                      {t('votes', { votes: entry.votes, quorum: entry.quorum })}
                    </span>
                    <span className={`flex items-center gap-1 ${entry.overdue ? 'text-danger' : 'text-ink-faint'}`}>
                      <ClockIcon className="size-3.5" />
                      {entry.overdue ? t('overdue') : entry.deadline}
                    </span>
                    {voted && (
                      <span className="flex items-center gap-1 text-success">
                        <CheckIcon className="size-3.5" />
                        {t('youVoted')}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
