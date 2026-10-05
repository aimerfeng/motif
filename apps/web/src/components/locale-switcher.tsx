'use client'

import { useLocale } from 'next-intl'
import { useTransition } from 'react'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'

const LABELS: Record<Locale, string> = { 'zh-CN': '中', en: 'EN' }

export function LocaleSwitcher({ label }: { label: string }) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()

  // 换语言时带上查询参数和 hash：市场的筛选、调好的参数都不能因为换语言丢掉。
  const switchTo = (option: Locale) => {
    const { search, hash } = window.location
    startTransition(() => router.replace(`${pathname}${search}${hash}`, { locale: option, scroll: false }))
  }

  return (
    <div role="group" aria-label={label} className="flex items-center rounded-lg border border-line p-0.5 text-[12px]" data-pending={pending || undefined}>
      {routing.locales.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={option === locale}
          onClick={() => switchTo(option)}
          className="rounded-md px-2 py-1 text-ink-faint transition-colors duration-150 hover:text-ink aria-pressed:bg-white/10 aria-pressed:text-ink"
        >
          {LABELS[option]}
        </button>
      ))}
    </div>
  )
}
