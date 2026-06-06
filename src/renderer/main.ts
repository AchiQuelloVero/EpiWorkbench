import { api } from './api'
import { getState, setRootPath, setLoading, setRepos, setError } from './store'
import { renderRepoList } from './views/repoList'

const pickButton = document.querySelector<HTMLButtonElement>('#pick-folder')
const pathLabel = document.querySelector<HTMLParagraphElement>('#selected-path')
const listContainer = document.querySelector<HTMLDivElement>('#repo-list-container')

function render(): void {
  const { repos, loading, error } = getState()
  if (listContainer) renderRepoList(listContainer, repos, loading, error)
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
  render()

  const result = await api.scanFolder(path)

  setLoading(false)
  if (result.ok) {
    setRepos(result.data)
  } else {
    setError(result.error)
  }
  render()
})
