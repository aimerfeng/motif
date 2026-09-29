/**
 * 真正安装并构建导出的 Vite 项目，确认「下载即可运行」。需要联网（从 npm 安装依赖），所以不放进 pnpm verify。
 *
 *   pnpm check:export border-beam liquid-form mesh-gradient
 *
 * 参数使用每个条目的第一个预设（没有预设时用默认值），同时验证写回 defaults 的值能通过类型检查和构建。
 */
import { spawnSync } from 'node:child_process'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { prepareExport, viteStarter, type ExportContext } from '@motif/export'
import { ITEMS_DIR, loadItemSource, loadRuntime, REPO_ROOT } from '@motif/registry'
import { defaultsOf } from '@motif/schema'
import { VENDOR_ENTRIES } from '@motif/vendor/manifest'
import { readFile } from 'node:fs/promises'

const slugs = process.argv.slice(2)
if (slugs.length === 0) {
  console.error('usage: pnpm check:export <slug> [...]')
  process.exit(1)
}

async function vendorVersions(): Promise<Record<string, string>> {
  const versions: Record<string, string> = {}
  for (const pkg of new Set(VENDOR_ENTRIES.map((entry) => entry.pkg))) {
    if (pkg.startsWith('@motif/')) continue
    const json = JSON.parse(await readFile(path.join(REPO_ROOT, 'packages/vendor/node_modules', pkg, 'package.json'), 'utf8')) as { version: string }
    versions[pkg] = json.version
  }
  return versions
}

const context: ExportContext = { origin: 'https://motif.local', vendor: await vendorVersions(), runtime: await loadRuntime() }
const root = await mkdtemp(path.join(tmpdir(), 'motif-export-'))
let failed = 0

for (const slug of slugs) {
  const item = await loadItemSource(path.join(ITEMS_DIR, slug))
  const values = { ...defaultsOf(item.manifest.params), ...(item.manifest.presets[0]?.values ?? {}) }
  const files = viteStarter(item, values, context, await prepareExport(item, values))
  const dir = path.join(root, slug)
  for (const [file, text] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(dir, file)), { recursive: true })
    await writeFile(path.join(dir, file), text)
  }
  const run = (command: string) => spawnSync(command, { cwd: dir, shell: true, encoding: 'utf8' })
  const started = performance.now()
  const install = run('pnpm install --ignore-workspace --config.minimum-release-age=0 --reporter=silent')
  const typecheck = install.status === 0 ? run('pnpm run typecheck') : null
  const build = install.status === 0 ? run('pnpm run build') : null
  const ok = install.status === 0 && typecheck?.status === 0 && build?.status === 0
  if (!ok) failed++
  console.log(`${ok ? '✓' : '✖'} ${slug.padEnd(22)} ${Math.round((performance.now() - started) / 1000)}s  ${dir}`)
  for (const step of [install, typecheck, build]) {
    if (step && step.status !== 0) console.log((step.stdout + step.stderr).split('\n').slice(-25).join('\n'))
  }
}

if (failed === 0) await rm(root, { recursive: true, force: true })
process.exitCode = failed > 0 ? 1 : 0
