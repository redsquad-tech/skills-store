#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const SKILLS_DIR = path.join(__dirname, '..', '..', 'skills')
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data')

function validateSkill(slug, metadata) {
  const errors = []
  
  if (!metadata.catalog?.title) {
    errors.push(`Missing catalog.title for ${slug}`)
  }
  if (!metadata.source?.url) {
    errors.push(`Missing source.url for ${slug}`)
  }
  if (!metadata.license?.id) {
    errors.push(`Missing license.id for ${slug}`)
  }
  if (metadata.catalog?.slug && metadata.catalog.slug !== slug) {
    errors.push(`Slug mismatch: folder="${slug}", metadata="${metadata.catalog.slug}"`)
  }
  
  return errors
}

function normalizeSkill(slug, metadata) {
  const tags = metadata.catalog?.tags || []
  const searchAliases = metadata.catalog?.search_aliases || []
  
  return {
    slug: slug,
    title: metadata.catalog.title,
    short_description: metadata.skill?.description_short || metadata.skill?.description || '',
    full_description: metadata.skill?.description || '',
    tags: tags.map(t => t.toLowerCase()).filter((v, i, a) => a.indexOf(v) === i),
    search_aliases: searchAliases.map(a => a.toLowerCase()),
    source: {
      url: metadata.source.url,
      label: metadata.source.repo || metadata.source.url
    },
    license: {
      id: metadata.license.id,
      url: metadata.license.url || ''
    },
    review: {
      status: metadata.review?.status || 'not-reviewed',
      summary: metadata.review?.summary || '',
      reviewed_at: metadata.review?.reviewed_at || ''
    },
    guarantees: [],
    updated_at: metadata.source.imported_at || ''
  }
}

function getCommitSha() {
  try {
    const { execSync } = require('child_process')
    return execSync('git rev-parse HEAD').toString().trim()
  } catch {
    return 'local'
  }
}

function main() {
  if (!fs.existsSync(SKILLS_DIR)) {
    console.error(`Error: Skills directory not found at ${SKILLS_DIR}`)
    process.exit(1)
  }

  const skillsDirs = fs.readdirSync(SKILLS_DIR)
    .filter(dir => {
      const dirPath = path.join(SKILLS_DIR, dir)
      return fs.statSync(dirPath).isDirectory()
    })

  const catalog = []
  const allTags = {}
  const errors = []

  for (const slug of skillsDirs) {
    const metadataPath = path.join(SKILLS_DIR, slug, 'metadata.yml')
    
    if (!fs.existsSync(metadataPath)) {
      errors.push(`metadata.yml not found for ${slug}`)
      continue
    }
    
    try {
      const metadata = yaml.load(fs.readFileSync(metadataPath, 'utf8'))
      const validationErrors = validateSkill(slug, metadata)
      
      if (validationErrors.length > 0) {
        errors.push(...validationErrors.map(e => `${slug}: ${e}`))
        continue
      }
      
      const skill = normalizeSkill(slug, metadata)
      catalog.push(skill)
      
      skill.tags.forEach(tag => {
        allTags[tag] = (allTags[tag] || 0) + 1
      })
    } catch (err) {
      errors.push(`Error parsing metadata for ${slug}: ${err.message}`)
    }
  }

  if (errors.length > 0) {
    console.error('Validation errors:')
    errors.forEach(e => console.error(`  - ${e}`))
    process.exit(1)
  }

  const searchIndex = catalog.map(s => ({
    slug: s.slug,
    title: s.title,
    tags: s.tags,
    search_aliases: s.search_aliases
  }))

  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'catalog.json'),
    JSON.stringify(catalog, null, 2)
  )
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'search-index.json'),
    JSON.stringify(searchIndex, null, 2)
  )
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'tags.json'),
    JSON.stringify(allTags, null, 2)
  )
  
  const manifest = {
    commit_sha: getCommitSha(),
    build_time: new Date().toISOString(),
    base_path: process.env.SITE_BASE_PATH || '/',
    schema_version: '1.0.0'
  }
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  )

  console.log(`Generated catalog with ${catalog.length} skills`)
  console.log(`Output directory: ${OUTPUT_DIR}`)
}

main()
