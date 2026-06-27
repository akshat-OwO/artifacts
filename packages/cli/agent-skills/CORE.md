# Artifacts CLI Core Skill

Use the Artifacts CLI to upload local HTML files and manage the public artifact
URLs returned by the Artifacts service.

## Requirements

- The CLI runs on Bun. Check Bun with `bun --version`.
- Install Bun from https://bun.sh when it is missing.
- Install the CLI globally with `npm i -g @akshatowo/artifacts`.
- Authenticate before using commands that call the Artifacts API:
  `artifacts auth login`.

## Commands

### `artifacts upload <path> [--name <name>]`

Uploads an HTML file and prints the public artifact URL.

Example:

`artifacts upload ./report.html --name report`

Expected output:

- `Success Artifact uploaded.`
- A public artifact URL.

Notes:

- Only HTML files are accepted.
- If `<path>` is omitted, the CLI prompts for a file path.
- Use this when an agent creates a report, explanation, exploration document, or
  other local `.html` file that should be shared as a URL.

### `artifacts ls`

Lists artifacts owned by the signed-in user.

Example:

`artifacts ls`

Expected output:

- A table with `id`, `name`, `created`, and `updated` columns.
- `Info No artifacts found.` when the account has no artifacts.

### `artifacts get <artifact-id>`

Prints the public URL for an existing artifact.

Example:

`artifacts get 0192f2c2-8f0e-7000-9c41-68aaf2f4fd21`

Expected output:

- The public artifact URL.

### `artifacts update <artifact-id> [--path <file>] [--name <name>]`

Updates an artifact's HTML file, name, or both.

Example:

`artifacts update 0192f2c2-8f0e-7000-9c41-68aaf2f4fd21 --path ./report.html --name report-v2`

Expected output:

- `Success Artifact updated.`
- The public artifact URL.

Notes:

- At least one of `--path` or `--name` is required.
- `--path` must point to an existing HTML file.

### `artifacts delete <artifact-id> [--yes | --no]`

Deletes an artifact after confirmation.

Example:

`artifacts delete 0192f2c2-8f0e-7000-9c41-68aaf2f4fd21 --yes`

Expected output:

- `Success Artifact deleted.` when deleted.
- `Info Delete cancelled.` when cancelled.

### `artifacts auth login`

Starts the browser device-code login flow.

Example:

`artifacts auth login`

Expected output:

- A verification URL.
- A one-time code.
- `Success Authorization successful.` after the browser flow completes.

### `artifacts auth whoami`

Prints the current authentication state.

Example:

`artifacts auth whoami`

Expected output:

- `Logged in as <name> <email>` when authenticated.
- `Info You are not logged in.` when unauthenticated.

### `artifacts auth logout`

Signs out and clears the local auth token.

Example:

`artifacts auth logout`

Expected output:

- `Success You have been logged out.`

### `artifacts agent get core`

Prints this core skill from the installed CLI package.

Example:

`artifacts agent get core`

Expected output:

- The current `Artifacts CLI Core Skill` markdown.

Use this command from stub skills so agents always learn the capabilities shipped
with the installed CLI version.
