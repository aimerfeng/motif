'use client'

import { motifCurationAbi } from '@motif/contracts'
import { useTranslations } from 'next-intl'
import { useWriter } from './use-writer'
import { useCommunity } from './wallet'

/** 审核合约的版主可以在垃圾投稿潮时暂停新投稿；进行中的审核、撤回和关闭不受影响。其他人看不到这个开关。 */
export function PauseControl({ paused }: { paused: boolean }) {
  const t = useTranslations('community.pause')
  const { account, config } = useCommunity()
  const writer = useWriter()
  if (!account?.pauser || !config) return null
  const toggle = () =>
    writer.run(async ({ write }) => {
      await write({ address: config.contracts.curation, abi: motifCurationAbi, functionName: paused ? 'unpause' : 'pause', args: [] })
    })
  return (
    <div className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-card)] border border-line px-5 py-4 text-[13.5px]">
      <p className="text-ink-muted">{paused ? t('pausedLead') : t('lead')}</p>
      <button
        type="button"
        onClick={() => void toggle()}
        disabled={writer.busy}
        className={`rounded-full border px-4 py-1.5 transition-colors duration-150 disabled:opacity-40 ${paused ? 'border-line-strong text-ink hover:border-ink' : 'border-danger/50 text-danger hover:border-danger'}`}
      >
        {writer.busy ? t('busy') : paused ? t('resume') : t('pause')}
      </button>
      {writer.error && (
        <p role="alert" className="w-full text-[12.5px] text-danger">
          {writer.error}
        </p>
      )}
    </div>
  )
}
