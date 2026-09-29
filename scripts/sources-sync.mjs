// 把 sources/sources.json 里登记的上游仓库克隆到 sources/_clones/<id>，并检出固定的 sha。
// 克隆目录已 gitignore，只用来读代码和许可证。
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const CLONES = path.join(ROOT, 'sources/_clones')
const { sources } = JSON.parse(readFileSync(path.join(ROOT, 'sources/sources.json'), 'utf8'))
const only = process.argv.slice(2)

const git = (cwd, ...args) => execFileSync('git', args, { cwd, stdio: ['ignore', 'pipe', 'inherit'] }).toString().trim()

for (const source of sources) {
  if (only.length > 0 && !only.includes(source.id)) continue
  const dir = path.join(CLONES, source.id)
  if (!existsSync(dir)) {
    console.log(`clone ${source.repo} → ${source.id}`)
    git(ROOT, 'clone', '--quiet', '--filter=blob:none', '--no-checkout', `https://github.com/${source.repo}.git`, dir)
  }
  try {
    git(dir, 'cat-file', '-e', `${source.sha}^{commit}`)
  } catch {
    git(dir, 'fetch', '--quiet', '--filter=blob:none', 'origin', source.sha)
  }
  // --no-checkout 克隆后 HEAD 已指向该提交但工作区是空的，所以每次都显式检出（已检出时几乎没有开销）。
  git(dir, '-c', 'core.autocrlf=false', 'checkout', '--quiet', '--detach', source.sha)
  console.log(`${source.id.padEnd(18)} ${source.sha.slice(0, 7)} ${source.spdx}`)
}
