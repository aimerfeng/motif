import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { DocsTreeSidebar, items, type DocsTreeSidebarProps } from './sidebar-docs-tree'

/** 自动播放：每 2 秒换一个当前页，所在分支随之展开；用户点了就停下。 */
const TOUR = ['installation', 'setup', 'endpoints', 'models', 'faq'] as const
const STEP = 2

const PAGES: Record<string, { section: string; lead: string; steps: string[] }> = {
  installation: {
    section: 'Getting Started',
    lead: 'Lumen ships as a single CLI and a small runtime. Install both, then point the CLI at your content folder.',
    steps: ['Install the CLI with your package manager.', 'Run lumen init in the repository root.', 'Commit the generated lumen.config.ts.'],
  },
  setup: {
    section: 'Getting Started',
    lead: 'Every project reads one config file. Most teams only touch the content root, the base path and the theme.',
    steps: ['Set contentDir to your Markdown folder.', 'Pick a basePath if docs live under /docs.', 'Choose a theme preset or extend the tokens.'],
  },
  endpoints: {
    section: 'API Reference',
    lead: 'The search API is read-only and rate limited to 60 requests per minute per key.',
    steps: ['GET /v1/pages lists published pages.', 'GET /v1/search?q= returns ranked matches.', 'GET /v1/pages/:id returns one page with headings.'],
  },
  models: {
    section: 'API Reference',
    lead: 'Pages, headings and redirects are the three objects the API returns. All ids are stable across builds.',
    steps: ['Page: id, title, path, updatedAt.', 'Heading: id, depth, text, anchor.', 'Redirect: from, to, permanent.'],
  },
  faq: {
    section: 'Resources',
    lead: 'Short answers to what teams ask in their first week.',
    steps: ['Builds are incremental after the first run.', 'Private pages stay out of the search index.', 'Version switching keeps the current page when it exists.'],
  },
}

export function Demo(props: DocsTreeSidebarProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<string>(TOUR[0])
  const [manual, setManual] = useState<string | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = TOUR[Math.floor(time / STEP) % TOUR.length]!
      setAuto((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  const current = manual ?? auto
  const page = PAGES[current]
  const title = items[current]?.name ?? 'Installation'

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background text-foreground">
      <div className="mx-auto flex min-h-full max-w-6xl flex-col gap-6 p-4 md:flex-row md:gap-10 md:p-8">
        <DocsTreeSidebar
          {...props}
          current={current}
          onNavigate={setManual}
          className="rounded-xl border p-3 md:sticky md:top-0 md:self-start md:rounded-none md:border-0 md:border-e md:p-0 md:pe-4"
        />
        <main className="min-w-0 flex-1 pb-10">
          {page ? (
            <article className="max-w-2xl">
              <p className="text-muted-foreground text-xs">
                Docs <span aria-hidden="true">/</span> {page.section} <span aria-hidden="true">/</span>{' '}
                <span className="text-foreground">{title}</span>
              </p>
              <h1 className="mt-3 font-semibold text-3xl tracking-tight">{title}</h1>
              <p className="mt-3 text-muted-foreground leading-relaxed">{page.lead}</p>
              <ol className="mt-6 space-y-3">
                {page.steps.map((step, i) => (
                  <li key={step} className="flex gap-3 rounded-lg border bg-card p-3 text-sm">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full border font-mono text-muted-foreground text-xs">{i + 1}</span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
              <pre className="mt-6 overflow-x-auto rounded-lg border bg-card p-4 font-mono text-muted-foreground text-xs">
                <code>{`$ lumen dev\n  ready  local docs on :4000\n  index  42 pages, 318 headings`}</code>
              </pre>
              <div className="mt-8 flex items-center justify-between border-t pt-4 text-muted-foreground text-sm">
                <span>Updated 3 days ago</span>
                <span>Edit this page</span>
              </div>
            </article>
          ) : (
            <p className="text-muted-foreground text-sm">Select a page.</p>
          )}
        </main>
      </div>
    </div>
  )
}
