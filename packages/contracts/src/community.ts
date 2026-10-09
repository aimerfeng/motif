import { getAddress, keccak256, parseEventLogs, toHex, type Address, type Log } from 'viem'
import type { Hex } from './content-hash.ts'
import { bytes32ToSpdx } from './encoding.ts'
import { motifCurationAbi, motifGovernorAbi, motifIdentityAbi, motifRegistryAbi } from './generated/abi.ts'

/*
 * 链上事件 → 社区状态。
 *
 * 站点（以及将来任何第三方索引器）按区块顺序把四个合约的事件喂进来，得到条目、版本、审核、资料、
 * 角色和提案的完整视图。这里只做纯折叠，不访问网络：同样的事件序列永远得到同样的状态，
 * 可以在测试里拿真实部署的事件和合约读数对照。
 */

/** 与合约里枚举的顺序一一对应。 */
export const VERSION_STATUS = ['none', 'pending', 'approved', 'rejected', 'withdrawn'] as const
export const REVIEW_OUTCOME = ['none', 'open', 'approved', 'rejected', 'slashed', 'withdrawn', 'expired'] as const
export const VERDICTS = ['approve', 'reject', 'violation'] as const
/** OpenZeppelin IGovernor.ProposalState */
export const PROPOSAL_STATES = ['pending', 'active', 'canceled', 'defeated', 'succeeded', 'queued', 'expired', 'executed'] as const
/** GovernorCountingSimple：0 反对、1 赞成、2 弃权。 */
export const VOTE_SUPPORT = ['against', 'for', 'abstain'] as const

export type VersionStatus = (typeof VERSION_STATUS)[number]
export type ReviewOutcome = (typeof REVIEW_OUTCOME)[number]
export type Verdict = (typeof VERDICTS)[number]
export type ProposalState = (typeof PROPOSAL_STATES)[number]
export type VoteSupport = (typeof VOTE_SUPPORT)[number]

export const ROLES = {
  admin: '0x0000000000000000000000000000000000000000000000000000000000000000',
  curator: keccak256(toHex('CURATOR_ROLE')),
  moderator: keccak256(toHex('MODERATOR_ROLE')),
  curation: keccak256(toHex('CURATION_ROLE')),
  issuer: keccak256(toHex('ISSUER_ROLE')),
} as const satisfies Record<string, Hex>

export interface CommunityAddresses {
  registry: Address
  curation: Address
  identity: Address
  governor: Address
}

export interface CurationParams {
  bond: bigint
  quorum: number
  reviewPeriod: number
  publishReward: bigint
  remixReward: bigint
  publishReputation: bigint
  remixReputation: bigint
  curatorReputation: bigint
  violationPenalty: bigint
}

export interface IndexedVote {
  curator: Address
  verdict: Verdict
  /** 审核意见全文的 sha256（全文由站点托管）；0 表示没有写意见。 */
  noteHash: Hex
  block: bigint
}

export interface IndexedReward {
  to: Address
  paid: bigint
  owed: bigint
}

export interface IndexedReview {
  submitter: Address
  bond: bigint
  /** 审核截止时间（秒）。 */
  deadline: bigint
  /** 开审时的法定票数。 */
  quorum: number
  outcome: ReviewOutcome
  votes: IndexedVote[]
  rewards: IndexedReward[]
  closedBlock: bigint | null
}

export interface IndexedVersion {
  version: number
  contentHash: Hex
  license: string
  author: Address
  upstreamRepo: string
  upstreamCommit: Hex | null
  status: VersionStatus
  submittedBlock: bigint
  review: IndexedReview | null
}

export interface IndexedItem {
  id: bigint
  slug: string
  maintainer: Address
  pendingMaintainer: Address | null
  parentId: bigint
  parentVersion: number
  delisted: boolean
  /** 下架或恢复时附带的理由（全文的 sha256）。 */
  delistReason: Hex | null
  /** 最新一个审核通过的版本，0 表示还没有。 */
  currentVersion: number
  /** 第 1 版没通过、slug 已经释放。 */
  abandoned: boolean
  createdBlock: bigint
  versions: IndexedVersion[]
}

export interface IndexedProfile {
  account: Address
  handle: string | null
  metadataHash: Hex | null
  reputation: bigint
  registeredBlock: bigint | null
}

export interface IndexedProposalVote {
  voter: Address
  support: VoteSupport
  weight: bigint
  reason: string
}

export interface IndexedProposal {
  id: bigint
  proposer: Address
  targets: Address[]
  values: bigint[]
  calldatas: Hex[]
  description: string
  voteStart: bigint
  voteEnd: bigint
  tally: Record<VoteSupport, bigint>
  votes: IndexedProposalVote[]
  eta: bigint | null
  executed: boolean
  canceled: boolean
  createdBlock: bigint
}

export interface CommunityState {
  /** 已经折叠到的最后一个区块。 */
  block: bigint
  items: Map<bigint, IndexedItem>
  /** slug 当前属于哪个条目（释放后的 slug 不在这里）。 */
  slugs: Map<string, bigint>
  /** 内容哈希 → 登记它的版本。被驳回、撤回的版本会释放哈希。 */
  contents: Map<Hex, { itemId: bigint; version: number }>
  profiles: Map<Address, IndexedProfile>
  handles: Map<string, Address>
  /** 审核合约的角色成员。 */
  curators: Set<Address>
  moderators: Set<Address>
  params: CurationParams | null
  paused: boolean
  proposals: Map<bigint, IndexedProposal>
}

export function createCommunityState(): CommunityState {
  return {
    block: -1n,
    items: new Map(),
    slugs: new Map(),
    contents: new Map(),
    profiles: new Map(),
    handles: new Map(),
    curators: new Set(),
    moderators: new Set(),
    params: null,
    paused: false,
    proposals: new Map(),
  }
}

const ZERO_HASH = ROLES.admin

/** 把原始日志按合约解码，并按（区块，日志序号）排好。不属于这四个合约的日志会被忽略。 */
export function decodeCommunityLogs(logs: readonly Log[], addresses: CommunityAddresses) {
  const pick = (address: Address) => logs.filter((log) => log.address.toLowerCase() === address.toLowerCase())
  const events = [
    ...parseEventLogs({ abi: motifRegistryAbi, logs: pick(addresses.registry) }).map((event) => ({ ...event, contract: 'registry' as const })),
    ...parseEventLogs({ abi: motifCurationAbi, logs: pick(addresses.curation) }).map((event) => ({ ...event, contract: 'curation' as const })),
    ...parseEventLogs({ abi: motifIdentityAbi, logs: pick(addresses.identity) }).map((event) => ({ ...event, contract: 'identity' as const })),
    ...parseEventLogs({ abi: motifGovernorAbi, logs: pick(addresses.governor) }).map((event) => ({ ...event, contract: 'governor' as const })),
  ]
  return events.sort((a, b) => (a.blockNumber === b.blockNumber ? a.logIndex - b.logIndex : a.blockNumber < b.blockNumber ? -1 : 1))
}

export type CommunityEvent = ReturnType<typeof decodeCommunityLogs>[number]

/** 按顺序把事件折叠进状态（原地修改）。 */
export function applyCommunityEvents(state: CommunityState, events: readonly CommunityEvent[]): void {
  for (const event of events) {
    switch (event.contract) {
      case 'registry':
        applyRegistry(state, event)
        break
      case 'curation':
        applyCuration(state, event)
        break
      case 'identity':
        applyIdentity(state, event)
        break
      case 'governor':
        applyGovernor(state, event)
        break
    }
    if (event.blockNumber > state.block) state.block = event.blockNumber
  }
}

type EventOf<C extends CommunityEvent['contract']> = Extract<CommunityEvent, { contract: C }>

function applyRegistry(state: CommunityState, event: EventOf<'registry'>) {
  switch (event.eventName) {
    case 'ItemCreated': {
      const { itemId, slug, maintainer, parentId, parentVersion } = event.args
      state.items.set(itemId, {
        id: itemId,
        slug,
        maintainer,
        pendingMaintainer: null,
        parentId,
        parentVersion,
        delisted: false,
        delistReason: null,
        currentVersion: 0,
        abandoned: false,
        createdBlock: event.blockNumber,
        versions: [],
      })
      state.slugs.set(slug, itemId)
      return
    }
    case 'VersionSubmitted': {
      const { itemId, version, author, contentHash, license, upstreamRepo, upstreamCommit } = event.args
      const item = state.items.get(itemId)
      if (!item) return
      item.versions.push({
        version,
        contentHash,
        license: bytes32ToSpdx(license),
        author,
        upstreamRepo,
        upstreamCommit: /^0x0+$/.test(upstreamCommit) ? null : upstreamCommit,
        status: 'pending',
        submittedBlock: event.blockNumber,
        review: null,
      })
      state.contents.set(contentHash, { itemId, version })
      return
    }
    case 'VersionStatusChanged': {
      const { itemId, version, status } = event.args
      const item = state.items.get(itemId)
      const entry = item?.versions.find((v) => v.version === version)
      if (!item || !entry) return
      entry.status = VERSION_STATUS[status] ?? 'none'
      if (entry.status === 'approved') item.currentVersion = version
      else state.contents.delete(entry.contentHash)
      return
    }
    case 'SlugReleased': {
      const item = state.items.get(event.args.itemId)
      if (item) item.abandoned = true
      if (state.slugs.get(event.args.slug) === event.args.itemId) state.slugs.delete(event.args.slug)
      return
    }
    case 'ItemDelisted': {
      const item = state.items.get(event.args.itemId)
      if (!item) return
      item.delisted = event.args.delisted
      item.delistReason = event.args.reasonHash === ZERO_HASH ? null : event.args.reasonHash
      return
    }
    case 'MaintainerTransferStarted': {
      const item = state.items.get(event.args.itemId)
      if (item) item.pendingMaintainer = /^0x0+$/.test(event.args.to) ? null : event.args.to
      return
    }
    case 'MaintainerTransferred': {
      const item = state.items.get(event.args.itemId)
      if (!item) return
      item.maintainer = event.args.to
      item.pendingMaintainer = null
      return
    }
    default:
      return
  }
}

function applyCuration(state: CommunityState, event: EventOf<'curation'>) {
  switch (event.eventName) {
    case 'ParamsUpdated': {
      const p = event.args.params
      state.params = {
        bond: p.bond,
        quorum: p.quorum,
        reviewPeriod: p.reviewPeriod,
        publishReward: p.publishReward,
        remixReward: p.remixReward,
        publishReputation: p.publishReputation,
        remixReputation: p.remixReputation,
        curatorReputation: p.curatorReputation,
        violationPenalty: p.violationPenalty,
      }
      return
    }
    case 'ReviewOpened': {
      const entry = versionOf(state, event.args.itemId, event.args.version)
      if (!entry) return
      entry.review = {
        submitter: event.args.submitter,
        bond: event.args.bond,
        deadline: event.args.deadline,
        // 合约在开审时快照法定票数；事件按顺序折叠，此刻的参数就是当时的参数。
        quorum: state.params?.quorum ?? 0,
        outcome: 'open',
        votes: [],
        rewards: [],
        closedBlock: null,
      }
      return
    }
    case 'Voted': {
      const review = versionOf(state, event.args.itemId, event.args.version)?.review
      review?.votes.push({
        curator: event.args.curator,
        verdict: VERDICTS[event.args.verdict] ?? 'reject',
        noteHash: event.args.noteHash,
        block: event.blockNumber,
      })
      return
    }
    case 'ReviewClosed': {
      const review = versionOf(state, event.args.itemId, event.args.version)?.review
      if (!review) return
      review.outcome = REVIEW_OUTCOME[event.args.outcome] ?? 'none'
      review.closedBlock = event.blockNumber
      return
    }
    case 'RewardPaid': {
      // 奖励在结算交易里发出，属于该条目第 1 版的审核（只有新条目发奖励）。
      const review = versionOf(state, event.args.itemId, 1)?.review
      review?.rewards.push({ to: event.args.to, paid: event.args.paid, owed: event.args.owed })
      return
    }
    case 'RoleGranted':
    case 'RoleRevoked': {
      const set = event.args.role === ROLES.curator ? state.curators : event.args.role === ROLES.moderator ? state.moderators : null
      if (!set) return
      if (event.eventName === 'RoleGranted') set.add(event.args.account)
      else set.delete(event.args.account)
      return
    }
    case 'Paused':
      state.paused = true
      return
    case 'Unpaused':
      state.paused = false
      return
    default:
      return
  }
}

function applyIdentity(state: CommunityState, event: EventOf<'identity'>) {
  switch (event.eventName) {
    case 'ProfileRegistered': {
      const profile = profileOf(state, event.args.account)
      profile.handle = event.args.handle
      profile.metadataHash = event.args.metadataHash === ZERO_HASH ? null : event.args.metadataHash
      profile.registeredBlock = event.blockNumber
      state.handles.set(event.args.handle, event.args.account)
      return
    }
    case 'HandleChanged': {
      const profile = profileOf(state, event.args.account)
      profile.handle = event.args.handle
      state.handles.set(event.args.handle, event.args.account)
      return
    }
    case 'MetadataUpdated': {
      const profile = profileOf(state, event.args.account)
      profile.metadataHash = event.args.metadataHash === ZERO_HASH ? null : event.args.metadataHash
      return
    }
    case 'ProfileModerated': {
      const profile = profileOf(state, event.args.account)
      profile.handle = null
      profile.metadataHash = null
      state.handles.delete(event.args.handle)
      return
    }
    case 'ReputationChanged':
      profileOf(state, event.args.account).reputation = event.args.total
      return
    default:
      return
  }
}

function applyGovernor(state: CommunityState, event: EventOf<'governor'>) {
  switch (event.eventName) {
    case 'ProposalCreated': {
      const { proposalId, proposer, targets, values, calldatas, voteStart, voteEnd, description } = event.args
      state.proposals.set(proposalId, {
        id: proposalId,
        proposer,
        targets: [...targets],
        values: [...values],
        calldatas: [...calldatas],
        description,
        voteStart,
        voteEnd,
        tally: { against: 0n, for: 0n, abstain: 0n },
        votes: [],
        eta: null,
        executed: false,
        canceled: false,
        createdBlock: event.blockNumber,
      })
      return
    }
    case 'VoteCast':
    case 'VoteCastWithParams': {
      const proposal = state.proposals.get(event.args.proposalId)
      if (!proposal) return
      const support = VOTE_SUPPORT[event.args.support] ?? 'abstain'
      proposal.tally[support] += event.args.weight
      proposal.votes.push({ voter: event.args.voter, support, weight: event.args.weight, reason: event.args.reason })
      return
    }
    case 'ProposalExtended': {
      const proposal = state.proposals.get(event.args.proposalId)
      if (proposal) proposal.voteEnd = BigInt(event.args.extendedDeadline)
      return
    }
    case 'ProposalQueued': {
      const proposal = state.proposals.get(event.args.proposalId)
      if (proposal) proposal.eta = event.args.etaSeconds
      return
    }
    case 'ProposalExecuted': {
      const proposal = state.proposals.get(event.args.proposalId)
      if (proposal) proposal.executed = true
      return
    }
    case 'ProposalCanceled': {
      const proposal = state.proposals.get(event.args.proposalId)
      if (proposal) proposal.canceled = true
      return
    }
    default:
      return
  }
}

function versionOf(state: CommunityState, itemId: bigint, version: number) {
  return state.items.get(itemId)?.versions.find((entry) => entry.version === version)
}

function profileOf(state: CommunityState, account: Address): IndexedProfile {
  const key = getAddress(account)
  let profile = state.profiles.get(key)
  if (!profile) {
    profile = { account: key, handle: null, metadataHash: null, reputation: 0n, registeredBlock: null }
    state.profiles.set(key, profile)
  }
  return profile
}
