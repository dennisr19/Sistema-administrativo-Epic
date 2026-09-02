#!/usr/bin/env node
// Guardrail: one file = one component, kept small. Coding agents left unchecked default to
// piling an entire page (navbar + hero + cards + footer + logic) into a single file. This
// fails the build/commit instead of relying on a prompt reminder.
//
// Recommended budget for a component file (markup + its own script/logic together):
//   - soft target ~150-200 lines
//   - hard ceiling ~300 lines (this script's default WARN/FAIL)
// If a single visual section inside a file is doing one distinct job and is pushing past
// ~40-60 lines, or the same block repeats, that is a component: extract it to its own file.
// Keep a component's script/logic portion (frontmatter in .astro, function body in .tsx)
// under ~50-70 lines; past that, extract a hook/util module.
//
// Route/page files that are pure composition (imports + a short JSX/template tree wiring
// already-extracted components together) are exempt from the WARN tier but still hard-fail
// past FAIL_LINES - a long page file is a sign the sections inside it were never split out.
//
// Escape hatch: a comment `// checks: allow-file` (or `<!-- checks: allow-file -->` for
// .astro/.vue) anywhere in the file suppresses it, for the rare deliberate exception.
//
// Usage: drop into scripts/, run `node scripts/check-component-size.mjs [--src src]
// [--warn 150] [--fail 300]`, wire into package.json (check:size) and a pre-commit hook.

import { readdirSync, readFileSync } from "node:fs"
import { extname, join, relative } from "node:path"

const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? fallback : args[i + 1]
}

const SRC_DIR = flag("src", "src")
const WARN_LINES = Number(flag("warn", 150))
const FAIL_LINES = Number(flag("fail", 300))
const ROOT = process.cwd()
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", ".astro", ".next", ".wrangler", "build"])
const COMPONENT_EXT = new Set([".astro", ".jsx", ".tsx", ".vue", ".svelte"])

/** @type {string[]} */
const failures = []
/** @type {string[]} */
const warnings = []

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else checkFile(full)
  }
}

function checkFile(path) {
  if (!COMPONENT_EXT.has(extname(path))) return
  const rel = relative(ROOT, path)
  const content = readFileSync(path, "utf8")
  if (content.includes("checks: allow-file")) return

  const lines = content.split("\n").length
  const isPage = /(^|\/)(pages|routes|app)\//.test(rel)

  if (lines > FAIL_LINES) {
    failures.push(`${rel}: ${lines} lines (hard ceiling ${FAIL_LINES}). Split it up.`)
  } else if (lines > WARN_LINES && !isPage) {
    warnings.push(`${rel}: ${lines} lines (soft target ${WARN_LINES}). Consider splitting.`)
  }
}

try {
  walk(join(ROOT, SRC_DIR))
} catch (err) {
  console.error(`check-component-size: failed to scan ${SRC_DIR}/: ${err.message}`)
  process.exit(1)
}

if (warnings.length > 0) {
  console.warn("Component size warnings (non-blocking):\n")
  for (const w of warnings) console.warn(`  - ${w}`)
  console.warn("")
}

if (failures.length > 0) {
  console.error("Component size check failed:\n")
  for (const f of failures) console.error(`  - ${f}`)
  console.error(`\n${failures.length} file(s) over the hard ceiling.`)
  process.exit(1)
}

console.log(`check-component-size: OK${warnings.length ? ` (${warnings.length} warning(s))` : ""}.`)
