/** 链上时间（秒）的展示：相对时间以最新区块的时间为“现在”，本地链被快进过也不会错。 */
export function relativeTime(target: number, now: number, locale: string): string {
  const diff = target - now
  const abs = Math.abs(diff)
  const format = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  if (abs < 60) return format.format(Math.round(diff), 'second')
  if (abs < 3600) return format.format(Math.round(diff / 60), 'minute')
  if (abs < 86400) return format.format(Math.round(diff / 3600), 'hour')
  return format.format(Math.round(diff / 86400), 'day')
}

export function formatDate(seconds: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(seconds * 1000))
}
