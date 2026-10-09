'use client'

import { javascript } from '@codemirror/lang-javascript'
import { json } from '@codemirror/lang-json'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorState, type Extension } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { tags } from '@lezer/highlight'
import { basicSetup } from 'codemirror'
import { useEffect, useRef } from 'react'

// 和站点代码视图（shiki 的 vesper 主题）同一套颜色。
const highlight = HighlightStyle.define([
  { tag: [tags.comment, tags.lineComment, tags.blockComment], color: '#8b8b8b94' },
  { tag: [tags.keyword, tags.operator, tags.punctuation, tags.bracket, tags.modifier], color: '#a0a0a0' },
  { tag: [tags.string, tags.special(tags.string), tags.regexp], color: '#99ffe4' },
  { tag: [tags.number, tags.bool, tags.null, tags.typeName, tags.className, tags.function(tags.variableName), tags.function(tags.propertyName)], color: '#ffc799' },
  { tag: [tags.variableName, tags.propertyName, tags.attributeName, tags.tagName], color: '#ffffff' },
])

const theme = EditorView.theme(
  {
    '&': { height: '100%', backgroundColor: 'transparent', color: '#ffffff', fontSize: '12.5px' },
    '.cm-scroller': { fontFamily: 'var(--font-mono)', lineHeight: '1.7' },
    '.cm-content': { caretColor: 'var(--color-ink)' },
    '.cm-gutters': { backgroundColor: 'transparent', color: 'oklch(0.56 0.01 270 / 0.6)', border: 'none' },
    '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'oklch(1 0 0 / 0.04)' },
    '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': { backgroundColor: 'oklch(0.84 0.07 285 / 0.25) !important' },
    '&.cm-focused': { outline: 'none' },
    '.cm-cursor': { borderLeftColor: 'var(--color-ink)' },
    '.cm-matchingBracket': { backgroundColor: 'oklch(1 0 0 / 0.1)', outline: 'none' },
    '.cm-tooltip': { backgroundColor: 'var(--color-raised)', border: '1px solid var(--color-line-strong)' },
  },
  { dark: true },
)

function language(path: string): Extension {
  if (path.endsWith('.json')) return json()
  return javascript({ typescript: /\.tsx?$/.test(path), jsx: /\.[jt]sx$/.test(path) })
}

/**
 * 工作台的代码编辑器。文件（path）变了就换一份新的编辑状态；内容由外部更新时（agent 改了文件）整篇替换。
 * Ctrl/⌘+S 交给 onSave。
 */
export function CodeEditor({ path, value, readOnly, onChange, onSave }: { path: string; value: string; readOnly: boolean; onChange: (value: string) => void; onSave: () => void }) {
  const host = useRef<HTMLDivElement>(null)
  const view = useRef<EditorView | null>(null)
  const callbacks = useRef({ onChange, onSave })
  callbacks.current = { onChange, onSave }

  useEffect(() => {
    const parent = host.current
    if (!parent) return
    const editor = new EditorView({
      parent,
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          language(path),
          syntaxHighlighting(highlight),
          theme,
          EditorView.lineWrapping,
          EditorState.readOnly.of(readOnly),
          keymap.of([
            {
              key: 'Mod-s',
              preventDefault: true,
              run: () => {
                callbacks.current.onSave()
                return true
              },
            },
          ]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) callbacks.current.onChange(update.state.doc.toString())
          }),
        ],
      }),
    })
    view.current = editor
    return () => {
      editor.destroy()
      view.current = null
    }
    // 只在换文件或切换只读时重建；内容的外部更新走下面的 effect。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, readOnly])

  useEffect(() => {
    const editor = view.current
    if (!editor) return
    const current = editor.state.doc.toString()
    if (current !== value) editor.dispatch({ changes: { from: 0, to: current.length, insert: value } })
  }, [value])

  return <div ref={host} className="h-full min-h-0 overflow-hidden" data-testid="code-editor" />
}
