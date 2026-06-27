# Artifacts CLI

Command-line tools for uploading, listing, and opening Artifacts.

## Requirements

The npm package ships a Bun-targeted executable script. Install Bun before using
the CLI:

```sh
curl -fsSL https://bun.sh/install | bash
```

## Installation

Install the CLI globally with npm:

```sh
npm i -g @akshatowo/artifacts
```

Then verify the command is available:

```sh
artifacts --help
```

## Authentication

Sign in with the device-code flow:

```sh
artifacts auth login
```

The CLI prints a verification URL and a one-time code. Open the URL, sign in,
enter the code, and wait for the CLI to finish.

Check the current signed-in user:

```sh
artifacts auth whoami
```

Sign out:

```sh
artifacts auth logout
```

Authentication is stored locally in:

- macOS/Linux: `~/.config/artifacts/auth.json`
- Windows: `%APPDATA%\artifacts\auth.json`

## Upload An Artifact

Upload an HTML artifact:

```sh
artifacts upload ./path/to/artifact.html
```

On success, the CLI prints the public artifact URL.

If you omit the path, the CLI prompts for a file:

```sh
artifacts upload
```

## List Artifacts

List artifacts owned by the signed-in user:

```sh
artifacts ls
```

The output includes the artifact ID, name, creation time, and update time.

## Get An Artifact URL

Print the URL for an artifact by ID:

```sh
artifacts get <artifact-id>
```

Example:

```sh
artifacts get 0192f2c2-8f0e-7000-9c41-68aaf2f4fd21
```

## Configuration

By default, production builds use:

```txt
https://artifacts.4kshat.dev
```

Override the API base URL with `BASE_URL`:

```sh
BASE_URL=http://localhost:3000 artifacts ls
```

The auth device client ID defaults to `artifacts-cli`. Override it with
`AUTH_CLIENT_ID`:

```sh
AUTH_CLIENT_ID=my-client artifacts auth login
```

## Development

Build the distributable CLI:

```sh
bun run build
```

Run type checking:

```sh
bun run check-types
```

Test the built binary locally:

```sh
./dist/index.js --help
```

Preview the npm package contents:

```sh
npm pack --dry-run
```

## Publishing

Before publishing, build and type-check:

```sh
bun run build
bun run check-types
```

Publish from this package directory:

```sh
npm publish
```
