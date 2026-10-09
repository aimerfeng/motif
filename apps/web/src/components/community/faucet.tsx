'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useCommunity } from './wallet'

/** 本地开发链的测试币。只在本地链上出现；链上资产没有任何价值。 */
export function FaucetButton() {
  const t = useTranslations('community.faucet')
  const { status, address, refreshAccount } = useCommunity()
  const router = useRouter()
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'failed'>('idle')

  if (status !== 'connected' || !address) return <p className="text-[13px] text-ink-faint">{t('connectFirst')}</p>

  const claim = async () => {
    setState('busy')
    try {
      const response = await fetch('/api/community/faucet', { method: 'POST', body: JSON.stringify({ address }) })
      if (!response.ok) throw new Error(((await response.json()) as { error?: string }).error ?? response.statusText)
      await refreshAccount()
      router.refresh()
      setState('done')
    } catch (error) {
      console.error(error)
      setState('failed')
    }
  }

  return (
    <button
      type="button"
      onClick={() => void claim()}
      disabled={state === 'busy'}
      className="rounded-full border border-line-strong px-4 py-1.5 text-[13px] text-ink transition-colors duration-150 hover:border-ink disabled:opacity-50"
    >
      {t(state === 'idle' ? 'claim' : state)}
    </button>
  )
}
