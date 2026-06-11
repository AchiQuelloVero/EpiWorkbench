import type { RepoInfo } from './types'

export interface RepoSummary {
  total: number
  clean: number
  dirty: number
  behind: number
  missingReadme: number
  missingTests: number
}

export function summarize(repos: RepoInfo[]): RepoSummary {
  const summary: RepoSummary = {
    total: repos.length,
    clean: 0,
    dirty: 0,
    behind: 0,
    missingReadme: 0,
    missingTests: 0
  }

  for (const repo of repos) {
    if (repo.git.state === 'clean') summary.clean++
    if (repo.git.state === 'dirty') summary.dirty++
    if (repo.git.behind > 0) summary.behind++
    if (!repo.files.hasReadme) summary.missingReadme++
    if (!repo.files.hasTests) summary.missingTests++
  }

  return summary
}
