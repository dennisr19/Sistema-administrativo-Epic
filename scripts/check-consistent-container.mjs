#!/usr/bin/env node
// Guardrail: every top-level page <section> shares one max-width container. Left
// unchecked, a coding agent builds each section independently and gives each one its own
// max-w-* value, so content drifts out of alignment as the page scrolls - hero at max-w-7xl,
// tours at max-w-6xl, about at max-w-5xl, nobody notices until it renders.
//
// Heuristic (regex-based, not a real parser, same tradeoff as the other checks here):
//   1. Only look at component files that contain a <section ...> tag - this scopes the
//      check to page sections and skips modals, cards, forms, and other narrower
//      intentionally-constrained boxes.
//   2. Within those files, find the first class/className attribute that combines a
//      `max-w-*` utility with `mx-auto` - the standard Tailwind "centered container" idiom.
//      Files that build their container a different way (flex, grid, no mx-auto) are not
//      detected and are silently skipped rather than risking a false positive.
//   3. Collect one (file, max-w value) pair per matching file. If more than one distinct
//      max-w value shows up across the collected sections, that's drift: fail and list every
//      file with its value so they can be unified onto one shared container/value.
//
// This does not know which value is "correct" - only that a page's sections disagreeing is
// itself the bug. Pick one (ideally via one shared <Container>/<Wrapper> component) and reuse
// it everywhere; a legitimately narrower section (e.g. a newsletter signup) should say so
// with the escape hatch below rather than silently drifting.
//
// Escape hatch: a comment `checks: allow-container` anywhere in the file exempts it from
// this check, for a section that is deliberately narrower/wider than the rest of the page.
//
// Usage: drop into scripts/, run `node scripts/check-consistent-container.mjs [--src src]`,
// wire into package.json (check:layout) and a pre-commit hook.

import { readdirSync, readFileSync } from "node:fs"
import { extname, join, relative } from "node:path"

const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? fallback : args[i + 1]
}

const SRC_DIR = flag("src", "src")
const ROOT = process.cwd()
const SKIP_DIRS = new Set(["node_modules", ".git", "dist", ".astro", ".next", ".wrangler", "build"])
const COMPONENT_EXT = new Set([".astro", ".jsx", ".tsx", ".vue", ".svelte", ".html"])

const SECTION_TAG_RE = /<section[\s>]/i
const CLASS_ATTR_RE = /class(?:Name)?\s*=\s*["'`{]([^"'`}]*)["'`}]/g
const MAX_W_RE = /max-w-[\w[\]./%-]+/

/** @type {{ file: string, line: number, token: string }[]} */
const found = []

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

  if (content.includes("checks: allow-container")) return
  if (!SECTION_TAG_RE.test(content)) return

  CLASS_ATTR_RE.lastIndex = 0
  let match
  while ((match = CLASS_ATTR_RE.exec(content)) !== null) {
    const classValue = match[1]
    if (!classValue.includes("mx-auto")) continue
    const maxWidth = classValue.match(MAX_W_RE)
    if (!maxWidth) continue

    const line = content.slice(0, match.index).split("\n").length
    found.push({ file: rel, line, token: maxWidth[0] })
    break // one container signature per file is enough to place it in a group
  }
}

try {
  walk(join(ROOT, SRC_DIR))
} catch (err) {
  console.error(`check-consistent-container: failed to scan ${SRC_DIR}/: ${err.message}`)
  process.exit(1)
}

const distinctTokens = new Set(found.map((f) => f.token))

if (found.length >= 2 && distinctTokens.size > 1) {
  console.error("Consistent-container check failed - sections disagree on max-width:\n")
  for (const f of found.sort((a, b) => a.token.localeCompare(b.token))) {
    console.error(`  - ${f.file}:${f.line}: ${f.token}`)
  }
  console.error(
    `\n${distinctTokens.size} different container widths across ${found.length} section(s). ` +
      `Unify onto one value (ideally one shared container component), or mark an ` +
      `intentionally different section with "checks: allow-container".`,
  )
  process.exit(1)
}

console.log(
  found.length > 0
    ? `check-consistent-container: OK - ${found.length} section(s), one shared max-width (${[...distinctTokens][0]}).`
    : "check-consistent-container: OK - no matching section containers detected.",
)
