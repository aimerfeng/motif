'use client'

import { contentHash } from '@motif/contracts'
import type { ItemSource } from '@motif/schema/core'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useCommunity } from './wallet'

type Verification =
  | { state: 'checking' }
  | { state: 'unregistered' }
  | { state: 'verified' | 'mismatch' | 'delisted'; itemId: string; version: number | null }

/**
 * “链上已验证”：在浏览器里对页面上的源码重算内容哈希，和链上登记的最新通过版本比对。
 * 不信任站点：站点改了一个字节，这里就会显示不一致。社区没开或条目没登记时不显示。
 */
export function ChainBadge({ item }: { item: ItemSource }) {
  const t = useTranslations('community.badge')
  const { status } = useCommunity()
  const [result, setResult] = useState<Verification>({ state: 'checking' })
  const slug = item.manifest.slug

  useEffect(() => {
    if (status === 'loading' || status === 'disabled') return
    let cancelled = false
    const verify = async (): Promise<Verification> => {
      const response = await fetch(`/api/community/registry/${encodeURIComponent(slug)}`, { cache: 'no-store' })
      const record = (await response.json()) as { registered: boolean; itemId?: string; version?: number | null; contentHash?: string | null; delisted?: boolean }
      if (!record.registered || !record.itemId) return { state: 'unregistered' }
      const base = { itemId: record.itemId, version: record.version ?? null }
      if (record.delisted) return { state: 'delisted', ...base }
      return { state: (await contentHash(item)) === record.contentHash ? 'verified' : 'mismatch', ...base }
    }
    void verify()
      .catch((): Verification => ({ state: 'unregistered' }))
      .then((verification) => {
        if (!cancelled) setResult(verification)
      })
    return () => {
      cancelled = true
    }
  }, [status, slug, item])

  if (result.state === 'checking' || result.state === 'unregistered') return null
  const tone = result.state === 'verified' ? 'text-success' : 'text-danger'
  return (
    <Link
      href={`/community/items/${result.itemId}`}
      title={t(`${result.state}Title`)}
      data-testid="chain-badge"
      data-state={result.state}
      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line px-3 text-[12.5px] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink"
    >
      <span aria-hidden className={`size-1.5 rounded-full ${result.state === 'verified' ? 'bg-success' : 'bg-danger'}`} />
      <span className={result.state === 'verified' ? '' : tone}>{t(result.state, { version: result.version ?? 0 })}</span>
    </Link>
  )
}
