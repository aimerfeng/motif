import { cn, useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { LinkPreviewCard, PreviewContent, PreviewLink, type LinkPreviewCardProps } from './link-preview-card'

/** 生成的配图，替代上游的照片。 */
function TypeThumb() {
  return (
    <svg viewBox="0 0 224 150" className="block h-auto w-full" role="img" aria-label="Large serif letters on a warm paper background">
      <rect width="224" height="150" fill="#efe6d6" />
      <g stroke="#d8cbb4" strokeWidth="1">
        <line x1="0" y1="112" x2="224" y2="112" />
        <line x1="0" y1="52" x2="224" y2="52" />
      </g>
      <text x="22" y="112" fontFamily="serif" fontSize="92" fill="#1c1917">
        Ag
      </text>
      <text x="150" y="112" fontFamily="serif" fontStyle="italic" fontSize="58" fill="#b45309">
        &amp;
      </text>
      <rect x="22" y="126" width="64" height="4" fill="#1c1917" />
      <rect x="92" y="126" width="28" height="4" fill="#a8a29e" />
    </svg>
  )
}

function DesignThumb() {
  const ticks = Array.from({ length: 12 }, (_, i) => i)
  return (
    <svg viewBox="0 0 224 150" className="block h-auto w-full" role="img" aria-label="A minimal wall clock with a grey face">
      <rect width="224" height="150" fill="#d6d3d1" />
      <circle cx="112" cy="75" r="56" fill="#292524" />
      <circle cx="112" cy="75" r="50" fill="#f5f5f4" />
      {ticks.map((i) => {
        const a = (i / 12) * Math.PI * 2
        return <line key={i} x1={112 + Math.sin(a) * 40} y1={75 - Math.cos(a) * 40} x2={112 + Math.sin(a) * 46} y2={75 - Math.cos(a) * 46} stroke="#292524" strokeWidth={i % 3 === 0 ? 3 : 1.5} />
      })}
      <line x1="112" y1="75" x2="134" y2="60" stroke="#292524" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="112" y1="75" x2="104" y2="38" stroke="#292524" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="112" y1="84" x2="126" y2="112" stroke="#eab308" strokeWidth="1.5" />
      <circle cx="112" cy="75" r="3.5" fill="#eab308" />
    </svg>
  )
}

function ArtThumb() {
  return (
    <svg viewBox="0 0 224 168" className="block h-auto w-full" role="img" aria-label="A soft painted portrait silhouette against a hazy landscape">
      <defs>
        <linearGradient id="lpc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b7f6a" />
          <stop offset="0.6" stopColor="#a39367" />
          <stop offset="1" stopColor="#3f3524" />
        </linearGradient>
        <radialGradient id="lpc-face" cx="0.5" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#d9b98a" />
          <stop offset="1" stopColor="#8a6a42" />
        </radialGradient>
        <filter id="lpc-blur">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>
      <rect width="224" height="168" fill="url(#lpc-sky)" />
      <g filter="url(#lpc-blur)">
        <path d="M0 92 Q40 70 70 86 T150 78 T224 90 V168 H0Z" fill="#4d5a45" opacity="0.7" />
        <path d="M56 168 Q60 112 112 108 Q164 112 168 168Z" fill="#2b2216" />
        <ellipse cx="112" cy="72" rx="27" ry="34" fill="url(#lpc-face)" />
        <path d="M82 70 Q84 30 112 32 Q140 30 142 70 Q138 52 112 48 Q86 52 82 70Z" fill="#2b2216" />
      </g>
    </svg>
  )
}

const CONTENTS = {
  typography: (
    <PreviewContent image={<TypeThumb />}>
      <strong>Typography</strong> is the art and science of arranging type.
    </PreviewContent>
  ),
  design: (
    <PreviewContent image={<DesignThumb />}>
      A <strong>design</strong> is the concept or proposal for an object, process, or system.
    </PreviewContent>
  ),
  art: (
    <PreviewContent image={<ArtThumb />}>
      <strong>Art</strong> is a diverse range of cultural activity centered around works utilizing creative or imaginative talents.
    </PreviewContent>
  ),
}

/** 10 秒一轮：依次停在三个链接上，然后关闭。 */
function scripted(time: number): string | null {
  const t = time % 10
  if (t < 1) return null
  if (t < 3.6) return 'typography'
  if (t < 6) return 'design'
  if (t < 8.4) return 'art'
  return null
}

export function Demo(props: Omit<LinkPreviewCardProps, 'contents'>) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState<string | null>(null)
  // 指针一进来就交给用户。
  const [manual, setManual] = useState(false)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setAuto((cur) => (cur === next ? cur : next))
    },
    { reducedMotion: 'static', staticTime: 2.6 },
  )

  const top = props.side === 'top'
  return (
    <div
      ref={host}
      className={cn('flex h-full w-full justify-center bg-background px-4', top ? 'items-end pb-[12%]' : 'items-start pt-[12%]')}
      onPointerMove={() => setManual(true)}
      onPointerDown={() => setManual(true)}
      onKeyDown={() => setManual(true)}
    >
      <LinkPreviewCard key={manual ? 'm' : 'a'} {...props} contents={CONTENTS} {...(manual ? {} : { active: auto })} className="w-full max-w-[400px]">
        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">Reading list</p>
        <p className="m-0 text-base leading-6 text-balance text-foreground">
          Discover{' '}
          <PreviewLink name="typography" href="#typography">
            typography
          </PreviewLink>
          ,{' '}
          <PreviewLink name="design" href="#design">
            design
          </PreviewLink>
          , or{' '}
          <PreviewLink name="art" href="#art">
            art
          </PreviewLink>
          . Three short reads for the weekend, picked by the editors.
        </p>
      </LinkPreviewCard>
    </div>
  )
}
