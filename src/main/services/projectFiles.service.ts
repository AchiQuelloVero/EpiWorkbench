import { promises as fs } from 'node:fs'
import { join, extname } from 'node:path'
import type { ProjectFiles, ProjectKind } from '@shared/types'

const SOURCE_DIRS = new Set(['src', 'lib', 'include', 'source', 'sources'])
const TEST_DIRS = new Set(['test', 'tests', 'spec', '__tests__'])
const CONFIG_FILES = new Set([
  'package.json',
  'makefile',
  'cmakelists.txt',
  'requirements.txt',
  'setup.py',
  'pyproject.toml',
  'cargo.toml'
])

const CPP_EXT = new Set(['.cpp', '.cc', '.cxx', '.hpp', '.hh', '.hxx'])
const C_EXT = new Set(['.c', '.h'])

function isReadme(name: string): boolean {
  return /^readme(\.|$)/i.test(name)
}

function isMakefile(name: string): boolean {
  return /^(gnu)?makefile$/i.test(name)
}

function isTestFile(name: string): boolean {
  return /(\.test\.|\.spec\.|_test\.)/i.test(name)
}

async function collectExtensions(dirPath: string, into: Set<string>): Promise<void> {
  let entries
  try {
    entries = await fs.readdir(dirPath, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (entry.isFile()) into.add(extname(entry.name).toLowerCase())
  }
}

function deriveKind(configFiles: string[], exts: Set<string>): ProjectKind {
  const lower = configFiles.map((f) => f.toLowerCase())
  if (lower.includes('package.json')) return 'node'
  if (lower.includes('requirements.txt') || lower.includes('setup.py') || lower.includes('pyproject.toml')) {
    return 'python'
  }
  if ([...exts].some((e) => CPP_EXT.has(e))) return 'cpp'
  if ([...exts].some((e) => C_EXT.has(e))) return 'c'
  if (exts.has('.py')) return 'python'
  return 'unknown'
}

export async function detectProjectFiles(repoPath: string): Promise<{ files: ProjectFiles; kind: ProjectKind }> {
  const empty: ProjectFiles = {
    hasReadme: false,
    readmePath: null,
    hasMakefile: false,
    hasTests: false,
    testPaths: [],
    sourceFolders: [],
    configFiles: []
  }

  let entries
  try {
    entries = await fs.readdir(repoPath, { withFileTypes: true })
  } catch {
    return { files: empty, kind: 'unknown' }
  }

  const files: ProjectFiles = { ...empty, testPaths: [], sourceFolders: [], configFiles: [] }
  const exts = new Set<string>()

  for (const entry of entries) {
    const name = entry.name

    if (entry.isDirectory()) {
      const lower = name.toLowerCase()
      if (SOURCE_DIRS.has(lower)) files.sourceFolders.push(name)
      if (TEST_DIRS.has(lower)) {
        files.hasTests = true
        files.testPaths.push(name)
      }
      continue
    }

    if (entry.isFile()) exts.add(extname(name).toLowerCase())
    if (isReadme(name)) {
      files.hasReadme = true
      files.readmePath = name
    }
    if (isMakefile(name)) files.hasMakefile = true
    if (isTestFile(name)) {
      files.hasTests = true
      files.testPaths.push(name)
    }
    if (CONFIG_FILES.has(name.toLowerCase())) files.configFiles.push(name)
  }

  for (const folder of files.sourceFolders) {
    await collectExtensions(join(repoPath, folder), exts)
  }

  return { files, kind: deriveKind(files.configFiles, exts) }
}
