import type { RepoInfo, GitState, ProjectFiles, ProjectKind } from '@shared/types'

const STATE_LABEL: Record<GitState, string> = {
  clean: 'clean',
  dirty: 'dirty',
  'no-upstream': 'no upstream',
  'not-a-repo': 'not a repo',
  error: 'error'
}

const KIND_LABEL: Record<ProjectKind, string> = {
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
