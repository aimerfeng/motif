import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildRegistry, loadAllItems, loadSourceRecords, REPO_ROOT, renderNotices } from '../src/index.ts'

describe('market items', () => {
  it('every item passes the checker and compiles for the sandbox', async () => {
    const result = await buildRegistry({ writeCatalog: false })
    expect(result.catalog.items.length).toBeGreaterThan(0)
    expect(result.errors.map(({ slug, finding }) => `${slug} [${finding.rule}] ${finding.file ?? ''} ${finding.message}`)).toEqual([])
    for (const item of result.catalog.items) expect(item.build, item.manifest.slug).not.toBeNull()
  }, 120_000)
})

describe('third-party notices', () => {
  it('THIRD_PARTY_NOTICES.md matches the generated output (run pnpm notices)', async () => {
    const [{ items }, sources] = await Promise.all([loadAllItems(), loadSourceRecords()])
    const committed = (await readFile(path.join(REPO_ROOT, 'THIRD_PARTY_NOTICES.md'), 'utf8')).replaceAll('\r\n', '\n')
    expect(committed).toBe(renderNotices(items, sources))
  })
})
