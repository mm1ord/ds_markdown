import React, { useState } from 'react'
import type { FileNode } from '../types'

interface FileTreeProps {
  nodes: FileNode[]
  currentFilePath: string | null
  onSelectFile: (path: string, name: string) => void
  onContextMenu?: (e: React.MouseEvent, path: string, name: string) => void
  depth?: number
}

function FileIcon({ type, name }: { type: 'file' | 'directory'; name: string }) {
  if (type === 'directory') {
    return (
      <svg className="file-icon folder-icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M1.5 3.5a1 1 0 011-1h3.586a1 1 0 01.707.293l1.414 1.414a1 1 0 00.707.293H13.5a1 1 0 011 1v6a1 1 0 01-1 1h-11a1 1 0 01-1-1v-8z" />
      </svg>
    )
  }
  if (name.endsWith('.md') || name.endsWith('.markdown')) {
    return (
      <svg className="file-icon md-icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M3 1.75A.75.75 0 013.75 1h8.5a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-8.5a.75.75 0 01-.75-.75V1.75zM4.5 3v10h7V3h-7zM6 5.5a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5A.75.75 0 016 5.5zM6 8a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5A.75.75 0 016 8zm0 2.5a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75z" />
      </svg>
    )
  }
  return (
    <svg className="file-icon text-icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 1.75A.75.75 0 013.75 1h8.5a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-8.5a.75.75 0 01-.75-.75V1.75zM4.5 3v10h7V3h-7z" />
    </svg>
  )
}

export default function FileTree({ nodes, currentFilePath, onSelectFile, onContextMenu, depth = 0 }: FileTreeProps) {
  return (
    <ul className="file-tree" style={{ paddingLeft: depth === 0 ? 0 : undefined }}>
      {nodes.map((node) => (
        <FileTreeNode
          key={node.path}
          node={node}
          currentFilePath={currentFilePath}
          onSelectFile={onSelectFile}
          onContextMenu={onContextMenu}
          depth={depth}
        />
      ))}
    </ul>
  )
}

function FileTreeNode({
  node,
  currentFilePath,
  onSelectFile,
  onContextMenu,
  depth,
}: {
  node: FileNode
  currentFilePath: string | null
  onSelectFile: (path: string, name: string) => void
  onContextMenu?: (e: React.MouseEvent, path: string, name: string) => void
  depth: number
}) {
  const [expanded, setExpanded] = useState(false)

  if (node.type === 'directory') {
    const hasChildren = node.children && node.children.length > 0
    return (
      <li className="file-tree-item">
        <div
          className="file-tree-node folder-node"
          onClick={() => hasChildren && setExpanded(!expanded)}
          style={{ paddingLeft: 8 + depth * 16 }}
        >
          <span className={`chevron ${expanded ? 'expanded' : ''}`}>
            {hasChildren ? '▸' : '  '}
          </span>
          <FileIcon type="directory" name={node.name} />
          <span className="file-name">{node.name}</span>
        </div>
        {expanded && node.children && (
          <FileTree
            nodes={node.children}
            currentFilePath={currentFilePath}
            onSelectFile={onSelectFile}
            depth={depth + 1}
          />
        )}
      </li>
    )
  }

  return (
    <li className="file-tree-item">
      <div
        className={`file-tree-node file-node ${currentFilePath === node.path ? 'active' : ''}`}
        onClick={() => onSelectFile(node.path, node.name)}
        onContextMenu={(e) => onContextMenu?.(e, node.path, node.name)}
        style={{ paddingLeft: 8 + depth * 16 }}
      >
        <span className="chevron">  </span>
        <FileIcon type="file" name={node.name} />
        <span className="file-name">{node.name}</span>
      </div>
    </li>
  )
}
