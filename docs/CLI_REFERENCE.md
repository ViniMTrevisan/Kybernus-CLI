# CLI Command Reference

Full documentation for the `kybernus` command-line interface.

## `init`

Initialize a new project wizard in the current directory.

```bash
kybernus init [options]
```

**Options:**
*   `--name <string>`: Bypass the name prompt.
*   `--stack <string>`: Pre-select stack (e.g., `nestjs`, `java-spring`).
*   `--yes` / `-y`: Run in non-interactive mode using defaults.

**Example:**
```bash
kybernus init --name my-api --stack nodejs-express
```

## Legacy Commands (Removed)

The following commands have been removed as Kybernus is now 100% Open Source:
*   `register`
*   `login`
*   `logout`
*   `status`
*   `upgrade`

No account is needed to use any feature of Kybernus.
