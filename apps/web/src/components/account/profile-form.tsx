'use client'

import { useTranslations } from 'next-intl'
import { useState, type FormEvent } from 'react'
import { buttonPrimary, SectionHeader } from '@/components/community/ui'
import { useRouter } from '@/i18n/navigation'
import { api, errorText } from '@/lib/api-client'
import { field } from './auth-forms'
import { refreshMe } from './me'

/** 资料：显示名、handle（主页地址）、一句话简介。 */
export function ProfileForm({ initial }: { initial: { name: string; handle: string; bio: string } }) {
  const t = useTranslations('account.profile')
  const router = useRouter()
  const [name, setName] = useState(initial.name)
  const [handle, setHandle] = useState(initial.handle)
  const [bio, setBio] = useState(initial.bio)
  const [state, setState] = useState<{ kind: 'idle' | 'busy' | 'saved' } | { kind: 'error'; message: string }>({ kind: 'idle' })
  const dirty = name !== initial.name || handle !== initial.handle || bio !== initial.bio

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setState({ kind: 'busy' })
    try {
      await api('/api/account/profile', { method: 'PATCH', body: { name, handle, bio } })
      setState({ kind: 'saved' })
      void refreshMe()
      router.refresh()
    } catch (error) {
      setState({ kind: 'error', message: errorText(error) })
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-5">
      <SectionHeader title={t('title')} />
      <label className="block">
        <span className="text-[13px] font-medium">{t('name')}</span>
        <input required maxLength={60} value={name} onChange={(event) => setName(event.target.value)} className={`mt-2 ${field}`} />
      </label>
      <label className="block">
        <span className="text-[13px] font-medium">{t('handle')}</span>
        <span className="mt-2 flex items-center rounded-lg border border-line bg-sunken focus-within:border-line-strong">
          <span className="pl-3 font-mono text-[13px] text-ink-faint">/u/</span>
          <input
            required
            maxLength={32}
            pattern="[a-z0-9][a-z0-9\-]{1,30}[a-z0-9]"
            value={handle}
            onChange={(event) => setHandle(event.target.value.toLowerCase())}
            className="w-full bg-transparent py-2.5 pr-3 pl-0.5 font-mono text-[14px] focus:outline-none"
          />
        </span>
        <span className="mt-1.5 block text-[12px] text-ink-faint">{t('handleHint')}</span>
      </label>
      <label className="block">
        <span className="text-[13px] font-medium">{t('bio')}</span>
        <textarea rows={3} maxLength={160} value={bio} onChange={(event) => setBio(event.target.value)} className={`mt-2 resize-y ${field}`} />
      </label>
      <div className="flex items-center gap-4">
        <button type="submit" disabled={!dirty || state.kind === 'busy'} className={buttonPrimary}>
          {state.kind === 'busy' ? t('saving') : t('save')}
        </button>
        {state.kind === 'saved' && !dirty && <span className="text-[13px] text-success">{t('saved')}</span>}
        {state.kind === 'error' && <span className="text-[13px] text-danger">{state.message}</span>}
      </div>
    </form>
  )
}
