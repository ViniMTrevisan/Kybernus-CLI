# GitHub Actions Workflows

This directory contains automated CI/CD workflows for the Kybernus platform.

## 📁 Workflows

### `ci.yml` - Continuous Integration
**Trigger**: Every push and pull request
- Runs tests for CLI (unit tests only)
- Runs tests for Web App (build, lint, and tests)
- Verifies builds

### `publish-npm.yml` - Run Tests (Build Verification)
**Trigger**: Version tags (v*.*.*)
- This workflow **does not publish to NPM**.
- It ensures that tagged versions pass all tests and build steps before any manual release process.
- Runs `npm ci`, `npm test`, and `npm run build`.


## 🚀 Usage

### Run Tests (CI)
```bash
git push origin your-branch
# CI runs automatically
```

### Trigger Build Verification
```bash
# 1. Update version in package.json
npm version patch  # or minor, or major

# 2. Commit
git add package.json
git commit -m "chore: bump version to X.X.X"

# 3. Create and push tag
git tag vX.X.X
git push origin main --tags

# 4. GitHub Action runs automatically to verify the build
```

## ✅ Status Badges

Add to README.md:
```markdown
![CI](https://github.com/ViniMTrevisan/Kybernus-CLI/workflows/CI%20-%20Tests/badge.svg)
```
