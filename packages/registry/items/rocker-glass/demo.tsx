// SPDX-License-Identifier: MIT
// Copyright (c) 2025 Urvish Mali
// Source: https://github.com/iurvish/uselayouts/blob/678a478/registry/default/demo/tactile-button-demo.tsx
// Modified by Motif; see the item's provenance.
import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { RockerGlass, type RockerGlassProps } from './rocker-glass'

/** Autoplay: press the cap for 0.6s every 3s until the user interacts. */
export function Demo(props: RockerGlassProps) {
  const host = useRef<HTMLDivElement>(null)
  const [auto, setAuto] = useState(true)
  const [pressed, setPressed] = useState(false)

  useFrameLoop(
    host,
    ({ time }) => {
      if (!auto) return
      const t = time % 3
      const next = t > 1 && t < 1.6
      setPressed((prev) => (prev === next ? prev : next))
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  return (
    <div
      ref={host}
      onPointerEnter={() => setAuto(false)}
      className="flex h-full w-full items-center justify-center bg-[#e9e9e9] bg-[radial-gradient(60%_60%_at_50%_40%,#f7f7f7,transparent)] p-8 sm:p-16"
    >
      <RockerGlass {...props} pressed={auto ? pressed : undefined} />
    </div>
  )
}
