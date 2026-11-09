// SPDX-License-Identifier: MIT
// Copyright (c) 2023 onWidget
// Source: https://github.com/arthelokyo/astrowind/blob/14e1a69/src/components/widgets/Hero2.astro
// Modified by Motif; see the item's provenance.
import { useId, useRef } from 'react'
import { cn, useFrameLoop } from '@/lib/motif-runtime'
import { mix } from './parts'

/*
 * 首屏的图片位：上游是一张 Unsplash 照片，这里换成一盏 SVG 日出灯。
 * 灯面里的太阳从地平线下升起，天色从夜紫走到晨金，墙上的光晕和桌面倒影跟着变；
 * 一个完整周期是夜 → 黎明 → 日出 → 清晨 → 再回到夜（余弦往返，循环无缝）。
 */

type Palette = { room: string; roomLow: string; halo: string; skyTop: string; skyBottom: string; sun: string; hill: string; hillFar: string }

const KEYS: { at: number; c: Palette }[] = [
  { at: 0, c: { room: '#0b0918', roomLow: '#07060d', halo: '#4c3a9a', skyTop: '#130f2e', skyBottom: '#2e2160', sun: '#7a3f8f', hill: '#0d0a1c', hillFar: '#1a1438' } },
  { at: 0.35, c: { room: '#160d22', roomLow: '#0a0710', halo: '#d24a78', skyTop: '#3a2a74', skyBottom: '#e0607a', sun: '#ff7a59', hill: '#1c1028', hillFar: '#3c2048' } },
  { at: 0.7, c: { room: '#22121a', roomLow: '#0e0a0d', halo: '#ff8a3d', skyTop: '#e2706a', skyBottom: '#ffb46a', sun: '#ffd27a', hill: '#2a1620', hillFar: '#6a3438' } },
  { at: 1, c: { room: '#2a1a18', roomLow: '#120d0c', halo: '#ffbf6a', skyTop: '#ffc58f', skyBottom: '#fff0d2', sun: '#fffaf0', hill: '#3a2420', hillFar: '#a0604a' } },
]

function paletteAt(u: number): Palette {
  let i = 0
  while (i < KEYS.length - 2 && u > KEYS[i + 1]!.at) i++
  const a = KEYS[i]!
  const b = KEYS[i + 1]!
  const t = Math.min(1, Math.max(0, (u - a.at) / (b.at - a.at)))
  const out = {} as Palette
  for (const key of Object.keys(a.c) as (keyof Palette)[]) out[key] = mix(a.c[key], b.c[key], t)
  return out
}

/** 一个周期的秒数（速度 1 时）。 */
const PERIOD = 10
/** 起始相位：第 0 秒就在日出前后，海报好看。 */
const PHASE = 0.3
/** 减少动态效果时停在日出那一刻。 */
export const STATIC_TIME = (1 / 3 - PHASE) * PERIOD

/** 某一时刻的日出进度（0 夜，1 清晨），余弦往返。 */
function dawnAt(time: number) {
  const p = time / PERIOD + PHASE
  return 0.5 - 0.5 * Math.cos(p * Math.PI * 2)
}

export function SunriseLamp({ speed, brand, className }: { speed: number; brand: string; className?: string }) {
  const host = useRef<HTMLDivElement>(null)
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const ids = { room: `${uid}r`, halo: `${uid}h`, sky: `${uid}s`, sun: `${uid}u`, face: `${uid}f`, frame: `${uid}m`, wood: `${uid}w`, floor: `${uid}l` }
  const stops = useRef<Record<string, SVGStopElement | null>>({})
  const sunRef = useRef<SVGGElement>(null)
  const hillRef = useRef<SVGPathElement>(null)
  const hillFarRef = useRef<SVGPathElement>(null)
  const rimRef = useRef<SVGCircleElement>(null)
  const clockRef = useRef<SVGTextElement>(null)
  const last = useRef('')

  const stop = (key: string) => (el: SVGStopElement | null) => {
    stops.current[key] = el
  }

  // 每帧只改十几个属性：渐变色标、太阳位置、山丘颜色、底座上的时间。
  useFrameLoop(
    host,
    ({ time }) => {
      const u = dawnAt(time)
      const c = paletteAt(u)
      const s = stops.current
      s.room0?.setAttribute('stop-color', c.room)
      s.room1?.setAttribute('stop-color', c.roomLow)
      s.halo0?.setAttribute('stop-color', c.halo)
      s.halo0?.setAttribute('stop-opacity', (0.38 + 0.4 * u).toFixed(3))
      s.halo1?.setAttribute('stop-color', c.halo)
      s.halo1?.setAttribute('stop-opacity', (0.1 + 0.16 * u).toFixed(3))
      s.sky0?.setAttribute('stop-color', c.skyTop)
      s.sky1?.setAttribute('stop-color', c.skyBottom)
      s.sun0?.setAttribute('stop-color', mix(c.sun, '#ffffff', 0.55))
      s.sun1?.setAttribute('stop-color', c.sun)
      s.floor0?.setAttribute('stop-color', c.halo)
      s.floor0?.setAttribute('stop-opacity', (0.22 + 0.35 * u).toFixed(3))
      hillRef.current?.setAttribute('fill', c.hill)
      hillFarRef.current?.setAttribute('fill', c.hillFar)
      rimRef.current?.setAttribute('stroke', c.halo)
      rimRef.current?.setAttribute('stroke-opacity', (0.25 + 0.45 * u).toFixed(3))
      sunRef.current?.setAttribute('transform', `translate(0 ${(1 - u) * 96})`)
      // 底座显示屏：05:30 到 07:00 之间的模拟时刻，只在分钟变化时改字。
      const minutes = 330 + Math.round(u * 90)
      const label = `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
      if (label !== last.current && clockRef.current) {
        last.current = label
        clockRef.current.textContent = label
      }
    },
    { speed, reducedMotion: 'static', staticTime: STATIC_TIME },
  )

  return (
    <div ref={host} className={cn('relative overflow-hidden rounded-md', className)}>
      <svg viewBox="0 0 560 520" className="block h-auto w-full" role="img" aria-label={`The ${brand} sunrise lamp on a bedside table, glowing from night purple to morning gold`}>
        <defs>
          <linearGradient id={ids.room} x1="0" y1="0" x2="0" y2="1">
            <stop ref={stop('room0')} offset="0" stopColor="#22121a" />
            <stop ref={stop('room1')} offset="1" stopColor="#0e0a0d" />
          </linearGradient>
          <radialGradient id={ids.halo} cx="280" cy="224" r="290" gradientUnits="userSpaceOnUse">
            <stop ref={stop('halo0')} offset="0.3" stopColor="#ff8a3d" stopOpacity="0.68" />
            <stop ref={stop('halo1')} offset="0.62" stopColor="#ff8a3d" stopOpacity="0.22" />
            <stop offset="1" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={ids.sky} x1="0" y1="0" x2="0" y2="1">
            <stop ref={stop('sky0')} offset="0.05" stopColor="#e2706a" />
            <stop ref={stop('sky1')} offset="0.85" stopColor="#ffb46a" />
          </linearGradient>
          <radialGradient id={ids.sun}>
            <stop ref={stop('sun0')} offset="0" stopColor="#fff0d0" />
            <stop ref={stop('sun1')} offset="0.55" stopColor="#ffd27a" />
            <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={ids.frame} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3a3340" />
            <stop offset="1" stopColor="#141117" />
          </linearGradient>
          <linearGradient id={ids.wood} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7a5640" />
            <stop offset="1" stopColor="#3b281d" />
          </linearGradient>
          <radialGradient id={ids.floor} cx="0.5" cy="0.5" r="0.5">
            <stop ref={stop('floor0')} offset="0" stopColor="#ff8a3d" stopOpacity="0.48" />
            <stop offset="1" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <clipPath id={ids.face}>
            <circle cx="280" cy="224" r="128" />
          </clipPath>
        </defs>

        {/* 房间与墙上的光晕 */}
        <rect width="560" height="520" fill={`url(#${ids.room})`} />
        <rect width="560" height="420" fill={`url(#${ids.halo})`} />

        {/* 床头柜桌面与倒影 */}
        <rect y="412" width="560" height="108" fill="#0c090b" />
        <rect y="412" width="560" height="2" fill="#ffffff" opacity="0.06" />
        <ellipse cx="280" cy="430" rx="230" ry="34" fill={`url(#${ids.floor})`} />

        {/* 底座与支柱 */}
        <rect x="266" y="364" width="28" height="34" rx="4" fill="#1a161d" />
        <rect x="186" y="392" width="188" height="24" rx="12" fill={`url(#${ids.wood})`} />
        <rect x="196" y="394" width="168" height="2" rx="1" fill="#ffffff" opacity="0.12" />

        {/* 外圈灯框 */}
        <circle cx="280" cy="224" r="150" fill={`url(#${ids.frame})`} />
        <circle ref={rimRef} cx="280" cy="224" r="149" fill="none" stroke="#ff8a3d" strokeOpacity="0.56" strokeWidth="2" />

        {/* 灯面：天色、升起的太阳、两层山丘 */}
        <g clipPath={`url(#${ids.face})`}>
          <rect x="152" y="96" width="256" height="256" fill={`url(#${ids.sky})`} />
          <g ref={sunRef} transform="translate(0 29)">
            <circle cx="280" cy="250" r="92" fill={`url(#${ids.sun})`} />
            <circle cx="280" cy="250" r="34" fill="#ffffff" opacity="0.28" />
          </g>
          <path ref={hillFarRef} d="M150 286c40-22 78-30 118-22s70 4 104-12 34-8 40-4V360H150z" fill="#6a3438" />
          <path ref={hillRef} d="M150 314c52-26 104-24 146-10s74 6 112-12V360H150z" fill="#2a1620" />
          <circle cx="280" cy="224" r="104" fill="none" stroke="#ffffff" strokeOpacity="0.07" strokeWidth="1.5" />
          <circle cx="280" cy="224" r="78" fill="none" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1.5" />
        </g>
        <circle cx="280" cy="224" r="128" fill="none" stroke="#000000" strokeOpacity="0.35" strokeWidth="6" />
        <circle cx="280" cy="224" r="131" fill="none" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1" />

        {/* 灯框底部的显示屏 */}
        <rect x="250" y="354" width="60" height="18" rx="9" fill="#09070b" />
        <text
          ref={clockRef}
          x="280"
          y="367"
          textAnchor="middle"
          fontSize="11"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fill="#ffb46a"
          letterSpacing="1"
        >
          06:30
        </text>
      </svg>
    </div>
  )
}
