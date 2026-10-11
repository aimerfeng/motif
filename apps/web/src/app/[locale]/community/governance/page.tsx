import { motifGovernorAbi, motifTimelockAbi, motifTokenAbi, PROPOSAL_STATES } from '@motif/contracts'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { DelegationCard, ProposalActions, ProposalComposer, type CurrentParams } from '@/components/community/governance'
import { CommunityOffline } from '@/components/community/offline'
import { PersonLink } from '@/components/community/people'
import { Chip } from '@/components/community/status'
import { buttonPrimary, buttonSecondary, EmptyState, PageHeader, SectionHeader, Stat, StatGrid } from '@/components/community/ui'
import { BallotIcon, ChevronIcon, PlusIcon } from '@/components/icons'
import { resolveRouteLocale } from '@/i18n/locale'
import { decodeActions, splitDescription } from '@/lib/community/proposals'
import { formatMotif, formatMotifCompact } from '@/lib/community/shared'
import { getCommunity } from '@/lib/community/state'
import { formatDate, relativeTime } from '@/lib/community/time'
import { personOf } from '@/lib/community/views'
import { alternatesFor } from '@/lib/site'

export async function generateMetadata({ params }: PageProps<'/[locale]/community/governance'>): Promise<Metadata> {
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'community.governance' })
  return { title: t('title'), alternates: alternatesFor('/community/governance') }
}

/** 还在流程里的提案（没有结束的），排在前面。 */
const OPEN_STATES = new Set<string>(['pending', 'active', 'succeeded', 'queued'])

const STATE_TONE = {
  pending: 'pending',
  active: 'pending',
  canceled: 'muted',
  defeated: 'danger',
  succeeded: 'success',
  queued: 'success',
  expired: 'muted',
  executed: 'success',
} as const

/** 秒数 → “2 天”“6 小时”这样的时长（本地链参数可能只有几分钟）。 */
function duration(seconds: number, locale: string): string {
  const units: [Intl.NumberFormatOptions['unit'], number][] = [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [unit, size] of units) {
    if (seconds >= size) return new Intl.NumberFormat(locale, { style: 'unit', unit, unitDisplay: 'long', maximumFractionDigits: 1 }).format(seconds / size)
  }
  return new Intl.NumberFormat(locale, { style: 'unit', unit: 'second', unitDisplay: 'long' }).format(seconds)
}

export default async function GovernancePage({ params }: PageProps<'/[locale]/community/governance'>) {
  const locale = resolveRouteLocale((await params).locale)
  const community = await getCommunity()
  if (!community) return <CommunityOffline locale={locale} />
  const t = await getTranslations({ locale, namespace: 'community.governance' })
  const tc = await getTranslations({ locale, namespace: 'community.governance.composer' })
  const { client, config, state, now } = community
  const { governor, token, timelock } = config.contracts

  const [votingDelay, votingPeriod, threshold, quorumNumerator, minDelay, supply, treasury] = await Promise.all([
    client.readContract({ address: governor, abi: motifGovernorAbi, functionName: 'votingDelay' }),
    client.readContract({ address: governor, abi: motifGovernorAbi, functionName: 'votingPeriod' }),
    client.readContract({ address: governor, abi: motifGovernorAbi, functionName: 'proposalThreshold' }),
    client.readContract({ address: governor, abi: motifGovernorAbi, functionName: 'quorumNumerator' }),
    client.readContract({ address: timelock, abi: motifTimelockAbi, functionName: 'getMinDelay' }),
    client.readContract({ address: token, abi: motifTokenAbi, functionName: 'totalSupply' }),
    client.readContract({ address: token, abi: motifTokenAbi, functionName: 'balanceOf', args: [timelock] }),
  ])

  const proposals = await Promise.all(
    [...state.proposals.values()]
      .sort((a, b) => Number(b.createdBlock - a.createdBlock))
      .map(async (proposal) => {
        const live = PROPOSAL_STATES[await client.readContract({ address: governor, abi: motifGovernorAbi, functionName: 'state', args: [proposal.id] })] ?? 'pending'
        const total = proposal.tally.for + proposal.tally.against + proposal.tally.abstain
        return { proposal, state: live, total, ...splitDescription(proposal.description), actions: decodeActions(proposal, config.contracts) }
      }),
  )

  const params_: CurrentParams | null = state.params
    ? {
        bond: state.params.bond.toString(),
        quorum: state.params.quorum,
        reviewPeriod: state.params.reviewPeriod,
        publishReward: state.params.publishReward.toString(),
        remixReward: state.params.remixReward.toString(),
        publishReputation: state.params.publishReputation.toString(),
        remixReputation: state.params.remixReputation.toString(),
        curatorReputation: state.params.curatorReputation.toString(),
        violationPenalty: state.params.violationPenalty.toString(),
      }
    : null

  // 发起 →(投票延迟)→ 投票 →(投票期)→ 排队 →(时间锁)→ 执行：三个时长放在它们所在的那一段上，比一排参数好懂。
  const lifecycle = [
    { key: 'propose', gap: { label: t('settings.delay'), value: duration(Number(votingDelay), locale) } },
    { key: 'vote', gap: { label: t('settings.period'), value: duration(Number(votingPeriod), locale) } },
    { key: 'queue', gap: { label: t('settings.timelock'), value: duration(Number(minDelay), locale) } },
    { key: 'execute', gap: null },
  ] as const
  const ongoing = proposals.filter((entry) => OPEN_STATES.has(entry.state))
  const past = proposals.filter((entry) => !OPEN_STATES.has(entry.state))

  const renderProposal = ({ proposal, state: live, total, title, body, actions }: (typeof proposals)[number]) => (
    <li key={proposal.id.toString()} className="rounded-[var(--radius-card)] border border-line p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-[16px] font-medium">{title}</h3>
        <Chip tone={STATE_TONE[live]}>{t(`states.${live}`)}</Chip>
      </div>
      <p className="mt-1.5 flex flex-wrap gap-x-3 text-[12.5px] text-ink-faint">
        <span>
          {t('by')} <PersonLink person={personOf(state, proposal.proposer)} />
        </span>
        <span>
          {live === 'pending'
            ? t('startsAt', { when: relativeTime(Number(proposal.voteStart), now, locale) })
            : live === 'active'
              ? t('endsAt', { when: relativeTime(Number(proposal.voteEnd), now, locale) })
              : formatDate(Number(proposal.voteEnd), locale)}
        </span>
        {live === 'queued' && proposal.eta !== null && <span>{t('eta', { when: relativeTime(Number(proposal.eta), now, locale) })}</span>}
      </p>
      {body && <p className="mt-3 text-[14px] leading-relaxed whitespace-pre-wrap text-ink-muted">{body}</p>}

      {/* 赞成、反对、弃权画在同一根条上，一眼看出走向。 */}
      <div className="mt-4">
        <div className="flex h-1.5 overflow-hidden rounded-full bg-sunken">
          {(['for', 'against', 'abstain'] as const).map((side) =>
            total === 0n ? null : (
              <span
                key={side}
                className={side === 'for' ? 'bg-success' : side === 'against' ? 'bg-danger' : 'bg-ink-faint'}
                style={{ width: `${Number((proposal.tally[side] * 1000n) / total) / 10}%` }}
              />
            ),
          )}
        </div>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-ink-faint tabular-nums">
          {(['for', 'against', 'abstain'] as const).map((side) => (
            <span key={side} className="inline-flex items-center gap-1.5">
              <span aria-hidden className={`size-1.5 rounded-full ${side === 'for' ? 'bg-success' : side === 'against' ? 'bg-danger' : 'bg-ink-faint'}`} />
              {t(`tally.${side}`)} <span className="text-ink-muted">{formatMotif(proposal.tally[side])}</span>
            </span>
          ))}
        </p>
      </div>

      <details className="group mt-4" open={live === 'pending' || live === 'active'}>
        <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[12.5px] text-ink-faint transition-colors duration-150 hover:text-ink [&::-webkit-details-marker]:hidden">
          <ChevronIcon className="size-3.5 transition-transform duration-150 group-open:rotate-90" />
          {t('calls', { count: actions.length })}
        </summary>
        <ul className="mt-2 space-y-1.5 rounded-lg bg-sunken px-3 py-2.5 font-mono text-[12px] text-ink-muted">
          {actions.map((action, index) => (
            <li key={index} className="break-all">
              {action.fn ? (
                <>
                  <span className="text-ink">{action.contract}</span>.{action.fn}({action.args.join(', ')})
                </>
              ) : (
                <>
                  {action.target} · {action.calldata.slice(0, 74)}
                  {action.calldata.length > 74 ? '…' : ''}
                </>
              )}
            </li>
          ))}
        </ul>
      </details>

      <ProposalActions
        proposal={{
          id: proposal.id.toString(),
          targets: proposal.targets,
          values: proposal.values.map((value) => value.toString()),
          calldatas: proposal.calldatas,
          description: proposal.description,
          state: live,
          voters: proposal.votes.map((vote) => vote.voter),
          executable: live === 'queued' && proposal.eta !== null && now >= Number(proposal.eta),
        }}
      />
    </li>
  )

  return (
    <div className="space-y-12">
      <PageHeader title={t('title')} lead={t('lead')}>
        <a href="#propose" className={buttonPrimary}>
          <PlusIcon className="size-4" />
          {tc('open')}
        </a>
      </PageHeader>

      <div className="space-y-4">
        <StatGrid className="grid-cols-2 lg:grid-cols-4">
          <Stat label={t('settings.treasury')} value={`${formatMotifCompact(treasury, locale)} MOTIF`} hint={`${formatMotif(treasury)} MOTIF`} />
          <Stat label={t('settings.supply')} value={`${formatMotifCompact(supply, locale)} MOTIF`} hint={`${formatMotif(supply)} MOTIF`} />
          <Stat label={t('settings.threshold')} value={`${formatMotifCompact(threshold, locale)} MOTIF`} hint={`${formatMotif(threshold)} MOTIF`} />
          <Stat label={t('settings.quorum')} value={`${quorumNumerator.toString()}%`} />
        </StatGrid>
        <div className="rounded-[var(--radius-card)] border border-line px-5 py-4">
          <h2 className="text-[12px] text-ink-faint">{t('lifecycle.title')}</h2>
          <ol className="mt-3 flex items-start">
            {lifecycle.map(({ key, gap }) => (
              <li key={key} className={`flex items-start ${gap ? 'flex-1' : ''}`}>
                <span className="flex flex-col items-center gap-1.5">
                  <span aria-hidden className="mt-1 size-2.5 rounded-full border-2 border-ink bg-canvas" />
                  <span className="text-[13px] whitespace-nowrap">{t(`lifecycle.${key}`)}</span>
                </span>
                {gap && (
                  <span className="mx-2 flex min-w-0 flex-1 flex-col items-center gap-1 pt-[9px]" title={gap.label}>
                    <span aria-hidden className="h-px w-full bg-line-strong" />
                    <span className="max-w-full truncate text-[11.5px] text-ink-faint tabular-nums">
                      <span className="sr-only">{gap.label} </span>
                      {gap.value}
                    </span>
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-10" data-testid="proposals">
          {proposals.length === 0 ? (
            <EmptyState
              icon={BallotIcon}
              title={t('noProposals')}
              action={
                <a href="#propose" className={buttonSecondary}>
                  {tc('open')}
                </a>
              }
            />
          ) : (
            <>
              <section className="space-y-4">
                <SectionHeader title={t('active')} count={ongoing.length} />
                {ongoing.length === 0 ? <EmptyState compact icon={BallotIcon} title={t('noProposals')} /> : <ol className="space-y-4">{ongoing.map(renderProposal)}</ol>}
              </section>
              {past.length > 0 && (
                <section className="space-y-4">
                  <SectionHeader title={t('past')} count={past.length} />
                  <ol className="space-y-4">{past.map(renderProposal)}</ol>
                </section>
              )}
            </>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <DelegationCard threshold={formatMotif(threshold)} thresholdRaw={threshold.toString()} />
          <ProposalComposer params={params_} />
        </aside>
      </div>
    </div>
  )
}
