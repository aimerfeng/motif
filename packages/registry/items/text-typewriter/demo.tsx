import { TypingAnimation, type TypingAnimationProps } from './text-typewriter'

export function Demo(props: TypingAnimationProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background p-6">
      <div className="w-full max-w-2xl text-center">
        <p className="text-sm text-muted-foreground">Fernwork · the studio OS for teams of five</p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
          <TypingAnimation {...props} className="leading-tight" />
          <span className="block text-muted-foreground">without the busywork.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
          Briefs, reviews and handoffs live in one place, so the work moves forward while you get on with it.
        </p>
      </div>
    </div>
  )
}
