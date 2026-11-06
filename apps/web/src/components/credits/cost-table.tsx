import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import { creditCosts } from '@/lib/credits/pricing'

/** 什么花多少积分：价格表（lib/credits/pricing.ts）原样列出来。 */
export async function CostTable({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'credits.costs' })
  const costs = creditCosts()
  const rows: [string, string][] = [
    [t('signup'), `+${costs.signupBonus}`],
    [t('unlockItem'), String(costs.unlockItem)],
    [t('unlockSkill'), String(costs.unlockSkill)],
    [t('studio'), t('studioRate', { input: costs.per1kInput, output: costs.per1kOutput })],
    [t('customOrder'), String(costs.customOrder)],
    [t('free'), '0'],
  ]
  return (
    <dl className="divide-y divide-line rounded-[var(--radius-card)] border border-line">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-baseline justify-between gap-6 px-5 py-3.5 text-[13.5px]">
          <dt className="text-ink-muted">{label}</dt>
          {/* 数字等宽对齐；工作台按 token 计价那一行是一句话，用正文字体。 */}
          <dd className={`text-right text-ink tabular-nums ${/^[+\d]/.test(value) ? 'font-mono' : 'text-[13px]'}`}>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
