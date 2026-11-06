import { Link } from '@/i18n/navigation'
import type { RepoFileEntry } from '@/lib/repos/repos'

interface Dir {
  dirs: Map<string, Dir>
  files: { name: string; path: string }[]
}

function build(entries: RepoFileEntry[]): Dir {
  const root: Dir = { dirs: new Map(), files: [] }
  for (const { path } of entries) {
    const parts = path.split('/')
    let dir = root
    for (const part of parts.slice(0, -1)) {
      let next = dir.dirs.get(part)
      if (!next) dir.dirs.set(part, (next = { dirs: new Map(), files: [] }))
      dir = next
    }
    dir.files.push({ name: parts.at(-1)!, path })
  }
  return root
}

/**
 * 仓库的文件树。目录用原生的 <details>（不用 JS 也能折叠）；当前文件所在的目录默认展开。
 */
export function FileTree({ entries, selected, href }: { entries: RepoFileEntry[]; selected: string | null; href: (path: string) => string }) {
  const render = (dir: Dir, prefix: string, depth: number) => {
    const pad = { paddingLeft: `${depth * 12 + 10}px` }
    return (
      <>
        {[...dir.dirs.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([name, child]) => {
            const path = `${prefix}${name}/`
            return (
              <details key={path} open={selected?.startsWith(path) || (depth === 0 && dir.dirs.size === 1)}>
                <summary className="cursor-pointer list-none truncate rounded-md py-1 pr-2 text-[13px] text-ink-muted select-none hover:bg-ink/5 hover:text-ink [&::-webkit-details-marker]:hidden" style={pad}>
                  <span aria-hidden className="mr-1.5 inline-block text-ink-faint">▸</span>
                  {name}
                </summary>
                {render(child, path, depth + 1)}
              </details>
            )
          })}
        {dir.files
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((file) => (
            <Link
              key={file.path}
              href={href(file.path)}
              aria-current={file.path === selected ? 'page' : undefined}
              className="block truncate rounded-md py-1 pr-2 font-mono text-[12.5px] text-ink-muted hover:bg-ink/5 hover:text-ink aria-[current=page]:bg-ink/8 aria-[current=page]:text-ink"
              style={{ paddingLeft: `${depth * 12 + 24}px` }}
            >
              {file.name}
            </Link>
          ))}
      </>
    )
  }
  return <nav className="max-h-[70vh] overflow-y-auto py-1">{render(build(entries), '', 0)}</nav>
}
