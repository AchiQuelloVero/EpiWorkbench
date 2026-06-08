import type { RepoInfo, GitState, ProjectFiles, ProjectKind } from '@shared/types'

export const STATE_LABEL: Record<GitState, string> = {
  clean: 'clean',
  dirty: 'dirty',
  'no-upstream': 'no upstream',
  'not-a-repo': 'not a repo',
  error: 'error'
}

export const KIND_LABEL: Record<ProjectKind, string> = {
  c: 'C',
  cpp: 'C++',
  node: 'Node',
  python: 'Python',
  rust: 'Rust',
  haskell: 'Haskell',
  javascript: 'JavaScript',
  shell: 'Shell',
  groovy: 'Groovy',
  jinja: 'Jinja',
  ansible: 'Ansible',
  unknown: ''
}

function gitBadge(state: GitState, branch: string | null): string {
  const label = STATE_LABEL[state]
  const branchText = branch ? `<span class="repo-card__branch">${branch}</span>` : ''
  return `${branchText}<span class="repo-card__badge repo-card__badge--${state}">${label}</span>`
}

function chip(label: string, present: boolean): string {
  const mod = present ? 'is-on' : 'is-off'
  return `<span class="repo-card__chip repo-card__chip--${mod}">${label}</span>`
}

function fileIndicators(files: ProjectFiles): string {
  return `
    ${chip('README', files.hasReadme)}
    ${chip('Makefile', files.hasMakefile)}
    ${chip('tests', files.hasTests)}
    ${chip('src', files.sourceFolders.length > 0)}
  `
}

function kindTag(kind: ProjectKind): string {
  const label = KIND_LABEL[kind]
  return label ? `<span class="repo-card__kind">${label}</span>` : ''
}

function repoCard(repo: RepoInfo): string {
  return `
    <li class="repo-card" data-id="${repo.id}">
      <div class="repo-card__top">
        <span class="repo-card__name">${repo.name}${kindTag(repo.kind)}</span>
        <div class="repo-card__meta">${gitBadge(repo.git.state, repo.git.currentBranch)}</div>
      </div>
      <span class="repo-card__path">${repo.path}</span>
      <div class="repo-card__chips">${fileIndicators(repo.files)}</div>
    </li>
  `
}

function countLabel(visible: number, total: number): string {
  const noun = total === 1 ? 'repository' : 'repositories'
  const text = visible === total ? `${total} ${noun}` : `${visible} of ${total} ${noun}`
  return `<p class="repo-count">${text}</p>`
}

export function renderRepoList(
  container: HTMLElement,
  repos: RepoInfo[],
  loading: boolean,
  error: string | null,
  totalCount = repos.length,
  viewMode: 'list' | 'card' = 'list'
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
    const msg =
      totalCount > 0
        ? 'No repositories match your search or filters.'
        : 'No repositories found in this folder.'
    container.innerHTML = `<p class="state-msg">${msg}</p>`
    return
  }

  container.innerHTML =
    countLabel(repos.length, totalCount) +
    `<ul class="repo-list repo-list--${viewMode}">${repos.map(repoCard).join('')}</ul>`
}
