import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { UserAvatar } from '@/components/account/user-avatar'
import { buttonPrimary, EmptyState, SectionHeader } from '@/components/community/ui'
import { GitHubIcon } from '@/components/icons'
import { RepoCard } from '@/components/repos/repo-card'
import { resolveRouteLocale } from '@/i18n/locale'
import { Link } from '@/i18n/navigation'
import { userByHandle } from '@/lib/accounts/profile'
import { authReady } from '@/lib/auth/server'
import { pageUser } from '@/lib/auth/page'
import { reposOf } from '@/lib/repos/repos'

export async function generateMetadata({ params }: PageProps<'/[locale]/u/[handle]'>): Promise<Metadata> {
  const { handle } = await params
  await authReady()
  const user = userByHandle(handle)
  return user ? { title: `${user.name} (@${user.handle})`, description: user.bio || undefined } : {}
}

/** 用户主页：资料和仓库。主人能看到自己的私有仓库。 */
export default async function UserPage({ params }: PageProps<'/[locale]/u/[handle]'>) {
  const { locale: raw, handle } = await params
  const locale = resolveRouteLocale(raw)
  const viewer = await pageUser()
  const user = userByHandle(handle)
  if (!user) notFound()
  const t = await getTranslations({ locale, namespace: 'repos' })
  const isOwner = viewer?.id === user.id
  const repos = reposOf(user.id, isOwner)
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' })

  return (
    <main className="mx-auto max-w-[1200px] space-y-12 px-5 pt-12 pb-24 sm:px-8">
      <header className="flex flex-wrap items-center gap-5">
        <UserAvatar id={user.id} name={user.name} className="size-16 text-[24px]" />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[30px] leading-tight font-semibold tracking-[-0.02em]">{user.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] text-ink-muted">
            <span className="font-mono">@{user.handle}</span>
            {user.githubLogin && (
              <a href={`https://github.com/${user.githubLogin}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-ink">
                <GitHubIcon className="size-3.5" />
                {user.githubLogin}
              </a>
            )}
            <span className="text-ink-faint">{t('profile.joined', { date: date.format(user.createdAt) })}</span>
          </p>
          {user.bio && <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-ink-muted">{user.bio}</p>}
        </div>
        {isOwner && (
          <Link href="/repos/new" className={buttonPrimary}>
            {t('profile.newRepo')}
          </Link>
        )}
      </header>

      <section className="space-y-5">
        <SectionHeader title={t('profile.repos')} count={repos.length} />
        {repos.length === 0 ? (
          <EmptyState
            title={isOwner ? t('profile.emptyOwner') : t('profile.empty')}
            action={
              isOwner ? (
                <Link href="/repos/new" className={buttonPrimary}>
                  {t('profile.newRepo')}
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo) => (
              <RepoCard key={repo.id} repo={repo} updated={t('updated', { date: date.format(repo.updated_at) })} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
