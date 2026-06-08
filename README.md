# mkdown

> A macOS-native Markdown file browser and editor built with Electron + React + TypeScript.
>
> 基于 Electron + React + TypeScript 构建的 macOS 原生 Markdown 文件浏览编辑器。

![screenshot](mkdown.gif)

---

## Features 功能

| English | 中文 |
|---------|------|
| **File Browser** — Recursive file tree with folder expand/collapse | **文件浏览** — 递归文件树，支持文件夹展开折叠 |
| **Multi-Tab** — Open multiple files with tab switching | **多标签页** — 同时打开多个文件，标签切换 |
| **Edit / Preview Toggle** — Switch between source edit and rendered preview | **编辑/预览切换** — 源码编辑和渲染预览一键切换 |
| **Code Highlighting** — 190+ language syntax highlighting via highlight.js | **代码高亮** — 支持 190+ 编程语言语法高亮 |
| **KaTeX Math** — Inline `$...$` and block `$$...$$` LaTeX rendering | **数学公式** — 行内 `$...$` 和块级 `$$...$$` LaTeX 渲染 |
| **Mermaid Diagrams** — Render ```` ```mermaid ```` code blocks as SVG | **Mermaid 图表** — 将 ```` ```mermaid ```` 代码块渲染为 SVG |
| **Image Paste / Drop** — Drag or paste images to insert `![](data-url)` | **图片粘贴/拖拽** — 拖入或粘贴图片自动插入 Markdown 语法 |
| **Search & Replace** — CodeMirror 6 built-in search panel (`Cmd+F`) | **搜索替换** — CodeMirror 6 内置搜索面板 |
| **Auto Save** — Debounced auto-save (2s) after content change | **自动保存** — 内容变更 2 秒防抖自动保存 |
| **File Watcher** — Auto-reload when file changes externally | **文件监听** — 外部修改文件时自动重新加载 |
| **Outline / TOC** — Sidebar outline panel generated from headings | **大纲/目录** — 侧边栏自动从标题生成目录 |
| **Recent Files** — Recent file list stored in localStorage | **最近文件** — localStorage 记录最近打开的文件 |
| **Export HTML** — Export markdown as standalone HTML via `Cmd+Shift+E` | **导出 HTML** — 将 Markdown 导出为独立 HTML |
| **Focus Mode** — Hide sidebar for distraction-free editing (`Cmd+Shift+F`) | **专注模式** — 隐藏侧边栏全屏编辑 |
| **Zoom** — Editor content zoom (50%~200%) via toolbar or `Cmd+=/-/0` | **缩放** — 编辑区缩放 50%~200%，工具栏或快捷键控制 |
| **Dark/Light Theme** — Follows system preference, manual toggle | **暗色/亮色主题** — 跟随系统设置，支持手动切换 |
| **Right-Click Menu** — Rename / Delete files from file tree | **右键菜单** — 文件树右键重命名/删除 |
| **Shortcut Panel** — View all shortcuts via `Cmd+/` | **快捷键面板** — `Cmd+/` 查看所有快捷键 |

---

## Tech Stack 技术栈

| Layer | Technology |
|-------|-----------|
| Desktop Framework | Electron (main process) |
| UI | React 18 + TypeScript |
| Editor | CodeMirror 6 |
| Markdown Render | marked + highlight.js + KaTeX + mermaid |
| Bundler | Vite + vite-plugin-electron |
| Packaging | electron-builder (macOS .dmg) |
| Styling | CSS Variables (light/dark theme) |

---

## Getting Started 快速开始

```bash
# Clone
git clone https://github.com/mm1ord/ds_markdown.git
cd ds_markdown

# Install dependencies
npm install

# Start dev mode (Vite + Electron hot-reload)
npm run dev

# Build for production
npm run dist    # outputs release/mkdown-1.0.0-mac.dmg
```

---

## Keyboard Shortcuts 快捷键

| Shortcut | Action |
|----------|--------|
| `Cmd + O` | Open Folder |
| `Cmd + Shift + O` | Open File |
| `Cmd + S` | Save |
| `Cmd + N` | New File |
| `Cmd + P` | Toggle Preview |
| `Cmd + Shift + T` | Toggle Theme |
| `Cmd + Shift + E` | Export HTML |
| `Cmd + F` | Search |
| `Cmd + =` | Zoom In |
| `Cmd + -` | Zoom Out |
| `Cmd + 0` | Reset Zoom |
| `Cmd + Shift + F` | Focus Mode |
| `Cmd + /` | Shortcut Panel |

---

## Project Structure 项目结构

```
mkdown/
├── package.json
├── vite.config.ts
├── electron-builder.yml
├── index.html
├── src/
│   ├── main/              # Electron 主进程
│   │   ├── index.ts       # 窗口创建
│   │   ├── menu.ts        # macOS 原生菜单
│   │   └── ipc-handlers.ts # IPC 通信处理
│   ├── preload/
│   │   └── index.ts       # contextBridge 安全 API
│   └── renderer/          # React 渲染进程
│       ├── App.tsx        # 根组件
│       ├── App.css        # 全局样式 + 主题变量
│       ├── types.ts       # TypeScript 类型定义
│       ├── hooks/         # React Hooks
│       └── components/    # UI 组件
└── build/
    └── icon.icns          # macOS 应用图标
```

---

## License

MIT
