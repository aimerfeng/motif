import fs from 'node:fs'
import path from 'node:path'
import { CliError } from './context.ts'

/** 要写进项目的一个文件：target 是相对「放代码的目录」的路径。 */
export interface IncomingFile {
  target: string
  content: string
}

export type WriteAction = 'create' | 'overwrite' | 'unchanged' | 'skip'

export interface PlannedWrite {
  target: string
  file: string
  action: WriteAction
  content: string
}

/**
 * 站点给的路径不直接信：不许绝对路径、不许 ..、不许点开头的目录或文件（.git、.github、.env …）。
 * 正常的交付物只落在 components/motif/<slug>/ 和 lib/ 下，这些限制挡不到它们；
 * 挡的是 --origin 指到一个不可信的地址时，它想借这条命令改项目里别的东西。
 */
export function safeTarget(base: string, target: string): string {
  const segments = target.split(/[\\/]+/)
  if (!target || path.isAbsolute(target) || /^[a-zA-Z]:/.test(target) || segments.some((segment) => segment === '' || segment.startsWith('.'))) {
    throw new CliError(`refusing to write "${target}": not a plain path inside the project`)
  }
  const file = path.resolve(base, ...segments)
  const relative = path.relative(base, file)
  if (relative.startsWith('..') || path.isAbsolute(relative)) throw new CliError(`refusing to write "${target}": it is outside ${base}`)
  return file
}

/** 每个文件会怎样：新建、内容一样不用动、覆盖（要 --overwrite），还是跳过（已经有一个不一样的）。 */
export function planWrites(base: string, files: IncomingFile[], overwrite: boolean): PlannedWrite[] {
  return files.map(({ target, content }) => {
    const file = safeTarget(base, target)
    let action: WriteAction = 'create'
    if (fs.existsSync(file)) {
      if (fs.readFileSync(file, 'utf8') === content) action = 'unchanged'
      else action = overwrite ? 'overwrite' : 'skip'
    }
    return { target, file, action, content }
  })
}

export function applyWrites(plan: PlannedWrite[]): void {
  for (const write of plan) {
    if (write.action !== 'create' && write.action !== 'overwrite') continue
    fs.mkdirSync(path.dirname(write.file), { recursive: true })
    fs.writeFileSync(write.file, write.content)
  }
}

/** 条目里的导入写的是 @/…：按惯例有 src/ 的项目 @ 指向 src/，没有的指向项目根。 */
export function codeDir(cwd: string, flag: string | undefined): string {
  if (flag) return path.resolve(cwd, flag)
  const src = path.join(cwd, 'src')
  return fs.existsSync(src) && fs.statSync(src).isDirectory() ? src : cwd
}

/** 项目用的包管理器（看锁文件），用来给出装依赖的那条命令。 */
export function installCommand(cwd: string, dependencies: string[]): string | null {
  if (dependencies.length === 0) return null
  const has = (name: string) => fs.existsSync(path.join(cwd, name))
  const tool = has('pnpm-lock.yaml') ? 'pnpm add' : has('yarn.lock') ? 'yarn add' : has('bun.lock') || has('bun.lockb') ? 'bun add' : 'npm install'
  return `${tool} ${dependencies.join(' ')}`
}
