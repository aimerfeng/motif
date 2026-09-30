import type { CSSProperties } from 'react'

export type CSSVariables = Record<`--${string}`, string | number | undefined>

/**
 * 把 CSS 自定义属性（`--accent` 等）和普通样式合成一个 style 对象。
 * React 的 CSSProperties 不认识自定义属性，这里集中做唯一一次类型转换，组件里不必再写双重断言。
 */
export function cssVars(variables: CSSVariables, style?: CSSProperties): CSSProperties {
  return { ...style, ...variables } as CSSProperties
}
