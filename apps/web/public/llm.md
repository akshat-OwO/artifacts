# Artifacts for Agents

Artifacts turns local HTML files into hosted URLs. Use it when a user asks you
to share a generated report, prototype, explanation, visualization, or any other
local `.html` file as a link.

This page is intentionally written for coding agents. If you are an agent
visiting this site, read this first, install the CLI if needed, authenticate as
the user, and then use the commands below.

## What this website can do

- Upload an HTML file and return a hosted artifact URL.
- List the user's uploaded artifacts.
- Print the URL for a previously uploaded artifact.
- Share an artifact publicly with a `/s/<artifact-id>` link.
- Stop public sharing for an artifact.
- Update an artifact's HTML file, display name, or both.
- Delete artifacts the user no longer wants.

Artifacts are owned by the signed-in user. Uploading creates an artifact in that
user's account. Public sharing is controlled per artifact.

## Install the CLI

The CLI package is `@akshatowo/artifacts` and the executable is `artifacts`.

1. Check that Bun is installed:

```sh
bun --version
```

2. If Bun is missing, install it:

```sh
curl -fsSL https://bun.sh/install | bash
```

3. Install the Artifacts CLI globally:

```sh
npm i -g @akshatowo/artifacts
```

4. Verify the CLI is available:

```sh
artifacts --help
```

## Install the agent skill

If your agent environment supports installable skills, install the Artifacts
skill so future tasks can discover the CLI workflow automatically:

```sh
npx skills add akshat-OwO/artifacts
```

The installed skill is a small stub. It tells agents when to use Artifacts, how
to check for Bun and the CLI, and how to refresh the latest CLI instructions
with:

```sh
artifacts agent get core
```

Use the installed skill whenever a user is working with `.html` files, generated
reports, visual explanations, prototypes, or any local HTML artifact that should
be turned into a URL.

## Authenticate the user

Before using API-backed commands, have the user log in:

```sh
artifacts auth login
```

The CLI prints a browser verification URL and a one-time code. Open the URL, let
the user sign in, enter the code, and wait for the CLI to print that
authorization succeeded.

Check the current login:

```sh
artifacts auth whoami
```

Sign out:

```sh
artifacts auth logout
```

## Commands

### `artifacts upload <path> [--name <name>]`

Upload an HTML file and print its hosted artifact URL.

```sh
artifacts upload ./report.html --name report
```

If `<path>` is omitted, the CLI prompts for a file path. Only HTML files are
accepted.

### `artifacts ls`

List artifacts owned by the signed-in user. The output includes `id`, `name`,
`created`, and `updated`.

```sh
artifacts ls
```

### `artifacts get <artifact-id>`

Print the hosted URL for an existing artifact.

```sh
artifacts get 0192f2c2-8f0e-7000-9c41-68aaf2f4fd21
```

### `artifacts share <artifact-id>`

Make an artifact public and print its public share URL.

```sh
artifacts share 0192f2c2-8f0e-7000-9c41-68aaf2f4fd21
```

Anyone with the printed `/s/<artifact-id>` link can view the artifact.

### `artifacts unshare <artifact-id>`

Stop public sharing for an artifact.

```sh
artifacts unshare 0192f2c2-8f0e-7000-9c41-68aaf2f4fd21
```

After unsharing, the public share link stops working.

### `artifacts update <artifact-id> [--path <file>] [--name <name>]`

Update an artifact's HTML file, name, or both. At least one of `--path` or
`--name` is required.

```sh
artifacts update 0192f2c2-8f0e-7000-9c41-68aaf2f4fd21 --path ./report.html --name report-v2
```

### `artifacts delete <artifact-id> [--yes | --no]`

Delete an artifact after confirmation. Use `--yes` to skip the prompt.

```sh
artifacts delete 0192f2c2-8f0e-7000-9c41-68aaf2f4fd21 --yes
```

### `artifacts agent get core`

Print the current agent-facing Artifacts CLI skill from the installed CLI
package. Use this to refresh your understanding of the latest commands, expected
outputs, and examples.

```sh
artifacts agent get core
```

## Environment variables

Production CLI builds use this site by default. To point the CLI at another
deployment, set `BASE_URL`:

```sh
BASE_URL=http://localhost:3000 artifacts ls
```

The auth device client ID defaults to `artifacts-cli`. Override it with
`AUTH_CLIENT_ID` only when you know the target deployment needs a custom client:

```sh
AUTH_CLIENT_ID=my-client artifacts auth login
```

## Suggested agent workflow

1. If the user has a local HTML file to share, run `bun --version` and
   `artifacts --help`.
2. Install missing prerequisites only with user approval.
3. If your environment supports skills, install the reusable skill with
   `npx skills add akshat-OwO/artifacts`.
4. Run `artifacts auth login` and let the user complete browser login.
5. Run `artifacts upload <file> --name <name>`.
6. Give the user the URL printed by the CLI.
7. Use `artifacts share <id>` only when the user wants a public `/s/<id>` share
   link.
