import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['zh-CN', 'en'],
  defaultLocale: 'zh-CN',
  // 默认语言不带前缀：/market 是中文，/en/market 是英文。
  localePrefix: 'as-needed',
})

export type Locale = (typeof routing.locales)[number]
