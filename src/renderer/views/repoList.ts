import type { RepoInfo } from '@shared/types'

function repoCard(repo: RepoInfo): string {
  return `
    <li class="repo-card" data-id="${repo.id}">
      <span class="repo-card__name">${repo.name}</span>
      <span class="repo-card__path">${repo.path}</span>
    </li>
  `
}

export function renderRepoList(
  container: HTMLElement,
  repos: RepoInfo[],
  loading: boolean,
  error: string | null
): void {
  if (loading) {
    container.innerHTML = '<p class="state-msg">Scanning…</p>'
    return
  }

  if (error) {
    container.innerHTML = `<p class="state-msg state-msg--error">${error}</p>`
    return
  }

  if (repos.length === 0) {
    container.innerHTML = '<p class="state-msg">No repositories found in this folder.</p>'
    return
  }

  container.innerHTML = `<ul class="repo-list">${repos.map(repoCard).join('')}</ul>`
}
