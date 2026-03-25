# Static data backend для Skill Store

**ID:** feature.static-data-backend  
**Complexity:** L  
**Status:** done

---

## Problem

Для статического сайта на Next.js нужен zero-runtime backend, который на этапе сборки превращает каталог skills/ в набор готовых JSON-данных.

---

## Scope

### In
- Генератор данных для статического сайта
- Чтение skills/*/SKILL.md и skills/*/metadata.yml
- Валидация целостности каталога
- Генерация нормализованных JSON-артефактов
- Интеграция с Next.js build

### Out
- БД
- API сервер
- SSR/ISR
- Пользовательские аккаунты
- Отправка форм

---

## Technical Overview

Backend в MVP = генератор данных, а не сервер.

Генератор запускается из make и создаёт в `store/public/data/`:

| Файл | Описание |
|------|----------|
| `catalog.json` | Полный список карточек для build-time генерации |
| `search-index.json` | Облегчённый индекс для поиска на клиенте |
| `tags.json` | Список тегов и счётчики |
| `manifest.json` | Build metadata: commit SHA, build time, basePath, версия схемы |

### Нормализованная модель скилла

Маппинг из metadata.yml в нормализованную модель:

| Поле модели | Источник в metadata.yml |
|-------------|-------------------------|
| `slug` | Имя папки + проверка `catalog.slug` |
| `title` | `catalog.title` |
| `short_description` | `skill.description` |
| `full_description` | `skill.description` + контент из `SKILL.md` |
| `tags[]` | `catalog.tags` (lowercase, unique) |
| `search_aliases[]` | `catalog.search_aliases` (lowercase) |
| `source.url` | `source.url` |
| `source.label` | `source.repo` или `source.url` |
| `license.id` | `license.id` |
| `license.url` | `license.url` |
| `review.status` | `review.status` |
| `review.summary` | `review.summary` |
| `review.reviewed_at` | `review.reviewed_at` |
| `guarantees[]` | Пусто (резерв) |
| `updated_at` | `source.imported_at` |

### Правила нормализации

- Привести теги и поисковые поля к нижнему регистру
- Убрать дубли тегов
- Обрезать пустые поля
- Гарантировать уникальность slug
- Гарантировать совпадение slug с именем папки
- Падать с ошибкой, если нет обязательных полей: `title`, `source`, `license`

### Структура каталога skills/

Каждый скилл хранится в отдельной папке:

```text
skills/
  └── <slug>/
      ├── SKILL.md           # Описание скилла (Markdown с frontmatter)
      └── metadata.yml       # Метаданные для каталога
```

**Пример metadata.yml:**

```yaml
source:
  repo: "https://github.com/example/repo"
  path: "path/to/skill"
  branch: "main"
  url: "https://github.com/example/repo/tree/main/path/to/skill"
  imported_at: "2026-03-25"

catalog:
  slug: "my-skill"
  title: "My Skill"
  tags:
    - "tag1"
    - "tag2"
  search_aliases:
    - "алиас 1"
    - "алиас 2"

skill:
  name: "my-skill"
  description: "Краткое описание"

review:
  status: "reviewed"
  summary: "Описание проверки"
  reviewed_by: "reviewer-name"
  reviewed_at: "2026-03-25"

license:
  id: "MIT"
  url: "https://opensource.org/licenses/MIT"
  notes: "Комментарий"

risk:
  network: false
  shell: false
  writes_files: true
  reads_files: true
  secrets: false

tests:
  has_official_evals: false
  eval_mode: "generated"
  scenarios: []
  last_run: "2026-03-25"

policy:
  featured: false
  hidden: false
  replacement: ""
```

### Алгоритм обхода skills/

1. Сканировать директорию `skills/` на наличие подпапок
2. Для каждой подпапки `<slug>/`:
   - Проверить наличие `metadata.yml` (обязательно)
   - Проверить наличие `SKILL.md` (обязательно)
   - Извлечь `slug` из имени папки
   - Сверить `catalog.slug` в metadata.yml с именем папки
3. Распарсить `metadata.yml` и извлечь поля:
   - `catalog.slug`, `catalog.title`, `catalog.tags[]`, `catalog.search_aliases[]`
   - `skill.name`, `skill.description`
   - `source.url`, `source.repo`
   - `license.id`, `license.url`
   - `review.status`, `review.summary`, `review.reviewed_at`
4. Валидировать обязательные поля: `title`, `source.url`, `license.id`
5. Нормализовать данные и добавить в каталог

### Поиск (клиентский)

MVP-логика:

- Поиск по `title` + `tags` + `search_aliases`
- Case-insensitive
- Частичное совпадение строки
- Фильтрация по тегам
- Сортировка: сначала совпадение по имени, потом по тегам

`search_aliases` в metadata.yml обязательны — бизнесмен вводит "договоры", а не `contract-parser`.

### Как фронтенд использует данные

- Каталог загружает `search-index.json` в браузере
- Страница скилла генерируется статически из `catalog.json`
- Маршрут `/skills/[slug]` должен быть полностью известен на этапе build через `generateStaticParams()`

---

## Requirements

### Генератор каталога
- Node.js script
- Запуск через `npm run generate` перед `npm run build`
- Next.js только потребляет готовые .json из `public/data/`

### Схема нормализованных JSON
- Описанная структура данных
- Версионирование схемы через manifest.json

### Проверка консистентности каталога
- Валидация обязательных полей
- Проверка уникальности slug
- Проверка соответствия slug имени папки

### Интеграция с Next build
- Генерация данных перед сборкой
- Поддержка generateStaticParams()

### README для локального запуска
- Документация по запуску генератора
- Описание структуры данных

---

## Acceptance Criteria

- [x] После `npm run build` появляются все JSON-индексы в `store/public/data/`
- [x] `npm run build` запускает генератор каталога перед сборкой Next.js
- [x] `next.config.mjs` содержит `output: 'export'`
- [x] Каталогная страница (`app/page.tsx`) — серверный компонент
- [x] Страница скилла (`app/skill/[slug]/page.tsx`) — серверный компонент с `generateStaticParams()`
- [x] Поиск работает полностью на клиенте (в client component)
- [x] Страницы всех скиллов собираются статически в `store/out/`
- [x] При битых данных build падает с понятной ошибкой
- [x] В `store/public/data/manifest.json` есть commit SHA и build timestamp

## Implementation Notes

**Modified files:**
- `store/next.config.mjs` — добавлен `output: 'export'`
- `store/package.json` — добавлены скрипты `generate` и обновлён `build`, добавлена зависимость `js-yaml`
- `store/lib/skills-data.ts` — новые типы и функции для загрузки JSON
- `store/app/page.tsx` — конвертирован в серверный компонент
- `store/app/skill/[slug]/page.tsx` — конвертирован в серверный компонент с `generateStaticParams()`
- `store/components/skill-card.tsx` — обновлён под новую модель данных
- `store/components/skills-search.tsx` — обновлён под новую модель данных
- `store/components/skills-grid.tsx` — новый клиентский компонент для поиска

**Created files:**
- `scripts/generate-catalog.js` — генератор каталога из `skills/*/metadata.yml`
- `store/public/data/catalog.json` — полный каталог скиллов
- `store/public/data/search-index.json` — индекс для поиска
- `store/public/data/tags.json` — теги со счётчиками
- `store/public/data/manifest.json` — метаданные сборки

**Build output:**
- `store/out/` — статический экспорт Next.js

**Latest commit:** TBD

---

## Implementation Plan

### 1. Проверка и настройка статического экспорта Next.js

**Проблема:** Сейчас сайт не собирается как чистая статика.

**Решение:** Добавить в `store/next.config.mjs`:

```js
const nextConfig = {
  output: 'export',  // Чистый статический экспорт
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,  // Отключить оптимизацию изображений для static export
  },
  // Отключить серверные функции
  experimental: {
    serverActions: false,
  }
}
```

### 2. Изменение lib/skills-data.ts

**Проблема:** Данные захардкожены в массиве `skills`.

**Решение:** Заменить на чтение из `public/data/catalog.json`:

```ts
// Удалить массив skills и все хардкод-данные
// Оставить только типы

export type VerificationStatus = "verified" | "basic-tested" | "limitations" | "outdated" | "not-recommended"

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

// Функция для загрузки данных на клиенте
export async function loadCatalog(): Promise<Skill[]> {
  const res = await fetch('/data/catalog.json')
  if (!res.ok) throw new Error('Failed to load catalog')
  return res.json()
}

// Для серверных компонентов - синхронная загрузка
export function getCatalog(): Skill[] {
  // В server components можно импортировать JSON напрямую
  // или читать через fs на этапе build
  return require('@/public/data/catalog.json')
}
```

### 3. Изменение app/page.tsx

**Проблема:** `"use client"` и хуки там, где можно использовать серверный компонент.

**Решение:** Разделить на серверный и клиентский компоненты:

```tsx
// app/page.tsx - серверный компонент
import { getCatalog } from "@/lib/skills-data"
import { Header } from "@/components/header"
import { SkillsSearch } from "@/components/skills-search"
import { SkillCard } from "@/components/skill-card"

export default async function Home() {
  const skills = getCatalog()
  
  return (
    <div className="min-h-screen bg-[#ffffff]">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="pt-12 pb-10 md:pt-16 md:pb-12 border-b border-[#e5e7eb]">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-[#111827] mb-4 text-balance leading-tight">
              Проверенные скиллы для бизнес-задач
            </h1>
            <p className="text-base md:text-lg text-[#6b7280] max-w-2xl mx-auto mb-10 leading-relaxed">
              Каталог скиллов для работы с документами, файлами, отчётами и рутинными задачами.
            </p>
            <SkillsSearch />
          </div>
        </section>
        
        {/* Skills Grid - передаём данные в клиентский компонент */}
        <section className="py-10 md:py-12">
          <div className="max-w-5xl mx-auto px-6">
            <SkillsGrid skills={skills} />
          </div>
        </section>
      </main>
    </div>
  )
}

// components/skills-grid.tsx - клиентский компонент для поиска
"use client"

export function SkillsGrid({ skills }: { skills: Skill[] }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Все")
  
  // Логика фильтрации...
}
```

### 4. Изменение app/skill/[id]/page.tsx

**Проблема:** `"use client"`, динамический `use(params)`, нет `generateStaticParams()`.

**Решение:** Сделать серверным компонентом со статической генерацией:

```tsx
// app/skill/[slug]/page.tsx - серверный компонент
import { notFound } from "next/navigation"
import { getCatalog, type Skill } from "@/lib/skills-data"

// Генерация статических параметров на этапе build
export async function generateStaticParams() {
  const skills = getCatalog()
  return skills.map((skill) => ({
    slug: skill.slug
  }))
}

// Генерация метаданных для SEO
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const skills = getCatalog()
  const skill = skills.find(s => s.slug === params.slug)
  
  return {
    title: `${skill?.title} | Skill Store`,
    description: skill?.short_description
  }
}

export default async function SkillPage({ params }: { params: { slug: string } }) {
  const skills = getCatalog()
  const skill = skills.find((s) => s.slug === params.slug)

  if (!skill) {
    notFound()
  }

  const relatedSkills = skills
    .filter((s) => s.tags.some(t => skill.tags.includes(t)) && s.slug !== skill.slug)
    .slice(0, 3)

  return (
    // Рендер страницы...
  )
}
```

### 5. Обновление package.json скриптов

В `store/package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "npm run generate && next build",
    "start": "npx serve out",
    "lint": "eslint .",
    "generate": "node ../scripts/generate-catalog.js"
  }
}
```

### 6. Создание генератора каталога

**Файл:** `scripts/generate-catalog.js`

```js
#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const SKILLS_DIR = path.join(__dirname, '..', 'skills')
const OUTPUT_DIR = path.join(__dirname, '..', 'store', 'public', 'data')

// 1. Создать OUTPUT_DIR если не существует
// 2. Сканировать skills/ на наличие подпапок
// 3. Для каждой папки:
//    - Прочитать metadata.yml
//    - Прочитать SKILL.md (опционально, для полного описания)
//    - Валидировать обязательные поля
//    - Нормализовать данные
// 4. Сгенерировать:
//    - catalog.json — полный список скиллов
//    - search-index.json — облегчённый индекс для поиска
//    - tags.json — список тегов со счётчиками
//    - manifest.json — metadata сборки

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
  if (metadata.catalog?.slug !== slug) {
    errors.push(`Slug mismatch: folder="${slug}", metadata="${metadata.catalog?.slug}"`)
  }
  
  return errors
}

function normalizeSkill(slug, metadata) {
  return {
    slug: slug,
    title: metadata.catalog.title,
    short_description: metadata.skill.description,
    full_description: metadata.skill.description, // можно дополнить из SKILL.md
    tags: metadata.catalog.tags.map(t => t.toLowerCase()),
    search_aliases: metadata.catalog.search_aliases.map(a => a.toLowerCase()),
    source: {
      url: metadata.source.url,
      label: metadata.source.repo || metadata.source.url
    },
    license: {
      id: metadata.license.id,
      url: metadata.license.url
    },
    review: {
      status: metadata.review.status,
      summary: metadata.review.summary,
      reviewed_at: metadata.review.reviewed_at
    },
    guarantees: [],
    updated_at: metadata.source.imported_at
  }
}

// Main
const skillsDirs = fs.readdirSync(SKILLS_DIR)
  .filter(dir => fs.statSync(path.join(SKILLS_DIR, dir)).isDirectory())

const catalog = []
const allTags = {}

for (const slug of skillsDirs) {
  const metadataPath = path.join(SKILLS_DIR, slug, 'metadata.yml')
  const skillPath = path.join(SKILLS_DIR, slug, 'SKILL.md')
  
  if (!fs.existsSync(metadataPath)) {
    console.error(`Error: metadata.yml not found for ${slug}`)
    process.exit(1)
  }
  
  const metadata = yaml.load(fs.readFileSync(metadataPath, 'utf8'))
  const errors = validateSkill(slug, metadata)
  
  if (errors.length > 0) {
    console.error(`Validation errors for ${slug}:`)
    errors.forEach(e => console.error(`  - ${e}`))
    process.exit(1)
  }
  
  const skill = normalizeSkill(slug, metadata)
  catalog.push(skill)
  
  // Собрать теги
  skill.tags.forEach(tag => {
    allTags[tag] = (allTags[tag] || 0) + 1
  })
}

// Сгенерировать search-index (облегчённая версия)
const searchIndex = catalog.map(s => ({
  slug: s.slug,
  title: s.title,
  tags: s.tags,
  search_aliases: s.search_aliases
}))

// Записать файлы
fs.mkdirSync(OUTPUT_DIR, { recursive: true })
fs.writeFileSync(path.join(OUTPUT_DIR, 'catalog.json'), JSON.stringify(catalog, null, 2))
fs.writeFileSync(path.join(OUTPUT_DIR, 'search-index.json'), JSON.stringify(searchIndex, null, 2))
fs.writeFileSync(path.join(OUTPUT_DIR, 'tags.json'), JSON.stringify(allTags, null, 2))

const manifest = {
  commit_sha: process.env.GITHUB_SHA || 'local',
  build_time: new Date().toISOString(),
  base_path: process.env.SITE_BASE_PATH || '/',
  schema_version: '1.0.0'
}
fs.writeFileSync(path.join(OUTPUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2))

console.log(`Generated catalog with ${catalog.length} skills`)
```

### 7. Настройка .gitignore

Добавить в `store/.gitignore`:

```
out/
```

`public/data/` не игнорируется — это артефакты сборки, которые должны быть в репозитории для статического экспорта.

### 8. Установка зависимостей для генератора

В `store/package.json` добавить зависимость:

```json
{
  "devDependencies": {
    "js-yaml": "^4.1.0"
  }
}
```

Или установить:

```bash
cd store
npm install js-yaml --save-dev
```
