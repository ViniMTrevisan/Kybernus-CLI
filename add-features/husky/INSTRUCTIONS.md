# Husky + Commitlint

## Files generated

- `.husky/pre-commit` — runs `lint-staged` before each commit
- `.husky/commit-msg` — validates commit message format
- `commitlint.config.js` — enforces [Conventional Commits](https://www.conventionalcommits.org/)

## Install dependencies

```bash
npm install -D husky lint-staged @commitlint/cli @commitlint/config-conventional
```

## Setup

```bash
npx husky init
```

Then copy the generated hook files to `.husky/`:
```bash
cp .husky/pre-commit .husky/commit-msg ./
```

Or, Kybernus already set this up — just run the init command above.

---

## Add lint-staged config to `package.json`

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml}": ["prettier --write"]
  }
}
```

---

## Commit message format

```
feat: add new endpoint
fix: correct validation error
chore: update dependencies
docs: update README
```

Valid types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `test`, `perf`, `ci`, `build`, `revert`
