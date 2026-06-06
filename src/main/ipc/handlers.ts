import { ipcMain, BrowserWindow } from 'electron'
import { IPC, type Result, type ScanRequest } from '@shared/ipc'
import type { RepoInfo } from '@shared/types'
import { pickFolder } from '../services/dialog.service'
import { scanFolder } from '../services/scanner.service'

export function registerIpcHandlers(): void {
  ipcMain.handle(IPC.pickFolder, (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    return pickFolder(win)
  })

  ipcMain.handle(IPC.scanFolder, async (_event, { rootPath }: ScanRequest): Promise<Result<RepoInfo[]>> => {
    try {
      const repos = await scanFolder(rootPath)
      return { ok: true, data: repos }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) }
    }
  })
}
