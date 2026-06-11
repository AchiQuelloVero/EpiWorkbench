# EpiWorkbench

A local cross-platform desktop tool for Epitech students. Scans a folder of repositories and surfaces git status, key project files, and build/test readiness in one interface.

## Requirements

- [Node.js](https://nodejs.org) v18 or later
- [Git](https://git-scm.com) installed and available in your PATH
- npm (comes with Node.js)

## Setup

```bash
npm install
node node_modules/electron/install.js
```

The second command downloads the Electron binary. It only needs to be run once after cloning.

## Run

```bash
npm run dev
```

> **VS Code terminal only:** the integrated terminal sets an environment variable that breaks Electron. Use this instead:
>
> ```bash
> env -u ELECTRON_RUN_AS_NODE npm run dev
> ```

## Build

```bash
npm run build
```

Compiled output goes into `out/`.

## Quality checks

```bash
npm run typecheck   # TypeScript, no emit
npm test            # Vitest unit tests (filters + language detection)
npm run lint        # ESLint
npm run format      # Prettier (write); use format:check to verify only
```
