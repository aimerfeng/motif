import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  type DialogProps,
} from './dialog-modal'

// 每 6 秒自动开合一次（与循环视频等长）；用户操作后让出控制权 4 秒。
const CYCLE = 6
const OPEN_AT = 1
const CLOSE_AT = 4.6
const RESUME_AFTER = 4

export function Demo(props: Omit<DialogProps, 'children' | 'open' | 'onOpenChange'>) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const clock = useRef({ now: 0, pausedUntil: 0, userOpen: false })

  useFrameLoop(
    hostRef,
    ({ time }) => {
      const state = clock.current
      state.now = time
      if (state.userOpen || time < state.pausedUntil) return
      const phase = time % CYCLE
      const next = phase >= OPEN_AT && phase < CLOSE_AT
      setOpen((current) => (current === next ? current : next))
    },
    { reducedMotion: 'static', staticTime: 3 },
  )

  const handleOpenChange = (next: boolean) => {
    const state = clock.current
    state.userOpen = next
    state.pausedUntil = state.now + RESUME_AFTER
    setOpen(next)
  }

  return (
    <div ref={hostRef} className="grid h-full w-full place-items-center bg-background p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-muted-foreground">Fieldnote 2.0 ships in March.</p>
        <Dialog {...props} open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger className="bg-foreground px-4 py-2 text-sm text-background hover:bg-foreground/90">
            Join the waitlist
          </DialogTrigger>
          <DialogContent className="p-6">
            <DialogHeader>
              <DialogTitle className="text-foreground">Join the waitlist</DialogTitle>
              <DialogDescription>Enter your email address to receive updates when we launch.</DialogDescription>
            </DialogHeader>
            <form className="mt-6 flex flex-col space-y-4" onSubmit={(e) => { e.preventDefault(); handleOpenChange(false) }}>
              <label htmlFor="waitlist-email" className="sr-only">
                Email
              </label>
              <input
                id="waitlist-email"
                type="email"
                className="h-9 w-full rounded-lg border bg-background px-3 text-base text-foreground outline-hidden focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
                placeholder="Enter your email"
              />
              <button
                className="inline-flex items-center justify-center self-end rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-hidden"
                type="submit"
              >
                Join now
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
