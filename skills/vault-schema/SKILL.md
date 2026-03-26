# Vault Schema

## Purpose
Defines the canonical structure of the local vault used by the business bundle.

The vault is a Markdown-first data layer where all entities (mail, events, contacts, documents, drafts) are stored as files.

This schema ensures consistency across all skills and enables search, linking, and downstream processing.

---

## Vault Structure

```
vault/
  mail/raw/
  mail/threads/
  events/
  contacts/
  orgs/
  projects/
  docs/source/
  docs/derived-md/
  tasks/todo/
  tasks/done/
  drafts/email/
  drafts/meeting/
  tmp/screens/
```

---

## Entity Types

- mail
- event
- contact
- doc
- task
- project
- draft

---

## Frontmatter (Required Fields)

```yaml
id: <stable_id>
type: <entity_type>
title: <string>
created_at: <ISO timestamp>
updated_at: <ISO timestamp>
source: <origin system or file>
aliases: []
```

---

## Stable IDs

- mail → mail-<hash>
- event → event-<uid>
- contact → contact-<hash>
- doc → doc-<hash>
- draft → draft-<timestamp>

---

## Linking Rules

Use wikilinks:
[[contact-123]]
[[doc-abc]]

---

## Read-only Policy

All synced data must be read-only.
Only drafts/ can be modified.
