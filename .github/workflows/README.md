# GitHub Actions Workflows

This directory contains automated CI/CD workflows for the Kybernus platform.

## 📁 Workflows

### `ci.yml` - Continuous Integration
**Trigger**: Every push and pull request
- Runs tests for CLI
- Runs tests for Web App
- Runs linters
- Verifies builds

### `publish-npm.yml` - NPM Publishing
**Trigger**: Version tags (v*.*.*)
- Builds and tests CLI
- Publishes to NPM registry
- Creates GitHub Release

## 🔐 Required Secrets

Configure in **GitHub Repository → Settings → Secrets and variables → Actions**:

| Secret | Description | How to get |
|--------|-------------|------------|
| `NPM_TOKEN` | NPM publish token | npmjs.com → Access Tokens → Generate (Automation) |
| `GITHUB_TOKEN` | GitHub API access | Auto-provided by GitHub Actions |

## 🚀 Usage

### Run Tests (CI)
```bash
git push origin your-branch
# CI runs automatically
```

### Publish to NPM
```bash
# 1. Update version in package.json
npm version patch  # or minor, or major

# 2. Commit
git add package.json
git commit -m "chore: bump version to X.X.X"

# 3. Create and push tag
git tag vX.X.X
git push origin main --tags

# 4. GitHub Action runs automatically
```

## ✅ Status Badges

Add to README.md:
```markdown
![CI](https://github.com/ViniMTrevisan/Kybernus-CLI/workflows/CI%20-%20Tests/badge.svg)
![NPM Version](https://img.shields.io/npm/v/kybernus)
```
