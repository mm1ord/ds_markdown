import React, { useEffect, useRef, useState } from 'react'

interface ContextMenuProps {
  x: number
  y: number
  onClose: () => void
  onRename: () => void
  onDelete: () => void
}

export default function ContextMenu({ x, y, onClose, onRename, onDelete }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div className="context-menu" ref={ref} style={{ left: x, top: y }}>
      <div className="context-menu-item" onClick={onRename}>
        Rename
      </div>
      <div className="context-menu-item danger" onClick={onDelete}>
        Delete
      </div>
    </div>
  )
}

interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  filePath: string
  fileName: string
}

export function useContextMenu() {
  const [state, setState] = useState<ContextMenuState>({
    visible: false, x: 0, y: 0, filePath: '', fileName: '',
  })

  const show = (e: React.MouseEvent, filePath: string, fileName: string) => {
    e.preventDefault()
    setState({ visible: true, x: e.clientX, y: e.clientY, filePath, fileName })
  }

  const hide = () => setState((prev) => ({ ...prev, visible: false }))

  return { state, show, hide }
}
