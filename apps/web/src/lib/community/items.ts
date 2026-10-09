import type { CatalogItem } from '@motif/registry/catalog'
import { contentHash, type IndexedItem, type IndexedVersion } from '@motif/contracts'
import type { ModuleRef, StyleRef } from '@motif/preview/protocol'
import type { ItemSource } from '@motif/schema'
import type { Hex } from 'viem'
import { getCatalog, getPublishedItems } from '@/lib/catalog'
import { currentVersion, isListed, type Community } from './state'
import { readBuild, readSource } from './storage'

/*
 * 链上版本 → 源码和预览产物。
 * 创世导入的条目就是市场目录里的条目（内容哈希相同），直接用目录的源码和沙箱里预编译好的产物；
 * 社区投稿用站点存储里链上作者上传的那一份，预览产物以代码字符串交给沙箱运行。
 */

export interface VersionContent {
  source: ItemSource
  origin: 'catalog' | 'community'
  preview: { module: ModuleRef; styles: StyleRef }
}

let catalogHashes: { generatedAt: string; byHash: Map<Hex, CatalogItem> } | null = null

/** 目录条目的内容哈希（目录重建后重新计算）。 */
async function catalogByHash(): Promise<Map<Hex, CatalogItem>> {
  const catalog = await getCatalog()
  if (catalogHashes?.generatedAt !== catalog.generatedAt) {
    const items = await getPublishedItems()
    const pairs = await Promise.all(items.map(async (item) => [await contentHash({ manifest: item.manifest, files: item.files }), item] as const))
    catalogHashes = { generatedAt: catalog.generatedAt, byHash: new Map(pairs) }
  }
  return catalogHashes.byHash
}

/** 目录里的条目在链上的哈希：用来在市场详情页判断“链上记录是否就是这一份”。 */
export async function catalogHashOf(slug: string): Promise<Hex | null> {
  for (const [hash, item] of await catalogByHash()) if (item.manifest.slug === slug) return hash
  return null
}

const communityCache = new Map<Hex, VersionContent | null>()

export async function contentOfVersion(version: IndexedVersion): Promise<VersionContent | null> {
  const catalogItem = (await catalogByHash()).get(version.contentHash)
  if (catalogItem?.build) {
    return {
      source: { manifest: catalogItem.manifest, files: catalogItem.files },
      origin: 'catalog',
      preview: { module: { kind: 'url', url: catalogItem.build.js }, styles: { kind: 'url', url: catalogItem.build.css } },
    }
  }
  // 内容按哈希寻址、永远不变，可以放心缓存（只缓存找到的，上传可能晚于这次查询）。
  const cached = communityCache.get(version.contentHash)
  if (cached) return cached
  const [stored, build] = await Promise.all([readSource(version.contentHash, version.author), readBuild(version.contentHash)])
  if (!stored || !build) return null
  const content: VersionContent = {
    source: stored.item,
    origin: 'community',
    preview: { module: { kind: 'code', code: build.js }, styles: { kind: 'text', text: build.css } },
  }
  communityCache.set(version.contentHash, content)
  return content
}

export interface ListedCommunityItem {
  item: IndexedItem
  version: IndexedVersion
  content: VersionContent
}

/** 审核通过、没被下架、而且不是市场目录里已有条目的社区作品。 */
export async function listedCommunityItems(community: Community): Promise<ListedCommunityItem[]> {
  const listed: ListedCommunityItem[] = []
  const catalogSlugs = new Set((await getPublishedItems()).map((item) => item.manifest.slug))
  for (const item of community.state.items.values()) {
    if (!isListed(item) || catalogSlugs.has(item.slug)) continue
    const version = currentVersion(item)
    const content = version ? await contentOfVersion(version) : null
    if (version && content && isCommunityWork(item, content)) listed.push({ item, version, content })
  }
  return listed
}

export async function listedCommunityItem(community: Community, slug: string): Promise<ListedCommunityItem | null> {
  const itemId = community.state.slugs.get(slug)
  const item = itemId === undefined ? undefined : community.state.items.get(itemId)
  if (!item || !isListed(item)) return null
  const version = currentVersion(item)
  const content = version ? await contentOfVersion(version) : null
  return version && content && isCommunityWork(item, content) ? { item, version, content } : null
}

/**
 * 社区作品：源码来自站点存储，而且清单里的 slug 和链上登记的 slug 一致。
 * 直接调合约可以把链上 slug x 配上清单 slug y；不检查的话，/skill/motif-x 会以 y 的名义分发 x 的代码。
 */
function isCommunityWork(item: IndexedItem, content: VersionContent): boolean {
  return content.origin === 'community' && content.source.manifest.slug === item.slug
}
