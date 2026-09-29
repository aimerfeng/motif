import { useId } from 'react'

/** Motif 的标志：一笔画出的 M，像一段被反复变奏的母题。 */
export function MotifMark({ className }: { className?: string }) {
  const id = useId()
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8f7cff" />
          <stop offset="0.55" stopColor="#ff6fb1" />
          <stop offset="1" stopColor="#ffc46b" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="oklch(0.22 0.01 275)" />
      <path d="M7.5 22.5V11l8.5 7.5 8.5-7.5v11.5" fill="none" stroke={`url(#${id})`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
