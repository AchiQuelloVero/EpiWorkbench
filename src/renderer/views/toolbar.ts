import type { RepoInfo, ProjectKind, GitState, SortKey } from '@shared/types'
import { getState, setQuery, setKindFilter, setGitStateFilter, setSortKey, toggleSortDir } from '../store'
import { KIND_LABEL, STATE_LABEL } from './repoList'

function unique<T>(values: T[]): T[] {
  return [...new Set(values)]
}

function option(value: string, label: string, selected: boolean): string {
  return `<option value="${value}"${selected ? ' selected' : ''}>${label}</option>`
}

export function mountToolbar(container: HTMLElement, onChange: () => void): (repos: RepoInfo[]) => void {
  container.innerHTML = `
    <div class="toolbar">
      <input id="tb-search" class="toolbar__search" type="search" placeholder="Search name or path…" />
      <select id="tb-kind" class="toolbar__select" aria-label="Filter by language"></select>
      <select id="tb-state" class="toolbar__select" aria-label="Filter by git state"></select>
      <select id="tb-sort" class="toolbar__select" aria-label="Sort by">
        <option value="name">Name</option>
        <option value="kind">Language</option>
        <option value="gitState">Git state</option>
        <option value="scannedAt">Scanned</option>
      </select>
      <button id="tb-dir" class="toolbar__dir" title="Toggle sort direction">↑</button>
    </div>
  `

  const search = container.querySelector<HTMLInputElement>('#tb-search')!
  const kindSel = container.querySelector<HTMLSelectElement>('#tb-kind')!
  const stateSel = container.querySelector<HTMLSelectElement>('#tb-state')!
  const sortSel = container.querySelector<HTMLSelectElement>('#tb-sort')!
  const dirBtn = container.querySelector<HTMLButtonElement>('#tb-dir')!

  search.addEventListener('input', () => {
    setQuery(search.value)
    onChange()
  })
  kindSel.addEventListener('change', () => {
    setKindFilter(kindSel.value === 'all' ? null : (kindSel.value as ProjectKind))
    onChange()
  })
  stateSel.addEventListener('change', () => {
    setGitStateFilter(stateSel.value === 'all' ? null : (stateSel.value as GitState))
    onChange()
  })
  sortSel.addEventListener('change', () => {
    setSortKey(sortSel.value as SortKey)
    onChange()
  })
  dirBtn.addEventListener('click', () => {
    toggleSortDir()
    dirBtn.textContent = getState().sortDir === 'asc' ? '↑' : '↓'
    onChange()
  })

  function refresh(repos: RepoInfo[]): void {
    const { filters } = getState()

    const kinds = unique(repos.map((r) => r.kind)).sort()
    kindSel.innerHTML =
      option('all', 'All languages', filters.kinds.length === 0) +
      kinds.map((k) => option(k, KIND_LABEL[k] || k, filters.kinds[0] === k)).join('')

    const states = unique(repos.map((r) => r.git.state)).sort()
    stateSel.innerHTML =
      option('all', 'All git states', filters.gitStates.length === 0) +
      states.map((s) => option(s, STATE_LABEL[s], filters.gitStates[0] === s)).join('')
  }

  refresh([])
  return refresh
}