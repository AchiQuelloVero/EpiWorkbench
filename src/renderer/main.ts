import { api } from './api'
import { getState, setRootPath, setLoading, setRepos, setError, derive } from './store'
import { renderRepoList } from './views/repoList'
import { mountToolbar } from './views/toolbar'

const pickButton = document.querySelector<HTMLButtonElement>('#pick-folder')
const pathLabel = document.querySelector<HTMLParagraphElement>('#selected-path')
const toolbarContainer = document.querySelector<HTMLDivElement>('#toolbar')
const listContainer = document.querySelector<HTMLDivElement>('#repo-list-container')

const refreshToolbar = toolbarContainer ? mountToolbar(toolbarContainer, renderList) : null

function renderList(): void {
  const { repos, loading, error } = getState()
  if (listContainer) renderRepoList(listContainer, derive(), loading, error, repos.length)
}

function showPath(path: string | null): void {
  if (!pathLabel) return
  if (path) {
    pathLabel.textContent = path
    pathLabel.dataset.empty = 'false'
  } else {
    pathLabel.textContent = 'No folder selected'
    pathLabel.dataset.empty = 'true'
  }
}

pickButton?.addEventListener('click', async () => {
  const path = await api.pickFolder()
  showPath(path)

  if (!path) return

  setRootPath(path)
  setLoading(true)
  renderList()

  const result = await api.scanFolder(path)

  setLoading(false)
  if (result.ok) {
    setRepos(result.data)
    refreshToolbar?.(result.data)
  } else {
    setError(result.error)
  }
  renderList()
})