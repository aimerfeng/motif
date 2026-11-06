import { githubToken, requireUser } from '@/lib/auth/server'
import { errorResponse, NO_STORE } from '@/lib/community/http'
import { listUserRepos } from '@/lib/repos/github'

/** 用户自己的 GitHub 公开仓库（导入用）。没关联 GitHub 时 connected 为 false。 */
export async function GET(request: Request) {
  try {
    const user = await requireUser(request)
    const github = await githubToken(user.id)
    if (!github) return Response.json({ connected: false, repos: [] }, { headers: NO_STORE })
    return Response.json({ connected: true, login: user.githubLogin, repos: await listUserRepos(github.token) }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
