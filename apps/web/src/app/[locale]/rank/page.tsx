import { KINDS, type Kind } from '@motif/schema/core'
import type { Metadata } from 'next'
import { connection } from 'next/server'
import { getTranslations } from 'next-intl/server'
import { ItemCard } from '@/components/market/item-card'
import { RankChange, RankPoster, Sparkline } from '@/components/rank/rank-parts'
import { resolveRouteLocale } from '@/i18n/locale'
import { Link } from '@/i18n/navigation'
import { alternatesFor } from '@/lib/site'
import { leaderboard, type LeaderEntry } from '@/lib/stats/board'
import { RANK_BOARDS, RANK_PERIODS, STATS_SINCE, type RankBoard, type RankPeriod } from '@/lib/stats/events'

export async function generateMetadata({ params }: PageProps<'/[locale]/rank'>): Promise<Metadata> {
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'rank' })
  return { title: t('title'), alternates: alternatesFor('/rank') }
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)
const pick = <T extends string>(value: string | undefined, options: readonly T[], fallback: T): T => (value !== undefined && (options as readonly string[]).includes(value) ? (value as T) : fallback)

interface View {
  period: RankPeriod
  board: RankBoard
  kind: Kind | null
}

/** 默认值不写进链接。 */
function hrefOf({ period, board, kind }: View): string {
  const params = new URLSearchParams()
  if (period !== '7d') params.set('period', period)
  if (board !== 'score') params.set('board', board)
  if (kind) params.set('kind', kind)
  const query = params.toString()
  return query ? `/rank?${query}` : '/rank'
}

/** 排行榜（docs/decisions/0010 第 4 节）：按真实使用排名，前三名大图，其余一行一个，带近 14 天走势。 */
export default async function RankPage({ params, searchParams }: PageProps<'/[locale]/rank'>) {
  await connection()
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'rank' })
  const tm = await getTranslations({ locale, namespace: 'market' })
  const search = await searchParams
  const kindParam = first(search.kind)
  const view: View = {
    period: pick<RankPeriod>(first(search.period), RANK_PERIODS, '7d'),
    board: pick<RankBoard>(first(search.board), RANK_BOARDS, 'score'),
    kind: kindParam !== undefined && (KINDS as readonly string[]).includes(kindParam) ? (kindParam as Kind) : null,
  }
  const { entries, picks } = await leaderboard({ ...view, locale })
  const since = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${STATS_SINCE}T00:00:00Z`))
  const number = new Intl.NumberFormat(locale)
  const podium = entries.slice(0, 3)
  const rest = entries.slice(3)
  const showChange = view.period !== 'all'
  const valueLabel = view.board === 'score' ? t('metrics.score') : t(`metrics.${view.board}`)

  return (
    <main className="mx-auto max-w-[1400px] px-5 pt-12 pb-24 sm:px-8 sm:pt-14">
      <div className="max-w-2xl">
        <h1 className="font-display text-[44px] leading-[1.05] font-semibold tracking-[-0.03em] sm:text-[56px]">{t('title')}</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-pretty text-ink-muted">{t('lead', { since })}</p>
      </div>

      <div className="mt-10 flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Segmented label={t('boardsLabel')} options={RANK_BOARDS.map((board) => ({ href: hrefOf({ ...view, board }), label: t(`boards.${board}`), active: board === view.board }))} />
          <Segmented label={t('periodsLabel')} options={RANK_PERIODS.map((period) => ({ href: hrefOf({ ...view, period }), label: t(`periods.${period}`), active: period === view.period }))} />
        </div>
        <nav aria-label={t('kindsLabel')} className="-mx-1 flex flex-wrap gap-1">
          {[null, ...KINDS].map((kind) => (
            <Link
              key={kind ?? 'all'}
              href={hrefOf({ ...view, kind })}
              aria-current={kind === view.kind ? 'page' : undefined}
              className="rounded-full px-3.5 py-1.5 text-[13px] text-ink-muted transition-colors duration-(--duration-fast) hover:bg-ink/5 hover:text-ink aria-[current=page]:bg-ink aria-[current=page]:text-canvas"
            >
              {kind ? tm(`kinds.${kind}`) : t('allKinds')}
            </Link>
          ))}
        </nav>
      </div>

      {entries.length === 0 ? (
        <p className="py-20 text-center text-[15px] text-ink-muted">{t('empty')}</p>
      ) : (
        <>
          <ol className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3" data-testid="rank-podium">
            {podium.map((entry, index) => (
              <li key={entry.slug}>
                <Link href={hrefFor(entry)} className="group block rounded-[var(--radius-card)]">
                  <RankPoster item={entry.item} priority={index === 0} />
                  <div className="mt-4 flex items-start gap-4">
                    <span className="font-display text-[56px] leading-[0.8] font-semibold tracking-[-0.04em] tabular-nums" aria-label={t('rankLabel', { rank: entry.rank })}>
                      {entry.rank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-[16px] font-medium tracking-[-0.01em]">{entry.item.title}</h2>
                      <p className="mt-1 truncate text-[12.5px] text-ink-faint">
                        {tm(`kinds.${entry.item.kind}`)} · {tm(`categories.${entry.item.category}`)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-mono text-[15px] tabular-nums" title={valueLabel}>
                        {number.format(entry.value)}
                      </p>
                      <p className="mt-1 flex justify-end">
                        <RankChange rank={entry.rank} previous={entry.previousRank} show={showChange} />
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ol>

          {rest.length > 0 && (
            <ol className="mt-14 border-t border-line" data-testid="rank-list">
              {rest.map((entry) => (
                <li key={entry.slug} className="border-b border-line">
                  <Link href={hrefFor(entry)} className="group grid grid-cols-[2.5rem_4.5rem_minmax(0,1fr)_auto] items-center gap-4 py-3 sm:grid-cols-[3rem_6rem_minmax(0,1fr)_auto_auto] sm:gap-6">
                    <span className="font-display text-[20px] font-semibold tracking-[-0.03em] tabular-nums" aria-label={t('rankLabel', { rank: entry.rank })}>
                      {entry.rank}
                    </span>
                    <span data-cursor="view" className="relative block aspect-[16/10] overflow-hidden rounded-md border border-line bg-sunken transition-[border-color] duration-(--duration-base) group-hover:border-line-strong">
                      {(entry.item.media.posterSmall ?? entry.item.media.poster) && (
                        // 海报是预先生成的 webp。
                        <img src={entry.item.media.posterSmall ?? entry.item.media.poster ?? ''} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-medium transition-colors duration-(--duration-fast) group-hover:text-ink">{entry.item.title}</span>
                      <span className="mt-0.5 block truncate text-[12.5px] text-ink-faint">
                        {tm(`categories.${entry.item.category}`)}
                        <span className="max-sm:hidden">
                          {' · '}
                          {metricLine(entry, (key) => t(`metrics.${key}`), number)}
                        </span>
                      </span>
                    </span>
                    <Sparkline series={entry.series} label={t('trend')} className="max-sm:hidden" />
                    <span className="flex flex-col items-end gap-1">
                      <span className="font-mono text-[14px] tabular-nums" title={valueLabel}>
                        {number.format(entry.value)}
                      </span>
                      <RankChange rank={entry.rank} previous={entry.previousRank} show={showChange} />
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </>
      )}

      {picks.length > 0 && (
        <section className="mt-20">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-4">
            <h2 className="text-[15px] font-medium">{t('picks')}</h2>
            <p className="text-[13px] text-ink-faint">{t('sparse', { since })}</p>
          </div>
          <ul className="mt-6 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
            {picks.map((item) => (
              <li key={item.slug}>
                <ItemCard item={item} categoryLabel={tm(`categories.${item.category}`)} titleAs="h3" />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-24 grid gap-6 border-t border-line pt-10 lg:grid-cols-[1fr_2fr]">
        <h2 className="text-[15px] font-medium">{t('howTitle')}</h2>
        <p className="max-w-2xl text-[13.5px] leading-relaxed text-pretty text-ink-muted">{t('how')}</p>
      </section>
    </main>
  )
}

function hrefFor(entry: LeaderEntry): string {
  return entry.item.community ? `/community/works/${entry.slug}` : `/market/${entry.slug}`
}

/** 一行里的明细：只列不为 0 的几项（全是 0 的项不占地方）。 */
function metricLine(entry: LeaderEntry, label: (key: 'view' | 'copy' | 'favorite' | 'take' | 'remix') => string, number: Intl.NumberFormat): string {
  return (['view', 'copy', 'favorite', 'take', 'remix'] as const)
    .filter((key) => entry.counts[key] > 0)
    .map((key) => `${label(key)} ${number.format(entry.counts[key])}`)
    .join(' · ')
}

/** 分段选择（榜单、时间范围）：每一段是一个链接，当前的那段反白。 */
function Segmented({ label, options }: { label: string; options: { href: string; label: string; active: boolean }[] }) {
  return (
    <nav aria-label={label} className="inline-flex rounded-full border border-line p-0.5">
      {options.map((option) => (
        <Link
          key={option.href}
          href={option.href}
          aria-current={option.active ? 'page' : undefined}
          className="rounded-full px-3.5 py-1.5 text-[13px] text-ink-muted transition-colors duration-(--duration-fast) hover:text-ink aria-[current=page]:bg-ink aria-[current=page]:text-canvas"
        >
          {option.label}
        </Link>
      ))}
    </nav>
  )
}

