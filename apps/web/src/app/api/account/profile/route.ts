import { BIO_MAX, updateProfile } from '@/lib/accounts/profile'
import { requireUser } from '@/lib/auth/server'
import { errorResponse, HttpError, NO_STORE, readJson } from '@/lib/community/http'
import { rateLimit } from '@/lib/community/rate-limit'
import { run } from '@/lib/db'

const NAME_MAX = 60

/** 改资料：显示名、handle、简介。 */
export async function PATCH(request: Request) {
  try {
    rateLimit(request, 'account-profile', 20)
    const user = await requireUser(request)
    const body = (await readJson(request)) as { name?: unknown; handle?: unknown; bio?: unknown }
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > NAME_MAX) throw new HttpError(400, `name must be 1–${NAME_MAX} characters`)
      run('UPDATE "user" SET name = ?, updatedAt = ? WHERE id = ?', body.name.trim(), new Date().toISOString(), user.id)
    }
    if (body.bio !== undefined && (typeof body.bio !== 'string' || body.bio.length > BIO_MAX * 2)) throw new HttpError(400, `bio is limited to ${BIO_MAX} characters`)
    if (body.handle !== undefined && typeof body.handle !== 'string') throw new HttpError(400, 'handle must be a string')
    const profile = updateProfile(user.id, { handle: body.handle as string | undefined, bio: body.bio as string | undefined })
    return Response.json({ handle: profile.handle, bio: profile.bio }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
