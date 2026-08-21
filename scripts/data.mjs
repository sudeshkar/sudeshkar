// Pulls everything the cards need in two GraphQL round-trips, using the workflow's
// own GITHUB_TOKEN. That is the whole point of this pipeline: the rate limit is ours,
// not a shared public card service's, so the README never renders an empty panel.
const API = 'https://api.github.com/graphql'

// Notebook byte counts include base64-encoded cell output images, so a couple of
// ML side projects would otherwise swamp the language mix. Measured in bytes,
// Jupyter is not a signal about what this person writes.
const EXCLUDED_LANGUAGES = new Set(['Jupyter Notebook'])

async function gql(query, variables, token) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(API, {
      method: 'POST',
      headers: {
        Authorization: `bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'sudeshkar-profile-cards',
      },
      body: JSON.stringify({ query, variables }),
    })
    const body = await res.json().catch(() => null)
    if (res.ok && body && !body.errors) return body.data
    if (attempt === 4) {
      throw new Error(
        `GraphQL failed (${res.status}): ${JSON.stringify(body?.errors ?? body).slice(0, 400)}`,
      )
    }
    await new Promise((r) => setTimeout(r, attempt * 1500))
  }
}

const PROFILE_QUERY = `
query ($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    name
    login
    createdAt
    followers { totalCount }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false, orderBy: {field: PUSHED_AT, direction: DESC}) {
      totalCount
      nodes {
        name
        stargazerCount
        forkCount
        pushedAt
        languages(first: 12, orderBy: {field: SIZE, direction: DESC}) {
          edges { size node { name color } }
        }
      }
    }
    pullRequests(states: MERGED) { totalCount }
    mergedExternal: pullRequests(first: 100, states: MERGED, orderBy: {field: CREATED_AT, direction: DESC}) {
      nodes { number title url mergedAt repository { nameWithOwner isPrivate owner { login } } }
    }
    issues { totalCount }
    window: contributionsCollection(from: $from, to: $to) {
      totalCommitContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
      totalRepositoriesWithContributedCommits
      restrictedContributionsCount
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount weekday } }
      }
    }
  }
}`

const YEAR_QUERY = `
query ($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      totalCommitContributions
      totalPullRequestContributions
      restrictedContributionsCount
      contributionCalendar { totalContributions }
    }
  }
}`

function streaks(days) {
  let longest = 0
  let run = 0
  for (const d of days) {
    if (d.count > 0) {
      run++
      if (run > longest) longest = run
    } else {
      run = 0
    }
  }
  // Current streak walks backwards, tolerating a still-empty today.
  let current = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) current++
    else if (i === days.length - 1) continue
    else break
  }
  return { current, longest }
}

export async function collect(login, token) {
  const to = new Date()
  const from = new Date(to.getTime() - 364 * 24 * 60 * 60 * 1000)
  const data = await gql(
    PROFILE_QUERY,
    { login, from: from.toISOString(), to: to.toISOString() },
    token,
  )
  const u = data.user
  if (!u) throw new Error(`No such user: ${login}`)

  // Lifetime contributions = sum of every calendar year since the account existed.
  const startYear = new Date(u.createdAt).getUTCFullYear()
  const nowYear = to.getUTCFullYear()
  let lifetime = 0
  let lifetimeCommits = 0
  for (let y = startYear; y <= nowYear; y++) {
    const yFrom = new Date(Date.UTC(y, 0, 1)).toISOString()
    const yTo = new Date(Math.min(Date.UTC(y, 11, 31, 23, 59, 59), to.getTime())).toISOString()
    const yd = await gql(YEAR_QUERY, { login, from: yFrom, to: yTo }, token)
    const c = yd.user.contributionsCollection
    lifetime += c.contributionCalendar.totalContributions + c.restrictedContributionsCount
    lifetimeCommits += c.totalCommitContributions
  }

  const days = u.window.contributionCalendar.weeks
    .flatMap((w) => w.contributionDays)
    .map((d) => ({ date: d.date, count: d.contributionCount, weekday: d.weekday }))

  const langTotals = new Map()
  for (const repo of u.repositories.nodes) {
    for (const e of repo.languages.edges) {
      if (EXCLUDED_LANGUAGES.has(e.node.name)) continue
      const prev = langTotals.get(e.node.name) ?? { size: 0, color: e.node.color }
      prev.size += e.size
      langTotals.set(e.node.name, prev)
    }
  }
  const langBytes = [...langTotals.values()].reduce((a, l) => a + l.size, 0) || 1
  const languages = [...langTotals.entries()]
    .map(([name, v]) => ({ name, size: v.size, color: v.color, pct: (v.size / langBytes) * 100 }))
    .sort((a, b) => b.size - a.size)

  // Weeks with at least one contribution reads better than a raw day streak:
  // it rewards steady work without punishing a weekend off.
  const activeWeeks = u.window.contributionCalendar.weeks.filter((w) =>
    w.contributionDays.some((d) => d.contributionCount > 0),
  ).length
  const weekCount = u.window.contributionCalendar.weeks.length

  const external = u.mergedExternal.nodes.filter(
    (p) => !p.repository.isPrivate && p.repository.owner.login.toLowerCase() !== login.toLowerCase(),
  )

  return {
    login: u.login,
    name: u.name ?? u.login,
    generatedAt: to.toISOString(),
    followers: u.followers.totalCount,
    repoCount: u.repositories.totalCount,
    stars: u.repositories.nodes.reduce((a, r) => a + r.stargazerCount, 0),
    forks: u.repositories.nodes.reduce((a, r) => a + r.forkCount, 0),
    mergedPRs: u.pullRequests.totalCount,
    externalMergedPRs: external.length,
    externalPRs: external,
    contributedRepos: u.window.totalRepositoriesWithContributedCommits,
    lifetime,
    lifetimeCommits,
    year: {
      total: u.window.contributionCalendar.totalContributions,
      commits: u.window.totalCommitContributions,
      prs: u.window.totalPullRequestContributions,
      reviews: u.window.totalPullRequestReviewContributions,
    },
    days,
    activeWeeks,
    weekCount,
    ...streaks(days),
    languages,
    langBytes,
    excludedLanguages: [...EXCLUDED_LANGUAGES],
  }
}
