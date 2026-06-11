import { describe, it, expect } from 'vitest'
import { summarize } from '@shared/summary'
import { makeRepo } from './helpers'

describe('summarize', () => {
  it('returns all-zero counts for an empty list', () => {
    expect(summarize([])).toEqual({
      total: 0,
      clean: 0,
      dirty: 0,
      behind: 0,
      missingReadme: 0,
      missingTests: 0
    })
  })

  it('counts clean, dirty, behind, and missing files across repos', () => {
    const repos = [
      makeRepo({ gitState: 'clean', hasReadme: true, hasTests: true }),
      makeRepo({ gitState: 'dirty', hasReadme: false, hasTests: true }),
      makeRepo({ gitState: 'clean', behind: 2, hasReadme: true, hasTests: false })
    ]

    expect(summarize(repos)).toEqual({
      total: 3,
      clean: 2,
      dirty: 1,
      behind: 1,
      missingReadme: 1,
      missingTests: 1
    })
  })
})
