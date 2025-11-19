import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import fs from 'fs'

// Custom APIs for renderer
const api = {
  fs: {
    readFile: (path: string, encoding?: string) => {
      if (encoding) {
        return fs.readFileSync(path, encoding as BufferEncoding)
      }
      return fs.readFileSync(path) // Returns Buffer by default
    },
    writeFile: (path: string, data: string) => fs.writeFileSync(path, data),
    readdir: (path: string) => fs.readdirSync(path),
    stat: (path: string) => fs.statSync(path),
    exists: (path: string) => fs.existsSync(path)
  },
  dialog: {
    openVideo: () => ipcRenderer.invoke('dialog:openVideo'),
    openProject: () => ipcRenderer.invoke('dialog:openProject'),
    saveProject: () => ipcRenderer.invoke('dialog:saveProject')
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
