// 从市场里的条目开一个 Remix：复制到新 slug，并在清单里记下来源（provenance.basedOn）。
//   pnpm item:remix mesh-gradient my-gradient
// 上游来源、许可证和版权头原样保留；改完后 pnpm item:pack my-gradient 打包投稿。
// 投稿通过后，被 Remix 那个版本的作者会得到 Remix 奖励。
import path from 'node:path'
import { loadItemSource } from '../src/index.ts'
import { itemDir, USER_CWD, writeItemDir } from './item-files.ts'

const [from, to] = process.argv.slice(2)
if (!from || !to || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(to)) {
  console.error('usage: pnpm item:remix <source slug> <new-slug>   (new slug: lowercase letters, digits and single hyphens)')
  process.exit(1)
}

const source = await loadItemSource(itemDir(from))
const dir = await writeItemDir({
  manifest: { ...source.manifest, slug: to, provenance: { ...source.manifest.provenance, basedOn: source.manifest.slug } },
  files: source.files,
})
console.log(`✓ ${path.relative(USER_CWD, dir)} is a remix of ${source.manifest.slug}; edit it, then run pnpm item:pack ${to}`)
