import { CLIENTS, mergeCodexToml, mergeJsonConfig, serverEntry, type Action, type SetupEnv } from '@motif/cli/clients'
import { cliCommand, cliPackageUrl } from './cli'

/*
 * 接入页（/agents）上每个 agent 的配置说明。配置写在哪、长什么样全部来自命令行的那张表（@motif/cli/clients），
 * 也就是 `motif setup` 实际会写的东西：页面上的说明和命令行做的事不会对不上（docs/decisions/0011）。
 */

export type AgentOs = 'unix' | 'windows'

export type ManualStep =
  /** 把 snippet 合并进 file。 */
  | { kind: 'file'; file: string; snippet: string }
  | { kind: 'command'; text: string }

export interface AgentGuide {
  id: string
  label: string
  /** 让命令行只配置这一个 agent。 */
  setup: string
  manual: Record<AgentOs, ManualStep>
}

/**
 * 说明里的路径用占位符（~、%USERPROFILE%）：页面是给所有人看的，不知道读的人的主目录在哪。
 * unix 按 macOS 算：它和 Linux 只差 Claude Desktop 的配置位置，而 Claude Desktop 没有 Linux 版。
 */
const DISPLAY: Record<AgentOs, SetupEnv> = {
  unix: { cwd: '.', home: '~', platform: 'darwin', appData: undefined, exists: () => false, onPath: () => true },
  windows: { cwd: '.', home: '%USERPROFILE%', platform: 'win32', appData: '%APPDATA%', exists: () => false, onPath: () => true },
}

function manualStep(action: Action): ManualStep {
  switch (action.kind) {
    case 'json':
      return { kind: 'file', file: action.file, snippet: mergeJsonConfig(null, action.root, action.entry).trimEnd() }
    case 'toml':
      return { kind: 'file', file: action.file, snippet: mergeCodexToml(null, action.entry).trimEnd() }
    case 'exec':
      return { kind: 'command', text: [action.command, ...action.args].join(' ') }
    case 'manual':
      return { kind: 'command', text: action.text }
  }
}

export function agentGuides(origin: string): AgentGuide[] {
  const packageUrl = cliPackageUrl(origin)
  const manual = (client: (typeof CLIENTS)[number], os: AgentOs) => manualStep(client.plan('auto', serverEntry(packageUrl, DISPLAY[os].platform), DISPLAY[os]))
  return CLIENTS.map((client) => ({
    id: client.id,
    label: client.label,
    setup: cliCommand(origin, `setup ${client.id}`),
    manual: { unix: manual(client, 'unix'), windows: manual(client, 'windows') },
  }))
}
