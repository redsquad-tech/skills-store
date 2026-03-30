# Document Ingest to Markdown

## When to use

Use this skill when the user asks to:
- process documents
- convert files to markdown
- prepare documents for search or indexing
- ingest files into the vault

---

## What it does

Converts files from `vault/docs/source/` into markdown files in `vault/docs/derived-md/`.

After ingest, it refreshes qmd index (best-effort), so search becomes available immediately.

---

## Input

`vault/docs/source/`

## Output

`vault/docs/derived-md/`

---

## Steps

1. Scan files in `vault/docs/source/`
2. Convert each file to markdown via MarkItDown
3. Save output into `vault/docs/derived-md/` with metadata frontmatter
4. Trigger qmd index refresh

---

## Metadata format

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

## Execution

```bash
python scripts/ingest_docs.py
```

Then search:

```bash
qmd search "<query>" vault/docs/derived-md || qmd search "<query>"
```

---

## Pipeline (DoD)

`source doc -> derived-md -> qmd search`
