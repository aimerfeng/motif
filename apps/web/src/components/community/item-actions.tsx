'use client'

import { motifCurationAbi, motifRegistryAbi } from '@motif/contracts'
import { useTranslations } from 'next-intl'
import { useState, type ReactNode } from 'react'
import { isAddress, zeroHash, type Address, type Hex } from 'viem'
import { Link } from '@/i18n/navigation'
import { NOTE_LIMIT } from '@/lib/community/shared'
import { ConnectGate } from './connect-gate'
import { useWriter } from './use-writer'
import { useCommunity } from './wallet'

export interface ReviewState {
  open: boolean
  overdue: boolean
  submitter: Address
  votes: number
  voters: Address[]
  /** 不能审核这次投稿的人：投稿者本人，以及被 Remix 版本的作者。 */
  conflicted: Address[]
}

interface ItemActionsProps {
  itemId: string
  slug: string
  version: number
  review: ReviewState | null
  maintainer: Address
  pendingMaintainer: Address | null
  delisted: boolean
  /** 最新版本已经审核结束、条目没被下架：维护者可以提交新版本。 */
  canAddVersion: boolean
}

/** 托管一段文字（审核意见、下架理由），返回它的 sha256。 */
async function storeNote(text: string): Promise<Hex> {
  const response = await fetch('/api/community/blobs', { method: 'POST', body: JSON.stringify({ kind: 'note', text }) })
  const json = (await response.json()) as { hash?: Hex; error?: string }
  if (!response.ok || !json.hash) throw new Error(json.error ?? response.statusText)
  return json.hash
}

/** 条目记录页的操作区：按当前钱包的身份（审核员、投稿者、维护者、版主）显示能做的事。 */
export function ItemActions(props: ItemActionsProps) {
  const t = useTranslations('community.actions')
  const { address, account } = useCommunity()
  const { review } = props

  const sections: ReactNode[] = []
  if (review?.open && address) {
    if (account?.curator && !review.overdue) sections.push(<VoteForm key="vote" {...props} review={review} />)
    if (address === review.submitter && review.votes === 0) sections.push(<SimpleAction key="withdraw" kind="withdraw" {...props} />)
  }
  if (review?.open && review.overdue) sections.push(<SimpleAction key="expire" kind="expire" {...props} />)
  if (address && address === props.maintainer && props.canAddVersion) {
    sections.push(
      <div key="version" className="space-y-2">
        <p className="text-ink-muted">{t('maintainer.lead')}</p>
        <Link href="/community/submit" className="inline-block rounded-full border border-line-strong px-4 py-1.5 text-ink transition-colors duration-150 hover:border-ink">
          {t('maintainer.newVersion')}
        </Link>
      </div>,
    )
    sections.push(<TransferForm key="transfer" {...props} />)
  }
  if (address && address === props.pendingMaintainer) sections.push(<SimpleAction key="accept" kind="accept" {...props} />)
  if (account?.moderator) sections.push(<ModerationForm key="moderate" {...props} />)

  return (
    <div className="rounded-[var(--radius-card)] border border-line p-5 text-[13.5px]" data-testid="item-actions">
      <h2 className="text-[15px] font-medium">{t('title')}</h2>
      <div className="mt-4">
        <ConnectGate compact>
          {sections.length === 0 ? <p className="text-ink-faint">{t('none')}</p> : <div className="space-y-6 divide-line">{sections}</div>}
        </ConnectGate>
      </div>
    </div>
  )
}

function VoteForm({ itemId, version, review }: ItemActionsProps & { review: ReviewState }) {
  const t = useTranslations('community.actions.vote')
  const { address, config } = useCommunity()
  const writer = useWriter()
  const [verdict, setVerdict] = useState<0 | 1 | 2>(0)
  const [note, setNote] = useState('')

  if (address && review.voters.includes(address)) return <p className="text-ink-muted">{t('voted')}</p>
  if (address && review.conflicted.includes(address)) return <p className="text-ink-muted">{t('conflicted')}</p>

  const needsNote = verdict !== 0 && note.trim() === ''
  const submit = () =>
    writer.run(async ({ write }) => {
      const noteHash = note.trim() ? await storeNote(note.trim()) : zeroHash
      await write({ address: config!.contracts.curation, abi: motifCurationAbi, functionName: 'vote', args: [BigInt(itemId), version, verdict, noteHash] })
      setNote('')
    })

  return (
    <div className="space-y-3">
      <p className="text-ink-muted">{t('lead')}</p>
      <div role="radiogroup" aria-label={t('label')} className="grid grid-cols-3 gap-1 rounded-lg border border-line p-0.5">
        {(['approve', 'reject', 'violation'] as const).map((key, index) => (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={verdict === index}
            onClick={() => setVerdict(index as 0 | 1 | 2)}
            className={`rounded-md px-2 py-1.5 text-[13px] transition-colors duration-150 aria-checked:bg-white/10 ${key === 'approve' ? 'aria-checked:text-success' : 'aria-checked:text-danger'} text-ink-muted hover:text-ink`}
          >
            {t(`verdicts.${key}`)}
          </button>
        ))}
      </div>
      <p className="text-[12.5px] leading-relaxed text-ink-faint">{t(`hints.${(['approve', 'reject', 'violation'] as const)[verdict]}`)}</p>
      <label className="block">
        <span className="sr-only">{t('note')}</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value.slice(0, NOTE_LIMIT))}
          rows={4}
          placeholder={t('notePlaceholder')}
          className="w-full resize-y rounded-lg border border-line bg-sunken px-3 py-2 text-[13.5px] leading-relaxed placeholder:text-ink-faint focus:border-line-strong focus:outline-none"
        />
      </label>
      <button
        type="button"
        onClick={() => void submit()}
        disabled={writer.busy || needsNote}
        data-testid="vote-button"
        className="w-full rounded-full bg-ink px-4 py-2 text-[14px] font-medium text-canvas transition-opacity duration-150 hover:opacity-90 disabled:opacity-40"
      >
        {writer.busy ? t(`phase.${writer.phase}`) : t('submit')}
      </button>
      {needsNote && <p className="text-[12px] text-ink-faint">{t('noteRequired')}</p>}
      {writer.error && (
        <p role="alert" className="text-[12.5px] text-danger">
          {writer.error}
        </p>
      )}
    </div>
  )
}

function SimpleAction({ kind, itemId, version }: ItemActionsProps & { kind: 'withdraw' | 'expire' | 'accept' }) {
  const t = useTranslations(`community.actions.${kind}`)
  const tp = useTranslations('community.actions.vote.phase')
  const { config } = useCommunity()
  const writer = useWriter()
  const run = () =>
    writer.run(async ({ write }) => {
      const contracts = config!.contracts
      if (kind === 'withdraw') await write({ address: contracts.curation, abi: motifCurationAbi, functionName: 'withdraw', args: [BigInt(itemId), version] })
      else if (kind === 'expire') await write({ address: contracts.curation, abi: motifCurationAbi, functionName: 'expire', args: [BigInt(itemId), version] })
      else await write({ address: contracts.registry, abi: motifRegistryAbi, functionName: 'acceptMaintainer', args: [BigInt(itemId)] })
    })
  return (
    <div className="space-y-2">
      <p className="text-ink-muted">{t('lead')}</p>
      <button
        type="button"
        onClick={() => void run()}
        disabled={writer.busy}
        className="rounded-full border border-line-strong px-4 py-1.5 text-ink transition-colors duration-150 hover:border-ink disabled:opacity-40"
      >
        {writer.busy ? tp(writer.phase as 'signing' | 'pending' | 'syncing') : t('button')}
      </button>
      {writer.error && (
        <p role="alert" className="text-[12.5px] text-danger">
          {writer.error}
        </p>
      )}
    </div>
  )
}

function TransferForm({ itemId, pendingMaintainer }: ItemActionsProps) {
  const t = useTranslations('community.actions.transfer')
  const tp = useTranslations('community.actions.vote.phase')
  const { config } = useCommunity()
  const writer = useWriter()
  const [to, setTo] = useState('')
  const valid = isAddress(to)
  const run = () =>
    writer.run(async ({ write }) => {
      await write({ address: config!.contracts.registry, abi: motifRegistryAbi, functionName: 'transferMaintainer', args: [BigInt(itemId), to as Address] })
      setTo('')
    })
  return (
    <details className="group">
      <summary className="cursor-pointer text-ink-muted transition-colors duration-150 hover:text-ink">{t('title')}</summary>
      <div className="mt-3 space-y-2">
        <p className="text-[12.5px] leading-relaxed text-ink-faint">{pendingMaintainer ? t('pending', { address: pendingMaintainer }) : t('lead')}</p>
        <input
          value={to}
          onChange={(event) => setTo(event.target.value.trim())}
          placeholder="0x…"
          spellCheck={false}
          className="w-full rounded-lg border border-line bg-sunken px-3 py-2 font-mono text-[12.5px] placeholder:text-ink-faint focus:border-line-strong focus:outline-none"
        />
        <button
          type="button"
          onClick={() => void run()}
          disabled={!valid || writer.busy}
          className="rounded-full border border-line-strong px-4 py-1.5 text-ink transition-colors duration-150 hover:border-ink disabled:opacity-40"
        >
          {writer.busy ? tp(writer.phase as 'signing' | 'pending' | 'syncing') : t('button')}
        </button>
        {writer.error && (
          <p role="alert" className="text-[12.5px] text-danger">
            {writer.error}
          </p>
        )}
      </div>
    </details>
  )
}

function ModerationForm({ itemId, slug, delisted }: ItemActionsProps) {
  const t = useTranslations('community.actions.moderate')
  const tp = useTranslations('community.actions.vote.phase')
  const { config } = useCommunity()
  const writer = useWriter()
  const [reason, setReason] = useState('')
  const run = () =>
    writer.run(async ({ write }) => {
      const reasonHash = reason.trim() ? await storeNote(reason.trim()) : zeroHash
      await write({ address: config!.contracts.registry, abi: motifRegistryAbi, functionName: 'setDelisted', args: [BigInt(itemId), !delisted, reasonHash] })
      setReason('')
    })
  return (
    <div className="space-y-2 border-t border-line pt-5">
      <p className="text-[12px] tracking-wide text-ink-faint uppercase">{t('label')}</p>
      <p className="text-ink-muted">{delisted ? t('relistLead') : t('delistLead', { slug })}</p>
      <textarea
        value={reason}
        onChange={(event) => setReason(event.target.value.slice(0, NOTE_LIMIT))}
        rows={2}
        placeholder={t('reason')}
        className="w-full resize-y rounded-lg border border-line bg-sunken px-3 py-2 text-[13px] placeholder:text-ink-faint focus:border-line-strong focus:outline-none"
      />
      <button
        type="button"
        onClick={() => void run()}
        disabled={writer.busy || (!delisted && reason.trim() === '')}
        className={`rounded-full border px-4 py-1.5 transition-colors duration-150 disabled:opacity-40 ${delisted ? 'border-line-strong text-ink hover:border-ink' : 'border-danger/50 text-danger hover:border-danger'}`}
      >
        {writer.busy ? tp(writer.phase as 'signing' | 'pending' | 'syncing') : delisted ? t('relist') : t('delist')}
      </button>
      {writer.error && (
        <p role="alert" className="text-[12.5px] text-danger">
          {writer.error}
        </p>
      )}
    </div>
  )
}
