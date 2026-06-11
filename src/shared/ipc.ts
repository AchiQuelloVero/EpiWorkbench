import type { RepoInfo } from './types'

export const IPC = {
  pickFolder: 'dialog:pickFolder',
  scanFolder: 'scan:folder'
} as const

export interface ScanRequest {
  rootPath: string
}

export type Result<T> = { ok: true; data: T } | { ok: false; error: string }

export interface WorkbenchApi {
  pickFolder(): Promise<string | null>
  scanFolder(rootPath: string): Promise<Result<RepoInfo[]>>
}
