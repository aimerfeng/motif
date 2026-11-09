import { animate, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { cn, useFrameLoop } from '@/lib/motif-runtime'
import { GLOBAL, LAND, MAP_ASPECT, MAP_BOTTOM, MAP_H, MAP_TOP, MAP_W, polygonPath, project, REGIONS, WATER, type Region } from './world'

type Box = [number, number, number, number]

/** 区域视口：以区域中心为准、纵向跨度为高，宽按地图比例补足，保证缩放时不变形。 */
function boxFor(view: { center: readonly [number, number]; span: number }): Box {
  const [cx, cy] = project(view.center)
  const h = view.span * 2
  const w = h * MAP_ASPECT
  return [cx - w / 2, cy - h / 2, w, h]
}

const LAND_PATH = polygonPath(LAND)
const WATER_PATH = polygonPath(WATER)
const NODES = REGIONS.flatMap((region) => region.list.map((city) => ({ ...city, region: region.id, xy: project(city.at) })))
/** 标注放在节点左边的城市：右边已经有邻居。 */
const LABEL_LEFT = new Set(['LHR', 'CAI', 'GRU', 'MAD', 'LAX', 'SEA', 'PER', 'BOM', 'LIM'])
const MAX_MS = 32

function useMapZoom(regionId: string) {
  const svg = useRef<SVGSVGElement>(null)
  const hatch = useRef<SVGPatternElement>(null)
  const box = useRef<Box>(boxFor(GLOBAL))
  const reduced = useReducedMotion()

  const apply = useCallback(() => {
    const el = svg.current
    if (!el) return
    const width = el.getBoundingClientRect().width || MAP_W
    const k = box.current[2] / width
    el.setAttribute('viewBox', box.current.map((v) => v.toFixed(2)).join(' '))
    el.style.setProperty('--k', k.toFixed(4))
    hatch.current?.setAttribute('patternTransform', `scale(${k.toFixed(4)}) rotate(45)`)
  }, [])

  // 视口和缩放比直接写到 DOM 上：动画每一帧都改，不值得让 React 重新渲染整张地图。
  useLayoutEffect(() => {
    const el = svg.current
    if (!el) return
    apply()
    const observer = new ResizeObserver(() => apply())
    observer.observe(el)
    return () => observer.disconnect()
  }, [apply])

  useEffect(() => {
    const target = boxFor(regionId === 'global' ? GLOBAL : (REGIONS.find((r) => r.id === regionId) ?? GLOBAL))
    const from = [...box.current] as Box
    if (reduced) {
      box.current = target
      apply()
      return
    }
    const controls = animate(0, 1, {
      duration: 0.9,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (p) => {
        box.current = from.map((v, i) => v + (target[i]! - v) * p) as Box
        apply()
      },
    })
    return () => controls.stop()
  }, [regionId, reduced, apply])

  return { svg, hatch }
}

function MapFigure({ regionId, speed }: { regionId: string; speed: number }) {
  const id = useId().replace(/:/g, '')
  const { svg, hatch } = useMapZoom(regionId)
  const pulses = useRef<(SVGCircleElement | null)[]>([])

  // 帧循环只管半径和透明度；哪些环显示由渲染决定（见下面的 visibility）。
  // 「减少动态效果」时帧循环只画一帧，换区域不会重画，靠它隐藏环就会留下旧区域的脉冲。
  useFrameLoop(
    svg,
    ({ time }) => {
      pulses.current.forEach((ring, i) => {
        if (!ring) return
        const p = (time * 0.42 + i * 0.137) % 1
        ring.setAttribute('r', (3.5 + p * 12).toFixed(2))
        ring.setAttribute('opacity', (0.6 * (1 - p) ** 1.6).toFixed(3))
      })
    },
    { speed, reducedMotion: 'static', staticTime: 1.2 },
  )

  const graticule: string[] = []
  for (let lon = -150; lon <= 150; lon += 30) graticule.push(`M${(lon + 180) * 2} 0V${MAP_H}`)
  for (let lat = 60; lat >= -30; lat -= 30) graticule.push(`M0 ${(MAP_TOP - lat) * 2}H${MAP_W}`)

  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      className="block h-auto w-full"
      style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}
      role="img"
      aria-label="Map of edge PoP locations. The selected region is highlighted and labelled."
    >
      <defs>
        <pattern ref={hatch} id={`${id}-hatch`} width={5} height={5} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1={0} y1={0} x2={0} y2={5} className="stroke-ink" strokeWidth={0.9} opacity={0.28} />
        </pattern>
      </defs>
      <rect x={0} y={0} width={MAP_W} height={MAP_H} className="fill-none stroke-hair" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      <path d={graticule.join('')} className="fill-none stroke-faint" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      <path d={`M0 ${MAP_TOP * 2}H${MAP_W}`} className="fill-none stroke-hair" strokeWidth={1} strokeDasharray="6 5" vectorEffect="non-scaling-stroke" />
      <path d={LAND_PATH} className="fill-ink" opacity={0.05} />
      <path d={LAND_PATH} fill={`url(#${id}-hatch)`} className="stroke-rule" strokeWidth={0.9} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <path d={WATER_PATH} className="fill-paper stroke-rule" strokeWidth={0.9} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {NODES.map((node, i) => {
        const on = regionId === 'global' || node.region === regionId
        const labelled = regionId !== 'global' && node.region === regionId
        const left = LABEL_LEFT.has(node.code)
        return (
          <g key={node.code} transform={`translate(${node.xy[0].toFixed(1)} ${node.xy[1].toFixed(1)})`}>
            <g style={{ transform: 'scale(var(--k, 1))' }}>
              <circle
                ref={(el) => {
                  pulses.current[i] = el
                }}
                r={4}
                className="fill-none stroke-ink"
                strokeWidth={1}
                opacity={0}
                visibility={on ? 'visible' : 'hidden'}
              />
              {on ? (
                <>
                  <circle r={3.6} className="fill-paper stroke-ink" strokeWidth={1.5} />
                  <circle r={1.3} className="fill-ink" />
                </>
              ) : (
                <circle r={2} className="fill-ink" opacity={0.45} />
              )}
              {labelled ? (
                <text
                  x={left ? -7 : 7}
                  y={-6}
                  textAnchor={left ? 'end' : 'start'}
                  className="fill-ink stroke-paper font-bp-mono"
                  strokeWidth={3}
                  paintOrder="stroke"
                  fontSize={10.5}
                  letterSpacing="0.06em"
                >
                  {node.code}
                </text>
              ) : null}
            </g>
          </g>
        )
      })}
      {/* 南北纬度刻度：落在地图左边缘，缩放时跟着走 */}
      {[60, 30, 0, -30].map((lat) => (
        <g key={lat} transform={`translate(2 ${(MAP_TOP - lat) * 2})`}>
          <g style={{ transform: 'scale(var(--k, 1))' }}>
            <text x={3} y={-3} className="fill-ink-muted stroke-paper font-bp-mono" strokeWidth={3} paintOrder="stroke" fontSize={9}>
              {lat === 0 ? '0°' : `${Math.abs(lat)}°${lat > 0 ? 'N' : 'S'}`}
            </text>
          </g>
        </g>
      ))}
      <path d={`M0 ${(MAP_TOP - MAP_BOTTOM) * 2}H${MAP_W}`} className="stroke-hair" strokeWidth={1} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

function NorthArrow() {
  return (
    <svg viewBox="0 0 28 40" className="h-9 w-6 text-ink" aria-hidden>
      <path d="M14 4L20 26L14 22L8 26Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M14 4L14 22L8 26Z" fill="currentColor" />
      <text x="14" y="38" textAnchor="middle" fontSize="9" className="fill-ink font-bp-mono">
        N
      </text>
    </svg>
  )
}

function Bar({ ms, showDimensions, index }: { ms: number; showDimensions: boolean; index: number }) {
  const width = `${Math.min(100, (ms / MAX_MS) * 100)}%`
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <div className="relative h-3 min-w-0 flex-1">
        <motion.div
          className="absolute inset-y-0 left-0 origin-left"
          style={{ width }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.55, delay: 0.12 + index * 0.04, ease: [0.22, 1, 0.36, 1] }}
        >
          {showDimensions ? (
            <div className="flex h-full items-center text-rule">
              <span className="h-full w-px bg-current" />
              <svg viewBox="0 0 8 8" className="size-1.5 shrink-0" aria-hidden>
                <path d="M0 4L8 1v6z" fill="currentColor" />
              </svg>
              <span className="h-px flex-1 bg-current" />
              <svg viewBox="0 0 8 8" className="size-1.5 shrink-0" aria-hidden>
                <path d="M8 4L0 1v6z" fill="currentColor" />
              </svg>
              <span className="h-full w-px bg-current" />
            </div>
          ) : (
            <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 bg-ink" />
          )}
        </motion.div>
      </div>
      <span className="w-12 shrink-0 text-right font-bp-mono text-[13px] text-ink tabular-nums">{ms} ms</span>
    </div>
  )
}

/**
 * 表自己是一个容器：它在宽页面里只占右边一栏，在手机上占满一屏，宽度要看自己而不是看整页。
 * 列宽固定（名字列再长也只截断，不挤延迟条）；窄于 @sm（384px）去掉编号列，窄于 @lg（512px）区域用短名。
 */
function LatencyTable({ region, showDimensions }: { region: Region | null; showDimensions: boolean }) {
  const rows = region
    ? region.list.map((city) => ({ key: city.code, code: city.code, name: city.name, short: city.name, ms: city.p50 }))
    : REGIONS.map((r) => ({ key: r.id, code: String(r.cities), name: r.name, short: r.short, ms: r.p50 }))
  const summary = region ?? GLOBAL
  const head = 'font-bp-mono text-[11px] tracking-[0.12em] whitespace-nowrap text-ink-muted uppercase'
  return (
    <div className="@container/latency min-w-0">
      <table className="w-full table-fixed border-collapse text-left">
        <caption className="sr-only">Median round-trip time from user devices to the nearest PoP, last 24 hours</caption>
        <thead>
          <tr className="border-b border-hair">
            <th scope="col" className="w-[40%] pb-2.5 font-normal @sm/latency:w-[46%]">
              {region ? (
                <span className={head}>PoP</span>
              ) : (
                <>
                  <span className={cn(head, '@sm/latency:hidden')}>Region</span>
                  <span className={cn(head, 'hidden @sm/latency:inline')}>Cities · region</span>
                </>
              )}
            </th>
            <th scope="col" className="pb-2.5 text-right font-normal">
              <span className={head}>p50 RTT · 24 h</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={`${summary.id}-${row.key}`} className="border-b border-faint">
              <th scope="row" className="py-2 pr-3 font-normal">
                <span className="flex min-w-0 items-baseline gap-2.5">
                  <span className="hidden w-8 shrink-0 font-bp-mono text-[12px] text-ink-muted tabular-nums @sm/latency:inline">{row.code}</span>
                  <span className="min-w-0 truncate text-[14px] text-ink" title={row.name}>
                    <span className="@lg/latency:hidden">{row.short}</span>
                    <span className="hidden @lg/latency:inline">{row.name}</span>
                  </span>
                </span>
              </th>
              <td className="py-2">
                <Bar ms={row.ms} showDimensions={showDimensions} index={i} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 flex flex-wrap justify-between gap-x-4 gap-y-1 font-bp-mono text-[12px] text-ink-soft">
        <span>
          {summary.cities} cities · p50 {summary.p50} ms
        </span>
        <span>p95 {summary.p95} ms</span>
      </p>
    </div>
  )
}

export function NetworkMap({ speed, showDimensions }: { speed: number; showDimensions: boolean }) {
  const [regionId, setRegionId] = useState('global')
  const region = REGIONS.find((r) => r.id === regionId) ?? null
  const views = [GLOBAL, ...REGIONS]
  return (
    <div className="grid gap-8 @5xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] @5xl:gap-10">
      <div className="min-w-0">
        <div role="group" aria-label="Region" className="mb-4 flex flex-wrap gap-1.5">
          {views.map((view) => {
            const active = view.id === regionId
            return (
              <button
                key={view.id}
                type="button"
                aria-pressed={active}
                onClick={() => setRegionId(view.id)}
                className={cn(
                  'bp-focus h-8 border px-3 font-bp-mono text-[12px] tracking-[0.04em] transition-[background-color,color,border-color] duration-150',
                  active ? 'border-ink bg-ink text-paper' : 'border-hair text-ink-soft hover:border-rule hover:text-ink',
                )}
              >
                {view.short}
              </button>
            )
          })}
        </div>
        <figure className="relative overflow-hidden border border-hair bg-paper-deep/25">
          <MapFigure regionId={regionId} speed={speed} />
          <div className="pointer-events-none absolute top-2.5 right-2.5 hidden border border-hair bg-paper/85 px-1.5 pt-1 @2xl:block">
            <NorthArrow />
          </div>
          <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-hair px-3 py-2 font-bp-mono text-[11px] tracking-[0.08em] text-ink-muted uppercase">
            <span>View: {region ? region.name : 'all regions'}</span>
            <span>Equirectangular · not to scale</span>
          </figcaption>
        </figure>
      </div>
      <LatencyTable region={region} showDimensions={showDimensions} />
    </div>
  )
}
