import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { app } from 'electron'
import type { AppSettings } from '@shared/types'

const DEFAULTS: AppSettings = {
  lastFolderPath: null,
  viewMode: 'list',
  reopenLastFolder: true
}

function settingsPath(): string {
  return join(app.getPath('userData'), 'settings.json')
}

export async function getSettings(): Promise<AppSettings> {
  try {
    const raw = await fs.readFile(settingsPath(), 'utf-8')
    const parsed = JSON.parse(raw) as Partial<AppSettings>
    return { ...DEFAULTS, ...parsed }
  } catch {
    return { ...DEFAULTS }
  }
}

export async function saveSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getSettings()
  const next = { ...current, ...patch }
  await fs.writeFile(settingsPath(), JSON.stringify(next, null, 2), 'utf-8')
  return next
}
