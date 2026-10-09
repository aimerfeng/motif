import type { IndexedItem, IndexedVersion } from '@motif/contracts'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getAddress, isAddress, type Address } from 'viem'
import { CommunityOffline } from '@/components/community/offline'
import { Avatar } from '@/components/community/people'
import { ProfileModeration } from '@/components/community/profile-moderation'
import { Chip, VersionChip } from '@/components/community/status'
import { Link } from '@/i18n/navigation'
import { resolveRouteLocale } from '@/i18n/locale'
import { parseProfileMetadata, shortAddress } from '@/lib/community/shared'
import { getCommunity, type Community } from '@/lib/community/state'
import { readBlob } from '@/lib/community/storage'
import { itemLink } from '@/lib/community/views'

function resolveAccount(community: Community, value: string): Address | null {
  const decoded = decodeURIComponent(value)
  if (isAddress(decoded)) return getAddress(decoded)
  return community.state.handles.get(decoded) ?? null
}

export async function generateMetadata({ params }: PageProps<'/[locale]/community/u/[account]'>): Promise<Metadata> {
  const { account } = await params
  const decoded = decodeURIComponent(account)
  return { title: isAddress(decoded) ? shortAddress(decoded) : `@${decoded}` }
}

export default async function ProfilePage({ params }: PageProps<'/[locale]/community/u/[account]'>) {
  const { locale: raw, account } = await params
  const locale = resolveRouteLocale(raw)
  const community = await getCommunity()
  if (!community) return <CommunityOffline locale={locale} />
  const address = resolveAccount(community, account)
  if (!address) notFound()

  const t = await getTranslations({ locale, namespace: 'community.profile' })
  const { state } = community
  const profile = state.profiles.get(address)
  const metadata = parseProfileMetadata(profile?.metadataHash ? await readBlob(profile.metadataHash) : null)

  // 作品：作者是这个地址的版本，按条目归并，只取最新的那个版本展示状态。
  const authored = new Map<bigint, { item: IndexedItem; version: IndexedVersion }>()
  const votes: { item: IndexedItem; version: IndexedVersion; verdict: string }[] = []
  const remixedBy: IndexedItem[] = []
  for (const item of state.items.values()) {
    for (const version of item.versions) {
      if (version.author === address) authored.set(item.id, { item, version })
      for (const vote of version.review?.votes ?? []) if (vote.curator === address) votes.push({ item, version, verdict: vote.verdict })
    }
    if (item.parentId !== 0n) {
      const parent = state.items.get(item.parentId)
      const parentAuthor = parent?.versions.find((version) => version.version === item.parentVersion)?.author
      if (parentAuthor === address && item.versions[0]?.author !== address && !item.abandoned) remixedBy.push(item)
    }
  }
  const works = await Promise.all([...authored.values()].reverse().map(async (entry) => ({ ...entry, link: await itemLink(entry.item, locale) })))
  const remixes = await Promise.all(remixedBy.map((item) => itemLink(item, locale)))
  const voteLinks = await Promise.all(votes.slice(-20).reverse().map(async (entry) => ({ ...entry, link: await itemLink(entry.item, locale) })))
  const curator = state.curators.has(address)

  return (
    <div>
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <Avatar address={address} className="size-20" />
        <div className="min-w-0">
          <h1 className="font-display text-[36px] leading-[1.1] font-semibold tracking-[-0.03em]">
            {metadata.name ?? (profile?.handle ? `@${profile.handle}` : shortAddress(address))}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-faint">
            {profile?.handle && metadata.name && <span>@{profile.handle}</span>}
            <span className="font-mono" title={address}>
              {shortAddress(address)}
            </span>
            <span data-testid="reputation">{t('reputation', { value: (profile?.reputation ?? 0n).toString() })}</span>
            {curator && <Chip tone="success">{t('curator')}</Chip>}
          </p>
          {metadata.bio && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-pretty text-ink-muted">{metadata.bio}</p>}
          {metadata.links && metadata.links.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13.5px]">
              {metadata.links.map((link) => (
                <li key={link}>
                  <a href={link} target="_blank" rel="noreferrer nofollow ugc" className="text-ink-muted underline decoration-line-strong underline-offset-4 hover:text-ink hover:decoration-ink">
                    {link.replace(/^https?:\/\//, '')}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-12">
          <section>
            <h2 className="text-[15px] font-medium">{t('works', { count: works.length })}</h2>
            {works.length === 0 ? (
              <p className="mt-3 text-[14px] text-ink-faint">{t('noWorks')}</p>
            ) : (
              <ul className="mt-3 divide-y divide-line border-y border-line text-[14px]">
                {works.map(({ item, version, link }) => (
                  <li key={link.id} className="flex items-center justify-between gap-4 py-3">
                    <Link href={`/community/items/${link.id}`} className="min-w-0 truncate hover:underline hover:decoration-line-strong hover:underline-offset-4">
                      {link.title ?? link.slug}
                      <span className="ml-2 font-mono text-[12px] text-ink-faint">v{version.version}</span>
                    </Link>
                    {item.delisted ? <Chip tone="danger">{t('delisted')}</Chip> : <VersionChip status={version.status} outcome={version.review?.outcome ?? null} />}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {remixes.length > 0 && (
            <section>
              <h2 className="text-[15px] font-medium">{t('remixedBy', { count: remixes.length })}</h2>
              <ul className="mt-3 flex flex-wrap gap-2 text-[13.5px]">
                {remixes.map((remix) => (
                  <li key={remix.id}>
                    <Link href={`/community/items/${remix.id}`} className="block rounded-full border border-line px-3 py-1 text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink">
                      {remix.title ?? remix.slug}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {voteLinks.length > 0 && (
            <section>
              <h2 className="text-[15px] font-medium">{t('votes', { count: votes.length })}</h2>
              <ul className="mt-3 divide-y divide-line border-y border-line text-[14px]">
                {voteLinks.map(({ link, version, verdict }, index) => (
                  <li key={index} className="flex items-center justify-between gap-4 py-3">
                    <Link href={`/community/items/${link.id}?v=${version.version}`} className="min-w-0 truncate hover:underline hover:decoration-line-strong hover:underline-offset-4">
                      {link.title ?? link.slug}
                    </Link>
                    <span className={verdict === 'approve' ? 'text-[12.5px] text-success' : 'text-[12.5px] text-danger'}>{t(`verdicts.${verdict as 'approve' | 'reject' | 'violation'}`)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
        <aside>{profile?.handle && <ProfileModeration account={address} handle={profile.handle} />}</aside>
      </div>
    </div>
  )
}
