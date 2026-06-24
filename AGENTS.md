# Project Code Standards

## Quick Reference

- **Format code**: `bun x ultracite fix`
- **Check for issues**: `bun x ultracite check`
- **Check TypeScript**: `bun run check-types`
- **Diagnose setup**: `bun x ultracite doctor`

This project uses Ultracite with Oxlint and Oxfmt. Run `bun x ultracite fix` before committing.

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Effect

- This project uses **Effect v4**. Prefer Effect for effectful application code, including errors, resource management, concurrency, retries, configuration, and dependency injection.
- Before implementing or changing Effect code, inspect the installed `effect` and `@effect/*` packages in `node_modules`. Use their source, type declarations, tests, and package documentation as the source of truth because v4 APIs may differ from earlier Effect versions.
- Prefer typed error channels and explicit requirements over thrown exceptions and hidden dependencies.
- Keep Promise-based and throwing APIs at system boundaries; wrap them with the appropriate Effect constructors and preserve meaningful error information.
- Compose Effects declaratively and run them only at application boundaries.
- Reuse established Effect patterns already present in the repository when they fit.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity.
- Prefer `unknown` over `any` when the type is genuinely unknown.
- Use const assertions (`as const`) for immutable values and literal types.
- Leverage TypeScript's type narrowing instead of type assertions.
- Use meaningful variable names instead of magic numbers; extract constants with descriptive names.

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions.
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops.
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access.
- Prefer template literals over string concatenation.
- Use destructuring for object and array assignments.
- Use `const` by default, `let` only when reassignment is needed, and never `var`.

### Async & Promises

- In code that does not use Effect, always await promises in async functions and use their results.
- Use `async`/`await` instead of promise chains when it improves readability.
- Handle errors appropriately; do not catch errors only to rethrow them.
- Do not use async functions as Promise executors.

### React & JSX

- Use function components over class components.
- Call hooks only at the top level and specify hook dependencies correctly.
- Use stable, unique keys for iterable elements rather than array indices.
- Nest children between opening and closing tags instead of passing them as props.
- Do not define components inside other components.
- Use React 19's ref prop rather than `React.forwardRef`.
- Use semantic HTML and accessible interactions:
  - Provide meaningful alt text for images.
  - Use a proper heading hierarchy.
  - Add labels for form inputs.
  - Support keyboard interaction alongside pointer interaction.
  - Prefer semantic elements such as `<button>` and `<nav>` over generic elements with roles.

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code.
- Outside Effect error channels, throw descriptive `Error` objects rather than strings or other values.
- Use try-catch blocks meaningfully; do not catch errors only to rethrow them.
- Prefer early returns over nested conditionals for error cases.

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits.
- Extract complex conditions into well-named boolean variables.
- Use early returns to reduce nesting.
- Prefer simple conditionals over nested ternary expressions.
- Group related code together and separate concerns.

### Security

- Add `rel="noopener"` when using `target="_blank"` on links.
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary.
- Do not use `eval()` or assign directly to `document.cookie`.
- Validate and sanitize user input.

### Performance

- Avoid spread syntax in accumulators within loops.
- Use top-level regex literals instead of creating them in loops.
- Prefer specific imports over namespace imports.
- Avoid barrel files that re-export everything.

## Testing

- Write assertions inside `it()` or `test()` blocks.
- Avoid done callbacks in async tests; use async/await instead.
- Do not commit `.only` or `.skip`.
- Keep test suites reasonably flat and avoid excessive `describe` nesting.

## Beyond Automated Checks

Ultracite catches formatting and common static-analysis issues. Pay particular attention to:

1. Business logic correctness
2. Meaningful naming
3. Architecture and data flow
4. Edge cases and failure modes
5. Accessibility, performance, and usability
6. Documentation for complex behavior that cannot be made self-explanatory

## Cursor Cloud specific instructions

Environment is provisioned via the startup update script (`bun install`) plus a VM snapshot that already contains: Bun `1.3.14`, Node 24 (nvm default), a local PostgreSQL 16 server, Playwright Chromium, and the gitignored `.env` files for both apps. The notes below are durable, non-obvious caveats; standard commands live in `README.md`, root `package.json` scripts, and each app's `package.json`.

### Services
- **`apps/web`** (TanStack Start, port 3000) and **`packages/scout`** (Playwright preview service, port 8787). `bun run dev` at the root starts both via Turbo, but Turbo's TUI is awkward to read non-interactively — prefer running each service in its own shell/tmux session with `bun run dev` from its package dir when you need clean logs.

### Database
- PostgreSQL is NOT auto-started on boot. Start it each session with `sudo pg_ctlcluster 16 main start`.
- Local DB/role: database `artifacts`, user `artifacts`, password `artifacts`. `DATABASE_URL` is already set in `apps/web/.env`. Apply schema with `bun run db:migrate` from `apps/web` (idempotent).

### Required env gotchas (already handled in `apps/web/.env`)
- The R2 storage adapter (`files-sdk`) throws if any `CF_*` var is empty, which makes EVERY web page return HTTP 500. `apps/web/.env` uses non-empty placeholder `CF_*` values so the app boots; actual uploads still need real Cloudflare R2 credentials.
- Google OAuth is not configured. The navbar "Login" button calls `signInWithGoogle` directly (redirects to Google) and fails without `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`. The in-app "Sign in to continue" dialog only appears via the uploader drop flow (drag/select an HTML file while logged out).
- Scout auth: requests need header `X-API-KEY` matching `API_KEY` in `packages/scout/.env`, which equals `SCOUT_API_KEY` in `apps/web/.env`. Core endpoint: `GET /preview?url=<url>` returns a WebP screenshot.

### Tests & lint (current repo state)
- `apps/web` has a `test` script (vitest) but there are no test files yet, so `bun run test` exits 1 with "No test files found" — this is expected, not a setup failure.
- `bun x ultracite check` currently reports pre-existing format/lint issues on `main` (e.g. `apps/web/src/lib/seo.ts`, `apps/web/src/components/navbar.tsx`) and exits 1.

### Node version note
- `node` may resolve to a v22 binary earlier on `PATH`. For commands that need Node 24 (engine requires `>=24`), prepend nvm's bin (`export PATH="$HOME/.nvm/versions/node/v24.18.0/bin:$PATH"`). Most scripts run under Bun (`bun --bun ...`) and are unaffected.
