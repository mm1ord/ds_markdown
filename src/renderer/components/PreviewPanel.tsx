import React, { useMemo, useEffect, useRef } from 'react'
import { marked } from 'marked'
import hljs from 'highlight.js'
import katex from 'katex'
import mermaid from 'mermaid'

mermaid.initialize({ startOnLoad: false, theme: 'default' })

interface PreviewPanelProps {
  content: string
  fileName: string | null
}

// Configure marked with highlight.js and KaTeX
marked.setOptions({
  gfm: true,
  breaks: true,
})

// Process math before markdown rendering
function renderMath(text: string): string {
  // Block math: $$...$$
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_match, formula) => {
    try {
      return katex.renderToString(formula.trim(), { displayMode: true, throwOnError: false })
    } catch {
      return `<pre>${formula.trim()}</pre>`
    }
  })
  // Inline math: $...$ (but not $$)
  text = text.replace(/(?<!\$)\$(?!\$)([^$\n]+?)\$(?!\$)/g, (_match, formula) => {
    try {
      return katex.renderToString(formula.trim(), { displayMode: false, throwOnError: false })
    } catch {
      return `<code>${formula.trim()}</code>`
    }
  })
  return text
}

export default function PreviewPanel({ content, fileName }: PreviewPanelProps) {
  const previewRef = useRef<HTMLDivElement>(null)

  const html = useMemo(() => {
    try {
      const mathProcessed = renderMath(content)
      return marked.parse(mathProcessed) as string
    } catch {
      return '<p>Error rendering markdown</p>'
    }
  }, [content])

  // Apply highlight.js and render mermaid diagrams after render
  useEffect(() => {
    if (!previewRef.current) return

    // Highlight code blocks
    previewRef.current.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block as HTMLElement)
    })

    // Render mermaid diagrams
    const mermaidBlocks = previewRef.current.querySelectorAll('pre code.language-mermaid')
    mermaidBlocks.forEach(async (block) => {
      const pre = block.parentElement
      if (!pre) return
      try {
        const id = 'mermaid-' + Math.random().toString(36).substring(2, 8)
        const { svg } = await mermaid.render(id, block.textContent || '')
        pre.outerHTML = `<div class="mermaid-container">${svg}</div>`
      } catch {
        // Silently ignore mermaid errors
      }
    })
  }, [html])

  return (
    <div className="preview-panel">
      {fileName ? (
        <div
          className="markdown-body"
          ref={previewRef}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div className="preview-empty">
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
              <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
            </svg>
            <p>No file selected</p>
          </div>
        </div>
      )}
    </div>
  )
}
