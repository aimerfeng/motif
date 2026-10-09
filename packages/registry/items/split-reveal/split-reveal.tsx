import { cn, useFrameLoop } from '@motif/runtime'
import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'

/* @motif:defaults */
export const defaults = {
  text: 'Every frame should earn its place on the page.',
  split: 'lines',
  stagger: 0.12,
  duration: 1,
  ease: [0.16, 1, 0.3, 1],
  rotate: 6,
  loop: true,
  font: 'serif',
  size: 76,
  color: '#f1ead8',
  background: '#13241d',
}
/* @motif:end */

export type SplitRevealProps = Partial<typeof defaults> & {
  className?: string
  style?: CSSProperties
}

const FONTS: Record<string, string> = {
  serif: "'Instrument Serif', 'Songti SC', serif",
  grotesk: "'Bricolage Grotesque Variable', 'PingFang SC', sans-serif",
  sans: "'Inter Tight Variable', 'PingFang SC', sans-serif",
}
/** 揭示完停多久再退场，退场后隔多久重来（只在循环时）。 */
const HOLD = 1.8
const GAP = 0.5

interface Word {
  text: string
  /** 前面有没有空格：中文按字拆开时，字与字之间没有空格。 */
  space: boolean
}

/** 拆成「词」：拉丁文按空格分词，中日韩文字每个字一个词（它们之间可以换行）。 */
function tokenize(text: string): Word[] {
  const words: Word[] = []
  let space = false
  for (const match of text.matchAll(/(\s+)|([\p{Ideographic}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}、。，！？；：「」『』（）《》〈〉…—])|([^\s\p{Ideographic}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}、。，！？；：「」『』（）《》〈〉…—]+)/gu)) {
    if (match[1]) {
      space = words.length > 0
      continue
    }
    words.push({ text: match[2] ?? match[3]!, space })
    space = false
  }
  return words
}

/** CSS cubic-bezier(x1, y1, x2, y2)：先用牛顿法由 x 求参数 t，再算 y。 */
function bezier([x1, y1, x2, y2]: readonly number[]): (x: number) => number {
  const cx = 3 * x1!
  const bx = 3 * (x2! - x1!) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1!
  const by = 3 * (y2! - y1!) - cy
  const ay = 1 - cy - by
  const curveX = (t: number) => ((ax * t + bx) * t + cx) * t
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx
  return (x) => {
    if (x <= 0) return 0
    if (x >= 1) return 1
    let t = x
    for (let i = 0; i < 8; i++) {
      const slope = slopeX(t)
      if (Math.abs(slope) < 1e-6) break
      t -= (curveX(t) - x) / slope
    }
    t = Math.min(Math.max(t, 0), 1)
    return ((ay * t + by) * t + cy) * t
  }
}

const clamp = (value: number) => Math.min(Math.max(value, 0), 1)

// 遮罩比文字略高一点，下行字母（g、y、p）的尾巴不会被切掉。
const MASK = 'overflow-hidden pb-[0.14em] -mb-[0.14em]'
const HIDDEN: CSSProperties = { transform: 'translate3d(0, 115%, 0)', transformOrigin: '0% 100%' }

/**
 * 标题按行、按词或按字拆开，从遮罩后面依次升起。
 * 按行时先按词排一遍、量出每个词所在的行，再把同一行的词装进同一个遮罩；宽度变了就重新量。
 * 每帧直接写 transform，不触发 React 重渲染；开启「减少动态效果」时直接显示完整文字。
 */
export function SplitReveal({ className, style, ...props }: SplitRevealProps) {
  const options = { ...defaults, ...props }
  const { text, split, stagger, duration, ease, rotate, loop, font, size, color, background } = options
  const host = useRef<HTMLDivElement>(null)
  const wordMasks = useRef<(HTMLSpanElement | null)[]>([])
  const units = useRef<(HTMLSpanElement | null)[]>([])
  const words = useMemo(() => tokenize(text), [text])
  const easing = useMemo(() => bezier(ease), [ease])
  // 按行拆时的分行结果（每行是词的下标）；null 表示还没量。
  const [lines, setLines] = useState<number[][] | null>(null)

  // 文字、字体、字号或拆法变了就重新量。
  useLayoutEffect(() => setLines(null), [text, font, size, split])

  useLayoutEffect(() => {
    if (split !== 'lines' || lines !== null) return
    const grouped: number[][] = []
    let lastTop = Number.NaN
    wordMasks.current.slice(0, words.length).forEach((element, index) => {
      const top = element ? Math.round(element.offsetTop) : lastTop
      if (top !== lastTop) grouped.push([])
      grouped.at(-1)!.push(index)
      lastTop = top
    })
    setLines(grouped)
  }, [split, lines, words])

  // 容器变宽变窄时分行会变：只在宽度变化时重新量，避免高度变化引起的循环。
  useLayoutEffect(() => {
    const element = host.current
    if (!element || split !== 'lines') return
    let width = element.clientWidth
    const observer = new ResizeObserver(() => {
      if (element.clientWidth === width) return
      width = element.clientWidth
      setLines(null)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [split])

  const chars = useMemo(() => words.map((word) => Array.from(word.text)), [words])
  const pieces = split === 'lines' ? (lines?.length ?? words.length) : split === 'words' ? words.length : chars.reduce((sum, list) => sum + list.length, 0)
  const intro = Math.max(pieces - 1, 0) * stagger + duration

  useFrameLoop(
    host,
    ({ time }) => {
      const outro = intro * 0.8
      const cycle = intro + HOLD + outro + GAP
      const t = loop ? time % cycle : Math.min(time, intro)
      const leaving = loop && t > intro + HOLD
      units.current.slice(0, pieces).forEach((element, index) => {
        if (!element) return
        const enter = easing(clamp((t - index * stagger) / duration))
        const exit = leaving ? easing(clamp((t - intro - HOLD - index * stagger * 0.8) / (duration * 0.8))) : 0
        const y = (1 - enter) * 115 - exit * 115
        const tilt = (1 - enter) * rotate - exit * rotate * 0.5
        element.style.transform = `translate3d(0, ${y.toFixed(2)}%, 0) rotate(${tilt.toFixed(2)}deg)`
      })
    },
    { reducedMotion: 'static', staticTime: intro + 0.01 },
  )

  // 动画单元按出场顺序编号，ref 按编号写入：不在渲染时清空再追加，那样和 ref 回调的调用时机对不上。
  let next = 0
  const collect = () => {
    const index = next++
    return (element: HTMLSpanElement | null) => {
      units.current[index] = element
    }
  }

  let body
  if (split === 'lines' && lines) {
    body = lines.map((line, index) => (
      <span key={index} className={cn('block', MASK)}>
        <span ref={collect()} className="block whitespace-nowrap will-change-transform" style={HIDDEN}>
          {line.map((wordIndex, position) => `${position > 0 && words[wordIndex]!.space ? ' ' : ''}${words[wordIndex]!.text}`).join('')}
        </span>
      </span>
    ))
  } else {
    body = words.map((word, index) => (
      <span key={index}>
        {word.space && ' '}
        <span
          ref={(element) => {
            wordMasks.current[index] = element
          }}
          className={cn('inline-block align-top', MASK)}
        >
          {split === 'chars' ? (
            chars[index]!.map((char, charIndex) => (
              <span key={charIndex} ref={collect()} className="inline-block will-change-transform" style={HIDDEN}>
                {char}
              </span>
            ))
          ) : (
            <span ref={collect()} className="inline-block will-change-transform" style={HIDDEN}>
              {word.text}
            </span>
          )}
        </span>
      </span>
    ))
  }

  return (
    <div ref={host} className={cn('relative grid place-items-center overflow-hidden p-8', className)} style={{ background, ...style }}>
      <p aria-label={text} className="w-full max-w-[13em] text-pretty" style={{ fontFamily: FONTS[font] ?? FONTS.serif, fontSize: size, lineHeight: 1.04, letterSpacing: '-0.015em', color }}>
        <span aria-hidden>{body}</span>
      </p>
    </div>
  )
}
