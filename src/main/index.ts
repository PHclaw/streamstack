/**
 * StreamStack - Electron Main Process
 * Handles screen recording, window management, and IPC
 */

import { app, BrowserWindow, ipcMain, desktopCapturer, session } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Development mode check
const isDev = !app.isPackaged

// Main window reference
let mainWindow: BrowserWindow | null = null

// Recording state
let isRecording = false
let recordedChunks: Buffer[] = []

/**
 * Create the main application window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    title: 'StreamStack',
    icon: path.join(__dirname, '../../build/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
    frame: false,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    vibrancy: 'under-window',
    visualEffectState: 'active'
  })

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// App lifecycle
app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// ─────────────────────────────────────────────
// IPC Handlers
// ─────────────────────────────────────────────

/**
 * Get available screen sources for recording
 */
ipcMain.handle('get-sources', async () => {
  const sources = await desktopCapturer.getSources({
    types: ['screen', 'window'],
    thumbnailSize: { width: 320, height: 180 }
  })
  
  return sources.map(source => ({
    id: source.id,
    name: source.name,
    thumbnail: source.thumbnail.toDataURL(),
    type: source.id.startsWith('screen') ? 'screen' : 'window'
  }))
})

/**
 * Start screen recording
 */
ipcMain.handle('start-recording', async (_event, sourceId: string) => {
  if (isRecording) return { success: false, error: 'Already recording' }
  
  isRecording = true
  recordedChunks = []
  
  // Recording is handled in renderer via MediaRecorder
  // Main process just tracks state
  
  return { success: true, sourceId }
})

/**
 * Stop screen recording
 */
ipcMain.handle('stop-recording', async () => {
  if (!isRecording) return { success: false, error: 'Not recording' }
  
  isRecording = false
  return { success: true }
})

/**
 * Save recorded video
 */
ipcMain.handle('save-video', async (_event, buffer: Buffer, defaultName: string) => {
  const { dialog } = await import('electron')
  
  const result = await dialog.showSaveDialog(mainWindow!, {
    title: 'Save Recording',
    defaultPath: defaultName || `streamstack-${Date.now()}.mp4`,
    filters: [
      { name: 'MP4 Video', extensions: ['mp4'] },
      { name: 'WebM Video', extensions: ['webm'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  
  if (result.filePath) {
    fs.writeFileSync(result.filePath, buffer)
    return { success: true, path: result.filePath }
  }
  
  return { success: false, error: 'Cancelled' }
})

/**
 * Open file dialog for importing media
 */
ipcMain.handle('open-file', async () => {
  const { dialog } = await import('electron')
  
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: 'Import Media',
    filters: [
      { name: 'Video Files', extensions: ['mp4', 'webm', 'mov', 'avi', 'mkv'] },
      { name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg', 'm4a', 'flac'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ['openFile']
  })
  
  if (result.filePaths.length > 0) {
    return { success: true, path: result.filePaths[0] }
  }
  
  return { success: false }
})

/**
 * Get app version
 */
ipcMain.handle('get-version', () => {
  return app.getVersion()
})

/**
 * Window controls
 */
ipcMain.on('window-minimize', () => mainWindow?.minimize())
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})
ipcMain.on('window-close', () => mainWindow?.close())
