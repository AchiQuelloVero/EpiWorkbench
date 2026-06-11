import { describe, it, expect } from 'vitest'
import { applyFilters, sortRepos } from '@shared/filters'
import type { RepoFilters } from '@shared/types'
import { makeRepo } from './helpers'

const noFilters: RepoFilters = { query: '', kinds: [], gitStates: [] }

describe('applyFilters', () => {
  const repos = [
    makeRepo({ name: 'alpha', kind: 'c', gitState: 'clean', hasReadme: true, hasTests: true }),
    makeRepo({ name: 'beta', kind: 'rust', gitState: 'dirty', hasReadme: false, hasTests: false }),
    makeRepo({ name: 'gamma', kind: 'c', gitState: 'dirty', hasReadme: true, hasTests: false })
  ]

  it('returns everything with empty filters', () => {
    expect(applyFilters(repos, noFilters)).toHaveLength(3)
  })

  it('matches the query against the name (case-insensitive)', () => {
    const out = applyFilters(repos, { ...noFilters, query: 'ALPH' })
    expect(out.map((r) => r.name)).toEqual(['alpha'])
  })

  it('matches the query against the path', () => {
    const out = applyFilters(repos, { ...noFilters, query: '/projects/beta' })
    expect(out.map((r) => r.name)).toEqual(['beta'])
  })

  it('filters by kind', () => {
    const out = applyFilters(repos, { ...noFilters, kinds: ['c'] })
    expect(out.map((r) => r.name)).toEqual(['alpha', 'gamma'])
  })

  it('filters by git state', () => {
    const out = applyFilters(repos, { ...noFilters, gitStates: ['dirty'] })
    expect(out.map((r) => r.name)).toEqual(['beta', 'gamma'])
  })

  it('filters by hasReadme and hasTests', () => {
    expect(applyFilters(repos, { ...noFilters, hasReadme: true }).map((r) => r.name)).toEqual([
      'alpha',
      'gamma'
    ])
    expect(applyFilters(repos, { ...noFilters, hasTests: true }).map((r) => r.name)).toEqual(['alpha'])
  })

  it('combines multiple criteria (AND)', () => {
    const out = applyFilters(repos, { ...noFilters, kinds: ['c'], gitStates: ['dirty'] })
    expect(out.map((r) => r.name)).toEqual(['gamma'])
  })
})

describe('sortRepos', () => {
  const repos = [
    makeRepo({ name: 'banana', kind: 'rust', scannedAt: 30 }),
    makeRepo({ name: 'apple', kind: 'c', scannedAt: 10 }),
    makeRepo({ name: 'cherry', kind: 'node', scannedAt: 20 })
  ]

  it('sorts by name ascending and descending', () => {
    expect(sortRepos(repos, 'name', 'asc').map((r) => r.name)).toEqual(['apple', 'banana', 'cherry'])
    expect(sortRepos(repos, 'name', 'desc').map((r) => r.name)).toEqual(['cherry', 'banana', 'apple'])
  })

  it('sorts by scannedAt numerically', () => {
    expect(sortRepos(repos, 'scannedAt', 'asc').map((r) => r.scannedAt)).toEqual([10, 20, 30])
  })

  it('sorts by kind', () => {
    expect(sortRepos(repos, 'kind', 'asc').map((r) => r.kind)).toEqual(['c', 'node', 'rust'])
  })

  it('does not mutate the input array', () => {
    const original = [...repos]
    sortRepos(repos, 'name', 'asc')
    expect(repos).toEqual(original)
  })
})
