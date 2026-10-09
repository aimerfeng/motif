import { compileItem, type CompileInput, type CompileResult } from './compile.ts'

/**
 * 编译子进程。站点的服务端由 Next 打包，打不进 esbuild 和 Tailwind 的原生模块，
 * 所以站点用 child_process.fork 起这个常驻进程，经 IPC 收发 { id, input } / { id, result }。
 * 进程常驻，Tailwind 编译器的缓存一直有效；编译出错只影响这一次请求。
 */
export type WorkerRequest = { id: number; input: CompileInput }
export type WorkerResponse = { id: number; result: CompileResult } | { id: number; error: string }

process.on('message', (message: WorkerRequest) => {
  compileItem(message.input).then(
    (result) => process.send?.({ id: message.id, result } satisfies WorkerResponse),
    (error: unknown) => process.send?.({ id: message.id, error: error instanceof Error ? error.message : String(error) } satisfies WorkerResponse),
  )
})

// 父进程（站点）退出时跟着退出，不留孤儿进程。
process.on('disconnect', () => process.exit(0))
