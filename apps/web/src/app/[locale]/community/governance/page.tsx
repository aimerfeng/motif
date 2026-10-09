import { motifGovernorAbi, motifTimelockAbi, motifTokenAbi, PROPOSAL_STATES } from '@motif/contracts'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { DelegationCard, ProposalActions, ProposalComposer, type CurrentParams } from '@/components/community/governance'
import { CommunityOffline } from '@/components/community/offline'
import { PersonLink } from '@/components/community/people'
import { Chip } from '@/components/community/status'
import { resolveRouteLocale } from '@/i18n/locale'
import { decodeActions, splitDescription } from '@/lib/community/proposals'
import { formatMotif } from '@/lib/community/shared'
import { getCommunity } from '@/lib/community/state'
import { formatDate, relativeTime } from '@/lib/community/time'
import { personOf } from '@/lib/community/views'
import { alternatesFor } from '@/lib/site'

export async function generateMetadata({ params }: PageProps<'/[locale]/community/governance'>): Promise<Metadata> {
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'community.governance' })
  return { title: t('title'), alternates: alternatesFor('/community/governance') }
}

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

  const settings = [
    { label: t('settings.delay'), value: duration(Number(votingDelay), locale) },
    { label: t('settings.period'), value: duration(Number(votingPeriod), locale) },
    { label: t('settings.timelock'), value: duration(Number(minDelay), locale) },
    { label: t('settings.threshold'), value: `${formatMotif(threshold)} MOTIF` },
    { label: t('settings.quorum'), value: `${quorumNumerator.toString()}%` },
    { label: t('settings.treasury'), value: `${formatMotif(treasury)} MOTIF` },
    { label: t('settings.supply'), value: `${formatMotif(supply)} MOTIF` },
  ]
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

  return (
    <div>
      <div className="max-w-2xl">
        <h1 className="font-display text-[44px] leading-[1.05] font-semibold tracking-[-0.03em]">{t('title')}</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-pretty text-ink-muted">{t('lead')}</p>
      </div>

      <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-4 xl:grid-cols-7">
        {settings.map((setting) => (
          <div key={setting.label} className="bg-canvas px-4 py-3.5 last:col-span-2 xl:last:col-span-1">
            <dt className="text-[12px] text-ink-faint">{setting.label}</dt>
            <dd className="mt-1 text-[14.5px] font-medium tabular-nums">{setting.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section>
          <h2 className="text-[15px] font-medium">{t('proposals', { count: proposals.length })}</h2>
          {proposals.length === 0 ? (
            <p className="mt-4 text-[14px] text-ink-faint">{t('noProposals')}</p>
          ) : (
            <ol className="mt-4 space-y-4" data-testid="proposals">
              {proposals.map(({ proposal, state: live, total, title, body, actions }) => (
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

                  <ul className="mt-4 space-y-1.5 rounded-lg bg-sunken px-3 py-2.5 font-mono text-[12px] text-ink-muted">
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

                  <div className="mt-4 space-y-1.5 text-[12.5px]">
                    {(['for', 'against', 'abstain'] as const).map((side) => {
                      const share = total === 0n ? 0 : Number((proposal.tally[side] * 1000n) / total) / 10
                      return (
                        <div key={side} className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center gap-3">
                          <span className="text-ink-faint">{t(`tally.${side}`)}</span>
                          <span className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                            <span
                              className={`block h-full rounded-full ${side === 'for' ? 'bg-success' : side === 'against' ? 'bg-danger' : 'bg-ink-faint'}`}
                              style={{ width: `${share}%` }}
                            />
                          </span>
                          <span className="text-ink-muted tabular-nums">{formatMotif(proposal.tally[side])}</span>
                        </div>
                      )
                    })}
                  </div>

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
              ))}
            </ol>
          )}
        </section>

        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <DelegationCard threshold={formatMotif(threshold)} />
          <ProposalComposer params={params_} />
        </aside>
      </div>
    </div>
  )
}
