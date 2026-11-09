import { KineticCenterBuild, type KineticCenterBuildProps } from './kinetic-center-build'

export function Demo(props: KineticCenterBuildProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background px-4 py-10">
      <div className="flex w-full max-w-3xl flex-col items-center text-center">
        <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">Northwind Keynote · 2026</p>
        <div className="mt-6 flex min-h-[2.6em] w-full items-center justify-center text-foreground">
          <KineticCenterBuild {...props} />
        </div>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">Live from the Hall B stage. Doors open at 9:30, the opening talk starts at ten.</p>
      </div>
    </div>
  )
}
