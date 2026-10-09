import { readFile } from 'node:fs/promises'
import { loadAllItems } from '@motif/registry'
import { network } from 'hardhat'
import { keccak256, toHex, type Address } from 'viem'
import { seedCatalog } from './lib/seed.ts'

/**
 * 把仓库里的全部条目登记到已部署的 MotifRegistry，完成后放弃登记权限。
 *
 *   pnpm --filter @motif/contracts deploy:local
 *   pnpm --filter @motif/contracts seed:local
 *
 * 用 Ignition 部署记录里的地址（默认 chain-<id>，MOTIF_DEPLOYMENT_ID 可以指定别的部署，例如端到端测试的 e2e）；
 * 用第一个账户签名（必须是部署时的 seeder）。
 */
const { viem } = await network.create()
const publicClient = await viem.getPublicClient()
const [seeder] = await viem.getWalletClients()
const chainId = await publicClient.getChainId()

const deployed = JSON.parse(
  await readFile(new URL(`../ignition/deployments/${process.env.MOTIF_DEPLOYMENT_ID ?? `chain-${chainId}`}/deployed_addresses.json`, import.meta.url), 'utf8'),
) as Record<string, Address>
const registry = await viem.getContractAt('MotifRegistry', deployed['Motif#MotifRegistry'])

const { items, failures } = await loadAllItems()
if (failures.length > 0) {
  for (const failure of failures) console.error(`${failure.dir}: ${failure.message}`)
  throw new Error(`${failures.length} items failed to load; fix them before seeding`)
}
const published = items.filter((item) => item.manifest.status === 'published')

const account = seeder.account.address
const { created, skipped } = await seedCatalog(registry, publicClient, account, published)
console.log(`seeded ${created.length} items, ${skipped.length} already on chain`)

const curationRole = keccak256(toHex('CURATION_ROLE'))
if (await registry.read.hasRole([curationRole, account])) {
  const hash = await registry.write.renounceRole([curationRole, account], { account })
  await publicClient.waitForTransactionReceipt({ hash })
  console.log('renounced CURATION_ROLE; from now on items only enter through MotifCuration')
}
