import type { ReactNode } from 'react'
import { CommunityNav } from '@/components/community/community-nav'

export default function CommunityLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto max-w-[1400px] px-5 pt-8 pb-24 sm:px-8">
      <CommunityNav />
      <div className="pt-10">{children}</div>
    </main>
  )
}
