# Интеграция Fuse.js для улучшенного клиентского поиска

**ID:** feature.fusejs-search  
**Complexity:** low  
**Priority:** medium  
**Status:** todo

---

## Problem

Текущий поиск работает через `Array.filter()` + `String.includes()` — только точное совпадение подстроки.

**Проблемы:**
- Нет fuzzy search (опечатки не находятся: "догвор" ≠ "договор")
- Нет релевантности (все результаты равны)
- Нет весов полей (title важнее tags)

---

## Scope

### In
- Установка Fuse.js
- Интеграция в `skills-grid.tsx`
- Настройка весов полей и threshold
- Обновление search-index.json

### Out
- Серверный поиск
- Морфологический анализ (русский язык)
- Индексация на бэкенде

---

## Proposed Solution

### Fuse.js конфигурация

```typescript
import Fuse from 'fuse.js'

const fuse = new Fuse(searchIndex, {
  keys: [
    { name: 'title', weight: 3 },
    { name: 'tags', weight: 2 },
    { name: 'search_aliases', weight: 1 },
    { name: 'short_description', weight: 1 }
  ],
  threshold: 0.4,        // 0 = точное, 1 = любое совпадение
  includeScore: true,    // Для сортировки по релевантности
  minMatchCharLength: 2, // Игнорировать 1-символьные запросы
  ignoreLocation: true,  // Искать по всей строке
})

// Поиск
const results = fuse.search(query).map(r => r.item)
```

### Преимущества

| Характеристика | Значение |
|----------------|----------|
| Размер bundle | ~5kb gzipped |
| Fuzzy search | ✅ |
| Веса полей | ✅ |
| Сортировка по релевантности | ✅ |
| Работает offline | ✅ |

---

## Requirements

### 1. Установка зависимостей

```bash
cd store
npm install fuse.js
npm install --save-dev @types/fuse.js
```

### 2. Обновить search-index.json

В `store/lib/generate-catalog.js` добавить `short_description`:

```javascript
const searchIndex = catalog.map(s => ({
  slug: s.slug,
  title: s.title,
  tags: s.tags,
  search_aliases: s.search_aliases,
  short_description: s.short_description
}))
```

### 3. Обновить skills-grid.tsx

- Импортировать Fuse.js
- Инициализировать в `useMemo`
- Заменить `filter()` на `fuse.search()`
- Сортировать результаты по score

### 4. Конфигурация

| Параметр | Значение | Обоснование |
|----------|----------|-------------|
| `threshold` | 0.4 | Баланс точности и fuzzy |
| `minMatchCharLength` | 2 | Игнорировать случайные буквы |
| `ignoreLocation` | true | Искать по всему тексту |
| `keys[].weight` | 3/2/1 | Title > tags > aliases |

---

## Acceptance Criteria

- [ ] Fuse.js установлен в dependencies
- [ ] `skills-grid.tsx` использует Fuse вместо filter
- [ ] Поиск находит "договор" при запросе "догвор" (fuzzy)
- [ ] Результаты сортируются по релевантности
- [ ] Title имеет больший вес чем tags
- [ ] Поиск работает без задержек (<50ms)
- [ ] Bundle size увеличился не более чем на 10kb

---

## Trade-offs

### Почему Fuse.js а не MiniSearch?

| Критерий | Fuse.js | MiniSearch |
|----------|---------|------------|
| Размер | 5kb | 8kb |
| Fuzzy search | ✅ | ✅ |
| Простота API | ✅ Простой | ⚠️ Сложнее |
| Поддержка RU | ❌ | ❌ (нужен stemming) |

**Решение:** Fuse.js проще, меньше, достаточно для каталога <100 skills

### Bundle size

**Добавка:** +5kb gzipped (~17kb raw)

**Оправдание:** Улучшает UX при опечатках, даёт релевантную сортировку

---

## Implementation Plan

### 1. Установка зависимостей
```bash
cd store
npm install fuse.js @types/fuse.js
```

### 2. Обновить генератор индекса

Файл: `store/lib/generate-catalog.js`

Добавить `short_description` в searchIndex

### 3. Обновить компонент поиска

Файл: `store/components/skills-grid.tsx`

- Импортировать Fuse
- Создать instance в useMemo
- Заменить логику фильтрации

### 4. Пересобрать и протестировать

```bash
npm run build
```

Проверить:
- "договор" → находит contract-reviewer
- "догвор" (опечатка) → тоже находит
- "excel" → находит spreadsheet
- "таблицы" → находит spreadsheet

---

## Implementation Notes

**Зависимости:**
- `fuse.js@^7.0.0`
- `@types/fuse.js` (dev)

**Файлы для изменения:**
- `store/package.json`
- `store/lib/generate-catalog.js`
- `store/components/skills-grid.tsx`
- `store/lib/skills-data.ts` (тип SkillSearchIndex)

**Ссылки:**
- [Fuse.js документация](https://fusejs.io/)
- [Fuse.js GitHub](https://github.com/krisk/fuse)
- [Demo playground](https://fusejs.io/demo.html)
