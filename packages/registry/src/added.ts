import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { REPO_ROOT } from './load.ts'

let cached: Promise<Map<string, string>> | null = null

/**
 * 每个条目第一次进仓库的时间：git 里 item.ts 被添加的那次提交（市场按「最新」排序用）。
 * 一条 git log 拿到全部条目，进程内缓存（watch 模式下每次重建不必再跑）。
 * 拿不到 git 历史时（浅克隆、不在仓库里）返回空表，条目的时间为 null。
 */
export function itemAddedDates(): Promise<Map<string, string>> {
  cached ??= promisify(execFile)('git', ['log', '--diff-filter=A', '--format=%aI', '--name-only', '--', 'packages/registry/items/*/item.ts'], { cwd: REPO_ROOT, maxBuffer: 8 << 20 })
    .then(({ stdout }) => {
      const dates = new Map<string, string>()
      let date = ''
      // 日志从新到旧：同一个条目被删掉又加回时，保留最早的那次。
      for (const line of stdout.split(/\r?\n/)) {
        const file = /^packages\/registry\/items\/([^/]+)\/item\.ts$/.exec(line.trim())
        if (file) dates.set(file[1]!, date)
        else if (line.trim()) date = line.trim()
      }
      return dates
    })
    .catch(() => new Map<string, string>())
  return cached
}
