import { api } from './api'
import {
  getState,
  setRootPath,
  setLoading,
  setRepos,
  setError,
  derive,
  setSelectedId,
  getSelectedRepo,
  setViewMode
} from './store'
import { renderRepoList } from './views/repoList'
import { mountToolbar } from './views/toolbar'
import { renderRepoDetails } from './views/repoDetails'
import { renderSummary } from './views/summaryBar'
import { renderPreferences } from './views/preferences'
import { summarize } from '@shared/summary'
import type { AppSettings } from '@shared/types'

const pickButton = document.querySelector<HTMLButtonElement>('#pick-folder')
const prefsButton = document.querySelector<HTMLButtonElement>('#open-prefs')
const pathLabel = document.querySelector<HTMLParagraphElement>('#selected-path')
const toolbarContainer = document.querySelector<HTMLDivElement>('#toolbar')
const summaryContainer = document.querySelector<HTMLDivElement>('#repo-summary')
const listContainer = document.querySelector<HTMLDivElement>('#repo-list-container')
const detailsContainer = document.querySelector<HTMLDivElement>('#repo-details')
const prefsContainer = document.querySelector<HTMLDivElement>('#preferences')

let settings: AppSettings | null = null
let prefsOpen = false

const toolbar = toolbarContainer ? mountToolbar(toolbarContainer, renderList, persistViewMode) : null

function renderList(): void {
  const { repos, loading, error, viewMode } = getState()
  if (listContainer) renderRepoList(listContainer, derive(), loading, error, repos.length, viewMode)
}

function renderSummaryBar(): void {
  const { repos, loading, error } = getState()
  if (!summaryContainer) return
  const summary = loading || error ? null : summarize(repos)
  renderSummary(summaryContainer, summary)
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

function renderPrefs(): void {
  if (prefsContainer) renderPreferences(prefsContainer, prefsOpen ? settings : null, prefsHandlers)
}

const prefsHandlers = {
  onToggleReopen: async (value: boolean) => {
    settings = await api.saveSettings({ reopenLastFolder: value })
  },
  onClose: () => {
    prefsOpen = false
    renderPrefs()
  }
}

function persistViewMode(): void {
  void api.saveSettings({ viewMode: getState().viewMode })
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

async function scan(path: string): Promise<void> {
  setRootPath(path)
  showPath(path)
  setLoading(true)
  renderList()
  renderSummaryBar()

  const result = await api.scanFolder(path)

  setLoading(false)
  if (result.ok) {
    setRepos(result.data)
    toolbar?.refresh(result.data)
  } else {
    setError(result.error)
  }
  renderList()
  renderSummaryBar()
  renderDetails()
}

listContainer?.addEventListener('click', (e) => {
  const card = (e.target as HTMLElement).closest<HTMLElement>('.repo-card')
  if (card?.dataset.id) openDetails(card.dataset.id)
})

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return
  if (getState().selectedId) closeDetails()
  else if (prefsOpen) prefsHandlers.onClose()
})

pickButton?.addEventListener('click', async () => {
  const path = await api.pickFolder()
  if (!path) return
  settings = await api.saveSettings({ lastFolderPath: path })
  await scan(path)
})

prefsButton?.addEventListener('click', () => {
  prefsOpen = true
  renderPrefs()
})

async function init(): Promise<void> {
  settings = await api.getSettings()
  setViewMode(settings.viewMode)
  toolbar?.syncView()

  if (settings.reopenLastFolder && settings.lastFolderPath) {
    await scan(settings.lastFolderPath)
  } else {
    renderList()
  }
}

void init()
