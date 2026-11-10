import { getTranslations } from 'next-intl/server'
import { EmptyState } from '@/components/community/ui'
import type { Locale } from '@/i18n/routing'
import type { LedgerEntry } from '@/lib/credits/ledger'
import { SITE_TIME_ZONE } from '@/lib/site'

/** 积分流水：时间、事由、变动、余额。 */
export async function LedgerTable({ entries, locale }: { entries: LedgerEntry[]; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'credits.ledger' })
  if (entries.length === 0) return <EmptyState title={t('empty')} compact />
  // 时区写死（表头也写着）：不然同一笔流水在线上（UTC 容器）和开发机上是两个钟点。
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone: SITE_TIME_ZONE })
  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] border border-line">
      <table className="w-full min-w-[560px] text-left text-[13.5px]">
        <thead className="border-b border-line text-[12px] text-ink-faint">
          <tr>
            <th className="px-4 py-2.5 font-normal">{t('when')}</th>
            <th className="px-4 py-2.5 font-normal">{t('what')}</th>
            <th className="px-4 py-2.5 text-right font-normal">{t('change')}</th>
            <th className="px-4 py-2.5 text-right font-normal">{t('balance')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td className="px-4 py-3 whitespace-nowrap text-ink-muted">{date.format(entry.created_at)}</td>
              <td className="px-4 py-3">
                {t(`kinds.${entry.kind}`)}
                {(entry.ref || entry.note) && entry.kind !== 'signup' && <span className="ml-2 font-mono text-[12px] text-ink-faint">{entry.kind === 'studio' || entry.kind === 'admin' ? entry.note : entry.ref}</span>}
              </td>
              <td className={`px-4 py-3 text-right font-mono tabular-nums ${entry.delta > 0 ? 'text-success' : entry.delta < 0 ? 'text-ink' : 'text-ink-faint'}`}>
                {entry.delta > 0 ? `+${entry.delta.toLocaleString()}` : entry.delta.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-right font-mono text-ink-muted tabular-nums">{entry.balance_after.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
