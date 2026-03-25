# Static data backend для Skill Store

**ID:** feature.static-data-backend  
**Complexity:** M  
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

- [ ] После `make store-build` появляются все JSON-индексы
- [ ] Каталогная страница работает без backend/API
- [ ] Поиск работает полностью на клиенте
- [ ] Страницы всех скиллов собираются статически
- [ ] При битых данных build падает с понятной ошибкой

---

## Implementation Notes

<!-- Заполняется при закрытии задачи -->
