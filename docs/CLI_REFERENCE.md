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
*   `--license <key>`: Pass a license key manually (CI/CD usage).
*   `--yes` / `-y`: Run in non-interactive mode using defaults.

**Example:**
```bash
kybernus init --name my-api --stack nodejs-express
```

## `register`

Create a new Kybernus account to access Pro features (via trial) or manage your subscription.

```bash
kybernus register
```

*   Input: Email, Password.
*   Output: Creates a session and stores credentials locally.

## `login` / `logout`

Manage your local session.

```bash
kybernus login
```
Prompts for email/password. Necessary if you switch machines or your session expires.

```bash
kybernus logout
```
Clears local credentials.

## `status`

Check your current license tier and project usage.

```bash
kybernus status
```

**Output Example:**
```text
Kybernus CLI v1.0.0
User: user@example.com
Tier: PRO (Trial)
Usage: 1/3 projects created
Status: Active ✅
```

## `upgrade`

Upgrade your account to a Pro Lifetime license.

```bash
kybernus upgrade
```
Generates a unique Stripe Checkout link. Once paid, run `kybernus status` to refresh your license to "Lifetime".
