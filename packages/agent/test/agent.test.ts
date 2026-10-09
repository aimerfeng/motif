import { defaultsOf } from '@motif/schema'
import { simulateReadableStream } from 'ai'
import { MockLanguageModelV4 } from 'ai/test'
import { describe, expect, it } from 'vitest'
import { AgentSession, aiSdkRunner, applyDefaults, appendEvent, callTool, carryValues, editFile, printManifest, remixItem, runAgent, scriptedRunner, starterItem, writeFile, type TranscriptEntry } from '../src/index.ts'
import { collect, testHost } from './support.ts'

describe('workspace', () => {
  it('starts from an item that passes the checker and compiles', async () => {
    const host = testHost()
    const evaluation = await host.evaluate(starterItem('studio-test'))
    expect(evaluation.problems.filter((problem) => problem.level === 'error')).toEqual([])
    expect(evaluation.ok).toBe(true)
  })

  it('edits only unique matches and validates item.json as JSON', () => {
    const item = starterItem('studio-test')
    expect(editFile(item, 'effect.tsx', 'colors', 'x')).toMatchObject({ ok: false })
    expect(editFile(item, 'effect.tsx', 'not in the file', 'x')).toMatchObject({ ok: false })
    expect(writeFile(item, 'item.json', '{ nope')).toMatchObject({ ok: false })
    const added = writeFile(item, 'noise.ts', 'export const n = 1\n')
    expect(added.ok && added.item.manifest.files.some((file) => file.path === 'noise.ts' && file.role === 'lib')).toBe(true)
    expect(writeFile(item, '../escape.ts', '')).toMatchObject({ ok: false })
  })

  it('applies tuned values as the new defaults in both item.json and the component', async () => {
    const item = applyDefaults(starterItem('studio-test'), { speed: 2 })
    expect(defaultsOf(item.manifest.params).speed).toBe(2)
    expect(item.files['effect.tsx']).toContain('speed: 2,')
    expect((await testHost().evaluate(item)).ok).toBe(true)
  })

  it('lets untouched preview values follow new defaults and keeps tuned ones', () => {
    const before = starterItem('studio-test')
    const after = applyDefaults(before, { speed: 2, softness: 90 })
    expect(carryValues(before, after, { ...defaultsOf(before.manifest.params), softness: 40 })).toMatchObject({ speed: 2, softness: 40 })
  })

  it('prints item.json compactly and losslessly', () => {
    const { manifest } = starterItem('studio-test')
    const text = printManifest(manifest)
    expect(JSON.parse(text)).toEqual(manifest)
    expect(text).toContain('"label": { "zh-CN": "速度", "en": "Speed" }')
    expect(text.split('\n').every((line) => line.length <= 100 || !line.includes('{'))).toBe(true)
  })

  it('records the base item when remixing', () => {
    const remix = remixItem(starterItem('base'), 'base-remix')
    expect(remix.manifest.slug).toBe('base-remix')
    expect(remix.manifest.provenance.basedOn).toBe('base')
  })
})

describe('scripted runner', () => {
  it('breaks the build, sees the error, fixes it and finishes', async () => {
    const host = testHost()
    const item = starterItem('studio-test')
    const { events, onEvent } = collect()
    const result = await runAgent({
      runner: scriptedRunner(),
      host,
      system: '',
      prompt: 'make it cyan',
      item,
      values: defaultsOf(item.manifest.params),
      evaluation: null,
      state: undefined,
      signal: new AbortController().signal,
      onEvent,
    })
    expect(result.completed).toBe(true)
    expect(host.evaluations.map((evaluation) => evaluation.ok)).toEqual([false, true])
    expect(result.item.files['effect.tsx']).toBe(item.files['effect.tsx'])
    expect(events.at(-1)).toMatchObject({ type: 'done', summary: expect.stringContaining('Scripted run') })

    const transcript: TranscriptEntry[] = []
    for (const event of events) appendEvent(transcript, event)
    const broken = transcript.find((entry) => entry.role === 'tool' && entry.isError)
    expect(broken).toMatchObject({ name: 'edit_file', output: expect.stringContaining('error') })
  })
})

describe('look_at_preview', () => {
  it('returns screenshots from the host, or says plainly that it cannot', async () => {
    const item = starterItem('studio-test')
    const host = testHost()
    const evaluation = await host.evaluate(item)
    const session = new AgentSession({ item, values: defaultsOf(item.manifest.params), evaluation }, host, () => undefined)
    expect(await callTool(session, 'look_at_preview', {})).toMatchObject({ isError: true, text: expect.stringContaining('not available') })

    const requests: number[][] = []
    session.host.capture = async (request) => {
      requests.push(request.times)
      return request.times.map((time) => ({ time, mediaType: 'image/jpeg', data: 'aGVsbG8=' }))
    }
    const output = await callTool(session, 'look_at_preview', { times: [1] })
    expect(requests).toEqual([[1]])
    expect(output.images).toEqual([{ mediaType: 'image/jpeg', data: 'aGVsbG8=' }])
  })
})

describe('AI SDK runner', () => {
  const usage = { inputTokens: { total: 10, noCache: 10, cacheRead: undefined, cacheWrite: undefined }, outputTokens: { total: 5, text: 5, reasoning: undefined } }

  it('turns tool calls into workspace changes and keeps the history for the next turn', async () => {
    const model = new MockLanguageModelV4({
      doStream: [
        {
          stream: simulateReadableStream({
            chunks: [
              { type: 'tool-call', toolCallId: 'c1', toolName: 'edit_file', input: JSON.stringify({ path: 'effect.tsx', old_string: 'speed: 1,', new_string: 'speed: 1.5,' }) },
              { type: 'finish', finishReason: { unified: 'tool-calls', raw: undefined }, usage },
            ],
          }),
        },
        {
          stream: simulateReadableStream({
            chunks: [
              { type: 'text-start', id: 't1' },
              { type: 'text-delta', id: 't1', delta: 'The defaults region no longer matches; ' },
              { type: 'text-end', id: 't1' },
              { type: 'tool-call', toolCallId: 'c2', toolName: 'finish', input: JSON.stringify({ summary: '加快了一点。' }) },
              { type: 'finish', finishReason: { unified: 'tool-calls', raw: undefined }, usage },
            ],
          }),
        },
      ],
    })
    const host = testHost()
    const item = starterItem('studio-test')
    const { events, onEvent } = collect()
    const result = await runAgent({
      runner: aiSdkRunner(model),
      host,
      system: 'system prompt',
      prompt: 'faster please',
      item,
      values: defaultsOf(item.manifest.params),
      evaluation: null,
      state: undefined,
      signal: new AbortController().signal,
      onEvent,
    })

    expect(result.item.files['effect.tsx']).toContain('speed: 1.5,')
    // 只改了组件没改 item.json：检查器发现默认值区域对不上，并把这个错误交给了模型。
    expect(events.find((event) => event.type === 'tool-result' && event.name === 'edit_file')).toMatchObject({ output: expect.stringContaining('error') })
    expect(events.at(-1)).toMatchObject({ type: 'done', summary: '加快了一点。' })
    const history = result.state as { role: string }[]
    expect(history[0]).toMatchObject({ role: 'user', content: 'faster please' })
    expect(history.length).toBeGreaterThan(2)
    expect(model.doStreamCalls).toHaveLength(2)
  })
})
