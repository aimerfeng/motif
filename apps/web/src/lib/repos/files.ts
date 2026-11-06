import { unzipSync } from 'fflate'
import { HttpError } from '@/lib/community/http'

/*
 * 用户仓库里的文件：只收文本，有数量和大小上限（docs/decisions/0009-accounts-credits-repos.md 第 4 节）。
 * 导入时超限的、二进制的、依赖和构建产物目录里的文件跳过，并告诉用户跳过了多少。
 */

export const LIMITS = {
  files: 1000,
  totalBytes: 8 * 1024 * 1024,
  fileBytes: 512 * 1024,
  reposPerUser: 50,
}

/** 这些目录是依赖、构建产物或版本控制的内部文件，导入时整个跳过。 */
const IGNORED_DIRS = new Set(['node_modules', '.git', '.next', '.nuxt', '.svelte-kit', '.turbo', '.cache', '.vercel', '.output', 'dist', 'build', 'out', 'coverage', '__pycache__', '.venv', 'venv', 'target', 'vendor', '.idea', '.vscode'])
/** 一看就是二进制的扩展名：不用解压就能跳过。 */
const BINARY_EXT = /\.(png|jpe?g|gif|webp|avif|ico|bmp|tiff?|psd|mp4|webm|mov|mp3|wav|ogg|flac|woff2?|ttf|otf|eot|zip|gz|tgz|bz2|xz|7z|rar|pdf|exe|dll|so|dylib|bin|wasm|class|jar|pyc|db|sqlite|glb|gltf|hdr|exr|ktx2?)$/i

export interface SkipReport {
  binary: number
  tooLarge: number
  ignored: number
  overLimit: number
}

export const emptySkips = (): SkipReport => ({ binary: 0, tooLarge: 0, ignored: 0, overLimit: 0 })

/** 规范化仓库里的路径：正斜杠、不以斜杠开头、没有 . 和 ..、每段不为空。不合法返回 null。 */
export function normalizePath(raw: string): string | null {
  const parts = raw.replaceAll('\\', '/').split('/').filter((part) => part !== '' && part !== '.')
  // 控制字符（换行、NUL……）不能出现在路径里。按码点判断，不把控制字符写进正则。
  if (parts.length === 0 || parts.some((part) => part === '..' || part.length > 255 || [...part].some((char) => char.charCodeAt(0) < 0x20))) return null
  const joined = parts.join('/')
  return joined.length <= 512 ? joined : null
}

function ignored(path: string): boolean {
  return path.split('/').some((part, index, parts) => index < parts.length - 1 && IGNORED_DIRS.has(part))
}

const decoder = new TextDecoder('utf-8', { fatal: true })

/** 字节 → 文本；不是 UTF-8 或者里面有 NUL 字节（二进制文件的典型特征）就返回 null。 */
export function asText(bytes: Uint8Array): string | null {
  if (bytes.includes(0)) return null
  try {
    return decoder.decode(bytes).replaceAll('\r\n', '\n')
  } catch {
    return null
  }
}

export const byteLength = (text: string) => Buffer.byteLength(text, 'utf8')

/**
 * 解开 GitHub 的 zipball：去掉最外层的「owner-repo-sha/」目录，按规则过滤。
 * 用 fflate 的 filter 在解压前就跳过太大和二进制的文件，不把它们解压进内存。
 */
export function filesFromZip(zip: Uint8Array): { files: Record<string, string>; skipped: SkipReport } {
  const skipped = emptySkips()
  let entries: Record<string, Uint8Array>
  // 数量和总大小在解压前就截断：几 MB 的 zip 里可以是几千份同一个大文件（git 只存一份），全部解开会把进程的内存撑爆。
  let accepted = 0
  let inflated = 0
  try {
    entries = unzipSync(zip, {
      filter: (file) => {
        const path = file.name.split('/').slice(1).join('/')
        if (!path || file.name.endsWith('/')) return false
        if (ignored(path)) return (skipped.ignored++, false)
        if (BINARY_EXT.test(path)) return (skipped.binary++, false)
        if (file.originalSize > LIMITS.fileBytes) return (skipped.tooLarge++, false)
        if (accepted >= LIMITS.files || inflated + file.originalSize > LIMITS.totalBytes) return (skipped.overLimit++, false)
        accepted++
        inflated += file.originalSize
        return true
      },
    })
  } catch {
    throw new HttpError(502, 'could not read the archive from GitHub')
  }
  const files: Record<string, string> = {}
  let total = 0
  let count = 0
  // 按路径排序后再按上限截断：同一个仓库每次导入得到同样的子集。
  for (const name of Object.keys(entries).sort()) {
    const path = normalizePath(name.split('/').slice(1).join('/'))
    if (!path) continue
    const text = asText(entries[name]!)
    if (text === null) {
      skipped.binary++
      continue
    }
    const size = byteLength(text)
    if (count >= LIMITS.files || total + size > LIMITS.totalBytes) {
      skipped.overLimit++
      continue
    }
    files[path] = text
    total += size
    count++
  }
  return { files, skipped }
}

/** 规范化一组文件的路径；有不合法的（..、控制字符……）就整组拒绝。 */
export function normalizeFiles(files: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [raw, text] of Object.entries(files)) {
    const path = normalizePath(raw)
    if (!path) throw new HttpError(400, `invalid file path: ${JSON.stringify(raw.slice(0, 80))}`)
    result[path] = text
  }
  return result
}

/** 一组要写进仓库的文件是否在上限之内；超了抛 413。 */
export function assertWithinLimits(files: Record<string, string>): { count: number; bytes: number } {
  const count = Object.keys(files).length
  let bytes = 0
  for (const [path, text] of Object.entries(files)) {
    const size = byteLength(text)
    if (size > LIMITS.fileBytes) throw new HttpError(413, `${path} is larger than ${LIMITS.fileBytes / 1024} KB`)
    bytes += size
  }
  if (count > LIMITS.files) throw new HttpError(413, `a repository holds at most ${LIMITS.files} files`)
  if (bytes > LIMITS.totalBytes) throw new HttpError(413, `a repository holds at most ${LIMITS.totalBytes / 1024 / 1024} MB of text`)
  return { count, bytes }
}
