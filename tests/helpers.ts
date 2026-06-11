import type { RepoInfo, ProjectKind, GitState } from '@shared/types'

interface Overrides {
  name?: string
  path?: string
  kind?: ProjectKind
  gitState?: GitState
  hasReadme?: boolean
  hasTests?: boolean
  scannedAt?: number
  behind?: number
}

export function makeRepo(o: Overrides = {}): RepoInfo {
  return {
    id: o.path ?? o.name ?? 'id',
    name: o.name ?? 'repo',
    path: o.path ?? `/projects/${o.name ?? 'repo'}`,
    kind: o.kind ?? 'unknown',
    git: {
      isRepo: true,
      state: o.gitState ?? 'clean',
      currentBranch: 'main',
      ahead: 0,
      behind: o.behind ?? 0,
      staged: 0,
      unstaged: 0,
      untracked: 0
    },
    files: {
      hasReadme: o.hasReadme ?? false,
      readmePath: o.hasReadme ? 'README.md' : null,
      hasMakefile: false,
      hasTests: o.hasTests ?? false,
      testPaths: [],
      sourceFolders: [],
      configFiles: []
    },
    scannedAt: o.scannedAt ?? 0
  }
}
