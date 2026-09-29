import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { routing, type Locale } from './routing'

/** 校验路由参数里的语言，不支持的语言返回 404；并为静态渲染登记当前语言。 */
export function resolveRouteLocale(value: string): Locale {
  if (!hasLocale(routing.locales, value)) notFound()
  setRequestLocale(value)
  return value
}
