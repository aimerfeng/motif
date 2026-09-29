// 生成仓库根目录的 THIRD_PARTY_NOTICES.md。
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { loadAllItems, loadSourceRecords, REPO_ROOT, renderNotices } from '../src/index.ts'

const [{ items }, sources] = await Promise.all([loadAllItems(), loadSourceRecords()])
await writeFile(path.join(REPO_ROOT, 'THIRD_PARTY_NOTICES.md'), renderNotices(items, sources))
console.log('wrote THIRD_PARTY_NOTICES.md')
