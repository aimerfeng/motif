import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { AgentClients } from '@/components/agents/agent-clients'
import { PageHeader, SectionHeader } from '@/components/community/ui'
import { CopyBlock } from '@/components/copy-block'
import { CopyCommand } from '@/components/copy-command'
import { ArrowIcon } from '@/components/icons'
import { resolveRouteLocale } from '@/i18n/locale'
import { Link } from '@/i18n/navigation'
import { agentGuides } from '@/lib/agent-clients'
import { cliCommand, cliPackageUrl } from '@/lib/cli'
import { alternatesFor, SITE_URL } from '@/lib/site'
import { STORE_TOOLS } from '@/lib/store/tools'

export async function generateMetadata({ params }: PageProps<'/[locale]/agents'>): Promise<Metadata> {
  const t = await getTranslations({ locale: resolveRouteLocale((await params).locale), namespace: 'agents' })
  return { title: t('metaTitle'), description: t('lead'), alternates: alternatesFor('/agents') }
}

const STEPS = ['run', 'approve', 'ask'] as const

/** 命令行的常用命令，按「找、看、拿」的顺序。说明在 messages 的 agents.cli.commands 里。 */
const COMMANDS = [
  { id: 'search', command: 'motif search pricing section' },
  { id: 'info', command: 'motif info border-beam' },
  { id: 'preview', command: 'motif preview border-beam --out shots' },
  { id: 'add', command: 'motif add border-beam' },
  { id: 'custom', command: 'motif custom "a pricing table with a monthly / yearly switch" --wait' },
  { id: 'skills', command: 'motif skills' },
  { id: 'whoami', command: 'motif whoami' },
] as const

const external = 'inline-flex items-center gap-1 text-[13.5px] text-ink underline-offset-4 hover:underline'

/**
 * 接入页：把 Motif 接进 coding agent 的全部做法放在一页里（docs/decisions/0011-cli-and-agent-onboarding.md）。
 * 最上面是绝大多数人只需要的那一条命令，往下依次是按 agent 的说明、能用的工具、远程 MCP、HTTP 接口和命令行。
 */
export default async function AgentsPage({ params }: PageProps<'/[locale]/agents'>) {
  const locale = resolveRouteLocale((await params).locale)
  const t = await getTranslations({ locale, namespace: 'agents' })
  const origin = new URL(SITE_URL).origin
  const remote = `claude mcp add --transport http motif ${origin}/mcp --header "Authorization: Bearer <API key>"`
  const post = [`curl -X POST ${origin}/api/agent/place_order \\`, '  -H "Authorization: Bearer $MOTIF_API_KEY" \\', '  -H "Content-Type: application/json" \\', `  -d '{"slug": "border-beam"}'`].join('\n')

  return (
    <main className="mx-auto max-w-[1200px] space-y-16 px-5 pt-14 pb-24 sm:px-8">
      <PageHeader title={t('title')} lead={t('lead')} />

      <section className="overflow-hidden rounded-[var(--radius-card)] border border-line">
        <div className="space-y-4 bg-raised p-5 sm:p-7">
          <h2 className="font-display text-[22px] font-semibold tracking-[-0.02em]">{t('quick.title')}</h2>
          <p className="max-w-2xl text-[14px] leading-relaxed text-ink-muted">{t('quick.lead')}</p>
          <div className="max-w-3xl" data-testid="agents-setup">
            <CopyCommand text={cliCommand(origin, 'setup')} />
          </div>
          <p className="text-[12.5px] leading-relaxed text-ink-faint">{t('quick.requires')}</p>
        </div>
        <ol className="grid gap-px border-t border-line bg-line sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step} className="bg-canvas p-5 sm:px-7">
              <p className="flex items-baseline gap-2.5 text-[14px] font-medium">
                <span className="font-mono text-[12px] text-ink-faint tabular-nums">{index + 1}</span>
                {t(`quick.steps.${step}.title`)}
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{t(`quick.steps.${step}.text`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-5">
        <div>
          <SectionHeader title={t('clients.title')} />
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">{t('clients.lead')}</p>
        </div>
        <AgentClients guides={agentGuides(origin)} login={cliCommand(origin, 'login')} />
      </section>

      <section className="space-y-5">
        <div>
          <SectionHeader title={t('tools.title')} />
          <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-ink-muted">{t('tools.lead', { count: STORE_TOOLS.length })}</p>
        </div>
        <ul className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {STORE_TOOLS.map((tool) => {
            // 工具名直接对应文案键；新加的工具还没写译文时，先显示它给 agent 看的那段英文说明。
            const key = `tools.items.${tool.name}` as Parameters<typeof t>[0]
            return (
              <li key={tool.name} className="bg-canvas p-5">
                <p className="flex items-center justify-between gap-3">
                  <code className="font-mono text-[13px] font-medium">{tool.name}</code>
                  <span className={`shrink-0 rounded-full border px-2 py-px text-[11px] ${tool.readOnly ? 'border-line text-ink-faint' : 'border-line-strong text-ink'}`}>{t(tool.readOnly ? 'tools.free' : 'tools.paid')}</span>
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{t.has(key) ? t(key) : tool.description}</p>
              </li>
            )
          })}
        </ul>
        <p className="text-[13px] leading-relaxed text-ink-muted">
          {t('pricingNote')}{' '}
          <Link href="/pricing" className="text-ink underline-offset-4 hover:underline">
            {t('pricingLink')}
          </Link>
        </p>
      </section>

      <section className="grid gap-x-12 gap-y-16 lg:grid-cols-2">
        <div className="min-w-0 space-y-4">
          <SectionHeader title={t('remote.title')} />
          <p className="text-[13.5px] leading-relaxed text-ink-muted">{t('remote.lead')}</p>
          <CopyCommand text={`${origin}/mcp`} />
          <CopyCommand text={remote} />
          <p className="text-[13px] leading-relaxed text-ink-muted">{t('remote.note')}</p>
          <Link href="/account/keys" className={external}>
            {t('remote.keys')}
            <ArrowIcon className="size-3.5" />
          </Link>
        </div>
        <div className="min-w-0 space-y-4">
          <SectionHeader title={t('http.title')} />
          <p className="text-[13.5px] leading-relaxed text-ink-muted">{t('http.lead')}</p>
          <CopyCommand text={`curl "${origin}/api/agent/search_ui?query=pricing"`} />
          <CopyBlock text={post} label="POST /api/agent/place_order" />
          <p className="flex flex-wrap gap-x-6 gap-y-2">
            {/* 这两个是接口，不是页面：不走带语言前缀的 Link。 */}
            <a href="/api/agent" className={external}>
              {t('http.listing')}
              <ArrowIcon className="size-3.5" />
            </a>
            <a href="/llms.txt" className={external}>
              {t('http.llms')}
              <ArrowIcon className="size-3.5" />
            </a>
          </p>
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <SectionHeader title={t('cli.title')} />
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">{t('cli.lead')}</p>
        </div>
        <div className="grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="min-w-0 space-y-3">
            <p className="text-[13.5px] leading-relaxed text-ink-muted">{t('cli.install')}</p>
            <CopyCommand text={`npm install -g ${cliPackageUrl(origin)}`} />
            <p className="text-[12.5px] leading-relaxed text-ink-faint">{t('cli.ci')}</p>
          </div>
          <dl className="min-w-0 divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line">
            {COMMANDS.map((entry) => (
              <div key={entry.id} className="grid gap-x-6 gap-y-1 px-4 py-3 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                <dt className="overflow-x-auto font-mono text-[12.5px] whitespace-nowrap [scrollbar-width:none]">{entry.command}</dt>
                <dd className="text-[13px] text-ink-muted">{t(`cli.commands.${entry.id}`)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  )
}
