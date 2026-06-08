import React, { useEffect, useCallback } from 'react'

interface ShortcutPanelProps {
  onClose: () => void
}

const shortcuts = [
  { label: 'Open Folder', keys: ['Cmd', 'O'] },
  { label: 'Open File', keys: ['Cmd', 'Shift', 'O'] },
  { label: 'Save File', keys: ['Cmd', 'S'] },
  { label: 'New File', keys: ['Cmd', 'N'] },
  { label: 'Toggle Preview', keys: ['Cmd', 'P'] },
  { label: 'Toggle Theme', keys: ['Cmd', 'Shift', 'T'] },
  { label: 'Export HTML', keys: ['Cmd', 'Shift', 'E'] },
  { label: 'Search', keys: ['Cmd', 'F'] },
  { label: 'Find Next', keys: ['Cmd', 'G'] },
  { label: 'Find Previous', keys: ['Cmd', 'Shift', 'G'] },
  { label: 'Focus Mode', keys: ['Cmd', 'Shift', 'F'] },
  { label: 'Shortcuts', keys: ['Cmd', '/'] },
]

export default function ShortcutPanel({ onClose }: ShortcutPanelProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="shortcut-overlay" onClick={onClose}>
      <div className="shortcut-panel" onClick={(e) => e.stopPropagation()}>
        <h2>Keyboard Shortcuts</h2>
        {shortcuts.map((s) => (
          <div key={s.label} className="shortcut-item">
            <span>{s.label}</span>
            <span className="shortcut-key">
              {s.keys.map((k, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span>+</span>}
                  <kbd>{k}</kbd>
                </React.Fragment>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
