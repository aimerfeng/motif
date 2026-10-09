// 把 .motif.json 还原成条目目录（packages/registry/items/<slug>/），改完用 pnpm item:pack 再打包。
//   pnpm item:unpack my-effect.motif.json [--force]
// 社区作品的源文件可以在它的条目页下载。
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { ItemSource } from '@motif/schema'
import { USER_CWD, writeItemDir } from './item-files.ts'

const args = process.argv.slice(2)
const file = args.find((arg) => !arg.startsWith('--'))
if (!file) {
  console.error('usage: pnpm item:unpack <file.motif.json> [--force]')
  process.exit(1)
}

const item = JSON.parse(await readFile(path.resolve(USER_CWD, file), 'utf8')) as ItemSource
if (typeof item.manifest?.slug !== 'string' || typeof item.files !== 'object') throw new Error(`${file} is not an item file (expected { manifest, files })`)
const dir = await writeItemDir(item, { force: args.includes('--force') })
console.log(`✓ restored ${path.relative(USER_CWD, dir)} (status: draft)`)
