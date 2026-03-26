# Document Ingest to Markdown

## Purpose
Converts documents into Markdown for indexing and search.

---

## Input
vault/docs/source/

---

## Output
vault/docs/derived-md/

---

## Flow
1. Scan source
2. Convert via MarkItDown
3. Save Markdown
4. Add metadata

---

## Metadata

```yaml
id: doc-<hash>
type: doc
title: <filename>
source: local_file
source_path: <path>
created_at: <timestamp>
updated_at: <timestamp>
```

---

## Behavior
- read-only source
- idempotent processing

---

## Dependencies
- MarkItDown
