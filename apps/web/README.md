# Artifacts Web

The TanStack Start application for Artifacts. It handles authentication, HTML
uploads, artifact browsing, and preview delivery.

## Development

From the repository root:

```sh
bun install
bun run dev
```

To run only this workspace:

```sh
bun run --cwd apps/web dev
```

## Commands

```sh
bun run --cwd apps/web check-types
bun run --cwd apps/web test
bun run --cwd apps/web build
```

Routes live in `src/routes`, reusable UI in `src/components`, and public assets
in `public`.
