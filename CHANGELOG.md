# Changelog

All notable changes to this project will be documented in this file.

## [2.0.8] - 2026-02-08
### Fixes
- **Critical Template Fixes**: Corrected `Dockerfile` and CI/CD workflows for `java-spring` (MVC, Clean, Hexagonal) and `python-fastapi` (MVC, Clean, Hexagonal) templates. They now correctly use Java/Maven and Python/Pip environments instead of incorrect Node.js configurations.
- **CI/CD Indentation**: Fixed indentation issues in all generated GitHub Actions workflows to ensure valid YAML syntax.

## [2.0.7] - 2026-02-06
### Fixes
- **Bundled Dependencies**: Enabled `bundledDependencies` to ship the exact validated dependency tree (including security overrides) to consumers. This eliminates install-time deprecation warnings by bypassing client-side resolution.

## [2.0.6] - 2026-02-06
### Fixes
- Added `npm-shrinkwrap.json` to enforce security overrides (`rimraf` -> `glob`) for consumers. This resolves deprecation warnings during installation.

## [2.0.5] - 2026-02-06
### Security
- Resolved `glob` security vulnerability warning by overriding transitive dependencies.
- Added `overrides` for `rimraf` to ensure use of secure `glob` versions.
### Changed
- Updated `@google/genai` to `^1.40.0`.
