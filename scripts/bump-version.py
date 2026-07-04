#!/usr/bin/env python3
"""
bump-version.py — Bump the Perotron Web version in all the right places.

Usage:
    python scripts/bump-version.py --minor    # 1.0.0 → 1.0.1
    python scripts/bump-version.py --major    # 1.0.0 → 1.1.0
    python scripts/bump-version.py --dry-run --minor   # preview without writing

The version is bumped in:
  - pyodide-tools/pyproject.toml  (Python package, canonical source)
  - package.json                  (JS/Vite build, shown in the UI)
  - CHANGELOG.md                  (a new [Unreleased] section is opened)
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import date
from pathlib import Path

# ── Paths (all relative to the repo root) ────────────────────────────────────

REPO_ROOT = Path(__file__).resolve().parent.parent
PYPROJECT = REPO_ROOT / "pyodide-tools" / "pyproject.toml"
PACKAGE_JSON = REPO_ROOT / "package.json"
CHANGELOG = REPO_ROOT / "CHANGELOG.md"

# ── Version helpers ───────────────────────────────────────────────────────────


def parse_version(v: str) -> tuple[int, int, int]:
    parts = v.strip().split(".")
    if len(parts) != 3:
        raise ValueError(f"Expected MAJOR.MINOR.PATCH, got: {v!r}")
    return int(parts[0]), int(parts[1]), int(parts[2])


def bump(version: str, *, minor: bool) -> str:
    major, minor_v, patch = parse_version(version)
    if minor:
        # --minor: patch increment  (1.0.0 → 1.0.1)
        return f"{major}.{minor_v}.{patch + 1}"
    else:
        # --major: minor increment  (1.0.0 → 1.1.0)
        return f"{major}.{minor_v + 1}.0"


# ── File updaters ─────────────────────────────────────────────────────────────


def update_pyproject(new_version: str, dry_run: bool) -> str:
    text = PYPROJECT.read_text(encoding="utf-8")
    old = re.search(r'^version\s*=\s*"([^"]+)"', text, re.MULTILINE)
    if not old:
        sys.exit(f"ERROR: Could not find version in {PYPROJECT}")
    old_version = old.group(1)
    updated = text.replace(f'version = "{old_version}"', f'version = "{new_version}"', 1)
    if not dry_run:
        PYPROJECT.write_text(updated, encoding="utf-8")
    return old_version


def update_package_json(old_version: str, new_version: str, dry_run: bool) -> None:
    data = json.loads(PACKAGE_JSON.read_text(encoding="utf-8"))
    current = data.get("version", "")
    if current != old_version:
        print(
            f"  WARNING: package.json version {current!r} differs from "
            f"pyproject.toml {old_version!r}. Updating anyway."
        )
    data["version"] = new_version
    if not dry_run:
        PACKAGE_JSON.write_text(
            json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
        )


def update_changelog(old_version: str, new_version: str, dry_run: bool) -> None:
    text = CHANGELOG.read_text(encoding="utf-8")
    today = date.today().isoformat()

    # Turn the existing [Unreleased] block into the new versioned release,
    # and insert a fresh empty [Unreleased] block above it.
    release_header = f"## [{new_version}] - {today}"
    unreleased_header = "## [Unreleased]"

    if unreleased_header not in text:
        print(
            "  WARNING: Could not find '## [Unreleased]' in CHANGELOG.md. "
            "Skipping changelog update."
        )
        return

    # Replace "## [Unreleased]" with the new release header and add a fresh unreleased block
    updated = text.replace(
        unreleased_header,
        f"{unreleased_header}\n\n{release_header}",
        1,
    )

    # Update the diff links at the bottom
    new_unreleased_link = (
        f"[Unreleased]: https://github.com/naveen521kk/perotron-web/compare/v{new_version}...HEAD"
    )
    old_unreleased_link = (
        f"[Unreleased]: https://github.com/naveen521kk/perotron-web/compare/v{old_version}...HEAD"
    )
    new_release_link = (
        f"[{new_version}]: https://github.com/naveen521kk/perotron-web/releases/tag/v{new_version}"
    )

    if old_unreleased_link in updated:
        updated = updated.replace(
            old_unreleased_link,
            f"{new_unreleased_link}\n{new_release_link}",
            1,
        )
    else:
        # Append the links if the pattern doesn't match exactly
        updated = updated.rstrip() + f"\n{new_unreleased_link}\n{new_release_link}\n"

    if not dry_run:
        CHANGELOG.write_text(updated, encoding="utf-8")


# ── Main ──────────────────────────────────────────────────────────────────────


def main() -> None:
    parser = argparse.ArgumentParser(description="Bump Perotron Web version.")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument(
        "--minor",
        action="store_true",
        help="Patch increment: 1.0.0 → 1.0.1",
    )
    group.add_argument(
        "--major",
        action="store_true",
        help="Minor increment: 1.0.0 → 1.1.0",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print what would change without writing any files.",
    )
    args = parser.parse_args()

    dry_run: bool = args.dry_run
    if dry_run:
        print("DRY RUN — no files will be written.\n")

    # 1. pyproject.toml (gives us old_version)
    old_version = update_pyproject.__wrapped__(args) if False else None  # forward ref trick
    # Determine old version first
    raw = PYPROJECT.read_text(encoding="utf-8")
    m = re.search(r'^version\s*=\s*"([^"]+)"', raw, re.MULTILINE)
    if not m:
        sys.exit(f"ERROR: Could not find version in {PYPROJECT}")
    old_version = m.group(1)
    new_version = bump(old_version, minor=args.minor)

    print(f"Bumping  {old_version}  →  {new_version}\n")

    # 2. Update files
    print(f"  Updating {PYPROJECT.relative_to(REPO_ROOT)}")
    text = PYPROJECT.read_text(encoding="utf-8")
    updated = text.replace(f'version = "{old_version}"', f'version = "{new_version}"', 1)
    if not dry_run:
        PYPROJECT.write_text(updated, encoding="utf-8")

    print(f"  Updating {PACKAGE_JSON.relative_to(REPO_ROOT)}")
    update_package_json(old_version, new_version, dry_run)

    print(f"  Updating {CHANGELOG.relative_to(REPO_ROOT)}")
    update_changelog(old_version, new_version, dry_run)

    print()
    if dry_run:
        print("Dry run complete. No files were modified.")
    else:
        print(
            f"Done! Version bumped to {new_version}.\n"
            f"\nNext steps:\n"
            f"  1. Fill in the new [{new_version}] section in CHANGELOG.md\n"
            f"  2. Commit: git commit -am 'chore: bump version to {new_version}'\n"
            f"  3. Tag:    git tag v{new_version} && git push origin v{new_version}\n"
        )


if __name__ == "__main__":
    main()
