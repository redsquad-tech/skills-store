#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import re
import subprocess
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_WEAVMAIL_DIR = ROOT / "mails"
VAULT_RAW_DIR = ROOT / "vault" / "mail" / "raw"
VAULT_THREADS_DIR = ROOT / "vault" / "mail" / "threads"


def iso_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def sha_id(prefix: str, raw: str, size: int = 12) -> str:
    return f"{prefix}-{hashlib.sha1(raw.encode('utf-8')).hexdigest()[:size]}"


def normalize_subject(subject: str) -> str:
    subject = subject or "(no-subject)"
    subject = subject.strip()
    subject = re.sub(r"^(re|fwd?)\s*:\s*", "", subject, flags=re.IGNORECASE)
    return subject.strip() or "(no-subject)"


def parse_frontmatter(md_text: str) -> tuple[dict, str]:
    text = md_text.replace("\r\n", "\n")
    if not text.startswith("---\n"):
        return {}, text

    try:
        _, rest = text.split("---\n", 1)
        fm_raw, body = rest.split("\n---\n", 1)
    except ValueError:
        return {}, text

    data: dict[str, object] = {}
    current_list_key: str | None = None

    for line in fm_raw.split("\n"):
        if not line.strip():
            continue

        if line.startswith("- ") and current_list_key:
            data.setdefault(current_list_key, [])
            assert isinstance(data[current_list_key], list)
            data[current_list_key].append(line[2:].strip())
            continue

        current_list_key = None
        if ":" not in line:
            continue

        key, value = line.split(":", 1)
        key = key.strip()
        value = value.strip().strip('"')
        if value == "":
            data[key] = []
            current_list_key = key
        else:
            data[key] = value

    return data, body.lstrip("\n")


def list_value(meta: dict, key: str) -> list[str]:
    value = meta.get(key, [])
    if isinstance(value, list):
        return [str(v).strip() for v in value if str(v).strip()]
    if isinstance(value, str) and value.strip():
        return [v.strip() for v in value.split(",") if v.strip()]
    return []


def scalar(meta: dict, key: str, default: str = "") -> str:
    value = meta.get(key, default)
    if isinstance(value, list):
        return ", ".join(str(v) for v in value)
    return str(value)


def mail_identity(meta: dict, source_file: Path) -> str:
    account = scalar(meta, "account", "default")
    mailbox = scalar(meta, "mailbox", "INBOX")
    uid = scalar(meta, "uid")
    base = f"{account}|{mailbox}|{uid or source_file.stem}"
    return sha_id("mail", base)


def thread_identity(meta: dict) -> str:
    explicit = scalar(meta, "thread_id")
    if explicit:
        return explicit

    subject = normalize_subject(scalar(meta, "subject", "(no-subject)"))
    return sha_id("thread", subject.lower())




def display_path(path: Path) -> str:
    try:
        return path.relative_to(ROOT).as_posix()
    except ValueError:
        return path.resolve().as_posix()

def contact_links(meta: dict) -> list[tuple[str, str]]:
    addresses: list[str] = []
    for key in ("from", "to", "cc"):
        addresses.extend(list_value(meta, key) if key != "from" else [scalar(meta, "from")])

    cleaned = []
    for addr in addresses:
        candidate = addr.strip().strip("<>")
        if "@" in candidate:
            cleaned.append(candidate.lower())

    unique = sorted(set(cleaned))
    return [(email, sha_id("contact", email)) for email in unique]


def make_mail_markdown(meta: dict, body: str, source_file: Path) -> tuple[str, str, str]:
    mail_id = mail_identity(meta, source_file)
    thread_id = thread_identity(meta)

    subject = scalar(meta, "subject", "(no-subject)")
    sender = scalar(meta, "from")
    to = list_value(meta, "to")
    cc = list_value(meta, "cc")
    date = scalar(meta, "date")
    account = scalar(meta, "account", "default")
    mailbox = scalar(meta, "mailbox", "INBOX")
    uid = scalar(meta, "uid", source_file.stem)

    contacts = contact_links(meta)
    contacts_links = "\n".join([f"- [[{cid}]] ({email})" for email, cid in contacts]) or "- (none)"

    frontmatter = f"""---
id: \"{mail_id}\"
type: \"mail\"
thread_id: \"{thread_id}\"
subject: \"{subject.replace('"', '\\"')}\"
from: \"{sender.replace('"', '\\"')}\"
to:
"""
    for item in to:
        frontmatter += f"  - \"{item.replace('"', '\\"')}\"\n"

    frontmatter += "cc:\n"
    for item in cc:
        frontmatter += f"  - \"{item.replace('"', '\\"')}\"\n"

    frontmatter += f"""date: \"{date.replace('"', '\\"')}\"
account: \"{account.replace('"', '\\"')}\"
mailbox: \"{mailbox.replace('"', '\\"')}\"
uid: \"{uid.replace('"', '\\"')}\"
source: \"weavmail\"
source_path: \"{display_path(source_file)}\"
updated_at: \"{iso_now()}\"
---
"""

    links_block = f"""
## Links

- Thread: [[{thread_id}]]
- Contacts:
{contacts_links}
"""

    final_text = f"{frontmatter}\n{links_block}\n\n## Message\n\n{body.strip()}\n"
    return mail_id, thread_id, final_text


def read_existing_thread_notes(thread_file: Path) -> str:
    if not thread_file.exists():
        return "- Add context, decisions, and follow-ups for this thread."

    text = thread_file.read_text(encoding="utf-8", errors="ignore")
    marker_a = "## Thread notes"
    marker_b = "## Messages"
    if marker_a not in text:
        return "- Add context, decisions, and follow-ups for this thread."

    start = text.find(marker_a) + len(marker_a)
    end = text.find(marker_b)
    if end == -1:
        section = text[start:].strip()
    else:
        section = text[start:end].strip()

    section = section.strip()
    return section or "- Add context, decisions, and follow-ups for this thread."


def render_thread_file(thread_id: str, subject: str, message_items: list[dict], notes: str) -> str:
    fm = f"""---
id: \"{thread_id}\"
type: \"mail-thread\"
title: \"{subject.replace('"', '\\"')}\"
updated_at: \"{iso_now()}\"
---
"""

    messages_lines = []
    for item in sorted(message_items, key=lambda x: x["date"] or ""):
        messages_lines.append(
            f"- [[{item['mail_id']}]] — {item['date'] or 'unknown-date'} — {item['from'] or 'unknown-sender'}"
        )

    messages_text = "\n".join(messages_lines) if messages_lines else "- (no messages)"

    return f"""{fm}
## Thread notes

{notes}

## Messages

{messages_text}
"""


def run_weavmail_sync(limit: int) -> None:
    cmd = ["weavmail", "sync", "--limit", str(limit)]
    subprocess.run(cmd, check=True)


def sync_mail(source_dir: Path) -> tuple[int, int]:
    source_files = sorted(source_dir.glob("**/*.md"))
    if not source_files:
        print(f"[INFO] No mail files found in {source_dir}")
        return 0, 0

    VAULT_RAW_DIR.mkdir(parents=True, exist_ok=True)
    VAULT_THREADS_DIR.mkdir(parents=True, exist_ok=True)

    thread_map: dict[str, list[dict]] = defaultdict(list)

    processed = 0
    failed = 0

    for src in source_files:
        try:
            meta, body = parse_frontmatter(src.read_text(encoding="utf-8", errors="ignore"))
            mail_id, thread_id, content = make_mail_markdown(meta, body, src)

            output = VAULT_RAW_DIR / f"{mail_id}.md"
            output.write_text(content, encoding="utf-8")

            thread_map[thread_id].append(
                {
                    "mail_id": mail_id,
                    "date": scalar(meta, "date"),
                    "from": scalar(meta, "from"),
                    "subject": normalize_subject(scalar(meta, "subject", "(no-subject)")),
                }
            )

            processed += 1
            print(f"[OK] {display_path(src)} -> {display_path(output)}")
        except Exception as exc:
            failed += 1
            print(f"[ERROR] Failed to process {src}: {exc}")

    for thread_id, items in thread_map.items():
        thread_file = VAULT_THREADS_DIR / f"{thread_id}.md"
        notes = read_existing_thread_notes(thread_file)
        subject = items[0]["subject"] if items else "(no-subject)"
        thread_file.write_text(render_thread_file(thread_id, subject, items, notes), encoding="utf-8")
        print(f"[OK] thread -> {display_path(thread_file)}")

    return processed, failed


def main() -> int:
    parser = argparse.ArgumentParser(description="Sync mail markdown files into vault layout")
    parser.add_argument("--source", type=Path, default=DEFAULT_WEAVMAIL_DIR, help="Source directory with weavmail markdown files")
    parser.add_argument("--weavmail-sync", action="store_true", help="Run `weavmail sync` before import")
    parser.add_argument("--limit", type=int, default=50, help="Limit for weavmail sync when --weavmail-sync is set")
    args = parser.parse_args()

    if args.weavmail_sync:
        print("[INFO] Running weavmail sync...")
        run_weavmail_sync(args.limit)

    processed, failed = sync_mail(args.source)
    print(f"[DONE] processed={processed} failed={failed}")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
