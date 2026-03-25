export type VerificationStatus = "verified" | "basic-tested" | "limitations" | "outdated" | "not-recommended" | "not-reviewed"

export type Skill = {
  slug: string
  title: string
  short_description: string
  full_description: string
  tags: string[]
  search_aliases: string[]
  source: {
    url: string
    label: string
  }
  license: {
    id: string
    url: string
  }
  review: {
    status: VerificationStatus
    summary: string
    reviewed_at: string
  }
  guarantees: string[]
  updated_at: string
}

export type SkillSearchIndex = {
  slug: string
  title: string
  tags: string[]
  search_aliases: string[]
}

export type TagsIndex = Record<string, number>

export type Manifest = {
  commit_sha: string
  build_time: string
  base_path: string
  schema_version: string
}

export const statusLabels: Record<VerificationStatus, string> = {
  "verified": "Проверен",
  "basic-tested": "Базово протестирован",
  "limitations": "Есть ограничения",
  "outdated": "Устарел",
  "not-recommended": "Не рекомендован",
  "not-reviewed": "Не проверен"
}

export const statusColors: Record<VerificationStatus, string> = {
  "verified": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "basic-tested": "bg-sky-50 text-sky-700 border-sky-200",
  "limitations": "bg-amber-50 text-amber-700 border-amber-200",
  "outdated": "bg-stone-100 text-stone-500 border-stone-200",
  "not-recommended": "bg-red-50 text-red-700 border-red-200",
  "not-reviewed": "bg-gray-50 text-gray-700 border-gray-200"
}

export async function loadCatalog(): Promise<Skill[]> {
  const res = await fetch('/data/catalog.json')
  if (!res.ok) throw new Error('Failed to load catalog')
  return res.json()
}

export async function loadSearchIndex(): Promise<SkillSearchIndex[]> {
  const res = await fetch('/data/search-index.json')
  if (!res.ok) throw new Error('Failed to load search index')
  return res.json()
}

export async function loadTags(): Promise<TagsIndex> {
  const res = await fetch('/data/tags.json')
  if (!res.ok) throw new Error('Failed to load tags')
  return res.json()
}

export async function loadManifest(): Promise<Manifest> {
  const res = await fetch('/data/manifest.json')
  if (!res.ok) throw new Error('Failed to load manifest')
  return res.json()
}
