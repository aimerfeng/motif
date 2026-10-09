import { pathToFileURL } from 'node:url'
import path from 'node:path'
import { modelConfigFromEnv, modelRunner, scriptedRunner, type AgentRunner } from '@motif/agent'

/*
 * 选择 Studio 的运行器（MOTIF_AGENT_PROVIDER，见 apps/web/.env.example）：
 * - anthropic / openai-compatible：站点内置的 key，生产用；
 * - claude-cli：本机 Claude Code CLI，只在开发期用（Agent SDK 是专有许可证，不进构建产物）；
 * - scripted：按脚本回放，e2e 用。
 * 开发模式下不设时默认用本机 CLI；生产环境不设就关闭 agent，手动编辑仍然可用。
 */

export type RunnerConfig = { provider: string; label: string } | null

function provider(): string | null {
  const value = process.env.MOTIF_AGENT_PROVIDER?.trim()
  if (value) return value
  return process.env.NODE_ENV === 'development' ? 'claude-cli' : null
}

export function runnerConfig(): RunnerConfig {
  const name = provider()
  switch (name) {
    case 'anthropic':
    case 'openai-compatible': {
      const model = modelConfigFromEnv(process.env)
      return model ? { provider: name, label: model.model } : null
    }
    case 'claude-cli':
      return { provider: name, label: `${process.env.MOTIF_CLAUDE_MODEL ?? 'claude-sonnet-5-5'} (local CLI)` }
    case 'scripted':
      return { provider: name, label: 'scripted' }
    default:
      return null
  }
}

// 站点不静态依赖 @motif/agent-claude-cli（它带着专有的 Agent SDK），只按这个形状使用它。
interface CliModule {
  claudeCliRunner(options: { executable?: string; model?: string }): AgentRunner
}

let cliRunner: Promise<AgentRunner> | null = null

/** 本机 CLI 运行器：运行时用 Node 原生 import 加载（类型擦除直接跑 .ts 源码），不经过 Next 打包。 */
function loadCliRunner(): Promise<AgentRunner> {
  cliRunner ??= (async () => {
    const entry = pathToFileURL(path.resolve(/*turbopackIgnore: true*/ process.cwd(), '../..', 'packages/agent-claude-cli/src/index.ts')).href
    const module = (await import(/* turbopackIgnore: true */ /* webpackIgnore: true */ entry)) as CliModule
    return module.claudeCliRunner({ ...(process.env.MOTIF_CLAUDE_CLI_PATH ? { executable: process.env.MOTIF_CLAUDE_CLI_PATH } : {}), ...(process.env.MOTIF_CLAUDE_MODEL ? { model: process.env.MOTIF_CLAUDE_MODEL } : {}) })
  })()
  return cliRunner
}

export async function getRunner(): Promise<AgentRunner | null> {
  const config = runnerConfig()
  if (!config) return null
  switch (config.provider) {
    case 'scripted':
      return scriptedRunner()
    case 'claude-cli':
      return loadCliRunner()
    case 'anthropic':
    case 'openai-compatible': {
      const model = modelConfigFromEnv(process.env)
      return model ? modelRunner(model) : null
    }
    default:
      return null
  }
}

/** 每个会话最多消耗多少 token（输入 + 输出）；用的是站点内置的 key，必须有上限。 */
export function sessionTokenBudget(): number {
  const value = Number(process.env.MOTIF_AGENT_SESSION_TOKENS)
  return Number.isFinite(value) && value > 0 ? value : 600_000
}
