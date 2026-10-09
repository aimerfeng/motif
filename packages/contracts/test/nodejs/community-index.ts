import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { loadAllItems } from '@motif/registry'
import { network } from 'hardhat'
import { encodeFunctionData, getAddress, keccak256, parseEther, toHex, zeroHash } from 'viem'
import MotifModule from '../../ignition/modules/motif.ts'
import { seedCatalog } from '../../scripts/lib/seed.ts'
import { applyCommunityEvents, createCommunityState, decodeCommunityLogs, PROPOSAL_STATES, REVIEW_OUTCOME, VERSION_STATUS } from '../../src/community.ts'
import { versionInput } from '../../src/encoding.ts'
import { motifCurationAbi } from '../../src/generated/abi.ts'

/** 在真实部署上跑一遍社区的各种动作，然后用全部事件折叠出状态，逐项和合约读数对照。 */
describe('community event index', async () => {
  const { viem, ignition, networkHelpers } = await network.create()
  const publicClient = await viem.getPublicClient()
  const [deployer, moderator, curatorA, curatorB, holder, bob] = await viem.getWalletClients()
  const { token, governor, identity, registry, curation } = await ignition.deploy(MotifModule, {
    parameters: {
      Motif: {
        moderator: moderator.account.address,
        curators: [curatorA.account.address, curatorB.account.address],
        genesisHolder: holder.account.address,
      },
    },
  })
  const { items } = await loadAllItems()
  const send = async (hash: Promise<`0x${string}`>) => publicClient.waitForTransactionReceipt({ hash: await hash })

  // 创世导入两个条目。
  await seedCatalog(registry, publicClient, deployer.account.address, items.slice(0, 2))

  // holder 注册资料、投一个新条目并通过；bob Remix 它但被判违规。
  // 钱包客户端给的地址是小写，事件里解码出来的是校验和格式，统一成后者再比较。
  const author = getAddress(holder.account.address)
  const bobAddress = getAddress(bob.account.address)
  await send(identity.write.register(['holder', keccak256(toHex('{"name":"Holder"}'))], { account: author }))
  await send(token.write.transfer([bobAddress, parseEther('1000')], { account: author }))
  for (const account of [author, bobAddress]) {
    await send(token.write.approve([curation.address, parseEther('1000')], { account }))
  }
  await send(curation.write.submit(['community-piece', 0n, 0, await versionInput(items[2]!)], { account: author }))
  const pieceId = await registry.read.itemIdOfSlug(['community-piece'])
  await send(curation.write.vote([pieceId, 1, 0, zeroHash], { account: curatorA.account.address }))
  await send(curation.write.vote([pieceId, 1, 0, zeroHash], { account: curatorB.account.address }))

  await send(curation.write.submit(['community-piece-copy', pieceId, 1, await versionInput(items[3]!)], { account: bobAddress }))
  const copyId = await registry.read.itemIdOfSlug(['community-piece-copy'])
  const note = keccak256(toHex('copied without changes'))
  await send(curation.write.vote([copyId, 1, 2, note], { account: curatorA.account.address }))
  await send(curation.write.vote([copyId, 1, 2, note], { account: curatorB.account.address }))

  // 版主下架一个导入的条目；治理提案任命 bob 为审核员并通过执行。
  const seededId = await registry.read.itemIdOfSlug([items[0]!.manifest.slug])
  await send(registry.write.setDelisted([seededId, true, keccak256(toHex('report'))], { account: moderator.account.address }))
  await send(token.write.delegate([author], { account: author }))
  await networkHelpers.mine()
  const calldata = encodeFunctionData({ abi: motifCurationAbi, functionName: 'grantRole', args: [keccak256(toHex('CURATOR_ROLE')), bobAddress] })
  const description = 'Appoint bob as curator'
  await send(governor.write.propose([[curation.address], [0n], [calldata], description], { account: author }))
  const proposalId = await governor.read.hashProposal([[curation.address], [0n], [calldata], keccak256(toHex(description))])
  await networkHelpers.time.increase(24 * 60 * 60 + 1)
  await send(governor.write.castVote([proposalId, 1], { account: author }))
  await networkHelpers.time.increase(5 * 24 * 60 * 60 + 1)
  await send(governor.write.queue([[curation.address], [0n], [calldata], keccak256(toHex(description))], { account: author }))
  await networkHelpers.time.increase(2 * 24 * 60 * 60 + 1)
  await send(governor.write.execute([[curation.address], [0n], [calldata], keccak256(toHex(description))], { account: author }))

  const logs = await publicClient.getLogs({ fromBlock: 0n })
  const state = createCommunityState()
  applyCommunityEvents(state, decodeCommunityLogs(logs, { registry: registry.address, curation: curation.address, identity: identity.address, governor: governor.address }))

  it('matches the registry item by item', async () => {
    assert.equal(BigInt(state.items.size), await registry.read.itemCount())
    for (const item of state.items.values()) {
      const onChain = await registry.read.getItem([item.id])
      assert.equal(item.slug, onChain.slug)
      assert.equal(item.maintainer, onChain.maintainer)
      assert.equal(item.currentVersion, onChain.currentVersion)
      assert.equal(item.delisted, onChain.delisted)
      assert.equal(item.parentId, onChain.parentId)
      for (const version of item.versions) {
        const v = await registry.read.getVersion([item.id, version.version])
        assert.equal(version.contentHash, v.contentHash)
        assert.equal(version.author, v.author)
        assert.equal(version.status, VERSION_STATUS[v.status])
      }
    }
    assert.equal(state.slugs.get('community-piece'), pieceId)
    // 违规的第 1 版释放了 slug。
    assert.equal(state.slugs.has('community-piece-copy'), false)
    assert.equal(state.items.get(copyId)?.abandoned, true)
  })

  it('records reviews, votes and rewards like the curation contract', async () => {
    for (const [itemId, version] of [
      [pieceId, 1],
      [copyId, 1],
    ] as const) {
      const indexed = state.items.get(itemId)!.versions.find((v) => v.version === version)!.review!
      const onChain = await curation.read.getReview([itemId, version])
      assert.equal(indexed.outcome, REVIEW_OUTCOME[onChain.outcome])
      assert.equal(indexed.bond, onChain.bond)
      assert.equal(indexed.quorum, onChain.quorum)
      assert.equal(indexed.votes.length, onChain.approvals + onChain.rejections + onChain.violations)
    }
    const piece = state.items.get(pieceId)!.versions[0]!.review!
    assert.deepEqual(piece.rewards, [{ to: author, paid: parseEther('1000'), owed: parseEther('1000') }])
    assert.equal(state.items.get(copyId)!.versions[0]!.review!.votes[0]!.noteHash, note)
  })

  it('tracks profiles, reputation and roles', async () => {
    for (const profile of state.profiles.values()) {
      assert.equal(profile.reputation, await identity.read.reputationOf([profile.account]))
    }
    assert.equal(state.handles.get('holder'), author)
    assert.equal(state.profiles.get(author)?.handle, 'holder')
    assert.deepEqual([...state.curators].sort(), [curatorA.account.address, curatorB.account.address, bobAddress].map((a) => getAddress(a)).sort())
    assert.deepEqual([...state.moderators], [getAddress(moderator.account.address)])
    assert.equal(state.params?.quorum, 2)
  })

  it('follows a proposal from creation to execution', async () => {
    const proposal = state.proposals.get(proposalId)!
    assert.equal(proposal.proposer, author)
    assert.equal(proposal.description, description)
    assert.equal(proposal.executed, true)
    assert.notEqual(proposal.eta, null)
    assert.equal(proposal.tally.for, await token.read.getPastVotes([author, proposal.voteStart]))
    assert.equal(PROPOSAL_STATES[await governor.read.state([proposalId])], 'executed')
    assert.equal(await curation.read.hasRole([keccak256(toHex('CURATOR_ROLE')), bobAddress]), true)
  })
})
