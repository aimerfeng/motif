'use client'

import { motifIdentityAbi } from '@motif/contracts'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { zeroHash, type Address, type Hex } from 'viem'
import { NOTE_LIMIT } from '@/lib/community/shared'
import { useWriter } from './use-writer'
import { useCommunity } from './wallet'

/** 版主处理冒充、侵权的资料：清空资料并封禁当前 handle（账号和声誉保留）。只有身份合约的版主能看到。 */
export function ProfileModeration({ account, handle }: { account: Address; handle: string }) {
  const t = useTranslations('community.profile.moderate')
  const tp = useTranslations('community.actions.vote.phase')
  const { account: viewer, config } = useCommunity()
  const writer = useWriter()
  const [reason, setReason] = useState('')
  if (!viewer?.profileModerator) return null

  const run = () =>
    writer.run(async ({ write }) => {
      let reasonHash: Hex = zeroHash
      if (reason.trim()) {
        const response = await fetch('/api/community/blobs', { method: 'POST', body: JSON.stringify({ kind: 'note', text: reason.trim() }) })
        const json = (await response.json()) as { hash?: Hex; error?: string }
        if (!response.ok || !json.hash) throw new Error(json.error ?? response.statusText)
        reasonHash = json.hash
      }
      await write({ address: config!.contracts.identity, abi: motifIdentityAbi, functionName: 'moderateProfile', args: [account, reasonHash] })
    })

  return (
    <div className="space-y-3 rounded-[var(--radius-card)] border border-line p-5 text-[13.5px]">
      <p className="text-[12px] tracking-wide text-ink-faint uppercase">{t('label')}</p>
      <p className="text-ink-muted">{t('lead', { handle })}</p>
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
        disabled={writer.busy || reason.trim() === ''}
        className="rounded-full border border-danger/50 px-4 py-1.5 text-danger transition-colors duration-150 hover:border-danger disabled:opacity-40"
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
