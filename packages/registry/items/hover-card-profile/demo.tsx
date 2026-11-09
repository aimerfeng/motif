import { cn, useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { GradientAvatar, ProfileHoverCard, sampleProfile, type ProfileHoverCardProps } from './hover-card-profile'

/** 8 秒一轮：0.8s 打开，6.4s 关闭。 */
const scripted = (time: number) => {
  const t = time % 8
  return t >= 0.8 && t < 6.4
}

export function Demo(props: ProfileHoverCardProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(false)
  // 指针一进来就交给用户，自动播放不再回来。
  const [manual, setManual] = useState(false)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setAuto((cur) => (cur === next ? cur : next))
    },
    { reducedMotion: 'static', staticTime: 3 },
  )

  const control = manual ? {} : { open: auto }
  const preview = props.variant === 'preview'
  const top = props.side === 'top'

  return (
    <div
      ref={host}
      className={cn('flex h-full w-full justify-center bg-background px-4', top ? 'items-end pb-[16%]' : 'items-start pt-[14%]')}
      onPointerMove={() => setManual(true)}
      onPointerDown={() => setManual(true)}
      onKeyDown={() => setManual(true)}
    >
      {preview ? (
        <div className="flex w-full max-w-[380px] items-start gap-3 text-sm">
          <ProfileHoverCard key={manual ? 'm' : 'a'} {...props} {...control} />
          <div className="min-w-0 space-y-1 pt-1">
            <p className="font-medium text-foreground">Reading list</p>
            <p className="text-muted-foreground">Saved by you · 3 articles this week</p>
          </div>
        </div>
      ) : (
        <article className="flex w-full max-w-[380px] items-start gap-3 rounded-xl border bg-card p-4 text-card-foreground">
          <GradientAvatar person={sampleProfile} />
          <div className="min-w-0 space-y-0.5">
            <div className="leading-none">
              <ProfileHoverCard key={manual ? 'm' : 'a'} {...props} {...control} />
            </div>
            <p className="text-xs text-muted-foreground">{sampleProfile.handle} · 2h</p>
            <p className="pt-1.5 text-sm text-muted-foreground">
              Shipped the new token sheet for the docs site. The spacing scale is finally consistent across every page.
            </p>
          </div>
        </article>
      )}
    </div>
  )
}
