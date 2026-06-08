import { api } from './api'
import {
  getState,
  setRootPath,
  setLoading,
  setRepos,
  setError,
  derive,
  setSelectedId,
  getSelectedRepo
} from './store'
import { renderRepoList } from './views/repoList'
import { mountToolbar } from './views/toolbar'
import { renderRepoDetails } from './views/repoDetails'

const pickButton = document.querySelector<HTMLButtonElement>('#pick-folder')
const pathLabel = document.querySelector<HTMLParagraphElement>('#selected-path')
const toolbarContainer = document.querySelector<HTMLDivElement>('#toolbar')
const listContainer = document.querySelector<HTMLDivElement>('#repo-list-container')
const detailsContainer = document.querySelector<HTMLDivElement>('#repo-details')

const refreshToolbar = toolbarContainer ? mountToolbar(toolbarContainer, renderList) : null

function renderList(): void {
  const { repos, loading, error, viewMode } = getState()
  if (listContainer) renderRepoList(listContainer, derive(), loading, error, repos.length, viewMode)
}

function renderDetails(): void {
  if (detailsContainer) renderRepoDetails(detailsContainer, getSelectedRepo(), closeDetails)
}

function openDetails(id: string): void {
  setSelectedId(id)
  renderDetails()
}

function closeDetails(): void {
  setSelectedId(null)
  renderDetails()
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

listContainer?.addEventListener('click', (e) => {
  const card = (e.target as HTMLElement).closest<HTMLElement>('.repo-card')
  if (card?.dataset.id) openDetails(card.dataset.id)
})

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && getState().selectedId) closeDetails()
})

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
  renderDetails()
})
