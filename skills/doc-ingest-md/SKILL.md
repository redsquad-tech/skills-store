# Document Ingest to Markdown

## When to use

Use this skill when the user asks to: 
- process documents 
- convert files to markdown 
- prepare documents for search or indexing 
- ingest files into the vault

---

## What it does

This skill converts documents from the source folder into Markdown
format and stores them in the vault for further indexing and search.

---

## Input

vault/docs/source/

## Output

vault/docs/derived-md/

---

## Steps

1.  Scan files in `vault/docs/source/`
2.  For each file:
    -   read content
    -   convert to Markdown using MarkItDown
3.  Save result to `vault/docs/derived-md/`
4.  Add metadata block to each file

---

## Metadata format

``` yaml
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

-   Do not modify source files
-   Re-run safely (idempotent)
-   Skip already processed files if unchanged

---

## Dependencies

-   MarkItDown
(pip install markitdown[all])

---

## Execution

When user asks to process documents:

1.  Read files from `vault/docs/source/`
2.  Convert them to Markdown
3.  Save results to `vault/docs/derived-md/`

---

## Implementation

Script: scripts/ingest_docs.py

Run: python scripts/ingest_docs.py
