import { useState, useCallback } from 'react'
import api from '../api'
import type { FileNode } from '../types'
import type { TabInfo } from '../components/TabBar'
import { addRecentFile } from '../components/RecentFiles'

let tabIdCounter = 0

interface FileTreeState {
  folderPath: string | null
  tree: FileNode[]
  tabs: TabInfo[]
  activeTabId: string | null
}

function getActiveTab(state: FileTreeState): TabInfo | null {
  return state.tabs.find((t) => t.id === state.activeTabId) || null
}

export function useFileTree() {
  const [state, setState] = useState<FileTreeState>({
    folderPath: null,
    tree: [],
    tabs: [],
    activeTabId: null,
  })

  const openOrActivateTab = useCallback((filePath: string, fileName: string, content: string) => {
    addRecentFile(filePath, fileName)
    setState((prev) => {
      const existing = prev.tabs.find((t) => t.filePath === filePath)
      if (existing) {
        return { ...prev, activeTabId: existing.id }
      }
      const id = `tab-${++tabIdCounter}`
      const newTab: TabInfo = {
        id,
        filePath,
        fileName,
        content,
        isModified: false,
        viewMode: 'edit',
      }
      return {
        ...prev,
        tabs: [...prev.tabs, newTab],
        activeTabId: id,
      }
    })
  }, [])

  const updateActiveTab = useCallback((updates: Partial<TabInfo>) => {
    setState((prev) => {
      if (!prev.activeTabId) return prev
      return {
        ...prev,
        tabs: prev.tabs.map((t) =>
          t.id === prev.activeTabId ? { ...t, ...updates } : t
        ),
      }
    })
  }, [])

  const openFolder = useCallback(async () => {
    const result = await api.openFolder()
    if (result) {
      setState((prev) => ({ ...prev, folderPath: result.path, tree: result.tree }))
    }
  }, [])

  const openFile = useCallback(async () => {
    const result = await api.openFile()
    if (result) {
      openOrActivateTab(result.filePath, result.fileName, result.content)
    }
  }, [openOrActivateTab])

  const loadSingleFile = useCallback((filePath: string, fileName: string, content: string) => {
    setState((prev) => ({ ...prev, folderPath: null, tree: [] }))
    openOrActivateTab(filePath, fileName, content)
  }, [openOrActivateTab])

  const selectFile = useCallback(async (filePath: string, fileName: string) => {
    const result = await api.readFile(filePath)
    if (result && 'content' in result) {
      openOrActivateTab(filePath, fileName, result.content)
    }
  }, [openOrActivateTab])

  const closeTab = useCallback((tabId: string) => {
    setState((prev) => {
      const idx = prev.tabs.findIndex((t) => t.id === tabId)
      const newTabs = prev.tabs.filter((t) => t.id !== tabId)
      let newActive = prev.activeTabId
      if (prev.activeTabId === tabId) {
        if (newTabs.length > 0) {
          const newIdx = Math.min(idx, newTabs.length - 1)
          newActive = newTabs[newIdx].id
        } else {
          newActive = null
        }
      }
      return { ...prev, tabs: newTabs, activeTabId: newActive }
    })
  }, [])

  const selectTab = useCallback((tabId: string) => {
    setState((prev) => ({ ...prev, activeTabId: tabId }))
  }, [])

  const saveFile = useCallback(async () => {
    const tab = getActiveTab({ ...state, tabs: state.tabs, activeTabId: state.activeTabId })
    if (!tab) return
    const result = await api.writeFile({
      path: tab.filePath,
      content: tab.content,
    })
    if (result.success) {
      updateActiveTab({ isModified: false })
    }
  }, [state, updateActiveTab])

  const createFile = useCallback(async (fileName: string) => {
    if (!state.folderPath) return
    const result = await api.createFile({
      dirPath: state.folderPath,
      fileName,
    })
    if (result && 'path' in result) {
      const folderResult = await api.openFolder()
      if (folderResult) {
        setState((prev) => ({ ...prev, tree: folderResult.tree }))
      }
      openOrActivateTab(result.path, fileName, '')
    }
  }, [state.folderPath, openOrActivateTab])

  const setContent = useCallback((content: string) => {
    updateActiveTab({ content, isModified: true })
  }, [updateActiveTab])

  const setViewMode = useCallback((viewMode: 'edit' | 'preview') => {
    updateActiveTab({ viewMode })
  }, [updateActiveTab])

  const setFolderData = useCallback((folderPath: string, tree: FileNode[]) => {
    setState((prev) => ({ ...prev, folderPath, tree }))
  }, [])

  const refreshFolder = useCallback(async () => {
    const result = await api.openFolder()
    if (result) {
      setState((prev) => ({ ...prev, tree: result.tree }))
    }
  }, [])

  const renameFile = useCallback(async (filePath: string, newName: string) => {
    const result = await api.renameFile({ filePath, newName })
    if (result.success && result.newPath) {
      // Update tab
      setState((prev) => ({
        ...prev,
        tabs: prev.tabs.map((t) =>
          t.filePath === filePath ? { ...t, filePath: result.newPath!, fileName: newName } : t
        ),
      }))
      await refreshFolder()
    }
    return result.success
  }, [refreshFolder])

  const deleteFile = useCallback(async (filePath: string) => {
    const result = await api.deleteFile(filePath)
    if (result.success) {
      // Close tab for deleted file
      setState((prev) => {
        const tab = prev.tabs.find((t) => t.filePath === filePath)
        if (!tab) return prev
        const newTabs = prev.tabs.filter((t) => t.filePath !== filePath)
        let newActive = prev.activeTabId
        if (prev.activeTabId === tab.id) {
          newActive = newTabs.length > 0 ? newTabs[0].id : null
        }
        return { ...prev, tabs: newTabs, activeTabId: newActive }
      })
      await refreshFolder()
    }
    return result.success
  }, [refreshFolder])

  const exportHTML = useCallback(async () => {
    const tab = getActiveTab({ ...state, tabs: state.tabs, activeTabId: state.activeTabId })
    if (!tab) return
    const { marked } = await import('marked')
    marked.setOptions({ gfm: true, breaks: true })
    const htmlContent = marked.parse(tab.content) as string
    await api.exportHTML({ content: htmlContent, fileName: tab.fileName })
  }, [state])

  const activeTab = getActiveTab(state)
  const currentFilePath = activeTab?.filePath ?? null
  const currentFileName = activeTab?.fileName ?? null
  const currentFileContent = activeTab?.content ?? ''
  const isModified = activeTab?.isModified ?? false
  const viewMode = activeTab?.viewMode ?? 'edit'

  return {
    state,
    activeTab,
    currentFilePath,
    currentFileName,
    currentFileContent,
    isModified,
    viewMode,
    openFolder,
    openFile,
    loadSingleFile,
    selectFile,
    closeTab,
    selectTab,
    saveFile,
    createFile,
    setContent,
    setViewMode,
    setFolderData,
    refreshFolder,
    renameFile,
    deleteFile,
    exportHTML,
  }
}
