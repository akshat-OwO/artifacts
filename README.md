<p align="center">
  <img src="apps/web/public/favicon.svg" alt="Artifacts logo" width="72" height="72" />
</p>

# Artifacts

Upload, preview, and share self-contained HTML artifacts.

## Repository

- `apps/web` — TanStack Start web application and API
- `packages/cli` — command-line tools for uploading and sharing artifacts
- `packages/scout` — isolated browser service used to render artifact previews

The project is a Bun workspace managed with Turborepo. It uses TypeScript,
React 19, Effect, PostgreSQL, and Cloudflare R2-compatible object storage.

## Development

Install dependencies and start the development servers:

```sh
bun install
bun run dev
```

The web application runs at [http://localhost:3000](http://localhost:3000).

## Checks

```sh
bun run check-types
bun x ultracite check
```

To format and apply safe lint fixes:

```sh
bun x ultracite fix
```

## Build

Build every workspace package with:

```sh
bun run build
```
