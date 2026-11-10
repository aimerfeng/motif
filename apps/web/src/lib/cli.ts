import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { gzipSync } from 'node:zlib'

/*
 * motif 命令行（packages/cli）在站点这一侧的信息：构建产物在哪、当前版本、给用户看的命令怎么写。
 * 站点自己分发 CLI（/cli/…，见 app/cli/[file]/route.ts），不经过 npm：用户在国内，npm 官方源不稳，
 * 而且这样 CLI 和它对接的接口总是同一次部署出来的（docs/decisions/0011-cli-and-agent-onboarding.md）。
 */

/** 镜像里保留整个工作区，按相对位置找。 */
const CLI_DIR = path.resolve(/*turbopackIgnore: true*/ process.cwd(), '../..', 'packages/cli')
export const CLI_BUNDLE = path.join(CLI_DIR, 'dist/motif.mjs')

let version: string | undefined

export function cliVersion(): string {
  version ??= (JSON.parse(fs.readFileSync(path.join(CLI_DIR, 'package.json'), 'utf8')) as { version: string }).version
  return version
}

/**
 * npx 按地址缓存非 registry 的包：地址不变就一直用旧的。所以地址里带版本号，CLI 一更新地址就变。
 * 旧版本的地址仍然能用（路由不看版本号，总是给当前这一版），写进 MCP 配置里的命令不会失效。
 */
export function cliPackageUrl(origin: string): string {
  return `${origin}/cli/motif-${cliVersion()}.tgz`
}

/** 不用安装、直接运行 CLI 的命令，例如 cliCommand(origin, 'login')。 */
export function cliCommand(origin: string, args: string): string {
  return `npx -y ${cliPackageUrl(origin)} ${args}`
}

/** CLI 源码里的占位符（packages/cli/src/context.ts）：分发时换成站点自己的地址。 */
const ORIGIN_PLACEHOLDER = '__MOTIF_ORIGIN__'

function tarEntry(name: string, content: Buffer, mode: number, mtime: number): Buffer {
  const header = Buffer.alloc(512)
  const octal = (value: number, length: number) => value.toString(8).padStart(length - 1, '0') + '\0'
  header.write(name, 0, 100, 'utf8')
  header.write(octal(mode, 8), 100, 8, 'ascii')
  header.write(octal(0, 8), 108, 8, 'ascii')
  header.write(octal(0, 8), 116, 8, 'ascii')
  header.write(octal(content.length, 12), 124, 12, 'ascii')
  header.write(octal(mtime, 12), 136, 12, 'ascii')
  // 校验和按「校验和这一栏全是空格」来算。
  header.write('        ', 148, 8, 'ascii')
  header.write('0', 156, 1, 'ascii')
  header.write('ustar\0', 257, 6, 'ascii')
  header.write('00', 263, 2, 'ascii')
  let sum = 0
  for (const byte of header) sum += byte
  header.write(`${sum.toString(8).padStart(6, '0')}\0 `, 148, 8, 'ascii')
  const padding = Buffer.alloc((512 - (content.length % 512)) % 512)
  return Buffer.concat([header, content, padding])
}

/**
 * npm 能装的包（.tgz）：里面只有 package.json 和打包好的那一个文件。
 * 自己拼 tar 而不是构建时用 npm pack：包里要写站点的地址，而地址到请求来了才知道（同一个镜像可以挂在不同域名下）。
 * 两个文件、名字都短，ustar 最基本的格式就够，不值得为它加一个依赖。
 */
export function cliTarball(script: string, version: string, mtime: number): Buffer {
  const manifest = {
    name: 'motif-cli',
    version,
    description: 'Motif from the terminal: connect coding agents over MCP, search the market, add UI to a project.',
    type: 'module',
    bin: { motif: 'motif.mjs' },
    engines: { node: '>=18' },
    license: 'MIT',
  }
  const tar = Buffer.concat([
    tarEntry('package/package.json', Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`), 0o644, mtime),
    tarEntry('package/motif.mjs', Buffer.from(script), 0o755, mtime),
    // 结尾是两个全零的块。
    Buffer.alloc(1024),
  ])
  return gzipSync(tar, { level: 9 })
}

export interface CliFiles {
  script: string
  tarball: Buffer
  /** 内容的指纹：npx 每次启动都会来问一遍这个包变没变，没变就回 304。 */
  etag: string
}

const built = new Map<string, CliFiles>()

/** 给这个地址的站点用的 CLI。还没构建（packages/cli/dist 不存在）时返回 null。 */
export function cliFiles(origin: string): CliFiles | null {
  let stat: fs.Stats
  try {
    stat = fs.statSync(CLI_BUNDLE)
  } catch {
    return null
  }
  // 开发时 CLI 会重新构建：文件一变缓存就失效。
  const key = `${origin}\n${stat.mtimeMs}`
  let files = built.get(key)
  if (!files) {
    const script = fs.readFileSync(CLI_BUNDLE, 'utf8').replaceAll(ORIGIN_PLACEHOLDER, origin)
    const tarball = cliTarball(script, cliVersion(), Math.floor(stat.mtimeMs / 1000))
    files = { script, tarball, etag: `"${createHash('sha256').update(tarball).digest('base64url').slice(0, 24)}"` }
    built.clear()
    built.set(key, files)
  }
  return files
}
