'use client'

import { motifCurationAbi, motifTokenAbi, versionInput } from '@motif/contracts'
import { defaultsOf, type ItemSource } from '@motif/schema/core'
import { useTranslations } from 'next-intl'
import { useEffect, useState, type DragEvent } from 'react'
import { PreviewFrame, type PreviewStatus } from '@/components/preview-frame'
import { Link, useRouter } from '@/i18n/navigation'
import { formatMotif, shortAddress, uploadMessage } from '@/lib/community/shared'
import { ConnectGate } from './connect-gate'
import { useWriter } from './use-writer'
import { useCommunity } from './wallet'

interface Finding {
  level: 'error' | 'warning'
  rule: string
  message: string
  file?: string
}

interface Report {
  ok: boolean
  findings: Finding[]
  contentHash: `0x${string}` | null
  slug: string | null
  title: { 'zh-CN': string; en: string } | null
  license: string
  upstream: { repo: string; sha: string } | null
  basedOn: string | null
  build: { js: string; css: string } | null
}

interface Registration {
  registered: boolean
  itemId?: string
  maintainer?: `0x${string}`
  delisted?: boolean
  version?: number | null
  pending?: boolean
  nextVersion?: number
}

type Target =
  | { kind: 'new' }
  | { kind: 'version'; itemId: bigint; version: number }
  | { kind: 'blocked'; reason: 'taken' | 'pending' | 'delisted'; maintainer?: string }

async function lookup(slug: string): Promise<Registration> {
  const response = await fetch(`/api/community/registry/${encodeURIComponent(slug)}`, { cache: 'no-store' })
  return (await response.json()) as Registration
}

/** 投稿：选文件 → 预检和预览 → 签名上传源码 → 授权押金 → 上链。 */
/** initial：从工作台（/community/submit?studio=<会话>）带过来的条目，进页面就预检。 */
export function SubmitFlow({ locale, paused, initial = null }: { locale: 'zh-CN' | 'en'; paused: boolean; initial?: ItemSource | null }) {
  const t = useTranslations('community.submit')
  const { address, account, config, walletClient } = useCommunity()
  const router = useRouter()
  const writer = useWriter()
  const [item, setItem] = useState<ItemSource | null>(null)
  const [report, setReport] = useState<Report | null>(null)
  const [registration, setRegistration] = useState<Registration | null>(null)
  const [parent, setParent] = useState<Registration | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<PreviewStatus>({ state: 'loading' })

  const load = async (file: File) => {
    let parsed: ItemSource
    try {
      parsed = JSON.parse(await file.text()) as ItemSource
    } catch {
      setReport(null)
      setItem(null)
      setLoadError(t('notJson'))
      return
    }
    await check(parsed)
  }

  // 从工作台带过来的条目：进页面就直接预检，不用先下载再拖进来。
  useEffect(() => {
    if (initial) void check(initial)
    // 只在进入页面时执行一次。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function check(parsed: ItemSource) {
    setLoadError(null)
    setReport(null)
    setItem(null)
    writer.reset()
    setChecking(true)
    try {
      const response = await fetch('/api/community/check', { method: 'POST', body: JSON.stringify(parsed) })
      const json = (await response.json()) as Report & { error?: string }
      if (!response.ok) throw new Error(json.error ?? response.statusText)
      setItem(parsed)
      setReport(json)
      const [own, base] = await Promise.all([json.slug ? lookup(json.slug) : null, json.basedOn ? lookup(json.basedOn) : null])
      setRegistration(own)
      setParent(base)
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : String(error))
    } finally {
      setChecking(false)
    }
  }

  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    setDragging(false)
    const file = event.dataTransfer.files[0]
    if (file) void load(file)
  }

  // 新条目、某条目的新版本，或者不能提交（slug 被别人占用、上一个版本还在审、条目已下架）。
  let target: Target = { kind: 'new' }
  if (registration?.registered) {
    if (registration.maintainer !== address) target = { kind: 'blocked', reason: 'taken', ...(registration.maintainer ? { maintainer: registration.maintainer } : {}) }
    else if (registration.delisted) target = { kind: 'blocked', reason: 'delisted' }
    else if (registration.pending) target = { kind: 'blocked', reason: 'pending' }
    else target = { kind: 'version', itemId: BigInt(registration.itemId!), version: registration.nextVersion! }
  }
  const parentMissing = Boolean(report?.basedOn) && !(parent?.registered && parent.version)

  const submit = async () => {
    if (!item || !report?.contentHash || !address || !walletClient || !config || !account) return
    const succeeded = await writer.run(async ({ write }) => {
      // 浏览器自己再算一遍内容哈希：链上登记的必须就是这里看到、预览过的这一份。
      const input = await versionInput(item)
      if (input.contentHash !== report.contentHash) throw new Error(t('hashMismatch'))
      setUploading(true)
      try {
        const signature = await walletClient.signMessage({ account: address, message: uploadMessage(report.contentHash!, address) })
        const response = await fetch('/api/community/sources', { method: 'POST', body: JSON.stringify({ item, uploader: address, signature }) })
        if (!response.ok) throw new Error(((await response.json()) as { error?: string }).error ?? response.statusText)
      } finally {
        setUploading(false)
      }
      if (account.allowance < account.bond) {
        await write({ address: config.contracts.token, abi: motifTokenAbi, functionName: 'approve', args: [config.contracts.curation, account.bond] })
      }
      if (target.kind === 'version') {
        await write({ address: config.contracts.curation, abi: motifCurationAbi, functionName: 'submitVersion', args: [target.itemId, input] })
      } else {
        const parentId = parent?.registered ? BigInt(parent.itemId!) : 0n
        const parentVersion = parent?.registered ? (parent.version ?? 0) : 0
        await write({ address: config.contracts.curation, abi: motifCurationAbi, functionName: 'submit', args: [report.slug!, parentId, parentVersion, input] })
      }
    })
    // 签名被拒或交易失败时留在本页显示错误，不要跳走。
    if (!succeeded) return
    const registered = await lookup(report.slug!)
    if (registered.registered) router.push(`/community/items/${registered.itemId}${target.kind === 'version' ? `?v=${target.version}` : ''}`)
  }

  const errors = report?.findings.filter((finding) => finding.level === 'error') ?? []
  const warnings = report?.findings.filter((finding) => finding.level === 'warning') ?? []
  const lowBalance = account ? account.balance < account.bond : false
  const canSubmit = Boolean(report?.ok) && target.kind !== 'blocked' && !parentMissing && !lowBalance && !paused && !writer.busy && !uploading

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0">
        <label
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          data-dragging={dragging || undefined}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-card)] border border-dashed border-line-strong bg-sunken px-6 py-10 text-center transition-colors duration-150 hover:border-ink-faint data-dragging:border-focus"
        >
          <span className="text-[15px] font-medium">{checking ? t('checking') : item ? t('replace') : t('drop')}</span>
          <span className="text-[13px] text-ink-faint">{t('dropHint')}</span>
          <input
            type="file"
            accept=".json,application/json"
            className="sr-only"
            data-testid="submit-file"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void load(file)
              event.target.value = ''
            }}
          />
        </label>
        {loadError && (
          <p role="alert" className="mt-4 text-[13.5px] text-danger">
            {loadError}
          </p>
        )}

        {report && item && (
          <div className="mt-8" data-testid="submit-report">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <h2 className="font-display text-[28px] leading-tight font-semibold tracking-[-0.02em]">{report.title?.[locale] ?? report.slug ?? t('untitled')}</h2>
              <span className={`text-[13px] ${report.ok ? 'text-success' : 'text-danger'}`}>{report.ok ? t('passed') : t('failed', { count: errors.length })}</span>
            </div>
            {report.build && (
              <div className="relative mt-5 aspect-[16/10] overflow-hidden rounded-[var(--radius-card)] border border-line bg-sunken">
                <PreviewFrame
                  title={report.title?.[locale] ?? ''}
                  module={{ kind: 'code', code: report.build.js }}
                  styles={{ kind: 'text', text: report.build.css }}
                  exportName={item.manifest.demo.export}
                  theme={item.manifest.demo.theme}
                  props={defaultsOf(item.manifest.params)}
                  onStatus={setPreview}
                  className="absolute inset-0 size-full"
                />
                {preview.state === 'error' && (
                  <p role="alert" className="absolute inset-x-0 bottom-0 bg-sunken/90 p-3 text-[12.5px] text-danger">
                    {preview.message}
                  </p>
                )}
              </div>
            )}
            <dl className="mt-6 grid grid-cols-[max-content_1fr] gap-x-8 gap-y-2.5 text-[13.5px]">
              <dt className="text-ink-faint">{t('facts.slug')}</dt>
              <dd className="font-mono text-[12.5px]">{report.slug}</dd>
              <dt className="text-ink-faint">{t('facts.license')}</dt>
              <dd>{report.license}</dd>
              {report.upstream && (
                <>
                  <dt className="text-ink-faint">{t('facts.upstream')}</dt>
                  <dd>
                    {report.upstream.repo} <span className="font-mono text-[12px] text-ink-faint">{report.upstream.sha.slice(0, 7)}</span>
                  </dd>
                </>
              )}
              <dt className="text-ink-faint">{t('facts.hash')}</dt>
              <dd className="font-mono text-[12px] break-all text-ink-muted" data-testid="submit-hash">
                {report.contentHash}
              </dd>
              {report.basedOn && (
                <>
                  <dt className="text-ink-faint">{t('facts.remixOf')}</dt>
                  <dd>
                    {parentMissing ? (
                      <span className="text-danger">{t('parentMissing', { slug: report.basedOn })}</span>
                    ) : (
                      <Link href={`/community/items/${parent!.itemId}`} className="underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                        {report.basedOn} v{parent!.version}
                      </Link>
                    )}
                  </dd>
                </>
              )}
            </dl>
            {(errors.length > 0 || warnings.length > 0) && (
              <ul className="mt-6 space-y-2 text-[13px]" data-testid="submit-findings">
                {[...errors, ...warnings].map((finding, index) => (
                  <li key={index} className={`rounded-lg border px-3 py-2 ${finding.level === 'error' ? 'border-danger/30 text-danger' : 'border-line text-ink-muted'}`}>
                    <span className="font-mono text-[11.5px] opacity-80">[{finding.rule}]</span> {finding.file && <span className="font-mono text-[11.5px]">{finding.file} </span>}
                    {finding.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-[var(--radius-card)] border border-line p-5">
          <h2 className="text-[15px] font-medium">{t('panel.title')}</h2>
          {!report ? (
            <p className="mt-3 text-[13.5px] leading-relaxed text-ink-muted">{t('panel.waiting')}</p>
          ) : (
            <div className="mt-4 space-y-4 text-[13.5px]">
              <ConnectGate compact>
                {target.kind === 'blocked' ? (
                  <p className="text-danger">
                    {t(`blocked.${target.reason}`, { maintainer: target.kind === 'blocked' && target.maintainer ? shortAddress(target.maintainer) : '' })}
                  </p>
                ) : (
                  <p className="text-ink-muted">{target.kind === 'version' ? t('panel.asVersion', { version: target.version }) : t('panel.asNew')}</p>
                )}
                {account && (
                  <dl className="mt-4 grid grid-cols-[1fr_auto] gap-y-2 border-t border-line pt-4">
                    <dt className="text-ink-faint">{t('panel.bond')}</dt>
                    <dd className="tabular-nums">{formatMotif(account.bond)} MOTIF</dd>
                    <dt className="text-ink-faint">{t('panel.balance')}</dt>
                    <dd className={`tabular-nums ${lowBalance ? 'text-danger' : ''}`}>{formatMotif(account.balance)} MOTIF</dd>
                  </dl>
                )}
                {lowBalance && <p className="mt-3 text-[12.5px] text-danger">{config?.local ? t('panel.lowBalanceLocal') : t('panel.lowBalance')}</p>}
                {paused && <p className="mt-3 text-[12.5px] text-danger">{t('panel.paused')}</p>}
                <button
                  type="button"
                  onClick={() => void submit()}
                  disabled={!canSubmit}
                  data-testid="submit-button"
                  className="mt-5 w-full rounded-full bg-ink px-4 py-2 text-[14px] font-medium text-canvas transition-opacity duration-150 hover:opacity-90 disabled:opacity-40"
                >
                  {uploading ? t('phase.uploading') : writer.busy ? t(`phase.${writer.phase}`) : t('panel.submit')}
                </button>
                <p className="mt-3 text-[12px] leading-relaxed text-ink-faint">{t('panel.steps')}</p>
                {writer.error && (
                  <p role="alert" className="mt-3 text-[12.5px] text-danger">
                    {writer.error}
                  </p>
                )}
              </ConnectGate>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
