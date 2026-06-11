import type { RepoInfo } from '@shared/types'
import { KIND_LABEL, STATE_LABEL } from './repoList'

function unique(values: string[]): string[] {
  return [...new Set(values)]
}

function row(label: string, value: string): string {
  return `
    <div class="details__row">
      <span class="details__label">${label}</span>
      <span class="details__value">${value}</span>
    </div>
  `
}

function list(values: string[]): string {
  if (values.length === 0) return '<span class="details__muted">none</span>'
  return unique(values)
    .map((v) => `<code class="details__tag">${v}</code>`)
    .join(' ')
}

function gitSection(repo: RepoInfo): string {
  const g = repo.git
  if (!g.isRepo) {
    return row(
      'State',
      `<span class="repo-card__badge repo-card__badge--${g.state}">${STATE_LABEL[g.state]}</span>`
    )
  }
  return [
    row(
      'Branch',
      g.currentBranch ? `<code>${g.currentBranch}</code>` : '<span class="details__muted">—</span>'
    ),
    row(
      'State',
      `<span class="repo-card__badge repo-card__badge--${g.state}">${STATE_LABEL[g.state]}</span>`
    ),
    row('Ahead / Behind', `↑ ${g.ahead} &nbsp; ↓ ${g.behind}`),
    row('Staged', String(g.staged)),
    row('Unstaged', String(g.unstaged)),
    row('Untracked', String(g.untracked))
  ].join('')
}

function filesSection(repo: RepoInfo): string {
  const f = repo.files
  return [
    row(
      'README',
      f.hasReadme && f.readmePath
        ? `<code>${f.readmePath}</code>`
        : '<span class="details__muted">none</span>'
    ),
    row('Makefile', f.hasMakefile ? 'yes' : '<span class="details__muted">no</span>'),
    row('Tests', list(f.testPaths)),
    row('Source folders', list(f.sourceFolders)),
    row('Config files', list(f.configFiles))
  ].join('')
}

export function renderRepoDetails(container: HTMLElement, repo: RepoInfo | null, onClose: () => void): void {
  if (!repo) {
    container.innerHTML = ''
    return
  }

  const kindLabel = KIND_LABEL[repo.kind]
  const kindTag = kindLabel ? `<span class="repo-card__kind">${kindLabel}</span>` : ''

  container.innerHTML = `
    <div class="details-overlay">
      <div class="details-panel" role="dialog" aria-modal="true">
        <button class="details__close" aria-label="Close">×</button>
        <h2 class="details__title">${repo.name} ${kindTag}</h2>
        <p class="details__path">${repo.path}</p>

        <h3 class="details__heading">Git status</h3>
        ${gitSection(repo)}

        <h3 class="details__heading">Project files</h3>
        ${filesSection(repo)}
      </div>
    </div>
  `

  const overlay = container.querySelector<HTMLDivElement>('.details-overlay')!
  const closeBtn = container.querySelector<HTMLButtonElement>('.details__close')!

  closeBtn.addEventListener('click', onClose)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) onClose()
  })
}
