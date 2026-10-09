import { checkParamValue, type ParamValues } from '@motif/schema/core'
import { z } from 'zod'
import { describePreview } from './host.ts'
import type { AgentSession } from './session.ts'
import { deleteFile, editFile, listFiles, MANIFEST_PATH, readFile, writeFile, type WorkspaceResult } from './workspace.ts'

export interface ToolOutput {
  text: string
  isError?: boolean
  /** 交给模型看的截图（look_at_preview）。运行器各自转换成自己 SDK 的图片格式。 */
  images?: { mediaType: string; data: string }[]
}

/**
 * 工具只定义一次（名字、说明、zod 输入、实现），再由各个运行器转换成自己 SDK 的格式。
 * 说明写给模型看，用英文；改工作区的工具都会立刻返回检查和编译结果，模型不用另外去问。
 */
export interface ToolSpec<Schema extends z.ZodObject = z.ZodObject> {
  name: string
  description: string
  input: Schema
  run(session: AgentSession, input: z.infer<Schema>): Promise<ToolOutput>
}

function defineTool<Schema extends z.ZodObject>(spec: ToolSpec<Schema>): ToolSpec<Schema> {
  return spec
}

/** 改动本身成功、但新版本编译不过或没过检查时也算出错：模型和界面都要立刻看到。 */
async function applyResult(session: AgentSession, result: WorkspaceResult): Promise<ToolOutput> {
  if (!result.ok) return { text: result.error, isError: true }
  const text = await session.update(result.item, result.note)
  return { text, isError: !session.evaluation?.ok }
}

const PREVIEW_WAIT_MS = 8000

export const TOOLS = [
  defineTool({
    name: 'search_market',
    description: 'Search the Motif market (templates, styles, sections, components, effects) by keywords. Use it to find a good starting point or a reference implementation.',
    input: z.object({ query: z.string().describe('Keywords, English or Chinese'), limit: z.number().int().min(1).max(20).optional() }),
    async run(session, { query, limit }) {
      const hits = await session.host.searchMarket(query, limit ?? 8)
      if (hits.length === 0) return { text: 'No market items match.' }
      return { text: hits.map((hit) => `- ${hit.slug} [${hit.kind}/${hit.category}] ${hit.title.en} — ${hit.summary.en}`).join('\n') }
    },
  }),
  defineTool({
    name: 'read_market_item',
    description: 'Read a published market item: its item.json and the list of its files. Then use read_market_file for the sources you need.',
    input: z.object({ slug: z.string() }),
    async run(session, { slug }) {
      const item = await session.host.readMarketItem(slug)
      if (!item) return { text: `No published item named "${slug}".`, isError: true }
      const files = Object.entries(item.files).map(([path, text]) => `- ${path} (${text.length} chars)`)
      return { text: `${MANIFEST_PATH}:\n${JSON.stringify(item.manifest, null, 2)}\n\nFiles:\n${files.join('\n')}` }
    },
  }),
  defineTool({
    name: 'read_market_file',
    description: 'Read one source file of a published market item.',
    input: z.object({ slug: z.string(), path: z.string() }),
    async run(session, { slug, path }) {
      const item = await session.host.readMarketItem(slug)
      const text = item?.files[path]
      if (text === undefined) return { text: `${slug}/${path} does not exist.`, isError: true }
      return { text }
    },
  }),
  defineTool({
    name: 'list_files',
    description: `List the files of the item being edited, including the virtual ${MANIFEST_PATH} (the manifest).`,
    input: z.object({}),
    async run(session) {
      return { text: listFiles(session.item).map((file) => `- ${file.path} (${file.role}, ${file.bytes} chars)`).join('\n') }
    },
  }),
  defineTool({
    name: 'read_file',
    description: `Read a file of the item being edited. ${MANIFEST_PATH} is the manifest as JSON.`,
    input: z.object({ path: z.string() }),
    async run(session, { path }) {
      const text = readFile(session.item, path)
      return text === null ? { text: `${path} does not exist.`, isError: true } : { text }
    },
  }),
  defineTool({
    name: 'write_file',
    description: `Create or replace a whole file of the item (or ${MANIFEST_PATH}). Returns the checker and compiler result for the new version. Prefer edit_file for small changes.`,
    input: z.object({ path: z.string(), content: z.string() }),
    async run(session, { path, content }) {
      return applyResult(session, writeFile(session.item, path, content))
    },
  }),
  defineTool({
    name: 'edit_file',
    description: 'Replace one exact, unique occurrence of old_string with new_string in a file. Returns the checker and compiler result for the new version.',
    input: z.object({ path: z.string(), old_string: z.string(), new_string: z.string() }),
    async run(session, input) {
      return applyResult(session, editFile(session.item, input.path, input.old_string, input.new_string))
    },
  }),
  defineTool({
    name: 'delete_file',
    description: 'Delete a file from the item (not the entry or demo file).',
    input: z.object({ path: z.string() }),
    async run(session, { path }) {
      return applyResult(session, deleteFile(session.item, path))
    },
  }),
  defineTool({
    name: 'set_params',
    description: 'Set parameter values in the live preview (keys from item.json params). Use it to show the user a tuned look; it does not change the defaults.',
    input: z.object({ values: z.record(z.string(), z.unknown()) }),
    async run(session, { values }) {
      const next: ParamValues = { ...session.values }
      const problems: string[] = []
      for (const [key, value] of Object.entries(values)) {
        const param = session.item.manifest.params.find((candidate) => candidate.key === key)
        const problem = param ? checkParamValue(param, value) : 'no such param'
        if (problem) problems.push(`${key}: ${problem}`)
        else next[key] = value as ParamValues[string]
      }
      session.setValues(next)
      return problems.length ? { text: `Some values were rejected:\n${problems.join('\n')}`, isError: true } : { text: 'Preview parameters updated.' }
    },
  }),
  defineTool({
    name: 'check_preview',
    description: 'Look at how the latest build behaves in the live browser preview: whether it mounted, threw a runtime error, or renders blank. Call it after a successful build.',
    input: z.object({}),
    async run(session) {
      const version = session.evaluation?.version
      if (version === undefined || !session.evaluation?.build) return { text: 'There is no successful build to preview yet; fix the compile errors first.', isError: true }
      const report = await session.host.previewStatus(version, PREVIEW_WAIT_MS)
      return { text: describePreview(report), isError: report !== null && report.state !== 'mounted' }
    },
  }),
  defineTool({
    name: 'look_at_preview',
    description:
      'See the latest build: it is rendered in a headless browser with the current parameter values, and you get screenshots at the given moments (seconds after mount). Use it after a clean build to judge the visual result against the request, then refine spacing, colour, size and motion until it looks excellent.',
    input: z.object({ times: z.array(z.number().min(0).max(10)).min(1).max(3).optional() }),
    async run(session, { times }) {
      const build = session.evaluation?.build
      if (!build) return { text: 'There is no successful build to look at yet; fix the compile errors first.', isError: true }
      if (!session.host.capture) return { text: 'Screenshots are not available on this server; rely on check_preview and the compile result.', isError: true }
      const { manifest } = session.item
      const shots = await session.host.capture({
        build,
        exportName: manifest.demo.export,
        theme: manifest.demo.theme,
        props: session.values,
        page: ['template', 'style', 'section'].includes(manifest.kind),
        times: times ?? [0.8, 2.5],
      })
      const moments = shots.map((shot) => `${shot.time} s`).join(', ')
      return {
        text: `Screenshots of build ${session.evaluation?.version} at ${moments}, with the current parameter values.`,
        images: shots.map((shot) => ({ mediaType: shot.mediaType, data: shot.data })),
      }
    },
  }),
  defineTool({
    name: 'finish',
    description: 'Call once at the end with a short summary for the user (in the language they wrote in) of what you built or changed.',
    input: z.object({ summary: z.string() }),
    async run(session, { summary }) {
      session.finished = { summary }
      return { text: 'Done.' }
    },
  }),
]

export type ToolName = (typeof TOOLS)[number]['name']

export function findTool(name: string): ToolSpec | undefined {
  return TOOLS.find((tool) => tool.name === name) as ToolSpec | undefined
}
