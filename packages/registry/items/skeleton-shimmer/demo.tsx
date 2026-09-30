import { useRef, useState } from 'react'
import { useFrameLoop } from '@motif/runtime'
import { Skeleton, SkeletonShimmer, type SkeletonShimmerProps } from './skeleton-shimmer'

/** 一个周期：前 LOAD 秒显示骨架，之后显示真实内容，到 CYCLE 秒再回到骨架。 */
const LOAD = 3.4
const CYCLE = 9

function Cover() {
  return (
    <div className="relative h-24 overflow-hidden rounded-xl" style={{ background: 'linear-gradient(120deg, #4c1d95 0%, #7c3aed 45%, #f472b6 100%)' }}>
      <svg className="absolute inset-0 size-full opacity-30" viewBox="0 0 320 96" preserveAspectRatio="none" aria-hidden>
        <path d="M0 70 C60 40 110 90 170 60 S280 30 320 55 V96 H0Z" fill="#fff" fillOpacity="0.35" />
        <path d="M0 82 C70 60 120 96 190 76 S290 58 320 74 V96 H0Z" fill="#fff" fillOpacity="0.25" />
      </svg>
    </div>
  )
}

function Profile() {
  return (
    <div>
      <Cover />
      <div className="-mt-7 flex items-end justify-between px-4">
        <div className="grid size-14 place-items-center rounded-full border-4 border-card text-lg font-semibold text-white" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
          NF
        </div>
        <button type="button" className="mb-1 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground">
          Follow
        </button>
      </div>
      <div className="px-4 pt-3">
        <p className="text-[15px] font-semibold leading-5 text-card-foreground">Nora Fields</p>
        <p className="text-xs leading-5 text-muted-foreground">Product designer · Lisbon</p>
        <p className="mt-3 text-[13px] leading-5 text-muted-foreground">Designing calm tools for small teams. Rebuilding onboarding at Lumen and writing about design systems.</p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 px-4 pb-4">
        {[
          ['128', 'Posts'],
          ['4.2k', 'Followers'],
          ['312', 'Following'],
        ].map(([value, label]) => (
          <div key={label} className="rounded-lg bg-muted/60 px-3 py-2">
            <p className="text-sm font-semibold leading-4 text-card-foreground">{value}</p>
            <p className="mt-1 text-[11px] leading-3 text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div>
      <Skeleton height={96} style={{ borderRadius: 12 }} index={0} />
      <div className="-mt-7 flex items-end justify-between px-4">
        <span className="rounded-full border-4 border-card">
          <Skeleton circle width={48} index={1} />
        </span>
        <span className="mb-1">
          <Skeleton width={68} height={30} index={2} />
        </span>
      </div>
      <div className="px-4 pt-3">
        <div className="flex h-5 items-center">
          <Skeleton width={110} height={14} index={3} />
        </div>
        <div className="flex h-5 items-center">
          <Skeleton width={150} height={11} index={4} />
        </div>
        <div className="mt-3">
          {[
            { w: '100%', i: 5 },
            { w: '100%', i: 6 },
            { w: '62%', i: 7 },
          ].map((line) => (
            <div key={line.i} className="flex h-5 items-center">
              <Skeleton width={line.w} height={11} index={line.i} />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 px-4 pb-4">
        {[8, 9, 10].map((i) => (
          <Skeleton key={i} height={48} index={i} />
        ))}
      </div>
    </div>
  )
}

export function Demo(props: SkeletonShimmerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)

  useFrameLoop(ref, ({ time }) => setLoading(time % CYCLE < LOAD), { reducedMotion: 'static', staticTime: 1 })

  return (
    <div ref={ref} className="grid h-full w-full place-items-center bg-background p-8">
      <div className="w-full max-w-[19rem] overflow-hidden rounded-2xl border bg-card p-2.5 shadow-2xl shadow-black/40">
        <SkeletonShimmer {...props} loading={loading} skeleton={<ProfileSkeleton />} label="Loading profile">
          <Profile />
        </SkeletonShimmer>
      </div>
    </div>
  )
}
