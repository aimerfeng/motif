'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { refreshMe } from '@/components/account/me'
import { useRouter } from '@/i18n/navigation'
import { api, errorText } from '@/lib/api-client'

/** 订单上的按钮：用户取消自己的待付款订单；管理员确认收款或取消。 */
export function OrderActions({ id, admin = false }: { id: string; admin?: boolean }) {
  const t = useTranslations('credits.orders')
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const act = async (action: 'paid' | 'cancel') => {
    if (action === 'paid' && !window.confirm(t('confirmPaid', { id }))) return
    setBusy(true)
    setError(null)
    try {
      if (admin) await api(`/api/admin/orders/${id}`, { body: { action } })
      else await api(`/api/credits/orders/${id}`, { method: 'DELETE' })
      void refreshMe()
      router.refresh()
    } catch (cause) {
      setError(errorText(cause))
      setBusy(false)
    }
  }

  const button = 'rounded-md border border-line px-2.5 py-1 text-[12.5px] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink disabled:opacity-50'
  return (
    <span className="inline-flex flex-wrap items-center justify-end gap-1.5">
      {admin && (
        <button type="button" disabled={busy} className={`${button} border-success/40 text-success`} onClick={() => void act('paid')}>
          {t('markPaid')}
        </button>
      )}
      <button type="button" disabled={busy} className={button} onClick={() => void act('cancel')}>
        {t('cancel')}
      </button>
      {error && <span className="w-full text-right text-[12px] text-danger">{error}</span>}
    </span>
  )
}
