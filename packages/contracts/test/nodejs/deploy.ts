import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { loadAllItems } from '@motif/registry'
import { ALLOWED_SPDX } from '@motif/schema'
import { network } from 'hardhat'
import { keccak256, parseEther, toHex, zeroHash } from 'viem'
import MotifModule from '../../ignition/modules/motif.ts'
import { seedCatalog } from '../../scripts/lib/seed.ts'
import { contentHash } from '../../src/content-hash.ts'
import { spdxToBytes32, versionInput } from '../../src/encoding.ts'

const role = (name: string) => keccak256(toHex(name))

/** 用真正的部署模块和创世导入脚本跑一遍，确认上线后的权限结构和端到端流程。 */
describe('Motif deployment', async () => {
  const { viem, ignition } = await network.create()
  const publicClient = await viem.getPublicClient()
  const [deployer, moderator, curatorA, curatorB, holder] = await viem.getWalletClients()

  const { timelock, token, governor, identity, registry, curation } = await ignition.deploy(MotifModule, {
    parameters: {
      Motif: {
        moderator: moderator.account.address,
        curators: [curatorA.account.address, curatorB.account.address],
        genesisHolder: holder.account.address,
      },
    },
  })
  const { items } = await loadAllItems()

  it('leaves every admin role with the timelock and none with the deployer', async () => {
    for (const contract of [registry, identity, timelock]) {
      assert.equal(await contract.read.hasRole([zeroHash, deployer.account.address]), false)
      assert.equal(await contract.read.hasRole([zeroHash, timelock.address]), true)
    }
    assert.equal(await curation.read.hasRole([zeroHash, timelock.address]), true)
    assert.equal(await timelock.read.hasRole([role('PROPOSER_ROLE'), governor.address]), true)
    assert.equal(await registry.read.hasRole([role('CURATION_ROLE'), curation.address]), true)
    assert.equal(await identity.read.hasRole([role('ISSUER_ROLE'), curation.address]), true)
    assert.equal(await registry.read.hasRole([role('MODERATOR_ROLE'), moderator.account.address]), true)
    assert.equal(await curation.read.hasRole([role('CURATOR_ROLE'), curatorA.account.address]), true)
    assert.equal((await token.read.owner()).toLowerCase(), timelock.address.toLowerCase())
  })

  it('funds the reward pool without leaving tokens with the deployer', async () => {
    assert.equal(await token.read.balanceOf([deployer.account.address]), 0n)
    assert.equal(await curation.read.rewardPool(), parseEther('1000000'))
    assert.equal(await token.read.balanceOf([holder.account.address]), parseEther('100000000'))
  })

  it('allows exactly the licenses from @motif/schema', async () => {
    for (const spdx of ALLOWED_SPDX) assert.equal(await registry.read.licenseAllowed([spdxToBytes32(spdx)]), true)
    assert.equal(await registry.read.licenseAllowed([spdxToBytes32('AGPL-3.0-only')]), false)
  })

  it('seeds catalog items with their content hashes, idempotently', async () => {
    const sample = items.slice(0, 3)
    const first = await seedCatalog(registry, publicClient, deployer.account.address, sample)
    assert.deepEqual(first.created, sample.map((item) => item.manifest.slug))
    const again = await seedCatalog(registry, publicClient, deployer.account.address, sample)
    assert.deepEqual(again.created, [])

    for (const item of sample) {
      const itemId = await registry.read.itemIdOfSlug([item.manifest.slug])
      assert.equal(await registry.read.isListed([itemId]), true)
      const version = await registry.read.getVersion([itemId, 1])
      assert.equal(version.contentHash, await contentHash(item))
    }
  })

  it('takes a community submission from bond to reward', async () => {
    const item = items[3]
    const author = holder.account.address
    const bond = (await curation.read.getParams()).bond
    await token.write.approve([curation.address, bond], { account: author })
    await curation.write.submit([`${item.manifest.slug}-community`, 0n, 0, await versionInput(item)], { account: author })

    const itemId = await registry.read.itemIdOfSlug([`${item.manifest.slug}-community`])
    const before = await token.read.balanceOf([author])
    await curation.write.vote([itemId, 1, 0, zeroHash], { account: curatorA.account.address })
    await viem.assertions.emitWithArgs(
      curation.write.vote([itemId, 1, 0, zeroHash], { account: curatorB.account.address }),
      curation,
      'RewardPaid',
      [author, itemId, parseEther('1000'), parseEther('1000')],
    )

    assert.equal(await registry.read.isListed([itemId]), true)
    assert.equal(await token.read.balanceOf([author]), before + bond + parseEther('1000'))
    assert.equal(await identity.read.reputationOf([author]), 10n)
  })
})
