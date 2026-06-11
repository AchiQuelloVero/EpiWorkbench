import simpleGit from 'simple-git'
import type { GitStatus, GitState } from '@shared/types'

export async function getGitStatus(repoPath: string): Promise<GitStatus> {
  const git = simpleGit(repoPath)

  try {
    const isRepo = await git.checkIsRepo()
    if (!isRepo) {
      return {
        isRepo: false,
        state: 'not-a-repo',
        currentBranch: null,
        ahead: 0,
        behind: 0,
        staged: 0,
        unstaged: 0,
        untracked: 0
      }
    }

    const status = await git.status()

    const isDirty =
      status.staged.length > 0 ||
      status.modified.length > 0 ||
      status.deleted.length > 0 ||
      status.not_added.length > 0

    let state: GitState
    if (isDirty) {
      state = 'dirty'
    } else if (!status.tracking) {
      state = 'no-upstream'
    } else {
      state = 'clean'
    }

    return {
      isRepo: true,
      state,
      currentBranch: status.current,
      ahead: status.ahead,
      behind: status.behind,
      staged: status.staged.length,
      unstaged: status.modified.length + status.deleted.length,
      untracked: status.not_added.length
    }
  } catch {
    return {
      isRepo: true,
      state: 'error',
      currentBranch: null,
      ahead: 0,
      behind: 0,
      staged: 0,
      unstaged: 0,
      untracked: 0
    }
  }
}
