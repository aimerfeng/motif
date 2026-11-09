import { TranscriptWordSync, type TranscriptWordSyncProps, type WordTiming } from './transcript-word-sync'

const SCRIPT =
  'Welcome back to Field Notes. This week we walked the old rail line from Harlow Junction to the river, about eleven kilometres, and recorded what the valley sounds like at dawn. Wrens first, then the wind in the cuttings, and finally the freight train at six forty, right on time.'

/** 没有音频文件：按词长和标点估一份逐词时间，模拟一段朗读。 */
function timings(text: string): WordTiming[] {
  let t = 0.3
  return text.split(' ').map((word) => {
    const length = 0.16 + word.replace(/[^\w]/g, '').length * 0.045
    const startTime = t
    const endTime = t + length
    t = endTime + (/[.,]$/.test(word) ? 0.32 : 0.06)
    return { text: word, startTime, endTime }
  })
}

const WORDS = timings(SCRIPT)

export function Demo(props: TranscriptWordSyncProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-[560px] space-y-3">
        <div className="flex items-baseline justify-between gap-3 px-1 text-sm">
          <span className="font-medium text-foreground">Field Notes 12: Night Trains</span>
          <span className="shrink-0 text-muted-foreground">Episode transcript</span>
        </div>
        <TranscriptWordSync {...props} words={WORDS} autoPlay loop defaultTime={5.2} />
      </div>
    </div>
  )
}
