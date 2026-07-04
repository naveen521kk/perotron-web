# Release Procedure

This document describes how to cut a new release of Perotron Web.

## Prerequisites

- You are on the `main` branch and it is up to date with `origin/main`.
- Python 3.13+ is available in your environment (used by the bump script).
- All changes intended for the release have been merged to `main`.

---

## Steps

### 1. Bump the version

Run the bump script from the repo root. Choose the increment type:

| Command | When to use | Example |
|---|---|---|
| `python scripts/bump-version.py --minor` | Bug fixes, small improvements | `1.0.0 → 1.0.1` |
| `python scripts/bump-version.py --major` | New features, larger changes | `1.0.0 → 1.1.0` |

The script will update:
- `pyodide-tools/pyproject.toml` — Python package version
- `package.json` — JS/Vite version (shown in the app footer)
- `CHANGELOG.md` — promotes `[Unreleased]` to the new dated release section

Preview what it will do without writing any files:
```sh
python scripts/bump-version.py --minor --dry-run
```

### 2. Update the changelog

Open `CHANGELOG.md`. The script will have created a new dated section like:

```markdown
## [Unreleased]

## [1.0.1] - 2026-07-10
```

Fill in the `[1.0.1]` section with the changes for this release under the appropriate sub-headings:

```markdown
### Added
- ...

### Changed
- ...

### Fixed
- ...

### Removed
- ...
```

Leave `## [Unreleased]` empty — it's a placeholder for the next release.

### 3. Commit the version bump

```sh
git add pyodide-tools/pyproject.toml package.json CHANGELOG.md
git commit -m "chore: release v1.0.1"
```

### 4. Push to main

```sh
git push
```

This triggers the **CI** workflow which builds and deploys to the Cloudflare Pages **preview** environment. Use this to do a final sanity check on the build if needed.

### 5. Tag the release

```sh
git tag v1.0.1
git push origin v1.0.1
```

Pushing the tag triggers the **Release** workflow which:
1. Builds the project (pyodide + vite).
2. Deploys to Cloudflare Pages **production**.
3. Extracts the `[1.0.1]` section from `CHANGELOG.md` and creates a **GitHub Release** with those notes.

### 6. Verify

- Check the [GitHub Actions](https://github.com/naveen521kk/perotron-web/actions) tab — the `Release` workflow should complete successfully.
- Visit [tools.naveenmk.me](https://tools.naveenmk.me) and confirm the new version appears in the footer.
- Check [GitHub Releases](https://github.com/naveen521kk/perotron-web/releases) for the newly published release.

---

## Versioning Scheme

This project uses a simplified [Semantic Versioning](https://semver.org/) scheme:

| Segment | Meaning |
|---|---|
| **MAJOR** (`x`) | Significant platform rewrites or breaking changes. Bumped manually. |
| **MINOR** (`y`) | New tools or features added. Use `--major` flag. |
| **PATCH** (`z`) | Bug fixes, dependency updates, copy changes. Use `--minor` flag. |

> [!NOTE]
> The `--major` flag in `bump-version.py` increments the **MINOR** segment (`1.0.0 → 1.1.0`).
> Bumping the true MAJOR segment (`1.x.x → 2.0.0`) should be done manually when warranted.

---

## Where the version lives

| File | How it's used |
|---|---|
| `pyodide-tools/pyproject.toml` | Canonical version; Python package metadata |
| `package.json` | Mirrors the version; read by Vite at build time |
| `pyodide-tools/src/pyodide_tools/pdf.py` | Reads from package metadata via `importlib.metadata` — no manual edit needed |
| App footer | Injected at build time as `__APP_VERSION__`; links to GitHub Releases |
| `CHANGELOG.md` | Human-readable history of every release |
