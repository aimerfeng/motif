import { AuroraCurtain, type AuroraCurtainProps } from './aurora-curtain'

// 极光只有在夜空里才成立：和上游演示一样，固定一块深色夜空做底。
export function Demo(props: AuroraCurtainProps) {
  return <AuroraCurtain {...props} className="h-full w-full bg-[#070b14]" />
}
