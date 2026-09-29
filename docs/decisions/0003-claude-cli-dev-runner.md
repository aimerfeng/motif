# 0003 开发期用本机 Claude CLI 驱动 agent

- 状态：已采纳（2026-09-29，P0 验证）
- 背景：用户要求站点内置模型 key，但真实 key 以后才配；开发和测试直接用本机 Claude Code CLI 的 Sonnet 5.5，不调用付费 API。

## 决定

`packages/agent-claude-cli`（P4 实现）用 `@anthropic-ai/claude-agent-sdk` 驱动本机 `claude.exe`，把我们自己的工具作为进程内 MCP 服务器提供给模型。

- **只在开发期使用**：Agent SDK 的许可证是专有的（`LICENSE.md`：© Anthropic PBC. All rights reserved），不能进入生产依赖，也不能随开源产物分发。单独成包、动态加载，生产环境由 `MOTIF_AGENT_PROVIDER` 选择 AI SDK 的 provider。
- 验证可用的 `query()` 选项：

```ts
query({
  prompt, // AsyncIterable<SDKUserMessage>（流式输入）
  options: {
    model: 'claude-sonnet-5-5',
    pathToClaudeCodeExecutable: 'C:/Users/10706/.local/bin/claude.exe', // 用正斜杠
    mcpServers: { motif }, // createSdkMcpServer({ name: 'motif', tools: [tool(...)] })
    tools: [], // 去掉全部内置工具（Bash、Read 等）
    allowedTools: ['mcp__motif__write_file', 'mcp__motif__read_file'],
    permissionMode: 'dontAsk', // 允许的工具直接执行，其余一律拒绝，不弹确认
    systemPrompt: '…',
    settingSources: ['user'], // 读取 ~/.claude/settings.json 的 env（本机网关代理与证书）
    strictMcpConfig: true, // 否则账号里的 claude.ai 连接器工具也会出现在工具列表里
    cwd, includePartialMessages: true, abortController,
  },
})
```

## 实测行为

- 首次调用约 3.3 s 收到 init，约 5.3 s 第一次调用工具；写文件 + 读回 + 确认共 3 轮、约 10 s、约 $0.01。
- 事件：`system:init`（工具列表、MCP 状态）、`stream_event`（文本 / 工具参数的增量）、完整的 `assistant`（含 `tool_use`）、`user`（含 `tool_result`）、最终 `result`（`num_turns`、`duration_ms`、`total_cost_usd`、`usage`）。
- **多轮**：同一个流式会话里发第二条用户消息，必须等上一轮的 `result` 之后再发，否则会被并进当前轮。`resume: sessionId` 在新进程里也能接上。
- **中止**：`abort()` 后迭代器抛 `Error: Operation aborted`，但要等正在生成的消息结束，实测延迟可达十几秒；未执行的工具调用会收到合成的错误结果。循环要包 try/catch。
- **工具抛异常**：SDK 把异常转成 `is_error: true` 的 tool_result 交给模型，会话继续。预期内的失败应主动返回 `{ isError: true, content }`。
