# Проверка skills с нуля (business-md-bundle)

Этот гайд показывает, как **с чистого окружения** проверить рабочий пайплайн skills:

- `setup-bundle`
- `vault-schema`
- `qmd`
- `doc-ingest-md`
- `mail-md`
- `weavmail` (опционально, если есть IMAP)

---

## 0) Предусловия

В корне репозитория:

```bash
git clone <repo-url>
cd skills-store
```

---

## 1) Базовая установка окружения (setup-bundle)

Linux/macOS:

```bash
./bin/bundle-install.sh ensure core
./bin/bundle-install.sh ensure vault
./bin/bundle-install.sh verify
```

Windows PowerShell:

```powershell
./bin/bundle-install.ps1 ensure core
./bin/bundle-install.ps1 ensure vault
./bin/bundle-install.ps1 verify
```

Ожидаемо:

- установлены/доступны `git`, `node`, `python`, `uv`, `qmd`, `weavmail`, `markitdown`, `rclone`
- создана структура `vault/`.

---

## 2) Проверка схемы vault (vault-schema)

Проверь, что существуют папки:

- `vault/mail/raw`
- `vault/mail/threads`
- `vault/events`
- `vault/contacts`
- `vault/docs/source`
- `vault/docs/derived-md`
- `vault/tasks/todo`
- `vault/tasks/done`
- `vault/drafts/email`
- `vault/drafts/meeting`

Быстрая проверка:

```bash
find vault -maxdepth 3 -type d | sort
```

---

## 3) Проверка ingest + qmd search

### 3.1 Положить исходный документ

```bash
mkdir -p vault/docs/source
cat > vault/docs/source/demo.txt <<'EOF2'
Quarterly report: revenue growth and customer retention.
EOF2
```

### 3.2 Запустить ingest

```bash
python scripts/ingest_docs.py
```

Ожидаемо:

- появляется файл в `vault/docs/derived-md/*.md`
- скрипт пытается обновить `qmd index`.

### 3.3 Проверить поиск

```bash
qmd search "revenue" vault/docs/derived-md || qmd search "revenue"
```

Ожидаемо: в выдаче есть `demo`/соответствующий derived-файл.

---

## 4) Проверка local mail flow (mail-md, без IMAP)

### 4.1 Создать локальное письмо в weavmail-формате

```bash
mkdir -p mails/default_INBOX
cat > mails/default_INBOX/1001.md <<'EOF2'
---
uid: "1001"
account: default
mailbox: INBOX
subject: "Re: Launch plan"
from: "alice@example.com"
to:
- "bob@example.com"
cc: []
date: "01 Jan 2026 12:00:00 +0000"
---

Let's finalize launch checklist.
EOF2
```

### 4.2 Синк в vault layout

```bash
python scripts/sync_mail.py --source ./mails
```

Ожидаемо:

- созданы `vault/mail/raw/mail-*.md`
- создан `vault/mail/threads/thread-*.md`
- в raw-файле есть блок `## Links`
- в thread-файле есть `## Thread notes` и `## Messages`.

---

## 5) Проверка weavmail + mail-md (D2, с реальным IMAP)

> Если нет тестового IMAP-аккаунта, этот шаг можно пропустить.

### 5.1 Настроить аккаунт

```bash
weavmail account config \
  --imap-host <imap-host> \
  --smtp-host <smtp-host> \
  --username <email> \
  --password <app-password> \
  --addresses <email>
```

### 5.2 Запустить синк + импорт в vault

```bash
python scripts/sync_mail.py --weavmail-sync --limit 20
```

Ожидаемо:

- `weavmail` обновляет `./mails`
- скрипт переносит письма в `vault/mail/raw`
- обновляются/создаются треды в `vault/mail/threads`.

---

## 6) Финальный smoke-check всего пайплайна

```bash
./bin/bundle-verify.sh
python scripts/ingest_docs.py
python scripts/sync_mail.py --source ./mails
qmd search "launch" vault/docs/derived-md || qmd search "launch"
```

Если все шаги выше проходят — минимальная end-to-end проверка skills выполнена.
