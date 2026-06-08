export interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileNode[]
}

export interface OpenFolderResult {
  path: string
  tree: FileNode[]
}

export interface OpenFileResult {
  filePath: string
  fileName: string
  content: string
}

export interface FileContent {
  content: string
}

export interface WriteFileParams {
  path: string
  content: string
}

export interface CreateFileParams {
  dirPath: string
  fileName: string
}

export interface RenameParams {
  filePath: string
  newName: string
}

export interface ExportHTMLParams {
  content: string
  fileName: string
}

export interface ElectronAPI {
  getZoomFactor: () => number
  setZoomFactor: (factor: number) => void
  openFolder: () => Promise<OpenFolderResult | null>
  openFile: () => Promise<OpenFileResult | null>
  readFile: (filePath: string) => Promise<FileContent>
  writeFile: (params: WriteFileParams) => Promise<{ success: boolean }>
  createFile: (params: CreateFileParams) => Promise<{ path: string }>
  renameFile: (params: RenameParams) => Promise<{ success: boolean; newPath?: string }>
  deleteFile: (filePath: string) => Promise<{ success: boolean }>
  exportHTML: (params: ExportHTMLParams) => Promise<{ success?: boolean; canceled?: boolean }>
  watchFile: (filePath: string) => Promise<void>
  unwatchFile: (filePath: string) => Promise<void>
  onFileChanged: (cb: (data: { filePath: string; content: string }) => void) => () => void
  onMenuOpenFolder: (cb: (data: OpenFolderResult) => void) => () => void
  onMenuOpenFile: (cb: (data: OpenFileResult) => void) => () => void
  onMenuSaveFile: (cb: () => void) => () => void
  onMenuNewFile: (cb: () => void) => () => void
  onMenuTogglePreview: (cb: () => void) => () => void
  onMenuToggleTheme: (cb: () => void) => () => void
  onMenuExportHTML: (cb: () => void) => () => void
  onMenuZoomIn: (cb: () => void) => () => void
  onMenuZoomOut: (cb: () => void) => () => void
  onMenuZoomReset: (cb: () => void) => () => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
