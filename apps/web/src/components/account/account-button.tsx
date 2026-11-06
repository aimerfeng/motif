'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useId, useRef, useState } from 'react'
import { CoinsIcon } from '@/components/icons'
import { Link, usePathname } from '@/i18n/navigation'
import { authClient } from '@/lib/auth/client'
import { refreshMe, useMe } from './me'
import { UserAvatar } from './user-avatar'

/** 头部的账号入口：没登录是「登录」，登录了是头像 + 积分，点开是账号菜单。 */
export function AccountButton() {
  const t = useTranslations('account.menu')
  const me = useMe()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
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

  // 换页时收起菜单。
  useEffect(() => setOpen(false), [pathname])

  // 还没问到：占住位置，头部不跳动。
  if (me === undefined) return <span aria-hidden className="h-8 w-16 rounded-full max-sm:w-8" />

  if (me === null) {
    const next = pathname.startsWith('/login') || pathname.startsWith('/signup') ? undefined : pathname
    return (
      <Link
        href={next ? { pathname: '/login', query: { next } } : '/login'}
        className="flex h-8 items-center rounded-full bg-ink px-3.5 text-[13px] font-medium whitespace-nowrap text-canvas transition-opacity duration-150 hover:opacity-90"
        data-testid="sign-in"
      >
        {t('signIn')}
      </Link>
    )
  }

  const item = 'flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-ink-muted transition-colors duration-150 hover:bg-ink/5 hover:text-ink'
  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={t('open')}
        onClick={() => setOpen((value) => !value)}
        className="flex h-8 items-center gap-2 rounded-full border border-line py-0.5 pr-3 pl-0.5 text-[13px] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink aria-expanded:border-line-strong aria-expanded:text-ink max-sm:pr-0.5"
        data-testid="account-button"
      >
        <UserAvatar id={me.id} name={me.name} className="size-[26px] text-[12px]" />
        <span className="font-mono text-[12.5px] tabular-nums max-sm:sr-only" title={t('balance')}>
          {me.balance.toLocaleString()}
        </span>
      </button>
      {open && (
        <div id={panelId} className="absolute top-full right-0 z-50 mt-2 w-64 max-w-[calc(100vw-2.5rem)] rounded-xl border border-line-strong bg-raised p-2 text-[13.5px] shadow-[0_24px_48px_-12px_oklch(0_0_0/0.6)]">
          <div className="flex items-center gap-3 px-2.5 pt-1.5 pb-3">
            <UserAvatar id={me.id} name={me.name} className="size-9 text-[14px]" />
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{me.name}</p>
              <p className="truncate text-[12.5px] text-ink-faint">@{me.handle}</p>
            </div>
          </div>
          <Link href="/account/credits" className={`${item} mb-1 border border-line bg-canvas/40`}>
            <span className="flex items-center gap-2">
              <CoinsIcon className="size-4" />
              {t('credits')}
            </span>
            <span className="font-mono text-[13px] text-ink tabular-nums">{me.balance.toLocaleString()}</span>
          </Link>
          <nav className="flex flex-col">
            <Link href={`/u/${me.handle}`} className={item}>
              {t('repos')}
            </Link>
            <Link href="/repos/new" className={item}>
              {t('newRepo')}
            </Link>
            <Link href="/account" className={item}>
              {t('settings')}
            </Link>
            <Link href="/account/keys" className={item}>
              {t('keys')}
            </Link>
            {me.admin && (
              <Link href="/admin" className={item}>
                {t('admin')}
              </Link>
            )}
          </nav>
          <div className="mt-1 border-t border-line pt-1">
            <button
              type="button"
              className={`${item} w-full`}
              onClick={() => {
                void authClient.signOut().then(() => {
                  setOpen(false)
                  void refreshMe()
                })
              }}
              data-testid="sign-out"
            >
              {t('signOut')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
