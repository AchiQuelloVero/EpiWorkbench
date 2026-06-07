import type { RepoInfo, RepoFilters, SortKey, SortDir } from './types'

export function applyFilters(repos: RepoInfo[], filters: RepoFilters): RepoInfo[] {
  const q = filters.query.trim().toLowerCase()

  return repos.filter((repo) => {
    if (q && !repo.name.toLowerCase().includes(q) && !repo.path.toLowerCase().includes(q)) {
      return false
    }
    if (filters.kinds.length > 0 && !filters.kinds.includes(repo.kind)) return false
    if (filters.gitStates.length > 0 && !filters.gitStates.includes(repo.git.state)) return false
    if (filters.hasReadme !== undefined && repo.files.hasReadme !== filters.hasReadme) return false
    if (filters.hasTests !== undefined && repo.files.hasTests !== filters.hasTests) return false
    return true
  })
}

function compare(a: RepoInfo, b: RepoInfo, key: SortKey): number {
  switch (key) {
    case 'name':
      return a.name.localeCompare(b.name)
    case 'kind':
      return a.kind.localeCompare(b.kind)
    case 'gitState':
      return a.git.state.localeCompare(b.git.state)
    case 'scannedAt':
      return a.scannedAt - b.scannedAt
  }
}

export function sortRepos(repos: RepoInfo[], key: SortKey, dir: SortDir): RepoInfo[] {
  const factor = dir === 'asc' ? 1 : -1
  return [...repos].sort((a, b) => factor * compare(a, b, key))
}
