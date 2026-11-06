'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useMe } from '@/components/account/me'
import { buttonPrimary, buttonSecondary } from '@/components/community/ui'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { api, errorText } from '@/lib/api-client'
import type { CreditOrder } from '@/lib/credits/orders'
import { formatAmount, type CreditPackage } from '@/lib/credits/pricing'

/** 积分套餐：一排卡片，点「购买」生成待付款订单（docs/decisions/0009 第 6 节）。 */
export function PackageGrid({ packages, support }: { packages: CreditPackage[]; support: string | null }) {
  const t = useTranslations('credits.packages')
  const me = useMe()
  const router = useRouter()
  const pathname = usePathname()
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<CreditOrder | null>(null)

  const buy = async (pack: CreditPackage) => {
    setBusy(pack.id)
    setError(null)
    try {
      const { order } = await api<{ order: CreditOrder }>('/api/credits/orders', { body: { packageId: pack.id } })
      setOrder(order)
      router.refresh()
    } catch (cause) {
      setError(errorText(cause))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {packages.map((pack) => (
          <div key={pack.id} className={`flex flex-col gap-5 p-6 ${pack.featured ? 'bg-raised' : 'bg-canvas'}`}>
            <div>
              <p className="flex items-center gap-2 text-[13px] text-ink-muted">
                {t(`names.${pack.id}`)}
                {pack.featured && <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-medium text-canvas">{t('popular')}</span>}
              </p>
              <p className="mt-3 font-display text-[30px] leading-none font-semibold tracking-[-0.02em] tabular-nums">{pack.credits.toLocaleString()}</p>
              <p className="mt-1.5 text-[12.5px] text-ink-faint">{t('credits')}</p>
            </div>
            <div className="mt-auto flex items-end justify-between gap-3">
              <div>
                <p className="font-display text-[20px] font-semibold tabular-nums">{formatAmount(pack.amount)}</p>
                {pack.bonus > 0 && <p className="text-[12px] text-success">{t('bonus', { percent: Math.round(pack.bonus * 100) })}</p>}
              </div>
              {me === null ? (
                <Link href={{ pathname: '/login', query: { next: pathname } }} className={buttonSecondary}>
                  {t('signInToBuy')}
                </Link>
              ) : (
                <button type="button" disabled={me === undefined || busy !== null} onClick={() => void buy(pack)} className={pack.featured ? buttonPrimary : buttonSecondary} data-testid={`buy-${pack.id}`}>
                  {busy === pack.id ? t('working') : t('buy')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {error && <p className="text-[13px] text-danger">{error}</p>}
      {order && <PayInstructions order={order} support={support} />}
    </div>
  )
}

/** 付款通道还没接：告诉用户怎么付、订单号是什么。 */
export function PayInstructions({ order, support }: { order: Pick<CreditOrder, 'id' | 'amount' | 'credits'>; support: string | null }) {
  const t = useTranslations('credits.packages')
  return (
    <div role="status" className="rounded-[var(--radius-card)] border border-line-strong bg-raised p-5 text-[13.5px] leading-relaxed">
      <p className="font-medium text-ink">{t('created', { id: order.id })}</p>
      <p className="mt-2 text-ink-muted">{support ? t('payManual', { amount: formatAmount(order.amount), credits: order.credits.toLocaleString(), id: order.id, support }) : t('payManualNoContact', { amount: formatAmount(order.amount), id: order.id })}</p>
    </div>
  )
}
