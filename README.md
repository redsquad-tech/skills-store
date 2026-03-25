# Insightstream

Статический каталог проверенных skills для AI-агентов.

## Структура

```text
.
├── skills/                  # Skills с метаданными
│   └── <slug>/
│       ├── SKILL.md
│       └── metadata.yml
├── store/                   # Next.js приложение
└── README.md
```

## Разработка

```bash
cd store
npm install
npm run dev
```

Сайт откроется на http://localhost:3000

## Сборка

```bash
cd store
npm run build
```

Команда `npm run build`:
1. Генерирует JSON-индексы из `skills/*/metadata.yml`
2. Собирает статический сайт в `store/out/`

## Добавление skill

1. Создать папку `skills/<slug>/`
2. Добавить `SKILL.md` и `metadata.yml`
3. Запустить `npm run build` для проверки
4. Открыть PR

## Требования к skills

* Имя папки = `catalog.slug` в metadata.yml
* Обязательные поля: `title`, `source.url`, `license.id`
* Битые данные ломают сборку

## Деплой

Автоматически через GitHub Actions после merge в `main`.

## Переменные окружения

* `SITE_BASE_PATH` — base path для GitHub Pages
* `GITHUB_SHA` — commit SHA сборки
