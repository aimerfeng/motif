/**
 * 服务端进程启动时运行一次（Next 的 instrumentation 约定）。这个文件也会按 Edge 运行时编译，
 * 所以只用到 Node 的部分放在单独的模块里，按运行时动态导入。
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { onServerStart } = await import('@/lib/server-start')
    onServerStart()
  }
}
