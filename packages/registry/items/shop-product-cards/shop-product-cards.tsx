// SPDX-License-Identifier: MIT
// Copyright (c) Mark Mead
// Source: https://github.com/markmead/hyperui/blob/2b5aebb/public/examples/marketing/product-cards/6.html
// Modified by Motif; see the item's provenance.
import { cn } from '@motif/runtime'
import { motion, useReducedMotion } from 'motion/react'
import { useState, type CSSProperties, type ReactNode } from 'react'

/* @motif:defaults */
export const defaults = {
  cardStyle: 'boxed',
  accent: '#facc15',
  tone: 'light',
  radius: 0,
  aspect: 'portrait',
  columns: 3,
  showWishlist: true,
  showQuickAdd: true,
}
/* @motif:end */

export type ShopProductCardsProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
  /** 强制某张卡片处于悬停状态（演示自动播放用）。 */
  hovered?: number | null
}

type Art = 'shoe' | 'headphones' | 'robot' | 'plant' | 'lamp' | 'tote'
type Product = {
  id: string
  name: string
  art: Art
  price: number
  was?: number
  badge?: 'New' | 'Save'
  blurb: string
  colors: { name: string; hex: string }[]
}

const PRODUCTS: Product[] = [
  {
    id: 'trainer',
    name: 'Limited Edition Sports Trainer',
    art: 'shoe',
    price: 189.99,
    badge: 'New',
    blurb: 'Knit upper, foam midsole and a heel tab you can actually grab.',
    colors: [
      { name: 'Coral', hex: '#f0715a' },
      { name: 'Slate', hex: '#5b6b82' },
      { name: 'Bone', hex: '#d9cdb8' },
      { name: 'Moss', hex: '#7d9a6a' },
      { name: 'Ink', hex: '#2b2f3a' },
      { name: 'Sky', hex: '#8fb8de' },
    ],
  },
  {
    id: 'headphones',
    name: 'Wireless Headphones',
    art: 'headphones',
    price: 49.99,
    was: 80,
    badge: 'Save',
    blurb: 'Thirty hours per charge, folds flat, and the cushions come off for washing.',
    colors: [
      { name: 'Space Grey', hex: '#595759' },
      { name: 'Silver', hex: '#d2d3d4' },
      { name: 'Pink', hex: '#d89f97' },
      { name: 'Sage', hex: '#afbfab' },
      { name: 'Steel Blue', hex: '#91a5bb' },
    ],
  },
  {
    id: 'robot',
    name: 'Robot Toy',
    art: 'robot',
    price: 14.99,
    badge: 'New',
    blurb: 'Wind-up tin robot with a key in its back. Walks about a metre per turn.',
    colors: [
      { name: 'Tomato', hex: '#e2553f' },
      { name: 'Teal', hex: '#3e9a95' },
      { name: 'Mustard', hex: '#e0b33c' },
    ],
  },
  {
    id: 'aloe',
    name: 'Aloe Vera',
    art: 'plant',
    price: 24,
    was: 27,
    badge: 'Save',
    blurb: 'Potted in a glazed stoneware planter. Water it every two weeks and forget it.',
    colors: [
      { name: 'Terracotta', hex: '#c8714f' },
      { name: 'Chalk', hex: '#e8e3da' },
      { name: 'Charcoal', hex: '#3b3b3f' },
    ],
  },
  {
    id: 'lamp',
    name: 'Arc Desk Lamp',
    art: 'lamp',
    price: 129,
    blurb: 'Weighted base, a two-joint arm and a warm 2700K bulb included.',
    colors: [
      { name: 'Signal Red', hex: '#d94a3d' },
      { name: 'Black', hex: '#26262b' },
      { name: 'Cream', hex: '#efe6d2' },
    ],
  },
  {
    id: 'tote',
    name: 'Canvas Market Tote',
    art: 'tote',
    price: 38,
    was: 48,
    blurb: 'Heavy cotton canvas with a leather base patch and an inner zip pocket.',
    colors: [
      { name: 'Natural', hex: '#d8c7a4' },
      { name: 'Navy', hex: '#2f3e5c' },
      { name: 'Olive', hex: '#6f7350' },
    ],
  },
]

const ASPECT: Record<string, string> = { portrait: '4 / 5', square: '1 / 1', tall: '3 / 4' }
const COLS: Record<number, string> = { 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' }

function luminance(hex: string) {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h.slice(0, 6)
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(full.slice(i, i + 2), 16) / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const inkOn = (hex: string) => (luminance(hex) > 0.4 ? '#111827' : '#ffffff')
const money = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`

/** 生成的商品图：viewBox 400×500，angle 1 是第二视角。 */
function ProductArt({ art, color, angle }: { art: Art; color: string; angle: 0 | 1 }) {
  const shapes: Record<Art, ReactNode> = {
    shoe: (
      <g>
        <ellipse cx="200" cy="352" rx="150" ry="14" fill="#000" opacity="0.12" />
        <path d="M70 330 Q66 300 90 290 L150 270 Q170 230 205 228 L232 240 Q262 282 322 296 Q346 304 344 330 Z" fill={color} />
        <path d="M64 330 L346 330 Q350 346 334 348 L80 348 Q62 346 64 330 Z" fill="#f8f5ef" />
        <path d="M150 270 Q190 286 230 262" stroke="#fff" strokeWidth="4" fill="none" opacity="0.7" />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={178 + i * 14} y1={246 + i * 6} x2={196 + i * 14} y2={238 + i * 6} stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        ))}
        <path d="M70 330 Q66 304 84 294 L96 330 Z" fill="#000" opacity="0.15" />
      </g>
    ),
    headphones: (
      <g>
        <ellipse cx="200" cy="380" rx="120" ry="12" fill="#000" opacity="0.12" />
        <path d="M110 270 Q110 130 200 130 Q290 130 290 270" stroke={color} strokeWidth="22" fill="none" strokeLinecap="round" />
        <path d="M118 262 Q118 150 200 150 Q282 150 282 262" stroke="#000" strokeOpacity="0.15" strokeWidth="6" fill="none" />
        <rect x="80" y="250" width="70" height="110" rx="32" fill={color} />
        <rect x="250" y="250" width="70" height="110" rx="32" fill={color} />
        <rect x="132" y="262" width="22" height="86" rx="10" fill="#1f2024" opacity="0.6" />
        <rect x="246" y="262" width="22" height="86" rx="10" fill="#1f2024" opacity="0.6" />
      </g>
    ),
    robot: (
      <g>
        <ellipse cx="200" cy="392" rx="100" ry="12" fill="#000" opacity="0.12" />
        <line x1="200" y1="110" x2="200" y2="140" stroke="#555" strokeWidth="6" />
        <circle cx="200" cy="104" r="10" fill={color} />
        <rect x="140" y="140" width="120" height="96" rx="14" fill={color} />
        <circle cx="175" cy="186" r="14" fill="#fff" />
        <circle cx="225" cy="186" r="14" fill="#fff" />
        <circle cx="175" cy="186" r="6" fill="#222" />
        <circle cx="225" cy="186" r="6" fill="#222" />
        <rect x="176" y="214" width="48" height="8" rx="4" fill="#222" opacity="0.5" />
        <rect x="130" y="246" width="140" height="110" rx="12" fill={color} />
        <rect x="160" y="270" width="80" height="44" rx="6" fill="#fff" opacity="0.35" />
        <rect x="104" y="256" width="20" height="80" rx="10" fill={color} />
        <rect x="276" y="256" width="20" height="80" rx="10" fill={color} />
        <rect x="150" y="356" width="34" height="30" rx="6" fill="#555" />
        <rect x="216" y="356" width="34" height="30" rx="6" fill="#555" />
      </g>
    ),
    plant: (
      <g>
        <ellipse cx="200" cy="396" rx="100" ry="12" fill="#000" opacity="0.12" />
        {[-58, -34, -12, 10, 32, 56].map((r, i) => (
          <path key={i} d="M200 300 Q186 230 200 140 Q214 230 200 300 Z" fill={i % 2 ? '#5f9a5c' : '#4f8a50'} transform={`rotate(${r} 200 300) scale(1 ${1 - Math.abs(r) / 260})`} style={{ transformOrigin: '200px 300px' }} />
        ))}
        <path d="M134 290 L266 290 L250 392 L150 392 Z" fill={color} />
        <rect x="126" y="280" width="148" height="22" rx="6" fill={color} />
        <rect x="126" y="280" width="148" height="22" rx="6" fill="#000" opacity="0.1" />
      </g>
    ),
    lamp: (
      <g>
        <ellipse cx="200" cy="392" rx="110" ry="12" fill="#000" opacity="0.12" />
        <rect x="130" y="370" width="110" height="18" rx="9" fill={color} />
        <path d="M185 370 L150 240 L250 160" stroke="#3a3a40" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="150" cy="240" r="9" fill={color} />
        <path d="M232 134 L300 178 L276 214 Q244 176 208 170 Z" fill={color} />
        <circle cx="268" cy="206" r="10" fill="#fff4c8" />
      </g>
    ),
    tote: (
      <g>
        <ellipse cx="200" cy="392" rx="120" ry="12" fill="#000" opacity="0.12" />
        <path d="M160 200 Q160 120 200 120 Q240 120 240 200" stroke="#7a5638" strokeWidth="10" fill="none" />
        <path d="M110 196 L290 196 L300 386 L100 386 Z" fill={color} />
        <path d="M104 340 L296 340 L300 386 L100 386 Z" fill="#7a5638" opacity="0.85" />
        <rect x="170" y="240" width="60" height="44" rx="4" fill="#fff" opacity="0.25" />
      </g>
    ),
  }
  const bg = angle ? `color-mix(in oklab, ${color} 30%, #ece8e1)` : `color-mix(in oklab, ${color} 14%, #f3f1ec)`
  return (
    <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <rect width="400" height="500" fill={bg} />
      <g transform={angle ? 'translate(430 -60) scale(-1.2 1.2) rotate(-8 200 260)' : undefined}>{shapes[art]}</g>
    </svg>
  )
}

function Heart({ filled }: { filled: boolean }) {
  return (
    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  )
}

function Wishlist({ liked, onToggle, name }: { liked: boolean; onToggle: () => void; name: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.button
      type="button"
      aria-pressed={liked}
      aria-label={`${liked ? 'Remove from' : 'Add to'} wishlist: ${name}`}
      onClick={onToggle}
      whileTap={reduce ? undefined : { scale: 0.85 }}
      animate={liked && !reduce ? { scale: [1, 1.3, 1] } : { scale: 1 }}
      transition={{ duration: 0.35 }}
      className={cn(
        'absolute end-4 top-4 z-10 rounded-full bg-white p-1.5 transition-colors hover:text-gray-900/75 focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:outline-none',
        liked ? 'text-rose-600' : 'text-gray-900',
      )}
    >
      <Heart filled={liked} />
    </motion.button>
  )
}

export function ShopProductCards({ className, style, hovered = null, ...props }: ShopProductCardsProps) {
  const o = { ...defaults, ...props } as {
    cardStyle: string
    accent: string
    tone: string
    radius: number
    aspect: string
    columns: number
    showWishlist: boolean
    showQuickAdd: boolean
  }
  const [liked, setLiked] = useState<Record<string, boolean>>({ headphones: true })
  const [picked, setPicked] = useState<Record<string, number>>({})
  const [added, setAdded] = useState<Record<string, boolean>>({})
  const dark = o.tone === 'dark'
  const ink = inkOn(o.accent)
  const t = dark
    ? { section: 'bg-neutral-950', box: 'bg-neutral-900 border-neutral-800', strong: 'text-neutral-50', body: 'text-neutral-300', muted: 'text-neutral-400', soft: 'bg-neutral-800 text-neutral-50' }
    : { section: 'bg-white', box: 'bg-white border-gray-100', strong: 'text-gray-900', body: 'text-gray-700', muted: 'text-gray-500', soft: 'bg-gray-100 text-gray-900' }
  const r = `${o.radius}px`
  const rs = `${Math.min(o.radius, 12)}px`
  const accentBtn: CSSProperties = { backgroundColor: o.accent, color: ink, borderRadius: rs }
  const ring = dark ? 'focus-visible:ring-neutral-100' : 'focus-visible:ring-gray-900'

  const toggleLike = (id: string) => setLiked((s) => ({ ...s, [id]: !s[id] }))
  const addBtn = (p: Product, cls: string, label = 'Add to Cart') => (
    <button
      type="button"
      onClick={() => setAdded((s) => ({ ...s, [p.id]: !s[p.id] }))}
      className={cn('block w-full text-sm font-medium transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none motion-reduce:transition-none motion-reduce:hover:scale-100', ring, cls)}
      style={accentBtn}
    >
      {added[p.id] ? 'Added ✓' : label}
    </button>
  )

  return (
    <section className={cn('w-full px-4 py-12 sm:px-6 lg:px-8', t.section, className)} style={style}>
      <div className="mx-auto max-w-screen-xl">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className={cn('text-xl font-bold sm:text-3xl', t.strong)}>New this week</h2>
            <p className={cn('mt-2 max-w-md text-sm', t.muted)}>Small-batch goods from the studio, restocked every Friday.</p>
          </div>
          <a href="#" className={cn('text-sm font-medium underline underline-offset-4 focus-visible:ring-2 focus-visible:outline-none', t.strong, ring)}>
            View all
          </a>
        </header>

        <ul className={cn('mt-8 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2', COLS[o.columns] ?? COLS[3])}>
          {PRODUCTS.map((p, i) => {
            const ci = picked[p.id] ?? 0
            const color = p.colors[ci].hex
            const forced = hovered === i
            const img = (swap: boolean, extra?: ReactNode, radius: string = r) => (
              <div className="relative overflow-hidden" style={{ aspectRatio: ASPECT[o.aspect] ?? ASPECT.portrait, borderRadius: radius }}>
                <div
                  className={cn(
                    'absolute inset-0',
                    swap
                      ? 'opacity-100 transition-opacity duration-300 group-hover:opacity-0 group-data-[hover=true]:opacity-0 motion-reduce:transition-none'
                      : 'transition-transform duration-500 group-hover:scale-105 group-data-[hover=true]:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100',
                  )}
                >
                  <ProductArt art={p.art} color={color} angle={0} />
                </div>
                {swap && (
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-data-[hover=true]:opacity-100 motion-reduce:transition-none">
                    <ProductArt art={p.art} color={color} angle={1} />
                  </div>
                )}
                {extra}
              </div>
            )
            const quick = o.showQuickAdd && (
              <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-[opacity,transform] duration-300 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 group-data-[hover=true]:translate-y-0 group-data-[hover=true]:opacity-100 motion-reduce:transition-none">
                {addBtn(p, 'px-4 py-2.5', 'Quick add')}
              </div>
            )
            const heart = o.showWishlist && <Wishlist liked={Boolean(liked[p.id])} onToggle={() => toggleLike(p.id)} name={p.name} />
            const title = (cls: string) => (
              <a href="#" className={cn('focus-visible:underline focus-visible:outline-none', cls)}>
                {p.name}
              </a>
            )

            let card: ReactNode
            if (o.cardStyle === 'reveal') {
              card = (
                <>
                  {img(true, quick)}
                  {heart}
                  <div className="relative pt-3">
                    <h3 className={cn('text-sm group-hover:underline group-hover:underline-offset-4 group-data-[hover=true]:underline group-data-[hover=true]:underline-offset-4', t.body)}>{title('')}</h3>
                    <div className={cn('mt-1.5 flex items-center justify-between', t.strong)}>
                      <p className="tracking-wide">
                        {money(p.price)}
                        {p.was && <span className={cn('ms-2 text-sm line-through', t.muted)}>{money(p.was)}</span>}
                      </p>
                      <p className="text-xs tracking-wide uppercase">{p.colors.length} Colors</p>
                    </div>
                  </div>
                </>
              )
            } else if (o.cardStyle === 'swatch') {
              card = (
                <>
                  {img(true, quick)}
                  {heart}
                  <div className="mt-1.5">
                    <p className={cn('text-xs', t.muted)}>{p.colors[ci].name}</p>
                    <fieldset className="mt-1.5">
                      <legend className="sr-only">Color</legend>
                      <div className="flex flex-wrap gap-1">
                        {p.colors.map((c, k) => (
                          <button
                            key={c.name}
                            type="button"
                            aria-pressed={k === ci}
                            onClick={() => setPicked((s) => ({ ...s, [p.id]: k }))}
                            className={cn('block size-4 cursor-pointer rounded-full ring-offset-2 focus-visible:ring-2 focus-visible:outline-none', ring, k === ci && 'ring-1 ring-current', dark ? 'text-neutral-300 ring-offset-neutral-950' : 'text-gray-500')}
                            style={{ backgroundColor: c.hex }}
                          >
                            <span className="sr-only">{c.name}</span>
                          </button>
                        ))}
                      </div>
                    </fieldset>
                    <div className="mt-3 flex justify-between gap-3 text-sm">
                      <h3 className={cn('group-hover:underline group-hover:underline-offset-4 group-data-[hover=true]:underline', t.strong)}>{title('')}</h3>
                      <p className={cn('shrink-0', t.strong)}>{money(p.price)}</p>
                    </div>
                  </div>
                </>
              )
            } else if (o.cardStyle === 'ribbon') {
              const rib = `${Math.max(o.radius, 24)}px`
              card = (
                <div className={cn('relative block h-full border', t.box)} style={{ borderStartEndRadius: rib, borderRadius: `${o.radius}px ${rib} ${o.radius}px ${o.radius}px` }}>
                  {p.badge && (
                    <span
                      className={cn('absolute -top-px -right-px z-10 px-6 py-4 font-medium tracking-widest uppercase', p.badge === 'Save' ? 'bg-rose-600 text-white' : '')}
                      style={{ borderStartEndRadius: rib, borderEndStartRadius: rib, ...(p.badge === 'New' ? { backgroundColor: o.accent, color: ink } : {}) }}
                    >
                      {p.badge === 'Save' && p.was ? `Save ${Math.round((1 - p.price / p.was) * 100)}%` : 'New'}
                    </span>
                  )}
                  {img(false, undefined, `${o.radius}px ${rib} 0 0`)}
                  {o.showWishlist && !p.badge && heart}
                  <div className="p-4 text-center">
                    <strong className={cn('text-xl font-medium', t.strong)}>{title('')}</strong>
                    <p className={cn('mt-2 text-pretty', t.body)}>
                      {p.blurb} <span className={t.strong}>{money(p.price)}</span>
                    </p>
                    {o.showQuickAdd && <div className="mt-4">{addBtn(p, 'px-5 py-3 tracking-widest uppercase', 'Buy now')}</div>}
                  </div>
                </div>
              )
            } else {
              card = (
                <div className="relative block overflow-hidden" style={{ borderRadius: r }}>
                  {heart}
                  {img(false, undefined, '0')}
                  <div className={cn('relative border p-6', t.box)} style={{ borderRadius: `0 0 ${r} ${r}` }}>
                    {p.badge === 'New' && (
                      <span className="px-3 py-1.5 text-xs font-medium whitespace-nowrap" style={{ backgroundColor: o.accent, color: ink, borderRadius: rs }}>
                        New
                      </span>
                    )}
                    {p.was ? (
                      <p className={cn(p.badge === 'New' && 'mt-4', t.body)}>
                        {money(p.price)} <span className={cn('line-through', t.muted)}>{money(p.was)}</span>
                      </p>
                    ) : null}
                    <h3 className={cn('text-lg font-medium', p.was || p.badge === 'New' ? 'mt-1.5' : '', p.badge === 'New' && !p.was && 'mt-4', t.strong)}>{title('')}</h3>
                    {!p.was && <p className={cn('mt-1.5 text-sm', t.body)}>{money(p.price)}</p>}
                    {o.showQuickAdd && (
                      <div className="mt-4 flex gap-4">
                        {addBtn(p, 'p-4')}
                      </div>
                    )}
                  </div>
                </div>
              )
            }

            return (
              <li key={p.id} className="group relative" data-hover={forced ? 'true' : undefined}>
                {card}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
