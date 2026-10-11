import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import { CopyCommand } from '@/components/copy-command'
import { DocsToc } from '@/components/docs-toc'
import { ArrowIcon, DownloadIcon, InfoIcon, PlugIcon, SearchIcon, SparklesIcon } from '@/components/icons'
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

const START_ICONS = { market: SearchIcon, export: DownloadIcon, studio: SparklesIcon, agent: PlugIcon } as const

export default async function DocsPage({ params }: PageProps<'/[locale]/docs'>) {
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'docs' })
  const tm = await getTranslations({ locale, namespace: 'market' })
  const { lead, start, sections } = DOCS[locale]
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
          <ul key={index} className="space-y-2.5">
            {item.items.map((entry) => (
              <li key={entry} className="relative pl-5 before:absolute before:top-[0.72em] before:left-1 before:size-1 before:rounded-full before:bg-ink-faint">
                <Inline text={entry} />
              </li>
            ))}
          </ul>
        )
      case 'steps':
        return (
          <ol key={index} className="space-y-4">
            {item.items.map((step, position) => (
              <li key={step.title} className="flex gap-4">
                <span className="grid size-6 shrink-0 place-items-center rounded-full border border-line-strong font-mono text-[11px] text-ink">{position + 1}</span>
                <p className="min-w-0">
                  <span className="mr-2 font-medium text-ink">{step.title}</span>
                  <Inline text={step.text} />
                </p>
              </li>
            ))}
          </ol>
        )
      case 'options':
        return (
          <ul key={index} className="grid gap-3 sm:grid-cols-3">
            {item.items.map((option) => (
              <li key={option.title} className="rounded-[var(--radius-card)] border border-line bg-raised p-4 text-[13.5px] leading-relaxed">
                <p className="mb-1.5 text-[14px] font-medium text-ink">{option.title}</p>
                <Inline text={option.text} />
              </li>
            ))}
          </ul>
        )
      case 'note':
        return (
          <p key={index} className="flex gap-3 rounded-lg border border-pending/25 bg-pending/5 px-4 py-3 text-[13.5px] leading-relaxed">
            <InfoIcon className="mt-[3px] size-4 shrink-0 text-pending" />
            <span>
              <Inline text={item.text} />
            </span>
          </p>
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
      <article className="max-w-[720px] min-w-0">
        <h1 className="font-display text-[40px] leading-[1.05] font-semibold tracking-[-0.03em] sm:text-[48px]">{t('title')}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-pretty text-ink-muted">{lead}</p>

        <nav aria-label={t('start')} className="mt-8 grid gap-3 sm:grid-cols-2">
          {start.map((entry) => {
            const Glyph = START_ICONS[entry.icon]
            return (
              <a
                key={entry.section}
                href={`#${entry.section}`}
                className="group flex items-start gap-3 rounded-[var(--radius-card)] border border-line p-4 transition-colors duration-150 hover:border-line-strong hover:bg-raised"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-raised text-ink-muted transition-colors duration-150 group-hover:text-ink">
                  <Glyph className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-[14.5px] font-medium">
                    {entry.title}
                    <ArrowIcon className="size-3.5 text-ink-faint transition-transform duration-150 group-hover:translate-x-0.5" />
                  </span>
                  <span className="mt-0.5 block text-[13px] text-ink-faint">{entry.text}</span>
                </span>
              </a>
            )
          })}
        </nav>

        {sections.map((section, index) => (
          <section key={section.id} id={section.id} className="mt-14 scroll-mt-24 border-t border-line pt-10">
            <h2 className="flex items-baseline gap-3 font-display text-[24px] leading-tight font-semibold tracking-[-0.02em]">
              <span aria-hidden className="font-mono text-[12px] font-normal tracking-normal text-ink-faint">
                {String(index + 1).padStart(2, '0')}
              </span>
              {section.title}
            </h2>
            <div className="mt-5 space-y-4 text-[14.5px] leading-[1.75] text-pretty text-ink-muted">{section.blocks.map(block)}</div>
          </section>
        ))}
      </article>
    </main>
  )
}
