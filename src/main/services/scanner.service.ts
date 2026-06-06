import { promises as fs } from 'node:fs'
import { join, basename } from 'node:path'
import type { RepoInfo, ProjectFiles } from '@shared/types'
import { getGitStatus } from './git.service'

const PLACEHOLDER_FILES: ProjectFiles = {
  hasReadme: false,
  readmePath: null,
  hasMakefile: false,
  hasTests: false,
  testPaths: [],
  sourceFolders: [],
  configFiles: []
}

function makeId(path: string): string {
  return Buffer.from(path).toString('base64url')
}

async function isRepo(dirPath: string): Promise<boolean> {
  try {
    await fs.access(join(dirPath, '.git'))
    return true
  } catch {
    return false
  }
}

export async function scanFolder(rootPath: string): Promise<RepoInfo[]> {
  const entries = await fs.readdir(rootPath, { withFileTypes: true })
  const dirs = entries.filter((e) => e.isDirectory())

  const results: RepoInfo[] = []

  for (const dir of dirs) {
    const fullPath = join(rootPath, dir.name)
    if (await isRepo(fullPath)) {
      const git = await getGitStatus(fullPath)
      results.push({
        id: makeId(fullPath),
        name: basename(fullPath),
        path: fullPath,
        kind: 'unknown',
        git,
        files: PLACEHOLDER_FILES,
        scannedAt: Date.now()
      })
    }
  }

  return results
}
