import type { AppSettings } from '@shared/types'
import { escapeHtml } from '../escape'

export interface PreferencesHandlers {
  onToggleReopen: (value: boolean) => void
  onClose: () => void
}

export function renderPreferences(
  container: HTMLElement,
  settings: AppSettings | null,
  handlers: PreferencesHandlers
): void {
  if (!settings) {
    container.innerHTML = ''
    return
  }

  const lastFolder = settings.lastFolderPath
    ? `<code>${escapeHtml(settings.lastFolderPath)}</code>`
    : '<span class="details__muted">none</span>'

  container.innerHTML = `
    <div class="details-overlay">
      <div class="details-panel" role="dialog" aria-modal="true">
        <button class="details__close" aria-label="Close">×</button>
        <h2 class="details__title">Preferences</h2>

        <h3 class="details__heading">Startup</h3>
        <label class="prefs__row">
          <input type="checkbox" id="prefs-reopen" ${settings.reopenLastFolder ? 'checked' : ''} />
          <span>Reopen last folder on startup</span>
        </label>

        <h3 class="details__heading">Last folder</h3>
        <p class="details__path">${lastFolder}</p>
      </div>
    </div>
  `

  const overlay = container.querySelector<HTMLDivElement>('.details-overlay')!
  const closeBtn = container.querySelector<HTMLButtonElement>('.details__close')!
  const reopen = container.querySelector<HTMLInputElement>('#prefs-reopen')!

  closeBtn.addEventListener('click', handlers.onClose)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) handlers.onClose()
  })
  reopen.addEventListener('change', () => handlers.onToggleReopen(reopen.checked))
}
