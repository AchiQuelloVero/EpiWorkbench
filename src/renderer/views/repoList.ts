import type { RepoInfo, GitState } from '@shared/types'

const STATE_LABEL: Record<GitState, string> = {
  clean: 'clean',
  dirty: 'dirty',
  'no-upstream': 'no upstream',
  'not-a-repo': 'not a repo',
  error: 'error'
}

function gitBadge(state: GitState, branch: string | null): string {
  const label = STATE_LABEL[state]
  const branchText = branch ? `<span class="repo-card__branch">${branch}</span>` : ''
  return `${branchText}<span class="repo-card__badge repo-card__badge--${state}">${label}</span>`
}

function repoCard(repo: RepoInfo): string {
  return `
    <li class="repo-card" data-id="${repo.id}">
      <div class="repo-card__top">
        <span class="repo-card__name">${repo.name}</span>
        <div class="repo-card__meta">${gitBadge(repo.git.state, repo.git.currentBranch)}</div>
      </div>
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
