import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { ContactNewsletter, type ContactNewsletterProps } from './contact-newsletter'

const PERIOD = 6

export function Demo(props: ContactNewsletterProps) {
  const host = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [cycle, setCycle] = useState(0)

  useFrameLoop(
    host,
    ({ time }) => {
      const n = Math.floor(time / PERIOD)
      setCycle(n)
      if (stage.current) stage.current.style.opacity = String(Math.min(1, (PERIOD - (time - n * PERIOD)) / 0.4))
    },
    { reducedMotion: 'static', staticTime: 3 },
  )

  return (
    <div ref={host} className="h-full w-full overflow-y-auto bg-background">
      <div ref={stage} className="flex min-h-full flex-col justify-center">
        <ContactNewsletter key={`${cycle}:${JSON.stringify(props)}`} {...props} />
      </div>
    </div>
  )
}
