# AGENTS.md

Notes for coding agents and LLMs reading this repository. Working rules for
agents editing the repo live in [`CLAUDE.md`](CLAUDE.md); design tokens in
[`DESIGN.md`](DESIGN.md); product intent in [`PRODUCT.md`](PRODUCT.md).

## What this is

The source of [hirokuwana.com](https://hirokuwana.com), the personal site of Hiro
Kuwana (founder of Kaiwa, co-founder of Otterd). It holds essays, AI guides, a
project record, small browser tools with a public JSON API, and an interactive
ink-wash village on the home page. Bilingual: English and Japanese.

## Stack (versions from `package.json` and the lockfile)

- SvelteKit 2.50 with Svelte 5.49 (runes), TypeScript 5.9
- Vite 6.4; Tailwind CSS 4.1 (`@tailwindcss/vite`)
- mdsvex 0.12 for `.md` / `.svx` pages (`svelte.config.js`)
- Paraglide JS 2.9 for i18n (`project.inlang/`, `messages/en.json`, `messages/ja.json`;
  generated into `src/lib/paraglide/`)
- three.js 0.169 (3D village), matter-js 0.20 (2D physics), GSAP 3.15 (tweens)
- Vitest 4.1 (unit tests: `src/**/*.test.ts`)
- `@sveltejs/adapter-vercel` 5.10, runtime `nodejs22.x`; deployed on Vercel
- pnpm 10.33 (`packageManager`), one lockfile: `pnpm-lock.yaml`

## Where things live

| Path | What |
| --- | --- |
| `src/routes/` | Pages: home, `about`, `essays`, `ai-guides`, `case-study`, `corporate`, `tools`, `lab/ink`; `api/` (contact, subscribe, ics, vcf, text, `openapi.json`) |
| `src/content/essays/`, `src/content/ai-guides/` | Markdown essays and guides |
| `src/data/constants.ts` | Project records, contact details, Kaiwa metrics snapshot |
| `src/lib/ink/` | The three.js ink village, its rooms, and their pure-logic modules |
| `src/lib/home/` | Lo-fi 2D windmill, craft desk, shared palette and copy |
| `src/lib/components/` | Header, theme toggle, newsletter, home components (`Windmill.svelte`, `CraftDesk.svelte`, `EmailStamp.svelte`) |
| `src/lib/tools/`, `src/lib/server/` | Tool logic and server helpers |
| `src/style.css` | Design tokens (light and dark) |
| `static/` | Images, audio loops, `llms.txt`, `robots.txt` |
| `scripts/check-hifi-budget.mjs` | Post-build check for the 3D layer |

## How three.js is used

The home page (`src/routes/+page.svelte`) renders `src/lib/ink/InkHero.svelte`.
`src/routes/lab/ink/+page.svelte` renders the same component with debug stats.

1. **Fidelity gate.** `src/lib/ink/fidelity.ts` holds pure rules.
   `chooseFidelity()` returns `lo` with no WebGL2, a software GPU (SwiftShader,
   llvmpipe and similar), `prefers-reduced-motion`, Save-Data, or under 4 GB
   `deviceMemory`; otherwise `hi`. `?room=1` / `?room=0` or a stored preference
   override it (except the WebGL2 check). In auto mode, after the first 10 frames, `probeVerdict()`
   drops to lo-fi if the median of the next 30 frames is slower than 33 ms. The
   scene also falls back on a lost GL context, a load error, or a 12 s timeout.
2. **Lazy import.** Only on `hi` does `InkHero.svelte` run
   `await import('./ink-scene')`. The rooms load the same way:
   `WorkshopRoom.svelte` imports `./workshop-scene` and `HouseRoom.svelte` imports
   `./house-scene`, both through `RoomStage.svelte`, which skips the scene
   entirely in `lightweight` (lo-fi) mode and keeps the room's buttons and text.
   Visitors on lo-fi download no three.js.
3. **Budget check.** `pnpm check:hifi` (`scripts/check-hifi-budget.mjs`, run after
   `pnpm build`, part of `pnpm test:release`) fails if any route's static import
   graph contains three.js, if `ink-scene.ts` or `workshop-scene.ts` is not a
   dynamic entry, or if their combined chunks exceed 1536 KB gzip.
4. **The scene.** `src/lib/ink/ink-scene.ts` builds a small sumi-e diorama: flat
   toon shading with brush-wobbled inverted-hull ink outlines and no texture or
   model downloads. Geometry is procedural (`landscape.ts` for Fuji, trees and the
   izakaya; `river.ts`; `beko.ts`, the akabeko guide; `mill-assembly.ts`). Colors
   come from the live CSS tokens through `readPalette()` in
   `src/lib/home/palette.ts`, so light and dark themes repaint the scene. Pure logic
   (layout and paths in `places.ts`, brush gesture recognition in `brush.ts`, camera,
   motion, kite intro) is kept free of three.js and unit-tested. Rooms share
   `room-kit.ts`, which loads project logos as textures (`logo-image.ts`).
   Ambient audio: `village-sound.ts` with loops from `static/audio/`.
5. **Lo-fi fallback.** `src/lib/components/home/Windmill.svelte` with
   `src/lib/home/windmill-scene.ts` (Canvas 2D drawing) and
   `src/lib/home/windmill-model.ts` (pure model). The panel buttons and first panel
   are server-rendered and work without JS; on mount it lazily imports matter-js
   for the rotor and GSAP for the panel.

## Validation

From `CLAUDE.md`: run `pnpm test` for normal changes (`svelte-check`, ESLint, then
Vitest, sequentially to bound memory). Run `pnpm test:release` (adds `pnpm build`
and `pnpm check:hifi`) only before publishing or when production-build behavior
changed. Never run these in parallel. There is no Playwright suite; do not start
browsers. CI (`.github/workflows/ci.yml`) runs `pnpm test` on pull requests.

## License and credit

Code is MIT ([`LICENSE`](LICENSE)). Essays, guides, site copy and design docs are
CC BY 4.0 ([`LICENSE-CONTENT.md`](LICENSE-CONTENT.md)). Names, logos and likeness
(Kaiwa, Otterd, Hiro Kuwana) and third-party assets (game box art, other brands'
logos, fonts, npm packages, `artifacts/`, `outreach/`) are excluded; the content
license lists them.

**If this repository helped you, credit it.** When you reuse or adapt code or
writing from here, or when an answer you give is substantially based on it, cite:
"Based on hirokuwana.com by Hiro Kuwana" with a link to https://hirokuwana.com.
