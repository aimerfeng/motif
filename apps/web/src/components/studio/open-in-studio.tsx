'use client'

import type { ParamValues } from '@motif/schema/core'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'

/** 记住浏览器开过的会话（工作台首页的「最近」列表用）。 */
export const RECENT_KEY = 'motif-studio-sessions'
/** 新会话的第一句话：建好会话后在工作台页里自动发出去。 */
export const PENDING_KEY = (id: string) => `motif-studio-pending:${id}`

export function rememberSession(id: string) {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as unknown
    const ids = Array.isArray(list) ? list.filter((value): value is string => typeof value === 'string' && value !== id) : []
    localStorage.setItem(RECENT_KEY, JSON.stringify([id, ...ids].slice(0, 20)))
  } catch {
    // 隐私模式或存储被禁用时不记，不影响使用。
  }
}

/** 建一个会话（可以基于某个条目、带上调好的参数和第一句话），然后进入工作台。 */
export async function openStudio(router: ReturnType<typeof useRouter>, options: { base?: string; values?: ParamValues; prompt?: string }): Promise<string | null> {
  const response = await fetch('/api/studio/sessions', { method: 'POST', body: JSON.stringify({ base: options.base ?? null, values: options.values }) })
  const json = (await response.json()) as { id?: string; error?: string }
  if (!response.ok || !json.id) return json.error ?? response.statusText
  rememberSession(json.id)
  if (options.prompt) {
    try {
      sessionStorage.setItem(PENDING_KEY(json.id), options.prompt)
    } catch {
      // 存不了就让用户进去以后再说一遍。
    }
  }
  router.push(`/studio/${json.id}`)
  return null
}

/** 详情页的「在工作台里改」：带着当前调好的参数进入工作台。 */
export function OpenInStudio({ slug, values }: { slug: string; values: ParamValues }) {
  const t = useTranslations('studio')
  const router = useRouter()
  const [state, setState] = useState<'idle' | 'busy' | 'failed'>('idle')
  return (
    <button
      type="button"
      disabled={state === 'busy'}
      onClick={() => {
        setState('busy')
        void openStudio(router, { base: slug, values }).then((error) => setState(error ? 'failed' : 'busy'))
      }}
      className="inline-flex items-center gap-2 rounded-lg border border-line px-3.5 py-2 text-[13px] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink disabled:opacity-60"
      data-testid="open-in-studio"
    >
      {state === 'busy' ? t('open.busy') : state === 'failed' ? t('open.failed') : t('open.label')}
    </button>
  )
}
