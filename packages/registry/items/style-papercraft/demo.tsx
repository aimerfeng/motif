import { useFrameLoop } from '@motif/runtime'
import { useId, useRef, useState, type ReactNode } from 'react'
import {
  CutBand,
  FolderTabs,
  Note,
  PaperButton,
  PaperCloud,
  PaperHills,
  PaperInput,
  PaperProgress,
  PaperSun,
  PaperSwitch,
  Papercraft,
  Seal,
  Sheet,
  Tag,
  defaults,
  mixHex,
  textSafe,
  usePaper,
  type PapercraftProps,
  type Tone,
} from './style-papercraft'

const Arrow = () => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M2.5 8h10.5M9 4l4 4-4 4" />
  </svg>
)

const MenuIcon = ({ open }: { open: boolean }) => (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
    {open ? <path d="M4 4l8 8M12 4l-8 8" /> : <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" />}
  </svg>
)

const Check = () => (
  <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3.5 8.5l3 3 6-7" />
  </svg>
)

/** 虚构品牌 Foldling 的标志：一只纸船，两片帆是折出来的。 */
function Logo() {
  const { palette } = usePaper()
  const sail = palette[1 % palette.length]!
  return (
    <span className="flex items-center gap-2.5">
      <svg className="pc-sun" viewBox="0 0 40 32" width="38" height="30" aria-hidden>
        <path d="M20 2L20 19H7Z" fill={sail} />
        <path d="M20 2L33 19H20Z" fill={mixHex(sail, '#10201e', 0.28)} />
        <path d="M3 20H37L31 30H9Z" fill={palette[0]} />
      </svg>
      <span className="pc-h3 text-[1.35rem]">Foldling</span>
    </span>
  )
}

const NAV = [
  { label: 'Kits', href: '#kits' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Classrooms', href: '#classrooms' },
]

/** 窄屏的菜单：一枚纸按钮展开一张浮起的纸；Esc 关闭并把焦点还给按钮，焦点移出时也收起。 */
function MobileMenu() {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const id = useId()
  const close = (refocus: boolean) => {
    setOpen(false)
    if (refocus) wrap.current?.querySelector('button')?.focus()
  }
  return (
    <div
      ref={wrap}
      className="relative md:hidden"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault()
          close(true)
        }
      }}
      onBlur={(event) => {
        if (open && !event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false)
      }}
    >
      <PaperButton variant="secondary" size="sm" className="!w-9 !px-0" aria-label="Menu" aria-expanded={open} aria-controls={id} onClick={() => setOpen((value) => !value)}>
        <MenuIcon open={open} />
      </PaperButton>
      <Sheet id={id} lift={3} hidden={!open} className="absolute right-0 top-[calc(100%+12px)] z-10 w-52 p-2">
        <nav aria-label="Primary" className="grid">
          {[...NAV, { label: 'Sign in', href: '#account' }].map((link) => (
            <PaperButton key={link.href} href={link.href} variant="plain" className="!justify-start" onClick={() => close(false)}>
              {link.label}
            </PaperButton>
          ))}
        </nav>
      </Sheet>
    </div>
  )
}

const CLOUDS = [
  { cls: 'right-[24%] top-[30%] hidden md:block', width: 150, drift: 26, speed: 0.22, phase: 0 },
  { cls: 'right-[6%] top-[13%] hidden sm:block', width: 112, drift: 18, speed: 0.3, phase: 2.1 },
  { cls: 'right-[36%] top-[11%] hidden lg:block', width: 84, drift: 22, speed: 0.26, phase: 4.2 },
]

/** 首屏：天空、漂移的云、缓慢摆动的太阳和五层剪纸山。动画只在 useFrameLoop 里改 transform。 */
function Hero() {
  const host = useRef<HTMLElement>(null)
  const sun = useRef<HTMLDivElement>(null)
  const clouds = useRef<(HTMLDivElement | null)[]>([])
  useFrameLoop(
    host,
    ({ time }) => {
      if (sun.current) sun.current.style.transform = `rotate(${(Math.sin(time * 0.45) * 8).toFixed(2)}deg)`
      CLOUDS.forEach((cloud, i) => {
        const el = clouds.current[i]
        if (!el) return
        const x = Math.sin(time * cloud.speed + cloud.phase) * cloud.drift
        const y = Math.sin(time * cloud.speed * 1.7 + cloud.phase) * 2.5
        el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`
      })
    },
    { staticTime: 0 },
  )

  return (
    <section ref={host} className="relative [--dio:190px] sm:[--dio:230px] md:[--dio:270px]" style={{ background: 'var(--pc-sky)' }}>
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        {CLOUDS.map((cloud, i) => (
          <div
            key={i}
            ref={(node) => {
              clouds.current[i] = node
            }}
            className={`absolute will-change-transform ${cloud.cls}`}
          >
            <PaperCloud width={cloud.width} />
          </div>
        ))}
      </div>

      <header className="pc-wrap relative z-[3] flex items-center justify-between gap-4 py-4">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map((link) => (
            <PaperButton key={link.href} href={link.href} variant="plain" size="sm">
              {link.label}
            </PaperButton>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <PaperButton href="#account" variant="plain" size="sm" className="hidden md:inline-flex">
            Sign in
          </PaperButton>
          <PaperButton size="sm">Join the club</PaperButton>
          <MobileMenu />
        </div>
      </header>

      <div className="pc-wrap relative z-[2] pb-2 pt-6 md:pt-8">
        <div className="max-w-[46rem]">
          <div className="flex flex-wrap items-center gap-3">
            <Tag tone={4}>New</Tag>
            <span className="pc-label">Kit 14, Tidepool · ships 3 November</span>
          </div>
          <h1 className="pc-display mt-4 text-[clamp(2.45rem,6.1vw,4.7rem)]">Paper kits that fold into little worlds.</h1>
          <p className="mt-4 max-w-[34rem] text-[1.05rem] md:text-[1.15rem]">A box of pre-scored cardstock, glue dots and an illustrated guide arrives each month. No scissors, about ninety minutes a kit, made for ages 6 to 11.</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <PaperButton size="lg">
              Start with Tidepool <Arrow />
            </PaperButton>
            <PaperButton size="lg" variant="secondary">
              See what&rsquo;s inside
            </PaperButton>
          </div>
          <p className="pc-muted mt-4 text-sm">From $18 a month · skip or cancel any month · free shipping in the US and Canada</p>
        </div>
      </div>

      <div className="relative z-[1] h-[var(--dio)]">
        <div ref={sun} className="absolute bottom-[calc(var(--dio)*0.4)] right-[8%] w-[clamp(120px,21vw,290px)] will-change-transform">
          <PaperSun size={290} style={{ width: '100%', height: 'auto' }} />
        </div>
        <PaperHills className="absolute inset-0" />
      </div>
    </section>
  )
}

function SectionHead({ n, label, title, intro }: { n: string; label: string; title: ReactNode; intro: ReactNode }) {
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-end md:gap-10">
      <div>
        <span className="pc-label">
          {n} · {label}
        </span>
        <h2 className="pc-h2 mt-3 text-[clamp(2rem,4.3vw,3.1rem)]">{title}</h2>
      </div>
      <p className="pc-muted max-w-[34rem]">{intro}</p>
    </div>
  )
}

const ROLES = ['Buttons and the brand mark', 'Bands, tabs and switches', 'Sun, notes and highlights', 'Stickers and near hills', 'Tags and accents', 'Spare stock for tabs']
const WORDS = ['', 'one', 'two', 'three', 'four', 'five', 'six']
const TILTS = [-1.2, 0.9, -0.5, 1.1, -0.9, 0.6]

function Cardstock({ palette }: { palette: string[] }) {
  const { dark } = usePaper()
  const count = WORDS[palette.length]
  const neutrals = [
    { name: 'Ground', note: 'The page', v: 'var(--pc-ground)' },
    { name: 'Paper', note: 'Cards, panels', v: 'var(--pc-surface)' },
    { name: 'Well', note: 'Cut-out fields', v: 'var(--pc-well)' },
    { name: 'Ink', note: 'Text, focus', v: 'var(--pc-ink)' },
  ]
  return (
    <section className="pc-wrap pb-24 pt-14 md:pt-20">
      <SectionHead
        n="01"
        label="Cardstock"
        title={dark ? `An ink-blue ground, slate paper and ${count} coloured stocks` : `A cream ground, off‑white paper and ${count} coloured stocks`}
        intro="Colour is always a whole sheet, never a gradient. Ink flips between dark and light on every stock, and a mid-tone stock is nudged lighter or darker until its label clears 4.5:1."
      />
      <div className="mt-12 flex flex-wrap gap-x-5 gap-y-8">
        {palette.map((hex, i) => {
          const raw = hex.slice(0, 7).toLowerCase()
          const fill = textSafe(raw).fill
          return (
            <Sheet key={`${hex}-${i}`} tone={(i + 1) as Tone} lift={i % 2 ? 2 : 1} className="flex aspect-[4/5] w-[calc(50%-10px)] flex-col justify-between p-4 sm:w-[172px]" style={{ transform: `rotate(${TILTS[i]}deg)` }}>
              <span className="pc-display text-[2.6rem]">Aa</span>
              <div>
                <p className="font-extrabold">Stock {i + 1}</p>
                <p className="pc-muted text-[.8rem] leading-snug">{i === palette.length - 1 && i >= 3 ? 'Far hills and the sky tint' : ROLES[i]}</p>
                <p className="pc-muted mt-1.5 text-[.72rem] font-bold uppercase tracking-[.1em]">{fill === raw ? raw : `${raw} → ${fill}`}</p>
              </div>
            </Sheet>
          )
        })}
      </div>
      <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-4 md:max-w-3xl">
        {neutrals.map((n) => (
          <div key={n.name} className="flex items-center gap-3">
            <Sheet lift={2} className="size-12 flex-none !rounded-full" style={{ background: n.v }} />
            <div>
              <p className="text-sm font-extrabold">{n.name}</p>
              <p className="pc-muted text-[.8rem]">{n.note}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

const PAIR_NAMES: Record<string, [string, string]> = {
  fraunces: ['Fraunces 800', 'Plus Jakarta Sans'],
  bricolage: ['Bricolage Grotesque 800', 'Manrope'],
  outfit: ['Outfit 700', 'Outfit'],
  dmserif: ['DM Serif Display', 'Outfit'],
}

function DepthAndType({ fontPairing }: { fontPairing: string }) {
  const [head, body] = PAIR_NAMES[fontPairing] ?? PAIR_NAMES.fraunces!
  const layers = [
    { tone: 2 as const, lift: 1 as const, n: '1', name: 'Card', note: 'Rests on the ground', pos: 'left-0 top-0' },
    { tone: 3 as const, lift: 2 as const, n: '2', name: 'Raised', note: 'Buttons, open menus', pos: 'left-[14%] top-[22%]' },
    { tone: 'surface' as const, lift: 3 as const, n: '3', name: 'Floating', note: 'Dialogs and toasts', pos: 'left-[28%] top-[44%]' },
  ]
  return (
    <section className="pc-wrap pb-28">
      <SectionHead n="02" label="Layers and type" title="Depth is a stack of sheets" intro="Four levels and one shadow recipe. Every sheet throws a soft, warm shadow onto the one below; the depth parameter scales all of them together." />
      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        <div className="relative h-[320px] sm:h-[360px]" role="img" aria-label="Three sheets stacked at increasing heights above the ground">
          <span className="pc-label absolute bottom-0 left-0">0 · Ground, the page itself</span>
          {layers.map((layer) => (
            <Sheet key={layer.n} tone={layer.tone} lift={layer.lift} className={`absolute flex h-[50%] w-[68%] items-baseline gap-3 p-4 ${layer.pos}`}>
              <span className="pc-display text-[1.7rem] leading-none">{layer.n}</span>
              <span className="min-w-0">
                <span className="block font-extrabold leading-tight">{layer.name}</span>
                <span className="pc-muted block text-sm leading-snug">{layer.note}</span>
              </span>
            </Sheet>
          ))}
        </div>

        <Sheet stack={[4, 2]} className="lg:mt-2">
          <div className="p-6 sm:p-8">
            <span className="pc-label">
              Display · {head}
            </span>
            <p className="pc-display mt-2 text-[clamp(3.2rem,8vw,5.4rem)]">Fold here.</p>
            {[
              { meta: 'Heading 2', el: <p className="pc-h2 text-[1.9rem]">Glue tab A to tab B</p> },
              { meta: 'Heading 3', el: <p className="pc-h3">Step 4 of 9: the hermit crab</p> },
              { meta: `Body · ${body}`, el: <p className="max-w-[30rem]">Press each glue dot for a count of three, then hold the two pieces together until they stay put on their own.</p> },
              { meta: 'Label', el: <p className="pc-label !text-[var(--pc-ink)]">Ages 6–11 · 38 pieces · 90 min</p> },
            ].map((row) => (
              <div key={row.meta} className="mt-5 grid gap-1.5 border-t-2 border-dashed border-[color-mix(in_oklab,var(--pc-ink)_16%,transparent)] pt-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-baseline">
                <span className="pc-muted text-[.78rem] font-bold">{row.meta}</span>
                {row.el}
              </div>
            ))}
          </div>
        </Sheet>
      </div>
    </section>
  )
}

const PIECES = [
  ['Rock shelf', 12],
  ['Kelp strand', 9],
  ['Fish', 6],
  ['Anemone', 4],
  ['Starfish', 3],
  ['Hermit crab', 1],
  ['Base tray', 1],
  ['Glue dots', 120],
] as const

const STEPS = [
  { name: 'Pop out the base tray', done: true },
  { name: 'Fold the rock shelves', done: true },
  { name: 'Slot in the kelp', done: false },
  { name: 'Add fish and the crab', done: false },
]

function Components() {
  const [sibling, setSibling] = useState(true)
  return (
    <CutBand id="how-it-works" tone={2} top="torn" bottom="edge">
      <div className="pc-wrap py-16 md:py-24">
        <SectionHead n="03" label="Components" title="Cut, stacked and pressed" intro="Buttons sit on a darker base sheet and sink when pressed. Fields are windows cut through the paper. Tabs tuck behind their panel like a folder." />
        <div className="mt-12 grid items-start gap-6 lg:grid-cols-3">
          <div className="grid gap-6">
            <Sheet className="p-6">
              <span className="pc-label">Buttons</span>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <PaperButton>
                  Add to box<span className="sr-only">: Tidepool</span>
                </PaperButton>
                <PaperButton tone={4}>Gift a kit</PaperButton>
                <PaperButton variant="secondary">Preview guide</PaperButton>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <PaperButton size="sm">Small</PaperButton>
                <PaperButton size="sm" variant="plain">
                  Skip this month
                </PaperButton>
                <PaperButton size="sm" disabled>
                  Sold out
                </PaperButton>
              </div>
            </Sheet>
            <Sheet className="p-6">
              <span className="pc-label">Stickers and tags</span>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Seal tone={1} size={100}>
                  Kit<b>14</b>Nov
                </Seal>
                <Seal tone={3} size={88} tilt={7}>
                  Ages<b>6–11</b>
                </Seal>
                <Seal tone={4} size={86} tilt={-3}>
                  Glue<b>120</b>dots
                </Seal>
              </div>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <Tag tone={2}>38 pieces</Tag>
                <Tag tone={3}>90 min</Tag>
                <Tag tone={4}>Seasonal</Tag>
                <Tag tone="surface">Glue dots included</Tag>
              </div>
            </Sheet>
          </div>

          <div className="grid gap-6">
            <Sheet className="grid gap-4 p-6">
              <span className="pc-label">Fields</span>
              <PaperInput label="Crafter's first name" placeholder="Mina" autoComplete="off" />
              <PaperInput label="Ship to postcode" placeholder="97214" inputMode="numeric" hint="We pack on Mondays and ship by Wednesday." />
              <div className="flex items-center justify-between gap-4 pt-1">
                <div>
                  <p className="font-extrabold">Sibling set</p>
                  <p className="pc-muted text-sm">A second set of pieces, +$6</p>
                </div>
                <PaperSwitch checked={sibling} onCheckedChange={setSibling} aria-label="Sibling set" />
              </div>
            </Sheet>
            <Note title="Tip from the studio" tone={3}>
              Glue dots set in about twenty minutes. Let the reef dry flat before you slot in the fish.
            </Note>
          </div>

          <div className="grid gap-6">
            <FolderTabs
              label="Kit 14 contents"
              items={[
                {
                  id: 'pieces',
                  label: 'Pieces',
                  tone: 1,
                  content: (
                    <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-[.92rem]">
                      {PIECES.map(([name, count]) => (
                        <li key={name} className="flex justify-between gap-2 border-b-2 border-dotted border-[color-mix(in_oklab,var(--pc-ink)_14%,transparent)] pb-1.5">
                          <span>{name}</span>
                          <span className="font-extrabold">{count}</span>
                        </li>
                      ))}
                    </ul>
                  ),
                },
                {
                  id: 'steps',
                  label: 'Steps',
                  tone: 3,
                  content: (
                    <ol className="grid list-decimal gap-1.5 pl-5 text-[.92rem]">
                      <li>Pop out every piece and sort them on the sheet.</li>
                      <li>Fold the shelves on the dotted lines, valley first.</li>
                      <li>Stand the kelp in the slots, tallest at the back.</li>
                    </ol>
                  ),
                },
                {
                  id: 'tips',
                  label: 'Tips',
                  tone: 4,
                  content: <p className="text-[.92rem]">Run a fingernail along each score line before folding. The crease will be sharper and the paper will not crack.</p>,
                },
              ]}
            />
            <Sheet className="p-6">
              <span className="pc-label">Progress</span>
              <div className="mt-3 flex items-baseline justify-between gap-3">
                <p className="font-extrabold">Tidepool build</p>
                <p className="pc-muted text-sm">22 of 38 pieces</p>
              </div>
              <PaperProgress className="mt-3" value={22} max={38} label="Tidepool build" />
              <ol className="mt-5 grid gap-2.5 text-[.92rem]">
                {STEPS.map((step, i) => (
                  <li key={step.name} className="flex items-center gap-3">
                    <span
                      className="grid size-6 flex-none place-items-center rounded-full text-[.72rem] font-extrabold"
                      style={step.done ? { background: 'var(--pc-c2)', color: 'var(--pc-on2)' } : { background: 'var(--pc-well)', boxShadow: 'inset 0 1px 2px rgb(var(--pc-shade) / .25)' }}
                    >
                      {step.done ? <Check /> : i + 1}
                    </span>
                    <span className={step.done ? 'pc-muted line-through decoration-2' : i === 2 ? 'font-extrabold' : ''}>
                      {step.name}
                      {step.done ? <span className="sr-only"> (done)</span> : i === 2 ? <span className="sr-only"> (in progress)</span> : null}
                    </span>
                  </li>
                ))}
              </ol>
            </Sheet>
          </div>
        </div>
      </div>
    </CutBand>
  )
}

type Scene = 'tidepool' | 'lantern' | 'snow'

/** 卡纸色里最偏蓝的一张，用作水面和雪天的天色；整套都不够蓝时，往一支灰蓝里靠。 */
function waterOf(palette: string[]): string {
  let best = '#5b8fb9'
  let score = 0
  for (const hex of palette) {
    const n = parseInt(hex.slice(1, 7), 16)
    const blueness = (n & 255) - ((n >> 16) & 255)
    if (blueness > score) {
      score = blueness
      best = hex
    }
  }
  return score < 40 ? mixHex('#5b8fb9', best, score > 0 ? 0.4 : 0) : best
}

/** 天上的纸屑：夜里是星星，雪天是雪片。x 是百分比，y 和半径是像素。 */
const STARS: [number, number, number][] = [
  [30, 14, 1.6], [38, 40, 1.2], [56, 18, 1.8], [64, 46, 1.3], [74, 12, 1.2], [90, 70, 1.5], [22, 52, 1.3], [8, 64, 1.2],
]
const FLAKES: [number, number, number][] = [
  [34, 16, 2.6], [46, 44, 2], [57, 22, 2.8], [66, 58, 2.2], [24, 60, 2.4], [80, 74, 2], [12, 72, 2.2], [42, 76, 1.8],
]

function Confetti({ dots, fill }: { dots: [number, number, number][]; fill: string }) {
  return (
    <svg className="pc-sun absolute inset-x-0 top-0" width="100%" height="96" aria-hidden>
      {dots.map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={`${x}%`} cy={y} r={r} fill={fill} />
      ))}
    </svg>
  )
}

/** 寄居蟹：一枚螺旋纸壳 + 一只钳子 + 两根眼柄，坐在最前面那层纸上。 */
function HermitCrab({ shell, claw }: { shell: string; claw: string }) {
  return (
    <svg className="pc-sun absolute bottom-2 left-[24%]" width="54" height="42" viewBox="0 0 44 34" aria-hidden>
      <path d="M10.5 22L7.5 9M14.5 22L15.5 9" stroke={claw} strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="7.4" cy="8.2" r="2.4" fill="#2b241f" />
      <circle cx="15.6" cy="8.2" r="2.4" fill="#2b241f" />
      <path d="M4 32C2 26 4 21 10 20.5L18 22.5 17 32Z" fill={claw} />
      <path d="M2.5 21.5C1 18 3.5 15 7 16.2L9.5 20.5C6.5 20 4.5 21 2.5 21.5Z" fill={claw} />
      <path d="M15 32A13.5 13.5 0 1 1 42 32Z" fill={shell} />
      <circle cx="29.5" cy="24" r="7.2" fill={mixHex(shell, '#fff4dc', 0.45)} />
      <circle cx="31" cy="22.6" r="3.4" fill={shell} />
    </svg>
  )
}

/** 猫头鹰灯笼：一根线吊着，两只耳朵、一双睁开的眼睛、亮着的肚皮。 */
function OwlLantern({ body, light, beak }: { body: string; light: string; beak: string }) {
  const cap = mixHex(body, '#1a120c', 0.42)
  return (
    <svg className="pc-sun absolute left-[40%] top-0" width="52" height="97" viewBox="0 0 46 86" aria-hidden>
      <path d="M23 0V19" stroke="#fbf1d9" strokeOpacity=".75" strokeWidth="1.4" />
      <path d="M9 36Q9 29 6 22.5L15.5 27.5Q23 24.5 30.5 27.5L40 22.5Q37 29 37 36V63Q37 73 23 73Q9 73 9 63Z" fill={body} />
      <rect x="16" y="18" width="14" height="6" rx="2" fill={cap} />
      <ellipse cx="23" cy="57" rx="9.5" ry="11" fill={light} />
      <path d="M18.5 53.5l4.5 3 4.5-3M18.5 59.5l4.5 3 4.5-3" stroke={body} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="17" cy="37.5" r="5.6" fill="#fff6df" />
      <circle cx="29" cy="37.5" r="5.6" fill="#fff6df" />
      <circle cx="17.6" cy="38" r="2.5" fill="#2b241f" />
      <circle cx="28.4" cy="38" r="2.5" fill="#2b241f" />
      <path d="M21 43h4l-2 3.6z" fill={beak} />
      <rect x="17" y="72" width="12" height="4" rx="1.5" fill={cap} />
      <path d="M23 76v7" stroke={cap} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/** 每个套装一幅剪纸小景，画的就是盒子里的东西：潮池、猫头鹰灯笼、雪山里的邮局。 */
function KitScene({ scene, seed }: { scene: Scene; seed: number }) {
  const { palette, surface, dark } = usePaper()
  const stock = (i: number) => palette[i % palette.length]!
  const base = dark ? '#1d2232' : surface
  const water = waterOf(palette)
  const hills = 'absolute inset-x-0 bottom-0 h-[128px]'
  let sky: string
  let art: ReactNode
  if (scene === 'tidepool') {
    sky = mixHex(base, water, 0.26)
    const colors = [mixHex(mixHex(stock(0), '#7a6658', 0.5), sky, 0.35), mixHex(water, sky, 0.5), mixHex(water, sky, 0.1), mixHex(water, '#10283a', 0.3)]
    art = (
      <>
        <PaperSun size={80} tone={3} className="absolute right-6 top-4" />
        <PaperHills className={hills} seed={seed} front="surface" sky={sky} colors={colors} decor="kelp" decorColor={mixHex(mixHex(stock(1), '#6b7f2a', 0.55), '#10201e', 0.18)} />
        <HermitCrab shell={stock(0)} claw={stock(3)} />
      </>
    )
  } else if (scene === 'lantern') {
    sky = dark ? '#1a2140' : '#26304c'
    // 夜里的山都往夜空色里压，只留一点卡纸的色相。
    const colors = [mixHex(stock(3), sky, 0.6), mixHex(stock(1), sky, 0.5), mixHex(stock(1), sky, 0.3), mixHex(stock(1), '#0d1420', 0.22)]
    art = (
      <>
        <Confetti dots={STARS} fill="#fbf1d9" />
        <svg className="pc-sun absolute right-7 top-5" width="52" height="52" viewBox="0 0 56 56" aria-hidden>
          <path d="M40 6A24 24 0 1 0 50 40A19 19 0 0 1 40 6Z" fill="#fbf1d9" />
        </svg>
        <PaperHills className={hills} seed={seed} front="surface" sky={sky} colors={colors} />
        <OwlLantern body={stock(0)} light={mixHex(stock(2), '#fff4dc', 0.45)} beak={stock(3)} />
      </>
    )
  } else {
    sky = mixHex(base, mixHex(water, '#c9d6e3', 0.5), dark ? 0.3 : 0.42)
    const colors = [mixHex(stock(palette.length - 1), sky, 0.45), mixHex(stock(1), sky, 0.25), dark ? '#e3e8ef' : '#f4f7fa', dark ? '#c9d2de' : '#e2e9f0']
    art = (
      <>
        <PaperSun size={64} tone={3} className="absolute right-7 top-6" />
        <Confetti dots={FLAKES} fill="#fffaf1" />
        <PaperHills className={hills} seed={seed} front="surface" sky={sky} colors={colors} decor="cabin" decorColor={mixHex(stock(1), '#14201f', 0.35)} />
      </>
    )
  }
  return (
    <div className="relative h-44 overflow-hidden" style={{ background: sky, borderRadius: 'var(--pc-r) var(--pc-r) 0 0' }}>
      {art}
    </div>
  )
}

const KITS = [
  { no: 14, name: 'Tidepool', scene: 'tidepool' as const, blurb: 'A rock pool with kelp that sways when you blow across it, and a hermit crab that peeks out of its shell.', pieces: 38, time: '90 min', ages: '6–11', price: 18, tag: 'Ships 3 Nov', tagTone: 4 as Tone, stack: [1, 3] as [Tone, Tone] },
  { no: 15, name: 'Owl Lantern', scene: 'lantern' as const, blurb: 'A folding lantern for a battery tea light. The owl opens its eyes when the light is on.', pieces: 24, time: '60 min', ages: '5–9', price: 16, tag: 'December', tagTone: 3 as Tone, stack: [2, 4] as [Tone, Tone] },
  { no: 16, name: 'Snow Post Office', scene: 'snow' as const, blurb: 'A mountain post office with a working mail slot and twelve tiny envelopes for real notes.', pieces: 46, time: '2 hrs', ages: '7–11', price: 22, tag: 'Pre-order', tagTone: 1 as Tone, stack: [3, 1] as [Tone, Tone] },
]

function Kits() {
  return (
    <section id="kits" className="pc-wrap pb-28 pt-24 md:pt-28">
      <SectionHead n="04" label="In use" title="This season’s kits" intro="Three kits ship between November and January. Each one arrives flat in a 30 × 22 cm envelope and needs nothing but the glue dots in the box." />
      <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-7">
        {KITS.map((kit, i) => (
          <Sheet key={kit.no} stack={kit.stack} className="h-full">
            <article className="flex h-full flex-col">
              <div className="relative">
                <KitScene scene={kit.scene} seed={i * 5 + 3} />
                <Tag tone={kit.tagTone} className="absolute left-4 top-4">
                  {kit.tag}
                </Tag>
              </div>
              <div className="flex flex-1 flex-col px-5 pb-5 pt-2">
                <span className="pc-label">Kit no. {kit.no}</span>
                <h3 className="pc-h3 mt-1 text-[1.45rem]">{kit.name}</h3>
                <p className="pc-muted mt-2 text-[.94rem]">{kit.blurb}</p>
                <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[.85rem]">
                  {[
                    ['Pieces', String(kit.pieces)],
                    ['Time', kit.time],
                    ['Ages', kit.ages],
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-1.5">
                      <dt className="pc-muted">{k}</dt>
                      <dd className="font-extrabold">{v}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                  <span className="pc-h3 text-[1.5rem]">${kit.price}</span>
                  <PaperButton size="sm" tone={kit.stack[0]}>
                    Add to box<span className="sr-only">: {kit.name}</span>
                  </PaperButton>
                </div>
              </div>
            </article>
          </Sheet>
        ))}
      </div>
    </section>
  )
}

function Classrooms() {
  return (
    <CutBand id="classrooms" tone={1} top="edge" bottom="torn">
      <div className="pc-wrap grid gap-10 py-16 md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] md:items-center md:py-20">
        <div>
          <span className="pc-label">05 · For classrooms</span>
          <h2 className="pc-h2 mt-3 text-[clamp(2rem,4.2vw,3rem)]">Thirty kits, one teacher guide, no scissors.</h2>
          <p className="mt-4 max-w-[32rem]">Class packs include spare pieces, a printable sorting sheet and a 40-minute lesson plan. Order by 20 November for delivery before the winter break.</p>
        </div>
        <Sheet lift={3} className="grid gap-4 p-6">
          <PaperInput label="School email" type="email" placeholder="m.okafor@lakeside.school" autoComplete="off" />
          <PaperInput label="Number of students" placeholder="28" inputMode="numeric" />
          <PaperButton className="mt-1 w-full" size="lg">
            Request a class pack <Arrow />
          </PaperButton>
          <p className="pc-muted text-sm">Used in 312 classrooms across 9 countries.</p>
        </Sheet>
      </div>
    </CutBand>
  )
}

export function Demo(props: PapercraftProps) {
  const palette = props.palette && props.palette.length > 0 ? props.palette : defaults.palette
  return (
    <div className="h-full w-full overflow-y-auto">
      <Papercraft {...props}>
        <Hero />
        <Cardstock palette={palette} />
        <DepthAndType fontPairing={props.fontPairing ?? defaults.fontPairing} />
        <Components />
        <Kits />
        <Classrooms />
        <footer className="pc-wrap flex flex-col gap-5 pb-10 pt-20 sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <p className="pc-muted text-sm">© 2026 Foldling Paper Co. · Printed on recycled board in Portland, Oregon</p>
        </footer>
      </Papercraft>
    </div>
  )
}
