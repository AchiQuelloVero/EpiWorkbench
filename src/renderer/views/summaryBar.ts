import type { RepoSummary } from '@shared/summary'

type Tone = 'neutral' | 'good' | 'warn' | 'info' | 'muted'

function stat(label: string, value: number, tone: Tone): string {
  return `
    <span class="summary__stat summary__stat--${tone}">
      <span class="summary__value">${value}</span>
      <span class="summary__label">${label}</span>
    </span>
  `
}

export function renderSummary(container: HTMLElement, summary: RepoSummary | null): void {
  if (!summary || summary.total === 0) {
    container.innerHTML = ''
    return
  }

  container.innerHTML = `
    <div class="summary">
      ${stat('repos', summary.total, 'neutral')}
      ${stat('clean', summary.clean, 'good')}
      ${stat('dirty', summary.dirty, 'warn')}
      ${stat('behind', summary.behind, 'info')}
      ${stat('no README', summary.missingReadme, 'muted')}
      ${stat('no tests', summary.missingTests, 'muted')}
    </div>
  `
}
