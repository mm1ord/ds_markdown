import React from 'react'

export interface TabInfo {
  id: string
  filePath: string
  fileName: string
  content: string
  isModified: boolean
  viewMode: 'edit' | 'preview'
}

interface TabBarProps {
  tabs: TabInfo[]
  activeTabId: string | null
  onSelectTab: (tabId: string) => void
  onCloseTab: (tabId: string) => void
}

export default function TabBar({ tabs, activeTabId, onSelectTab, onCloseTab }: TabBarProps) {
  if (tabs.length === 0) return null

  return (
    <div className="tab-bar">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`tab-item ${tab.id === activeTabId ? 'active' : ''}`}
          onClick={() => onSelectTab(tab.id)}
          onMouseDown={(e) => {
            if (e.button === 1) {
              e.preventDefault()
              onCloseTab(tab.id)
            }
          }}
        >
          <span className="tab-name">
            {tab.isModified && <span className="tab-dot" />}
            {tab.fileName}
          </span>
          <button
            className="tab-close"
            onClick={(e) => {
              e.stopPropagation()
              onCloseTab(tab.id)
            }}
            title="Close tab"
          >
            x
          </button>
        </div>
      ))}
    </div>
  )
}
