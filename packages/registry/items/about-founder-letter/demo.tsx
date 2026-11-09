import { AboutFounderLetter, type AboutFounderLetterProps } from './about-founder-letter'

// 预览里签名按 8 秒一轮重签（和循环视频等长），不依赖进入视口的时机。
export function Demo(props: AboutFounderLetterProps) {
  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="flex min-h-full">
        <AboutFounderLetter {...props} replayEvery={8} className="flex flex-col justify-center" />
      </div>
    </div>
  )
}
