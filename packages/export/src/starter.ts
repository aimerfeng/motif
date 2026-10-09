import type { ItemSource, ParamValues } from '@motif/schema/core'
import { fontImports, itemUrl, npmDependencies, rewriteRuntimeImport, usesRuntime, type ExportContext } from './context.ts'
import { bundleRuntime } from './runtime-bundle.ts'
import { skillFiles, skillName } from './skill.ts'

export interface StarterOptions {
  hash: string
  bakedEntry: string
}

/**
 * 一个能直接 `npm install && npm run dev` 的 Vite + React + Tailwind v4 项目：
 * 全屏展示条目演示，组件放在 src/components/motif/<slug>/，Skill 同时放进 .agents/skills 和 .claude/skills。
 */
export function viteStarter(item: ItemSource, values: ParamValues, context: ExportContext, options: StarterOptions): Record<string, string> {
  const { manifest } = item
  const slug = manifest.slug
  const componentDir = `src/components/motif/${slug}`
  const dark = manifest.demo.theme === 'dark'
  const react = context.vendor.react ?? '19.0.0'
  const reactDom = context.vendor['react-dom'] ?? react

  const files: Record<string, string> = {}

  const pkg = {
    name: `motif-${slug}`,
    private: true,
    version: '0.0.0',
    type: 'module',
    scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview', typecheck: 'tsc --noEmit' },
    dependencies: {
      react: `^${react}`,
      'react-dom': `^${reactDom}`,
      ...npmDependencies(item, context),
    },
    devDependencies: {
      '@tailwindcss/vite': '^4.3.3',
      '@types/react': '^19.3.0',
      '@types/react-dom': '^19.3.0',
      ...(manifest.dependencies.includes('three') ? { '@types/three': '^0.186.0' } : {}),
      '@vitejs/plugin-react': '^6.1.1',
      tailwindcss: '^4.3.3',
      'tw-animate-css': '^1.4.0',
      typescript: '~6.0.3',
      vite: '^8.3.1',
    },
  }
  files['package.json'] = `${JSON.stringify(pkg, null, 2)}\n`

  files['index.html'] = `<!doctype html>
<html lang="en"${dark ? ' class="dark"' : ''}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${manifest.title.en} · Motif</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`

  files['vite.config.ts'] = `import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
`

  files['tsconfig.json'] = `${JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2022',
        lib: ['ES2022', 'DOM', 'DOM.Iterable'],
        module: 'ESNext',
        moduleResolution: 'bundler',
        jsx: 'react-jsx',
        strict: true,
        noEmit: true,
        skipLibCheck: true,
        isolatedModules: true,
        allowImportingTsExtensions: true,
      },
      include: ['src'],
    },
    null,
    2,
  )}\n`

  // Vite 的类型声明：CSS、资源等模块的 import 类型。
  files['src/vite-env.d.ts'] = '/// <reference types="vite/client" />\n'

  files['src/main.tsx'] = `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ${manifest.demo.export} } from './components/motif/${slug}/${manifest.demo.file.replace(/\.tsx?$/, '')}'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="fixed inset-0">
      <${manifest.demo.export} />
    </div>
  </StrictMode>,
)
`

  const styleImports = manifest.files.filter((file) => file.path.endsWith('.css')).map((file) => `@import './components/motif/${slug}/${file.path}';`)
  const fonts = fontImports(item).map((specifier) => `@import '${specifier}';`)
  files['src/index.css'] = ['@import "tailwindcss";', '@import "tw-animate-css";', ...fonts, "@import './motif-theme.css';", ...styleImports, ''].join('\n')
  files['src/motif-theme.css'] = context.runtime.themeCss

  const runtimePathFrom = (file: string) => {
    const depth = `${componentDir}/${file}`.split('/').length - 2
    return `${'../'.repeat(depth)}lib/motif-runtime`
  }
  for (const file of manifest.files) {
    if (file.role === 'asset') continue
    const code = file.path === manifest.entry.file ? options.bakedEntry : item.files[file.path] ?? ''
    files[`${componentDir}/${file.path}`] = rewriteRuntimeImport(code, runtimePathFrom(file.path))
  }
  if (usesRuntime(item)) files['src/lib/motif-runtime.ts'] = bundleRuntime(context.runtime.files)

  const skill = skillFiles(item, values, context, options)
  for (const [path, text] of Object.entries(skill)) {
    files[`.agents/skills/${skillName(slug)}/${path}`] = text
    files[`.claude/skills/${skillName(slug)}/${path}`] = text
  }

  const upstream = manifest.provenance.upstream
  files['README.md'] = `# ${manifest.title.en} · ${manifest.title['zh-CN']}

${manifest.summary.en}

${manifest.summary['zh-CN']}

Exported from [Motif](${itemUrl(context, slug)}) with your tuned parameters (hash \`${options.hash}\`).

\`\`\`bash
npm install
npm run dev
\`\`\`

- The component lives in \`${componentDir}/\`; your parameter values are baked into its \`defaults\` object.
- An agent skill for this effect is included in \`.agents/skills/${skillName(slug)}/\` and \`.claude/skills/${skillName(slug)}/\`, so Claude Code, Codex, Cursor and other agents can reuse it.
${upstream ? `\n## License\n\nThe component is based on [${upstream.repo}](https://github.com/${upstream.repo}) (${upstream.spdx}, ${upstream.copyright.join('; ')}) and keeps that license; see the header comment in each file. The rest of this project is MIT.\n` : '\n## License\n\nMIT.\n'}`

  return files
}
