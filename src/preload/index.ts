/**
 * StreamStack - Preload Script
 * Exposes safe APIs to the renderer process
 */

import { contextBridge, ipcRenderer } from 'electron'

// Types for IPC communication
interface Source {
  id: string
  name: string
  thumbnail: string
  type: 'screen' | 'window'
}

interface RecordingState {
  isRecording: boolean
  sourceId?: string
}

// Expose protected methods to renderer
contextBridge.exposeInMainWorld('streamstack', {
  // Screen capture
  getSources: (): Promise<Source[]> => 
    ipcRenderer.invoke('get-sources'),
  
  // Recording controls
  startRecording: (sourceId: string): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('start-recording', sourceId),
  
  stopRecording: (): Promise<{ success: boolean; error?: string }> =>
    ipcRenderer.invoke('stop-recording'),
  
  // File operations
  saveVideo: (buffer: ArrayBuffer, defaultName?: string): Promise<{ success: boolean; path?: string; error?: string }> =>
    ipcRenderer.invoke('save-video', buffer, defaultName),
  
  openFile: (): Promise<{ success: boolean; path?: string }> =>
    ipcRenderer.invoke('open-file'),
  
  // App info
  getVersion: (): Promise<string> =>
    ipcRenderer.invoke('get-version'),
  
  // Window controls
  minimizeWindow: () => 
    ipcRenderer.send('window-minimize'),
  
  maximizeWindow: () => 
    ipcRenderer.send('window-maximize'),
  
  closeWindow: () => 
    ipcRenderer.send('window-close'),
  
  // Event listeners
  onRecordingStateChanged: (callback: (state: RecordingState) => void) => {
    ipcRenderer.on('recording-state-changed', (_event, state) => callback(state))
    return () => ipcRenderer.removeAllListeners('recording-state-changed')
  }
})

// Type declaration for renderer
declare global {
  interface Window {
    streamstack: {
      getSources: () => Promise<Source[]>
      startRecording: (sourceId: string) => Promise<{ success: boolean; error?: string }>
      stopRecording: () => Promise<{ success: boolean; error?: string }>
      saveVideo: (buffer: ArrayBuffer, defaultName?: string) => Promise<{ success: boolean; path?: string; error?: string }>
      openFile: () => Promise<{ success: boolean; path?: string }>
      getVersion: () => Promise<string>
      minimizeWindow: () => void
      maximizeWindow: () => void
      closeWindow: () => void
      onRecordingStateChanged: (callback: (state: RecordingState) => void) => () => void
    }
  }
}
