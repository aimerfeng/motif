/**
 * 用户头像：名字的第一个字，底色由用户 id 决定。不加载 GitHub 头像——那是外部图片，国内经常打不开（AGENTS.md：不依赖外部 CDN）。
 */
export function UserAvatar({ id, name, className = 'size-8 text-[13px]' }: { id: string; name: string; className?: string }) {
  let hash = 0
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  const hue = hash % 360
  const initial = Array.from(name.trim())[0]?.toUpperCase() ?? '?'
  return (
    <span
      aria-hidden
      className={`inline-grid shrink-0 place-items-center rounded-full font-medium text-white ring-1 ring-line-strong ${className}`}
      style={{ background: `radial-gradient(120% 90% at 30% 20%, oklch(0.62 0.12 ${hue}), oklch(0.36 0.08 ${(hue + 40) % 360}))` }}
    >
      {initial}
    </span>
  )
}
