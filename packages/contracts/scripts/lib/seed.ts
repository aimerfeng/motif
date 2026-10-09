import type { ContractReturnType } from '@nomicfoundation/hardhat-viem/types'
import type { ItemSource } from '@motif/schema'
import type { Address, PublicClient } from 'viem'
import { versionInput } from '../../src/encoding.ts'

/** MotifRegistry.Status.Approved */
const APPROVED = 2

interface LineageItem {
  manifest: { slug: string; provenance: { basedOn?: string } }
}

/** 按 Remix 关系排序：父条目一定排在子条目前面（链上登记 Remix 时父条目必须已经通过）。 */
export function orderByLineage<T extends LineageItem>(items: readonly T[]): T[] {
  const bySlug = new Map(items.map((item) => [item.manifest.slug, item]))
  const ordered: T[] = []
  const state = new Map<string, 'visiting' | 'done'>()
  const visit = (item: T) => {
    const slug = item.manifest.slug
    if (state.get(slug) === 'done') return
    if (state.get(slug) === 'visiting') throw new Error(`remix cycle through "${slug}"`)
    state.set(slug, 'visiting')
    const parent = item.manifest.provenance.basedOn
    if (parent) {
      const parentItem = bySlug.get(parent)
      if (!parentItem) throw new Error(`"${slug}" is based on "${parent}", which is not in the catalog`)
      visit(parentItem)
    }
    state.set(slug, 'done')
    ordered.push(item)
  }
  for (const item of items) visit(item)
  return ordered
}

export interface SeedResult {
  created: string[]
  skipped: string[]
}

/**
 * 创世导入：把仓库里已有的条目原样登记到链上并直接标记为通过。
 * 这些条目在上链之前已经由维护者审过；先登记也让它们的 slug 不会被别人抢先投稿占用。
 * 可以重复运行：已经登记过的 slug 会跳过，中途失败后重跑只补缺的。
 * 调用方需要持有 CURATION_ROLE（部署模块里的 seeder）。
 */
export async function seedCatalog(
  registry: ContractReturnType<'MotifRegistry'>,
  publicClient: PublicClient,
  account: Address,
  items: readonly ItemSource[],
): Promise<SeedResult> {
  const result: SeedResult = { created: [], skipped: [] }
  for (const item of orderByLineage(items)) {
    const slug = item.manifest.slug
    if ((await registry.read.itemIdOfSlug([slug])) !== 0n) {
      result.skipped.push(slug)
      continue
    }
    const parentSlug = item.manifest.provenance.basedOn
    const parentId = parentSlug ? await registry.read.itemIdOfSlug([parentSlug]) : 0n
    const parentVersion = parentId === 0n ? 0 : (await registry.read.getItem([parentId])).currentVersion

    const created = await registry.write.createItem([account, slug, parentId, parentVersion, await versionInput(item)], {
      account,
    })
    await publicClient.waitForTransactionReceipt({ hash: created })
    const itemId = await registry.read.itemIdOfSlug([slug])
    const approved = await registry.write.setVersionStatus([itemId, 1, APPROVED], { account })
    await publicClient.waitForTransactionReceipt({ hash: approved })
    result.created.push(slug)
  }
  return result
}
