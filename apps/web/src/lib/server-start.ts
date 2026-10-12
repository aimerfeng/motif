import { resumeOrders } from '@/lib/store/orders'

/** Node 服务端进程启动时做的事（由 instrumentation.ts 调用）。 */
export function onServerStart(): void {
  // 商店：把重启前没做完的定制单重新排进队列（docs/decisions/0008-agent-store.md）。不等它做完，进程照常开始接请求。
  void resumeOrders().catch((error: unknown) => console.error('[store] could not resume orders', error))

  // 开发时进程偶尔会自己退出、什么也不打印：至少记下退出码和未捕获的异常，下次能知道是哪一种。
  // 只加观察型的监听（exit、uncaughtExceptionMonitor），不改变进程原本的退出行为。
  if (process.env.NODE_ENV === 'development') {
    process.on('exit', (code) => console.error(`[motif] server process exiting with code ${code}`))
    process.on('uncaughtExceptionMonitor', (error, origin) => console.error(`[motif] ${origin}`, error))
  }
}
