import { describe, expect, it } from 'vitest'
import { lineDiff, toHunks } from '../src/lib/studio/diff'

describe('studio diff', () => {
  it('finds the smallest set of added and removed lines', () => {
    const lines = lineDiff('a\nb\nc\nd\n', 'a\nB\nc\nd\ne\n')
    expect(lines).toEqual([
      { kind: 'same', text: 'a' },
      { kind: 'del', text: 'b' },
      { kind: 'add', text: 'B' },
      { kind: 'same', text: 'c' },
      { kind: 'same', text: 'd' },
      { kind: 'add', text: 'e' },
    ])
    expect(lineDiff('', 'x\ny')).toEqual([
      { kind: 'add', text: 'x' },
      { kind: 'add', text: 'y' },
    ])
  })

  it('handles insertions in the middle of long files', () => {
    const before = Array.from({ length: 200 }, (_, index) => `line ${index}`)
    const after = [...before.slice(0, 100), 'new', ...before.slice(100)]
    const lines = lineDiff(before.join('\n'), after.join('\n'))
    expect(lines.filter((line) => line.kind === 'add')).toEqual([{ kind: 'add', text: 'new' }])
    expect(lines.filter((line) => line.kind === 'del')).toEqual([])
  })

  it('groups changes into hunks with three lines of context and line numbers', () => {
    const before = Array.from({ length: 30 }, (_, index) => `${index + 1}`)
    const after = before.map((line) => (line === '5' ? 'five' : line === '25' ? 'twenty-five' : line))
    const hunks = toHunks(lineDiff(before.join('\n'), after.join('\n')))
    expect(hunks).toHaveLength(2)
    expect(hunks[0]).toMatchObject({ oldStart: 2, newStart: 2 })
    expect(hunks[0]!.lines.map((line) => `${line.kind}:${line.text}`)).toEqual(['same:2', 'same:3', 'same:4', 'del:5', 'add:five', 'same:6', 'same:7', 'same:8'])
    expect(hunks[1]).toMatchObject({ oldStart: 22, newStart: 22 })
    // 两处改动挨得近时并成一段。
    const close = before.map((line) => (line === '5' ? 'five' : line === '9' ? 'nine' : line))
    expect(toHunks(lineDiff(before.join('\n'), close.join('\n')))).toHaveLength(1)
  })
})

describe('item changes', () => {
  it('lists changed files with line counts, the manifest first', async () => {
    const { starterItem } = await import('@motif/agent')
    const { itemChanges } = await import('../src/lib/studio/diff')
    const before = starterItem('studio-test')
    const effect = before.manifest.entry.file
    const after = {
      manifest: { ...before.manifest, title: { ...before.manifest.title, en: 'Renamed' } },
      files: { ...before.files, [effect]: `${before.files[effect]}\n// tweak\n`, 'extra.ts': 'export const x = 1\n' },
    }
    const changes = itemChanges(before, after)
    expect(changes.map((change) => change.path)).toEqual(['item.json', effect, 'extra.ts'].sort((a, b) => (a === 'item.json' ? -1 : b === 'item.json' ? 1 : a.localeCompare(b))))
    expect(changes.find((change) => change.path === 'extra.ts')).toMatchObject({ status: 'added', added: 1, removed: 0 })
    expect(changes.find((change) => change.path === 'item.json')).toMatchObject({ status: 'modified', added: 1, removed: 1 })
    expect(itemChanges(before, before)).toEqual([])
  })
})
