import type { ItemSource, ParamValues } from '@motif/schema/core'
import type { AgentEvent } from './events.ts'
import { describeEvaluation, type AgentHost, type Evaluation } from './host.ts'
import { carryValues } from './workspace.ts'

/**
 * 一次运行里 agent 操作的对象：当前条目、预览里的参数、最近一次检查结果。
 * 工具通过它改工作区；每次改动都会重新检查、编译，并把新状态作为事件发给浏览器。
 */
export class AgentSession {
  item: ItemSource
  values: ParamValues
  evaluation: Evaluation | null
  finished: { summary: string } | null = null
  readonly host: AgentHost
  private readonly emit: (event: AgentEvent) => void

  constructor(init: { item: ItemSource; values: ParamValues; evaluation: Evaluation | null }, host: AgentHost, emit: (event: AgentEvent) => void) {
    this.host = host
    this.emit = emit
    this.item = init.item
    this.values = init.values
    this.evaluation = init.evaluation
  }

  /** 换上新的条目：检查、编译、通知浏览器，返回给 agent 看的结果。 */
  async update(item: ItemSource, note?: string): Promise<string> {
    const previous = this.item
    this.item = item
    const evaluation = await this.host.evaluate(item)
    this.evaluation = evaluation
    this.values = carryValues(previous, item, this.values)
    this.emit({ type: 'workspace', item, evaluation })
    return [note, describeEvaluation(evaluation)].filter(Boolean).join('\n')
  }

  setValues(values: ParamValues): void {
    this.values = values
    this.emit({ type: 'params', values })
  }
}
