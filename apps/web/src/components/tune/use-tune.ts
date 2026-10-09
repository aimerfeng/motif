'use client'

import type { JsonValue, ParamSpec, ParamValues } from '@motif/schema/core'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { decodeValues, encodeValues } from '@/lib/share'
import { replaceUrl, URL_WRITE_DELAY_MS } from '@/lib/url-state'

export interface TunePreset {
  id: string
  name: string
  values: ParamValues
}

export interface TuneState {
  values: ParamValues
  defaults: ParamValues
  /** 当前值正好是哪个预设（由值推出来，刷新或打开分享链接后也对得上）；不是任何预设时为 null。 */
  activePreset: string | null
  changed: boolean
  set: (key: string, value: JsonValue) => void
  reset: (key?: string) => void
  applyPreset: (id: string | null) => void
  /** 当前参数的分享链接（只含改动过的值）。 */
  shareUrl: () => string
  encoded: string
}

const HASH_KEY = 'v'

function readHash(params: readonly ParamSpec[], defaults: ParamValues): ParamValues | null {
  const encoded = new URLSearchParams(window.location.hash.slice(1)).get(HASH_KEY)
  return encoded ? decodeValues(encoded, params, defaults) : null
}

/** 调参状态：当前值、预设、重置，并与 URL hash（#v=…）双向同步，刷新和分享都能还原。 */
export function useTune(params: readonly ParamSpec[], defaults: ParamValues, presets: TunePreset[]): TuneState {
  const [values, setValues] = useState<ParamValues>(defaults)
  // 最近点过的预设：两个预设（或预设和默认值）完全相同时，用它决定高亮哪一个。
  const [picked, setPicked] = useState<string | null>(null)
  const hydrated = useRef(false)

  // 首次挂载时从 hash 还原（服务端渲染时没有 hash，所以放在 effect 里）；
  // 在同一个标签页里粘贴另一条分享链接只会触发 hashchange，也要跟着还原。
  useEffect(() => {
    const restore = () => setValues(readHash(params, defaults) ?? defaults)
    const initial = readHash(params, defaults)
    if (initial) setValues(initial)
    hydrated.current = true
    window.addEventListener('hashchange', restore)
    return () => window.removeEventListener('hashchange', restore)
  }, [params, defaults])

  const encoded = useMemo(() => encodeValues(values, defaults), [values, defaults])

  // 值变化后更新 hash：拖滑杆时变化很密，停下来再写。
  useEffect(() => {
    if (!hydrated.current) return
    const timer = window.setTimeout(() => {
      replaceUrl((url) => {
        url.hash = encoded ? `${HASH_KEY}=${encoded}` : ''
      })
    }, URL_WRITE_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [encoded])

  const presetCodes = useMemo(() => presets.map((preset) => ({ id: preset.id, code: encodeValues({ ...defaults, ...preset.values }, defaults) })), [presets, defaults])
  const activePreset = useMemo(() => {
    const matches = presetCodes.filter((preset) => preset.code === encoded).map((preset) => preset.id)
    if (picked && matches.includes(picked)) return picked
    // 和默认值一样时算「默认」，除非刚点的就是一个等于默认值的预设（上面已处理）。
    return encoded === '' ? null : (matches[0] ?? null)
  }, [presetCodes, encoded, picked])

  const set = useCallback((key: string, value: JsonValue) => {
    setValues((current) => ({ ...current, [key]: value }))
  }, [])

  const reset = useCallback(
    (key?: string) => {
      if (key === undefined) {
        setValues(defaults)
        setPicked(null)
        return
      }
      setValues((current) => ({ ...current, [key]: defaults[key]! }))
    },
    [defaults],
  )

  const applyPreset = useCallback(
    (id: string | null) => {
      const preset = presets.find((candidate) => candidate.id === id)
      setValues(preset ? { ...defaults, ...preset.values } : defaults)
      setPicked(preset ? preset.id : null)
    },
    [defaults, presets],
  )

  const shareUrl = useCallback(() => {
    const url = new URL(window.location.href)
    url.hash = encoded ? `${HASH_KEY}=${encoded}` : ''
    return url.toString()
  }, [encoded])

  return { values, defaults, activePreset, changed: encoded !== '', set, reset, applyPreset, shareUrl, encoded }
}
