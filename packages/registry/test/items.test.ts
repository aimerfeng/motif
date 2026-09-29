import { describe, expect, it } from 'vitest'
import { buildRegistry } from '../src/index.ts'

describe('market items', () => {
  it('every item passes the checker and compiles for the sandbox', async () => {
    const result = await buildRegistry({ writeCatalog: false })
    expect(result.catalog.items.length).toBeGreaterThan(0)
    expect(result.errors.map(({ slug, finding }) => `${slug} [${finding.rule}] ${finding.file ?? ''} ${finding.message}`)).toEqual([])
    for (const item of result.catalog.items) expect(item.build, item.manifest.slug).not.toBeNull()
  }, 120_000)
})
