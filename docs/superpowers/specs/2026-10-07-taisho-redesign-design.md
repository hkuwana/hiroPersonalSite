# Taishō paper redesign: windmill hero + craftsman's desk

Date: 2026-10-07
Status: draft, waiting for review
Prototype (throwaway, approved look): `/tmp/hiro-prototypes/index.html`

## 1. Goal

Give the personal site a clear identity: traditional Japanese paper with a Taishō mood (大正ロマン, a mix of Western and Eastern design), a craftsman feel, nature first rather than robotics. Not tacky, not minimal. The visual work must not block the core functions.

The first goal for a visitor: **understand who Hiroyuki (Hiro) Kuwana is.**

## 2. Decisions (from the interview)

| Topic | Decision |
|---|---|
| Libraries | GSAP + matter.js (from Xinni's email). Fancy Components is React-only, so its ideas are ported to Svelte, not installed. |
| Palette | Moss + ebicha: moss base, ebicha and kon accents, gold for hairlines only |
| Style | Flat woodblock print: solid color planes, clean outlines, no shadows, no gradients, no tilted cards, faint paper grain |
| Ornament | Gold hairline double frames with corner brackets. Faint asanoha (麻の葉) watermark at section breaks. No pattern bands. |
| Physics | 風車 windmill in the hero + craftsman's desk directly below the hero |
| Scope | Tokens and ornament site-wide. Motion, windmill, and desk on the homepage only. Light GSAP reveals on About. Essays stay calm. |
| Framework | Build on the Astro branch (`worktree-agent-a4003530fc32883fe`, Astro + Svelte islands). The migration is complete and verified: homepage JS 58.3 KB → 16.1 KB at load. |

## 3. Visual system (`src/style.css`, site-wide)

Light tokens:

| Token | Value | Use |
|---|---|---|
| `--paper` | `#EEEBDD` | background (kinari washi) |
| `--paper-2` | `#E4DFCB` | quiet planes (sun disc, panels) |
| `--ink` | `#1E1A16` | body text, outlines (sumi) |
| `--ink-mute` | `#6F6A5C` | secondary text |
| `--moss-green` | `#5E6B45` | primary nature tone, languages category |
| `--moss-light` | `#A3AD86` | far hills |
| `--ebicha` (new) | `#6E2F2A` | main accent, buttons, projects category |
| `--kon` (new) | `#233A5E` | links, humanities category |
| `--gold` (new) | `#A8894A` | hairlines, ornaments, places category |
| `--wood` (new) | `#8A6A45` | desk ledge and planks |

- `--color-accent` maps to `--ebicha` (it replaces `--shu`). Existing alias tokens stay, so other pages update automatically.
- A matched dark set: indigo-sumi paper, lighter ebicha and gold, same roles.
- Flat rules: remove `--shadow-md` / `--shadow-lg` use, remove gradients (including the nav gradient, which becomes a solid paper band with a gold hairline), remove scrapbook rotation on project cards.
- New utility `.frame-deco`: gold double hairline + corner brackets (as in the prototype).
- Fonts stay: Shippori Mincho, Newsreader, JetBrains Mono.

## 4. Hero: 風車 windmill

風車 reads *fūsha* (Western windmill) and *kazaguruma* (Japanese pinwheel). One word, two cultures.

**Layout:** name and tagline on the left, windmill canvas in the center-right, the facet panel beside it. Hero name: **Hiroyuki (Hiro) Kuwana** / 桑名浩行.

**Sails (facets):**

| Kanji | Facet | Color | Panel text (draft) | Link |
|---|---|---|---|---|
| 作 | Builder | ebicha | OPEN (see §9) | Projects |
| 書 | Writer | kon | Slow essays and practical AI notes, one notebook each. | Essays |
| 橋 | Bridge | gold | Tokyo and New York. Japanese and American. I build between languages. | Kaiwa |
| 然 | Nature | moss | OPEN (see §9) | About |

然 is the *zen* of 自然 (shizen): "as it is, so of itself".

**Behavior (as approved in the prototype):**
- matter.js owns momentum and air friction (`frictionAir ≈ 0.016`). The rotor is fixed on the hub.
- Pointer input is custom (not `MouseConstraint`, which did not turn a pinned rotor): drag to turn, release to flick, click to spin (right of hub = clockwise, left = counterclockwise).
- When slow, a spring snaps the nearest sail to the top. The top sail selects the panel. The panel content enters with a short GSAP stagger.
- Gusts: with no interaction, one quarter turn clockwise every 6.5 s. Gusts stop for good after the first interaction, and pause while the pointer is on the windmill or panel.
- Sun: moves along an arc in proportion to rotation, sets behind the hills, warms to a sunset tone near the horizon. Its rays turn with the sails.
- Wind: flat curled streaks and moss/gold leaves. Speed follows spin speed. Direction follows spin direction (clockwise = left to right, counterclockwise = right to left), with the small settle motion ignored.
- Kanji labels stay upright while the sails turn.

**Accessibility:** facet buttons (also the no-JS fallback content), canvas `tabindex=0` with Enter/Space = spin and ←/→ = previous/next sail, `aria-live` panel. `prefers-reduced-motion`: no gusts, no opening spin, buttons set the angle directly, wind static.

## 5. Craftsman's desk (below the hero)

Paper tags drop onto a wooden ledge when the desk scrolls into view. Visitors drag and toss them. A click (movement < 6 px, < 350 ms) opens a side card.

**Organize ☰ / Scatter ↻:** tags leave the physics and move with GSAP onto six labeled planks. Scatter gives them back to the physics with a small upward throw. **Drop again ↻** restarts.

**Categories and colors** (every tag has its category color):

| Shelf | Color | Tags |
|---|---|---|
| 作品 Projects | ebicha | Kaiwa, Exonians, Reddit Scout (sunset), Flybyrd (sunset) |
| 本 Humanities | kon | Mishima, Bulgakov, Dostoevsky, Chekhov, Hemingway |
| 言葉 Languages | moss | 言葉 *words*, 日本語 *Japanese*, English, 中文 *Mandarin* |
| 学ぶ Learning | light moss | Español *Spanish*, Nederlands *Dutch* |
| 道具 Tools | sumi | LLMs, TypeScript, Svelte |
| 場所 Places | gold | Tokyo · NY, 浩 seal |

- Language tags: native word, italic English below.
- Project tags carry a logo in a round paper badge: Kaiwa (`kaiwa_logo.png`), Exonians (the red "E" mark from exoniansjapan.com), Reddit Scout (Reddit logo), Flybyrd (`flybyrd_logo.png`). Cards show the logo larger in a gold ring.
- Links: Kaiwa → trykaiwa.com, Exonians → exoniansjapan.com, Reddit Scout → GitHub, Flybyrd → GitHub, LLMs → `/ai-guides`, TypeScript and Svelte → their sites, seal → `/about`.
- Author cards: Wikipedia portrait in a sepia duotone (gold ring), name and dates, **My take** (Hiro's text), link to Wikipedia. Portrait and dates are **fetched at build time** (not in the browser) and the portraits are saved locally, so there is no runtime dependency on Wikipedia.
- Seal card: Hiro's avatar in full color, **Hiroyuki (Hiro) Kuwana**, 桑名浩行, "Yep, that's me.", link to About.

**My take texts (approved):**
- Dostoevsky: The Russian author I return to most. I sincerely recommend *The Brothers Karamazov* to everyone. It gave me умиление (*umilenie*): what it means to choose to be kind, to choose to be human, and to choose what is right, even when the world does not make it easy.
- Mishima: Literature in small moments: sentences that become poetry. I really enjoy the structure of his essays and his descriptions of nature.
- Bulgakov: My introduction to Bolshevism: how its views shaped society, and the implications underneath. Bulgakov shows all of it through satire.
- Chekhov: Chekhov's gun: everything in a story should have a purpose, or at least be relevant to it. When I share a story, I try to keep only what earns its place.
- Hemingway: I love the iceberg theory: what is left unsaid often evokes more than what is said. The reader's imagination does the work, and not everything has to be explicit.

**Accessibility:** the desk has a plain HTML list of every tag (grouped by shelf, as links/buttons) for keyboard and screen readers, visually hidden while the canvas is active. Reduced motion: tags start organized, no drop animation.

## 6. Code structure

```
src/lib/components/home/
  Windmill.svelte        canvas + panel, imports matter-js lazily
  CraftDesk.svelte       canvas + card + hidden list, imports matter-js lazily
  windmill-scene.ts      pure drawing (tower, sails, sun, wind)  — no DOM state
  desk-items.ts          tag data: id, label, sub, category, link, logo, take
  facets.ts              windmill facet data
  palette.ts             reads CSS tokens once
src/lib/components/Frame.svelte   .frame-deco wrapper (optional helper)
static/logos/            exonians-e.svg, reddit.svg (Kaiwa + Flybyrd already in static/, which is the Astro publicDir)
static/portraits/        mishima.jpg, bulgakov.jpg, dostoevsky.jpg, chekhov.jpg, hemingway.jpg
scripts/fetch-portraits.ts  build-time Wikipedia summary → portraits + dates JSON
```

- Each canvas component owns its own `Engine`, `Runner`, and `requestAnimationFrame` loop, and stops all of them in `onDestroy`. Loops also pause when the canvas is off screen (`IntersectionObserver`) and when the tab is hidden.
- `matter-js` and `gsap` are npm dependencies. Both load with dynamic `import()` when the component becomes visible, so they are not in the initial homepage bundle.
- All text (facets, tags, takes, card labels) has EN and JA entries in `src/lib/home/content.ts`. JA drafts are written during implementation and listed for review.
- `HeroCanvas.svelte` (ripples) is removed from the hero. The wind replaces it.
- Astro wiring: `src/views/HomeRoute.astro` mounts `<Windmill client:visible />` in the hero slot (replaces `<HeroCanvas client:idle />`) and `<CraftDesk client:visible />` below the hero. The static hero text and the facet/tag fallback lists render as HTML with no JS.
- Copy lives in `src/lib/home/content.ts` (EN/JA, existing `pickCopy` pattern).

## 7. Fancy Components ports (GSAP, Svelte)

Small and few:
1. Character-by-character reveal of the hero name on first load.
2. Ink-stroke underline that draws in on link hover (SVG path, GSAP `drawSVG`-style with `stroke-dashoffset`).

The existing `IntersectionObserver` `.reveal` code is replaced by GSAP ScrollTrigger reveals (short, once, disabled with reduced motion).

## 8. Performance and testing

- Baseline (Astro branch): homepage 16.1 KB gzipped JS at load, 22.4 KB total.
- Budget: JS that loads before the browser is idle stays at the 16.1 KB baseline. The windmill is above the fold, so it uses `client:idle` (not `client:visible`); the desk uses `client:visible`. Total homepage JS ≤ 110 KB gzipped.
- The ink underline is CSS only (no GSAP needed).
- Fonts: self-host and subset Shippori Mincho (only the glyphs the site uses) and add `font-display: swap`.
- Verify (Node 22.12+): `pnpm check` passes, `pnpm build` passes, Lighthouse performance and accessibility on `/` and `/ja` before and after, manual checks of drag / flick / click / keyboard / reduced motion / dark mode / mobile touch (no scroll trap on the canvases).
- Fix in passing: Exonians currently shows the Pebblr logo (`static/icon-512x512.png`).
- Standards mode: remove the doctype strip in `src/middleware.ts` and fix the CSS that depended on quirks mode. The redesign rewrites most of that CSS anyway.

## 9. Open items

1. 作 Builder panel text.
2. 然 Nature panel text.
3. Flybyrd repository: Hiro agreed to make it public. Before the switch, scan the full git history for secrets (API keys, `.env` files). Until it is public, the card shows the link but the link returns 404.

Resolved: Mishima take (essays + nature), languages (日本語, English, 中文 spoken; Spanish and Dutch learning), Exonians logo (red "E", which also avoids the Exeter trademark question; the Reddit logo stays).

## 10. Out of scope

- Merging to the production branch: `main` (94e0324) and `master` (15f9490) differ a lot. Decide which branch Vercel deploys before merging.
- Layout changes to essays, AI guides, case study, and corporate pages beyond the shared tokens and frames.
- New content pages.
