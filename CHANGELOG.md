# Changelog

All notable changes to Perotron Web will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Migration
- Migrated the web framework used from TanStack Start to Astro

### Added
- Added perotron logo when generating QR codes as one of the default logo

### Fixes
- Improve posthog log collection
- Add improved testing for QR Generation Tools

## [1.0.1] - 2026-07-18

### Added
- E2E testing using Playwright ([#14](https://github.com/naveen521kk/perotron-web/pull/14))

## [1.0.0] - 2026-07-05

### Added
- PDF Merge — combine multiple PDF files into one, client-side.
- PDF Split — split a PDF by fixed page ranges, custom ranges, page selection spec, or file-size target; results bundled as a ZIP.
- QR Code Generator — customise colour, size, logo, and download as SVG or PNG.

[Unreleased]: https://github.com/naveen521kk/perotron-web/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/naveen521kk/perotron-web/releases/tag/v1.0.1
[1.0.0]: https://github.com/naveen521kk/perotron-web/releases/tag/v1.0.0
