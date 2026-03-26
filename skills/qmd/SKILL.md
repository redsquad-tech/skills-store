# QMD Search

## Purpose
Provides local full-text search over the vault Markdown files.

This skill enables the agent to find relevant information across documents, mail, events, and other entities stored in the vault.

---

## Capabilities

- Search across all Markdown files
- Fast local indexing
- Supports reindexing

---

## Usage

Typical usage:

1. Run search:
   qmd search "query"

2. Refresh index:
   qmd index

---

## Behavior

- Works on local filesystem
- Reads all markdown files in vault
- Does not modify data

---

## Dependencies

- qmd (local search tool)

---

## Expected Outcome

- Relevant documents are found quickly
- Results can be used by the agent for answering queries
