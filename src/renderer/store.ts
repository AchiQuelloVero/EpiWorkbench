import type { RepoInfo } from '@shared/types'

interface State {
  rootPath: string | null
  repos: RepoInfo[]
  loading: boolean
  error: string | null
}

const state: State = {
  rootPath: null,
  repos: [],
  loading: false,
  error: null
}

export function getState(): Readonly<State> {
  return state
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
}

export function setError(error: string): void {
  state.error = error
  state.repos = []
}
