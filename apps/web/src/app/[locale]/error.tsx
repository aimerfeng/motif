'use client'

import { useTranslations } from 'next-intl'
import { useEffect } from 'react'

/** 页面渲染出错时的兜底：保留站点外壳，可以原地重试。 */
export default function PageError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const t = useTranslations('pageError')
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="mx-auto flex min-h-[70dvh] max-w-2xl flex-col justify-center px-5 sm:px-8" role="alert">
      <h1 className="font-display text-[36px] leading-[1.1] font-semibold tracking-[-0.03em]">{t('title')}</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-pretty text-ink-muted">{t('lead')}</p>
      {error.digest && <p className="mt-3 font-mono text-[12px] text-ink-faint">{error.digest}</p>}
      <button
        type="button"
        onClick={retry}
        className="mt-8 self-start rounded-full bg-ink px-4 py-2 text-[14px] font-medium text-canvas transition-opacity duration-150 hover:opacity-90"
      >
        {t('retry')}
      </button>
    </main>
  )
}
