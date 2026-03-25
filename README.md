# Skill Store

Статический каталог проверенных [skills для агента](https://agentskills.io/skill-creation/using-scripts). Каталог типа [такого](https://skillsmp.com/).

Репозиторий содержит:

- `skills/` — skills, хранящиеся прямо в репозитории
- `store/` — Next.js сайт каталога
- генерацию JSON-индексов и сборку сайта через `make`
- деплой в GitHub Pages через GitHub Actions

## Структура

```text
.
├── skills/                  # skills и их metadata.yml
│   └── <slug>/
│       ├── SKILL.md
│       ├── metadata.yml
│       ├── scripts/
│       ├── references/
│       ├── assets/
│       └── evals/
├── store/                   # Next.js приложение
├── .github/workflows/       # CI/CD
├── Makefile
└── README.md
````

## Основные команды

* `make check` — проверяет и тестирует скилы
* `make build` — production-сборка для GitHub Pages

## Добавление нового skill

1. Создать папку:

```text
skills/<slug>/
```

2. Добавить:

* `SKILL.md`
* `metadata.yml`

3. При необходимости добавить:

* `scripts/`
* `references/`
* `assets/`
* `evals/`

4. Проверить локально:

```bash
make check
```

5. Открыть PR.

## Правила для skills

* имя папки должно совпадать со `slug`
* skill должен содержать `SKILL.md`
* store-метаданные хранятся в `metadata.yml`
* лицензия и источник должны быть указаны
* битый каталог должен ломать сборку

### PR pipeline

На каждый PR:

* ставятся зависимости
* проверяется каталог
* генерируются индексы
* собирается сайт

Используется команда:

```bash
make build
```

На `push` в `main`:

* запускается production build
* публикуется `out/` в GitHub Pages

## Деплой

Деплой происходит автоматически через GitHub Actions.

После merge в `main` GitHub Actions:

1. собирает сайт
2. загружает артефакт
3. деплоит его в GitHub Pages

## Переменные окружения

Поддерживаются:

* `SITE_BASE_PATH` — base path для GitHub Pages
* `GITHUB_SHA` — commit SHA текущей сборки
* `GITHUB_REPOSITORY` — имя репозитория

## Принципы проекта

* без активного backend
* поиск работает на клиенте
* все индексы собираются заранее
* сайт полностью статический
* source of truth — git
* GitHub Actions только запускает `make` и публикует результат
