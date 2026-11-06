'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { field } from '@/components/account/auth-forms'
import { buttonPrimary, buttonSecondary } from '@/components/community/ui'
import { CodeEditor } from '@/components/studio/code-editor'
import { Link, useRouter } from '@/i18n/navigation'
import { api, errorText } from '@/lib/api-client'

/** 在线改一个文件（新建时 path 为 null，先填路径）。Ctrl/⌘+S 保存。 */
export function FileEditor({ repoId, base, path: initialPath, initial }: { repoId: string; base: string; path: string | null; initial: string }) {
  const t = useTranslations('repos.editor')
  const router = useRouter()
  const [path, setPath] = useState(initialPath ?? '')
  const [content, setContent] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cancelHref = initialPath ? { pathname: base, query: { path: initialPath } } : base

  const save = async () => {
    if (!path.trim()) {
      setError(t('pathRequired'))
      return
    }
    setBusy(true)
    setError(null)
    try {
      await api(`/api/repos/${repoId}/files`, { method: 'PUT', body: { path: path.trim(), content } })
      router.replace({ pathname: base, query: { path: path.trim().replace(/^\/+/, '') } })
      router.refresh()
    } catch (cause) {
      setError(errorText(cause))
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!initialPath || !window.confirm(t('confirmDelete', { path: initialPath }))) return
    setBusy(true)
    try {
      await api(`/api/repos/${repoId}/files?path=${encodeURIComponent(initialPath)}`, { method: 'DELETE' })
      router.replace(base)
      router.refresh()
    } catch (cause) {
      setError(errorText(cause))
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <div data-theme="dark" className="overflow-hidden rounded-xl border border-line bg-sunken text-ink">
        <div className="flex items-center gap-3 border-b border-line px-3 py-2">
          {initialPath ? (
            <span className="truncate font-mono text-[12.5px] text-ink-muted">{initialPath}</span>
          ) : (
            <input autoFocus placeholder={t('pathPlaceholder')} value={path} onChange={(event) => setPath(event.target.value)} className={`${field} py-1.5 font-mono text-[12.5px]`} />
          )}
        </div>
        <div className="h-[60vh]">
          <CodeEditor path={path || 'file.txt'} value={initial} readOnly={busy} onChange={setContent} onSave={() => void save()} />
        </div>
      </div>
      {error && <p className="text-[13px] text-danger">{error}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" disabled={busy} onClick={() => void save()} className={buttonPrimary} data-testid="save-file">
          {busy ? t('saving') : t('save')}
        </button>
        <Link href={cancelHref} className={buttonSecondary}>
          {t('cancel')}
        </Link>
        {initialPath && (
          <button type="button" disabled={busy} onClick={() => void remove()} className="ml-auto rounded-full px-4 py-2 text-[13.5px] text-danger hover:bg-danger/10 disabled:opacity-40">
            {t('delete')}
          </button>
        )}
      </div>
    </div>
  )
}
