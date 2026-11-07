import type { ReactNode } from 'react'
import { Terminal, TerminalCommand, TerminalLine, TerminalTask, type TerminalProps } from './terminal'

function Ok({ children }: { children: ReactNode }) {
  return (
    <>
      <span style={{ color: '#4cc38a' }}>✔</span> <span className="text-foreground">{children}</span>
    </>
  )
}

const Dim = ({ children }: { children: ReactNode }) => <span className="text-muted-foreground">{children}</span>

// 一个虚构的脚手架 tidewater：建项目、装依赖、起开发服务器。
// 速度为 1 时内容在 9.35 秒放完，停 2.2 秒、淡出 0.45 秒，一轮正好 12 秒，和循环视频等长。
export function Demo(props: Omit<TerminalProps, 'children'>) {
  return (
    <div className="grid h-full w-full place-items-center bg-background p-6">
      <Terminal {...props} hold={2.2} className="max-w-[540px]">
        <TerminalCommand>npm create tidewater@latest harbor</TerminalCommand>
        <TerminalLine delay={0.45}>
          <Ok>
            Template <Dim>›</Dim> Dashboard
          </Ok>
        </TerminalLine>
        <TerminalLine delay={0.2}>
          <Ok>
            Language <Dim>›</Dim> TypeScript
          </Ok>
        </TerminalLine>
        <TerminalLine delay={0.2}>
          <Ok>
            Styling <Dim>›</Dim> Tailwind
          </Ok>
        </TerminalLine>
        <TerminalTask delay={0.25} duration={1.8} done="Installed 184 packages in 4.8s">
          Installing dependencies…
        </TerminalTask>
        <TerminalLine delay={0.2}>{'  Next: cd harbor && npm run dev'}</TerminalLine>
        <TerminalLine>{'\u00a0'}</TerminalLine>
        <TerminalCommand delay={0.25}>cd harbor && npm run dev</TerminalCommand>
        <TerminalLine delay={0.55} tone="default">
          {'  '}
          <span className="font-semibold">tidewater</span> 2.4.0 <Dim> ready in 412 ms</Dim>
        </TerminalLine>
        <TerminalLine delay={0.12} tone="default">
          {'  '}
          <Dim>➜</Dim>
          {'  '}Local:{'   '}
          <span style={{ color: '#6aa8f0' }}>localhost:5173</span>
        </TerminalLine>
        <TerminalLine delay={0.12}>{'  ➜  Network: use --host to expose'}</TerminalLine>
      </Terminal>
    </div>
  )
}
