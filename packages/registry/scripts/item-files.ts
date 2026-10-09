import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { ItemManifest, ItemSource } from '@motif/schema'
import { ITEMS_DIR } from '../src/index.ts'

/*
 * item:pack / item:unpack / item:remix 共用的小工具。
 * 条目在仓库里以目录的形式编写（item.ts + 源文件），投稿时打包成一个 .motif.json（即 ItemSource）。
 */

/** pnpm --filter 会把工作目录切到包目录；用户给的相对路径按他敲命令时所在的目录解析。 */
export const USER_CWD = process.env.INIT_CWD ?? process.cwd()

/** 参数是条目 slug（packages/registry/items/ 下的目录）或任意目录路径。 */
export function itemDir(target: string): string {
  const inCatalog = path.join(ITEMS_DIR, target)
  return existsSync(path.join(inCatalog, 'item.ts')) ? inCatalog : path.resolve(USER_CWD, target)
}

/**
 * 把 ItemSource 写成条目目录。item.ts 由清单生成（原来的注释和写法不会保留）。
 * 写成 draft：编辑期间不会出现在本地市场里；打包投稿时 item:pack 会改回 published。
 */
export async function writeItemDir(item: ItemSource, options: { force?: boolean } = {}): Promise<string> {
  const dir = path.join(ITEMS_DIR, item.manifest.slug)
  if (existsSync(dir) && !options.force) throw new Error(`${path.relative(USER_CWD, dir)} already exists; pass --force to overwrite`)
  await mkdir(dir, { recursive: true })
  for (const [file, text] of Object.entries(item.files)) {
    await mkdir(path.dirname(path.join(dir, file)), { recursive: true })
    await writeFile(path.join(dir, file), text)
  }
  const manifest: ItemManifest = { ...item.manifest, status: 'draft' }
  const body = JSON.stringify(manifest, null, 2)
  await writeFile(path.join(dir, 'item.ts'), `import { defineItem } from '@motif/schema'\n\nexport default defineItem(${body})\n`)
  return dir
}
