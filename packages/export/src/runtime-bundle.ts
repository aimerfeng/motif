/**
 * 把 packages/runtime/src 下的多个模块合成一个可以直接放进用户项目的 motif-runtime.ts。
 * 做法很朴素：去掉模块之间的相对导入和 index 的再导出，合并、去重外部导入。
 * 这依赖 runtime 源码的书写约定（一个文件一个关注点，只从 react / clsx / tailwind-merge 导入），由测试守住。
 */
const ORDER = ['cn.ts', 'css-vars.ts', 'reduced-motion.ts', 'visibility.ts', 'frame-loop.ts', 'canvas-size.ts', 'webgl.ts']
const IMPORT = /^import\s+(type\s+)?\{([^}]*)\}\s+from\s+'([^']+)'\s*;?\s*$/

export function bundleRuntime(files: Record<string, string>): string {
  const names = [...ORDER.filter((name) => name in files), ...Object.keys(files).filter((name) => name.endsWith('.ts') && name !== 'index.ts' && !ORDER.includes(name)).sort()]
  const valueImports = new Map<string, Set<string>>()
  const typeImports = new Map<string, Set<string>>()
  const bodies: string[] = []

  for (const name of names) {
    const lines = files[name]!.replaceAll('\r\n', '\n').split('\n')
    const body: string[] = []
    for (const line of lines) {
      const match = IMPORT.exec(line)
      if (!match) {
        body.push(line)
        continue
      }
      const [, typeOnly, specifiers, from] = match
      if (from!.startsWith('.')) continue
      for (const raw of specifiers!.split(',')) {
        const specifier = raw.trim()
        if (!specifier) continue
        const isType = Boolean(typeOnly) || specifier.startsWith('type ')
        const clean = specifier.replace(/^type\s+/, '')
        const target = isType ? typeImports : valueImports
        if (!target.has(from!)) target.set(from!, new Set())
        target.get(from!)!.add(clean)
      }
    }
    bodies.push(`// ---- ${name} ----\n${body.join('\n').trim()}`)
  }

  const importLines: string[] = []
  const modules = [...new Set([...valueImports.keys(), ...typeImports.keys()])].sort()
  for (const from of modules) {
    const values = [...(valueImports.get(from) ?? [])].sort()
    const types = [...(typeImports.get(from) ?? [])].filter((name) => !values.includes(name)).sort()
    const parts = [...values, ...types.map((name) => `type ${name}`)]
    importLines.push(`import { ${parts.join(', ')} } from '${from}'`)
  }

  return [
    '// motif-runtime: hooks shared by Motif components (https://github.com/aimerfeng/motif, MIT).',
    '// Generated from packages/runtime/src; edit there, not here.',
    ...importLines,
    '',
    bodies.join('\n\n'),
    '',
  ].join('\n')
}
