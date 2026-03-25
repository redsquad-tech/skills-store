# Настроить линтеры и юнит-тесты

**ID:** infra.linters-and-tests  
**Complexity:** medium  
**Priority:** high  
**Status:** todo

---

## Problem

В проекте отсутствуют:
- Строгий TypeScript linting (запрет `any`, implicit any)
- Проверка неиспользуемых импортов и зависимостей
- Юнит-тесты на критичную логику (поиск)

Это приводит к:
- Размыванию типизации (`any` распространяется по коду)
- Раздуванию bundle лишними зависимостями
- Регрессиям при рефакторинге

---

## Scope

### In
- Настройка ESLint с строгими правилами TypeScript
- Запрет `any` и implicit any
- Удаление мёртвых импортов и зависимостей
- Vitest для юнит-тестов
- Тесты на компонент поиска

### Out
- E2E тесты
- Интеграционные тесты
- Pre-commit hooks (на будущее)

---

## Proposed Solution

### 1. ESLint для строгого TypeScript

**Пакеты:**
```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react eslint-plugin-react-hooks eslint-config-prettier
```

**Конфигурация (`.eslintrc.cjs`):**
```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: { jsx: true }
  },
  settings: { react: { version: '18' } },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/strict',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  rules: {
    // Запрет any
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    
    // Мёртвый код
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    
    // Импорты
    'no-restricted-imports': ['error', {
      patterns: ['**/dist/**']
    }]
  }
}
```

### 2. Проверка неиспользуемых зависимостей

**Инструмент:** `depcheck`

```bash
npm install --save-dev depcheck
```

**Скрипт в package.json:**
```json
"scripts": {
  "lint:deps": "depcheck --ignores=eslint,prettier,@types/*"
}
```

### 3. Vitest для юнит-тестов

**Пакеты:**
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom @vitest/coverage-v8
```

**Конфигурация (`vitest.config.ts`):**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
})
```

### 4. Тесты на поиск (SkillsGrid)

**Файл:** `store/components/skills-grid.test.tsx`

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SkillsGrid } from './skills-grid'

const mockSkills = [
  {
    slug: 'contract-reviewer',
    title: 'Проверка договоров',
    short_description: 'Проверяет договоры на риски',
    tags: ['договоры', 'документы'],
    search_aliases: ['контракты', 'соглашения']
  },
  {
    slug: 'spreadsheet',
    title: 'Таблицы',
    short_description: 'Работа с Excel',
    tags: ['таблицы', 'excel'],
    search_aliases: ['xlsx', 'csv']
  }
]

describe('SkillsGrid', () => {
  it('рендерит все скиллы без поиска', () => {
    render(<SkillsGrid skills={mockSkills} searchIndex={[]} tags={{}} />)
    expect(screen.getByText('Проверка договоров')).toBeInTheDocument()
    expect(screen.getByText('Таблицы')).toBeInTheDocument()
  })

  it('ищет по title с fuzzy search', () => {
    render(<SkillsGrid skills={mockSkills} searchIndex={[]} tags={{}} />)
    const searchInput = screen.getByPlaceholderText(/поиск/i)
    fireEvent.change(searchInput, { target: { value: 'догвор' } }) // опечатка
    expect(screen.getByText('Проверка договоров')).toBeInTheDocument()
  })

  it('ищет по search_aliases', () => {
    render(<SkillsGrid skills={mockSkills} searchIndex={[]} tags={{}} />)
    const searchInput = screen.getByPlaceholderText(/поиск/i)
    fireEvent.change(searchInput, { target: { value: 'контракты' } })
    expect(screen.getByText('Проверка договоров')).toBeInTheDocument()
  })

  it('показывает "Ничего не найдено" при пустом результате', () => {
    render(<SkillsGrid skills={mockSkills} searchIndex={[]} tags={{}} />)
    const searchInput = screen.getByPlaceholderText(/поиск/i)
    fireEvent.change(searchInput, { target: { value: 'несуществующий-запрос' } })
    expect(screen.getByText('Ничего не найдено')).toBeInTheDocument()
  })
})
```

---

## Requirements

### 1. Настроить ESLint

**Зависимости:**
- `eslint@^8.57.0`
- `@typescript-eslint/parser@^7.0.0`
- `@typescript-eslint/eslint-plugin@^7.0.0`
- `eslint-plugin-react@^7.34.0`
- `eslint-plugin-react-hooks@^4.6.0`
- `eslint-config-prettier@^9.1.0`

**Файлы:**
- `.eslintrc.cjs` — конфигурация
- Обновить `package.json` — скрипты

**Правила:**
- ✅ Запрет `any`
- ✅ Запрет unused vars/imports
- ✅ Strict TypeScript
- ✅ React best practices

### 2. Настроить depcheck

**Зависимости:**
- `depcheck@^1.4.7`

**Скрипт:**
- `npm run lint:deps`

### 3. Настроить Vitest

**Зависимости:**
- `vitest@^1.3.0`
- `@testing-library/react@^14.2.0`
- `@testing-library/jest-dom@^6.4.0`
- `jsdom@^24.0.0`
- `@vitest/coverage-v8@^1.3.0`
- `@vitejs/plugin-react@^4.2.0` (для компиляции JSX в тестах)

**Файлы:**
- `vitest.config.ts`
- `tests/setup.ts` — setup файл
- `components/skills-grid.test.tsx` — тесты

### 4. Обновить package.json

```json
{
  "scripts": {
    "lint": "eslint . --max-warnings 0",
    "lint:fix": "eslint . --fix",
    "lint:deps": "depcheck --ignores=eslint,prettier,@types/*",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## Acceptance Criteria

- [ ] `npm run lint` проходит без ошибок
- [ ] ESLint запрещает `any` и unsafe операции
- [ ] ESLint находит неиспользуемые импорты
- [ ] `npm run lint:deps` показывает неиспользуемые зависимости
- [ ] `npm run test` запускает тесты
- [ ] Тесты на SkillsGrid покрывают:
  - Рендер без поиска
  - Fuzzy поиск по title
  - Поиск по search_aliases
  - Пустой результат
- [ ] Coverage > 80% для components/
- [ ] Все тесты проходят в CI

---

## Trade-offs

### ESLint vs Biome

| Критерий | ESLint | Biome |
|----------|--------|-------|
| Экосистема | ✅ Огромная | ⚠️ Новая |
| Скорость | ⚠️ Медленный | ✅ Быстрый |
| Конфигурация | ⚠️ Сложная | ✅ Простая |
| TypeScript | ✅ Отлично | ✅ Отлично |
| Стабильность | ✅ Зрелый | ⚠️ В разработке |

**Решение:** ESLint — стабильнее, больше плагинов, стандарт для Next.js

### Vitest vs Jest

| Критерий | Vitest | Jest |
|----------|--------|------|
| Скорость | ✅ Быстрее (parallel) | ⚠️ Медленнее |
| Конфигурация | ✅ Vite-native | ⚠️ Сложная |
| Coverage | ✅ V8 (точный) | ⚠️ Istanbul |
| Экосистема | ✅ Совместим с Jest | ✅ Огромная |

**Решение:** Vitest — быстрее, проще с Vite/Next.js, совместим с Jest API

### Bundle size impact

**Добавка:**
- ESLint + плагины: ~2MB (dev only)
- Vitest + testing-library: ~1.5MB (dev only)

**Влияние на production:** 0kb (только devDependencies)

---

## Implementation Plan

### 1. Установка зависимостей

```bash
cd store

# ESLint
npm install --save-dev \
  eslint \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-config-prettier

# Depcheck
npm install --save-dev depcheck

# Vitest
npm install --save-dev \
  vitest \
  @testing-library/react \
  @testing-library/jest-dom \
  jsdom \
  @vitest/coverage-v8 \
  @vitejs/plugin-react
```

### 2. Создать конфиги

**Файл:** `.eslintrc.cjs`

Настроить правила из раздела Proposed Solution

**Файл:** `vitest.config.ts`

Настроить из раздела Proposed Solution

**Файл:** `tests/setup.ts`

```typescript
import '@testing-library/jest-dom'
```

### 3. Обновить package.json

Добавить скрипты:
- `lint:fix`
- `lint:deps`
- `test`
- `test:watch`
- `test:coverage`

### 4. Написать тесты

**Файл:** `components/skills-grid.test.tsx`

Тесты из раздела Proposed Solution

### 5. Исправить существующие ошибки

Запустить:
```bash
npm run lint
npm run test
```

Исправить найденные проблемы

### 6. Обновить CI

В `.github/workflows/deploy.yml` добавить шаг:

```yaml
- name: Lint and test
  run: |
    cd store
    npm run lint
    npm run lint:deps
    npm run test
```

---

## Implementation Notes

**Зависимости (итоговый список):**

```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/react": "^14.2.0",
    "@types/node": "^22",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "@vitest/coverage-v8": "^1.3.0",
    "depcheck": "^1.4.7",
    "eslint": "^8.57.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-react": "^7.34.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "jsdom": "^24.0.0",
    "vitest": "^1.3.0"
  }
}
```

**Файлы для создания:**
- `.eslintrc.cjs`
- `vitest.config.ts`
- `tests/setup.ts`
- `components/skills-grid.test.tsx`

**Файлы для обновления:**
- `store/package.json` — скрипты и зависимости
- `.github/workflows/deploy.yml` — CI шаг
- `tsconfig.json` — возможно, ужесточить правила

**Порядок выполнения:**
1. Установить зависимости
2. Создать конфиги
3. Обновить package.json
4. Написать тесты
5. Исправить ошибки линтера
6. Обновить CI
7. Задокументировать в README

**Ссылки:**
- [ESLint TypeScript](https://typescript-eslint.io/)
- [Vitest документация](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Depcheck](https://github.com/depcheck/depcheck)
