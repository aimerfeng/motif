import { motifCurationAbi, motifRegistryAbi, ROLES } from '@motif/contracts'
import { createWalletClient, getAddress, http } from 'viem'
import { errorResponse, HttpError, NO_STORE } from '@/lib/community/http'
import { getCommunity } from '@/lib/community/state'

/** 本地开发钱包里列出多少个开发账户：Hardhat 默认账户 #0–#9 覆盖了部署者、版主、审核员和开发管理员（#9）。 */
const COUNT = 10

/**
 * 本地开发钱包（只在 `pnpm dev` + 本地链上存在）：列出节点解锁的开发账户，以及它们在链上的角色。
 * 页面拿到后为每个账户公告一个钱包，签名和交易直接交给节点，不需要装钱包扩展、也不需要私钥。
 * 角色从链上读，不另外维护一份名单（谁是审核员以合约为准）。
 */
export async function GET() {
  try {
    if (process.env.NODE_ENV !== 'development') throw new HttpError(404, 'dev wallets only exist in development')
    const community = await getCommunity()
    if (!community?.config.local) throw new HttpError(404, 'dev wallets only exist on the local development chain')
    const { client, config } = community
    const accounts = (await createWalletClient({ transport: http(config.serverRpcUrl) }).getAddresses()).slice(0, COUNT)
    const hasRole = (address: `0x${string}`, contract: 'registry' | 'curation', role: `0x${string}`) =>
      client.readContract({ address: config.contracts[contract], abi: contract === 'registry' ? motifRegistryAbi : motifCurationAbi, functionName: 'hasRole', args: [role, address] })
    const wallets = await Promise.all(
      accounts.map(async (account, index) => {
        const address = getAddress(account)
        const [admin, moderator, curator] = await Promise.all([hasRole(address, 'registry', ROLES.admin), hasRole(address, 'registry', ROLES.moderator), hasRole(address, 'curation', ROLES.curator)])
        return { index, address, admin, moderator, curator }
      }),
    )
    return Response.json({ rpcUrl: config.rpcUrl, wallets }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
