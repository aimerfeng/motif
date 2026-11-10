import { stat } from 'node:fs/promises'
import path from 'node:path'
import { cache } from 'react'
import { skillName } from '@motif/export'
import { CATALOG_PATH, readCatalog, type Catalog, type CatalogItem } from '@motif/registry/catalog'
import type { Category, Kind } from '@motif/schema/core'
import type { Locale } from '@/i18n/routing'
import { mediaFor, type ItemMedia } from './media'

// catalog.json 由预览沙箱的构建（pnpm build / pnpm dev）生成，站点只读。
const CATALOG_FILE = path.resolve(/*turbopackIgnore: true*/ process.cwd(), '../..', CATALOG_PATH)

/*
 * catalog.json 有十几 MB（每个条目的源码都在里面）。React 的 cache() 只在一次渲染里去重，路由处理里不生效；
 * 而页脚要里面的一个日期，所以每个按请求渲染的页面都会用到它。每次都重新读、重新解析的话，线上一个请求
 * 光这一步就要一百多毫秒，解析出来的几十 MB 对象马上又变成垃圾，回收时请求会卡上好几秒（docs/decisions/0012）。
 *
 * 所以解析好的目录在进程里留一份，按文件的修改时间和大小决定要不要重读：线上文件不会变，只解析一次；
 * 开发时预览沙箱重新构建会换文件，下一个请求就读到新的。挂在 globalThis 上的原因见 lib/community/state.ts。
 */
interface Loaded {
  mtimeMs: number
  size: number
  catalog: Promise<Catalog>
}
const holder = globalThis as { __motifCatalog?: Loaded }

/** 留下来的这一份所有请求共用，整个冻结：谁原地改了它（排序、加字段）立刻报错，而不是悄悄影响别的请求。 */
function deepFreeze<T>(value: T): T {
  if (typeof value !== 'object' || value === null || Object.isFrozen(value)) return value
  Object.freeze(value)
  for (const child of Object.values(value)) deepFreeze(child)
  return value
}

export const getCatalog = cache(async (): Promise<Catalog> => {
  const info = await stat(CATALOG_FILE).catch(() => null)
  // 文件还没有（沙箱第一次构建还没跑完）：不留缓存，readCatalog 给一份空目录，文件出现后下一个请求就能读到。
  if (!info) return readCatalog(CATALOG_FILE)
  const current = holder.__motifCatalog
  if (current?.mtimeMs === info.mtimeMs && current.size === info.size) return current.catalog
  const loaded: Loaded = { mtimeMs: info.mtimeMs, size: info.size, catalog: readCatalog(CATALOG_FILE).then(deepFreeze) }
  holder.__motifCatalog = loaded
  // 读到写了一半的文件会解析失败：这次失败不能留着，下一个请求重新读。
  loaded.catalog.catch(() => {
    if (holder.__motifCatalog === loaded) holder.__motifCatalog = undefined
  })
  return loaded.catalog
})

/** 市场里可见的条目：已发布且编译成功。 */
export const getPublishedItems = cache(async (): Promise<CatalogItem[]> => {
  const catalog = await getCatalog()
  return catalog.items.filter((item) => item.manifest.status === 'published' && item.build !== null)
})

export async function getItem(slug: string): Promise<CatalogItem | undefined> {
  return (await getPublishedItems()).find((item) => item.manifest.slug === slug)
}

/** 市场卡片需要的精简信息，传给客户端组件时不带源码。 */
export interface ItemSummary {
  slug: string
  title: string
  summary: string
  kind: Kind
  category: Category
  tags: string[]
  runtime: string[]
  source: string | null
  /** 这个条目的 skill 名（/skill/<name>.md）。 */
  skill: string
  media: ItemMedia
  /** 社区投稿审核通过的作品（不在仓库目录里，源码由站点托管、记录在链上）。 */
  community?: boolean
  /** 上架时间（ISO 8601）：目录条目取 git 里第一次提交的时间，社区作品取投稿所在区块的时间。不知道时为 null。 */
  addedAt: string | null
}

export function summarize(item: CatalogItem, locale: Locale): ItemSummary {
  const { manifest } = item
  return {
    slug: manifest.slug,
    title: manifest.title[locale],
    summary: manifest.summary[locale],
    kind: manifest.kind,
    category: manifest.category,
    tags: manifest.tags,
    runtime: manifest.runtime,
    source: manifest.provenance.upstream?.repo ?? null,
    skill: skillName(manifest.slug),
    media: mediaFor(manifest.slug),
    addedAt: item.addedAt ?? null,
  }
}
