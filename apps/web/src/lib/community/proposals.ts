import {
  motifCurationAbi,
  motifGovernorAbi,
  motifIdentityAbi,
  motifRegistryAbi,
  motifTimelockAbi,
  motifTokenAbi,
  ROLES,
  bytes32ToSpdx,
  type IndexedProposal,
} from '@motif/contracts'
import { decodeFunctionData, getAddress, type Abi, type Address, type Hex } from 'viem'
import type { CommunityContracts } from './shared'
import { formatMotif } from './shared'

/*
 * 提案里的调用解码成人能读的动作。只认识社区自己的合约；别的调用原样显示目标地址和 calldata，
 * 投票的人要能看清楚自己在批准什么。
 */

export interface DecodedAction {
  contract: keyof CommunityContracts | null
  target: Address
  /** 解码出来的函数名；解不出来时为 null。 */
  fn: string | null
  args: string[]
  value: string
  calldata: Hex
}

const ABIS: Record<keyof CommunityContracts, Abi> = {
  registry: motifRegistryAbi,
  curation: motifCurationAbi,
  identity: motifIdentityAbi,
  governor: motifGovernorAbi,
  token: motifTokenAbi,
  timelock: motifTimelockAbi,
}

const ROLE_NAMES = new Map<string, string>(Object.entries(ROLES).map(([name, hash]) => [hash, `${name.toUpperCase()}_ROLE`]))
// 只有这些函数的 bytes32 参数是角色；其他函数里的 bytes32（例如空的理由哈希）原样显示，免得把 0 显示成 ADMIN_ROLE。
const ROLE_FUNCTIONS = new Set(['grantRole', 'revokeRole', 'renounceRole'])

function formatArg(value: unknown, fn: string): string {
  if (typeof value === 'string' && ROLE_FUNCTIONS.has(fn) && ROLE_NAMES.has(value)) return ROLE_NAMES.get(value)!
  if (typeof value === 'string' && fn === 'setLicenseAllowed' && /^0x[0-9a-f]{64}$/i.test(value)) return bytes32ToSpdx(value as Hex)
  if (typeof value === 'bigint') return fn === 'transfer' || fn === 'mint' || fn === 'withdrawRewards' ? `${formatMotif(value)} MOTIF` : value.toString()
  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value, (_key, inner: unknown) => (typeof inner === 'bigint' ? inner.toString() : inner))
  }
  return String(value)
}

export function decodeActions(proposal: Pick<IndexedProposal, 'targets' | 'values' | 'calldatas'>, contracts: CommunityContracts): DecodedAction[] {
  return proposal.targets.map((target, index) => {
    const calldata = proposal.calldatas[index]!
    const value = proposal.values[index]!.toString()
    const contract = (Object.keys(contracts) as (keyof CommunityContracts)[]).find((key) => getAddress(contracts[key]) === getAddress(target)) ?? null
    if (!contract) return { contract, target, fn: null, args: [], value, calldata }
    try {
      const decoded = decodeFunctionData({ abi: ABIS[contract], data: calldata })
      return { contract, target, fn: decoded.functionName, args: (decoded.args ?? []).map((arg) => formatArg(arg, decoded.functionName)), value, calldata }
    } catch {
      return { contract, target, fn: null, args: [], value, calldata }
    }
  })
}

/** 提案描述的第一行是标题（去掉 Markdown 的 #），其余是正文。 */
export function splitDescription(description: string): { title: string; body: string } {
  const [first = '', ...rest] = description.split('\n')
  return { title: first.replace(/^#+\s*/, '').trim() || description.slice(0, 80), body: rest.join('\n').trim() }
}
