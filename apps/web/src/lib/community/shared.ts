import { defineChain, formatUnits, type Address, type Chain, type Hex } from 'viem'

/*
 * 社区功能里服务端和浏览器都要用的部分：链定义、签名文案、格式化。这里不能引入 Node 模块。
 */

export interface CommunityContracts {
  registry: Address
  curation: Address
  identity: Address
  governor: Address
  token: Address
  timelock: Address
}

/** 给浏览器的链配置（钱包添加网络、发交易用），不含服务端内部的 RPC 地址。 */
export interface PublicCommunityConfig {
  chainId: number
  chainName: string
  rpcUrl: string
  contracts: CommunityContracts
  /** 本地开发链：可以领测试币，界面上会提示这是测试环境。 */
  local: boolean
}

export function chainOf(config: PublicCommunityConfig): Chain {
  return defineChain({
    id: config.chainId,
    name: config.chainName,
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: [config.rpcUrl] } },
    ...(config.local ? { testnet: true } : {}),
  })
}

/**
 * 上传源码时钱包签的文字。内容哈希已经锁定了源码，所以不需要随机数：同一个人重复上传同一份内容是幂等的。
 * 站点只为“上传者 = 链上作者”的哈希提供源码，抢先把别人的哈希登记上链的人拿不出源码（见 ADR 0005）。
 */
export function uploadMessage(contentHash: Hex, uploader: Address): string {
  return ['Motif 源码上传 / Motif source upload', '', `内容哈希 / Content hash: ${contentHash}`, `上传者 / Uploader: ${uploader}`].join('\n')
}

export const HASH_PATTERN = /^0x[0-9a-f]{64}$/

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

/** MOTIF 数量：最多保留两位小数，去掉多余的零。 */
export function formatMotif(amount: bigint): string {
  const [whole, fraction = ''] = formatUnits(amount, 18).split('.')
  const trimmed = fraction.slice(0, 2).replace(/0+$/, '')
  return `${Number(whole).toLocaleString('en-US')}${trimmed ? `.${trimmed}` : ''}`
}

/** 创作者资料（资料 JSON 托管在站点，链上存它的 sha256）。 */
export interface ProfileMetadata {
  name?: string
  bio?: string
  links?: string[]
}

export const PROFILE_LIMITS = { name: 48, bio: 280, links: 4, link: 200 } as const

const HTTP_LINK = /^https?:\/\/\S+$/

/**
 * 读出托管的资料 JSON 并逐项校验。上传时虽然校验过，但资料哈希可以绕过站点直接写进合约，
 * 所以读的时候再校验一次：不合格的字段丢掉，链接只认 http(s)。
 */
export function parseProfileMetadata(text: string | null): ProfileMetadata {
  if (!text) return {}
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return {}
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return {}
  const { name, bio, links } = data as Record<string, unknown>
  const metadata: ProfileMetadata = {}
  if (typeof name === 'string' && name.length <= PROFILE_LIMITS.name) metadata.name = name
  if (typeof bio === 'string' && bio.length <= PROFILE_LIMITS.bio) metadata.bio = bio
  if (Array.isArray(links)) {
    const valid = links.filter((link): link is string => typeof link === 'string' && link.length <= PROFILE_LIMITS.link && HTTP_LINK.test(link))
    if (valid.length > 0) metadata.links = valid.slice(0, PROFILE_LIMITS.links)
  }
  return metadata
}

export const NOTE_LIMIT = 4000
