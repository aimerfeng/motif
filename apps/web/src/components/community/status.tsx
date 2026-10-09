import type { ReviewOutcome, VersionStatus } from '@motif/contracts'
import { useTranslations } from 'next-intl'

type Tone = 'success' | 'pending' | 'danger' | 'muted'

const TONE: Record<Tone, string> = {
  success: 'text-success',
  pending: 'text-pending',
  danger: 'text-danger',
  muted: 'text-ink-faint',
}

const DOT: Record<Tone, string> = {
  success: 'bg-success',
  pending: 'bg-pending',
  danger: 'bg-danger',
  muted: 'bg-ink-faint',
}

export function Chip({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-line px-2 py-0.5 text-[11.5px] leading-5 whitespace-nowrap ${TONE[tone]}`}>
      <span aria-hidden className={`size-1.5 rounded-full ${DOT[tone]}`} />
      {children}
    </span>
  )
}

const VERSION_TONE: Record<VersionStatus, Tone> = { none: 'muted', pending: 'pending', approved: 'success', rejected: 'danger', withdrawn: 'muted' }
const OUTCOME_TONE: Record<ReviewOutcome, Tone> = {
  none: 'muted',
  open: 'pending',
  approved: 'success',
  rejected: 'danger',
  slashed: 'danger',
  withdrawn: 'muted',
  expired: 'muted',
}

/** 版本状态。审核结果比版本状态更具体（区分驳回和违规、撤回和过期），有审核时优先显示审核结果。 */
export function VersionChip({ status, outcome }: { status: VersionStatus; outcome?: ReviewOutcome | null }) {
  const t = useTranslations('community.status')
  if (outcome && outcome !== 'none') return <Chip tone={OUTCOME_TONE[outcome]}>{t(`outcome.${outcome}`)}</Chip>
  return <Chip tone={VERSION_TONE[status]}>{t(`version.${status}`)}</Chip>
}
