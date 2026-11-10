'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { api, errorText } from '@/lib/api-client'

/**
 * 内容巡查里的「下架」和「恢复」：先确认一次；成功后刷新，这一行就换到另一张表里去了。
 * 下架：仓库变成私有，作者不能自己改回公开。恢复：撤销下架，回到公开。
 */
export function RepoModerationButton({ id, name, action }: { id: string; name: string; action: 'hide' | 'restore' }) {
  const t = useTranslations('admin.contentPage')
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    if (!window.confirm(t(action === 'hide' ? 'confirmHide' : 'confirmRestore', { name }))) return
    setBusy(true)
    setError(null)
    try {
      await api(`/api/admin/repos/${id}`, { body: { action } })
      router.refresh()
    } catch (cause) {
      setError(errorText(cause))
      setBusy(false)
    }
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={busy}
        onClick={() => void submit()}
        className="rounded-md border border-line px-2.5 py-1 text-[12.5px] whitespace-nowrap text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink disabled:opacity-50"
      >
        {t(action)}
      </button>
      {error && <span className="text-[12px] text-danger">{error}</span>}
    </span>
  )
}
