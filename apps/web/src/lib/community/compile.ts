import { fork, type ChildProcess } from 'node:child_process'
import path from 'node:path'
import type { CompileInput, CompileResult } from '@motif/compiler'
import type { WorkerRequest, WorkerResponse } from '@motif/compiler/worker'
import { HttpError } from './http'

/*
 * 在常驻的编译子进程里编译条目（见 packages/compiler/src/worker.ts）。
 * Next 打包不了 esbuild 和 Tailwind 的原生模块；放在子进程里也让耗 CPU 的编译不阻塞站点的请求。
 * 工作区包的真实路径不在 node_modules 里，Node 的类型擦除可以直接运行 .ts 源码。
 */

const WORKER = path.resolve(/*turbopackIgnore: true*/ process.cwd(), '../..', 'packages/compiler/src/worker.ts')
const TIMEOUT_MS = 30_000
// 编译进程一次只处理一个条目；排队太长时直接拒绝，免得一批请求把后面的人都拖住。
const MAX_PENDING = 8

interface Pending {
  resolve: (result: CompileResult) => void
  reject: (error: Error) => void
  timer: NodeJS.Timeout
}

// 页面和接口路由分开打包、模块变量各有一份；挂在 globalThis 上，整个站点进程只起一个编译进程。
const shared = ((globalThis as { __motifCompiler?: { worker: ChildProcess | null; nextId: number; pending: Map<number, Pending> } }).__motifCompiler ??= {
  worker: null,
  nextId: 0,
  pending: new Map(),
})
const { pending } = shared

function failAll(error: Error) {
  for (const [id, request] of pending) {
    clearTimeout(request.timer)
    request.reject(error)
    pending.delete(id)
  }
}

function ensureWorker(): ChildProcess {
  if (shared.worker?.connected) return shared.worker
  const child = fork(WORKER, [], {
    execArgv: ['--experimental-strip-types', '--disable-warning=ExperimentalWarning'],
    stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
  })
  child.on('message', (message: WorkerResponse) => {
    const request = pending.get(message.id)
    if (!request) return
    pending.delete(message.id)
    clearTimeout(request.timer)
    if ('result' in message) request.resolve(message.result)
    else request.reject(new Error(message.error))
  })
  child.on('exit', () => {
    if (shared.worker === child) shared.worker = null
    failAll(new Error('the compiler process exited'))
  })
  // 起不来或 IPC 出错时只让这批请求失败，不能变成没人处理的 error 事件把站点进程带崩。
  child.on('error', (error) => {
    if (shared.worker === child) shared.worker = null
    failAll(error)
  })
  shared.worker = child
  return child
}

export function compileInWorker(input: CompileInput): Promise<CompileResult> {
  if (pending.size >= MAX_PENDING) return Promise.reject(new HttpError(503, 'the compiler is busy; try again shortly'))
  return new Promise((resolve, reject) => {
    const id = ++shared.nextId
    const child = ensureWorker()
    // 超时多半是条目代码让 esbuild 或 Tailwind 卡住了：杀掉进程，下次请求重新起一个。
    const timer = setTimeout(() => {
      pending.delete(id)
      reject(new Error(`compilation timed out after ${TIMEOUT_MS / 1000}s`))
      child.kill()
    }, TIMEOUT_MS)
    pending.set(id, { resolve, reject, timer })
    child.send({ id, input } satisfies WorkerRequest)
  })
}
