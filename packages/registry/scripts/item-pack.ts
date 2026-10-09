// 把条目目录打包成 .motif.json（清单 + 全部源文件），拿去社区投稿。
//   pnpm item:pack my-effect                 # packages/registry/items/my-effect → ./my-effect.motif.json
//   pnpm item:pack path/to/dir out.json      # 任意目录、指定输出文件
// 打包出来的清单一律是 published：投稿就是发布。这里先跑一遍检查器，站点收到后还会再检查一次。
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { checkItem } from '@motif/checker'
import { FONT_FAMILIES, VENDOR_IDS } from '@motif/vendor'
import { loadItemSource, loadSourceRecords } from '../src/index.ts'
import { itemDir, USER_CWD } from './item-files.ts'

const [target, output] = process.argv.slice(2)
if (!target) {
  console.error('usage: pnpm item:pack <slug | dir> [output.motif.json]')
  process.exit(1)
}

const loaded = await loadItemSource(itemDir(target))
const item = { manifest: { ...loaded.manifest, status: 'published' as const }, files: loaded.files }
const findings = checkItem(item, { sources: await loadSourceRecords(), vendorIds: VENDOR_IDS, fonts: FONT_FAMILIES })
for (const finding of findings) {
  console.log(`${finding.level === 'error' ? '✖' : '⚠'} ${finding.file ? `${finding.file} ` : ''}[${finding.rule}] ${finding.message}`)
}

const file = path.resolve(USER_CWD, output ?? `${item.manifest.slug}.motif.json`)
await writeFile(file, `${JSON.stringify(item, null, 2)}\n`)
const errors = findings.filter((finding) => finding.level === 'error').length
console.log(`${errors === 0 ? '✓' : '✖'} wrote ${path.relative(USER_CWD, file)}${errors === 0 ? '' : ` (${errors} errors to fix before submitting)`}`)
if (errors > 0) process.exitCode = 1
