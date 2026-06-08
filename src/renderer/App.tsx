import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useFileTree } from './hooks/useFileTree'
import { useTheme } from './hooks/useTheme'
import Sidebar from './components/Sidebar'
import TabBar from './components/TabBar'
import EditorPanel from './components/EditorPanel'
import PreviewPanel from './components/PreviewPanel'
import ShortcutPanel from './components/ShortcutPanel'

export default function App() {
  const {
    state, currentFilePath, currentFileName, currentFileContent,
    isModified, viewMode,
    openFolder, openFile, loadSingleFile, selectFile,
    closeTab, selectTab, saveFile, createFile,
    setContent, setViewMode, setFolderData,
    renameFile, deleteFile, exportHTML,
  } = useFileTree()

  const { theme, toggleTheme } = useTheme()
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [focusMode, setFocusMode] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [zoom, setZoom] = useState(100)

  // Keyboard shortcuts for focus mode and shortcut panel
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
      e.preventDefault()
      setFocusMode((prev) => !prev)
    }
    if ((e.metaKey || e.ctrlKey) && e.key === '/') {
      e.preventDefault()
      setShowShortcuts((prev) => !prev)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const applyZoom = useCallback((next: number) => {
    const clamped = Math.min(200, Math.max(50, next))
    document.documentElement.style.setProperty('--app-zoom', `${clamped / 100}`)
    setZoom(clamped)
  }, [])

  const zoomIn = useCallback(() => applyZoom(zoom + 10), [applyZoom, zoom])
  const zoomOut = useCallback(() => applyZoom(zoom - 10), [applyZoom, zoom])
  const zoomReset = useCallback(() => applyZoom(100), [applyZoom])

  // Auto-save with debounce
  useEffect(() => {
    if (!currentFilePath || !isModified) return

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)

    saveTimerRef.current = setTimeout(() => saveFile(), 2000)

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [currentFileContent, currentFilePath, isModified, saveFile])

  // Watch current file for external changes
  useEffect(() => {
    if (!currentFilePath) return
    window.electronAPI?.watchFile(currentFilePath)
    const cleanup = window.electronAPI?.onFileChanged(({ filePath, content }) => {
      if (filePath === currentFilePath && content !== currentFileContent) {
        // Reload content from disk
        setContent(content)
        // Mark not modified since it came from disk
      }
    })
    return () => {
      window.electronAPI?.unwatchFile(currentFilePath)
      cleanup?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilePath])

  // Listen for menu events
  useEffect(() => {
    if (typeof window === 'undefined' || !window.electronAPI) return

    const cleanups: (() => void)[] = []

    cleanups.push(
      window.electronAPI.onMenuOpenFolder((data) => setFolderData(data.path, data.tree))
    )
    cleanups.push(
      window.electronAPI.onMenuOpenFile((data) => loadSingleFile(data.filePath, data.fileName, data.content))
    )
    cleanups.push(
      window.electronAPI.onMenuSaveFile(() => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
        saveFile()
      })
    )
    cleanups.push(
      window.electronAPI.onMenuTogglePreview(() => {
        setViewMode(viewMode === 'edit' ? 'preview' : 'edit')
      })
    )
    cleanups.push(
      window.electronAPI.onMenuToggleTheme(() => toggleTheme())
    )
    cleanups.push(
      window.electronAPI.onMenuExportHTML(() => exportHTML())
    )
    cleanups.push(
      window.electronAPI.onMenuZoomIn(() => zoomIn())
    )
    cleanups.push(
      window.electronAPI.onMenuZoomOut(() => zoomOut())
    )
    cleanups.push(
      window.electronAPI.onMenuZoomReset(() => zoomReset())
    )

    return () => cleanups.forEach((fn) => fn())
  }, [saveFile, setFolderData, toggleTheme, setViewMode, viewMode, loadSingleFile, exportHTML, zoomIn, zoomOut, zoomReset])

  return (
    <div className={`app ${focusMode ? 'focus-mode' : ''}`}>
      <Sidebar
        folderPath={state.folderPath}
        tree={state.tree}
        currentFilePath={currentFilePath}
        activeFileContent={currentFileContent}
        onOpenFolder={openFolder}
        onOpenFile={openFile}
        onSelectFile={selectFile}
        onCreateFile={createFile}
        onRenameFile={renameFile}
        onDeleteFile={deleteFile}
        onRefreshFolder={() => {}}
      />
      <main className="main-area">
        <div className="main-toolbar">
          <TabBar
            tabs={state.tabs}
            activeTabId={state.activeTabId}
            onSelectTab={selectTab}
            onCloseTab={closeTab}
          />
          <div className="toolbar-actions">
            <div className="zoom-controls">
              <button className="toolbar-btn" onClick={zoomOut} title="Zoom Out (Cmd+-)">-</button>
              <span className="zoom-label">{zoom}%</span>
              <button className="toolbar-btn" onClick={zoomIn} title="Zoom In (Cmd+=)">+</button>
              <button className="toolbar-btn" onClick={zoomReset} title="Reset Zoom (Cmd+0)">100%</button>
            </div>
            <button
              className="toolbar-btn"
              onClick={toggleTheme}
              title="Toggle Theme (Cmd+Shift+T)"
            >
              {theme === 'dark' ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 018 1zm4.95 1.3a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 11-1.06-1.06l1.06-1.06a.75.75 0 011.06 0zM15 8a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0115 8zm-1.3 4.95a.75.75 0 01-1.06 0l-1.06-1.06a.75.75 0 011.06-1.06l1.06 1.06a.75.75 0 010 1.06zM8 12a4 4 0 100-8 4 4 0 000 8z" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M6 .278a.768.768 0 01.08.858 7.208 7.208 0 00-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 01.81.316.733.733 0 01-.031.893A8.349 8.349 0 018.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 016 .278z" />
                </svg>
              )}
            </button>
            <div className="view-toggle">
              <button
                className={`toggle-btn ${viewMode === 'edit' ? 'active' : ''}`}
                onClick={() => setViewMode('edit')}
                title="Edit Mode"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M12.146.146a.5.5 0 01.708 0l3 3a.5.5 0 010 .708l-10 10a.5.5 0 01-.168.11l-5 2a.5.5 0 01-.65-.65l2-5a.5.5 0 01.11-.168l10-10z" />
                </svg>
              </button>
              <button
                className={`toggle-btn ${viewMode === 'preview' ? 'active' : ''}`}
                onClick={() => setViewMode('preview')}
                title="Preview Mode (Cmd+P)"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2 0a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V2a2 2 0 00-2-2H2zm1 3.5a.5.5 0 01.5-.5h9a.5.5 0 010 1h-9a.5.5 0 01-.5-.5zm0 2.5a.5.5 0 01.5-.5h9a.5.5 0 010 1h-9a.5.5 0 01-.5-.5zm0 2.5a.5.5 0 01.5-.5h9a.5.5 0 010 1h-9a.5.5 0 01-.5-.5zm0 2.5a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="content-area">
          {viewMode === 'edit' ? (
            <EditorPanel
              content={currentFileContent}
              theme={theme}
              fileName={currentFileName}
              onContentChange={setContent}
              onSave={saveFile}
            />
          ) : (
            <PreviewPanel
              content={currentFileContent}
              fileName={currentFileName}
            />
          )}
        </div>
      </main>
      {showShortcuts && <ShortcutPanel onClose={() => setShowShortcuts(false)} />}
    </div>
  )
}
