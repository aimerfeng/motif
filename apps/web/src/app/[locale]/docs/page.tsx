import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import { CopyCommand } from '@/components/copy-command'
import { DocsToc } from '@/components/docs-toc'
import { SkillButton } from '@/components/skill-button'
import { resolveRouteLocale } from '@/i18n/locale'
import { DOCS, type DocBlock } from '@/lib/docs'
import { alternatesFor } from '@/lib/site'
import { listGeneralSkills } from '@/lib/skills'

export async function generateMetadata({ params }: PageProps<'/[locale]/docs'>): Promise<Metadata> {
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'docs' })
  return { title: t('title'), description: DOCS[locale].lead, alternates: alternatesFor('/docs') }
}

/** 行内标记：`代码` 和 [文字](链接)。 */
function Inline({ text }: { text: string }) {
  const parts: ReactNode[] = []
  let last = 0
  for (const match of text.matchAll(/`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g)) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    const [whole, code, label, href] = match
    parts.push(
      code !== undefined ? (
        <code key={match.index} className="rounded border border-line bg-sunken px-1 py-px font-mono text-[0.88em] text-ink">
          {code}
        </code>
      ) : (
        // 站内链接（/community/…）在当前页打开，外部链接开新标签页。
        <a
          key={match.index}
          href={href}
          {...(href!.startsWith('/') ? {} : { target: '_blank', rel: 'noreferrer' })}
          className="text-ink underline decoration-line-strong underline-offset-4 transition-colors duration-150 hover:decoration-ink"
        >
          {label}
        </a>
      ),
    )
    last = match.index + whole.length
  }
  parts.push(text.slice(last))
  return <>{parts}</>
}

export default async function DocsPage({ params }: PageProps<'/[locale]/docs'>) {
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'docs' })
  const tm = await getTranslations({ locale, namespace: 'market' })
  const { lead, sections } = DOCS[locale]
  const generalSkills = await listGeneralSkills()

  const block = (item: DocBlock, index: number) => {
    switch (item.type) {
      case 'p':
        return (
          <p key={index}>
            <Inline text={item.text} />
          </p>
        )
      case 'list':
        return (
          <ul key={index} className="list-disc space-y-2 pl-5 marker:text-ink-faint">
            {item.items.map((entry) => (
              <li key={entry}>
                <Inline text={entry} />
              </li>
            ))}
          </ul>
        )
      case 'command':
        return <CopyCommand key={index} text={item.text} />
      case 'general-skills':
        return (
          <div key={index} className="flex flex-wrap gap-1.5">
            {generalSkills.map((name) => (
              <SkillButton key={name} source={{ name }} label={tm.has(`skillNames.${name}` as 'skillNames.motif-design') ? tm(`skillNames.${name}` as 'skillNames.motif-design') : name} />
            ))}
          </div>
        )
    }
  }

  return (
    <main className="mx-auto grid max-w-[1400px] gap-12 px-5 pt-12 pb-24 sm:px-8 sm:pt-14 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-16">
      <DocsToc sections={sections.map(({ id, title }) => ({ id, title }))} label={t('toc')} />
      <article className="max-w-2xl">
        <h1 className="font-display text-[44px] leading-[1.05] font-semibold tracking-[-0.03em] sm:text-[56px]">{t('title')}</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-pretty text-ink-muted">{lead}</p>
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="mt-14 scroll-mt-24">
            <h2 className="font-display text-[24px] leading-tight font-semibold tracking-[-0.02em]">{section.title}</h2>
            <div className="mt-4 space-y-4 text-[15px] leading-[1.8] text-pretty text-ink-muted">{section.blocks.map(block)}</div>
          </section>
        ))}
      </article>
    </main>
  )
}
