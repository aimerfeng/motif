import { zipFiles } from '@motif/export'
import { sessionUser } from '@/lib/auth/server'
import { allFiles, repoById } from '@/lib/repos/repos'

/** 整个仓库打成 zip。公开仓库谁都能下；私有的只有主人。 */
export async function GET(request: Request, { params }: RouteContext<'/api/repos/[id]/download'>) {
  const user = await sessionUser(request.headers)
  const repo = repoById((await params).id)
  if (!repo || (repo.visibility === 'private' && repo.owner_id !== user?.id)) return new Response('not found', { status: 404 })
  const name = `${repo.owner_handle}-${repo.slug}`
  return new Response(zipFiles(allFiles(repo.id), name) as BodyInit, {
    headers: { 'Content-Type': 'application/zip', 'Content-Disposition': `attachment; filename="${name}.zip"`, 'Cache-Control': 'no-store' },
  })
}
