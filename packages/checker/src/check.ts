import { defaultsOf, findDefaultsRegion, ItemManifestSchema, printDefaults, type ItemSource } from '@motif/schema'

export interface Finding {
  level: 'error' | 'warning'
  rule: string
  message: string
  file?: string
}

/** sources/sources.json 里登记的一个上游仓库。 */
export interface SourceRecord {
  id: string
  repo: string
  sha: string
  spdx: string
  copyright: string[]
  /** 只有这些目录可以整合（仓库其余部分是别的许可证）。 */
  pathPrefixes?: string[]
}

export interface CheckContext {
  sources: readonly SourceRecord[]
  vendorIds: readonly string[]
  /** 可用字体的 font-family 名。 */
  fonts?: readonly string[]
}

/** 不能出现在条目代码里的内容：外部 CDN / 统计脚本（国内不可达、会外传数据），以及许可证不允许的来源。 */
const BANNED: { pattern: RegExp; rule: string; message: string }[] = [
  { pattern: /lygia/i, rule: 'license/lygia', message: 'lygia uses the non-commercial Prosperity license and cannot be integrated' },
  { pattern: /shadertoy\.com/i, rule: 'license/shadertoy', message: 'code derived from Shadertoy defaults to CC BY-NC-SA and cannot be integrated' },
  {
    pattern: /https?:\/\/(?:[\w-]+\.)*(?:jsdelivr\.net|unpkg\.com|cdnjs\.cloudflare\.com|esm\.sh|skypack\.dev|googleapis\.com|gstatic\.com|cloudflareinsights\.com|cdn\.tailwindcss\.com)/i,
    rule: 'network/cdn',
    message: 'items must not load anything from external CDNs; vendor modules come from the sandbox import map',
  },
  { pattern: /\bfetch\s*\(\s*['"`]https?:/i, rule: 'network/fetch', message: 'items must not call external URLs' },
]

const IMPORT_PATTERN = /(?:^|[\s;])(?:import|export)\s+(?:[^'"`;]*?\s+from\s+)?['"]([^'"]+)['"]|\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g
const CODE_FILE = /\.(tsx?|jsx?)$/
const LICENSED_ROLES = new Set(['component', 'lib', 'shader', 'style'])

/** 收集一个文件里的所有导入说明符。 */
export function importsOf(code: string): string[] {
  const found: string[] = []
  for (const match of code.matchAll(IMPORT_PATTERN)) found.push((match[1] ?? match[2])!)
  return found
}

/**
 * 检查一个条目：清单合法、默认值区域与参数一致、依赖都在沙箱里、来源与许可证头完整、没有禁用内容。
 * 纯函数：不读文件系统，市场构建和 Studio 里 agent 每次写文件都用它。
 */
export function checkItem(item: ItemSource, context: CheckContext): Finding[] {
  const findings: Finding[] = []
  const add = (finding: Finding) => findings.push(finding)

  const parsed = ItemManifestSchema.safeParse(item.manifest)
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      add({ level: 'error', rule: 'manifest', message: `${issue.path.join('.') || '(root)'}: ${issue.message}` })
    }
    return findings
  }
  const manifest = parsed.data

  for (const file of manifest.files) {
    if (!(file.path in item.files)) add({ level: 'error', rule: 'files/missing', file: file.path, message: 'listed in the manifest but missing' })
  }
  for (const path of Object.keys(item.files)) {
    if (!manifest.files.some((file) => file.path === path)) add({ level: 'error', rule: 'files/unlisted', file: path, message: 'not listed in the manifest' })
  }

  // 默认值区域必须和参数定义完全一致（它由 printDefaults 生成）。
  const entrySource = item.files[manifest.entry.file]
  if (entrySource !== undefined) {
    const region = findDefaultsRegion(entrySource)
    const expected = printDefaults(defaultsOf(manifest.params))
    if (typeof region === 'string') {
      add({ level: 'error', rule: 'defaults/region', file: manifest.entry.file, message: region })
    } else if (region.text !== expected) {
      add({
        level: 'error',
        rule: 'defaults/mismatch',
        file: manifest.entry.file,
        message: 'the defaults region does not match the params in item.ts; regenerate it with printDefaults(defaultsOf(params))',
      })
    }
  }

  // 依赖：裸模块必须在 vendor 清单里，且与清单里声明的 dependencies 一致。
  const vendor = new Set(context.vendorIds)
  const used = new Set<string>()
  for (const [path, code] of Object.entries(item.files)) {
    if (!CODE_FILE.test(path)) continue
    for (const specifier of importsOf(code)) {
      if (specifier.startsWith('.')) continue
      if (!vendor.has(specifier)) {
        add({ level: 'error', rule: 'deps/unavailable', file: path, message: `"${specifier}" is not available in the sandbox` })
        continue
      }
      if (specifier !== 'react' && specifier !== 'react/jsx-runtime' && specifier !== 'react-dom') used.add(specifier)
    }
  }
  const declared = new Set(manifest.dependencies)
  for (const dep of used) {
    if (!declared.has(dep)) add({ level: 'error', rule: 'deps/undeclared', message: `"${dep}" is imported but not listed in dependencies` })
  }
  for (const dep of declared) {
    if (!used.has(dep)) add({ level: 'warning', rule: 'deps/unused', message: `"${dep}" is listed in dependencies but never imported` })
  }

  // 字体：声明的字体必须在字体清单里；代码里用到清单中的字体却没声明时提醒（导出时会漏装）。
  if (context.fonts) {
    const available = new Set(context.fonts)
    const declared = new Set(manifest.fonts ?? [])
    for (const family of declared) {
      if (!available.has(family)) add({ level: 'error', rule: 'fonts/unavailable', message: `font "${family}" is not in the Motif font list` })
    }
    const code = Object.values(item.files).join('\n')
    for (const family of available) {
      if (!declared.has(family) && code.includes(family)) add({ level: 'error', rule: 'fonts/undeclared', message: `font "${family}" is used but not listed in fonts` })
    }
  }

  // 来源：上游条目必须对应登记过的仓库和提交，每个代码文件带 SPDX 与版权头。
  const upstream = manifest.provenance.upstream
  if (upstream) {
    const source = context.sources.find((record) => record.id === upstream.source)
    if (!source) {
      add({ level: 'error', rule: 'provenance/source', message: `source "${upstream.source}" is not registered in sources/sources.json` })
    } else {
      if (source.sha !== upstream.sha) add({ level: 'error', rule: 'provenance/sha', message: `sha differs from the pinned ${source.sha.slice(0, 7)}` })
      if (source.spdx !== upstream.spdx) add({ level: 'error', rule: 'provenance/spdx', message: `spdx ${upstream.spdx} differs from the registered ${source.spdx}` })
      // 仓库只有部分目录是宽松许可时（例如 coss 只有 apps/origin/ 是 MIT），上游路径必须落在这些目录里。
      if (source.pathPrefixes) {
        for (const upstreamPath of upstream.paths) {
          if (!source.pathPrefixes.some((prefix) => upstreamPath.startsWith(prefix))) {
            add({ level: 'error', rule: 'provenance/path', message: `${upstreamPath} is outside the permissively licensed part of ${source.repo} (${source.pathPrefixes.join(', ')})` })
          }
        }
      }
    }
    for (const file of manifest.files) {
      if (!LICENSED_ROLES.has(file.role)) continue
      const text = item.files[file.path]
      if (text === undefined) continue
      const head = text.slice(0, 1200)
      if (!head.includes(`SPDX-License-Identifier: ${upstream.spdx}`)) {
        add({ level: 'error', rule: 'license/header', file: file.path, message: `missing "SPDX-License-Identifier: ${upstream.spdx}" header` })
      }
      for (const line of upstream.copyright) {
        if (!head.includes(line)) add({ level: 'error', rule: 'license/copyright', file: file.path, message: `missing copyright line "${line}"` })
      }
    }
  }

  for (const [path, text] of Object.entries(item.files)) {
    for (const banned of BANNED) {
      if (banned.pattern.test(text)) add({ level: 'error', rule: banned.rule, file: path, message: banned.message })
    }
    if (/transition:\s*all\b|\btransition-all\b/.test(text)) {
      add({ level: 'warning', rule: 'motion/transition-all', file: path, message: 'avoid transition: all; list the properties that actually change' })
    }
  }

  // 会动的条目要处理「减少动态效果」。
  if (manifest.a11y.reducedMotion !== 'not-animated') {
    const handles = Object.values(item.files).some((text) =>
      /useFrameLoop|usePrefersReducedMotion|useReducedMotion|prefers-reduced-motion|reducedMotion=|\bmotion-(?:reduce|safe):/.test(text),
    )
    if (!handles) add({ level: 'error', rule: 'a11y/reduced-motion', message: 'animated items must handle prefers-reduced-motion' })
  }

  return findings
}
