import { Menu, BrowserWindow, app, MenuItemConstructorOptions } from 'electron'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'

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

export function setupMenu(win: BrowserWindow) {
  const isMac = process.platform === 'darwin'

  const template: MenuItemConstructorOptions[] = []

  // App menu (macOS only)
  if (isMac) {
    template.push({
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    })
  }

  // File menu
  const fileMenu: MenuItemConstructorOptions = {
    label: 'File',
    submenu: [
      {
        label: 'Open Folder...',
        accelerator: 'CmdOrCtrl+O',
        click: async () => {
          const { dialog } = require('electron')
          const result = await dialog.showOpenDialog(win, {
            properties: ['openDirectory'],
          })
          if (!result.canceled && result.filePaths.length > 0) {
            const folderPath = result.filePaths[0]
            const tree = buildFileTree(folderPath)
            win.webContents.send('menu:openFolder', { path: folderPath, tree })
          }
        },
      },
      {
        label: 'Open File...',
        accelerator: 'CmdOrCtrl+Shift+O',
        click: async () => {
          const { dialog } = require('electron')
          const { readFileSync } = require('fs')
          const { basename } = require('path')
          const result = await dialog.showOpenDialog(win, {
            properties: ['openFile'],
            filters: [
              { name: 'Markdown', extensions: ['md', 'markdown', 'mdown', 'mkd', 'mdx'] },
              { name: 'All Files', extensions: ['*'] },
            ],
          })
          if (!result.canceled && result.filePaths.length > 0) {
            const filePath = result.filePaths[0]
            const fileName = basename(filePath)
            try {
              const content = readFileSync(filePath, 'utf-8')
              win.webContents.send('menu:openFile', { filePath, fileName, content })
            } catch {}
          }
        },
      },
      {
        label: 'Save',
        accelerator: 'CmdOrCtrl+S',
        click: () => {
          win.webContents.send('menu:saveFile')
        },
      },
      {
        label: 'Export HTML...',
        accelerator: 'CmdOrCtrl+Shift+E',
        click: () => {
          win.webContents.send('menu:exportHTML')
        },
      },
      { type: 'separator' },
      {
        label: 'New File',
        accelerator: 'CmdOrCtrl+N',
        click: () => {
          win.webContents.send('menu:newFile')
        },
      },
      { type: 'separator' },
      isMac ? { role: 'close' } : { role: 'quit' },
    ],
  }

  template.push(fileMenu)

  // Edit menu
  template.push({
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectAll' },
    ],
  })

  // View menu
  template.push({
    label: 'View',
    submenu: [
      {
        label: 'Toggle Preview',
        accelerator: 'CmdOrCtrl+P',
        click: () => {
          win.webContents.send('menu:togglePreview')
        },
      },
      {
        label: 'Toggle Theme',
        accelerator: 'CmdOrCtrl+Shift+T',
        click: () => {
          win.webContents.send('menu:toggleTheme')
        },
      },
      { type: 'separator' },
      { role: 'reload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      {
        label: 'Zoom In',
        accelerator: 'CmdOrCtrl+=',
        click: () => {
          win.webContents.send('menu:zoomIn')
        },
      },
      {
        label: 'Zoom Out',
        accelerator: 'CmdOrCtrl+-',
        click: () => {
          win.webContents.send('menu:zoomOut')
        },
      },
      {
        label: 'Reset Zoom',
        accelerator: 'CmdOrCtrl+0',
        click: () => {
          win.webContents.send('menu:zoomReset')
        },
      },
      { type: 'separator' },
      { role: 'togglefullscreen' },
    ],
  })

  // Window menu
  const windowSubmenu: MenuItemConstructorOptions[] = [
    { role: 'minimize' },
    { role: 'zoom' },
  ]

  if (isMac) {
    windowSubmenu.push({ type: 'separator' })
    windowSubmenu.push({ role: 'front' })
  } else {
    windowSubmenu.push({ role: 'close' })
  }

  template.push({
    label: 'Window',
    submenu: windowSubmenu,
  })

  // Help menu
  template.push({
    role: 'help',
    submenu: [
      {
        label: 'About mkdown',
        click: async () => {
          const { dialog } = require('electron')
          await dialog.showMessageBox(win, {
            type: 'info',
            title: 'About mkdown',
            message: 'mkdown v1.0.0',
            detail: 'A macOS Markdown file browser and editor.\nBuilt with Electron, React, and CodeMirror 6.',
          })
        },
      },
    ],
  })

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
