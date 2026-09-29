'use client'

import type { JsonValue, ParamSpec, ParamValues } from '@motif/schema'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { decodeValues, encodeValues } from '@/lib/share'

export interface TunePreset {
  id: string
  name: string
  values: ParamValues
}

export interface TuneState {
  values: ParamValues
  defaults: ParamValues
  presetId: string | null
  changed: boolean
  set: (key: string, value: JsonValue) => void
  reset: (key?: string) => void
  applyPreset: (id: string | null) => void
  /** 当前参数的分享链接（只含改动过的值）。 */
  shareUrl: () => string
  encoded: string
}

const HASH_KEY = 'v'

/** 调参状态：当前值、预设、重置，并与 URL hash（#v=…）双向同步，刷新和分享都能还原。 */
export function useTune(params: readonly ParamSpec[], defaults: ParamValues, presets: TunePreset[]): TuneState {
  const [values, setValues] = useState<ParamValues>(defaults)
  const [presetId, setPresetId] = useState<string | null>(null)
  const hydrated = useRef(false)

  // 首次挂载时从 hash 还原（服务端渲染时没有 hash，所以放在 effect 里）。
  useEffect(() => {
    const encoded = new URLSearchParams(window.location.hash.slice(1)).get(HASH_KEY)
    if (encoded) setValues(decodeValues(encoded, params, defaults))
    hydrated.current = true
  }, [params, defaults])

  const encoded = useMemo(() => encodeValues(values, defaults), [values, defaults])

  // 值变化后更新 hash，不产生历史记录。
  useEffect(() => {
    if (!hydrated.current) return
    const url = new URL(window.location.href)
    url.hash = encoded ? `${HASH_KEY}=${encoded}` : ''
    window.history.replaceState(window.history.state, '', url)
  }, [encoded])

  const set = useCallback((key: string, value: JsonValue) => {
    setValues((current) => ({ ...current, [key]: value }))
    setPresetId(null)
  }, [])

  const reset = useCallback(
    (key?: string) => {
      if (key === undefined) {
        setValues(defaults)
        setPresetId(null)
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
      setPresetId(preset ? preset.id : null)
    },
    [defaults, presets],
  )

  const shareUrl = useCallback(() => {
    const url = new URL(window.location.href)
    url.hash = encoded ? `${HASH_KEY}=${encoded}` : ''
    return url.toString()
  }, [encoded])

  return { values, defaults, presetId, changed: encoded !== '', set, reset, applyPreset, shareUrl, encoded }
}
