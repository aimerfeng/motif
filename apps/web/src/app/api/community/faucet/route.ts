import { motifTokenAbi } from '@motif/contracts'
import { createWalletClient, getAddress, http, isAddress, parseEther } from 'viem'
import { toPublicConfig } from '@/lib/community/config'
import { errorResponse, HttpError, NO_STORE, readJson } from '@/lib/community/http'
import { rateLimit } from '@/lib/community/rate-limit'
import { chainOf } from '@/lib/community/shared'
import { getCommunity } from '@/lib/community/state'

const GAS_GRANT = parseEther('1')
const MOTIF_GRANT = parseEther('1000')

/**
 * 本地开发链的水龙头：给连上来的钱包发 1 ETH（付 gas）和 1000 MOTIF（付押金）。
 * 只在本地链（31337）上可用：本地节点的开发账户是解锁的，直接用持币最多的那个账户转账。
 */
export async function POST(request: Request) {
  try {
    const community = await getCommunity()
    if (!community?.config.local) throw new HttpError(404, 'the faucet only exists on the local development chain')
    rateLimit(request, 'faucet', 10)
    const body = (await readJson(request)) as { address?: unknown }
    if (typeof body.address !== 'string' || !isAddress(body.address)) throw new HttpError(400, '"address" must be an address')
    const to = getAddress(body.address)

    const { client, config } = community
    const token = config.contracts.token
    // 本地节点的开发账户是解锁的：不带账户的钱包客户端用 eth_accounts 列出它们，再由节点代为签名。
    const wallet = createWalletClient({ chain: chainOf(toPublicConfig(config)), transport: http(config.serverRpcUrl) })
    const accounts = await wallet.getAddresses()
    const balances = await Promise.all(
      accounts.map(async (account) => ({
        account: getAddress(account),
        motif: await client.readContract({ address: token, abi: motifTokenAbi, functionName: 'balanceOf', args: [account] }),
      })),
    )
    const donor = balances.filter((entry) => entry.account !== to).sort((a, b) => (b.motif > a.motif ? 1 : -1))[0]
    if (!donor || donor.motif < MOTIF_GRANT) throw new HttpError(503, 'no unlocked development account holds enough MOTIF')

    const gas = await wallet.sendTransaction({ account: donor.account, to, value: GAS_GRANT })
    const motif = await wallet.writeContract({ account: donor.account, address: token, abi: motifTokenAbi, functionName: 'transfer', args: [to, MOTIF_GRANT] })
    await Promise.all([client.waitForTransactionReceipt({ hash: gas }), client.waitForTransactionReceipt({ hash: motif })])
    return Response.json({ eth: '1', motif: '1000' }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
