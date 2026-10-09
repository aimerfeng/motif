import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { getAddress } from 'viem'
import type { CommunityContracts, PublicCommunityConfig } from './shared'

/*
 * 社区链的配置，全部来自环境变量和 Ignition 的部署记录（合约地址只在部署记录里出现一次）：
 *
 * - MOTIF_CHAIN_RPC_URL：服务端读链用的 RPC。不设置就关闭社区功能；开发模式下如果跑过 `pnpm dev:chain`
 *   （有本地部署记录），默认连本地链 127.0.0.1:8545。连不上同样关闭。
 * - MOTIF_CHAIN_PUBLIC_RPC_URL：给钱包“添加网络”用的公开 RPC。本地链可以不设（同上）；其他链必须设，
 *   不会回落到服务端的 RPC：那个地址里常常带着服务商的 API key，不能发给浏览器。
 * - MOTIF_CHAIN_DEPLOYMENT：部署记录 deployed_addresses.json 的路径，默认按链 id 找
 *   packages/contracts/ignition/deployments/chain-<id>/。
 * - MOTIF_CHAIN_START_BLOCK：从哪个区块开始扫事件（部署所在区块），默认 0。
 * - MOTIF_CHAIN_NAME：钱包里显示的网络名。
 */

const REPO_ROOT = path.resolve(/*turbopackIgnore: true*/ process.cwd(), '../..')
const LOCAL_RPC = 'http://127.0.0.1:8545'
const LOCAL_CHAIN_ID = 31337

const IGNITION_KEYS: Record<keyof CommunityContracts, string> = {
  registry: 'Motif#MotifRegistry',
  curation: 'Motif#MotifCuration',
  identity: 'Motif#MotifIdentity',
  governor: 'Motif#MotifGovernor',
  token: 'Motif#MotifToken',
  timelock: 'Motif#MotifTimelock',
}

export interface CommunityConfig extends PublicCommunityConfig {
  /** 服务端读链用的 RPC。 */
  serverRpcUrl: string
  startBlock: bigint
}

const LOCAL_DEPLOYMENT = path.join(/*turbopackIgnore: true*/ REPO_ROOT, 'packages/contracts/ignition/deployments', `chain-${LOCAL_CHAIN_ID}`, 'deployed_addresses.json')
// 连不上的 RPC 过一会儿再试：在 Windows 上连一个没人监听的本地端口要等近两秒，不能让每个请求都等一次。
const RETRY_UNREACHABLE_MS = 15_000

const chainIds = new Map<string, number>()
const unreachableUntil = new Map<string, number>()

function defaultRpcUrl(): string | undefined {
  if (process.env.MOTIF_CHAIN_RPC_URL) return process.env.MOTIF_CHAIN_RPC_URL
  return process.env.NODE_ENV === 'development' && existsSync(LOCAL_DEPLOYMENT) ? LOCAL_RPC : undefined
}

async function chainIdOf(rpcUrl: string): Promise<number | null> {
  const known = chainIds.get(rpcUrl)
  if (known !== undefined) return known
  if ((unreachableUntil.get(rpcUrl) ?? 0) > Date.now()) return null
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: [] }),
      signal: AbortSignal.timeout(1500),
    })
    const { result } = (await response.json()) as { result?: string }
    if (!result) return null
    const id = Number.parseInt(result, 16)
    chainIds.set(rpcUrl, id)
    return id
  } catch {
    unreachableUntil.set(rpcUrl, Date.now() + RETRY_UNREACHABLE_MS)
    return null
  }
}

export async function getCommunityConfig(): Promise<CommunityConfig | null> {
  const serverRpcUrl = defaultRpcUrl()
  if (!serverRpcUrl) return null
  const chainId = process.env.MOTIF_CHAIN_ID ? Number(process.env.MOTIF_CHAIN_ID) : await chainIdOf(serverRpcUrl)
  if (chainId === null) return null

  const file =
    process.env.MOTIF_CHAIN_DEPLOYMENT ??
    path.join(/*turbopackIgnore: true*/ REPO_ROOT, 'packages/contracts/ignition/deployments', `chain-${chainId}`, 'deployed_addresses.json')
  let deployed: Record<string, string>
  try {
    deployed = JSON.parse(await readFile(file, 'utf8')) as Record<string, string>
  } catch {
    return null
  }
  const contracts = {} as CommunityContracts
  for (const [key, name] of Object.entries(IGNITION_KEYS) as [keyof CommunityContracts, string][]) {
    const address = deployed[name]
    if (!address) return null
    contracts[key] = getAddress(address)
  }

  const local = chainId === LOCAL_CHAIN_ID
  const publicRpcUrl = process.env.MOTIF_CHAIN_PUBLIC_RPC_URL ?? (local ? serverRpcUrl : undefined)
  if (!publicRpcUrl) {
    console.error('[community] MOTIF_CHAIN_PUBLIC_RPC_URL is required for non-local chains; the community stays off until it is set')
    return null
  }
  return {
    chainId,
    chainName: process.env.MOTIF_CHAIN_NAME ?? (local ? 'Motif Local' : `Chain ${chainId}`),
    rpcUrl: publicRpcUrl,
    serverRpcUrl,
    startBlock: BigInt(process.env.MOTIF_CHAIN_START_BLOCK ?? '0'),
    contracts,
    local,
  }
}

export function toPublicConfig(config: CommunityConfig): PublicCommunityConfig {
  return { chainId: config.chainId, chainName: config.chainName, rpcUrl: config.rpcUrl, contracts: config.contracts, local: config.local }
}
