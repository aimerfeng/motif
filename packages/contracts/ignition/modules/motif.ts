import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'
import { ALLOWED_SPDX } from '@motif/schema'
import { keccak256, parseEther, toHex, zeroAddress, zeroHash } from 'viem'
import { spdxToBytes32 } from '../../src/encoding.ts'

const DAY = 24n * 60n * 60n

const role = (name: string) => keccak256(toHex(name))
const DEFAULT_ADMIN_ROLE = zeroHash

/**
 * 部署整套社区合约。完成后部署者手里不剩任何权限：
 * 合约的管理员都是 DAO 时间锁，时间锁只听治理合约的，治理合约只认 MOTIF 投票。
 *
 * 必填参数（见 ignition/parameters/local.json）：
 * - moderator：应急版主，上线时应该是多签。可以下架违规内容、封禁冒充的 handle、在垃圾投稿潮时暂停投稿；
 *   DAO 随时可以撤换。
 * - curators：创世审核员，之后的任免走治理。
 * - genesisHolder：创世流通份额的接收方（例如分发合约或多签），治理在有人持票之前无法启动。
 */
export default buildModule('Motif', (m) => {
  const deployer = m.getAccount(0)

  const moderator = m.getParameter<string>('moderator')
  const curators = m.getParameter<string[]>('curators')
  const genesisHolder = m.getParameter<string>('genesisHolder')
  // 创世导入（scripts/seed-catalog.ts）期间临时持有登记权限的地址，导入完自行放弃。
  const seeder = m.getParameter('seeder', deployer)

  const treasuryAllocation = m.getParameter('treasuryAllocation', parseEther('600000000'))
  const genesisAllocation = m.getParameter('genesisAllocation', parseEther('100000000'))
  const rewardPoolAllocation = m.getParameter('rewardPoolAllocation', parseEther('1000000'))
  const timelockDelay = m.getParameter('timelockDelay', 2n * DAY)
  const governorConfig = m.getParameter('governor', {
    votingDelay: DAY,
    votingPeriod: 5n * DAY,
    proposalThreshold: parseEther('1000000'),
    quorumPercent: 4n,
    lateQuorumExtension: DAY,
  })
  const curationParams = m.getParameter('curation', {
    bond: parseEther('100'),
    quorum: 2n,
    reviewPeriod: 7n * DAY,
    publishReward: parseEther('1000'),
    remixReward: parseEther('200'),
    publishReputation: 10n,
    remixReputation: 5n,
    curatorReputation: 1n,
    violationPenalty: 20n,
  })

  // ---------------------------------------------------------------- 治理

  // 执行者是 address(0)：提案排队到期后任何人都可以触发执行。
  const timelock = m.contract('MotifTimelock', [timelockDelay, [], [zeroAddress], deployer])
  const token = m.contract('MotifToken', [
    timelock,
    [timelock, genesisHolder, deployer],
    [treasuryAllocation, genesisAllocation, rewardPoolAllocation],
  ])
  const governor = m.contract('MotifGovernor', [token, timelock, governorConfig])
  const grantProposer = m.call(timelock, 'grantRole', [role('PROPOSER_ROLE'), governor], { id: 'timelock_grantProposer' })
  const grantCanceller = m.call(timelock, 'grantRole', [role('CANCELLER_ROLE'), governor], {
    id: 'timelock_grantCanceller',
  })

  // ---------------------------------------------------------------- 社区

  const identity = m.contract('MotifIdentity', [deployer, moderator])
  const registry = m.contract('MotifRegistry', [deployer, moderator, ALLOWED_SPDX.map(spdxToBytes32)])
  const curation = m.contract('MotifCuration', [
    timelock,
    token,
    registry,
    identity,
    timelock,
    moderator,
    curators,
    curationParams,
  ])

  const grantCuration = m.call(registry, 'grantRole', [role('CURATION_ROLE'), curation], { id: 'registry_grantCuration' })
  const grantSeeder = m.call(registry, 'grantRole', [role('CURATION_ROLE'), seeder], { id: 'registry_grantSeeder' })
  const grantIssuer = m.call(identity, 'grantRole', [role('ISSUER_ROLE'), curation], { id: 'identity_grantIssuer' })
  // 部署者拿到的奖励池份额原样转给审核合约，部署者不留余额。
  m.call(token, 'transfer', [curation, rewardPoolAllocation], { id: 'token_fundRewardPool' })

  // ---------------------------------------------------------------- 移交管理权

  const registryToDao = m.call(registry, 'grantRole', [DEFAULT_ADMIN_ROLE, timelock], {
    id: 'registry_grantAdminToTimelock',
    after: [grantCuration, grantSeeder],
  })
  m.call(registry, 'renounceRole', [DEFAULT_ADMIN_ROLE, deployer], { id: 'registry_renounceAdmin', after: [registryToDao] })
  const identityToDao = m.call(identity, 'grantRole', [DEFAULT_ADMIN_ROLE, timelock], {
    id: 'identity_grantAdminToTimelock',
    after: [grantIssuer],
  })
  m.call(identity, 'renounceRole', [DEFAULT_ADMIN_ROLE, deployer], { id: 'identity_renounceAdmin', after: [identityToDao] })
  m.call(timelock, 'renounceRole', [DEFAULT_ADMIN_ROLE, deployer], {
    id: 'timelock_renounceAdmin',
    after: [grantProposer, grantCanceller],
  })

  return { timelock, token, governor, identity, registry, curation }
})
