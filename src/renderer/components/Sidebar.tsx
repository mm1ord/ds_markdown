import React, { useState } from 'react'
import FileTree from './FileTree'
import Outline from './Outline'
import RecentFiles from './RecentFiles'
import ContextMenu from './ContextMenu'
import type { FileNode } from '../types'

interface SidebarProps {
  folderPath: string | null
  tree: FileNode[]
  currentFilePath: string | null
  activeFileContent: string
  onOpenFolder: () => void
  onOpenFile: () => void
  onSelectFile: (path: string, name: string) => void
  onCreateFile: (fileName: string) => void
  onRenameFile: (filePath: string, newName: string) => Promise<boolean>
  onDeleteFile: (filePath: string) => Promise<boolean>
  onRefreshFolder: () => void
}

export default function Sidebar({
  folderPath,
  tree,
  currentFilePath,
  activeFileContent,
  onOpenFolder,
  onOpenFile,
  onSelectFile,
  onCreateFile,
  onRenameFile,
  onDeleteFile,
  onRefreshFolder,
}: SidebarProps) {
  const [showNewFileInput, setShowNewFileInput] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [sidebarView, setSidebarView] = useState<'files' | 'outline'>('files')
  const [contextMenu, setContextMenu] = useState<{
    x: number; y: number; filePath: string; fileName: string;
  } | null>(null)

  const handleCreateFile = () => {
    if (newFileName.trim()) {
      const name = newFileName.endsWith('.md') ? newFileName : `${newFileName}.md`
      onCreateFile(name.trim())
      setNewFileName('')
      setShowNewFileInput(false)
    }
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="titlebar-drag-region" />
        <div className="sidebar-toolbar">
          <button className="sidebar-btn" onClick={onOpenFolder} title="Open Folder (Cmd+O)">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1.5 3.5a1 1 0 011-1h3.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H13.5a1 1 0 011 1v6a1 1 0 01-1 1h-11a1 1 0 01-1-1v-8z" />
            </svg>
          </button>
          <button className="sidebar-btn" onClick={onOpenFile} title="Open File (Cmd+Shift+O)">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3 1.75A.75.75 0 013.75 1h8.5a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-8.5a.75.75 0 01-.75-.75V1.75zM4.5 3v10h7V3h-7z" />
              <path d="M6 5.5a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5A.75.75 0 016 5.5zM6 8a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5A.75.75 0 016 8zm0 2.5a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75z" fill="currentColor" opacity="0.4" />
            </svg>
          </button>
          <button
            className="sidebar-btn"
            onClick={() => setShowNewFileInput(true)}
            disabled={!folderPath}
            title="New File (Cmd+N)"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z" />
            </svg>
          </button>
        </div>
        {showNewFileInput && (
          <div className="new-file-input">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFile()
                if (e.key === 'Escape') {
                  setShowNewFileInput(false)
                  setNewFileName('')
                }
              }}
              placeholder="filename.md"
              autoFocus
            />
          </div>
        )}
        {currentFilePath && (
          <div className="sidebar-view-toggle">
            <button
              className={`sidebar-view-btn ${sidebarView === 'files' ? 'active' : ''}`}
              onClick={() => setSidebarView('files')}
            >
              Files
            </button>
            <button
              className={`sidebar-view-btn ${sidebarView === 'outline' ? 'active' : ''}`}
              onClick={() => setSidebarView('outline')}
            >
              Outline
            </button>
          </div>
        )}
      </div>
      <div className="sidebar-content">
        {sidebarView === 'outline' && currentFilePath ? (
          <Outline content={activeFileContent} />
        ) : folderPath ? (
          <FileTree
            nodes={tree}
            currentFilePath={currentFilePath}
            onSelectFile={onSelectFile}
            onContextMenu={(e, path, name) =>
              setContextMenu({ x: e.clientX, y: e.clientY, filePath: path, fileName: name })
            }
          />
        ) : currentFilePath ? (
          <div className="sidebar-single-file">
            <div className="file-tree-node file-node active">
              <span className="chevron">  </span>
              <svg className="file-icon md-icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3 1.75A.75.75 0 013.75 1h8.5a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-8.5a.75.75 0 01-.75-.75V1.75zM4.5 3v10h7V3h-7zM6 5.5a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5A.75.75 0 016 5.5zM6 8a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5A.75.75 0 016 8zm0 2.5a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75z" />
              </svg>
              <span className="file-name">{currentFilePath.split('/').pop()}</span>
            </div>
          </div>
        ) : (
          <div className="sidebar-empty">
            <p>No file opened</p>
            <div className="sidebar-empty-actions">
              <button className="sidebar-open-btn" onClick={onOpenFolder}>
                Open Folder
              </button>
              <button className="sidebar-open-btn" onClick={onOpenFile}>
                Open File
              </button>
            </div>
            <RecentFiles onSelectFile={onSelectFile} />
          </div>
        )}
      </div>
      {(folderPath || currentFilePath) && (
        <div className="sidebar-footer">
          <span className="folder-path" title={folderPath || currentFilePath || ''}>
            {folderPath ? (folderPath.split('/').pop() || folderPath) : (currentFilePath ? currentFilePath.split('/').pop() || 'Single file' : '')}
          </span>
        </div>
      )}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onRename={async () => {
            const { filePath, fileName } = contextMenu
            setContextMenu(null)
            const newName = prompt('New name:', fileName)
            if (newName && newName !== fileName) {
              await onRenameFile(filePath, newName)
              onRefreshFolder()
            }
          }}
          onDelete={async () => {
            const { filePath, fileName } = contextMenu
            setContextMenu(null)
            if (confirm(`Delete "${fileName}"?`)) {
              await onDeleteFile(filePath)
              onRefreshFolder()
            }
          }}
        />
      )}
    </div>
  )
}
