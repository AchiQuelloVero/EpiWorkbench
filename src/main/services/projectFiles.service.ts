import { promises as fs } from 'node:fs'
import { join, extname, basename } from 'node:path'
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
  'cargo.toml',
  'stack.yaml',
  'package.yaml',
  'jenkinsfile',
  'ansible.cfg',
  'playbook.yml',
  'playbook.yaml',
  'site.yml',
  'site.yaml'
])

const IGNORE_DIRS = new Set([
  'node_modules',
  'build',
  'dist',
  'out',
  'target',
  'dist-newstyle',
  '.stack-work',
  'vendor',
  'bin',
  'obj',
  'cmake-build-debug'
])

const CPP_EXT = new Set(['.cpp', '.cc', '.cxx', '.hpp', '.hh', '.hxx'])
const C_EXT = new Set(['.c', '.h'])
const JS_EXT = new Set(['.js', '.mjs', '.cjs', '.jsx'])
const SHELL_EXT = new Set(['.sh', '.bash', '.zsh'])
const JINJA_EXT = new Set(['.jinja', '.jinja2', '.j2'])

function isConfigFile(name: string): boolean {
  const lower = name.toLowerCase()
  return CONFIG_FILES.has(lower) || lower.endsWith('.cabal')
}

function isReadme(name: string): boolean {
  return /^readme(\.|$)/i.test(name)
}

function isMakefile(name: string): boolean {
  return /^(gnu)?makefile$/i.test(name)
}

function isTestFile(name: string): boolean {
  return /(\.test\.|\.spec\.|_test\.)/i.test(name)
}

function isIgnoredDir(name: string): boolean {
  return name.startsWith('.') || IGNORE_DIRS.has(name.toLowerCase())
}

function hasAny(exts: Set<string>, candidates: Set<string>): boolean {
  for (const e of candidates) if (exts.has(e)) return true
  return false
}

// Ansible repos are pure YAML, so they can't be detected by extension, instead it's better to match the typical structure: an inventory/config marker, or a playbook alongside a roles/ or *_vars/ directory.
export function isAnsible(configFiles: string[], rootDirs: Set<string>): boolean {
  const cfg = configFiles.map((f) => f.toLowerCase())
  const hasAnsibleCfg = cfg.includes('ansible.cfg')
  const hasPlaybook = cfg.some((f) => /^(playbook|site)\.ya?ml$/.test(f))
  const hasRoles = rootDirs.has('roles')
  const hasVars = rootDirs.has('group_vars') || rootDirs.has('host_vars')

  return hasAnsibleCfg || (hasRoles && (hasPlaybook || hasVars)) || (hasPlaybook && hasVars)
}

export function deriveKind(configFiles: string[], exts: Set<string>): ProjectKind {
  const lower = configFiles.map((f) => f.toLowerCase())

  if (lower.includes('package.json')) return 'node'
  if (lower.includes('cargo.toml')) return 'rust'
  if (lower.some((f) => f.endsWith('.cabal') || f === 'stack.yaml' || f === 'package.yaml')) return 'haskell'
  if (lower.includes('requirements.txt') || lower.includes('setup.py') || lower.includes('pyproject.toml')) {
    return 'python'
  }
  if (lower.includes('jenkinsfile')) return 'groovy'
  if (hasAny(exts, CPP_EXT)) return 'cpp'
  if (hasAny(exts, C_EXT)) return 'c'
  if (exts.has('.rs')) return 'rust'
  if (exts.has('.hs') || exts.has('.lhs')) return 'haskell'
  if (exts.has('.groovy')) return 'groovy'
  if (exts.has('.py')) return 'python'
  if (hasAny(exts, JS_EXT)) return 'javascript'
  if (hasAny(exts, JINJA_EXT)) return 'jinja'
  if (hasAny(exts, SHELL_EXT)) return 'shell'
  return 'unknown'
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

async function collectFromDir(
  dirPath: string,
  files: ProjectFiles,
  exts: Set<string>
): Promise<{ sourceDirs: string[]; otherDirs: string[] }> {
  let entries
  try {
    entries = await fs.readdir(dirPath, { withFileTypes: true })
  } catch {
    return { sourceDirs: [], otherDirs: [] }
  }

  const sourceDirs: string[] = []
  const otherDirs: string[] = []

  for (const entry of entries) {
    const name = entry.name

    if (entry.isDirectory()) {
      if (isIgnoredDir(name)) continue
      const lower = name.toLowerCase()
      if (SOURCE_DIRS.has(lower)) {
        files.sourceFolders.push(name)
        sourceDirs.push(join(dirPath, name))
      } else if (TEST_DIRS.has(lower)) {
        files.hasTests = true
        files.testPaths.push(name)
      } else {
        otherDirs.push(join(dirPath, name))
      }
      continue
    }

    if (entry.isFile()) {
      exts.add(extname(name).toLowerCase())
      if (isReadme(name)) {
        files.hasReadme = true
        if (!files.readmePath) files.readmePath = name
      }
      if (isMakefile(name)) files.hasMakefile = true
      if (isTestFile(name)) {
        files.hasTests = true
        files.testPaths.push(name)
      }
      if (isConfigFile(name)) files.configFiles.push(name)
    }
  }

  return { sourceDirs, otherDirs }
}

export async function detectProjectFiles(
  repoPath: string
): Promise<{ files: ProjectFiles; kind: ProjectKind }> {
  const files: ProjectFiles = {
    hasReadme: false,
    readmePath: null,
    hasMakefile: false,
    hasTests: false,
    testPaths: [],
    sourceFolders: [],
    configFiles: []
  }
  const exts = new Set<string>()

  // Level 0: the repo root
  const root = await collectFromDir(repoPath, files, exts)
  for (const sd of root.sourceDirs) await collectExtensions(sd, exts)

  // Level 1: each immediate subfolder
  for (const sub of root.otherDirs) {
    const subRes = await collectFromDir(sub, files, exts)
    for (const sd of subRes.sourceDirs) await collectExtensions(sd, exts)
  }

  const rootDirs = new Set(root.otherDirs.map((p) => basename(p).toLowerCase()))
  let kind = deriveKind(files.configFiles, exts)
  if (kind === 'unknown' && isAnsible(files.configFiles, rootDirs)) kind = 'ansible'

  return { files, kind }
}
