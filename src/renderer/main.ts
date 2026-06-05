import { api } from './api'

const pickButton = document.querySelector<HTMLButtonElement>('#pick-folder')
const pathLabel = document.querySelector<HTMLParagraphElement>('#selected-path')

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
})
