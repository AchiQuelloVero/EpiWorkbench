import type { RepoInfo, AppSettings } from './types'

export const IPC = {
  pickFolder: 'dialog:pickFolder',
  scanFolder: 'scan:folder',
  getSettings: 'settings:get',
  saveSettings: 'settings:save'
} as const

export interface ScanRequest {
  rootPath: string
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: string }

export interface WorkbenchApi {
  pickFolder(): Promise<string | null>
  scanFolder(rootPath: string): Promise<Result<RepoInfo[]>>
  getSettings(): Promise<AppSettings>
  saveSettings(patch: Partial<AppSettings>): Promise<AppSettings>
}
