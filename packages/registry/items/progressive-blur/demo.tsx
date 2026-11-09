// SPDX-License-Identifier: MIT
// Copyright (c) 2024 ibelick
// Source: https://github.com/ibelick/motion-primitives/blob/120f64f/app/docs/progressive-blur/progressive-blur-hover.tsx
// Modified by Motif; see the item's provenance.
import { useFrameLoop } from '@motif/runtime'
import { motion } from 'motion/react'
import { useRef, useState } from 'react'
import { ProgressiveBlur, type ProgressiveBlurProps } from './progressive-blur'

const variants = { hidden: { opacity: 0 }, visible: { opacity: 1 } }
const transition = { duration: 0.2, ease: 'easeOut' } as const
const bars = Array.from({ length: 14 }, (_, i) => i)

function Artwork() {
  return (
    <svg viewBox="0 0 300 300" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="pb-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b1340" />
          <stop offset="0.55" stopColor="#c2410c" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <rect width="300" height="300" fill="url(#pb-sky)" />
      <circle cx="210" cy="120" r="46" fill="#fde68a" />
      {bars.map((i) => (
        <rect key={i} x={i * 22 - 4} y={150 + ((i * 37) % 70)} width="14" height="200" fill={i % 2 ? '#0f0a24' : '#2a1650'} />
      ))}
      {bars.map((i) => (
        <rect key={`w${i}`} x={i * 22} y={190 + ((i * 53) % 60)} width="4" height="6" fill="#fcd34d" />
      ))}
      <path d="M0 270 L60 240 L120 262 L190 232 L250 258 L300 240 L300 300 L0 300 Z" fill="#05030f" />
    </svg>
  )
}

export function Demo(props: ProgressiveBlurProps) {
  const host = useRef<HTMLDivElement>(null)
  const [manual, setManual] = useState<boolean | null>(null)
  const [auto, setAuto] = useState(true)

  // 自动播放：每 3 秒里悬停 2 秒；用户真正悬停后停止自动播放。
  useFrameLoop(
    host,
    ({ time }) => {
      const next = time % 3 < 2
      setAuto((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 1 },
  )
  const isHover = manual ?? auto

  return (
    <div ref={host} className="grid h-full w-full place-items-center bg-background p-4">
      <div
        className="relative aspect-square w-full max-w-[300px] overflow-hidden rounded-[4px]"
        onMouseEnter={() => setManual(true)}
        onMouseLeave={() => setManual(false)}
      >
        <Artwork />
        <ProgressiveBlur {...props} animate={isHover ? 'visible' : 'hidden'} variants={variants} transition={transition} />
        <motion.div className="absolute bottom-0 left-0" animate={isHover ? 'visible' : 'hidden'} variants={variants} transition={transition}>
          <div className="flex flex-col items-start gap-0 px-5 py-4">
            <p className="text-base font-medium text-white">Ines Varga</p>
            <span className="text-base text-zinc-300">Low Tide District</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
