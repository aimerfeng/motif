import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'

/** 社区链没有配置或连不上时的说明：说清楚为什么看不到，以及本地开发怎么启动。 */
export async function CommunityOffline({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'community.offline' })
  return (
    <div className="max-w-2xl" data-testid="community-offline">
      <h1 className="font-display text-[36px] leading-[1.1] font-semibold tracking-[-0.03em]">{t('title')}</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-pretty text-ink-muted">{t('lead')}</p>
      {process.env.NODE_ENV === 'development' && (
        <p className="mt-6 rounded-[var(--radius-card)] border border-line bg-sunken p-4 text-[13.5px] leading-relaxed text-ink-muted">
          {t.rich('dev', { code: (chunks) => <code className="font-mono text-[12.5px] text-ink">{chunks}</code> })}
        </p>
      )}
    </div>
  )
}
