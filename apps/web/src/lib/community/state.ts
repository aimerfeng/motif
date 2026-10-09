import {
  applyCommunityEvents,
  createCommunityState,
  decodeCommunityLogs,
  type CommunityState,
  type IndexedItem,
  type IndexedVersion,
} from '@motif/contracts'
import { connection } from 'next/server'
import { createPublicClient, http, type Hex, type PublicClient } from 'viem'
import { getCommunityConfig, type CommunityConfig } from './config'

/*
 * 链上状态的服务端缓存：按区块增量拉取四个合约的事件，用 @motif/contracts 的归约器折叠。
 *
 * 一个进程一份，请求之间共享；两次同步至少间隔 1 秒，并发请求等同一次同步。
 * 每次同步先核对上次同步到的区块哈希：本地链重启或发生重组时整份重建（本地链重启后合约地址不变、区块号从头开始）。
 * 生产环境（多实例、历史很长）应该换成独立的索引服务写数据库，见 ADR 0005。
 */

interface Synced {
  key: string
  state: CommunityState
  blockHash: Hex | null
  blockTimes: Map<bigint, number>
  /** 最新区块的时间（秒），用来判断审核期、投票期是否已过。 */
  now: number
  syncedAt: number
  /** 同步失败后在这之前不再重试（链停了时不让每个请求都等一次超时）。 */
  retryAt: number
  /** 下一次请求必须同步（刚有交易上链），不受 1 秒的间隔限制。 */
  force: boolean
  pending: Promise<void> | null
}

export interface Community {
  config: CommunityConfig
  state: CommunityState
  client: PublicClient
  /** 最新区块时间（秒）。 */
  now: number
  /** 事件所在区块的时间（秒）。 */
  timeOf(block: bigint): number | null
}

const MIN_SYNC_INTERVAL_MS = 1000
const RETRY_AFTER_FAILURE_MS = 15_000
const LOG_CHUNK = 5_000n

/**
 * Next 的生产构建里页面和接口路由分开打包，模块级变量会各有一份。挂在 globalThis 上，整个进程只有一份状态：
 * 浏览器发完交易后 /api/community/sync 同步到的区块，紧接着打开的页面马上就能看到。
 */
const shared = ((globalThis as { __motifCommunityState?: { synced: Synced | null; clients: Map<string, PublicClient> } }).__motifCommunityState ??= {
  synced: null,
  clients: new Map(),
})

function clientFor(config: CommunityConfig): PublicClient {
  let client = shared.clients.get(config.serverRpcUrl)
  if (!client) {
    // batch：同一时刻的多个 RPC 请求合并成一个 HTTP 请求（拉区块时间时有用）。
    client = createPublicClient({ transport: http(config.serverRpcUrl, { batch: true, timeout: 5_000 }) })
    shared.clients.set(config.serverRpcUrl, client)
  }
  return client
}

/**
 * 读取社区状态（会先增量同步）。社区未配置或链连不上时返回 null。只能在服务端请求里调用。
 * atLeastBlock：刚在浏览器里发完交易时传交易所在区块，保证返回的状态已经包含它。
 */
export async function getCommunity(options: { atLeastBlock?: bigint } = {}): Promise<Community | null> {
  await connection()
  const config = await getCommunityConfig()
  if (!config) return null
  const client = clientFor(config)
  const key = `${config.chainId}:${config.contracts.registry}:${config.serverRpcUrl}`
  if (shared.synced?.key !== key) shared.synced = fresh(key)
  const target = shared.synced

  if (options.atLeastBlock !== undefined && target.state.block < options.atLeastBlock) {
    if (target.pending) await target.pending.catch(() => {})
    // 等完正在进行的同步再看一次，可能已经追上了。用单独的标记强制同步，不清空 syncedAt：
    // 强制同步失败时仍然可以用上一次的状态，不会让整个社区显示成“未连接”。
    if (target.state.block < options.atLeastBlock) target.force = true
  }
  if (!target.pending && (target.force || Date.now() - target.syncedAt > MIN_SYNC_INTERVAL_MS) && Date.now() > target.retryAt) {
    target.force = false
    target.pending = sync(target, config, client)
      .catch((error: unknown) => {
        target.retryAt = Date.now() + RETRY_AFTER_FAILURE_MS
        throw error
      })
      .finally(() => {
        target.pending = null
      })
  }
  try {
    if (target.pending) await target.pending
  } catch (error) {
    console.error('[community] sync failed', error)
  }
  // 从来没同步成功过（链连不上）就当社区没开；同步过的话先用上一次的状态。
  if (target.syncedAt === 0) return null
  return { config, state: target.state, client, now: target.now, timeOf: (block) => target.blockTimes.get(block) ?? null }
}

function fresh(key: string): Synced {
  return { key, state: createCommunityState(), blockHash: null, blockTimes: new Map(), now: 0, syncedAt: 0, retryAt: 0, force: false, pending: null }
}

async function sync(target: Synced, config: CommunityConfig, client: PublicClient): Promise<void> {
  // 上次同步到的区块还在不在原来的链上：不在就整份重建。
  if (target.blockHash !== null) {
    const block = await client.getBlock({ blockNumber: target.state.block }).catch(() => null)
    // 保留 pending：这一轮同步还在进行，清掉它会让并发的请求再起一轮，同一批事件被折叠两次。
    if (block?.hash !== target.blockHash) Object.assign(target, { ...fresh(target.key), pending: target.pending })
  }

  const head = await client.getBlock({ blockTag: 'latest' })
  const addresses = [config.contracts.registry, config.contracts.curation, config.contracts.identity, config.contracts.governor]
  let from = target.state.block < config.startBlock ? config.startBlock : target.state.block + 1n
  while (from <= head.number) {
    const to = from + LOG_CHUNK - 1n < head.number ? from + LOG_CHUNK - 1n : head.number
    const logs = await client.getLogs({ address: addresses, fromBlock: from, toBlock: to })
    const events = decodeCommunityLogs(logs, config.contracts)
    const blocks = [...new Set(events.map((event) => event.blockNumber))].filter((block) => !target.blockTimes.has(block))
    const times = await Promise.all(blocks.map((blockNumber) => client.getBlock({ blockNumber })))
    for (const block of times) target.blockTimes.set(block.number, Number(block.timestamp))
    applyCommunityEvents(target.state, events)
    from = to + 1n
  }
  target.state.block = head.number
  target.blockHash = head.hash
  target.now = Number(head.timestamp)
  target.syncedAt = Date.now()
}

// ---------------------------------------------------------------- 查询

export function latestVersion(item: IndexedItem): IndexedVersion | null {
  return item.versions.at(-1) ?? null
}

export function currentVersion(item: IndexedItem): IndexedVersion | null {
  return item.versions.find((version) => version.version === item.currentVersion) ?? null
}

/** 在市场里展示的条目：有通过的版本且没被下架。 */
export function isListed(item: IndexedItem): boolean {
  return item.currentVersion !== 0 && !item.delisted
}

/** 某个内容哈希最近一次登记在哪个版本（任何状态都算，只要条目没被下架）。 */
export function findVersionByHash(state: CommunityState, hash: Hex): { item: IndexedItem; version: IndexedVersion } | null {
  let found: { item: IndexedItem; version: IndexedVersion } | null = null
  for (const item of state.items.values()) {
    for (const version of item.versions) {
      if (version.contentHash === hash && (!found || version.submittedBlock >= found.version.submittedBlock)) found = { item, version }
    }
  }
  return found && !found.item.delisted ? found : null
}

/** 进行中的审核，按截止时间排序。 */
export function openReviews(state: CommunityState): { item: IndexedItem; version: IndexedVersion }[] {
  const open: { item: IndexedItem; version: IndexedVersion }[] = []
  for (const item of state.items.values()) {
    for (const version of item.versions) if (version.review?.outcome === 'open') open.push({ item, version })
  }
  return open.sort((a, b) => Number(a.version.review!.deadline - b.version.review!.deadline))
}

/** 某个条目的 Remix（直接子条目）。 */
export function remixesOf(state: CommunityState, itemId: bigint): IndexedItem[] {
  return [...state.items.values()].filter((item) => item.parentId === itemId && !item.abandoned)
}

/** 站点托管的小段文字（审核意见、资料、下架理由）只有被链上引用之后才对外提供。 */
export function isReferencedBlob(state: CommunityState, hash: Hex): boolean {
  for (const profile of state.profiles.values()) if (profile.metadataHash === hash) return true
  for (const item of state.items.values()) {
    if (item.delistReason === hash) return true
    for (const version of item.versions) if (version.review?.votes.some((vote) => vote.noteHash === hash)) return true
  }
  return false
}
