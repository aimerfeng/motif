'use client'

import { useTranslations } from 'next-intl'
import { useState, type ReactNode } from 'react'
import { useCommunity } from './wallet'

/**
 * 需要钱包的操作区：没连钱包、网络不对时先给出下一步该做什么，满足条件后才渲染里面的内容。
 * compact：嵌在侧栏或卡片里时用的小尺寸。
 */
export function ConnectGate({ children, compact = false }: { children: ReactNode; compact?: boolean }) {
  const t = useTranslations('community.wallet')
  const { status, wallets, connect, switchChain, config } = useCommunity()
  const [error, setError] = useState<string | null>(null)

  if (status === 'connected') return <>{children}</>

  const attempt = (action: () => Promise<void>) => {
    setError(null)
    action().catch((cause: unknown) => setError(cause instanceof Error ? cause.message : String(cause)))
  }

  let body: ReactNode
  if (status === 'loading') body = <p className="text-ink-faint">{t('loading')}</p>
  else if (status === 'disabled') body = <p className="text-ink-muted">{t('disabled')}</p>
  else if (status === 'no-wallet') body = <p className="text-ink-muted">{t('noWallet')}</p>
  else if (status === 'wrong-chain')
    body = (
      <GateAction label={t('switchTo', { chain: config?.chainName ?? '' })} onClick={() => attempt(switchChain)}>
        {t('wrongChainLead')}
      </GateAction>
    )
  else
    body = (
      <GateAction label={status === 'connecting' ? t('connecting') : t('connect')} onClick={() => attempt(() => connect(wallets[0]))} disabled={status === 'connecting'}>
        {t('connectLead')}
      </GateAction>
    )

  return (
    <div className={`rounded-[var(--radius-card)] border border-line bg-sunken text-[14px] leading-relaxed ${compact ? 'p-4' : 'p-6'}`} data-testid="connect-gate">
      {body}
      {error && (
        <p role="alert" className="mt-3 text-[12.5px] text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

function GateAction({ children, label, onClick, disabled }: { children: ReactNode; label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p className="text-ink-muted">{children}</p>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="rounded-full bg-ink px-4 py-1.5 text-[13.5px] font-medium text-canvas transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
      >
        {label}
      </button>
    </div>
  )
}
