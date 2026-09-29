import path from 'node:path'
import { cache } from 'react'
import { CATALOG_PATH, readCatalog, type CatalogItem } from '@motif/registry/catalog'
import type { Category } from '@motif/schema'
import type { Locale } from '@/i18n/routing'
import { mediaFor, type ItemMedia } from './media'

// catalog.json 由预览沙箱的构建（pnpm build / pnpm dev）生成，站点只读。
const CATALOG_FILE = path.resolve(process.cwd(), '../..', CATALOG_PATH)

export const getCatalog = cache(() => readCatalog(CATALOG_FILE))

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
  category: Category
  tags: string[]
  runtime: string[]
  source: string | null
  media: ItemMedia
}

export function summarize(item: CatalogItem, locale: Locale): ItemSummary {
  const { manifest } = item
  return {
    slug: manifest.slug,
    title: manifest.title[locale],
    summary: manifest.summary[locale],
    category: manifest.category,
    tags: manifest.tags,
    runtime: manifest.runtime,
    source: manifest.provenance.upstream?.repo ?? null,
    media: mediaFor(manifest.slug),
  }
}
