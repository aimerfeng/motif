'use client'

import { useLocale } from 'next-intl'
import { useParams } from 'next/navigation'
import { useTransition } from 'react'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing, type Locale } from '@/i18n/routing'

const LABELS: Record<Locale, string> = { 'zh-CN': '中', en: 'EN' }

export function LocaleSwitcher({ label }: { label: string }) {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const [pending, startTransition] = useTransition()

  return (
    <div role="group" aria-label={label} className="flex items-center rounded-lg border border-line p-0.5 text-[12px]" data-pending={pending || undefined}>
      {routing.locales.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={option === locale}
          onClick={() =>
            startTransition(() => {
              // @ts-expect-error -- 动态路由的参数原样带回去即可，next-intl 的类型要求具体路由。
              router.replace({ pathname, params }, { locale: option })
            })
          }
          className="rounded-md px-2 py-1 text-ink-faint transition-colors duration-150 hover:text-ink aria-pressed:bg-white/10 aria-pressed:text-ink"
        >
          {LABELS[option]}
        </button>
      ))}
    </div>
  )
}
