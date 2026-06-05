import { ipcMain, BrowserWindow } from 'electron'
import { IPC } from '@shared/ipc'
import { pickFolder } from '../services/dialog.service'

export function registerIpcHandlers(): void {
  ipcMain.handle(IPC.pickFolder, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    return pickFolder(win)
  })
}
