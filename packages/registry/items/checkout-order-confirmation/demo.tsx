import { useFrameLoop } from '@motif/runtime'
import { useRef, useState } from 'react'
import { CheckoutOrderConfirmation, type CheckoutOrderConfirmationProps, type CopyTarget } from './checkout-order-confirmation'

/**
 * 演示：按时间轮流把订单号和邀请码的按钮显示成「已复制」，海报之后的循环视频里看得到复制反馈。
 * 只是外观，组件不会播报它。用户点过任意一个复制按钮（无论剪贴板成功与否）就交还控制。
 */
export function Demo(props: CheckoutOrderConfirmationProps) {
  const host = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState<CopyTarget | null>(null)
  const [touched, setTouched] = useState(false)
  const touchedRef = useRef(false)
  const last = useRef<CopyTarget | null>(null)

  useFrameLoop(
    host,
    ({ time }) => {
      if (touchedRef.current) return
      const t = time % 10
      const next: CopyTarget | null = t > 2.4 && t < 4.2 ? 'order' : t > 5.6 && t < 7.6 ? 'referral' : null
      if (next !== last.current) {
        last.current = next
        setCopied(next)
      }
    },
    { reducedMotion: 'static', staticTime: 0 },
  )

  return (
    <div
      ref={host}
      className="h-full w-full overflow-y-auto"
      onClickCapture={(event) => {
        if (touchedRef.current || !(event.target instanceof Element) || !event.target.closest('[data-copy]')) return
        touchedRef.current = true
        setTouched(true)
      }}
    >
      <CheckoutOrderConfirmation {...props} className="min-h-full" copied={touched ? undefined : copied} />
    </div>
  )
}
