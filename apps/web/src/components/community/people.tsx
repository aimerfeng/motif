import type { Address } from 'viem'
import { Link } from '@/i18n/navigation'
import { shortAddress } from '@/lib/community/shared'

/**
 * 地址生成的头像：两团渐变，色相取自地址。同一个地址在哪里都是同一个样子，不需要上传图片。
 * 用和市场卡片占位图同样的暗色渐变，放在站点里不跳脱。
 */
export function Avatar({ address, className = 'size-8' }: { address: string; className?: string }) {
  const hue = (start: number) => Number.parseInt(address.slice(start, start + 4), 16) % 360
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 rounded-full ring-1 ring-line-strong ${className}`}
      style={{
        background: `radial-gradient(120% 90% at 30% 20%, oklch(0.62 0.13 ${hue(2)}), transparent 62%), radial-gradient(100% 90% at 80% 90%, oklch(0.5 0.14 ${hue(6)}), transparent 60%), oklch(0.25 0.03 ${hue(10)})`,
      }}
    />
  )
}

export interface Person {
  address: Address
  handle: string | null
}

export function personHref(person: Person): string {
  return `/community/u/${person.handle ?? person.address}`
}

export function personLabel(person: Person): string {
  return person.handle ? `@${person.handle}` : shortAddress(person.address)
}

/** 指向创作者主页的链接：有 handle 显示 @handle，没有就显示缩写地址。 */
export function PersonLink({ person, avatar = false, className = '' }: { person: Person; avatar?: boolean; className?: string }) {
  return (
    <Link
      href={personHref(person)}
      title={person.address}
      className={`inline-flex items-center gap-1.5 underline decoration-transparent underline-offset-4 transition-colors duration-150 hover:decoration-line-strong ${className}`}
    >
      {avatar && <Avatar address={person.address} className="size-4" />}
      <span className={person.handle ? '' : 'font-mono text-[0.92em]'}>{personLabel(person)}</span>
    </Link>
  )
}
