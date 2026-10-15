import { errorResponse, HttpError, NO_STORE } from '@/lib/community/http'
import { fileDiff } from '@/lib/studio/diff'
import { requireSession } from '@/lib/studio/view'

/**
 * 某一轮里一个文件的逐行差异：?snapshot=<这一轮开始前的快照>&path=<文件>。
 * 这一轮结束时的样子是它之后的第一个快照（下一次改动开始前），没有更新的快照就是当前版本。
 */
export async function GET(request: Request, { params }: RouteContext<'/api/studio/sessions/[id]/diff'>) {
  try {
    const session = await requireSession((await params).id)
    const url = new URL(request.url)
    const snapshotId = Number(url.searchParams.get('snapshot'))
    const path = url.searchParams.get('path') ?? ''
    const snapshots = session.snapshots ?? []
    const before = snapshots.find((snapshot) => snapshot.id === snapshotId)
    if (!before) throw new HttpError(410, 'that version is no longer kept')
    const after = snapshots.filter((snapshot) => snapshot.id > snapshotId).sort((a, b) => a.id - b.id)[0]?.item ?? session.item
    return Response.json({ hunks: fileDiff(before.item, after, path) }, { headers: NO_STORE })
  } catch (error) {
    return errorResponse(error)
  }
}
