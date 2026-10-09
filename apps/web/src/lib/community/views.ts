import type { CommunityState, IndexedItem, IndexedVersion, ReviewOutcome, Verdict, VersionStatus } from '@motif/contracts'
import type { Address, Hex } from 'viem'
import type { Locale } from '@/i18n/routing'
import { contentOfVersion } from './items'
import { formatMotif } from './shared'
import { isListed, remixesOf, type Community } from './state'

/*
 * 页面和客户端组件用的视图数据：全部是可序列化的普通值（金额格式化成字符串、时间是秒）。
 */

export interface PersonView {
  address: Address
  handle: string | null
}

export function personOf(state: CommunityState, address: Address): PersonView {
  return { address, handle: state.profiles.get(address)?.handle ?? null }
}

export interface VoteView {
  curator: PersonView
  verdict: Verdict
  noteHash: Hex | null
  at: number | null
}

export interface ReviewView {
  submitter: PersonView
  bond: string
  deadline: number
  quorum: number
  outcome: ReviewOutcome
  /** 审核期已过但还没人关闭。 */
  overdue: boolean
  /** 结算（或撤回、关闭）的时间，进行中为 null。 */
  closedAt: number | null
  votes: VoteView[]
  tally: Record<Verdict, number>
  rewards: { to: PersonView; paid: string; owed: string }[]
}

export interface VersionView {
  version: number
  contentHash: Hex
  license: string
  author: PersonView
  upstream: { repo: string; commit: Hex } | null
  status: VersionStatus
  submittedAt: number | null
  review: ReviewView | null
}

export interface ItemLink {
  id: string
  slug: string
  title: string | null
}

export interface ItemRecordView {
  id: string
  slug: string
  title: string | null
  summary: string | null
  maintainer: PersonView
  parent: (ItemLink & { version: number }) | null
  remixes: ItemLink[]
  delisted: boolean
  delistReason: Hex | null
  listed: boolean
  abandoned: boolean
  currentVersion: number
  /** 当前版本就是市场目录里的条目（创世导入）。 */
  catalog: boolean
  versions: VersionView[]
}

const ZERO = '0x0000000000000000000000000000000000000000000000000000000000000000'

export function versionView(community: Community, version: IndexedVersion): VersionView {
  const { state } = community
  const review = version.review
  return {
    version: version.version,
    contentHash: version.contentHash,
    license: version.license,
    author: personOf(state, version.author),
    upstream: version.upstreamCommit ? { repo: version.upstreamRepo, commit: version.upstreamCommit } : null,
    status: version.status,
    submittedAt: community.timeOf(version.submittedBlock),
    review: review
      ? {
          submitter: personOf(state, review.submitter),
          bond: formatMotif(review.bond),
          deadline: Number(review.deadline),
          quorum: review.quorum,
          outcome: review.outcome,
          overdue: review.outcome === 'open' && community.now > Number(review.deadline),
          closedAt: review.closedBlock === null ? null : community.timeOf(review.closedBlock),
          votes: review.votes.map((vote) => ({
            curator: personOf(state, vote.curator),
            verdict: vote.verdict,
            noteHash: vote.noteHash === ZERO ? null : vote.noteHash,
            at: community.timeOf(vote.block),
          })),
          tally: {
            approve: review.votes.filter((vote) => vote.verdict === 'approve').length,
            reject: review.votes.filter((vote) => vote.verdict === 'reject').length,
            violation: review.votes.filter((vote) => vote.verdict === 'violation').length,
          },
          rewards: review.rewards.map((reward) => ({ to: personOf(state, reward.to), paid: formatMotif(reward.paid), owed: formatMotif(reward.owed) })),
        }
      : null,
  }
}

/** 条目的标题：取最新一个能读到源码的版本。已下架的条目只显示 slug。 */
async function titleOf(item: IndexedItem, locale: Locale): Promise<{ title: string; summary: string } | null> {
  if (item.delisted) return null
  for (const version of [...item.versions].reverse()) {
    const content = await contentOfVersion(version)
    if (content) return { title: content.source.manifest.title[locale], summary: content.source.manifest.summary[locale] }
  }
  return null
}

export async function itemLink(item: IndexedItem, locale: Locale): Promise<ItemLink> {
  return { id: item.id.toString(), slug: item.slug, title: (await titleOf(item, locale))?.title ?? null }
}

export async function itemRecordView(community: Community, item: IndexedItem, locale: Locale): Promise<ItemRecordView> {
  const { state } = community
  const parentItem = item.parentId === 0n ? undefined : state.items.get(item.parentId)
  const meta = await titleOf(item, locale)
  const current = item.versions.find((version) => version.version === item.currentVersion)
  return {
    id: item.id.toString(),
    slug: item.slug,
    title: meta?.title ?? null,
    summary: meta?.summary ?? null,
    maintainer: personOf(state, item.maintainer),
    parent: parentItem ? { ...(await itemLink(parentItem, locale)), version: item.parentVersion } : null,
    remixes: await Promise.all(remixesOf(state, item.id).map((remix) => itemLink(remix, locale))),
    delisted: item.delisted,
    delistReason: item.delistReason,
    listed: isListed(item),
    abandoned: item.abandoned,
    currentVersion: item.currentVersion,
    catalog: current ? (await contentOfVersion(current))?.origin === 'catalog' : false,
    versions: item.versions.map((version) => versionView(community, version)),
  }
}
