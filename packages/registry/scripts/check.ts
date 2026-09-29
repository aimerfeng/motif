// 检查并试编译条目（不写产物），有 error 时退出码为 1。
//   pnpm audit:items              # 全部条目
//   pnpm audit:items border-beam  # 只看指定条目
import { buildRegistry, formatFindings } from '../src/index.ts'

const only = process.argv.slice(2)
const started = performance.now()
const all = await buildRegistry({ writeCatalog: false })
const result = only.length === 0 ? all : {
  catalog: { ...all.catalog, items: all.catalog.items.filter((item) => only.includes(item.manifest.slug)) },
  errors: all.errors.filter((error) => only.includes(error.slug)),
}
const report = formatFindings(result)
if (report) console.log(report)
const count = result.catalog.items.length
console.log(`${count} items checked in ${Math.round(performance.now() - started)} ms, ${result.errors.length} errors`)
if (result.errors.length > 0) process.exitCode = 1
