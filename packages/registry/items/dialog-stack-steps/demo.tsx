import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import {
  DialogStack,
  DialogStackBody,
  DialogStackContent,
  DialogStackDescription,
  DialogStackFooter,
  DialogStackHeader,
  DialogStackNext,
  DialogStackOverlay,
  DialogStackPrevious,
  DialogStackTitle,
  DialogStackTrigger,
  type DialogStackProps,
} from './dialog-stack-steps'

const ghost = 'h-9 px-3 border bg-background hover:bg-muted'
const solid = 'h-9 px-3 bg-primary text-primary-foreground hover:bg-primary/90'

const REGIONS = [
  { id: 'fra', name: 'Frankfurt', note: 'eu-central · 18 ms' },
  { id: 'iad', name: 'Virginia', note: 'us-east · 92 ms' },
  { id: 'sin', name: 'Singapore', note: 'ap-southeast · 164 ms' },
]

/** 一轮 10 秒：依次走过三步，再回到第一步。 */
function scripted(time: number) {
  const t = time % 10
  if (t < 2.5) return 0
  if (t < 5) return 1
  if (t < 8) return 2
  return 0
}

export function Demo(props: Partial<DialogStackProps>) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(0)
  const [manual, setManual] = useState<number | null>(null)
  const [open, setOpen] = useState(true)
  const [region, setRegion] = useState('fra')

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual !== null) return
      const next = scripted(time)
      setAuto((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 5.6 },
  )

  return (
    <div ref={host} className="relative h-full w-full overflow-hidden bg-background text-foreground">
      <DialogStack
        {...props}
        portal={false}
        open={open}
        onOpenChange={(value) => {
          setOpen(value)
          setManual(0)
        }}
        activeIndex={manual ?? auto}
        onActiveIndexChange={setManual}
        className="h-full w-full"
      >
        <div className="grid h-full w-full place-items-center p-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="text-sm text-muted-foreground">No projects in Halden Labs yet.</div>
            <DialogStackTrigger>New project</DialogStackTrigger>
          </div>
        </div>
        <DialogStackOverlay />
        <DialogStackBody>
          <DialogStackContent>
            <DialogStackHeader>
              <DialogStackTitle>Name your project</DialogStackTitle>
              <DialogStackDescription>Step 1 of 3 · You can rename it later.</DialogStackDescription>
            </DialogStackHeader>
            <label className="mt-4 block text-sm">
              <span className="mb-1.5 block text-muted-foreground">Project name</span>
              <input
                defaultValue="billing-service"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <DialogStackFooter>
              <DialogStackNext className={solid}>Continue</DialogStackNext>
            </DialogStackFooter>
          </DialogStackContent>
          <DialogStackContent>
            <DialogStackHeader>
              <DialogStackTitle>Pick a region</DialogStackTitle>
              <DialogStackDescription>Step 2 of 3 · Closest to most of your users.</DialogStackDescription>
            </DialogStackHeader>
            <div role="radiogroup" aria-label="Region" className="mt-4 grid gap-2">
              {REGIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  role="radio"
                  aria-checked={region === r.id}
                  onClick={() => setRegion(r.id)}
                  className={`flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    region === r.id ? 'border-primary bg-muted' : 'hover:bg-muted'
                  }`}
                >
                  <span className="font-medium">{r.name}</span>
                  <span className="text-xs text-muted-foreground">{r.note}</span>
                </button>
              ))}
            </div>
            <DialogStackFooter>
              <DialogStackPrevious className={ghost}>Back</DialogStackPrevious>
              <DialogStackNext className={solid}>Continue</DialogStackNext>
            </DialogStackFooter>
          </DialogStackContent>
          <DialogStackContent>
            <DialogStackHeader>
              <DialogStackTitle>Invite your team</DialogStackTitle>
              <DialogStackDescription>Step 3 of 3 · Invites expire after 7 days.</DialogStackDescription>
            </DialogStackHeader>
            <ul className="mt-4 grid gap-2 text-sm">
              {[
                ['MR', 'mara.reyes@halden.dev', 'Admin'],
                ['TO', 'tomas.okafor@halden.dev', 'Developer'],
              ].map(([initials, email, role]) => (
                <li key={email} className="flex items-center gap-3 rounded-md border px-3 py-2">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium">{initials}</span>
                  <span className="min-w-0 flex-1 truncate">{email}</span>
                  <span className="text-xs text-muted-foreground">{role}</span>
                </li>
              ))}
            </ul>
            <DialogStackFooter>
              <DialogStackPrevious className={ghost}>Back</DialogStackPrevious>
              <button type="button" className={`${solid} inline-flex items-center rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`} onClick={() => setOpen(false)}>
                Create project
              </button>
            </DialogStackFooter>
          </DialogStackContent>
        </DialogStackBody>
      </DialogStack>
    </div>
  )
}
