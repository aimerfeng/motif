'use client'

import { useTranslations } from 'next-intl'
import { useState, type FormEvent } from 'react'
import { buttonPrimary } from '@/components/community/ui'
import { useRouter } from '@/i18n/navigation'
import { api, errorText } from '@/lib/api-client'
import { field } from './auth-forms'
import { refreshMe } from './me'

/** 管理员加减积分：用户（handle 或邮箱）、数量（负数是扣）、原因。defaultUser 是用户详情页预先填好的那个人。 */
export function GrantCredits({ defaultUser = '' }: { defaultUser?: string }) {
  const t = useTranslations('admin.grant')
  const router = useRouter()
  const [user, setUser] = useState(defaultUser)
  const [delta, setDelta] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setMessage(null)
    try {
      const { balance } = await api<{ balance: number }>('/api/admin/credits', { body: { user, delta: Number(delta), note } })
      setMessage({ ok: true, text: t('done', { balance }) })
      setDelta('')
      setNote('')
      void refreshMe()
      router.refresh()
    } catch (cause) {
      setMessage({ ok: false, text: errorText(cause) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="grid gap-3 sm:grid-cols-[1fr_140px_1fr_auto] sm:items-end">
      <label className="block">
        <span className="text-[12.5px] text-ink-muted">{t('user')}</span>
        <input required value={user} onChange={(event) => setUser(event.target.value)} placeholder="handle / email" className={`mt-1.5 ${field}`} />
      </label>
      <label className="block">
        <span className="text-[12.5px] text-ink-muted">{t('delta')}</span>
        <input required type="number" step={1} value={delta} onChange={(event) => setDelta(event.target.value)} placeholder="500" className={`mt-1.5 font-mono ${field}`} />
      </label>
      <label className="block">
        <span className="text-[12.5px] text-ink-muted">{t('note')}</span>
        <input required maxLength={200} value={note} onChange={(event) => setNote(event.target.value)} className={`mt-1.5 ${field}`} />
      </label>
      <button type="submit" disabled={busy} className={buttonPrimary}>
        {t('submit')}
      </button>
      {message && <p className={`text-[13px] sm:col-span-4 ${message.ok ? 'text-success' : 'text-danger'}`}>{message.text}</p>}
    </form>
  )
}
