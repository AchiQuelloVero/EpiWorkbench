import { contextBridge, ipcRenderer } from 'electron'
import { IPC, type WorkbenchApi } from '@shared/ipc'

const api: WorkbenchApi = {
  pickFolder: () => ipcRenderer.invoke(IPC.pickFolder),
  scanFolder: (rootPath: string) => ipcRenderer.invoke(IPC.scanFolder, { rootPath })
}

contextBridge.exposeInMainWorld('api', api)
