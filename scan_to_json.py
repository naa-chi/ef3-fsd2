# !/usr/bin/env python3
"""
scan_to_json.py

Recursively scans a folder (and all of its subfolders / sub-subfolders) and
dumps the complete tree — directory structure + text file contents — into a
structured JSON file called `context.json`.

Usage:
    python scan_to_json.py                # scan current directory
    python scan_to_json.py /path/to/root  # scan a specific folder
    python scan_to_json.py -o out.json --max-size 1048576

The generated JSON has this shape:

    {
      "root": "/abs/path",
      "generated_at": "...",
      "summary": {"files": 12, "folders": 3},
      "tree": {
        "name": "root",
        "type": "folder",
        "path": "root",
        "children": [
          {"name": "a.txt", "type": "file", "path": "root/a.txt", "size": 5, "content": "hello"},
          {"name": "sub",  "type": "folder", "path": "root/sub", "children": [ ... ]}
        ]
      }
    }
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

# Folders that are almost never useful to dump (change if you want them)
SKIP_DIRS = {
    ".git", ".svn", ".hg",
    "node_modules", "__pycache__", ".venv", "venv", "env",
    ".idea", ".vscode",
    "dist", "build", ".next", ".cache",
    ".pytest_cache", ".mypy_cache", ".ruff_cache",
}

# Extensions that are always treated as binary
SKIP_EXTENSIONS = {
    ".pyc", ".pyo", ".so", ".dll", ".dylib", ".exe", ".bin", ".o", ".a",
    ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".ico", ".webp", ".tiff",
    ".mp3", ".mp4", ".avi", ".mov", ".wav", ".flac", ".mkv", ".webm",
    ".zip", ".tar", ".gz", ".rar", ".7z", ".bz2", ".xz",
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
    ".ttf", ".otf", ".woff", ".woff2", ".eot",
    ".sqlite", ".sqlite3", ".db",
}

DEFAULT_MAX_SIZE = 5 * 1024 * 1024  # 5 MB per file


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def is_probably_text(path: Path, sample_size: int = 8192) -> bool:
    """Read a small chunk and decide if the file looks like text."""
    try:
        with path.open("rb") as f:
            chunk = f.read(sample_size)
    except OSError:
        return False
    if b"\x00" in chunk:          # null byte → binary
        return False
    try:
        chunk.decode("utf-8")
    except UnicodeDecodeError:
        try:
            chunk.decode("latin-1")
        except UnicodeDecodeError:
            return False
    return True


def read_file(path: Path, max_size: int) -> dict:
    """Return {size, content, [note/error]} for a single file."""
    try:
        size = path.stat().st_size
    except OSError as e:
        return {"size": None, "content": None, "error": f"stat failed: {e}"}

    if size > max_size:
        return {"size": size, "content": None,
                "note": f"skipped: larger than {max_size} bytes"}

    if path.suffix.lower() in SKIP_EXTENSIONS:
        return {"size": size, "content": None,
                "note": "skipped: binary extension"}

    if not is_probably_text(path):
        return {"size": size, "content": None,
                "note": "skipped: binary content"}

    for encoding in ("utf-8", "utf-8-sig", "latin-1"):
        try:
            return {"size": size, "content": path.read_text(encoding=encoding)}
        except UnicodeDecodeError:
            continue
        except Exception as e:
            return {"size": size, "content": None, "error": str(e)}

    return {"size": size, "content": None, "error": "could not decode"}


def rel_path(p: Path, root: Path) -> str:
    """Path relative to the root's *parent*, so the root name is included."""
    try:
        return str(p.relative_to(root.parent))
    except ValueError:
        return str(p)


# ---------------------------------------------------------------------------
# Recursive scan
# ---------------------------------------------------------------------------

def scan(path: Path, root: Path, max_size: int, skip_dirs: set[str]) -> dict:
    """Return a nested dict describing `path` and everything below it."""
    node: dict = {
        "name": path.name or str(path),
        "type": "folder",
        "path": rel_path(path, root),
        "children": [],
    }

    try:
        entries = sorted(path.iterdir(),
                         key=lambda p: (p.is_file(), p.name.lower()))
    except OSError as e:
        node["error"] = f"cannot list directory: {e}"
        return node

    for entry in entries:
        if entry.is_symlink():
            node["children"].append({
                "name": entry.name,
                "type": "symlink",
                "path": rel_path(entry, root),
                "target": os.readlink(entry),
            })

        elif entry.is_dir():
            if entry.name in skip_dirs:
                node["children"].append({
                    "name": entry.name,
                    "type": "folder",
                    "path": rel_path(entry, root),
                    "skipped": True,
                })
            else:
                node["children"].append(
                    scan(entry, root, max_size, skip_dirs)
                )

        elif entry.is_file():
            file_node = {
                "name": entry.name,
                "type": "file",
                "path": rel_path(entry, root),
            }
            file_node.update(read_file(entry, max_size))
            node["children"].append(file_node)

    return node


def count_nodes(node: dict) -> tuple[int, int]:
    """Return (file_count, folder_count) under `node`."""
    files = folders = 0
    for child in node.get("children", []):
        if child["type"] == "folder" and not child.get("skipped"):
            folders += 1
            f, d = count_nodes(child)
            files += f
            folders += d
        elif child["type"] == "file":
            files += 1
    return files, folders


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    ap = argparse.ArgumentParser(
        description="Recursively dump a folder tree (+ file contents) to context.json"
    )
    ap.add_argument("root", nargs="?", default=".",
                    help="Root folder to scan (default: current directory)")
    ap.add_argument("-o", "--output", default="context.json",
                    help="Output JSON file (default: context.json)")
    ap.add_argument("--max-size", type=int, default=DEFAULT_MAX_SIZE,
                    help=f"Max bytes per file to include content "
                         f"(default {DEFAULT_MAX_SIZE})")
    args = ap.parse_args()

    root = Path(args.root).resolve()
    if not root.is_dir():
        sys.exit(f"Error: '{root}' is not a directory")

    print(f"Scanning: {root}")
    tree = scan(root, root, args.max_size, SKIP_DIRS)

    files, folders = count_nodes(tree)
    output = {
        "root": str(root),
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "summary": {"files": files, "folders": folders},
        "tree": tree,
    }

    out_path = Path(args.output)
    with out_path.open("w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"Scanned {files} files in {folders} folders")
    print(f"Wrote: {out_path.resolve()}")


if __name__ == "__main__":
    main()