import { describe, it, expect } from 'vitest'
import { deriveKind, isAnsible } from '../src/main/services/projectFiles.service'

function exts(...e: string[]): Set<string> {
  return new Set(e)
}

describe('deriveKind', () => {
  it('detects ecosystems from config files first', () => {
    expect(deriveKind(['package.json'], exts('.js'))).toBe('node')
    expect(deriveKind(['Cargo.toml'], exts('.rs'))).toBe('rust')
    expect(deriveKind(['stack.yaml'], exts())).toBe('haskell')
    expect(deriveKind(['project.cabal'], exts())).toBe('haskell')
    expect(deriveKind(['requirements.txt'], exts())).toBe('python')
    expect(deriveKind(['Jenkinsfile'], exts())).toBe('groovy')
  })

  it('keeps package.json as node even though it is full of .js files', () => {
    expect(deriveKind(['package.json'], exts('.js', '.mjs'))).toBe('node')
  })

  it('distinguishes C from C++ by extension, C++ winning when mixed', () => {
    expect(deriveKind([], exts('.c', '.h'))).toBe('c')
    expect(deriveKind([], exts('.cpp', '.hpp'))).toBe('cpp')
    expect(deriveKind([], exts('.c', '.cpp'))).toBe('cpp')
  })

  it('falls back to loose script/template languages only when nothing stronger matched', () => {
    expect(deriveKind([], exts('.js'))).toBe('javascript')
    expect(deriveKind([], exts('.sh'))).toBe('shell')
    expect(deriveKind([], exts('.j2'))).toBe('jinja')
    expect(deriveKind([], exts('.c', '.sh'))).toBe('c')
  })

  it('returns unknown when there are no recognizable signals', () => {
    expect(deriveKind([], exts('.txt', '.md'))).toBe('unknown')
  })
})

describe('isAnsible', () => {
  it('matches an ansible.cfg', () => {
    expect(isAnsible(['ansible.cfg'], new Set())).toBe(true)
  })

  it('matches a playbook alongside roles/', () => {
    expect(isAnsible(['playbook.yml'], new Set(['roles']))).toBe(true)
  })

  it('matches roles/ together with group_vars/', () => {
    expect(isAnsible([], new Set(['roles', 'group_vars']))).toBe(true)
  })

  it('matches a playbook alongside host_vars/', () => {
    expect(isAnsible(['site.yaml'], new Set(['host_vars']))).toBe(true)
  })

  it('does not match a lone playbook or a lone roles/ directory', () => {
    expect(isAnsible(['playbook.yml'], new Set())).toBe(false)
    expect(isAnsible([], new Set(['roles']))).toBe(false)
  })
})
