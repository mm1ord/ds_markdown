import { contextBridge, ipcRenderer, webFrame } from 'electron'
import type { OpenFolderResult, OpenFileResult, FileContent, WriteFileParams, CreateFileParams, RenameParams, ExportHTMLParams } from '../renderer/types'

contextBridge.exposeInMainWorld('electronAPI', {
  getZoomFactor: (): number => webFrame.getZoomFactor(),

  setZoomFactor: (factor: number): void => webFrame.setZoomFactor(factor),
  openFolder: (): Promise<OpenFolderResult> =>
    ipcRenderer.invoke('dialog:openFolder'),

  openFile: (): Promise<OpenFileResult> =>
    ipcRenderer.invoke('dialog:openFile'),

  readFile: (filePath: string): Promise<FileContent> =>
    ipcRenderer.invoke('file:read', filePath),

  writeFile: (params: WriteFileParams): Promise<{ success: boolean }> =>
    ipcRenderer.invoke('file:write', params),

  createFile: (params: CreateFileParams): Promise<{ path: string }> =>
    ipcRenderer.invoke('file:create', params),

  renameFile: (params: RenameParams): Promise<{ success: boolean; newPath?: string }> =>
    ipcRenderer.invoke('file:rename', params),

  deleteFile: (filePath: string): Promise<{ success: boolean }> =>
    ipcRenderer.invoke('file:delete', filePath),

  exportHTML: (params: ExportHTMLParams): Promise<{ success?: boolean; canceled?: boolean }> =>
    ipcRenderer.invoke('export:html', params),

  watchFile: (filePath: string): Promise<void> =>
    ipcRenderer.invoke('file:watch', filePath),

  unwatchFile: (filePath: string): Promise<void> =>
    ipcRenderer.invoke('file:unwatch', filePath),

  onFileChanged: (cb: (data: { filePath: string; content: string }) => void): (() => void) => {
    const listener = (_event: any, data: { filePath: string; content: string }) => cb(data)
    ipcRenderer.on('file:changed', listener)
    return () => ipcRenderer.removeListener('file:changed', listener)
  },

  onMenuOpenFolder: (cb: (data: OpenFolderResult) => void): (() => void) => {
    const listener = (_event: any, data: OpenFolderResult) => cb(data)
    ipcRenderer.on('menu:openFolder', listener)
    return () => ipcRenderer.removeListener('menu:openFolder', listener)
  },

  onMenuOpenFile: (cb: (data: OpenFileResult) => void): (() => void) => {
    const listener = (_event: any, data: OpenFileResult) => cb(data)
    ipcRenderer.on('menu:openFile', listener)
    return () => ipcRenderer.removeListener('menu:openFile', listener)
  },

  onMenuSaveFile: (cb: () => void): (() => void) => {
    const listener = () => cb()
    ipcRenderer.on('menu:saveFile', listener)
    return () => ipcRenderer.removeListener('menu:saveFile', listener)
  },

  onMenuNewFile: (cb: () => void): (() => void) => {
    const listener = () => cb()
    ipcRenderer.on('menu:newFile', listener)
    return () => ipcRenderer.removeListener('menu:newFile', listener)
  },

  onMenuTogglePreview: (cb: () => void): (() => void) => {
    const listener = () => cb()
    ipcRenderer.on('menu:togglePreview', listener)
    return () => ipcRenderer.removeListener('menu:togglePreview', listener)
  },

  onMenuToggleTheme: (cb: () => void): (() => void) => {
    const listener = () => cb()
    ipcRenderer.on('menu:toggleTheme', listener)
    return () => ipcRenderer.removeListener('menu:toggleTheme', listener)
  },

  onMenuExportHTML: (cb: () => void): (() => void) => {
    const listener = () => cb()
    ipcRenderer.on('menu:exportHTML', listener)
    return () => ipcRenderer.removeListener('menu:exportHTML', listener)
  },

  onMenuZoomIn: (cb: () => void): (() => void) => {
    const listener = () => cb()
    ipcRenderer.on('menu:zoomIn', listener)
    return () => ipcRenderer.removeListener('menu:zoomIn', listener)
  },

  onMenuZoomOut: (cb: () => void): (() => void) => {
    const listener = () => cb()
    ipcRenderer.on('menu:zoomOut', listener)
    return () => ipcRenderer.removeListener('menu:zoomOut', listener)
  },

  onMenuZoomReset: (cb: () => void): (() => void) => {
    const listener = () => cb()
    ipcRenderer.on('menu:zoomReset', listener)
    return () => ipcRenderer.removeListener('menu:zoomReset', listener)
  },
})
