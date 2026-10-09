import { motifCurationAbi, motifIdentityAbi, motifRegistryAbi, motifTokenAbi, ROLES } from '@motif/contracts'
import { getAddress, isAddress } from 'viem'
import { NO_STORE } from '@/lib/community/http'
import { getCommunity } from '@/lib/community/state'

/**
 * 钱包连上之后浏览器要知道的：资料、角色、MOTIF 余额、给审核合约的授权额度、投票权和委托对象。
 * 角色直接读合约：版主权限分在三个合约上（注册表下架、身份合约管资料、审核合约暂停投稿），可能分别任免。
 */
export async function GET(_request: Request, { params }: RouteContext<'/api/community/accounts/[address]'>) {
  const { address: raw } = await params
  if (!isAddress(raw)) return Response.json({ error: 'not an address' }, { status: 400 })
  const community = await getCommunity()
  if (!community) return Response.json({ error: 'the community chain is not available' }, { status: 503 })
  const address = getAddress(raw)
  const { client, config, state } = community
  const token = config.contracts.token
  const { curation, registry, identity } = config.contracts
  const [curator, moderator, profileModerator, pauser] = await Promise.all([
    client.readContract({ address: curation, abi: motifCurationAbi, functionName: 'hasRole', args: [ROLES.curator, address] }),
    client.readContract({ address: registry, abi: motifRegistryAbi, functionName: 'hasRole', args: [ROLES.moderator, address] }),
    client.readContract({ address: identity, abi: motifIdentityAbi, functionName: 'hasRole', args: [ROLES.moderator, address] }),
    client.readContract({ address: curation, abi: motifCurationAbi, functionName: 'hasRole', args: [ROLES.moderator, address] }),
  ])
  const [balance, allowance, votes, delegate, bond] = await Promise.all([
    client.readContract({ address: token, abi: motifTokenAbi, functionName: 'balanceOf', args: [address] }),
    client.readContract({ address: token, abi: motifTokenAbi, functionName: 'allowance', args: [address, config.contracts.curation] }),
    client.readContract({ address: token, abi: motifTokenAbi, functionName: 'getVotes', args: [address] }),
    client.readContract({ address: token, abi: motifTokenAbi, functionName: 'delegates', args: [address] }),
    client.readContract({ address: config.contracts.curation, abi: motifCurationAbi, functionName: 'getParams' }).then((p) => p.bond),
  ])
  const profile = state.profiles.get(address)
  return Response.json(
    {
      address,
      handle: profile?.handle ?? null,
      registered: profile?.registeredBlock != null,
      reputation: (profile?.reputation ?? 0n).toString(),
      metadataHash: profile?.metadataHash ?? null,
      curator,
      moderator,
      profileModerator,
      pauser,
      balance: balance.toString(),
      allowance: allowance.toString(),
      votes: votes.toString(),
      delegate,
      bond: bond.toString(),
      ethBalance: (await client.getBalance({ address })).toString(),
    },
    { headers: NO_STORE },
  )
}
