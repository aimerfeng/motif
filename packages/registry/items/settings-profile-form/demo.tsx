import { cn, useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { INITIAL_BIO, SettingsProfileForm, type SettingsProfileFormProps } from './settings-profile-form'

/** 自动播放：8 秒一轮，在简介后面打一句话再删掉，剩余字数跟着变。用户一操作就停。 */
const TYPED = ' Based in Lyon, open to freelance work.'
const LOOP = 8

function scripted(time: number) {
  const t = time % LOOP
  let n = 0
  if (t < 1) n = 0
  else if (t < 3.6) n = ((t - 1) / 2.6) * TYPED.length
  else if (t < 6) n = TYPED.length
  else if (t < 7.2) n = (1 - (t - 6) / 1.2) * TYPED.length
  return INITIAL_BIO + TYPED.slice(0, Math.floor(n))
}

export function Demo(props: SettingsProfileFormProps) {
  const host = useRef<HTMLDivElement>(null)
  const [manual, setManual] = useState(false)
  const [bio, setBio] = useState(INITIAL_BIO)

  useFrameLoop(
    host,
    ({ time }) => {
      if (manual) return
      const next = scripted(time)
      setBio((cur) => (cur === next ? cur : next))
    },
    { reducedMotion: 'static', staticTime: 4 },
  )

  const card = props.presentation === 'card'

  return (
    <div
      ref={host}
      className="h-full w-full overflow-y-auto bg-background"
      onPointerDownCapture={() => setManual(true)}
      onKeyDownCapture={() => setManual(true)}
    >
      <div className={cn('flex min-h-full items-center justify-center', card ? 'px-4 py-10' : 'p-4')}>
        <SettingsProfileForm
          {...props}
          defaultOpen
          bio={bio}
          onBioChange={(value) => {
            setManual(true)
            setBio(value)
          }}
        />
      </div>
    </div>
  )
}
