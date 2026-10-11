import { readFile } from 'node:fs/promises'
import { network } from 'hardhat'
import { formatEther, getAddress, parseEther, type Address, type Hex } from 'viem'
import { ROLES } from '../src/community.ts'

/**
 * 本地开发链（31337）的管理员：把一个解锁的开发账户变成什么都能做的管理员，方便在站点上把所有功能试一遍。
 *
 *   pnpm --filter @motif/contracts exec hardhat run scripts/dev-admin.ts --network localhost
 *
 * - 注册表、身份、审核三个合约的管理员和版主，审核员；
 * - 1 亿 MOTIF 并委托给自己（法定人数约 4000 万，一个人就能让提案通过）；
 * - 10 万 ETH。
 *
 * 做法是让 Hardhat 节点冒充时间锁来授权和转账，只有本地链能这样做；正式链上不存在这条路径，脚本也拒绝运行。
 * pnpm dev:chain 部署完会自动执行。MOTIF_DEV_ADMIN 可以指定地址，默认是 Hardhat 开发账户 #9。
 */
const DEFAULT_ADMIN: Address = '0xa0Ee7A142d267C1f36714E4a8F75612F20a79720'
const MOTIF_GRANT = parseEther('100000000')
const ETH_GRANT = parseEther('100000')

const { viem } = await network.create()
const publicClient = await viem.getPublicClient()
const chainId = await publicClient.getChainId()
if (chainId !== 31337) throw new Error(`dev-admin only runs on the local development chain (31337), not ${chainId}`)

const deployed = JSON.parse(await readFile(new URL(`../ignition/deployments/chain-${chainId}/deployed_addresses.json`, import.meta.url), 'utf8')) as Record<string, Address>
const admin = getAddress(process.env.MOTIF_DEV_ADMIN ?? DEFAULT_ADMIN)
const timelock = getAddress(deployed['Motif#MotifTimelock']!)
const registry = await viem.getContractAt('MotifRegistry', deployed['Motif#MotifRegistry']!)
const identity = await viem.getContractAt('MotifIdentity', deployed['Motif#MotifIdentity']!)
const curation = await viem.getContractAt('MotifCuration', deployed['Motif#MotifCuration']!)
const token = await viem.getContractAt('MotifToken', deployed['Motif#MotifToken']!)

const wait = async (hash: Hex) => {
  await publicClient.waitForTransactionReceipt({ hash })
}

/** 以时间锁（三个合约的管理员）的身份授予角色；已经有了就跳过，脚本可以重复运行。 */
async function grant(hasRole: (args: [Hex, Address]) => Promise<boolean>, grantRole: (args: [Hex, Address], options: { account: Address }) => Promise<Hex>, roles: Hex[]) {
  for (const role of roles) if (!(await hasRole([role, admin]))) await wait(await grantRole([role, admin], { account: timelock }))
}

const testClient = await viem.getTestClient()
await testClient.impersonateAccount({ address: timelock })
await testClient.setBalance({ address: timelock, value: parseEther('10') })
try {
  await grant((args) => registry.read.hasRole(args), (args, options) => registry.write.grantRole(args, options), [ROLES.admin, ROLES.moderator])
  await grant((args) => identity.read.hasRole(args), (args, options) => identity.write.grantRole(args, options), [ROLES.admin, ROLES.moderator])
  await grant((args) => curation.read.hasRole(args), (args, options) => curation.write.grantRole(args, options), [ROLES.admin, ROLES.moderator, ROLES.curator])
  const balance = await token.read.balanceOf([admin])
  if (balance < MOTIF_GRANT) await wait(await token.write.transfer([admin, MOTIF_GRANT - balance], { account: timelock }))
} finally {
  await testClient.stopImpersonatingAccount({ address: timelock })
}

await testClient.setBalance({ address: admin, value: ETH_GRANT })
// 投票权要委托以后才生效；开发账户是解锁的，可以直接用它自己的身份委托给自己。
if (getAddress(await token.read.delegates([admin])) !== admin) await wait(await token.write.delegate([admin], { account: admin }))

console.log(`dev admin ${admin}
- admin + moderator on MotifRegistry, MotifIdentity, MotifCuration; curator on MotifCuration
- ${formatEther(await token.read.balanceOf([admin]))} MOTIF, ${formatEther(await token.read.getVotes([admin]))} votes, ${formatEther(await publicClient.getBalance({ address: admin }))} ETH`)
