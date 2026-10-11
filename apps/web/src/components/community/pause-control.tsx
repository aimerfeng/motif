'use client'

import { motifCurationAbi } from '@motif/contracts'
import { useTranslations } from 'next-intl'
import { useWriter } from './use-writer'
import { useCommunity } from './wallet'

/**
 * 审核合约的版主可以在垃圾投稿潮时暂停新投稿；进行中的审核、撤回和关闭不受影响。
 * 放在社区导航那一行的一个小按钮，其他人看不到；说明放在 title 里，不占版面。
 */
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
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => void toggle()}
        disabled={writer.busy}
        title={paused ? t('pausedLead') : t('lead')}
        className={`h-7 rounded-full border px-3 text-[12px] transition-colors duration-150 disabled:opacity-40 ${paused ? 'border-line-strong text-ink hover:border-ink' : 'border-danger/40 text-danger hover:border-danger'}`}
      >
        {writer.busy ? t('busy') : paused ? t('resume') : t('pause')}
      </button>
      {writer.error && (
        <span role="alert" className="text-[12px] text-danger">
          {writer.error}
        </span>
      )}
    </span>
  )
}
