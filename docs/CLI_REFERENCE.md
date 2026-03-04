# CLI Command Reference

Full documentation for the `kybernus` command-line interface.

## `init`

If you don't want to install the packages

```bash
npx kybernus@latest init [options]
```

Initialize a new project wizard in the current directory.

```bash
kybernus init [options]
```

**Options:**
*   `--name <string>`: Bypass the name prompt.
*   `--stack <string>`: Pre-select stack (e.g., `nestjs`, `java-spring`).
*   `--template <string>`: Use a custom GitHub template (e.g., `user/repo`).
*   `--yes` / `-y`: Run in non-interactive mode using defaults.

---

## `add`

Add infrastructure features to your project. Supports both Kybernus and standalone projects.

```bash
kybernus add [feature]
```

**Features:**
*   `swagger`: OpenAPI documentation.
*   `redis`: Caching layer with Docker service.
*   `websocket`: Real-time communication setup.
*   `husky`: Git hooks and commit linting.
*   `auth`: Complete JWT authentication logic.

**Note:** If run in a non-Kybernus project, it will prompt for your project's stack and architecture.

---

## `auth`

Shortcut to add complete JWT authentication boilerplate (controllers, services, and middlewares).

```bash
kybernus auth
```

Supports MVC, Clean, and Hexagonal architectures across all major stacks.

---

## `deploy`

Generate production-ready deployment configuration files.

```bash
kybernus deploy
```

**Providers:**
*   **Vercel**: `vercel.json` (Next.js, Node, Python).
*   **Railway**: `railway.toml`.
*   **Fly.io**: `fly.toml` + `Dockerfile`.
*   **Render**: `render.yaml`.

---

## `doctor`

Check your local environment for required tools and common configuration issues.

```bash
kybernus doctor
```

Checks for Node.js, Python, Java, Docker, and environment variables.

---

## Legacy Commands (Removed)

The following commands have been removed as Kybernus is now 100% Open Source:
*   `register`
*   `login`
*   `logout`
*   `status`
*   `upgrade`

No account is needed to use Kybernus.
