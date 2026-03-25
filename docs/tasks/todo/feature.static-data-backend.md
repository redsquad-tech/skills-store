# Static data backend для Skill Store

**ID:** feature.static-data-backend  
**Complexity:** L  
**Status:** todo

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

Генератор запускается из make и создаёт в `store/.generated/`:

| Файл | Описание |
|------|----------|
| `catalog.json` | Полный список карточек для build-time генерации |
| `search-index.json` | Облегчённый индекс для поиска на клиенте |
| `tags.json` | Список тегов и счётчики |
| `skills/<slug>.json` | Нормализованная карточка скилла |
| `manifest.json` | Build metadata: commit SHA, build time, basePath, версия схемы |

### Нормализованная модель скилла

Минимальные поля:

- `slug`
- `title`
- `short_description`
- `full_description`
- `tags[]`
- `search_aliases[]`
- `source.url`
- `source.label`
- `license.id`
- `license.url`
- `review.status`
- `review.summary`
- `review.reviewed_at`
- `guarantees[]`
- `updated_at`

### Правила нормализации

- Привести теги и поисковые поля к нижнему регистру
- Убрать дубли тегов
- Обрезать пустые поля
- Гарантировать уникальность slug
- Гарантировать совпадение slug с именем папки
- Падать с ошибкой, если нет обязательных полей: `title`, `source`, `license`

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
- Страница скилла генерируется статически из `catalog.json` или `skills/<slug>.json`
- Маршрут `/skills/[slug]` должен быть полностью известен на этапе build через `generateStaticParams()`

---

## Requirements

### Генератор каталога
- Node.js или Python script
- Запуск только из make
- Next.js только потребляет готовые .json

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

- [ ] После `make store-build` появляются все JSON-индексы в `store/.generated/`
- [ ] `next.config.mjs` содержит `output: 'export'`
- [ ] Каталогная страница (`app/page.tsx`) — серверный компонент
- [ ] Страница скилла (`app/skill/[slug]/page.tsx`) — серверный компонент с `generateStaticParams()`
- [ ] Поиск работает полностью на клиенте (в client component)
- [ ] Страницы всех скиллов собираются статически в `store/out/`
- [ ] При битых данных build падает с понятной ошибкой
- [ ] В `store/.generated/manifest.json` есть commit SHA и build timestamp

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

**Решение:** Заменить на чтение из `.generated/catalog.json`:

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
  const res = await fetch('/.generated/catalog.json')
  if (!res.ok) throw new Error('Failed to load catalog')
  return res.json()
}

// Для серверных компонентов - синхронная загрузка
export function getCatalog(): Skill[] {
  // В server components можно импортировать JSON напрямую
  // или читать через fs на этапе build
  return require('@/app/.generated/catalog.json')
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

### 5. Создание Makefile

**Проблема:** Нет единой точки входа для сборки.

**Решение:** Создать `Makefile` в корне проекта:

```makefile
.PHONY: install check store-build build

install:
	cd store && npm install

check:
	@echo "Checking skills catalog..."
	@./scripts/validate-skills.sh

store-build:
	@echo "Generating static data..."
	@./scripts/generate-catalog.js
	@echo "Building Next.js app..."
	cd store && npm run build

build: check store-build
	@echo "Build complete. Output in store/out/"
```

### 6. Создание генератора каталога

**Файл:** `scripts/generate-catalog.js`

```js
#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const SKILLS_DIR = path.join(__dirname, '..', 'skills')
const OUTPUT_DIR = path.join(__dirname, '..', 'store', '.generated')

// Чтение всех skills
// Парсинг metadata.yml
// Валидация обязательных полей
// Генерация catalog.json, search-index.json, tags.json, manifest.json
// Проверка целостности

console.log('Catalog generated successfully')
```

### 7. Настройка .gitignore

Добавить в `store/.gitignore`:

```
.generated/
out/
```

### 8. Обновление package.json скриптов

В `store/package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "generate": "node ../scripts/generate-catalog.js"
  }
}
```
