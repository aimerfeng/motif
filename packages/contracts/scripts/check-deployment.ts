import { readFile } from 'node:fs/promises'
import { ALLOWED_SPDX } from '@motif/schema'
import { network } from 'hardhat'
import { getAddress, zeroAddress, type Address } from 'viem'
import { ROLES } from '../src/community.ts'
import { spdxToBytes32 } from '../src/encoding.ts'

/**
 * 部署后的自检：核对链上的权限结构和 ADR 0005 的设计一致。正式部署后、交给社区之前必须跑一遍。
 *
 *   pnpm --filter @motif/contracts exec hardhat run scripts/check-deployment.ts --network target
 *
 * 部署记录默认读 ignition/deployments/chain-<id>（MOTIF_DEPLOYMENT_ID 可以指定别的）；
 * 部署者默认是第一个账户（MOTIF_DEPLOYER 可以指定）。有任何一项不符合就以非 0 退出。
 */
const { viem } = await network.create()
const publicClient = await viem.getPublicClient()
const chainId = await publicClient.getChainId()
const deployment = process.env.MOTIF_DEPLOYMENT_ID ?? `chain-${chainId}`
const deployed = JSON.parse(await readFile(new URL(`../ignition/deployments/${deployment}/deployed_addresses.json`, import.meta.url), 'utf8')) as Record<
  string,
  Address
>
const [signer] = await viem.getWalletClients()
const deployer = getAddress(process.env.MOTIF_DEPLOYER ?? signer!.account.address)

const registry = await viem.getContractAt('MotifRegistry', deployed['Motif#MotifRegistry']!)
const identity = await viem.getContractAt('MotifIdentity', deployed['Motif#MotifIdentity']!)
const curation = await viem.getContractAt('MotifCuration', deployed['Motif#MotifCuration']!)
const timelock = await viem.getContractAt('MotifTimelock', deployed['Motif#MotifTimelock']!)
const governor = await viem.getContractAt('MotifGovernor', deployed['Motif#MotifGovernor']!)
const token = await viem.getContractAt('MotifToken', deployed['Motif#MotifToken']!)

const checks: [string, boolean][] = []
const check = (label: string, ok: boolean) => checks.push([label, ok])

for (const [name, contract] of [
  ['registry', registry],
  ['identity', identity],
  ['curation', curation],
  ['timelock', timelock],
] as const) {
  check(`${name}: the timelock is admin`, await contract.read.hasRole([ROLES.admin, timelock.address]))
  check(`${name}: the deployer is not admin`, !(await contract.read.hasRole([ROLES.admin, deployer])))
}
check('timelock: the governor is the proposer', await timelock.read.hasRole([await timelock.read.PROPOSER_ROLE(), governor.address]))
check('timelock: the governor can cancel', await timelock.read.hasRole([await timelock.read.CANCELLER_ROLE(), governor.address]))
check('timelock: anyone can execute', await timelock.read.hasRole([await timelock.read.EXECUTOR_ROLE(), zeroAddress]))
check('timelock: the deployer cannot propose', !(await timelock.read.hasRole([await timelock.read.PROPOSER_ROLE(), deployer])))
check('token: owned by the timelock', getAddress(await token.read.owner()) === timelock.address)
check('token: the deployer holds no MOTIF', (await token.read.balanceOf([deployer])) === 0n)
check('registry: curation can register', await registry.read.hasRole([ROLES.curation, curation.address]))
check('registry: the deployer cannot register (seeding finished)', !(await registry.read.hasRole([ROLES.curation, deployer])))
check('identity: curation issues reputation', await identity.read.hasRole([ROLES.issuer, curation.address]))
for (const spdx of ALLOWED_SPDX) check(`registry: ${spdx} is allowed`, await registry.read.licenseAllowed([spdxToBytes32(spdx)]))
check('curation: the reward pool is funded', (await curation.read.rewardPool()) > 0n)
check('governor: uses the timelock', getAddress(await governor.read.timelock()) === timelock.address)

let failed = 0
for (const [label, ok] of checks) {
  console.log(`${ok ? '✓' : '✖'} ${label}`)
  if (!ok) failed++
}
console.log(failed === 0 ? `\nall ${checks.length} checks passed on chain ${chainId}` : `\n${failed} of ${checks.length} checks failed`)
if (failed > 0) process.exitCode = 1
