'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { WalletIcon } from '@/components/icons'
import { Link } from '@/i18n/navigation'
import { shortAddress } from '@/lib/community/shared'
import { Avatar } from './people'
import { useCommunity, type DiscoveredWallet } from './wallet'

/** 头部的钱包入口。社区没有开放（链没配置或连不上）时什么都不显示。 */
export function WalletButton() {
  const t = useTranslations('community.wallet')
  const { status, wallets, address, account, connect, disconnect, switchChain, config } = useCommunity()
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('pointerdown', onPointer)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (status === 'loading' || status === 'disabled') return null

  const attempt = async (action: () => Promise<void>) => {
    setError(null)
    try {
      await action()
      setOpen(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    }
  }

  // 手机上头部很挤：只显示头像或钱包图标，文字留给读屏。
  const trigger =
    status === 'connected' || status === 'wrong-chain' ? (
      <>
        <Avatar address={address!} className="size-5" />
        <span className={`max-sm:sr-only ${account?.handle ? '' : 'font-mono text-[12.5px]'}`}>{account?.handle ? `@${account.handle}` : shortAddress(address!)}</span>
        {status === 'wrong-chain' && <span className="size-1.5 rounded-full bg-danger" aria-label={t('wrongChain')} />}
      </>
    ) : (
      <>
        <WalletIcon className="size-4 sm:hidden" />
        <span className="max-sm:sr-only">{status === 'connecting' ? t('connecting') : t('connect')}</span>
      </>
    )

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        data-testid="wallet-button"
        className="flex h-8 items-center gap-2 rounded-full border border-line px-3 text-[13px] whitespace-nowrap text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink aria-expanded:border-line-strong aria-expanded:text-ink max-sm:w-8 max-sm:justify-center max-sm:px-0"
      >
        {trigger}
      </button>
      {open && (
        <div id={panelId} className="absolute top-full right-0 z-50 mt-2 w-72 max-w-[calc(100vw-2.5rem)] rounded-xl border border-line-strong bg-raised p-2 text-[13.5px] shadow-[0_24px_48px_-12px_oklch(0_0_0/0.6)]">
          {status === 'no-wallet' && <p className="px-2 py-2 leading-relaxed text-ink-muted">{t('noWallet')}</p>}
          {(status === 'disconnected' || status === 'connecting' || status === 'no-wallet') && wallets.length > 0 && (
            <WalletList wallets={wallets} onPick={(wallet) => void attempt(() => connect(wallet))} label={t('choose')} />
          )}
          {status === 'wrong-chain' && (
            <MenuButton onClick={() => void attempt(switchChain)} tone="danger">
              {t('switchTo', { chain: config?.chainName ?? '' })}
            </MenuButton>
          )}
          {(status === 'connected' || status === 'wrong-chain') && address && (
            <>
              <div className="flex items-center gap-3 px-2 py-2">
                <Avatar address={address} className="size-9" />
                <div className="min-w-0">
                  <p className="truncate font-medium">{account?.handle ? `@${account.handle}` : t('noHandle')}</p>
                  <p className="truncate font-mono text-[11.5px] text-ink-faint" title={address}>
                    {shortAddress(address)}
                  </p>
                </div>
              </div>
              <div className="my-1 border-t border-line" />
              <MenuLink href={`/community/u/${account?.handle ?? address}`} onNavigate={() => setOpen(false)}>
                {t('myPage')}
              </MenuLink>
              <MenuLink href="/community/profile" onNavigate={() => setOpen(false)}>
                {account?.registered ? t('editProfile') : t('createProfile')}
              </MenuLink>
              <MenuLink href="/community/submit" onNavigate={() => setOpen(false)}>
                {t('submit')}
              </MenuLink>
              {account?.curator && (
                <MenuLink href="/community/review" onNavigate={() => setOpen(false)}>
                  {t('review')}
                </MenuLink>
              )}
              <div className="my-1 border-t border-line" />
              <MenuButton onClick={disconnect}>{t('disconnect')}</MenuButton>
            </>
          )}
          {error && (
            <p role="alert" className="px-2 py-2 text-[12.5px] text-danger">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function WalletList({ wallets, onPick, label }: { wallets: DiscoveredWallet[]; onPick: (wallet: DiscoveredWallet) => void; label: string }) {
  return (
    <div>
      <p className="px-2 pt-1 pb-2 text-[12px] text-ink-faint">{label}</p>
      {wallets.map((wallet) => (
        <MenuButton key={wallet.id} onClick={() => onPick(wallet)}>
          {wallet.icon ? <img src={wallet.icon} alt="" className="size-5 rounded" /> : <span className="size-5 rounded bg-white/10" aria-hidden />}
          {wallet.name}
        </MenuButton>
      ))}
    </div>
  )
}

function MenuButton({ children, onClick, tone }: { children: ReactNode; onClick: () => void; tone?: 'danger' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors duration-150 hover:bg-white/5 ${tone === 'danger' ? 'text-danger' : 'text-ink-muted hover:text-ink'}`}
    >
      {children}
    </button>
  )
}

function MenuLink({ href, children, onNavigate }: { href: string; children: ReactNode; onNavigate: () => void }) {
  return (
    <Link href={href} onClick={onNavigate} className="block rounded-lg px-2 py-2 text-ink-muted transition-colors duration-150 hover:bg-white/5 hover:text-ink">
      {children}
    </Link>
  )
}
