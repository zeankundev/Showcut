import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      fs: {
        readFile: (path: string, encoding?: string) => Buffer | Uint8Array | string
        writeFile: (path: string, data: string) => void
        readdir: (path: string) => string[]
        stat: (path: string) => any
        exists: (path: string) => boolean
      }
      dialog: {
        openVideo: () => Promise<string | null>
        openProject: () => Promise<string | null>
        saveProject: () => Promise<string | null>
      }
    }
  }
}
