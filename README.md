# Hiro's personal site

SvelteKit personal site, managed with pnpm.

## Development

1. Install dependencies with `pnpm install --frozen-lockfile`.
2. Start the site with `pnpm dev`.

## Validation

- `pnpm test` is the routine, memory-bounded validation command. It runs type checking and cached source linting sequentially.
- `pnpm test:release` adds the production Vercel build. Use it before publishing, not after every edit.
- `pnpm check:watch` keeps type checking open while editing.
- `pnpm format:check` checks formatting separately; it is not part of the fast test gate while existing content is brought onto one formatting baseline.

The project intentionally uses one package manager (`pnpm`) and one lockfile (`pnpm-lock.yaml`).

You can preview the production build with `pnpm preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
