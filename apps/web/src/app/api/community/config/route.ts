import { toPublicConfig } from '@/lib/community/config'
import { NO_STORE } from '@/lib/community/http'
import { getCommunity } from '@/lib/community/state'

/** 浏览器（钱包）要用的链配置；社区没开或链连不上时 enabled 为 false。 */
export async function GET() {
  const community = await getCommunity()
  if (!community) return Response.json({ enabled: false }, { headers: NO_STORE })
  return Response.json({ enabled: true, ...toPublicConfig(community.config) }, { headers: NO_STORE })
}
