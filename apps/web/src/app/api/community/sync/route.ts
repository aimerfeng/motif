import { errorResponse, HttpError, NO_STORE, readJson } from '@/lib/community/http'
import { getCommunity } from '@/lib/community/state'

/** 浏览器发完交易后调用：等服务端的链上状态同步到交易所在区块，再刷新页面就能看到结果。 */
export async function POST(request: Request) {
  try {
    const { block } = (await readJson(request)) as { block?: unknown }
    if (typeof block !== 'string' || !/^\d{1,20}$/.test(block)) throw new HttpError(400, '"block" must be a decimal block number')
    const community = await getCommunity({ atLeastBlock: BigInt(block) })
    if (!community) throw new HttpError(503, 'the community chain is not available')
    return Response.json({ block: community.state.block.toString() }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
