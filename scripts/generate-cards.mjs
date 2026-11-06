#!/usr/bin/env node
import { writeFile, readFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { collect } from './data.mjs'
import { header } from './cards/header.mjs'
import { stats } from './cards/stats.mjs'
import { languages } from './cards/languages.mjs'
import { activity } from './cards/activity.mjs'
import { rhythm } from './cards/rhythm.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'assets')
const SNAPSHOT = join(OUT, 'data.json')

const CARDS = { header, stats, languages, activity, rhythm }

const login = process.env.PROFILE_LOGIN || 'sudeshkar'
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN

async function loadSnapshot() {
  const raw = await readFile(SNAPSHOT, 'utf8')
  return JSON.parse(raw)
}

async function main() {
  await mkdir(OUT, { recursive: true })

  let data
  let source = 'live'
  try {
    if (!token) throw new Error('No GITHUB_TOKEN in the environment')
    data = await collect(login, token)
    await writeFile(SNAPSHOT, JSON.stringify(data, null, 1))
  } catch (err) {
    // The whole reason this pipeline exists: a bad API day must never blank the
    // README. Fall back to the last good snapshot committed in the repo.
    console.error(`[warn] live fetch failed — ${err.message}`)
    try {
      data = await loadSnapshot()
      source = `snapshot from ${data.generatedAt}`
    } catch {
      console.error('[fatal] no snapshot to fall back on; leaving existing SVGs untouched')
      process.exit(process.env.STRICT === '1' ? 1 : 0)
    }
  }

  let written = 0
  for (const [name, render] of Object.entries(CARDS)) {
    for (const theme of ['dark', 'light']) {
      const svg = render(theme, data)
      await writeFile(join(OUT, `${name}-${theme}.svg`), svg)
      written++
    }
  }
  console.log(
    `Rendered ${written} SVG cards (${source}) — ${data.lifetime} contributions, ` +
      `${data.mergedPRs} merged PRs, ${data.languages.length} languages.`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
