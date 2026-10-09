'use client'

import { canonicalJson, motifIdentityAbi } from '@motif/contracts'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import type { Hex } from 'viem'
import { Link } from '@/i18n/navigation'
import { parseProfileMetadata, PROFILE_LIMITS, type ProfileMetadata } from '@/lib/community/shared'
import { ConnectGate } from './connect-gate'
import { useWriter } from './use-writer'
import { useCommunity } from './wallet'

// 与合约里 Slug.isValid(handle, 3, 32) 相同的规则，提交前就提示，不浪费一笔交易。
const HANDLE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const validHandle = (value: string) => value.length >= 3 && value.length <= 32 && HANDLE.test(value)

/** 注册或编辑创作者资料。handle 记在链上；名字、简介、链接是站点托管的 JSON，链上记它的 sha256。 */
export function ProfileEditor() {
  return (
    <ConnectGate>
      <Editor />
    </ConnectGate>
  )
}

function Editor() {
  const t = useTranslations('community.profileEditor')
  const { account, config, address } = useCommunity()
  const writer = useWriter()
  const [handle, setHandle] = useState('')
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [links, setLinks] = useState('')
  const [loadedFor, setLoadedFor] = useState<string | null>(null)
  const currentAddress = useRef<string | null>(null)
  useEffect(() => {
    currentAddress.current = account?.address ?? null
  })

  // 换了账户就清空表单，再载入这个账户现有的 handle 和资料，免得把上一个账户的资料存到新账户名下。
  useEffect(() => {
    if (!account || loadedFor === account.address) return
    setLoadedFor(account.address)
    setHandle(account.handle ?? '')
    setName('')
    setBio('')
    setLinks('')
    if (!account.metadataHash) return
    const address = account.address
    fetch(`/api/community/blobs/${account.metadataHash}`)
      .then((response) => (response.ok ? response.text() : null))
      .then((text) => {
        // 资料回来之前又换了账户：丢掉这份过期的结果。
        if (currentAddress.current !== address) return
        const metadata = parseProfileMetadata(text)
        setName(metadata.name ?? '')
        setBio(metadata.bio ?? '')
        setLinks((metadata.links ?? []).join('\n'))
      })
      .catch(() => {})
  }, [account, loadedFor])

  if (!account) return <p className="text-[14px] text-ink-faint">{t('loading')}</p>

  const linkList = links
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  const badLink = linkList.find((link) => !/^https?:\/\/\S+$/.test(link) || link.length > PROFILE_LIMITS.link)
  const handleError = handle && !validHandle(handle) ? t('handleRule') : null
  const valid = validHandle(handle) && !badLink && linkList.length <= PROFILE_LIMITS.links

  const save = () =>
    writer.run(async ({ write }) => {
      const metadata: ProfileMetadata = {}
      if (name.trim()) metadata.name = name.trim()
      if (bio.trim()) metadata.bio = bio.trim()
      if (linkList.length > 0) metadata.links = linkList
      // 规范化后再托管：同样的资料永远得到同样的哈希。
      const response = await fetch('/api/community/blobs', { method: 'POST', body: JSON.stringify({ kind: 'profile', text: canonicalJson(metadata) }) })
      const json = (await response.json()) as { hash?: Hex; error?: string }
      if (!response.ok || !json.hash) throw new Error(json.error ?? response.statusText)
      const identity = config!.contracts.identity
      if (!account.registered) {
        await write({ address: identity, abi: motifIdentityAbi, functionName: 'register', args: [handle, json.hash] })
        return
      }
      if (handle !== account.handle) await write({ address: identity, abi: motifIdentityAbi, functionName: 'changeHandle', args: [handle] })
      if (json.hash !== account.metadataHash) await write({ address: identity, abi: motifIdentityAbi, functionName: 'updateMetadata', args: [json.hash] })
    })

  const field = 'w-full rounded-lg border border-line bg-sunken px-3 py-2 text-[14px] placeholder:text-ink-faint focus:border-line-strong focus:outline-none'
  return (
    <form
      className="max-w-xl space-y-6"
      onSubmit={(event) => {
        event.preventDefault()
        void save()
      }}
    >
      <label className="block">
        <span className="text-[13.5px] font-medium">{t('handle')}</span>
        <span className="mt-1 block text-[12.5px] text-ink-faint">{account.registered ? t('handleChangeHint') : t('handleHint')}</span>
        <span className="mt-2 flex items-center rounded-lg border border-line bg-sunken focus-within:border-line-strong">
          <span className="pl-3 text-ink-faint">@</span>
          <input
            value={handle}
            onChange={(event) => setHandle(event.target.value.toLowerCase())}
            maxLength={32}
            required
            spellCheck={false}
            autoComplete="off"
            data-testid="profile-handle"
            className="w-full bg-transparent px-1.5 py-2 font-mono text-[14px] focus:outline-none"
          />
        </span>
        {handleError && <span className="mt-1.5 block text-[12.5px] text-danger">{handleError}</span>}
      </label>
      <label className="block">
        <span className="text-[13.5px] font-medium">{t('name')}</span>
        <input value={name} onChange={(event) => setName(event.target.value.slice(0, PROFILE_LIMITS.name))} className={`mt-2 ${field}`} data-testid="profile-name" />
      </label>
      <label className="block">
        <span className="text-[13.5px] font-medium">{t('bio')}</span>
        <textarea value={bio} onChange={(event) => setBio(event.target.value.slice(0, PROFILE_LIMITS.bio))} rows={3} className={`mt-2 resize-y ${field}`} />
        <span className="mt-1 block text-right text-[12px] text-ink-faint tabular-nums">
          {bio.length}/{PROFILE_LIMITS.bio}
        </span>
      </label>
      <label className="block">
        <span className="text-[13.5px] font-medium">{t('links')}</span>
        <span className="mt-1 block text-[12.5px] text-ink-faint">{t('linksHint', { max: PROFILE_LIMITS.links })}</span>
        <textarea value={links} onChange={(event) => setLinks(event.target.value)} rows={3} placeholder="https://" className={`mt-2 resize-y font-mono text-[13px] ${field}`} />
        {badLink && <span className="mt-1.5 block text-[12.5px] text-danger">{t('badLink', { link: badLink })}</span>}
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={!valid || writer.busy}
          data-testid="profile-save"
          className="rounded-full bg-ink px-5 py-2 text-[14px] font-medium text-canvas transition-opacity duration-150 hover:opacity-90 disabled:opacity-40"
        >
          {writer.busy ? t(`phase.${writer.phase as 'signing' | 'pending' | 'syncing'}`) : account.registered ? t('save') : t('register')}
        </button>
        {writer.phase === 'done' && address && (
          <Link href={`/community/u/${handle || address}`} className="text-[13.5px] text-ink-muted underline decoration-line-strong underline-offset-4 hover:text-ink">
            {t('saved')}
          </Link>
        )}
      </div>
      {writer.error && (
        <p role="alert" className="text-[13px] text-danger">
          {writer.error}
        </p>
      )}
      <p className="text-[12.5px] leading-relaxed text-ink-faint">{t('publicNote')}</p>
    </form>
  )
}
