# Business MD Bundle — Setup & Usage Guide

## Overview

This bundle provides a local Markdown-based data layer ("vault") and a set of skills for working with documents, search, and business data.

---

## Project Structure

```
your-project/
  bundle.yml
  bin/
    bundle-install.sh
    bundle-install.ps1
    bundle-verify.sh
    bundle-verify.ps1
  skills/
  vault/
```

---

## Prerequisites

- git
- node
- python3

---

## Commands

### Ensure core tools

./bin/bundle-install.sh ensure core

### Create vault structure

./bin/bundle-install.sh ensure vault

### Verify setup

./bin/bundle-install.sh verify

---

## Typical Setup Flow

./bin/bundle-install.sh ensure core
./bin/bundle-install.sh ensure vault
./bin/bundle-install.sh verify

---

## Vault

Input:
vault/docs/source/

Output:
vault/docs/derived-md/

---

## Notes

- Vault is local Markdown storage
- Data is read-only except drafts
- This is skeleton stage

---

## Next Steps

- Add markitdown integration
- Add qmd search
- Add mail/calendar sync
