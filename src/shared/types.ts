export type ProjectKind =
  | 'c'
  | 'cpp'
  | 'node'
  | 'python'
  | 'rust'
  | 'haskell'
  | 'javascript'
  | 'shell'
  | 'groovy'
  | 'jinja'
  | 'ansible'
  | 'unknown'

export type GitState = 'clean' | 'dirty' | 'no-upstream' | 'not-a-repo' | 'error'

export interface GitStatus {
  isRepo: boolean
  state: GitState
  currentBranch: string | null
  ahead: number
  behind: number
  staged: number
  unstaged: number
  untracked: number
  lastCommit?: { hash: string; message: string; date: string } | null
}

export interface ProjectFiles {
  hasReadme: boolean
  readmePath: string | null
  hasMakefile: boolean
  hasTests: boolean
  testPaths: string[]
  sourceFolders: string[]
  configFiles: string[]
}

export interface RepoInfo {
  id: string
  name: string
  path: string
  kind: ProjectKind
  git: GitStatus
  files: ProjectFiles
  scannedAt: number
}

export type SortKey = 'name' | 'kind' | 'gitState' | 'scannedAt'
export type SortDir = 'asc' | 'desc'

export interface RepoFilters {
  query: string
  kinds: ProjectKind[]
  gitStates: GitState[]
  hasReadme?: boolean
  hasTests?: boolean
}

export interface AppSettings {
  lastFolderPath: string | null
  viewMode: 'list' | 'card'
  reopenLastFolder: boolean
}
