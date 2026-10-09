'use client'

import type { JsonValue, L10n, ParamSpec } from '@motif/schema/core'
import { useLocale, useMessages, useTranslations } from 'next-intl'
import type { Locale } from '@/i18n/routing'
import { useCopy } from '@/lib/clipboard'
import {
  BooleanControl,
  ColorControl,
  EasingControl,
  NumberControl,
  PaletteControl,
  SeedControl,
  SelectControl,
  SpringControl,
  TextControl,
  Vec2Control,
} from './controls'
import type { TunePreset, TuneState } from './use-tune'

/** 调参面板：预设、分组的控件、重置与分享。所有控件都由参数定义自动生成（零代码）。 */
export function TunePanel({ params, presets, tune }: { params: readonly ParamSpec[]; presets: TunePreset[]; tune: TuneState }) {
  const t = useTranslations('tune')
  const locale = useLocale() as Locale
  // 分组名来自文案；条目里出现了文案没有的分组（比如 Studio 生成的）时，退回首字母大写的键名。
  const groupNames: Record<string, string> = useMessages().tune.groups
  const { copy, stateOf } = useCopy()
  const text = (value: L10n | undefined) => value?.[locale]

  // 保持参数定义的顺序；没有分组的放在最前面。
  const groups: { key: string; params: ParamSpec[] }[] = []
  for (const param of params) {
    const key = param.group ?? ''
    let group = groups.find((candidate) => candidate.key === key)
    if (!group) {
      group = { key, params: [] }
      if (key === '') groups.unshift(group)
      else groups.push(group)
    }
    group.params.push(param)
  }
  const groupTitle = (key: string) => groupNames[key] ?? key.charAt(0).toUpperCase() + key.slice(1)

  const shareState = stateOf('share')
  const control = (param: ParamSpec) => {
    const common = {
      label: text(param.label) ?? param.key,
      hint: text(param.hint),
      value: tune.values[param.key] ?? param.default,
      changed: JSON.stringify(tune.values[param.key]) !== JSON.stringify(tune.defaults[param.key]),
      onChange: (value: JsonValue) => tune.set(param.key, value),
      onReset: () => tune.reset(param.key),
    }
    switch (param.type) {
      case 'number':
        return <NumberControl param={param} {...common} />
      case 'color':
        return <ColorControl param={param} {...common} />
      case 'palette':
        return <PaletteControl param={param} {...common} addLabel={t('addColor')} removeLabel={t('removeColor')} />
      case 'select':
        return (
          <SelectControl
            param={param}
            {...common}
            optionLabel={(value) => text(param.options.find((option) => option.value === value)?.label) ?? value}
          />
        )
      case 'boolean':
        return <BooleanControl param={param} {...common} />
      case 'text':
        return <TextControl param={param} {...common} />
      case 'easing':
        return <EasingControl param={param} {...common} />
      case 'spring':
        return <SpringControl param={param} {...common} durationLabel={t('springDuration')} bounceLabel={t('springBounce')} />
      case 'vec2':
        return <Vec2Control param={param} {...common} />
      case 'seed':
        return <SeedControl param={param} {...common} shuffleLabel={t('shuffle')} />
    }
  }

  return (
    <section aria-label={t('title')} className="rounded-[var(--radius-card)] border border-line bg-raised/60" data-testid="tune-panel">
      <header className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
        <h2 className="text-[13px] font-medium">{t('title')}</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => tune.reset()}
            disabled={!tune.changed}
            className="rounded-md px-2 py-1 text-[12px] text-ink-muted transition-colors duration-150 hover:bg-white/5 hover:text-ink disabled:opacity-35 disabled:hover:bg-transparent"
          >
            {t('reset')}
          </button>
          <button
            type="button"
            onClick={() => void copy('share', tune.shareUrl())}
            className={`rounded-md px-2 py-1 text-[12px] transition-colors duration-150 hover:bg-white/5 hover:text-ink ${shareState === 'failed' ? 'text-danger' : 'text-ink-muted'}`}
          >
            <span aria-live="polite">{shareState === 'copied' ? t('linkCopied') : shareState === 'failed' ? t('copyFailed') : t('share')}</span>
          </button>
        </div>
      </header>

      {presets.length > 0 && (
        <div className="border-b border-line px-4 py-3">
          <p className="mb-2 text-[11.5px] text-ink-faint">{t('presets')}</p>
          <div className="flex flex-wrap gap-1.5" data-testid="presets">
            <PresetChip active={tune.activePreset === null && !tune.changed} onClick={() => tune.applyPreset(null)}>
              {t('defaultPreset')}
            </PresetChip>
            {presets.map((preset) => (
              <PresetChip key={preset.id} active={tune.activePreset === preset.id} onClick={() => tune.applyPreset(preset.id)}>
                {preset.name}
              </PresetChip>
            ))}
          </div>
        </div>
      )}

      <div className="overscroll-contain lg:max-h-[min(640px,calc(100dvh-220px))] lg:overflow-y-auto">
        {groups.map((group) => (
          <fieldset key={group.key || 'main'} className="space-y-4 border-b border-line px-4 py-4 last:border-b-0">
            {group.key && <legend className="float-left mb-1 w-full text-[11px] tracking-wide text-ink-faint">{groupTitle(group.key)}</legend>}
            {group.params.map((param) => (
              <div key={param.key} className="clear-both">
                {control(param)}
              </div>
            ))}
          </fieldset>
        ))}
      </div>
    </section>
  )
}

function PresetChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="rounded-full border border-line px-2.5 py-1 text-[12px] text-ink-muted transition-colors duration-150 hover:border-line-strong hover:text-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-canvas"
    >
      {children}
    </button>
  )
}
