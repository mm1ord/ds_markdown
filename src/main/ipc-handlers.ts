import { ipcMain, dialog, BrowserWindow } from 'electron'
import { readdirSync, statSync, readFileSync, writeFileSync, existsSync, mkdirSync, renameSync, unlinkSync, watch } from 'fs'
import { join, basename, dirname, extname } from 'path'

interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileNode[]
}

function buildFileTree(dirPath: string, maxDepth = 5, currentDepth = 0): FileNode[] {
  if (currentDepth >= maxDepth) return []

  try {
    const entries = readdirSync(dirPath)
    const nodes: FileNode[] = []

    for (const entry of entries) {
      if (entry.startsWith('.') || entry === 'node_modules') continue

      const fullPath = join(dirPath, entry)
      let stat
      try {
        stat = statSync(fullPath)
      } catch {
        continue
      }

      if (stat.isDirectory()) {
        const children = buildFileTree(fullPath, maxDepth, currentDepth + 1)
        nodes.push({
          name: entry,
          path: fullPath,
          type: 'directory',
          children: children.length > 0 ? children : [],
        })
      } else {
        nodes.push({
          name: entry,
          path: fullPath,
          type: 'file',
        })
      }
    }

    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
      return a.name.localeCompare(b.name)
    })

    return nodes
  } catch {
    return []
  }
}

export function registerIpcHandlers(win: BrowserWindow) {
  ipcMain.handle('dialog:openFile', async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openFile'],
      filters: [
        { name: 'Markdown', extensions: ['md', 'markdown', 'mdown', 'mkd', 'mdx'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    })
    if (result.canceled || result.filePaths.length === 0) {
      return null
    }
    const filePath = result.filePaths[0]
    const fileName = basename(filePath)
    try {
      const content = readFileSync(filePath, 'utf-8')
      return { filePath, fileName, content }
    } catch (error: any) {
      return { error: error.message }
    }
  })

  ipcMain.handle('dialog:openFolder', async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
    })
    if (result.canceled || result.filePaths.length === 0) {
      return null
    }
    const folderPath = result.filePaths[0]
    const tree = buildFileTree(folderPath)
    return { path: folderPath, tree }
  })

  ipcMain.handle('file:read', async (_event, filePath: string) => {
    try {
      const content = readFileSync(filePath, 'utf-8')
      return { content }
    } catch (error: any) {
      return { error: error.message }
    }
  })

  ipcMain.handle('file:write', async (_event, { path, content }: { path: string; content: string }) => {
    try {
      const dir = join(path, '..')
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
      }
      writeFileSync(path, content, 'utf-8')
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('file:create', async (_event, { dirPath, fileName }: { dirPath: string; fileName: string }) => {
    try {
      const filePath = join(dirPath, fileName)
      if (existsSync(filePath)) {
        return { error: 'File already exists' }
      }
      writeFileSync(filePath, '', 'utf-8')
      return { path: filePath }
    } catch (error: any) {
      return { error: error.message }
    }
  })

  ipcMain.handle('file:rename', async (_event, { filePath, newName }: { filePath: string; newName: string }) => {
    try {
      const dir = dirname(filePath)
      const newPath = join(dir, newName)
      renameSync(filePath, newPath)
      return { success: true, newPath }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('file:delete', async (_event, filePath: string) => {
    try {
      unlinkSync(filePath)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('export:html', async (_event, { content, fileName }: { content: string; fileName: string }) => {
    const result = await dialog.showSaveDialog(win, {
      defaultPath: fileName.replace(/\.md$/i, '.html'),
      filters: [{ name: 'HTML', extensions: ['html'] }],
    })
    if (result.canceled || !result.filePath) return { canceled: true }
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${fileName}</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css">
<style>
body { max-width: 860px; margin: 0 auto; padding: 40px 48px; font-family: -apple-system, sans-serif; font-size: 15px; line-height: 1.7; color: #1d1d1f; }
h1, h2 { border-bottom: 1px solid #e5e5ea; padding-bottom: 6px; }
h1 { font-size: 2em; } h2 { font-size: 1.5em; } h3 { font-size: 1.25em; }
code { background: #f5f5f7; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
pre { background: #f5f5f7; padding: 16px; border-radius: 8px; overflow-x: auto; }
pre code { padding: 0; background: none; }
blockquote { border-left: 3px solid #0071e3; margin-left: 0; padding-left: 16px; color: #6e6e73; }
table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #d2d2d7; padding: 8px 12px; }
img { max-width: 100%; }
</style>
</head>
<body>
${content}
</body>
</html>`
    writeFileSync(result.filePath, htmlContent, 'utf-8')
    return { success: true, path: result.filePath }
  })

  // File watching
  const watchers = new Map<string, any>()

  ipcMain.handle('file:watch', async (_event, filePath: string) => {
    if (watchers.has(filePath)) return
    try {
      const w = watch(filePath, () => {
        try {
          const content = readFileSync(filePath, 'utf-8')
          win.webContents.send('file:changed', { filePath, content })
        } catch {}
      })
      watchers.set(filePath, w)
    } catch {}
  })

  ipcMain.handle('file:unwatch', async (_event, filePath: string) => {
    const w = watchers.get(filePath)
    if (w) {
      w.close()
      watchers.delete(filePath)
    }
  })
}
