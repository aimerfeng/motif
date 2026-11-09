import type { ReactNode } from 'react'

/**
 * 细部图共用的画布：240×120，线宽固定，字跟着缩放。
 * 画布最窄约 250px（360px 宽的单列，或 @7xl 刚切到四列时），所以字号取 10–11 个单位，换算下来不小于 10px。
 */
function Drawing({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 240 120" className="block h-auto w-full" role="img" aria-label={label}>
      <g className="fill-none stroke-ink" strokeWidth={1.2} strokeLinejoin="round">
        {children}
      </g>
    </svg>
  )
}

function Text({ x, y, children, anchor = 'middle', muted = false, size = 11 }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end'; muted?: boolean; size?: number }) {
  return (
    <text x={x} y={y} textAnchor={anchor} className={muted ? 'fill-ink-muted stroke-none font-bp-mono' : 'fill-ink stroke-none font-bp-mono'} fontSize={size} letterSpacing="0.04em">
      {children}
    </text>
  )
}

function Head({ x, y, dir }: { x: number; y: number; dir: 'right' | 'down' | 'left' }) {
  const d = dir === 'right' ? `M${x} ${y}l-6 -2.6v5.2z` : dir === 'left' ? `M${x} ${y}l6 -2.6v5.2z` : `M${x} ${y}l-2.6 -6h5.2z`
  return <path d={d} className="fill-ink stroke-none" />
}

export function DetailAnycast() {
  const pops = [
    ['FRA', 22],
    ['SIN', 60],
    ['GRU', 98],
  ] as const
  return (
    <Drawing label="One anycast address announced from three PoPs">
      <rect x={10} y={46} width={92} height={28} />
      <Text x={56} y={64}>
        203.0.113.7
      </Text>
      {pops.map(([code, y]) => (
        <g key={code}>
          <path d={`M102 60C140 60 140 ${y} 172 ${y}`} className="stroke-rule" />
          <Head x={178} y={y} dir="right" />
          <rect x={178} y={y - 11} width={48} height={22} />
          <Text x={202} y={y + 4}>
            {code}
          </Text>
        </g>
      ))}
      <Text x={56} y={90} muted size={10}>
        same IP
      </Text>
    </Drawing>
  )
}

export function DetailPop() {
  return (
    <Drawing label="Inside a PoP: an isolate running your function next to the cache">
      <rect x={8} y={8} width={224} height={104} />
      <rect x={13} y={13} width={214} height={94} className="stroke-hair" />
      {/* 函数隔离区 */}
      <rect x={28} y={34} width={78} height={52} strokeDasharray="4 3" />
      <Text x={67} y={57}>
        fn(req)
      </Text>
      <Text x={67} y={72} muted size={10}>
        isolate
      </Text>
      {/* 缓存：圆柱 */}
      <ellipse cx={180} cy={38} rx={28} ry={7} />
      <path d="M152 38v44M208 38v44" />
      <path d="M152 82a28 7 0 0 0 56 0" />
      <path d="M152 56a28 7 0 0 0 56 0" className="stroke-hair" />
      <Text x={180} y={74}>
        cache
      </Text>
      <path d="M106 54h38" />
      <Head x={150} y={54} dir="right" />
      <path d="M150 68h-38" className="stroke-rule" />
      <Head x={106} y={68} dir="left" />
      <Text x={128} y={100} muted size={10}>
        same machine
      </Text>
    </Drawing>
  )
}

export function DetailShield() {
  const xs = [24, 72, 120, 168, 216]
  return (
    <Drawing label="Five PoPs funnel their cache misses into one regional shield">
      {xs.map((x) => (
        <g key={x}>
          <rect x={x - 12} y={8} width={24} height={16} />
          <path d={`M${x} 24C${x} 44 120 40 120 52`} className="stroke-rule" strokeDasharray="4 3" />
        </g>
      ))}
      <circle cx={120} cy={64} r={12} />
      <path d="M111.5 55.5l17 17M111.5 72.5l17-17" />
      <path d="M120 76v18" />
      <Head x={120} y={100} dir="down" />
      <rect x={92} y={100} width={56} height={16} />
      <Text x={120} y={112} size={10}>
        origin
      </Text>
      <Text x={146} y={67} anchor="start" muted size={10}>
        shield
      </Text>
      {/* 放在源站框左边两行写：一行写不下，会顶到框角 */}
      <Text x={8} y={97} anchor="start" muted size={10}>
        5 misses
      </Text>
      <Text x={8} y={111} anchor="start" muted size={10}>
        → 1 fetch
      </Text>
    </Drawing>
  )
}

export function DetailOrigin() {
  return (
    <Drawing label="The origin rack receives traffic over mutual TLS only">
      <path d="M8 60h52" strokeDasharray="5 4" />
      <Head x={66} y={60} dir="right" />
      <Text x={34} y={52} muted size={10}>
        mTLS
      </Text>
      <rect x={66} y={10} width={100} height={100} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={74} y={18 + i * 30} width={84} height={24} className="stroke-rule" />
          <circle cx={84} cy={30 + i * 30} r={2.4} className="fill-ink stroke-none" />
          <path d={`M126 ${24 + i * 30}v12M132 ${24 + i * 30}v12M138 ${24 + i * 30}v12M144 ${24 + i * 30}v12`} className="stroke-hair" />
        </g>
      ))}
      {/* 锁：只放行来自边缘网络的连接 */}
      <rect x={190} y={56} width={30} height={26} />
      <path d="M196 56v-8a9 9 0 0 1 18 0v8" />
      <circle cx={205} cy={68} r={2.4} className="fill-ink stroke-none" />
      <path d="M205 70v5" />
      <path d="M166 69h24" className="stroke-hair" strokeDasharray="3 3" />
      <Text x={205} y={98} muted size={10}>
        allowlist
      </Text>
    </Drawing>
  )
}
