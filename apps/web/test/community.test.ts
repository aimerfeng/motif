import path from 'node:path'
import { contentHash, motifCurationAbi, motifRegistryAbi, ROLES } from '@motif/contracts'
import { ITEMS_DIR, loadItemSource } from '@motif/registry'
import { encodeFunctionData, getAddress, parseEther, zeroHash } from 'viem'
import { describe, expect, it } from 'vitest'
import { sha256Hex, validateBlob } from '../src/lib/community/blobs'
import { HttpError } from '../src/lib/community/http'
import { decodeActions, splitDescription } from '../src/lib/community/proposals'
import { rateLimit } from '../src/lib/community/rate-limit'
import { formatMotif, parseProfileMetadata, uploadMessage } from '../src/lib/community/shared'
import { inspectSubmission, parseItemSource } from '../src/lib/community/submission'
import { relativeTime } from '../src/lib/community/time'

const CONTRACTS = {
  registry: getAddress('0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'),
  curation: getAddress('0x5FC8d32690cc91D4c39d9d3abcBD16989F875707'),
  identity: getAddress('0x5FbDB2315678afecb367f032d93F642f64180aa3'),
  governor: getAddress('0x0165878A594ca255338adfa4d48449f69242Eb8F'),
  token: getAddress('0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9'),
  timelock: getAddress('0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'),
}

describe('submission checks', () => {
  it('rejects bodies that are not item sources', () => {
    expect(parseItemSource(null)).toMatch(/manifest/)
    expect(parseItemSource({ manifest: {}, files: [] })).toMatch(/files/)
    expect(parseItemSource({ manifest: {}, files: {} })).toMatch(/1–80 files/)
    expect(parseItemSource({ manifest: {}, files: { 'a.ts': 1 } })).toMatch(/must be text/)
  })

  it('accepts a market item, compiles it in the worker and hashes it like the contracts package', async () => {
    const item = await loadItemSource(path.join(ITEMS_DIR, 'border-beam'))
    const report = await inspectSubmission(item)
    expect(report.findings.filter((finding) => finding.level === 'error')).toEqual([])
    expect(report.ok).toBe(true)
    expect(report.contentHash).toBe(await contentHash(item))
    expect(report.build?.js).toContain('export')
    expect(report.license).toBe('MIT')
  }, 60_000)

  it('lets community items use unregistered upstreams but still requires published status', async () => {
    const item = await loadItemSource(path.join(ITEMS_DIR, 'border-beam'))
    const upstream = { ...item.manifest.provenance.upstream!, source: 'someone-else', sha: 'a'.repeat(40) }
    const report = await inspectSubmission({
      manifest: { ...item.manifest, status: 'draft', provenance: { ...item.manifest.provenance, upstream } },
      files: item.files,
    })
    expect(report.findings.find((finding) => finding.rule === 'provenance/source')?.level).toBe('warning')
    expect(report.findings.find((finding) => finding.rule === 'community/status')?.level).toBe('error')
    expect(report.ok).toBe(false)
  }, 60_000)
})

describe('hosted text', () => {
  it('validates notes and profile metadata', () => {
    expect(validateBlob('note', 'looks great')).toBe('looks great')
    expect(() => validateBlob('note', '  ')).toThrow(HttpError)
    expect(() => validateBlob('note', 'x'.repeat(4001))).toThrow(/4000/)
    expect(validateBlob('profile', '{"name":"Ada","links":["https://example.com"]}')).toBeTruthy()
    expect(() => validateBlob('profile', '{"avatar":"x"}')).toThrow(/unknown profile fields/)
    expect(() => validateBlob('profile', '{"links":["javascript:alert(1)"]}')).toThrow(/invalid link/)
    expect(() => validateBlob('other', 'x')).toThrow(/kind/)
  })

  it('addresses text by its sha256', () => {
    expect(sha256Hex('abc')).toBe('0xba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
  })
})

describe('profile metadata read back from storage', () => {
  it('keeps only valid fields and http(s) links', () => {
    expect(parseProfileMetadata('{"name":"Ada","bio":"hi","links":["https://a.example","data:text/html,x","javascript:alert(1)"]}')).toEqual({
      name: 'Ada',
      bio: 'hi',
      links: ['https://a.example'],
    })
    expect(parseProfileMetadata('{"name":42,"links":"https://a.example"}')).toEqual({})
    expect(parseProfileMetadata('not json')).toEqual({})
    expect(parseProfileMetadata(null)).toEqual({})
  })
})

describe('rate limit', () => {
  it('allows the limit per minute and then refuses', () => {
    const request = new Request('http://localhost/api/community/check', { headers: { 'x-forwarded-for': '203.0.113.7' } })
    for (let i = 0; i < 3; i++) rateLimit(request, 'test-scope', 3)
    expect(() => rateLimit(request, 'test-scope', 3)).toThrow(/too many requests/)
    // 其他来源和其他接口各自计数。
    expect(() => rateLimit(new Request('http://localhost', { headers: { 'x-forwarded-for': '203.0.113.8' } }), 'test-scope', 3)).not.toThrow()
    expect(() => rateLimit(request, 'other-scope', 3)).not.toThrow()
  })
})

describe('proposals', () => {
  it('decodes calls to community contracts into readable actions', () => {
    const nominee = getAddress('0x14dC79964da2C08b23698B3D3cc7Ca32193d9955')
    const calldata = encodeFunctionData({ abi: motifCurationAbi, functionName: 'grantRole', args: [ROLES.curator, nominee] })
    const [action] = decodeActions({ targets: [CONTRACTS.curation], values: [0n], calldatas: [calldata] }, CONTRACTS)
    expect(action).toMatchObject({ contract: 'curation', fn: 'grantRole', args: ['CURATOR_ROLE', nominee] })
  })

  it('shows unknown targets as raw calls', () => {
    const [action] = decodeActions({ targets: [getAddress('0x0000000000000000000000000000000000000001')], values: [5n], calldatas: ['0x12345678'] }, CONTRACTS)
    expect(action).toMatchObject({ contract: null, fn: null, value: '5', calldata: '0x12345678' })
  })

  it('only names roles for role functions', () => {
    const data = encodeFunctionData({ abi: motifRegistryAbi, functionName: 'setDelisted', args: [1n, true, zeroHash] })
    const [action] = decodeActions({ targets: [CONTRACTS.registry], values: [0n], calldatas: [data] }, CONTRACTS)
    expect(action?.args).toEqual(['1', 'true', zeroHash])
  })

  it('takes the first line of the description as the title', () => {
    expect(splitDescription('# Fund rewards\n\nTop up the pool.')).toEqual({ title: 'Fund rewards', body: 'Top up the pool.' })
  })
})

describe('formatting', () => {
  it('formats MOTIF amounts', () => {
    expect(formatMotif(parseEther('1000'))).toBe('1,000')
    expect(formatMotif(parseEther('0.125'))).toBe('0.12')
  })

  it('formats chain times relative to the latest block', () => {
    expect(relativeTime(1000 + 7 * 86400, 1000, 'en')).toBe('in 7 days')
    expect(relativeTime(1000 - 7200, 1000, 'en')).toBe('2 hours ago')
  })

  it('keeps the upload message stable (wallets show it to the user)', () => {
    const hash = `0x${'ab'.repeat(32)}` as const
    expect(uploadMessage(hash, CONTRACTS.token)).toBe(
      `Motif 源码上传 / Motif source upload\n\n内容哈希 / Content hash: ${hash}\n上传者 / Uploader: ${CONTRACTS.token}`,
    )
  })
})
