#!/usr/bin/env node
// Guardrail: this project styles with Tailwind utilities + a component library (daisyUI,
// shadcn/ui, etc.) only. No hand-rolled CSS component classes, no <style> blocks in
// components. A prompt instruction alone gets forgotten under complexity/pressure; this
// makes the constraint fail the build/commit instead.
//
// Checked:
//   1. Every src/**/*.css file stays under a line budget. A legit global stylesheet is
//      short (a Tailwind import, a theme/token block, a few true resets). A file that grows
//      past this is a sign a parallel hand-built design system is happening.
//   2. No *.css file defines a bare class selector (.foo { ... }). Legit content is
//      @import/@plugin/@theme/@layer directives, :root/html/body/*, pseudo elements
//      (::selection, ::-webkit-scrollbar*), @keyframes, and @media/@supports wrappers.
//   3. No component file (.astro/.jsx/.tsx/.vue/.svelte) contains a <style> block.
//
// Escape hatch: a comment `/* checks: allow-next-line */` (CSS) immediately before an
// offending line suppresses that one line, for the rare deliberate exception.
//
// Usage: drop into scripts/, run `node scripts/check-no-handrolled-css.mjs [--src src]
// [--budget 200]`, wire into package.json (check:css) and a pre-commit hook.

import { readdirSync, readFileSync } from "node:fs"
import { extname, join, relative } from "node:path"

const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? fallback : args[i + 1]
}

const SRC_DIR = flag("src", "src")
const CSS_LINE_BUDGET = Number(flag("budget", 200))
const ROOT = process.cwd()
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", ".astro", ".next", ".wrangler", "build"])

/** @type {string[]} */
const violations = []

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else checkFile(full)
  }
}

function checkFile(path) {
  const ext = extname(path)
  const rel = relative(ROOT, path)

  if (ext === ".css") {
    const content = readFileSync(path, "utf8")
    const lines = content.split("\n")

    if (lines.length > CSS_LINE_BUDGET) {
      violations.push(
        `${rel}: ${lines.length} lines (budget ${CSS_LINE_BUDGET}). Tailwind + a component ` +
          `library should mean this file stays a thin import/theme layer, not a parallel ` +
          `hand-rolled design system.`,
      )
    }

    let allowNext = false
    lines.forEach((line, i) => {
      const trimmed = line.trim()
      if (trimmed.includes("checks: allow-next-line")) {
        allowNext = true
        return
      }
      if (allowNext) {
        allowNext = false
        return
      }
      if (/^\.[a-zA-Z][\w-]*(\s*[,]|[\w-]*(::?[\w-]+)?\s*\{)/.test(trimmed)) {
        violations.push(
          `${rel}:${i + 1}: custom class selector "${trimmed.slice(0, 60)}" - use Tailwind ` +
            `utility classes / your component library's classes in the markup instead, or ` +
            `extract a small component if the composition repeats.`,
        )
      }
    })
  }

  if ([".astro", ".jsx", ".tsx", ".vue", ".svelte"].includes(ext)) {
    const content = readFileSync(path, "utf8")
    if (/<style[\s>]/.test(content)) {
      violations.push(
        `${rel}: contains a <style> block - no component-scoped CSS, use Tailwind ` +
          `utilities / your component library's classes directly on the markup instead.`,
      )
    }
  }
}

try {
  walk(join(ROOT, SRC_DIR))
} catch (err) {
  console.error(`check-no-handrolled-css: failed to scan ${SRC_DIR}/: ${err.message}`)
  process.exit(1)
}

if (violations.length > 0) {
  console.error("No-hand-rolled-CSS check failed:\n")
  for (const v of violations) console.error(`  - ${v}`)
  console.error(`\n${violations.length} violation(s).`)
  process.exit(1)
}

console.log("check-no-handrolled-css: OK - no hand-rolled CSS found.")
