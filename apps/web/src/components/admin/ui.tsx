import type { ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { SITE_TIME_ZONE } from '@/lib/site'

/* 管理后台各页共用的小件：表格样式、分段筛选、翻页、读查询参数、时间格式。全部是服务端组件能直接用的。 */

// 表格在窄屏上横向滚动：外层负责滚动和圆角，表格自己定最小宽度（每张表列数不同，由页面给）。
// relative 不能省：表头里的 sr-only 是绝对定位的，外层不定位它就不归这个滚动容器裁，
// 会在手机上把整页撑到表格那么宽。
export const tableWrap = 'relative overflow-x-auto rounded-[var(--radius-card)] border border-line'
export const tableBase = 'w-full text-left text-[13px]'
export const tableHead = 'border-b border-line text-[12px] text-ink-faint'
export const th = 'px-4 py-2.5 font-normal whitespace-nowrap'
export const td = 'px-4 py-2.5 align-top'
export const tableBody = 'divide-y divide-line'

// 和登录表单同一个样子的输入框。那边的常量在客户端模块里，服务端组件拿不到它的值，所以这里单独写一份。
export const inputField = 'w-full rounded-lg border border-line bg-sunken px-3 py-2 text-[14px] placeholder:text-ink-faint focus:border-line-strong focus:outline-none'

/** 查询参数可能重复出现（?q=a&q=b），只认第一个。 */
export const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

/** 只接受列出来的几个值，其他的回到默认值。 */
export const pick = <T extends string>(value: string | undefined, options: readonly T[], fallback: T): T =>
  value !== undefined && (options as readonly string[]).includes(value) ? (value as T) : fallback

/** ?page= 读成页码：不是正整数就当第 1 页（超出末页由查询那边收回来）。 */
export function pageOf(value: string | undefined): number {
  const page = Number(value)
  return Number.isSafeInteger(page) && page >= 1 ? page : 1
}

/** 拼带查询参数的站内地址：空值和默认值不写进链接。 */
export function hrefWith(pathname: string, query: Record<string, string | number | null | undefined>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== null && value !== undefined && value !== '') params.set(key, String(value))
  }
  const search = params.toString()
  return search ? `${pathname}?${search}` : pathname
}

export function dateTimeFormat(locale: Locale): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short', timeZone: SITE_TIME_ZONE })
}

/** 'YYYY-MM-DD'（已经是北京时间的日期）显示成「11/9」：当成 UTC 的零点再按 UTC 格式化，不会被时区挪到前一天。 */
export function dayFormat(locale: Locale): (day: string) => string {
  const format = new Intl.DateTimeFormat(locale, { month: 'numeric', day: 'numeric', timeZone: 'UTC' })
  return (day) => format.format(new Date(`${day}T00:00:00Z`))
}

/** 字节数写成人看的大小：1 位小数，到 GB 为止。 */
export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'] as const
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${unit === 0 ? value : value.toFixed(1)} ${units[unit]}`
}

/** 分段选择（状态、时间范围）：每一段是一个链接，当前的那段反白。和排行榜页的是同一个样子。 */
export function Segmented({ label, options }: { label: string; options: { href: string; label: ReactNode; active: boolean }[] }) {
  return (
    <nav aria-label={label} className="inline-flex max-w-full flex-wrap rounded-[20px] border border-line p-0.5">
      {options.map((option) => (
        <Link
          key={option.href}
          href={option.href}
          aria-current={option.active ? 'page' : undefined}
          className="rounded-full px-3.5 py-1.5 text-[13px] whitespace-nowrap text-ink-muted transition-colors duration-(--duration-fast) hover:text-ink aria-[current=page]:bg-ink aria-[current=page]:text-canvas"
        >
          {option.label}
        </Link>
      ))}
    </nav>
  )
}

const pagerLink = 'rounded-full border border-line px-3.5 py-1.5 text-[13px] text-ink-muted transition-colors duration-(--duration-fast) hover:border-line-strong hover:text-ink'
const pagerOff = 'rounded-full border border-line px-3.5 py-1.5 text-[13px] text-ink-faint opacity-50'

/** 翻页：只有一页时不显示。上一页 / 下一页是普通链接，页码在查询参数里，能收藏、能后退。 */
export async function Pagination({ locale, page, pageCount, total, hrefOf }: { locale: Locale; page: number; pageCount: number; total: number; hrefOf: (page: number) => string }) {
  if (pageCount <= 1) return null
  const t = await getTranslations({ locale, namespace: 'admin.pagination' })
  return (
    <nav aria-label={t('nav')} className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-[13px] text-ink-faint tabular-nums">{t('summary', { page, pages: pageCount, total })}</span>
      <span className="flex gap-2">
        {page > 1 ? (
          <Link href={hrefOf(page - 1)} rel="prev" className={pagerLink}>
            {t('previous')}
          </Link>
        ) : (
          <span aria-disabled="true" className={pagerOff}>
            {t('previous')}
          </span>
        )}
        {page < pageCount ? (
          <Link href={hrefOf(page + 1)} rel="next" className={pagerLink}>
            {t('next')}
          </Link>
        ) : (
          <span aria-disabled="true" className={pagerOff}>
            {t('next')}
          </span>
        )}
      </span>
    </nav>
  )
}

/** 状态标记：一个小圆点加文字，颜色不是唯一的信息。 */
export function StatusText({ tone, children }: { tone: 'success' | 'pending' | 'danger' | 'muted'; children: ReactNode }) {
  const color = { success: 'text-success', pending: 'text-pending', danger: 'text-danger', muted: 'text-ink-faint' }[tone]
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap ${color}`}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  )
}

/**
 * 两列的「名称 — 值」清单（系统状态、用户资料）：和数据格一样用 1px 的间隙当分隔线。
 * 奇数项时补一个空格子，不然最后一行右边会露出一块分隔线的底色。
 */
export function FactList({ rows }: { rows: { label: string; value: ReactNode; detail?: ReactNode }[] }) {
  return (
    <dl className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line text-[13.5px] md:grid-cols-2">
      {rows.map((row) => (
        <div key={row.label} className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1 bg-canvas px-5 py-3.5">
          <dt className="text-ink-muted">{row.label}</dt>
          <dd className="flex min-w-0 flex-wrap items-baseline justify-end gap-x-2.5 gap-y-1 text-right tabular-nums">
            {row.detail && <span className="min-w-0 text-[12.5px] break-words text-ink-faint">{row.detail}</span>}
            {row.value}
          </dd>
        </div>
      ))}
      {rows.length % 2 === 1 && <div aria-hidden className="hidden bg-canvas md:block" />}
    </dl>
  )
}

// 仓库的来源。lib/repos 以后加了新的来源，这里不认识的就原样显示，不会因为缺一条翻译整页报错。
export const REPO_SOURCES = ['empty', 'github', 'fork', 'item', 'studio'] as const
export type KnownRepoSource = (typeof REPO_SOURCES)[number]
export const knownRepoSource = (source: string): KnownRepoSource | null => ((REPO_SOURCES as readonly string[]).includes(source) ? (source as KnownRepoSource) : null)
