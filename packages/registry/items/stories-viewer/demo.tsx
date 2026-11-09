import { StoriesViewer, type StoriesViewerProps, type StoryItem } from './stories-viewer'

function Art({ hue, kind }: { hue: string; kind: 'rings' | 'bars' | 'sun' | 'grid' }) {
  return (
    <svg viewBox="0 0 120 160" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      {kind === 'rings' && [18, 30, 42, 54].map((r) => <circle key={r} cx="78" cy="64" r={r} fill="none" stroke={hue} strokeOpacity={0.55 - r / 140} strokeWidth="1.2" />)}
      {kind === 'bars' && [34, 58, 44, 76, 62].map((h, i) => <rect key={i} x={16 + i * 19} y={128 - h} width="11" height={h} rx="3" fill={hue} fillOpacity={0.2 + i * 0.1} />)}
      {kind === 'sun' && (
        <g>
          <circle cx="60" cy="70" r="26" fill={hue} fillOpacity="0.55" />
          <path d="M0 112 Q30 96 60 108 T120 104 V160 H0Z" fill="#000" fillOpacity="0.35" />
        </g>
      )}
      {kind === 'grid' && Array.from({ length: 6 }, (_, i) => <rect key={i} x={22 + (i % 2) * 42} y={30 + Math.floor(i / 2) * 36} width="34" height="28" rx="5" fill={hue} fillOpacity={0.14 + (i % 3) * 0.1} />)}
    </svg>
  )
}

const STORIES: StoryItem[] = [
  { id: 'mara', author: 'Mara Lind', fallback: 'ML', title: 'Studio tour', tint: '#6d28d9', background: 'radial-gradient(80% 70% at 30% 20%, #8b5cf6, transparent), linear-gradient(160deg, #312e81, #0f172a)', art: <Art hue="#ddd6fe" kind="rings" /> },
  { id: 'theo', author: 'Theo Ankers', fallback: 'TA', title: 'Morning ride', tint: '#0e7490', background: 'radial-gradient(70% 70% at 70% 30%, #22d3ee, transparent), linear-gradient(200deg, #164e63, #020617)', art: <Art hue="#a5f3fc" kind="bars" /> },
  { id: 'ines', author: 'Ines Okafor', fallback: 'IO', title: 'Kiln day', tint: '#c2410c', background: 'radial-gradient(70% 80% at 40% 75%, #fb923c, transparent), linear-gradient(140deg, #7c2d12, #1c1917)', art: <Art hue="#fed7aa" kind="sun" /> },
  { id: 'jun', author: 'Jun Park', fallback: 'JP', title: 'New prints', tint: '#15803d', background: 'radial-gradient(80% 70% at 60% 60%, #4ade80, transparent), linear-gradient(120deg, #14532d, #0a0a0a)', art: <Art hue="#bbf7d0" kind="grid" /> },
]

export function Demo(props: StoriesViewerProps) {
  return (
    <div className="grid h-full w-full place-items-center overflow-hidden bg-background p-4 sm:p-8">
      <div className="w-full max-w-[880px] min-w-0">
        <StoriesViewer {...props} stories={STORIES} />
      </div>
    </div>
  )
}
