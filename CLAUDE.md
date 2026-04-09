# CLAUDE.md

## Project Overview

Personal site for Hiro Kuwana — built with SvelteKit, Tailwind CSS v4, and DaisyUI v5. Deployed on Vercel.

## Development Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build (what Vercel runs)
- `npm run check` — Run svelte-check for type errors
- `npm run lint` — Prettier + ESLint

## Pre-Publish Checklist

- **Always check the Vercel build before publishing/merging.** Vercel deployments can fail for reasons not caught by local builds (node version differences, environment variables, edge function limits, etc.). Verify the preview deployment succeeds before merging a PR.
- Run `npm run build` locally to catch build errors early.
- Run `npm run check` to catch type errors (note: some pre-existing type errors exist on master).

## Architecture Notes

- **Routing**: File-based routing in `src/routes/`. Each page is a `+page.svelte` file.
- **Data**: Shared constants (projects, tools, contact info) live in `src/data/constants.ts`.
- **i18n**: Uses Paraglide (`$lib/paraglide/messages`) for translations.
- **Tools pages**: Utility tools (ICS Validator, VCF Splitter) are standalone single-file pages under `src/routes/`. Follow the ICS Validator pattern for new tools.
- **Styling**: Tailwind utility classes + DaisyUI components + scoped `<style>` blocks using `oklch()` color functions.
