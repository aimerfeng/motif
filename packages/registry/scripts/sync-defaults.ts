// 按 item.ts 里的参数重新生成组件文件里的默认值区域（/* @motif:defaults */ … /* @motif:end */）。
//   pnpm items:sync-defaults              # 全部条目
//   pnpm items:sync-defaults border-beam  # 指定条目
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { bake, defaultsOf, findDefaultsRegion, printDefaults } from '@motif/schema'
import { ITEMS_DIR, loadItemSource } from '../src/index.ts'

const only = process.argv.slice(2)
const slugs = only.length > 0 ? only : (await readdir(ITEMS_DIR, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name)

for (const slug of slugs) {
  const dir = path.join(ITEMS_DIR, slug)
  const { manifest } = await loadItemSource(dir)
  const file = path.join(dir, manifest.entry.file)
  const source = (await readFile(file, 'utf8')).replaceAll('\r\n', '\n')
  const region = findDefaultsRegion(source)
  if (typeof region === 'string') {
    console.log(`✖ ${slug}: ${region} in ${manifest.entry.file}; add this block where the defaults belong:\n\n${printDefaults(defaultsOf(manifest.params))}\n`)
    process.exitCode = 1
    continue
  }
  const next = bake(source, defaultsOf(manifest.params))
  if (next === source) {
    console.log(`  ${slug}: up to date`)
  } else {
    await writeFile(file, next)
    console.log(`✓ ${slug}: defaults region regenerated`)
  }
}
