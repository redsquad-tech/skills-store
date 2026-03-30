# QMD Search

## Purpose
Provides local full-text search over Markdown files in the bundle vault.

This skill is used after ingest/sync steps to search across `vault/docs/derived-md` and other markdown entities.

---

## Setup (required)

Linux/macOS:

```bash
./bin/bundle-install.sh ensure qmd
```

Windows (PowerShell):

```powershell
./bin/bundle-install.ps1 ensure qmd
```

---

## Minimal working pipeline (DoD)

```bash
python scripts/ingest_docs.py
qmd index vault/docs/derived-md || qmd index
qmd search "<query>" vault/docs/derived-md || qmd search "<query>"
```

Pipeline target:

`source doc -> derived-md -> qmd search`

---

## Real commands to use

### Build/refresh index

```bash
qmd index vault/docs/derived-md
```

If your local qmd build does not accept path as argument:

```bash
qmd index
```

### Search

```bash
qmd search "invoice"
qmd search "project alpha" vault/docs/derived-md
```

---

## Behavior

- Read-only search over local files.
- No mutations of source data.
- Works together with `doc-ingest-md` output.
