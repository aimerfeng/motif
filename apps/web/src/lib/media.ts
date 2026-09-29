import { existsSync } from 'node:fs'
import path from 'node:path'

export interface ItemMedia {
  poster: string | null
  loopWebm: string | null
  loopMp4: string | null
}

// 缩略图与循环视频由 `pnpm capture` 生成到 public/media/<slug>/，随仓库提交。
const PUBLIC_DIR = path.resolve(process.cwd(), 'public')

export function mediaFor(slug: string): ItemMedia {
  const file = (name: string) => (existsSync(path.join(PUBLIC_DIR, 'media', slug, name)) ? `/media/${slug}/${name}` : null)
  return { poster: file('poster.webp'), loopWebm: file('loop.webm'), loopMp4: file('loop.mp4') }
}
