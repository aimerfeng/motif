// SPDX-License-Identifier: MIT
// Copyright (c) 2024 ibelick
// Source: https://github.com/ibelick/motion-primitives/blob/120f64f/app/docs/text-morph/text-morph-button.tsx
// Modified by Motif; see the item's provenance.
import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { TextMorph, type TextMorphProps } from './text-morph-letters'

export function Demo(props: TextMorphProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(true)
  const [confirmed, setConfirmed] = useState(false)

  // 自动播放：按钮文案每 2.4 秒在 Continue / Confirm 间切换；用户点过之后交给点击。
  useFrameLoop(rootRef, ({ time }) => {
    if (!auto) return
    const next = Math.floor(time / 2.4) % 2 === 1
    setConfirmed((current) => (current === next ? current : next))
  })

  return (
    <div ref={rootRef} className="grid h-full w-full place-items-center bg-background p-6">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <p className="text-sm text-muted-foreground">Billing period</p>
        <TextMorph {...props} className="mt-2 text-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">Change plans any time, prorated to the day.</p>
        <button
          type="button"
          onClick={() => {
            setAuto(false)
            setConfirmed((value) => !value)
          }}
          className="mt-8 flex h-10 w-[120px] shrink-0 items-center justify-center rounded-full bg-foreground px-4 text-base font-medium text-background shadow-xs transition-[opacity] hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          <TextMorph {...props} as="span" size={16} weight={500}>
            {confirmed ? 'Confirm' : 'Continue'}
          </TextMorph>
        </button>
      </div>
    </div>
  )
}
