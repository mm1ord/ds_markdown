import React, { useState, useEffect } from 'react'

const STORAGE_KEY = 'mkdown-recent-files'
const MAX_RECENT = 20

interface RecentFile {
  filePath: string
  fileName: string
  openedAt: number
}

function loadRecent(): RecentFile[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveRecent(files: RecentFile[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files))
}

export function addRecentFile(filePath: string, fileName: string) {
  const files = loadRecent().filter((f) => f.filePath !== filePath)
  files.unshift({ filePath, fileName, openedAt: Date.now() })
  saveRecent(files.slice(0, MAX_RECENT))
}

interface RecentFilesProps {
  onSelectFile: (path: string, name: string) => void
}

export default function RecentFiles({ onSelectFile }: RecentFilesProps) {
  const [files, setFiles] = useState<RecentFile[]>([])

  useEffect(() => {
    setFiles(loadRecent())
    const handler = () => setFiles(loadRecent())
    window.addEventListener('focus', handler)
    return () => window.removeEventListener('focus', handler)
  }, [])

  if (files.length === 0) return null

  return (
    <div className="recent-files">
      <div className="recent-title">Recent</div>
      {files.map((file) => (
        <div
          key={file.filePath}
          className="recent-item"
          onClick={() => onSelectFile(file.filePath, file.fileName)}
          title={file.filePath}
        >
          <svg className="file-icon md-icon" width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3 1.75A.75.75 0 013.75 1h8.5a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-8.5a.75.75 0 01-.75-.75V1.75zM4.5 3v10h7V3h-7zM6 5.5a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5A.75.75 0 016 5.5zM6 8a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5A.75.75 0 016 8zm0 2.5a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75z" />
          </svg>
          <span className="recent-name">{file.fileName}</span>
        </div>
      ))}
    </div>
  )
}
