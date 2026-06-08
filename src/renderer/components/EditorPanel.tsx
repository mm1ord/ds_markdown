import React, { useEffect, useRef, useCallback } from 'react'
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { searchKeymap } from '@codemirror/search'
import { oneDark } from '@codemirror/theme-one-dark'

interface EditorPanelProps {
  content: string
  theme: 'light' | 'dark'
  fileName: string | null
  onContentChange: (content: string) => void
  onSave: () => void
}

export default function EditorPanel({
  content,
  theme,
  fileName,
  onContentChange,
  onSave,
}: EditorPanelProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const contentRef = useRef(content)

  contentRef.current = content

  const handleSave = useCallback(() => {
    onSave()
    return true
  }, [onSave])

  // Initialize editor once on mount (editor container is always rendered)
  useEffect(() => {
    if (!editorRef.current) return

    const view = new EditorView({
      state: EditorState.create({
        doc: content,
        extensions: [
          lineNumbers(),
          highlightActiveLine(),
          history(),
          markdown({
            base: markdownLanguage,
            codeLanguages: languages,
          }),
          keymap.of([
            ...defaultKeymap,
            ...historyKeymap,
            ...searchKeymap,
            {
              key: 'Mod-s',
              run: handleSave,
              preventDefault: true,
            },
          ]),
          EditorView.lineWrapping,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const newContent = update.state.doc.toString()
              if (newContent !== contentRef.current) {
                onContentChange(newContent)
              }
            }
          }),
          ...(theme === 'dark' ? [oneDark] : []),
          EditorView.theme({
            '&': {
              height: '100%',
              fontSize: '14px',
            },
            '.cm-scroller': {
              fontFamily: "'SF Mono', 'Monaco', 'Menlo', 'Consolas', monospace",
              lineHeight: '1.6',
            },
            '.cm-content': {
              padding: '16px 24px',
            },
            '.cm-gutters': {
              borderRight: 'none',
            },
          }),
        ],
      }),
      parent: editorRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update content when file changes (user selects a different file)
  useEffect(() => {
    const view = viewRef.current
    if (!view) return

    const currentContent = view.state.doc.toString()
    if (currentContent !== content) {
      view.dispatch({
        changes: {
          from: 0,
          to: currentContent.length,
          insert: content,
        },
      })
    }
  }, [content])

  // Handle image paste and drop
  const insertImageMarkdown = useCallback((dataUrl: string, alt: string) => {
    const view = viewRef.current
    if (!view) return
    const md = `![${alt}](${dataUrl})`
    const pos = view.state.selection.main.head
    view.dispatch({
      changes: { from: pos, to: pos, insert: pos > 0 ? `\n${md}\n` : `${md}\n` },
    })
    onContentChange(view.state.doc.toString())
  }, [onContentChange])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (!file) continue
        const reader = new FileReader()
        reader.onload = () => {
          insertImageMarkdown(reader.result as string, file.name)
        }
        reader.readAsDataURL(file)
        break
      }
    }
  }, [insertImageMarkdown])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer?.files
    if (!files) return
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = () => {
          insertImageMarkdown(reader.result as string, file.name)
        }
        reader.readAsDataURL(file)
        break
      }
    }
  }, [insertImageMarkdown])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  return (
    <div className="editor-panel-wrapper" onPaste={handlePaste} onDrop={handleDrop} onDragOver={handleDragOver}>
      <div className="editor-panel" ref={editorRef} />
      {!fileName && (
        <div className="editor-empty-overlay">
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            </svg>
            <p>Open a folder and select a markdown file</p>
            <p className="empty-hint">Use Cmd+O to open a folder</p>
          </div>
        </div>
      )}
    </div>
  )
}
