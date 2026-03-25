# Разработать полный bundle skills + установщик для бизнес-агента

**ID:** feature.business-md-bundle  
**Complexity:** high  
**Priority:** high  
**Status:** todo

---

## Problem

Требуется создать единый markdown-first bundle навыков для AI-агента, который умеет работать с почтой, событиями, документами, задачами и контактами через локальную файловую систему.

**Цель:** bundle `business-md-bundle` после установки должен:
- синхронизировать почту в Markdown
- синхронизировать события и контакты в Markdown
- зеркалить Google Drive / Yandex Disk в локальную ФС
- конвертировать документы в Markdown для индексации
- искать по vault через локальный индекс
- собирать черновики писем, встреч и документов
- открывать черновики в пользовательских приложениях

---

## Scope

### In
- Bundle skeleton структура
- Vendoring upstream skills (OpenAI + другие)
- First-party skills для vault модели
- Installer (PowerShell + Bash)
- Shared scripts для синхронизации
- Vault schema для единой модели данных

### Out
- Мутация боевых данных (только черновики)
- Кросс-ссылки skills по имени
- Отправка писем/встреч по умолчанию
- Сложные GUI клиенты

---

## Requirements

### 1. Bundle Skeleton

**Структура:**
```text
skills/
  vendor/
    doc/, pdf/, spreadsheet/, slides/, screenshot/
    transcribe/, tasks/, weavmail/
  first_party/
    setup-bundle/, vault-schema/, qmd/
    mail-md/, calendar-md/, contacts-md/
    doc-ingest-md/, cloud-mirror/
    google-workspace-md/
    mail-draft/, meeting-draft/
    desktop-handoff/, vault-linker/

bin/
  bundle-install.ps1, bundle-install.sh
  bundle-verify.ps1, bundle-verify.sh

scripts/
  sync_mail.py, sync_calendar.py
  ingest_docs.py, link_entities.py
  build_draft_email.py, build_draft_meeting.py

templates/vault/
  _schemas/, mail/, events/, contacts/
  docs/, tasks/, projects/, drafts/

bundle.yml
README.md
```

### 2. Vendoring Upstream Skills

**Источники:**
- `openai/skills` curated: doc, pdf, spreadsheet, slides, screenshot, transcribe
- `redsquad-tech/is-goose`: tasks
- `yankeguo/weavmail`: mail sync

**Требования:**
- Сохранить upstream LICENSE.txt
- Добавить Windows install/verify
- Привести пути к vault конвенции
- Убрать лишние мутирующие операции

### 3. First-Party Skills

**setup-bundle:**
- читать bundle.yml
- ставить зависимости через PowerShell/Bash
- запускать bundle-verify
- поддерживать `ensure <tool|profile>`

**vault-schema:**
- определить папки vault
- определить frontmatter для mail, event, contact, doc, task, project, draft
- определить правила wikilinks и stable IDs

**qmd:**
- Windows-friendly install/verify
- default mode = `qmd search`
- refresh/reindex команда

**mail-md:**
- sync почты из IMAP через weavmail
- перенос в vault layout
- thread-notes и wiki-links

**calendar-md:**
- read-only события из CalDAV/Google Calendar
- события в Markdown
- link с contacts

**contacts-md:**
- сбор из mail headers, calendar, CardDAV
- канонический `contacts/<id>.md`
- merge дубликатов

**doc-ingest-md:**
- wrapper вокруг MarkItDown
- `vault/docs/source/` → `vault/docs/derived-md/`
- metadata и ссылки на источник

**cloud-mirror:**
- wrapper вокруг rclone
- read-only mirror Google Drive / Yandex Disk
- триггер doc-ingest на изменения

**google-workspace-md:**
- wrapper вокруг gogcli
- Gmail search/read, Drive download
- Docs export в md
- Calendar read-only
- Drafts create/update

**mail-draft:**
- сбор черновика письма из контекста
- сохранение: `.md`, `.html`, `.eml`
- опционально Gmail draft

**meeting-draft:**
- сбор черновика встречи
- сохранение: `.md`, `.ics`
- attendees, agenda, related docs

**desktop-handoff:**
- открытие файлов через Windows associations
- предпочтительно Thunderbird

**vault-linker:**
- граф связей между сущностями
- backlinks и alias-resolving

### 4. Installer

**Профили:**
- `core`, `docs`, `mail`, `calendar`, `cloud`, `google`, `audio`, `all`

**Минимум для core:**
- Git, Node 22+, Python 3.10+
- uv, qmd, weavmail, markitdown, rclone

**Команды:**
```powershell
bundle-install ensure core
bundle-install ensure qmd
bundle-install ensure weavmail
bundle-install ensure markitdown
bundle-install ensure rclone
bundle-install ensure sog
bundle-install ensure gog
bundle-install verify
```

### 5. Vault Schema

**Минимальная структура:**
```text
vault/
  mail/raw/, mail/threads/
  events/
  contacts/
  orgs/
  projects/
  docs/source/, docs/derived-md/
  tasks/todo/, tasks/done/
  drafts/email/, drafts/meeting/
  tmp/screens/
```

---

## Acceptance Criteria

- [ ] `bundle-install ensure core` поднимает окружение на чистой Windows
- [ ] `bundle-install verify` подтверждает работу всех tools
- [ ] Каждый skill самодостаточен (нет ссылок на другие skills по имени)
- [ ] Каждый skill умеет запросить софт через `bundle-install ensure ...`
- [ ] Почта синкается в Markdown в vault
- [ ] События синкаются в Markdown в vault
- [ ] Документы с локального диска, Google Drive, Yandex Disk → source → derived-md
- [ ] qmd ищет по письмам, событиям, документам, задачам
- [ ] mail-draft создаёт `.md + .html + .eml`
- [ ] meeting-draft создаёт `.md + .ics`
- [ ] desktop-handoff открывает drafts в приложении
- [ ] Все vendor skills имеют source attribution и лицензионные данные
- [ ] Read-only по умолчанию (кроме черновиков)
- [ ] Windows-first (PowerShell обязателен)

---

## Implementation Plan

### Этап 1: Skeleton (1-2 дня)
1. Создать структуру директорий
2. Создать bundle.yml
3. Создать bin/bundle-install.ps1 (base)
4. Создать bin/bundle-verify.ps1 (base)

### Этап 2: Vendoring (2-3 дня)
1. Вендорить openai/skills (doc, pdf, spreadsheet, slides, screenshot, transcribe)
2. Вендорить tasks из is-goose
3. Вендорить weavmail skill
4. Добавить LICENSE.txt для каждого
5. Patch paths и Windows install

### Этап 3: Core First-Party (3-4 дня)
1. setup-bundle skill
2. vault-schema skill
3. qmd wrapper
4. bundle-install full implementation

### Этап 4: Data Sync (3-4 дня)
1. mail-md + sync_mail.py
2. calendar-md + sync_calendar.py
3. contacts-md
4. doc-ingest-md + ingest_docs.py

### Этап 5: Cloud Integration (2-3 дня)
1. cloud-mirror + rclone config
2. google-workspace-md + gogcli integration

### Этап 6: Drafts & Handoff (2-3 дня)
1. mail-draft + build_draft_email.py
2. meeting-draft + build_draft_meeting.py
3. desktop-handoff

### Этап 7: Linking & Polish (2-3 дня)
1. vault-linker + link_entities.py
2. Тестирование end-to-end
3. Документация README

---

## Dependencies

**Upstream проекты:**
- [qmd](https://github.com/tobi/qmd) — локальный поиск по markdown
- [weavmail](https://github.com/yankeguo/weavmail) — IMAP → Markdown
- [MarkItDown](https://github.com/microsoft/markitdown) — конвертация документов
- [rclone](https://rclone.org/) — cloud mirror
- [sogcli](https://github.com/visionik/sogcli) — CalDAV/CardDAV
- [gogcli](https://github.com/steipete/gogcli) — Google Workspace
- [openai/skills](https://github.com/openai/skills) — curated skills

**Лицензии:**
- OpenAI skills: Apache-2.0
- weavmail: MIT
- MarkItDown: MIT
- sogcli: MIT
- gogcli: MIT

---

## Risks

1. **Windows compatibility** — некоторые tools могут требовать доработки
2. **OAuth flow для Google** — требует browser-based auth настройки
3. **Сложность bundle** — много зависимостей, нужен тщательный verify
4. **Время реализации** — 15-20 дней полной работы

---

## Trade-offs

### Почему не один mega-skill?
- Модульность = проще тестировать и поддерживать
- Можно включать/выключать профили
- Меньше конфликтов зависимостей

### Почему PowerShell first?
- Windows-first требование
- PowerShell встроен в Windows 10/11
- Bash через WSL/Git Bash опционально

### Почему read-only по умолчанию?
- Безопасность данных
- Человек принимает финальные решения
- Черновики — безопасный промежуточный слой
