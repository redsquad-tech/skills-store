# Mail to Markdown (mail-md)

## Purpose

Syncs email data into vault markdown layout with two outputs:

- `vault/mail/raw/` — normalized message files
- `vault/mail/threads/` — thread notes and message index

---

## D1. Local mail flow (without real IMAP)

### Source format (input markdown)

The script reads weavmail-style files (frontmatter + body):

```yaml
---
uid: "12345"
account: default
mailbox: INBOX
subject: "Project update"
from: "alice@example.com"
to:
  - "bob@example.com"
cc: []
date: "01 Jan 2026 12:00:00 +0000"
---

Message body...
```

Place files into e.g.:

- `mails/default_INBOX/12345.md`

### Run local flow

```bash
python scripts/sync_mail.py --source ./mails
```

### Output layout

- `vault/mail/raw/mail-<hash>.md`
- `vault/mail/threads/thread-<hash>.md`

---

## Thread notes format

Each file in `vault/mail/threads/` contains:

- `## Thread notes` — editable human notes (decisions/follow-ups)
- `## Messages` — auto-generated list of linked messages

On resync, `Thread notes` content is preserved.

---

## D2. Connect weavmail (real IMAP sync)

### Install/ensure

```bash
./bin/bundle-install.sh ensure weavmail
```

### Configure and sync

```bash
weavmail account config --imap-host <host> --smtp-host <host> --username <user> --password <password> --addresses <email>
python scripts/sync_mail.py --weavmail-sync --limit 50
```

This flow does:

1. `weavmail sync`
2. import synced markdown from `./mails`
3. write vault layout (`raw + threads`)
4. generate links to thread and contacts

---

## DoD pipeline

`imap/weavmail or local md -> vault/mail/raw -> vault/mail/threads -> thread notes + links`
