import { LoadingCarousel, type LoadingCarouselProps, type Tip } from './carousel-autoplay-progress'

function Art({ hue, shape }: { hue: string; shape: 'rings' | 'grid' | 'bars' | 'orbit' }) {
  return (
    <svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      {shape === 'rings' &&
        [40, 70, 100, 130].map((r) => <circle key={r} cx="290" cy="80" r={r} fill="none" stroke={hue} strokeOpacity={0.5 - r / 400} strokeWidth="1.5" />)}
      {shape === 'grid' &&
        Array.from({ length: 6 }, (_, i) => <rect key={i} x={40 + (i % 3) * 64} y={40 + Math.floor(i / 3) * 64} width="52" height="52" rx="10" fill={hue} fillOpacity={0.15 + (i % 3) * 0.12} />)}
      {shape === 'bars' &&
        [60, 110, 80, 150, 120, 170].map((h, i) => <rect key={i} x={200 + i * 28} y={190 - h} width="18" height={h} rx="4" fill={hue} fillOpacity={0.25 + i * 0.08} />)}
      {shape === 'orbit' && (
        <g fill="none" stroke={hue} strokeOpacity="0.45">
          <ellipse cx="200" cy="100" rx="150" ry="46" />
          <ellipse cx="200" cy="100" rx="150" ry="46" transform="rotate(30 200 100)" />
          <circle cx="200" cy="100" r="18" fill={hue} fillOpacity="0.5" />
        </g>
      )}
    </svg>
  )
}

const TIPS: Tip[] = [
  {
    text: 'Press ⌘K anywhere to jump between projects, files and teammates.',
    background: 'radial-gradient(80% 90% at 20% 20%, #6d28d9, transparent), linear-gradient(135deg, #1e1b4b, #0f172a)',
    media: <Art hue="#c4b5fd" shape="rings" />,
  },
  {
    text: 'Group boards by owner to see who is carrying the most work this sprint.',
    background: 'radial-gradient(70% 80% at 80% 30%, #0e7490, transparent), linear-gradient(160deg, #082f49, #020617)',
    media: <Art hue="#67e8f9" shape="grid" />,
  },
  {
    text: 'Weekly reports land in your inbox every Monday at 9:00. Pause them in Settings.',
    background: 'radial-gradient(70% 90% at 30% 80%, #c2410c, transparent), linear-gradient(200deg, #431407, #1c1917)',
    media: <Art hue="#fdba74" shape="bars" />,
  },
  {
    text: 'Invite guests with view-only links. They never count toward your seats.',
    background: 'radial-gradient(80% 80% at 70% 70%, #15803d, transparent), linear-gradient(120deg, #052e16, #0a0a0a)',
    media: <Art hue="#86efac" shape="orbit" />,
  },
]

export function Demo(props: LoadingCarouselProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-[640px] min-w-0">
        <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
          Setting up your workspace…
        </div>
        <LoadingCarousel {...props} tips={TIPS} />
      </div>
    </div>
  )
}
