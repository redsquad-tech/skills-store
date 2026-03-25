# Добавить skills из OpenAI skills repository

**ID:** feature.add-openai-skills  
**Complexity:** medium  
**Priority:** high  
**Status:** todo

---

## Problem

В каталоге сейчас только один skill (`tasks`). Нужно добавить 10 skills из OpenAI curated collection для работы с документами, таблицами, презентациями и другими бизнес-задачами.

---

## Scope

### In
- Импортировать 10 skills из OpenAI repository
- Создать `skills/<slug>/metadata.yml` для каждого
- Скопировать `SKILL.md` из исходников
- Проверить лицензии
- Протестировать сборку

### Out
- Модификация импортированных skills
- Написание собственных скриптов
- Интеграция с внешними API

---

## Skills к добавлению

| Slug | Название | Источник | Лицензия |
|------|----------|----------|----------|
| `doc` | Работа с .docx | [OpenAI][1] | Apache-2.0 |
| `pdf` | Чтение и генерация PDF | [OpenAI][3] | Apache-2.0 |
| `spreadsheet` | Создание и редактирование .xlsx/.csv | [OpenAI][5] | Apache-2.0 |
| `slides` | Сборка и правка .pptx | [OpenAI][7] | Apache-2.0 |
| `screenshot` | Системные скриншоты | [OpenAI][9] | Apache-2.0 |
| `jupyter-notebook` | Создание и рефакторинг .ipynb | [OpenAI][11] | Apache-2.0 |
| `transcribe` | Расшифровка аудио/видео | [OpenAI][13] | Apache-2.0 |
| `linear` | Работа с Linear тикетами | [OpenAI][17] | Apache-2.0 |
| `notion-meeting-intelligence` | Подготовка встреч из Notion | [OpenAI][19] | MIT-style |
| `notion-research-documentation` | Сбор знаний из Notion | [OpenAI][21] | MIT-style |

[1]: https://raw.githubusercontent.com/openai/skills/refs/heads/main/skills/.curated/doc/SKILL.md
[3]: https://raw.githubusercontent.com/openai/skills/refs/heads/main/skills/.curated/pdf/SKILL.md
[5]: https://raw.githubusercontent.com/openai/skills/refs/heads/main/skills/.curated/spreadsheet/SKILL.md
[7]: https://raw.githubusercontent.com/openai/skills/refs/heads/main/skills/.curated/slides/SKILL.md
[9]: https://raw.githubusercontent.com/openai/skills/refs/heads/main/skills/.curated/screenshot/SKILL.md
[11]: https://raw.githubusercontent.com/openai/skills/refs/heads/main/skills/.curated/jupyter-notebook/SKILL.md
[13]: https://raw.githubusercontent.com/openai/skills/refs/heads/main/skills/.curated/transcribe/SKILL.md
[17]: https://raw.githubusercontent.com/openai/skills/refs/heads/main/skills/.curated/linear/SKILL.md
[19]: https://raw.githubusercontent.com/openai/skills/refs/heads/main/skills/.curated/notion-meeting-intelligence/SKILL.md
[21]: https://raw.githubusercontent.com/openai/skills/refs/heads/main/skills/.curated/notion-research-documentation/SKILL.md

---

## Requirements

### Для каждого skill создать структуру:

```text
skills/<slug>/
  ├── SKILL.md           # Из исходника
  └── metadata.yml       # Сгенерировать
```

### metadata.yml шаблон:

```yaml
source:
  repo: "https://github.com/openai/skills"
  path: "skills/.curated/<slug>"
  branch: "main"
  url: "https://github.com/openai/skills/tree/main/skills/.curated/<slug>"
  imported_at: "2026-03-25"

catalog:
  slug: "<slug>"
  title: "<Title>"
  tags:
    - "<tag1>"
    - "<tag2>"
  search_aliases:
    - "<alias1>"
    - "<alias2>"

skill:
  name: "<slug>"
  description: "<Краткое описание из SKILL.md>"

review:
  status: "not-reviewed"
  summary: ""
  reviewed_by: ""
  reviewed_at: ""

license:
  id: "Apache-2.0"
  url: "https://www.apache.org/licenses/LICENSE-2.0"
  notes: ""

risk:
  network: false
  shell: false
  writes_files: false
  reads_files: false
  secrets: false

tests:
  has_official_evals: false
  eval_mode: "generated"
  scenarios: []
  last_run: ""

policy:
  featured: false
  hidden: false
  replacement: ""
```

### search_aliases для каждого:

**doc:**
- документы word
- docx
- редактирование документов
- создание документов

**pdf:**
- пдф
- чтение pdf
- генерация pdf
- документы

**spreadsheet:**
- таблицы
- excel
- xlsx
- csv
- формулы

**slides:**
- презентации
- powerpoint
- pptx
- слайды

**screenshot:**
- скриншот
- захват экрана
- скрин

**jupyter-notebook:**
- jupyter
- notebook
- ipynb
- аналитика
- данные

**transcribe:**
- транскрибация
- аудио в текст
- расшифровка
- интервью

**linear:**
- задачи
- тикеты
- проекты
- linear

**notion-meeting-intelligence:**
- встречи
- notion
- agenda
- подготовка встреч

**notion-research-documentation:**
- исследования
- notion
- документация
- знания

---

## Acceptance Criteria

- [ ] Все 10 skills добавлены в `skills/`
- [ ] Для каждого есть `SKILL.md` и `metadata.yml`
- [ ] `npm run build` проходит успешно
- [ ] Все skills отображаются на сайте
- [ ] Поиск работает по search_aliases
- [ ] Лицензии указаны корректно

---

## Implementation Notes

**Порядок выполнения:**
1. Создать папки `skills/<slug>/` для каждого
2. Скачать `SKILL.md` из GitHub
3. Создать `metadata.yml` по шаблону
4. Запустить `npm run build` для проверки
5. Проверить отображение на сайте

**Скрипт для импорта (опционально):**
```bash
for slug in doc pdf spreadsheet slides screenshot jupyter-notebook transcribe linear notion-meeting-intelligence notion-research-documentation; do
  mkdir -p skills/$slug
  curl -L "https://raw.githubusercontent.com/openai/skills/refs/heads/main/skills/.curated/$slug/SKILL.md" -o skills/$slug/SKILL.md
done
```

**Примечания:**
- Skill `tasks` уже есть в репозитории
- Для `transcribe` требуется `OPENAI_API_KEY` — отметить в описании
- Лицензии: Apache-2.0 для OpenAI skills, MIT-style для notion-*
