// SPDX-License-Identifier: MIT
// Copyright (c) 2025 coss.com
// Originally Copyright (c) 2025 Origin UI
// Source: https://github.com/origin-space/originui/blob/fe6ffa8/apps/origin/registry/default/hooks/use-character-limit.ts
// Modified by Motif; see the item's provenance.
import { type ChangeEvent, useState } from 'react'

type UseCharacterLimitProps = {
  maxLength: number
  initialValue?: string
}

export function useCharacterLimit({ maxLength, initialValue = '' }: UseCharacterLimitProps) {
  const [value, setValue] = useState(initialValue)
  const [characterCount, setCharacterCount] = useState(initialValue.length)

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value
    if (newValue.length <= maxLength) {
      setValue(newValue)
      setCharacterCount(newValue.length)
    }
  }

  return {
    characterCount,
    handleChange,
    maxLength,
    value,
  }
}
