import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { SkillCard } from '@/components/skills/skill-card'
import { Link } from '@/i18n/navigation'
import { resolveRouteLocale } from '@/i18n/locale'
import { countItemSkills, getLibrarySkills } from '@/lib/skills'

const REPO = 'aimerfeng/motif'

export async function generateMetadata({ params }: PageProps<'/[locale]/skills'>): Promise<Metadata> {
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'skills' })
  return { title: t('title') }
}

export default async function SkillsPage({ params }: PageProps<'/[locale]/skills'>) {
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'skills' })
  const [library, itemCount] = await Promise.all([getLibrarySkills(), countItemSkills()])

  return (
    <main className="mx-auto max-w-[1400px] px-5 pt-14 pb-24 sm:px-8">
      <div className="max-w-3xl">
        <h1 className="font-display text-[44px] leading-[1.05] font-semibold tracking-[-0.03em] sm:text-[56px]">{t('title')}</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-pretty text-ink-muted">{t('lead')}</p>
      </div>

      <section className="mt-10 grid gap-6 rounded-[var(--radius-card)] border border-line bg-raised/50 p-6 md:grid-cols-3">
        <div>
          <h2 className="text-[13px] font-medium">{t('how.install')}</h2>
          <code className="mt-2 block rounded-lg border border-line bg-sunken px-3 py-2 font-mono text-[12px] whitespace-nowrap overflow-x-auto">
            npx skills add {REPO} --skill motif-design
          </code>
        </div>
        <div>
          <h2 className="text-[13px] font-medium">{t('how.where')}</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{t('how.whereBody')}</p>
        </div>
        <div>
          <h2 className="text-[13px] font-medium">{t('how.items')}</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
            {t('how.itemsBody', { count: itemCount })}{' '}
            <Link href="/market" className="text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
              {t('how.toMarket')}
            </Link>
          </p>
        </div>
      </section>

      <h2 className="mt-14 text-[13px] font-medium text-ink-faint">{t('library')}</h2>
      <ul className="mt-4 grid gap-4 lg:grid-cols-2" data-testid="skill-library">
        {library.map((skill) => (
          <li key={skill.name}>
            <SkillCard
              skill={skill}
              repo={REPO}
              title={t(`names.${skill.name}.title` as 'names.motif-design.title')}
              summary={t(`names.${skill.name}.summary` as 'names.motif-design.summary')}
              labels={{ copy: t('copy'), copied: t('copied'), show: t('show'), hide: t('hide') }}
            />
          </li>
        ))}
      </ul>
    </main>
  )
}
