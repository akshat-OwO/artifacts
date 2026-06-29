---
name: artifacts-core
description: Upload, list, inspect, update, and delete Artifacts HTML URLs with the Artifacts CLI. Use when a task needs a shareable URL for a local .html file or needs to manage existing Artifacts.
compatibility: Requires Bun and the @akshatowo/artifacts CLI.
metadata:
  version: "1.0.0"
---

# Artifacts CLI Core Skill

Use the Artifacts CLI to publish local HTML files as shareable Artifact URLs and
manage existing Artifacts.

## When to use this skill

- Use when the user has a local `.html` file that should be shared as a URL.
- Use when creating a report, explanation, exploration document, or other HTML
  document that should be uploaded.
- Use when the user asks to list, inspect, update, rename, or delete Artifacts.

## Setup

1. Check Bun with `bun --version`.
2. If Bun is missing, install Bun from https://bun.sh only after user approval.
3. Check the CLI with `artifacts --help`.
4. If the CLI is missing, install it globally with
   `npm i -g @akshatowo/artifacts` only after user approval.
5. Authenticate before API commands with `artifacts auth login`.

## Commands

### Upload an HTML file

Run `artifacts upload <path> [--name <name>]` to upload an HTML file and print
its public URL.

Example: `artifacts upload ./report.html --name report`

Expected output:

- `Success Artifact uploaded.`
- A public artifact URL.

Notes:

- Only HTML files are accepted.
- If `<path>` is omitted, the CLI prompts for a file path.

### List artifacts

Run `artifacts ls` to list artifacts owned by the signed-in user.

Expected output:

- A table with `id`, `name`, `created`, and `updated` columns.
- `Info No artifacts found.` when the account has no artifacts.

### Get an artifact URL

Run `artifacts get <artifact-id>` to print the public URL for an existing
artifact.

Example: `artifacts get 0192f2c2-8f0e-7000-9c41-68aaf2f4fd21`

Expected output:

- The public artifact URL.

### Update an artifact

Run `artifacts update <artifact-id> [--path <file>] [--name <name>]` to update
an artifact's HTML file, name, or both.

Example:
`artifacts update 0192f2c2-8f0e-7000-9c41-68aaf2f4fd21 --path ./report.html --name report-v2`

Expected output:

- `Success Artifact updated.`
- The public artifact URL.

Notes:

- At least one of `--path` or `--name` is required.
- `--path` must point to an existing HTML file.

### Delete an artifact

Run `artifacts delete <artifact-id> [--yes | --no]` to delete an artifact after
confirmation.

Example: `artifacts delete 0192f2c2-8f0e-7000-9c41-68aaf2f4fd21 --yes`

Expected output:

- `Success Artifact deleted.` when deleted.
- `Info Delete cancelled.` when cancelled.

### Authenticate

Run `artifacts auth login` to start the browser device-code login flow.

Expected output:

- A verification URL.
- A one-time code.
- `Success Authorization successful.` after the browser flow completes.

Run `artifacts auth whoami` to print the current authentication state.

Expected output:

- `Logged in as <name> <email>` when authenticated.
- `Info You are not logged in.` when unauthenticated.

Run `artifacts auth logout` to sign out and clear the local auth token.

Expected output:

- `Success You have been logged out.`

### Refresh this skill

Run `artifacts agent get core` to print this core skill from the installed CLI
package.

Expected output:

- The current `Artifacts CLI Core Skill` markdown.

Use this command from stub skills so agents always learn the capabilities shipped
with the installed CLI version.
