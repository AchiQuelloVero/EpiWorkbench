import type { RepoInfo, RepoFilters, ProjectKind, GitState, SortKey } from '@shared/types'
import { applyFilters, sortRepos } from '@shared/filters'

interface State {
  rootPath: string | null
  repos: RepoInfo[]
  loading: boolean
  error: string | null
  filters: RepoFilters
  sortKey: SortKey
  sortDir: 'asc' | 'desc'
  selectedId: string | null
}

const state: State = {
  rootPath: null,
  repos: [],
  loading: false,
  error: null,
  filters: { query: '', kinds: [], gitStates: [] },
  sortKey: 'name',
  sortDir: 'asc',
  selectedId: null
}

export function getState(): Readonly<State> {
  return state
}

export function setSelectedId(id: string | null): void {
  state.selectedId = id
}

export function getSelectedRepo(): RepoInfo | null {
  return state.repos.find((r) => r.id === state.selectedId) ?? null
}

export function setRootPath(path: string | null): void {
  state.rootPath = path
}

export function setLoading(loading: boolean): void {
  state.loading = loading
}

export function setRepos(repos: RepoInfo[]): void {
  state.repos = repos
  state.error = null
  state.selectedId = null
}

export function setError(error: string): void {
  state.error = error
  state.repos = []
  state.selectedId = null
}

export function setQuery(query: string): void {
  state.filters.query = query
}

export function setKindFilter(kind: ProjectKind | null): void {
  state.filters.kinds = kind ? [kind] : []
}

export function setGitStateFilter(gitState: GitState | null): void {
  state.filters.gitStates = gitState ? [gitState] : []
}

export function setSortKey(key: SortKey): void {
  state.sortKey = key
}

export function toggleSortDir(): void {
  state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc'
}

export function derive(): RepoInfo[] {
  return sortRepos(applyFilters(state.repos, state.filters), state.sortKey, state.sortDir)
}
