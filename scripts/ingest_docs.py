#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import os
import subprocess
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = ROOT / "vault" / "docs" / "source"
DST_DIR = ROOT / "vault" / "docs" / "derived-md"


def iso_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def doc_id_for(path: Path) -> str:
    stat = path.stat()
    raw = f"{path.resolve()}::{stat.st_mtime_ns}::{stat.st_size}"
    digest = hashlib.sha1(raw.encode("utf-8")).hexdigest()[:12]
    return f"doc-{digest}"


def escape_yaml(value: str) -> str:
    return value.replace("\\", "\\\\").replace('"', '\\"')


def build_frontmatter(source_file: Path, doc_id: str, created_at: str, updated_at: str) -> str:
    title = source_file.stem
    return f"""---
id: "{doc_id}"
type: "doc"
title: "{escape_yaml(title)}"
source: "local_file"
source_path: "{escape_yaml(str(source_file.relative_to(ROOT)))}"
created_at: "{created_at}"
updated_at: "{updated_at}"
---
"""


def run_markitdown(source_file: Path) -> str:
    """
    Calls MarkItDown CLI and returns markdown text.
    Adjust the command if your MarkItDown binary name/flags differ.
    """
    result = subprocess.run(
        ["markitdown", str(source_file)],
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout.strip()


def ingest_file(source_file: Path) -> Path:
    doc_id = doc_id_for(source_file)
    output_file = DST_DIR / f"{source_file.stem}.md"

    created_at = iso_now()
    updated_at = created_at
    if output_file.exists():
        # сохраняем created_at стабильным, если файл уже был
        old_text = output_file.read_text(encoding="utf-8", errors="ignore")
        for line in old_text.splitlines():
            if line.startswith("created_at:"):
                created_at = line.split(":", 1)[1].strip().strip('"')
                break

    markdown_body = run_markitdown(source_file)
    frontmatter = build_frontmatter(source_file, doc_id, created_at, updated_at)
    final_text = f"{frontmatter}\n{markdown_body}\n"

    output_file.write_text(final_text, encoding="utf-8")
    return output_file


def main() -> int:
    SRC_DIR.mkdir(parents=True, exist_ok=True)
    DST_DIR.mkdir(parents=True, exist_ok=True)

    files = [p for p in SRC_DIR.iterdir() if p.is_file()]
    if not files:
        print(f"[INFO] No files found in {SRC_DIR}")
        return 0

    processed = 0
    failed = 0

    for source_file in files:
        try:
            out = ingest_file(source_file)
            processed += 1
            print(f"[OK] {source_file.name} -> {out.relative_to(ROOT)}")
        except subprocess.CalledProcessError as exc:
            failed += 1
            print(f"[ERROR] MarkItDown failed for {source_file.name}: {exc.stderr or exc}")
        except Exception as exc:
            failed += 1
            print(f"[ERROR] Failed to process {source_file.name}: {exc}")

    print(f"[DONE] processed={processed} failed={failed}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
