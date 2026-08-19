<p align="center">
  <img src="apps/web/public/favicon.svg" alt="Artifacts logo" width="72" height="72" />
</p>

# Artifacts

Upload, preview, and share self-contained HTML artifacts.

## Repository

- `apps/web` — TanStack Start application and API deployed to Cloudflare Workers
- `packages/cli` — command-line tools for uploading and sharing artifacts

The project is a Bun workspace managed with Turborepo. It uses TypeScript,
React 19, Effect, Cloudflare D1, and Cloudflare R2. Artifact previews use a
shipped fallback image; the former Scout browser-rendering service has been
removed.

## Development

Install dependencies and start the development servers:

```sh
bun install
bun run dev
```

The web application runs at [http://localhost:3000](http://localhost:3000).

Apply local D1 migrations when the schema changes:

```sh
bun run --cwd apps/web db:migrate:local
```

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

## Deploy

The web workspace builds the Worker, applies remote D1 migrations, and deploys
with Wrangler:

```sh
bun run --cwd apps/web deploy
```
