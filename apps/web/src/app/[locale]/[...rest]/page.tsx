import { notFound } from 'next/navigation'

// 没有匹配到任何页面的地址也走语言段里的 not-found，保持站点外壳和语言。
export default function CatchAll() {
  notFound()
}
