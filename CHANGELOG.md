# Changelog

All notable changes to this project will be documented in this file.

## [2.0.6] - 2024-02-06
### Fixes
- Added `npm-shrinkwrap.json` to enforce security overrides (`rimraf` -> `glob`) for consumers. This resolves deprecation warnings during installation.

## [2.0.5] - 2024-02-06
### Security
- Resolved `glob` security vulnerability warning by overriding transitive dependencies.
- Added `overrides` for `rimraf` to ensure use of secure `glob` versions.
### Changed
- Updated `@google/genai` to `^1.40.0`.
