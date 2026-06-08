import React, { useMemo } from 'react'

interface TOCItem {
  level: number
  text: string
  id: string
}

interface OutlineProps {
  content: string
}

export default function Outline({ content }: OutlineProps) {
  const items = useMemo(() => {
    const headings: TOCItem[] = []
    const lines = content.split('\n')
    for (const line of lines) {
      const match = line.match(/^(#{1,6})\s+(.+)/)
      if (match) {
        const level = match[1].length
        const text = match[2].trim()
        const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/(^-|-$)/g, '')
        headings.push({ level, text, id })
      }
    }
    return headings
  }, [content])

  if (items.length === 0) {
    return (
      <div className="outline-empty">
        <p>No headings found</p>
      </div>
    )
  }

  return (
    <div className="outline">
      <div className="outline-title">Outline</div>
      <ul className="outline-list">
        {items.map((item, i) => (
          <li
            key={i}
            className="outline-item"
            style={{ paddingLeft: 12 + (item.level - 1) * 12 }}
            onClick={() => {
              const el = document.getElementById(item.id)
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' })
              }
            }}
          >
            <span className={`outline-dot level-${item.level}`} />
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  )
}
