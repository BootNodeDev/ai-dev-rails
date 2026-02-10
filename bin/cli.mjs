#!/usr/bin/env node

import { existsSync, mkdirSync, cpSync, readdirSync, statSync } from 'node:fs'
import { resolve, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATE_DIR = resolve(__dirname, '..', 'template')

const projectName = process.argv[2]

if (!projectName) {
  console.error(`
Usage: npx ai-dev-rails <project-name>

Example:
  npx ai-dev-rails my-awesome-app
  npx ai-dev-rails api-service

Sets up the structured AI development methodology for your project.
Run this from the root of your project directory.
`)
  process.exit(1)
}

const targetDir = process.cwd()

// --- Helpers ---

function readdirRecursive(dir) {
  const results = []
  function walk(current, prefix) {
    const entries = readdirSync(current)
    for (const entry of entries) {
      const fullPath = join(current, entry)
      const relPath = prefix ? join(prefix, entry) : entry
      if (statSync(fullPath).isDirectory()) {
        walk(fullPath, relPath)
      } else {
        results.push(relPath)
      }
    }
  }
  walk(dir, '')
  return results
}

// --- Main ---

// 1. Copy .claude/ directory (agents, commands)
const claudeSource = join(TEMPLATE_DIR, '.claude')
const claudeTarget = join(targetDir, '.claude')

const subdirs = ['agents', 'commands']
let copiedFiles = 0
let skippedFiles = 0

for (const dir of subdirs) {
  const srcDir = join(claudeSource, dir)
  const dstDir = join(claudeTarget, dir)
  mkdirSync(dstDir, { recursive: true })

  const entries = readdirRecursive(srcDir)
  for (const relPath of entries) {
    const src = join(srcDir, relPath)
    const dst = join(dstDir, relPath)

    if (existsSync(dst)) {
      skippedFiles++
      continue
    }

    mkdirSync(dirname(dst), { recursive: true })
    cpSync(src, dst)
    copiedFiles++
  }
}


// 2. Create thoughts/ directory structure
const thoughtsDirs = [
  'thoughts/shared/research',
  'thoughts/shared/plans',
  'thoughts/shared/tickets',
  'thoughts/shared/prs',
  'thoughts/shared/handoffs',
  'thoughts/global',
]

let createdDirs = 0
for (const dir of thoughtsDirs) {
  const fullPath = join(targetDir, dir)
  if (!existsSync(fullPath)) {
    mkdirSync(fullPath, { recursive: true })
    createdDirs++
  }
}

// 3. Print summary
console.log(`
ai-dev-rails installed for "${projectName}"

  Files copied:    ${copiedFiles} (${skippedFiles} skipped — already exist)
  Dirs created:    ${createdDirs} under thoughts/

Structure:
  .claude/
    agents/       — 6 specialized sub-agents
    commands/     — research, plan, implement, validate, commit, PR workflows

  thoughts/
    shared/       — team artifacts (research, plans, tickets, prs, handoffs)
    global/       — cross-repo thoughts

Next steps:

  1. Add to your .gitignore:

  thoughts/*
  !thoughts/shared/
  !thoughts/global/

  2. Optionally, add a reference to the methodology in your CLAUDE.md (see README for details)
`)
