import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'

export interface ItemMedia {
  poster: string | null
  /** 480 px 宽的海报，给卡片的 srcset 用。 */
  posterSmall: string | null
  loopWebm: string | null
  loopMp4: string | null
}

// 缩略图与循环视频由 `pnpm capture` 生成到 public/media/<slug>/，随仓库提交。
const MEDIA_DIR = path.resolve(/*turbopackIgnore: true*/ process.cwd(), 'public', 'media')

/*
 * 市场页一次请求要给四百多个条目各查 4 个文件在不在，一千多次同步的文件系统调用（docs/decisions/0012）。
 * 线上的 public/ 是打进镜像的，进程活着的时候不会变，所以第一次用到时把 media/ 下有哪些文件列一遍记下来，
 * 之后只查这张表；表的大小由目录决定，随便编的 slug 不会把它撑大。
 * 开发时 `pnpm capture` 随时会生成新文件，每次都现查。
 */
let shipped: Map<string, Set<string>> | null = null

function shippedFiles(): Map<string, Set<string>> {
  if (!shipped) {
    shipped = new Map()
    const entries = existsSync(/*turbopackIgnore: true*/ MEDIA_DIR) ? readdirSync(/*turbopackIgnore: true*/ MEDIA_DIR, { withFileTypes: true }) : []
    for (const entry of entries) {
      if (entry.isDirectory()) shipped.set(entry.name, new Set(readdirSync(path.join(/*turbopackIgnore: true*/ MEDIA_DIR, entry.name))))
    }
  }
  return shipped
}

function has(slug: string, name: string): boolean {
  if (process.env.NODE_ENV === 'production') return shippedFiles().get(slug)?.has(name) ?? false
  return existsSync(path.join(/*turbopackIgnore: true*/ MEDIA_DIR, slug, name))
}

export function mediaFor(slug: string): ItemMedia {
  const file = (name: string) => (has(slug, name) ? `/media/${slug}/${name}` : null)
  return { poster: file('poster.webp'), posterSmall: file('poster-sm.webp'), loopWebm: file('loop.webm'), loopMp4: file('loop.mp4') }
}
