# Taishō Paper Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the Astro site as a flat Taishō woodblock print on washi, with a 風車 windmill hero and a craftsman's desk, built with GSAP and matter.js.

**Architecture:** Pure logic (windmill physics rules, shelf layout, content data) lives in small TypeScript modules with Vitest unit tests. Two Svelte 5 islands (`Windmill`, `CraftDesk`) draw on canvas and import `matter-js` and `gsap` lazily inside `onMount`. Astro renders all text, including the fallback lists, as static HTML. Site-wide look changes live in `src/style.css` tokens.

**Tech Stack:** Astro 7, Svelte 5 (runes), TypeScript, matter-js 0.20, gsap 3.13, Vitest 3, Node ≥ 22.12.

**Spec:** `docs/superpowers/specs/2026-10-07-taisho-redesign-design.md`
**Approved prototype (behavior reference):** `docs/superpowers/prototypes/taisho-prototype.html` (copied in Task 1)

## Global Constraints

- Node ≥ 22.12 for every command (`source ~/.nvm/nvm.sh && nvm use 22`).
- Work only in the worktree `/Users/hiro/Documents/hiroPersonalSite/.claude/worktrees/agent-a4003530fc32883fe`, branch `worktree-agent-a4003530fc32883fe`.
- Flat style: no `box-shadow` (except focus rings), no gradients used as fills, no rotated cards.
- Palette (light): `--paper #EEEBDD`, `--paper-2 #E4DFCB`, `--ink #1E1A16`, `--ink-mute #6F6A5C`, `--moss-green #5E6B45`, `--moss-light #A3AD86`, `--ebicha #6E2F2A`, `--kon #233A5E`, `--gold #A8894A`, `--wood #8A6A45`.
- Category colors: work = ebicha, reading = kon, lang = moss-green, learn = moss-light, tools = ink, places = gold. Every tag uses its category color.
- Every user-visible string has EN and JA.
- Name everywhere: **Hiroyuki (Hiro) Kuwana** / 桑名浩行.
- `prefers-reduced-motion: reduce`: no gusts, no opening spin, no drop animation (desk starts organized), no GSAP reveals.
- Islands: `Windmill` uses `client:idle`, `CraftDesk` uses `client:visible`. JS that loads before the browser is idle stays at the Astro baseline (16.1 KB gzipped). Total homepage JS ≤ 110 KB gzipped.
- Do not push, open a PR, or merge until Task 11.
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.

## Review Focus

1. **Touch on mobile:** a vertical swipe that starts on a canvas must still scroll the page unless it starts on a sail or a tag. Pinned in Task 6 (`touch-action: pan-y` + hit test) and Task 7.
2. **Tab hidden / island off screen:** the rAF loops and runners must stop, then resume without a jump in physics (big `delta`). Pinned by `clampDelta` tests in Task 2 and used in Tasks 6–7.
3. **Fast repeated clicks on Organize/Scatter:** tweens must not fight the physics. Pinned by killing tweens before each mode change (Task 7) and the `nextDeskMode` test (Task 3).
4. **JA locale overflow:** JA tag labels and plank labels must fit on the planks at `W = 840`. Pinned by the `layoutShelves` width test with the longest labels (Task 3).
5. **Dark theme:** canvas colors must come from CSS tokens at draw time and update when the theme toggles. Pinned by `readPalette` reading live tokens and a `MutationObserver` on `data-theme` (Tasks 5–7).

---

## File Structure

| File | Responsibility |
|---|---|
| `vitest.config.ts` | Vitest with `$lib` / `$data` aliases |
| `tests/unit/*.test.ts` | Unit tests for the pure modules |
| `src/lib/home/palette.ts` | Read CSS color tokens into a typed object |
| `src/lib/home/windmill-model.ts` | Pure windmill rules: sail index, snap, spring, click spin, wind direction, sun |
| `src/lib/home/windmill-scene.ts` | Canvas drawing for the windmill scene + wind particles |
| `src/lib/home/facets.ts` | The four sails: kanji, color, EN/JA text, link |
| `src/lib/home/desk-items.ts` | Shelves and tags: category, label, logo, link, EN/JA text, author data |
| `src/lib/home/desk-layout.ts` | Pure shelf layout, click detection, desk mode toggle |
| `src/lib/home/desk-scene.ts` | Canvas drawing for ledge, planks, tags, seal |
| `src/lib/components/home/Windmill.svelte` | Windmill island |
| `src/lib/components/home/CraftDesk.svelte` | Desk island |
| `src/lib/components/home/HomeMotion.svelte` | GSAP name reveal + scroll reveals (tiny island) |
| `scripts/fetch-portraits.mjs` | One-off: download free-license author portraits + credits |
| `scripts/font-glyphs.mjs` | Build step: collect Shippori Mincho glyphs |
| `src/lib/font-glyphs.ts` | Generated glyph string |
| `static/logos/`, `static/portraits/` | Assets |
| Modify `src/style.css` | Tokens, flat rules, frames, hero grid, island styles |
| Modify `src/lib/home/content.ts` | Hero name copy, `mill.*` and `desk.*` copy, Exonians logo |
| Modify `src/views/HomePage.svelte`, `src/views/HomeRoute.astro` | Slots and island wiring, SEO name |
| Modify `src/layouts/BaseLayout.astro` | Font URL with glyph subset |
| Delete `src/middleware.ts`, `src/lib/components/HeroCanvas.svelte` | Standards mode, ripples removed |

---

### Task 1: Tooling, prototype reference, and spec commit

**Files:**
- Create: `vitest.config.ts`, `tests/unit/smoke.test.ts`, `docs/superpowers/prototypes/taisho-prototype.html`
- Modify: `package.json`

**Interfaces:**
- Produces: `pnpm test` runs Vitest once; `$lib` and `$data` aliases work in tests.

- [ ] **Step 1: Install dependencies**

```bash
source ~/.nvm/nvm.sh && nvm use 22
pnpm add gsap@^3.13.0 matter-js@^0.20.0
pnpm add -D vitest@^3 @types/matter-js
```

- [ ] **Step 2: Add the test script** to `package.json` `scripts`:

```json
"test": "vitest run"
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		alias: {
			$lib: fileURLToPath(new URL('./src/lib', import.meta.url)),
			$data: fileURLToPath(new URL('./src/data', import.meta.url))
		}
	},
	test: { include: ['tests/unit/**/*.test.ts'], environment: 'node' }
});
```

- [ ] **Step 4: Write a smoke test** `tests/unit/smoke.test.ts`

```ts
import { expect, test } from 'vitest';
import { PERSONAL } from '$data/constants';

test('aliases resolve', () => {
	expect(PERSONAL.companyWebsite).toContain('trykaiwa');
});
```

- [ ] **Step 5: Run it**

Run: `pnpm test`
Expected: 1 passed.

- [ ] **Step 6: Copy the approved prototype into the repo**

```bash
mkdir -p docs/superpowers/prototypes
cp /tmp/hiro-prototypes/index.html docs/superpowers/prototypes/taisho-prototype.html
```

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts tests/unit/smoke.test.ts docs/superpowers
git commit -m "chore: add vitest, gsap, matter-js; add redesign spec, plan, prototype"
```

---

### Task 2: Windmill model (pure rules)

**Files:**
- Create: `src/lib/home/windmill-model.ts`
- Test: `tests/unit/windmill-model.test.ts`

**Interfaces:**
- Produces (all exported from `$lib/home/windmill-model`):
  - `MILL = { W: 560, H: 540, HUB: { x: 280, y: 210 }, BLADE_LEN: 170, BLADE_W: 54, BLADE_OFF: 30, REACH: 212 }`
  - `QUARTER: number`, `SAIL_COUNT = 4`, `SETTLE_SPEED = 0.012`, `GUST_INTERVAL_MS = 6500`
  - `topIndex(angle: number): number`
  - `nearestSnap(angle: number): number`
  - `angleForSail(i: number, current: number): number`
  - `springVelocity(av: number, angle: number, target: number): number`
  - `clickSpin(pointerX: number, hubX: number): number`
  - `clampFlick(v: number): number`
  - `onRotor(p: { x: number; y: number }): boolean`
  - `stepWindDir(windDir: number, turn: number): number`
  - `stepSunPhase(phase: number, turn: number): number`
  - `sunPosition(phase: number): { x: number; y: number; low: number }`
  - `shouldGust(s: { now: number; lastGust: number; userTookOver: boolean; paused: boolean; reduceMotion: boolean }): boolean`
  - `clampDelta(ms: number): number`

- [ ] **Step 1: Write the failing tests** `tests/unit/windmill-model.test.ts`

```ts
import { describe, expect, test } from 'vitest';
import {
	MILL, QUARTER, angleForSail, clampDelta, clampFlick, clickSpin, nearestSnap, onRotor,
	shouldGust, springVelocity, stepSunPhase, stepWindDir, sunPosition, topIndex
} from '$lib/home/windmill-model';

describe('sail index', () => {
	test('sail 0 is on top at angle 0', () => expect(topIndex(0)).toBe(0));
	test('clockwise quarter turn brings sail 3 to the top', () => expect(topIndex(QUARTER)).toBe(3));
	test('counterclockwise quarter turn brings sail 1 to the top', () => expect(topIndex(-QUARTER)).toBe(1));
	test('works after many turns', () => expect(topIndex(QUARTER + 10 * 2 * Math.PI)).toBe(3));
	test('angleForSail puts that sail on top, near the current angle', () => {
		const current = 7.1;
		for (let i = 0; i < 4; i++) {
			const a = angleForSail(i, current);
			expect(topIndex(a)).toBe(i);
			expect(Math.abs(a - current)).toBeLessThanOrEqual(Math.PI + 1e-9);
		}
	});
	test('nearestSnap rounds to quarter turns', () => expect(nearestSnap(QUARTER * 1.4)).toBeCloseTo(QUARTER));
});

describe('motion rules', () => {
	test('spring pulls toward the target', () => {
		expect(springVelocity(0, 0, 1)).toBeGreaterThan(0);
		expect(springVelocity(0, 1, 0)).toBeLessThan(0);
	});
	test('click right of hub spins clockwise, left spins counterclockwise', () => {
		expect(clickSpin(MILL.HUB.x + 10, MILL.HUB.x)).toBeCloseTo(0.32);
		expect(clickSpin(MILL.HUB.x - 10, MILL.HUB.x)).toBeCloseTo(-0.32);
	});
	test('flick is clamped', () => {
		expect(clampFlick(5)).toBe(0.7);
		expect(clampFlick(-5)).toBe(-0.7);
	});
	test('onRotor hit test', () => {
		expect(onRotor(MILL.HUB)).toBe(true);
		expect(onRotor({ x: 0, y: MILL.H })).toBe(false);
	});
	test('clampDelta prevents a physics jump after a hidden tab', () => {
		expect(clampDelta(5000)).toBe(1000 / 30);
		expect(clampDelta(16)).toBe(16);
	});
});

describe('wind and sun', () => {
	test('a real counterclockwise spin turns the wind toward -1', () => {
		let d = 1;
		for (let i = 0; i < 60; i++) d = stepWindDir(d, -0.3);
		expect(d).toBeLessThan(-0.95);
	});
	test('the small settle motion does not change the wind', () => {
		expect(stepWindDir(-0.9, 0.02)).toBe(-0.9);
	});
	test('sun phase wraps into [0, 1)', () => {
		expect(stepSunPhase(0.99, 1)).toBeGreaterThanOrEqual(0);
		expect(stepSunPhase(0.01, -1)).toBeLessThan(1);
	});
	test('sun is low at the horizon and high at noon', () => {
		expect(sunPosition(0.5).low).toBeLessThan(sunPosition(0.02).low);
	});
});

describe('gusts', () => {
	const base = { now: 10_000, lastGust: 0, userTookOver: false, paused: false, reduceMotion: false };
	test('gust after the interval', () => expect(shouldGust(base)).toBe(true));
	test('no gust after the user took over', () => expect(shouldGust({ ...base, userTookOver: true })).toBe(false));
	test('no gust while paused', () => expect(shouldGust({ ...base, paused: true })).toBe(false));
	test('no gust with reduced motion', () => expect(shouldGust({ ...base, reduceMotion: true })).toBe(false));
	test('no gust before the interval', () => expect(shouldGust({ ...base, lastGust: 9000 })).toBe(false));
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm test tests/unit/windmill-model.test.ts`
Expected: FAIL, cannot resolve `$lib/home/windmill-model`.

- [ ] **Step 3: Implement** `src/lib/home/windmill-model.ts`

```ts
// Pure rules for the 風車 windmill. No DOM, no matter.js: the island feeds
// these with the rotor angle and velocity that matter.js integrates.
export const MILL = {
	W: 560,
	H: 540,
	HUB: { x: 280, y: 210 },
	BLADE_LEN: 170,
	BLADE_W: 54,
	BLADE_OFF: 30,
	REACH: 212
} as const;

export const QUARTER = Math.PI / 2;
export const SAIL_COUNT = 4;
export const SETTLE_SPEED = 0.012;
export const GUST_INTERVAL_MS = 6500;

const TAU = Math.PI * 2;
const CLICK_SPIN = 0.32;
const MAX_FLICK = 0.7;
const WIND_MIN_TURN = 0.03;
const WIND_EASE = 0.08;
const SUN_PER_RADIAN = 0.03;

export const topIndex = (angle: number) =>
	((Math.round(-angle / QUARTER) % SAIL_COUNT) + SAIL_COUNT) % SAIL_COUNT;

export const nearestSnap = (angle: number) => Math.round(angle / QUARTER) * QUARTER;

export function angleForSail(i: number, current: number): number {
	const base = -i * QUARTER;
	return base + Math.round((current - base) / TAU) * TAU;
}

export const springVelocity = (av: number, angle: number, target: number) =>
	av * 0.88 + (target - angle) * 0.012;

export const clickSpin = (pointerX: number, hubX: number) => (pointerX >= hubX ? CLICK_SPIN : -CLICK_SPIN);

export const clampFlick = (v: number) => Math.max(-MAX_FLICK, Math.min(MAX_FLICK, v));

export const onRotor = (p: { x: number; y: number }) =>
	Math.hypot(p.x - MILL.HUB.x, p.y - MILL.HUB.y) < MILL.REACH;

// Wind follows real spins only; the small settle motion is ignored.
export function stepWindDir(windDir: number, turn: number): number {
	if (Math.abs(turn) <= WIND_MIN_TURN) return windDir;
	return windDir + (Math.sign(turn) - windDir) * WIND_EASE;
}

export const stepSunPhase = (phase: number, turn: number) =>
	(((phase + turn * SUN_PER_RADIAN) % 1) + 1) % 1;

// 0 = left horizon, 0.5 = noon, 1 = right horizon. `low` is 0 high … 1 at horizon.
export function sunPosition(phase: number) {
	const th = Math.PI + phase * Math.PI;
	const x = MILL.W / 2 + Math.cos(th) * 300;
	const y = 500 + Math.sin(th) * 400;
	const low = Math.max(0, Math.min(1, (y - 140) / 300));
	return { x, y, low };
}

export function shouldGust(s: {
	now: number;
	lastGust: number;
	userTookOver: boolean;
	paused: boolean;
	reduceMotion: boolean;
}): boolean {
	return !s.userTookOver && !s.paused && !s.reduceMotion && s.now - s.lastGust > GUST_INTERVAL_MS;
}

export const clampDelta = (ms: number) => Math.min(ms, 1000 / 30);
```

- [ ] **Step 4: Run tests**

Run: `pnpm test tests/unit/windmill-model.test.ts`
Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/home/windmill-model.ts tests/unit/windmill-model.test.ts
git commit -m "feat(windmill): pure model for sails, snap, wind, sun, gusts"
```

---

### Task 3: Content data and shelf layout

**Files:**
- Create: `src/lib/home/facets.ts`, `src/lib/home/desk-items.ts`, `src/lib/home/desk-layout.ts`
- Test: `tests/unit/desk-data.test.ts`, `tests/unit/desk-layout.test.ts`

**Interfaces:**
- Consumes: `Locale` from `$lib/home/content`.
- Produces:
  - `type L10n = { en: string; ja: string }` (from `desk-items.ts`)
  - `type PaletteKey = 'paper' | 'paper2' | 'ink' | 'inkMute' | 'moss' | 'mossLight' | 'ebicha' | 'kon' | 'gold' | 'wood'` (from `desk-items.ts`)
  - `FACETS: Facet[]` with `Facet = { id: 'builder' | 'writer' | 'bridge' | 'nature'; kanji: string; color: PaletteKey; title: L10n; line: L10n; link: { href: string; external?: boolean; label: L10n } }`
  - `type ShelfId = 'work' | 'reading' | 'lang' | 'learn' | 'tools' | 'places'`
  - `SHELVES: { id: ShelfId; label: L10n; color: PaletteKey }[]` (display order)
  - `DESK_ITEMS: DeskItem[]`, `DeskItem` as in Step 3
  - `DESK = { W: 840, H: 440, LEDGE_Y: 400, LABEL_W: 138, ROW0: 80, ROW_H: 64, GAP: 8 }`
  - `plankY(row: number): number`
  - `layoutShelves(items: { id: string; cat: ShelfId; w: number; h: number }[]): Map<string, { x: number; y: number }>` (centers)
  - `isClick(down: { x: number; y: number; t: number }, up: { x: number; y: number; t: number }): boolean`
  - `type DeskMode = 'loose' | 'organized'`, `nextDeskMode(m: DeskMode): DeskMode`
  - `tagWidth(textWidth: number, subWidth: number, hasLogo: boolean): number`

- [ ] **Step 1: Write the failing data tests** `tests/unit/desk-data.test.ts`

```ts
import { existsSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { DESK_ITEMS, SHELVES } from '$lib/home/desk-items';
import { FACETS } from '$lib/home/facets';

const both = (l?: { en: string; ja: string }) => !!l && l.en.trim() !== '' && l.ja.trim() !== '';

describe('facets', () => {
	test('four sails with unique kanji', () => {
		expect(FACETS).toHaveLength(4);
		expect(new Set(FACETS.map((f) => f.kanji)).size).toBe(4);
	});
	test('nature uses 然', () => expect(FACETS.find((f) => f.id === 'nature')?.kanji).toBe('然'));
	test('every facet has EN and JA', () => {
		for (const f of FACETS) expect(both(f.title) && both(f.line) && both(f.link.label)).toBe(true);
	});
});

describe('desk items', () => {
	test('unique ids', () => expect(new Set(DESK_ITEMS.map((i) => i.id)).size).toBe(DESK_ITEMS.length));
	test('every item is on a known shelf', () => {
		const ids = new Set(SHELVES.map((s) => s.id));
		for (const i of DESK_ITEMS) expect(ids.has(i.cat)).toBe(true);
	});
	test('every item has EN and JA text', () => {
		for (const i of DESK_ITEMS) expect(both(i.take ?? i.desc)).toBe(true);
	});
	test('authors have a take and descriptor', () => {
		const authors = DESK_ITEMS.filter((i) => i.cat === 'reading');
		expect(authors.map((a) => a.label)).toEqual(['Mishima', 'Bulgakov', 'Dostoevsky', 'Chekhov', 'Hemingway']);
		for (const a of authors) expect(both(a.take) && both(a.author?.descriptor)).toBe(true);
	});
	test('learning languages are Spanish and Dutch', () => {
		expect(DESK_ITEMS.filter((i) => i.cat === 'learn').map((i) => i.sub)).toEqual(['Spanish', 'Dutch']);
	});
	test('every referenced asset exists in static/', () => {
		for (const i of DESK_ITEMS) {
			for (const path of [i.logo, i.avatar, i.author?.portrait]) {
				if (path) expect(existsSync(`static${path}`), path).toBe(true);
			}
		}
	});
	test('external links are https', () => {
		for (const i of DESK_ITEMS) if (i.external) expect(i.href).toMatch(/^https:\/\//);
	});
});
```

- [ ] **Step 2: Write the failing layout tests** `tests/unit/desk-layout.test.ts`

```ts
import { describe, expect, test } from 'vitest';
import { DESK, isClick, layoutShelves, nextDeskMode, plankY, tagWidth } from '$lib/home/desk-layout';
import { DESK_ITEMS, SHELVES } from '$lib/home/desk-items';

// Upper bound of Newsreader 18px advance (~10 px/char Latin, 18 px/char CJK) and italic 13px subs.
const est = (s: string) => [...s].reduce((n, ch) => n + (/[　-鿿]/.test(ch) ? 18 : 10), 0);

describe('layoutShelves', () => {
	const items = DESK_ITEMS.map((i) => ({
		id: i.id,
		cat: i.cat,
		w: i.kind === 'seal' ? 60 : tagWidth(est(i.label), i.sub ? est(i.sub) * 0.75 : 0, !!i.logo),
		h: i.kind === 'seal' ? 60 : i.sub ? 52 : 38
	}));
	const placed = layoutShelves(items);

	test('every item is placed', () => expect(placed.size).toBe(items.length));
	test('nothing overflows the desk', () => {
		for (const it of items) {
			const p = placed.get(it.id)!;
			expect(p.x + it.w / 2, it.id).toBeLessThanOrEqual(DESK.W);
			expect(p.x - it.w / 2).toBeGreaterThanOrEqual(DESK.LABEL_W);
		}
	});
	test('items rest on their own plank', () => {
		for (const it of items) {
			const row = SHELVES.findIndex((s) => s.id === it.cat);
			expect(placed.get(it.id)!.y + it.h / 2).toBeCloseTo(plankY(row) - 1);
		}
	});
	test('the last plank is the ledge', () => expect(plankY(SHELVES.length - 1)).toBe(DESK.LEDGE_Y));
});

describe('input helpers', () => {
	test('short, still press is a click', () => expect(isClick({ x: 0, y: 0, t: 0 }, { x: 3, y: 2, t: 200 })).toBe(true));
	test('drag is not a click', () => expect(isClick({ x: 0, y: 0, t: 0 }, { x: 20, y: 0, t: 200 })).toBe(false));
	test('long press is not a click', () => expect(isClick({ x: 0, y: 0, t: 0 }, { x: 0, y: 0, t: 900 })).toBe(false));
	test('mode toggles', () => {
		expect(nextDeskMode('loose')).toBe('organized');
		expect(nextDeskMode('organized')).toBe('loose');
	});
});
```

- [ ] **Step 3: Implement** `src/lib/home/desk-items.ts`

```ts
// Shelves and tags for the craftsman's desk. Text is Hiro's; JA drafts are
// listed for his review in the PR.
import { PERSONAL } from '$data/constants';

export type L10n = { en: string; ja: string };
export type PaletteKey = 'paper' | 'paper2' | 'ink' | 'inkMute' | 'moss' | 'mossLight' | 'ebicha' | 'kon' | 'gold' | 'wood';
export type ShelfId = 'work' | 'reading' | 'lang' | 'learn' | 'tools' | 'places';

export type DeskItem = {
	id: string;
	kind: 'tag' | 'seal';
	cat: ShelfId;
	label: string;
	sub?: string;
	logo?: string;
	href?: string;
	external?: boolean;
	cta?: L10n;
	desc?: L10n;
	take?: L10n;
	author?: { portrait?: string; descriptor: L10n; wiki: string };
	avatar?: string;
	name?: string;
	nameJa?: string;
};

export const SHELVES: { id: ShelfId; label: L10n; color: PaletteKey }[] = [
	{ id: 'work', label: { en: '作品 Projects', ja: '作品' }, color: 'ebicha' },
	{ id: 'reading', label: { en: '本 Humanities', ja: '本' }, color: 'kon' },
	{ id: 'lang', label: { en: '言葉 Languages', ja: '言葉' }, color: 'moss' },
	{ id: 'learn', label: { en: '学ぶ Learning', ja: '学ぶ' }, color: 'mossLight' },
	{ id: 'tools', label: { en: '道具 Tools', ja: '道具' }, color: 'ink' },
	{ id: 'places', label: { en: '場所 Places', ja: '場所' }, color: 'gold' }
];

const SPEAK: L10n = { en: 'A language I speak.', ja: '話せる言語。' };
const LEARN: L10n = { en: 'A language I am learning.', ja: 'いま学んでいる言語。' };
const GITHUB: L10n = { en: 'View on GitHub', ja: 'GitHub で見る' };
const wiki = (title: string) => `https://en.wikipedia.org/wiki/${title}`;

export const DESK_ITEMS: DeskItem[] = [
	{ id: 'kaiwa', kind: 'tag', cat: 'work', label: 'Kaiwa', logo: '/kaiwa_logo.png', href: PERSONAL.companyWebsite, external: true,
		cta: { en: 'Visit trykaiwa.com', ja: 'trykaiwa.com へ' },
		desc: { en: 'A platform where language learners speak daily with AI, and coaches shape each learner journey.', ja: '学習者が AI と毎日話し、コーチが一人ひとりの学びの道筋をつくるプラットフォーム。' } },
	{ id: 'exonians', kind: 'tag', cat: 'work', label: 'Exonians', logo: '/logos/exonians-e.svg', href: 'https://exoniansjapan.com/', external: true,
		cta: { en: 'Visit exoniansjapan.com', ja: 'exoniansjapan.com へ' },
		desc: { en: 'A small, practical alumni site I built on a subway ride home.', ja: '帰りの電車で作った、小さくて実用的な同窓会サイト。' } },
	{ id: 'reddit-scout', kind: 'tag', cat: 'work', label: 'Reddit Scout', logo: '/logos/reddit.svg', href: 'https://github.com/hkuwana/Kaiwa-reddit-scout', external: true, cta: GITHUB,
		desc: { en: 'Sunset. A local workflow that connected Reddit, Drive, and Gemini to find learners with real intent.', ja: '終了。Reddit、Drive、Gemini をつないで、本気で学びたい人を探したローカルのワークフロー。' } },
	{ id: 'flybyrd', kind: 'tag', cat: 'work', label: 'Flybyrd', logo: '/flybyrd_logo.png', href: 'https://github.com/hkuwana/flybyrd', external: true, cta: GITHUB,
		desc: { en: 'Sunset. AI that organized scattered feedback for product managers.', ja: '終了。PM のために散らばったフィードバックを整理した AI。' } },

	{ id: 'mishima', kind: 'tag', cat: 'reading', label: 'Mishima',
		author: { portrait: '/portraits/mishima.jpg', wiki: wiki('Yukio_Mishima'), descriptor: { en: 'Japanese author (1925–1970)', ja: '日本の作家（1925–1970）' } },
		take: { en: 'Literature in small moments: sentences that become poetry. I really enjoy the structure of his essays and his descriptions of nature.', ja: '小さな瞬間の文学。文が詩になる。三島の随筆の構成と、自然の描写がとても好きです。' } },
	{ id: 'bulgakov', kind: 'tag', cat: 'reading', label: 'Bulgakov',
		author: { portrait: '/portraits/bulgakov.jpg', wiki: wiki('Mikhail_Bulgakov'), descriptor: { en: 'Russian and Soviet author (1891–1940)', ja: 'ロシア・ソビエトの作家（1891–1940）' } },
		take: { en: 'My introduction to Bolshevism: how its views shaped society, and the implications underneath. Bulgakov shows all of it through satire.', ja: 'ボリシェヴィズムへの入口。その思想が社会をどう形づくり、その下に何があったのか。ブルガーコフはそれを風刺で描きます。' } },
	{ id: 'dostoevsky', kind: 'tag', cat: 'reading', label: 'Dostoevsky',
		author: { portrait: '/portraits/dostoevsky.jpg', wiki: wiki('Fyodor_Dostoevsky'), descriptor: { en: 'Russian novelist and philosopher (1821–1881)', ja: 'ロシアの小説家・思想家（1821–1881）' } },
		take: { en: 'The Russian author I return to most. I sincerely recommend The Brothers Karamazov to everyone. It gave me умиление (umilenie): what it means to choose to be kind, to choose to be human, and to choose what is right, even when the world does not make it easy.', ja: '何度も戻ってくるロシアの作家。『カラマーゾフの兄弟』は心からすべての人に薦めます。умиление（ウミレーニエ）を教えてくれた本です。世界がそれを簡単にしてくれないときでも、優しさを選び、人間であることを選び、正しいことを選ぶという意味を。' } },
	{ id: 'chekhov', kind: 'tag', cat: 'reading', label: 'Chekhov',
		author: { portrait: '/portraits/chekhov.jpg', wiki: wiki('Anton_Chekhov'), descriptor: { en: 'Russian playwright and writer (1860–1904)', ja: 'ロシアの劇作家・作家（1860–1904）' } },
		take: { en: "Chekhov's gun: everything in a story should have a purpose, or at least be relevant to it. When I share a story, I try to keep only what earns its place.", ja: 'チェーホフの銃。物語の中のすべては目的を持つか、少なくとも物語に関わっているべきだ。話をするとき、私も意味のあるものだけを残すようにしています。' } },
	{ id: 'hemingway', kind: 'tag', cat: 'reading', label: 'Hemingway',
		author: { portrait: '/portraits/hemingway.jpg', wiki: wiki('Ernest_Hemingway'), descriptor: { en: 'American novelist and journalist (1899–1961)', ja: 'アメリカの小説家・記者（1899–1961）' } },
		take: { en: "I love the iceberg theory: what is left unsaid often evokes more than what is said. The reader's imagination does the work, and not everything has to be explicit.", ja: '氷山理論が大好きです。書かれないことのほうが、書かれたことより多くを呼び起こすことがある。想像力が仕事をしてくれるので、すべてを明示しなくていい。' } },

	{ id: 'kotoba', kind: 'tag', cat: 'lang', label: '言葉', sub: 'words',
		desc: { en: '言葉 (kotoba): words. The 葉 means leaf. The Kokinshū preface calls poems the leaves of words that grow from the human heart.', ja: '言葉の「葉」は木の葉。古今集の仮名序は、歌を「人の心を種として、よろづの言の葉とぞなれりける」と書いています。' } },
	{ id: 'japanese', kind: 'tag', cat: 'lang', label: '日本語', sub: 'Japanese', desc: SPEAK },
	{ id: 'english', kind: 'tag', cat: 'lang', label: 'English', desc: SPEAK },
	{ id: 'mandarin', kind: 'tag', cat: 'lang', label: '中文', sub: 'Mandarin', desc: SPEAK },
	{ id: 'spanish', kind: 'tag', cat: 'learn', label: 'Español', sub: 'Spanish', desc: LEARN },
	{ id: 'dutch', kind: 'tag', cat: 'learn', label: 'Nederlands', sub: 'Dutch', desc: LEARN },

	{ id: 'llms', kind: 'tag', cat: 'tools', label: 'LLMs', href: '/ai-guides', cta: { en: 'Read ./ai-guides', ja: './ai-guides を読む' },
		desc: { en: 'My daily material. Prompts, workflows, and notes.', ja: '毎日の素材。プロンプト、ワークフロー、メモ。' } },
	{ id: 'typescript', kind: 'tag', cat: 'tools', label: 'TypeScript', href: 'https://www.typescriptlang.org/', external: true, cta: { en: 'typescriptlang.org', ja: 'typescriptlang.org' },
		desc: { en: 'The language most of my tools are written in.', ja: '私の道具の多くを書いている言語。' } },
	{ id: 'svelte', kind: 'tag', cat: 'tools', label: 'Svelte', href: 'https://svelte.dev/', external: true, cta: { en: 'svelte.dev', ja: 'svelte.dev' },
		desc: { en: 'The framework I build interactive parts with.', ja: '動く部分をつくるフレームワーク。' } },

	{ id: 'tokyo-ny', kind: 'tag', cat: 'places', label: 'Tokyo · NY', desc: { en: 'Two home cities, two ways of seeing.', ja: 'ふたつの拠点、ふたつの見方。' } },
	{ id: 'seal', kind: 'seal', cat: 'places', label: '浩', avatar: '/hiro-avatar.png', name: 'Hiroyuki (Hiro) Kuwana', nameJa: '桑名浩行', href: '/about',
		cta: { en: 'About me', ja: '私について' }, desc: { en: 'Yep, that’s me.', ja: 'はい、私です。' } }
];
```

- [ ] **Step 4: Implement** `src/lib/home/facets.ts`

```ts
import { PERSONAL } from '$data/constants';
import type { L10n, PaletteKey } from './desk-items';

export type Facet = {
	id: 'builder' | 'writer' | 'bridge' | 'nature';
	kanji: string;
	color: PaletteKey;
	title: L10n;
	line: L10n;
	link: { href: string; external?: boolean; label: L10n };
};

// Order = sail order. Sail 0 points up at angle 0.
export const FACETS: Facet[] = [
	{ id: 'builder', kanji: '作', color: 'ebicha', title: { en: 'Builder', ja: 'つくる' },
		line: { en: 'I build AI tools that feel like tools, not like chatbots.', ja: 'チャットボットではなく、道具として手になじむ AI をつくっています。' },
		link: { href: '#work', label: { en: 'See the projects →', ja: 'プロジェクトを見る →' } } },
	{ id: 'writer', kanji: '書', color: 'kon', title: { en: 'Writer', ja: '書く' },
		line: { en: 'Slow essays and practical AI notes, one notebook each.', ja: 'じっくり書く随筆と、実践的な AI のメモ。ノートは一冊ずつ。' },
		link: { href: '#writing', label: { en: 'Read the writing →', ja: '文章を読む →' } } },
	{ id: 'bridge', kanji: '橋', color: 'gold', title: { en: 'Bridge', ja: '橋渡し' },
		line: { en: 'Tokyo and New York. Japanese and American. I build between languages.', ja: '東京とニューヨーク。日本とアメリカ。言葉のあいだで、ものをつくっています。' },
		link: { href: PERSONAL.companyWebsite, external: true, label: { en: 'About Kaiwa →', ja: 'Kaiwa について →' } } },
	{ id: 'nature', kanji: '然', color: 'moss', title: { en: 'Nature', ja: '自然' },
		line: { en: '自然: things as they are, of themselves. I want my tools to feel the same: calm, grown, never loud.', ja: '自然、おのずからそうであること。道具もそうありたい。静かで、育ったように、うるさくない。' },
		link: { href: '/about', label: { en: 'About me →', ja: '私について →' } } }
];
```

- [ ] **Step 5: Implement** `src/lib/home/desk-layout.ts`

```ts
import { SHELVES, type ShelfId } from './desk-items';

export const DESK = { W: 840, H: 440, LEDGE_Y: 400, LABEL_W: 138, ROW0: 80, ROW_H: 64, GAP: 8 } as const;

export const plankY = (row: number) => DESK.ROW0 + row * DESK.ROW_H;

// Tag body: 44 px of padding/notch, plus 26 px for a logo badge.
export const tagWidth = (textWidth: number, subWidth: number, hasLogo: boolean) =>
	Math.max(64, Math.max(textWidth, subWidth) + 44 + (hasLogo ? 26 : 0));

export function layoutShelves(items: { id: string; cat: ShelfId; w: number; h: number }[]) {
	const out = new Map<string, { x: number; y: number }>();
	SHELVES.forEach((shelf, row) => {
		let x = DESK.LABEL_W;
		for (const it of items.filter((i) => i.cat === shelf.id)) {
			out.set(it.id, { x: x + it.w / 2, y: plankY(row) - it.h / 2 - 1 });
			x += it.w + DESK.GAP;
		}
	});
	return out;
}

export const isClick = (down: { x: number; y: number; t: number }, up: { x: number; y: number; t: number }) =>
	Math.hypot(up.x - down.x, up.y - down.y) < 6 && up.t - down.t < 350;

export type DeskMode = 'loose' | 'organized';
export const nextDeskMode = (m: DeskMode): DeskMode => (m === 'loose' ? 'organized' : 'loose');
```

- [ ] **Step 6: Run tests**

Run: `pnpm test`
Expected: layout tests pass. The asset-exists test FAILS for logos, portraits, and `/hiro-avatar.png` (Task 4 adds them). All other data tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/lib/home/facets.ts src/lib/home/desk-items.ts src/lib/home/desk-layout.ts tests/unit/desk-*.test.ts
git commit -m "feat(desk): facets, desk items, shelf layout with tests"
```

---

### Task 4: Assets (logos, portraits, avatar)

**Files:**
- Create: `scripts/fetch-portraits.mjs`, `static/logos/exonians-e.svg`, `static/logos/reddit.svg`, `static/portraits/*.jpg`, `static/portraits/credits.json`, `static/hiro-avatar.png`
- Modify: `src/lib/home/desk-items.ts` (only if a portrait is not free, see Step 3)

**Interfaces:**
- Produces: files referenced by `DESK_ITEMS`.

- [ ] **Step 1: Logos and avatar**

```bash
mkdir -p static/logos static/portraits
curl -sL https://exoniansjapan.com/favicon.svg -o static/logos/exonians-e.svg
curl -sL https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/reddit.svg -o static/logos/reddit.svg
sed -i '' 's/<path /<path fill="#FF4500" /' static/logos/reddit.svg
cp src/lib/images/Hiro_profile_shot.png static/hiro-avatar.png
```

- [ ] **Step 2: Create** `scripts/fetch-portraits.mjs`

```js
// One-off: download author portraits from Wikipedia with their licenses.
// Non-free images (fair use) are skipped; the card then shows a monogram.
import { mkdir, writeFile } from 'node:fs/promises';

const AUTHORS = { mishima: 'Yukio_Mishima', bulgakov: 'Mikhail_Bulgakov', dostoevsky: 'Fyodor_Dostoevsky', chekhov: 'Anton_Chekhov', hemingway: 'Ernest_Hemingway' };
const UA = { 'User-Agent': 'hiro-personal-site/1.0 (hiro@trykaiwa.com)' };
const credits = {};
await mkdir('static/portraits', { recursive: true });

for (const [id, title] of Object.entries(AUTHORS)) {
	const summary = await (await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`, { headers: UA })).json();
	const file = decodeURIComponent(summary.originalimage.source.split('/').pop());
	const info = await (await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=extmetadata|url&iiurlwidth=240&titles=File:${encodeURIComponent(file)}`, { headers: UA })).json();
	const page = Object.values(info.query.pages)[0];
	const ii = page.imageinfo[0];
	const license = ii.extmetadata.LicenseShortName?.value ?? 'unknown';
	const free = !/fair use|non-free/i.test(license) && ii.extmetadata.NonFree?.value !== 'true';
	credits[id] = { file, license, free, artist: ii.extmetadata.Artist?.value?.replace(/<[^>]+>/g, '') ?? '', source: ii.descriptionurl };
	if (free) {
		const img = await fetch(ii.thumburl, { headers: UA });
		await writeFile(`static/portraits/${id}.jpg`, Buffer.from(await img.arrayBuffer()));
	}
	console.log(id, license, free ? 'saved' : 'SKIPPED (non-free)');
}
await writeFile('static/portraits/credits.json', JSON.stringify(credits, null, 2) + '\n');
```

- [ ] **Step 3: Run it and handle non-free images**

Run: `node scripts/fetch-portraits.mjs`
Expected: one line per author. For every author marked `SKIPPED (non-free)`, delete the `portrait` field of that author in `src/lib/home/desk-items.ts` (keep `wiki` and `descriptor`). The card then shows a monogram (Task 7).

- [ ] **Step 4: Add a license test** to `tests/unit/desk-data.test.ts`

```ts
import credits from '../../static/portraits/credits.json';

test('only free-license portraits are referenced', () => {
	for (const i of DESK_ITEMS) {
		if (!i.author?.portrait) continue;
		expect((credits as Record<string, { free: boolean }>)[i.id]?.free, i.id).toBe(true);
	}
});
```

- [ ] **Step 5: Run tests**

Run: `pnpm test`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add scripts/fetch-portraits.mjs static/logos static/portraits static/hiro-avatar.png src/lib/home/desk-items.ts tests/unit/desk-data.test.ts
git commit -m "feat(desk): logos, free-license author portraits with credits, avatar"
```

---

### Task 5: Visual system — tokens, flat style, frames, standards mode

**Files:**
- Modify: `src/style.css`
- Delete: `src/middleware.ts`
- Create: `src/lib/home/palette.ts`, `tests/unit/style.test.ts`

**Interfaces:**
- Produces: CSS tokens from Global Constraints; classes `.frame-deco`, `.asanoha-break`, `.sr-only`; `readPalette(): Palette` and `type Palette = Record<PaletteKey, string>`.

- [ ] **Step 1: Write the failing style test** `tests/unit/style.test.ts`

```ts
import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

const css = readFileSync('src/style.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

test('palette tokens', () => {
	for (const [k, v] of Object.entries({ '--paper': '#eeebdd', '--ink': '#1e1a16', '--moss-green': '#5e6b45', '--moss-light': '#a3ad86', '--ebicha': '#6e2f2a', '--kon': '#233a5e', '--gold': '#a8894a', '--wood': '#8a6a45' })) {
		expect(css.toLowerCase()).toContain(`${k}: ${v}`);
	}
});
test('accent is ebicha', () => expect(css).toMatch(/--color-accent:\s*var\(--ebicha\)/));
test('flat: no box-shadow and no gradient fills', () => {
	expect(css).not.toMatch(/box-shadow:\s*(?!none)/);
	expect(css).not.toMatch(/(linear|radial)-gradient\(/);
});
test('frame and helpers exist', () => {
	for (const sel of ['.frame-deco', '.asanoha-break', '.sr-only']) expect(css).toContain(sel);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `pnpm test tests/unit/style.test.ts`
Expected: FAIL on tokens, accent, and flat.

- [ ] **Step 3: Replace the `:root` color block** in `src/style.css` (lines 1–16, the color variables only; keep fonts, spacing, easing):

```css
:root {
	--paper: #eeebdd;
	--paper-2: #e4dfcb;
	--paper-edge: #d6cfb6;
	--moss: #dde2c9;
	--ink: #1e1a16;
	--ink-soft: #3a352d;
	--ink-mute: #6f6a5c;
	--rule: #cfc7aa;
	--moss-green: #5e6b45;
	--moss-light: #a3ad86;
	--ebicha: #6e2f2a;
	--kon: #233a5e;
	--gold: #a8894a;
	--wood: #8a6a45;
	--shu: var(--ebicha);
	--highlight: #d9dcbf;
	--status-active: var(--moss-green);
	--status-shipped: var(--ebicha);
	--status-sunset: #8a7f68;
```

Then set `--color-accent: var(--ebicha);` and delete the `--shadow-md` and `--shadow-lg` lines. Run `grep -rn "shadow-md\|shadow-lg" src` and delete every `box-shadow: var(--shadow-…)` declaration it finds.

- [ ] **Step 4: Replace the `[data-theme='dark']` color variables**

```css
[data-theme='dark'] {
	--paper: #14161c;
	--paper-2: #1b1e26;
	--paper-edge: #262a34;
	--moss: #1c2119;
	--ink: #ece6d4;
	--ink-soft: #cfc7b0;
	--ink-mute: #8e8774;
	--rule: #2e3240;
	--moss-green: #8c9a6c;
	--moss-light: #56603f;
	--ebicha: #b8665e;
	--kon: #7f9cc9;
	--gold: #c9a865;
	--wood: #5c4630;
	--highlight: #3a3f2c;
```

(keep the existing `--p`, `--s`, `--a`, `--b*`, `--bc` lines below it unchanged)

- [ ] **Step 5: Remove gradients and shadows** (each item is one edit)

| Where (search) | Replace with |
|---|---|
| `.nav { … background: linear-gradient(…)` | `background: var(--paper); border-bottom: 1px solid var(--gold);` |
| `.hero-content { … background: radial-gradient(…)` | delete the `background` declaration |
| `.hero-side { … background: radial-gradient(…)` | delete the `background` declaration |
| `.hero-side p strong { … background: linear-gradient(…)` | `background: var(--highlight);` |
| `.sec-head::after`-style rule with `linear-gradient(to right, …)` (≈ line 614) | `background: var(--gold);` |
| `repeating-linear-gradient(135deg …)` in `.scrap-piece .thumb` | `background: var(--paper-2);` |
| mobile `.nav` `linear-gradient` inside `@media (max-width: 760px)` | `background: var(--paper);` |
| `.scrap-piece .frame` `box-shadow` (light + dark) | delete |
| `.contact-tab.is-active` `box-shadow` | `border-bottom: 2px solid var(--ebicha);` |
| `.thanks-stamp` `transform: rotate(-4deg); box-shadow: …` | delete both lines |
| `@keyframes pulseDot` box-shadow frames | replace the keyframes body with `0%,100% { opacity: 1 } 50% { opacity: 0.4 }` |
| `.scrap-piece:hover { transform: rotate(0deg) translateY(-4px) !important; …}` | `transform: translateY(-4px) !important;` |

Also change `ProjectsBoard`'s inline `transform:rotate(...)` by setting every `pos.rotate` in `PIECES` (`src/lib/home/content.ts`) to `0`.

- [ ] **Step 6: Append the ornament and helper classes** to the end of `src/style.css`

```css
/* Taishō hairline frame: gold double rule with corner brackets. */
.frame-deco {
	position: relative;
	border: 1px solid var(--gold);
	outline: 1px solid var(--gold);
	outline-offset: 4px;
	padding: clamp(1.25rem, 4vw, 2.5rem);
	margin: 5px;
}
.frame-deco::before,
.frame-deco::after {
	content: '';
	position: absolute;
	width: 18px;
	height: 18px;
	border: 1px solid var(--gold);
	pointer-events: none;
}
.frame-deco::before { top: 8px; left: 8px; border-right: 0; border-bottom: 0; }
.frame-deco::after { bottom: 8px; right: 8px; border-left: 0; border-top: 0; }

/* Faint asanoha (hemp leaf) band between sections. */
.asanoha-break {
	height: 48px;
	margin: 0 auto;
	max-width: var(--max);
	opacity: 0.08;
	background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='28' viewBox='0 0 48 28'><g fill='none' stroke='%231e1a16' stroke-width='1'><path d='M24 0v28M0 14h48M0 0l48 28M48 0L0 28M12 0l12 14 12-14M12 28l12-14 12 14'/></g></svg>");
}
[data-theme='dark'] .asanoha-break { filter: invert(1); }

.sr-only {
	position: absolute;
	width: 1px;
	height: 1px;
	overflow: hidden;
	clip-path: inset(50%);
	white-space: nowrap;
}
.sr-only:focus-within {
	position: static;
	width: auto;
	height: auto;
	clip-path: none;
	white-space: normal;
}

/* Ink-stroke underline (Fancy Components idea, CSS only). */
.ink-link {
	background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='6' viewBox='0 0 120 6'><path d='M1 4 C30 1 60 6 119 2' stroke='%236e2f2a' stroke-width='2' fill='none' stroke-linecap='round'/></svg>");
	background-repeat: no-repeat;
	background-position: 0 100%;
	background-size: 0% 6px;
	transition: background-size var(--duration-slow) var(--ease-out-quart);
	padding-bottom: 4px;
}
.ink-link:hover,
.ink-link:focus-visible { background-size: 100% 6px; }
```

- [ ] **Step 7: Create** `src/lib/home/palette.ts`

```ts
import type { PaletteKey } from './desk-items';

export type Palette = Record<PaletteKey, string>;

const VARS: Record<PaletteKey, string> = {
	paper: '--paper', paper2: '--paper-2', ink: '--ink', inkMute: '--ink-mute', moss: '--moss-green',
	mossLight: '--moss-light', ebicha: '--ebicha', kon: '--kon', gold: '--gold', wood: '--wood'
};

// Read live tokens, so canvases follow the light/dark theme.
export function readPalette(el: Element = document.documentElement): Palette {
	const cs = getComputedStyle(el);
	return Object.fromEntries(
		Object.entries(VARS).map(([k, v]) => [k, cs.getPropertyValue(v).trim()])
	) as Palette;
}

export function onThemeChange(cb: () => void): () => void {
	const mo = new MutationObserver(cb);
	mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
	return () => mo.disconnect();
}
```

- [ ] **Step 8: Switch to standards mode**

```bash
git rm src/middleware.ts
```

Then build and open every page in light and dark at 1280 px and 390 px width (`pnpm build && pnpm preview`, URLs: `/`, `/about`, `/essays`, `/essays/on-building-for-decades`, `/ai-guides`, `/case-study`, `/corporate`, `/ja/`). For each layout shift, apply the matching standards-mode fix:

| Symptom | Fix in `src/style.css` |
|---|---|
| Section or hero shorter than before (`height: 100%` collapses) | `html, body { height: 100%; }` and use `min-height: 100dvh` on `.hero` |
| Small gap under images/icons | `img, svg, canvas { vertical-align: middle; }` |
| Table text larger than body | `table { font-size: inherit; }` |
| Extra space in flex rows with inline-block children | `line-height: 1` on that container |

- [ ] **Step 9: Run tests and build**

Run: `pnpm test && pnpm build`
Expected: all tests pass, build completes.

- [ ] **Step 10: Commit**

```bash
git add -A src/style.css src/lib/home/palette.ts src/lib/home/content.ts tests/unit/style.test.ts
git commit -m "feat(style): Taishō palette, flat print style, hairline frames, standards mode"
```

---

### Task 6: Windmill island

**Files:**
- Create: `src/lib/home/windmill-scene.ts`, `src/lib/components/home/Windmill.svelte`
- Modify: `src/lib/home/content.ts` (add `mill.*` copy)

**Interfaces:**
- Consumes: Task 2 model, `FACETS`, `readPalette`, `onThemeChange`, `Palette`.
- Produces: `<Windmill lang={Locale} copy={Record<string,string>} />`; scene exports `createWind(): WindState`, `stepWind(w: WindState, speed: number, turn: number): void`, `drawMill(ctx, p: Palette, s: MillFrame): void`, with `type MillFrame = { angle: number; sunPhase: number; top: number; wind: WindState }`.

- [ ] **Step 1: Add copy** to `COPY.en` / `COPY.ja` in `src/lib/home/content.ts`

```ts
// en
'mill.label': '風車 · each sail is one part of me',
'mill.hint': 'Click the windmill to spin it, or drag and flick a sail. The sail that stops at the top chooses the panel.',
'mill.canvas': 'Windmill. Press Enter to spin, or use the arrow keys to choose a sail.',
// ja
'mill.label': '風車 · 羽根の一枚一枚が、私の一部',
'mill.hint': '風車をクリックすると回ります。羽根をドラッグして弾いても回せます。上で止まった羽根がパネルを選びます。',
'mill.canvas': '風車。Enter で回り、矢印キーで羽根を選べます。',
```

- [ ] **Step 2: Create** `src/lib/home/windmill-scene.ts` — drawing ported from the prototype (`docs/superpowers/prototypes/taisho-prototype.html`, functions `drawSun`, `drawWind`, `drawScene`, `drawBlade`)

```ts
import { FACETS } from './facets';
import type { Palette } from './palette';
import { MILL, QUARTER, stepWindDir, sunPosition } from './windmill-model';

type Gust = { kind: 'streak' | 'leaf'; x: number; y: number; len: number; curl: boolean; rot: number; life: number; leafColor: 'moss' | 'gold' };
export type WindState = { dir: number; acc: number; gusts: Gust[] };
export type MillFrame = { angle: number; sunPhase: number; top: number; wind: WindState };

export const createWind = (): WindState => ({ dir: 1, acc: 0, gusts: [] });

export function stepWind(w: WindState, speed: number, turn: number) {
	w.dir = stepWindDir(w.dir, turn);
	w.acc += 0.012 + speed * 0.6;
	const edge = w.dir >= 0 ? -120 : MILL.W + 120;
	while (w.acc > 1) {
		w.acc -= 1;
		const leaf = Math.random() >= 0.8;
		w.gusts.push({ kind: leaf ? 'leaf' : 'streak', x: edge, y: (leaf ? 80 : 60) + Math.random() * (leaf ? 320 : 360),
			len: 70 + Math.random() * 90, curl: Math.random() < 0.6, rot: Math.random() * 6, life: 0, leafColor: Math.random() < 0.5 ? 'moss' : 'gold' });
	}
	const v = (1.4 + speed * 60) * w.dir;
	const dir = w.dir >= 0 ? 1 : -1;
	w.gusts = w.gusts.filter((g) => {
		g.x += v * (g.kind === 'leaf' ? 0.8 : 1);
		g.life += 1;
		if (g.kind === 'leaf') { g.rot += (0.05 + speed) * dir; g.y += Math.sin(g.life / 14) * 0.6; }
		return g.x <= MILL.W + 160 && g.x >= -160;
	});
}

const mixHex = (a: string, b: string, t: number) => {
	const pa = a.match(/\w\w/g)!.map((h) => parseInt(h, 16));
	const pb = b.match(/\w\w/g)!.map((h) => parseInt(h, 16));
	return `rgb(${pa.map((v, k) => Math.round(v + (pb[k] - v) * t)).join(',')})`;
};

function drawSun(ctx: CanvasRenderingContext2D, p: Palette, f: MillFrame) {
	const { x, y, low } = sunPosition(f.sunPhase);
	ctx.fillStyle = mixHex(p.paper2, '#d9a77f', low);
	ctx.beginPath(); ctx.arc(x, y, 56, 0, Math.PI * 2); ctx.fill();
	ctx.strokeStyle = mixHex(p.paper2, '#c48a63', Math.min(1, low + 0.2));
	ctx.lineWidth = 2;
	for (let k = 0; k < 12; k++) {
		const a = f.angle * 0.5 + (k * Math.PI) / 6;
		ctx.beginPath();
		ctx.moveTo(x + Math.cos(a) * 66, y + Math.sin(a) * 66);
		ctx.lineTo(x + Math.cos(a) * 80, y + Math.sin(a) * 80);
		ctx.stroke();
	}
}

function drawWind(ctx: CanvasRenderingContext2D, p: Palette, w: WindState) {
	const dir = w.dir >= 0 ? 1 : -1;
	for (const g of w.gusts) {
		const fade = Math.min(1, g.life / 30);
		if (g.kind === 'streak') {
			const head = g.x + dir * g.len;
			ctx.strokeStyle = p.ink; ctx.globalAlpha = 0.28 * fade; ctx.lineWidth = 1.2;
			ctx.beginPath();
			ctx.moveTo(g.x, g.y);
			ctx.bezierCurveTo(g.x + dir * g.len * 0.3, g.y - 6, g.x + dir * g.len * 0.6, g.y + 6, head, g.y);
			if (g.curl) {
				if (dir > 0) ctx.arc(head, g.y - 9, 9, Math.PI / 2, -Math.PI * 0.9, true);
				else ctx.arc(head, g.y - 9, 9, Math.PI / 2, -Math.PI * 0.1, false);
			}
			ctx.stroke();
		} else {
			ctx.save(); ctx.translate(g.x, g.y); ctx.rotate(g.rot);
			ctx.globalAlpha = 0.85 * fade; ctx.fillStyle = p[g.leafColor];
			ctx.beginPath(); ctx.ellipse(0, 0, 7, 3.5, 0, 0, Math.PI * 2); ctx.fill();
			ctx.restore();
		}
		ctx.globalAlpha = 1;
	}
}

function drawLand(ctx: CanvasRenderingContext2D, p: Palette) {
	const { W, H, HUB } = MILL;
	ctx.fillStyle = p.mossLight;
	ctx.beginPath(); ctx.moveTo(0, 450); ctx.quadraticCurveTo(W * 0.3, 380, W * 0.65, 440); ctx.quadraticCurveTo(W * 0.85, 470, W, 420); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
	ctx.fillStyle = p.moss;
	ctx.beginPath(); ctx.moveTo(0, 490); ctx.quadraticCurveTo(W * 0.5, 440, W, 500); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
	ctx.fillStyle = p.paper; ctx.strokeStyle = p.ink; ctx.lineWidth = 1.5;
	ctx.beginPath(); ctx.moveTo(HUB.x - 34, 240); ctx.lineTo(HUB.x + 34, 240); ctx.lineTo(HUB.x + 62, 470); ctx.lineTo(HUB.x - 62, 470); ctx.closePath(); ctx.fill(); ctx.stroke();
	for (let y = 270; y < 470; y += 28) {
		const half = 34 + 28 * ((y - 240) / 230);
		ctx.beginPath(); ctx.moveTo(HUB.x - half, y); ctx.lineTo(HUB.x + half, y); ctx.stroke();
	}
	ctx.fillStyle = p.ebicha;
	ctx.beginPath(); ctx.moveTo(HUB.x - 44, 244); ctx.quadraticCurveTo(HUB.x, 168, HUB.x + 44, 244); ctx.closePath(); ctx.fill(); ctx.stroke();
	ctx.fillStyle = p.kon;
	ctx.beginPath(); ctx.moveTo(HUB.x - 14, 470); ctx.lineTo(HUB.x - 14, 430); ctx.arc(HUB.x, 430, 14, Math.PI, 0); ctx.lineTo(HUB.x + 14, 470); ctx.fill();
}

function drawBlade(ctx: CanvasRenderingContext2D, p: Palette, i: number, f: MillFrame) {
	const { BLADE_W, BLADE_LEN, BLADE_OFF } = MILL;
	const facet = FACETS[i];
	const x0 = -BLADE_W / 2, y0 = -(BLADE_OFF + BLADE_LEN);
	ctx.strokeStyle = p.ink; ctx.lineWidth = 3;
	ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, y0 - 6); ctx.stroke();
	ctx.fillStyle = p[facet.color];
	ctx.beginPath(); ctx.moveTo(0, -BLADE_OFF); ctx.lineTo(x0, y0); ctx.lineTo(0, y0); ctx.closePath(); ctx.fill();
	ctx.globalAlpha = 0.72;
	ctx.beginPath(); ctx.moveTo(0, -BLADE_OFF); ctx.lineTo(0, y0); ctx.lineTo(-x0, y0 + 26); ctx.closePath(); ctx.fill();
	ctx.globalAlpha = 1;
	ctx.lineWidth = 1;
	ctx.strokeRect(x0, y0, BLADE_W, BLADE_LEN);
	for (let y = y0 + 22; y < -BLADE_OFF; y += 22) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(-x0, y); ctx.stroke(); }
	ctx.save();
	ctx.translate(0, y0 + 40);
	ctx.rotate(-(f.angle + i * QUARTER)); // kanji stays upright
	ctx.fillStyle = p.paper;
	ctx.beginPath(); ctx.arc(0, 0, 17, 0, Math.PI * 2); ctx.fill();
	ctx.strokeStyle = i === f.top ? p.ebicha : p.ink; ctx.lineWidth = i === f.top ? 2 : 1; ctx.stroke();
	ctx.fillStyle = p.ink;
	ctx.font = '600 20px "Shippori Mincho", serif';
	ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
	ctx.fillText(facet.kanji, 0, 1);
	ctx.restore();
}

export function drawMill(ctx: CanvasRenderingContext2D, p: Palette, f: MillFrame) {
	ctx.clearRect(0, 0, MILL.W, MILL.H);
	drawSun(ctx, p, f);
	drawWind(ctx, p, f.wind);
	drawLand(ctx, p);
	ctx.save();
	ctx.translate(MILL.HUB.x, MILL.HUB.y);
	ctx.rotate(f.angle);
	for (let i = 0; i < FACETS.length; i++) { ctx.save(); ctx.rotate(i * QUARTER); drawBlade(ctx, p, i, f); ctx.restore(); }
	ctx.restore();
	ctx.fillStyle = p.gold; ctx.strokeStyle = p.ink; ctx.lineWidth = 1.5;
	ctx.beginPath(); ctx.arc(MILL.HUB.x, MILL.HUB.y, 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
}
```

- [ ] **Step 3: Create** `src/lib/components/home/Windmill.svelte`

```svelte
<script lang="ts">
	// 風車 hero island. SSR renders the buttons and the first panel (works with
	// no JS). On mount, matter-js integrates the rotor and gsap animates the panel.
	import { onMount } from 'svelte';
	import type { Locale } from '$lib/home/content';
	import { FACETS } from '$lib/home/facets';
	import { onThemeChange, readPalette, type Palette } from '$lib/home/palette';
	import { createWind, drawMill, stepWind } from '$lib/home/windmill-scene';
	import * as M from '$lib/home/windmill-model';

	let { lang, copy }: { lang: Locale; copy: Record<string, string> } = $props();
	const t = (k: string) => copy[k] ?? k;

	let canvasEl: HTMLCanvasElement;
	let panelEl: HTMLDivElement;
	let active = $state(0);
	let choose = $state<(i: number) => void>(() => {});
	let animatePanel: (() => void) | null = null;

	$effect(() => {
		active; // re-run when the facet changes
		animatePanel?.();
	});

	onMount(() => {
		let stopped = false;
		let cleanup = () => {};
		(async () => {
			const [{ default: Matter }, { gsap }] = await Promise.all([import('matter-js'), import('gsap')]);
			if (stopped) return;
			const { Engine, Bodies, Body, Composite } = Matter;
			const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
			const dpr = window.devicePixelRatio || 1;
			canvasEl.width = M.MILL.W * dpr;
			canvasEl.height = M.MILL.H * dpr;
			const ctx = canvasEl.getContext('2d')!;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			let palette: Palette = readPalette();
			const stopTheme = onThemeChange(() => (palette = readPalette()));

			const engine = Engine.create({ gravity: { x: 0, y: 0 } });
			const rotor = Bodies.circle(M.MILL.HUB.x, M.MILL.HUB.y, M.MILL.REACH, { frictionAir: 0.016, collisionFilter: { mask: 0 } });
			Composite.add(engine.world, rotor);

			let target: number | null = null;
			let grabbing = false;
			let userTookOver = false;
			let paused = false;
			let lastGust = performance.now();
			const takeOver = () => { userTookOver = true; target = null; };
			choose = (i: number) => {
				takeOver();
				target = M.angleForSail(i, rotor.angle);
				if (reduce) { Body.setAngle(rotor, target); Body.setAngularVelocity(rotor, 0); }
			};
			animatePanel = () => {
				if (!reduce && panelEl) gsap.from(panelEl.children, { y: 10, opacity: 0, duration: 0.45, stagger: 0.05, ease: 'power2.out' });
			};

			// pointer: drag, flick, click to spin
			const local = (e: PointerEvent) => {
				const r = canvasEl.getBoundingClientRect();
				return { x: ((e.clientX - r.left) / r.width) * M.MILL.W, y: ((e.clientY - r.top) / r.height) * M.MILL.H };
			};
			let lastA = 0, lastT = 0, moved = 0, vel = 0, downX = 0;
			const onDown = (e: PointerEvent) => {
				const p = local(e);
				if (!M.onRotor(p)) return;
				e.preventDefault();
				takeOver();
				grabbing = true;
				canvasEl.setPointerCapture(e.pointerId);
				lastA = Math.atan2(p.y - M.MILL.HUB.y, p.x - M.MILL.HUB.x);
				lastT = performance.now(); moved = 0; vel = 0; downX = p.x;
				Body.setAngularVelocity(rotor, 0);
			};
			const onMove = (e: PointerEvent) => {
				const p = local(e);
				canvasEl.style.cursor = grabbing ? 'grabbing' : M.onRotor(p) ? 'grab' : 'default';
				if (!grabbing) return;
				const a = Math.atan2(p.y - M.MILL.HUB.y, p.x - M.MILL.HUB.x);
				let d = a - lastA;
				if (d > Math.PI) d -= 2 * Math.PI;
				if (d < -Math.PI) d += 2 * Math.PI;
				const now = performance.now();
				vel = vel * 0.5 + (d / (Math.max(1, now - lastT) / (1000 / 60))) * 0.5;
				Body.setAngle(rotor, rotor.angle + d);
				moved += Math.abs(d);
				lastA = a; lastT = now;
			};
			const onUp = () => {
				if (!grabbing) return;
				grabbing = false;
				Body.setAngularVelocity(rotor, moved < 0.04 ? M.clickSpin(downX, M.MILL.HUB.x) : M.clampFlick(vel));
			};
			const onKey = (e: KeyboardEvent) => {
				if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); takeOver(); Body.setAngularVelocity(rotor, 0.32); }
				if (e.key === 'ArrowRight') { e.preventDefault(); choose((M.topIndex(rotor.angle) + 3) % 4); }
				if (e.key === 'ArrowLeft') { e.preventDefault(); choose((M.topIndex(rotor.angle) + 1) % 4); }
			};
			const pause = () => (paused = true);
			const resume = () => (paused = false);
			canvasEl.addEventListener('pointerdown', onDown);
			canvasEl.addEventListener('pointermove', onMove);
			canvasEl.addEventListener('pointerup', onUp);
			canvasEl.addEventListener('pointercancel', onUp);
			canvasEl.addEventListener('pointerenter', pause);
			canvasEl.addEventListener('pointerleave', resume);
			canvasEl.addEventListener('keydown', onKey);
			panelEl.parentElement!.addEventListener('pointerenter', pause);
			panelEl.parentElement!.addEventListener('pointerleave', resume);

			// loop: runs only while visible and the tab is shown
			const wind = createWind();
			let sunPhase = 0.78;
			let prevAngle = rotor.angle;
			let raf = 0;
			let last = performance.now();
			let visible = true;
			const frame = (now: number) => {
				const dt = M.clampDelta(now - last);
				last = now;
				Body.setPosition(rotor, M.MILL.HUB);
				Body.setVelocity(rotor, { x: 0, y: 0 });
				if (!grabbing) {
					if (M.shouldGust({ now, lastGust, userTookOver, paused, reduceMotion: reduce })) {
						target = M.nearestSnap(rotor.angle) + M.QUARTER;
						lastGust = now;
					}
					if (target === null && Math.abs(rotor.angularVelocity) < M.SETTLE_SPEED) target = M.nearestSnap(rotor.angle);
					if (target !== null) Body.setAngularVelocity(rotor, M.springVelocity(rotor.angularVelocity, rotor.angle, target));
				}
				Engine.update(engine, dt);
				const turn = rotor.angle - prevAngle;
				prevAngle = rotor.angle;
				sunPhase = M.stepSunPhase(sunPhase, turn);
				if (!reduce) stepWind(wind, Math.min(0.5, Math.abs(turn)), turn);
				const top = M.topIndex(rotor.angle);
				if (top !== active) active = top;
				drawMill(ctx, palette, { angle: rotor.angle, sunPhase, top, wind });
				raf = requestAnimationFrame(frame);
			};
			const start = () => { if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };
			const stop = () => { cancelAnimationFrame(raf); raf = 0; };
			const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); });
			io.observe(canvasEl);
			const onVis = () => (document.hidden ? stop() : start());
			document.addEventListener('visibilitychange', onVis);
			if (!reduce) Body.setAngularVelocity(rotor, 0.12);
			start();

			cleanup = () => {
				stop(); io.disconnect(); stopTheme();
				document.removeEventListener('visibilitychange', onVis);
				canvasEl.removeEventListener('pointerdown', onDown);
				canvasEl.removeEventListener('pointermove', onMove);
				canvasEl.removeEventListener('pointerup', onUp);
				canvasEl.removeEventListener('pointercancel', onUp);
				canvasEl.removeEventListener('keydown', onKey);
				Engine.clear(engine);
			};
		})();
		return () => { stopped = true; cleanup(); };
	});

	const facet = $derived(FACETS[active]);
</script>

<div class="mill">
	<canvas bind:this={canvasEl} class="mill-canvas" tabindex="0" aria-label={t('mill.canvas')}></canvas>
	<div class="mill-side">
		<div class="mill-tabs" role="group" aria-label={t('mill.label')}>
			{#each FACETS as f, i}
				<button type="button" aria-pressed={i === active} onclick={() => { active = i; choose(i); }}>
					<span class="k">{f.kanji}</span> {f.title[lang]}
				</button>
			{/each}
		</div>
		<div class="mill-panel" bind:this={panelEl} aria-live="polite">
			<div class="kanji" style={`color: var(--${facet.color === 'moss' ? 'moss-green' : facet.color})`}>{facet.kanji}</div>
			<h3>{facet.title[lang]}</h3>
			<p>{facet.line[lang]}</p>
			<a class="ink-link" href={facet.link.href} target={facet.link.external ? '_blank' : undefined} rel={facet.link.external ? 'noopener' : undefined}>{facet.link.label[lang]}</a>
		</div>
		<p class="mill-hint">{t('mill.hint')}</p>
	</div>
</div>
```

- [ ] **Step 4: Add island styles** to `src/style.css`

```css
.mill { display: grid; gap: 1.5rem; }
.mill-canvas { width: 100%; max-width: 560px; aspect-ratio: 560 / 540; touch-action: pan-y; }
.mill-tabs { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.mill-tabs button { border: 1px solid var(--ink); background: transparent; padding: 0.3rem 0.9rem; cursor: pointer; font-size: 0.95rem; }
.mill-tabs button[aria-pressed='true'] { background: var(--ink); color: var(--paper); }
.mill-panel { border-left: 3px solid var(--ebicha); padding-left: 1.25rem; min-height: 12rem; margin-top: 1.25rem; }
.mill-panel .kanji { font-family: var(--f-jp); font-size: 3.5rem; line-height: 1; }
.mill-panel h3 { font-family: var(--f-display); font-size: 1.5rem; margin: 0.5rem 0 0.25rem; }
.mill-panel p { margin: 0 0 0.75rem; max-width: 36ch; }
.mill-panel a { color: var(--kon); }
.mill-hint { font-size: 0.9rem; font-style: italic; color: var(--ink-mute); }
```

- [ ] **Step 5: Type-check**

Run: `pnpm check`
Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/home/windmill-scene.ts src/lib/components/home/Windmill.svelte src/lib/home/content.ts src/style.css
git commit -m "feat(windmill): 風車 hero island with matter.js spin, sun, and wind"
```

(Browser verification of this island happens in Task 8, after it is mounted.)

---

### Task 7: Craftsman's desk island

**Files:**
- Create: `src/lib/home/desk-scene.ts`, `src/lib/components/home/CraftDesk.svelte`
- Modify: `src/lib/home/content.ts` (add `desk.*` copy), `src/style.css`

**Interfaces:**
- Consumes: `DESK`, `layoutShelves`, `plankY`, `tagWidth`, `isClick`, `nextDeskMode`, `DeskMode`, `DESK_ITEMS`, `SHELVES`, `DeskItem`, `readPalette`, `onThemeChange`, `M.clampDelta`.
- Produces: `<CraftDesk lang={Locale} copy={Record<string,string>} />`; scene exports `drawDesk(ctx, p: Palette, s: { items: DrawnItem[]; mode: DeskMode; lang: Locale; logos: Map<string, HTMLImageElement> }): void`, `type DrawnItem = { item: DeskItem; w: number; h: number; x: number; y: number; angle: number }`.

- [ ] **Step 1: Add copy** to `COPY.en` / `COPY.ja`

```ts
// en
'desk.title': 'The desk',
'desk.titleEm': 'the things I work with.',
'desk.intro': 'Pick up a tag and toss it, or click one to see what it is. Organize puts everything on its shelf.',
'desk.organize': 'Organize ☰',
'desk.scatter': 'Scatter ↻',
'desk.drop': 'Drop again ↻',
'desk.take': 'My take',
'desk.wiki': 'Read on Wikipedia ↗',
'desk.list': 'Everything on the desk',
'desk.canvas': 'Paper tags on a wooden desk. Use the list of items to open each one.',
// ja
'desk.title': '机',
'desk.titleEm': '仕事の道具たち。',
'desk.intro': 'タグをつまんで投げたり、クリックして中身を見たりできます。「整理する」で棚に並びます。',
'desk.organize': '整理する ☰',
'desk.scatter': '散らかす ↻',
'desk.drop': 'もう一度落とす ↻',
'desk.take': '私の見方',
'desk.wiki': 'Wikipedia で読む ↗',
'desk.list': '机の上のものすべて',
'desk.canvas': '木の机の上の紙のタグ。下のリストからそれぞれを開けます。',
```

- [ ] **Step 2: Create** `src/lib/home/desk-scene.ts` (ported from the prototype functions `drawItem` and `frame` of the desk)

```ts
import type { Locale } from './content';
import { DESK, plankY, type DeskMode } from './desk-layout';
import { SHELVES, type DeskItem } from './desk-items';
import type { Palette } from './palette';

export type DrawnItem = { item: DeskItem; w: number; h: number; x: number; y: number; angle: number };

const DARK_TEXT = new Set(['gold', 'mossLight']);

function drawSeal(ctx: CanvasRenderingContext2D, p: Palette) {
	ctx.fillStyle = p.gold; ctx.strokeStyle = p.ink; ctx.lineWidth = 1.2;
	ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
	ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.stroke();
	ctx.fillStyle = p.ink; ctx.font = '600 28px "Shippori Mincho", serif';
	ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('浩', 0, 2);
}

function drawTag(ctx: CanvasRenderingContext2D, p: Palette, d: DrawnItem, logo?: HTMLImageElement) {
	const { w, h, item } = d;
	const shelf = SHELVES.find((s) => s.id === item.cat)!;
	const fill = p[shelf.color];
	ctx.fillStyle = fill; ctx.strokeStyle = p.ink; ctx.lineWidth = 1.2;
	ctx.beginPath();
	ctx.moveTo(-w / 2 + 12, -h / 2); ctx.lineTo(w / 2, -h / 2); ctx.lineTo(w / 2, h / 2); ctx.lineTo(-w / 2 + 12, h / 2); ctx.lineTo(-w / 2, 0); ctx.closePath();
	ctx.fill(); ctx.stroke();
	let tx = 8;
	if (item.logo) {
		const bx = -w / 2 + 28;
		ctx.fillStyle = '#fff';
		ctx.beginPath(); ctx.arc(bx, 0, 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
		if (logo?.complete && logo.naturalWidth) {
			const k = 18 / Math.max(logo.naturalWidth, logo.naturalHeight);
			ctx.save(); ctx.beginPath(); ctx.arc(bx, 0, 12, 0, Math.PI * 2); ctx.clip();
			ctx.drawImage(logo, bx - (logo.naturalWidth * k) / 2, -(logo.naturalHeight * k) / 2, logo.naturalWidth * k, logo.naturalHeight * k);
			ctx.restore();
		}
		tx = 21;
	} else {
		ctx.fillStyle = p.paper;
		ctx.beginPath(); ctx.arc(-w / 2 + 14, 0, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
	}
	ctx.fillStyle = DARK_TEXT.has(shelf.color) ? p.ink : p.paper;
	ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
	ctx.font = '18px "Newsreader", serif';
	ctx.fillText(item.label, tx, item.sub ? -8 : 1);
	if (item.sub) {
		ctx.font = 'italic 13px "Newsreader", serif';
		ctx.globalAlpha = 0.85; ctx.fillText(item.sub, tx, 13); ctx.globalAlpha = 1;
	}
}

export function drawDesk(ctx: CanvasRenderingContext2D, p: Palette, s: { items: DrawnItem[]; mode: DeskMode; lang: Locale; logos: Map<string, HTMLImageElement> }) {
	const { W, H, LEDGE_Y, LABEL_W } = DESK;
	ctx.clearRect(0, 0, W, H);
	ctx.fillStyle = p.wood; ctx.fillRect(0, LEDGE_Y, W, H - LEDGE_Y);
	ctx.strokeStyle = p.ink; ctx.lineWidth = 1.5;
	ctx.beginPath(); ctx.moveTo(0, LEDGE_Y); ctx.lineTo(W, LEDGE_Y); ctx.stroke();
	ctx.globalAlpha = 0.35; ctx.lineWidth = 1;
	for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(0, LEDGE_Y + 9 + i * 8); ctx.bezierCurveTo(W * 0.3, LEDGE_Y + 5 + i * 8, W * 0.6, LEDGE_Y + 14 + i * 8, W, LEDGE_Y + 8 + i * 8); ctx.stroke(); }
	ctx.globalAlpha = 1;
	if (s.mode === 'organized') {
		SHELVES.forEach((shelf, r) => {
			const y = plankY(r);
			if (y < LEDGE_Y) { ctx.fillStyle = p.wood; ctx.fillRect(LABEL_W - 12, y, W - LABEL_W + 4, 7); ctx.strokeStyle = p.ink; ctx.lineWidth = 1; ctx.strokeRect(LABEL_W - 12, y, W - LABEL_W + 4, 7); }
			ctx.fillStyle = p[shelf.color]; ctx.fillRect(0, y - 26, 5, 24);
			ctx.fillStyle = p.ink; ctx.font = '600 14px "Shippori Mincho", serif';
			ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
			ctx.fillText(shelf.label[s.lang], 12, y - 14);
		});
	}
	for (const d of s.items) {
		ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.angle);
		if (d.item.kind === 'seal') drawSeal(ctx, p); else drawTag(ctx, p, d, d.item.logo ? s.logos.get(d.item.logo) : undefined);
		ctx.restore();
	}
}
```

- [ ] **Step 3: Create** `src/lib/components/home/CraftDesk.svelte`

```svelte
<script lang="ts">
	// Craftsman's desk island. SSR renders the buttons, the intro card, and a
	// grouped list of every item (keyboard + screen readers + no JS).
	import { onMount } from 'svelte';
	import type { Locale } from '$lib/home/content';
	import { DESK_ITEMS, SHELVES, type DeskItem } from '$lib/home/desk-items';
	import { DESK, isClick, layoutShelves, nextDeskMode, tagWidth, type DeskMode } from '$lib/home/desk-layout';
	import { drawDesk, type DrawnItem } from '$lib/home/desk-scene';
	import { onThemeChange, readPalette, type Palette } from '$lib/home/palette';
	import { clampDelta } from '$lib/home/windmill-model';
	import { localizeHref } from '$lib/i18n';
	import type { Body as MBody } from 'matter-js';

	let { lang, copy }: { lang: Locale; copy: Record<string, string> } = $props();
	const t = (k: string) => copy[k] ?? k;

	let canvasEl: HTMLCanvasElement;
	let cardEl: HTMLDivElement;
	let selected = $state<DeskItem | null>(null);
	let mode = $state<DeskMode>('loose');
	let toggle = $state<() => void>(() => {});
	let drop = $state<() => void>(() => {});
	let animateCard: (() => void) | null = null;
	const href = (i: DeskItem) => (i.href && !i.external ? localizeHref(i.href, lang) : i.href);
	const shelfLabel = (i: DeskItem) => SHELVES.find((s) => s.id === i.cat)!.label[lang];
	const open = (i: DeskItem) => { selected = i; queueMicrotask(() => animateCard?.()); };

	onMount(() => {
		let stopped = false;
		let cleanup = () => {};
		(async () => {
			const [{ default: Matter }, { gsap }] = await Promise.all([import('matter-js'), import('gsap')]);
			if (stopped) return;
			const { Engine, Bodies, Body, Composite, Mouse, MouseConstraint, Query } = Matter;
			const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
			const dpr = window.devicePixelRatio || 1;
			canvasEl.width = DESK.W * dpr;
			canvasEl.height = DESK.H * dpr;
			canvasEl.setAttribute('data-pixel-ratio', String(dpr));
			const ctx = canvasEl.getContext('2d')!;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			let palette: Palette = readPalette();
			const stopTheme = onThemeChange(() => (palette = readPalette()));
			animateCard = () => { if (!reduce && cardEl) gsap.from(cardEl.children, { y: 8, opacity: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }); };

			const logos = new Map<string, HTMLImageElement>();
			for (const i of DESK_ITEMS) if (i.logo) { const img = new Image(); img.src = i.logo; logos.set(i.logo, img); }

			const engine = Engine.create();
			Composite.add(engine.world, [
				Bodies.rectangle(DESK.W / 2, DESK.LEDGE_Y + 20, DESK.W + 40, 40, { isStatic: true }),
				Bodies.rectangle(-20, DESK.H / 2, 40, DESK.H * 2, { isStatic: true }),
				Bodies.rectangle(DESK.W + 20, DESK.H / 2, 40, DESK.H * 2, { isStatic: true })
			]);
			const mouse = Mouse.create(canvasEl);
			// let the page scroll over the canvas
			const m = mouse as unknown as { mousewheel: EventListener };
			canvasEl.removeEventListener('wheel', m.mousewheel);
			canvasEl.removeEventListener('mousewheel', m.mousewheel);
			canvasEl.removeEventListener('DOMMouseScroll', m.mousewheel);
			Composite.add(engine.world, MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.15, render: { visible: false } } as never }));

			// measure tags once fonts are ready
			await document.fonts.ready;
			const sizes = new Map<string, { w: number; h: number }>();
			for (const i of DESK_ITEMS) {
				if (i.kind === 'seal') { sizes.set(i.id, { w: 60, h: 60 }); continue; }
				ctx.font = '18px "Newsreader", serif';
				const main = ctx.measureText(i.label).width;
				ctx.font = 'italic 13px "Newsreader", serif';
				const sub = i.sub ? ctx.measureText(i.sub).width : 0;
				sizes.set(i.id, { w: tagWidth(main, sub, !!i.logo), h: i.sub ? 52 : 38 });
			}
			const shelfPos = layoutShelves(DESK_ITEMS.map((i) => ({ id: i.id, cat: i.cat, ...sizes.get(i.id)! })));
			let bodies: { item: DeskItem; body: MBody }[] = [];
			const timers: number[] = [];
			const makeBody = (i: DeskItem, x: number, y: number) => {
				const s = sizes.get(i.id)!;
				return i.kind === 'seal'
					? Bodies.circle(x, y, 30, { restitution: 0.25, friction: 0.6 })
					: Bodies.rectangle(x, y, s.w, s.h, { chamfer: { radius: 4 }, restitution: 0.15, friction: 0.7, angle: (Math.random() - 0.5) * 0.8 });
			};

			const organize = () => {
				mode = 'organized';
				bodies.forEach(({ item, body }, k) => {
					gsap.killTweensOf(body);
					Body.setStatic(body, true);
					const to = shelfPos.get(item.id)!;
					const proxy = { x: body.position.x, y: body.position.y, a: body.angle };
					gsap.to(proxy, {
						x: to.x, y: to.y, a: Math.round(body.angle / (2 * Math.PI)) * 2 * Math.PI,
						duration: reduce ? 0 : 0.8, delay: reduce ? 0 : k * 0.03, ease: 'power3.inOut',
						onUpdate: () => { Body.setPosition(body, { x: proxy.x, y: proxy.y }); Body.setAngle(body, proxy.a); }
					});
				});
			};
			const scatter = () => {
				mode = 'loose';
				for (const { body } of bodies) {
					gsap.killTweensOf(body);
					Body.setStatic(body, false);
					Body.setVelocity(body, { x: (Math.random() - 0.5) * 14, y: -6 - Math.random() * 8 });
					Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.3);
				}
			};
			toggle = () => (nextDeskMode(mode) === 'organized' ? organize() : scatter());
			drop = () => {
				timers.splice(0).forEach(clearTimeout);
				for (const { body } of bodies) Composite.remove(engine.world, body);
				bodies = [];
				mode = 'loose';
				DESK_ITEMS.forEach((item, k) => {
					timers.push(window.setTimeout(() => {
						const body = makeBody(item, 70 + Math.random() * (DESK.W - 140), -40);
						bodies.push({ item, body });
						Composite.add(engine.world, body);
					}, k * 120));
				});
			};

			// click (not drag) opens a card
			const local = (e: PointerEvent) => {
				const r = canvasEl.getBoundingClientRect();
				return { x: ((e.clientX - r.left) / r.width) * DESK.W, y: ((e.clientY - r.top) / r.height) * DESK.H, t: performance.now() };
			};
			const hit = (p: { x: number; y: number }) => {
				const b = Query.point(bodies.map((x) => x.body), p)[0];
				return b ? bodies.find((x) => x.body === b)?.item : undefined;
			};
			let down: { x: number; y: number; t: number } | null = null;
			const onDown = (e: PointerEvent) => { down = local(e); };
			const onUp = (e: PointerEvent) => {
				if (!down) return;
				const up = local(e);
				const item = isClick(down, up) ? hit(up) : undefined;
				down = null;
				if (item) open(item);
			};
			const onMove = (e: PointerEvent) => { canvasEl.style.cursor = hit(local(e)) ? 'pointer' : 'default'; };
			canvasEl.addEventListener('pointerdown', onDown);
			canvasEl.addEventListener('pointerup', onUp);
			canvasEl.addEventListener('pointermove', onMove);

			let raf = 0;
			let last = performance.now();
			let started = false;
			const frame = (now: number) => {
				Engine.update(engine, clampDelta(now - last));
				last = now;
				const items: DrawnItem[] = bodies.map(({ item, body }) => ({ item, ...sizes.get(item.id)!, x: body.position.x, y: body.position.y, angle: body.angle }));
				drawDesk(ctx, palette, { items, mode, lang, logos });
				raf = requestAnimationFrame(frame);
			};
			const start = () => { if (!raf && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };
			const stop = () => { cancelAnimationFrame(raf); raf = 0; };
			const io = new IntersectionObserver(([e]) => {
				if (!e.isIntersecting) return stop();
				start();
				if (!started) {
					started = true;
					if (reduce) {
						for (const item of DESK_ITEMS) { const p = shelfPos.get(item.id)!; const body = makeBody(item, p.x, p.y); Body.setAngle(body, 0); bodies.push({ item, body }); Composite.add(engine.world, body); }
						organize();
					} else drop();
				}
			}, { threshold: 0.3 });
			io.observe(canvasEl);
			const onVis = () => (document.hidden ? stop() : start());
			document.addEventListener('visibilitychange', onVis);

			cleanup = () => {
				stop(); io.disconnect(); stopTheme(); timers.forEach(clearTimeout);
				document.removeEventListener('visibilitychange', onVis);
				canvasEl.removeEventListener('pointerdown', onDown);
				canvasEl.removeEventListener('pointerup', onUp);
				canvasEl.removeEventListener('pointermove', onMove);
				Engine.clear(engine);
			};
		})();
		return () => { stopped = true; cleanup(); };
	});
</script>

<div class="desk frame-deco">
	<div class="desk-head">
		<h2>{t('desk.title')} <em>{t('desk.titleEm')}</em></h2>
	</div>
	<div class="desk-grid">
		<canvas bind:this={canvasEl} class="desk-canvas" aria-label={t('desk.canvas')}></canvas>
		<div class="desk-side">
			<div class="desk-actions">
				<button type="button" class="contact-btn" onclick={() => toggle()}>{mode === 'organized' ? t('desk.scatter') : t('desk.organize')}</button>
				<button type="button" class="contact-btn ghost" onclick={() => drop()}>{t('desk.drop')}</button>
			</div>
			<div class="desk-card" bind:this={cardEl} aria-live="polite">
				{#if !selected}
					<p>{t('desk.intro')}</p>
				{:else if selected.author}
					<span class="desk-kicker">{shelfLabel(selected)}</span>
					<div class="desk-row">
						{#if selected.author.portrait}
							<img class="desk-portrait" src={selected.author.portrait} alt={selected.label} width="84" height="84" />
						{:else}
							<span class="desk-portrait monogram">{selected.label[0]}</span>
						{/if}
						<div><h3>{selected.label}</h3><p class="desk-sub">{selected.author.descriptor[lang]}</p></div>
					</div>
					<span class="desk-kicker">{t('desk.take')}</span>
					<p class="desk-take">{selected.take?.[lang]}</p>
					<a class="ink-link" href={selected.author.wiki} target="_blank" rel="noopener">{t('desk.wiki')}</a>
				{:else if selected.avatar}
					<span class="desk-kicker">{shelfLabel(selected)}</span>
					<div class="desk-row">
						<img class="desk-portrait self" src={selected.avatar} alt={selected.name} width="84" height="84" />
						<div><h3>{selected.name}</h3><p class="desk-sub">{selected.nameJa}</p></div>
					</div>
					<p class="desk-take">{selected.desc?.[lang]}</p>
					<a class="ink-link" href={href(selected)}>{selected.cta?.[lang]} →</a>
				{:else}
					<span class="desk-kicker">{shelfLabel(selected)}</span>
					<div class="desk-row">
						{#if selected.logo}<img class="desk-logo" src={selected.logo} alt="" width="64" height="64" />{/if}
						<h3>{selected.label}{#if selected.sub} <em>{selected.sub}</em>{/if}</h3>
					</div>
					<p>{selected.desc?.[lang]}</p>
					{#if selected.href}
						<a class="ink-link" href={href(selected)} target={selected.external ? '_blank' : undefined} rel={selected.external ? 'noopener' : undefined}>{selected.cta?.[lang]} ↗</a>
					{/if}
				{/if}
			</div>
		</div>
	</div>
	<nav class="sr-only" aria-label={t('desk.list')}>
		{#each SHELVES as shelf}
			<h3>{shelf.label[lang]}</h3>
			<ul>
				{#each DESK_ITEMS.filter((i) => i.cat === shelf.id) as item}
					<li><button type="button" onclick={() => open(item)}>{item.name ?? item.label}{item.sub ? ` (${item.sub})` : ''}</button></li>
				{/each}
			</ul>
		{/each}
	</nav>
</div>
```

- [ ] **Step 4: Add desk styles** to `src/style.css`

```css
.desk { max-width: var(--max); margin: 4rem auto; }
.desk-head h2 { font-family: var(--f-display); font-weight: 600; margin: 0 0 1.5rem; }
.desk-head em { font-family: var(--f-body); font-weight: 400; color: var(--ink-mute); }
.desk-grid { display: grid; grid-template-columns: minmax(0, 840px) minmax(280px, 1fr); gap: 2.5rem; align-items: start; }
.desk-canvas { width: 100%; aspect-ratio: 840 / 440; touch-action: pan-y; }
.desk-actions { display: flex; gap: 0.6rem; margin-bottom: 1.5rem; }
.contact-btn.ghost { background: transparent; color: var(--ebicha); }
.desk-card { border-left: 3px solid var(--kon); padding-left: 1.25rem; min-height: 16rem; }
.desk-card h3 { font-family: var(--f-display); font-size: 1.5rem; margin: 0.3rem 0; }
.desk-kicker { font-family: var(--f-mono); font-size: 0.75rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); }
.desk-row { display: flex; gap: 1rem; align-items: center; margin: 0.4rem 0 0.8rem; }
.desk-sub { margin: 0; font-style: italic; color: var(--ink-mute); }
.desk-take { border-top: 1px solid var(--gold); padding-top: 0.5rem; }
.desk-portrait { width: 84px; height: 84px; object-fit: cover; object-position: top; border-radius: 50%; border: 1px solid var(--gold); outline: 1px solid var(--gold); outline-offset: 3px; filter: grayscale(1) sepia(0.55) contrast(1.1); }
.desk-portrait.self { filter: none; }
.desk-portrait.monogram { display: grid; place-items: center; font-family: var(--f-display); font-size: 2rem; color: var(--paper); background: var(--kon); filter: none; }
.desk-logo { width: 64px; height: 64px; object-fit: contain; padding: 8px; background: #fff; border-radius: 50%; border: 1px solid var(--gold); }
@media (max-width: 1040px) { .desk-grid { grid-template-columns: 1fr; } }
```

- [ ] **Step 5: Type-check**

Run: `pnpm check`
Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/lib/home/desk-scene.ts src/lib/components/home/CraftDesk.svelte src/lib/home/content.ts src/style.css
git commit -m "feat(desk): craftsman's desk island with organize, cards, and a11y list"
```

---

### Task 8: Homepage wiring, hero name, motion island

**Files:**
- Modify: `src/views/HomePage.svelte`, `src/views/HomeRoute.astro`, `src/lib/home/content.ts`, `src/style.css`
- Create: `src/lib/components/home/HomeMotion.svelte`
- Delete: `src/lib/components/HeroCanvas.svelte` and its `.hero-canvas` CSS

**Interfaces:**
- Consumes: `Windmill`, `CraftDesk`, `pickCopy`.
- Produces: `HomePage` slots `windmill`, `desk`, `projects`, `contact`, `motion`.

- [ ] **Step 1: Hero copy** in `src/lib/home/content.ts`

```ts
// en
'hero.name': 'Hiroyuki (Hiro) Kuwana',
'hero.nameJa': '桑名浩行',
'hero.tagline': 'I make practical, opinionated AI utilities, quietly built and carefully made, for people who would rather think than scroll.',
// ja
'hero.name': '桑名浩行',
'hero.nameJa': 'Hiroyuki (Hiro) Kuwana',
'hero.tagline': '実用的で、ちょっと意地のある AI の道具を、静かに、ていねいに作っています。スクロールするより、考えたい人のために。',
```

Also change the Exonians entry in `PIECES` from `logo: asset('/icon-512x512.png')` (or `'/icon-512x512.png'`) to `logo: '/logos/exonians-e.svg'`.

- [ ] **Step 2: Hero markup** in `src/views/HomePage.svelte`

Replace the props block with:

```ts
	let {
		lang,
		windmill,
		desk,
		projects,
		contact,
		motion
	}: {
		lang: Locale;
		windmill?: Snippet;
		desk?: Snippet;
		projects?: Snippet;
		contact?: Snippet;
		motion?: Snippet;
		children?: unknown;
	} = $props();
```

Replace `{@render heroCanvas?.()}` with nothing. Insert as the first child of `.hero-content`:

```svelte
		<p class="hero-name" data-split>{t('hero.name')} <span class="hero-name-alt">{t('hero.nameJa')}</span></p>
```

Insert after the closing `</aside>` of `.hero-side`:

```svelte
	<div class="hero-mill">{@render windmill?.()}</div>
```

Insert after the closing `</section>` of the hero:

```svelte
<div class="asanoha-break" aria-hidden="true"></div>
<section class="section desk-sec" id="desk">{@render desk?.()}</section>
<div class="asanoha-break" aria-hidden="true"></div>
{@render motion?.()}
```

- [ ] **Step 3: Hero grid** — replace the `.hero` rule and delete `.hero-canvas` in `src/style.css`

```css
.hero {
	position: relative;
	min-height: 100dvh;
	padding: 6.25rem var(--pad-inline) 4rem;
	display: grid;
	grid-template-columns: minmax(0, 1fr) minmax(0, 560px);
	grid-template-areas:
		'content mill'
		'side mill';
	gap: 2.5rem 4rem;
	max-width: var(--max);
	margin: 0 auto;
}
.hero-content { grid-area: content; }
.hero-side { grid-area: side; }
.hero-mill { grid-area: mill; align-self: center; }
.hero-name { font-family: var(--f-display); font-size: clamp(1.4rem, 2.4vw, 1.9rem); margin: 0 0 1rem; }
.hero-name-alt { display: block; font-size: 0.6em; color: var(--ink-mute); letter-spacing: 0.08em; }
@media (max-width: 980px) {
	.hero { grid-template-columns: 1fr; grid-template-areas: 'content' 'mill' 'side'; }
}
```

- [ ] **Step 4: Create** `src/lib/components/home/HomeMotion.svelte`

```svelte
<script lang="ts">
	// Hero name letter reveal + scroll reveals (replaces the inline .reveal script).
	import { onMount } from 'svelte';

	onMount(() => {
		const reveals = document.querySelectorAll<HTMLElement>('.reveal');
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
			reveals.forEach((el) => el.classList.add('in'));
			return;
		}
		let ctx: { revert(): void } | undefined;
		(async () => {
			const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
			gsap.registerPlugin(ScrollTrigger);
			ctx = gsap.context(() => {
				const name = document.querySelector<HTMLElement>('[data-split]');
				if (name?.firstChild?.nodeType === Node.TEXT_NODE) {
					const text = name.firstChild.textContent ?? '';
					const frag = document.createDocumentFragment();
					for (const ch of text) {
						const s = document.createElement('span');
						s.className = 'ch';
						s.textContent = ch;
						frag.append(s);
					}
					name.firstChild.replaceWith(frag);
					name.setAttribute('aria-label', text.trim());
					gsap.from(name.querySelectorAll('.ch'), { yPercent: 60, opacity: 0, duration: 0.6, stagger: 0.025, ease: 'power3.out' });
				}
				reveals.forEach((el) => {
					el.classList.add('in');
					gsap.from(el, { y: 24, opacity: 0, duration: 0.8, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
				});
			});
		})();
		return () => ctx?.revert();
	});
</script>
```

Add to `src/style.css`: `.hero-name .ch { display: inline-block; white-space: pre; }`

- [ ] **Step 5: Wire the islands** in `src/views/HomeRoute.astro`

Replace the `HeroCanvas` import with:

```ts
import CraftDesk from '$lib/components/home/CraftDesk.svelte';
import HomeMotion from '$lib/components/home/HomeMotion.svelte';
import Windmill from '$lib/components/home/Windmill.svelte';
```

Replace `<HeroCanvas slot="heroCanvas" client:idle />` with:

```astro
		<Windmill slot="windmill" client:idle lang={lang} copy={pickCopy(lang, ['mill.'])} />
		<CraftDesk slot="desk" client:visible lang={lang} copy={pickCopy(lang, ['desk.'])} />
		<HomeMotion slot="motion" client:idle />
```

Delete the inline `<script is:inline>` scroll-reveal block. In the CSS, keep `.reveal` visible without JS: change the `.reveal` rule so that it starts with `opacity: 1` and `transform: none` (GSAP now animates from hidden).

Update the SEO name: in `personJsonLd` set `name: 'Hiroyuki (Hiro) Kuwana'` and `alternateName: ['Hiro Kuwana', 'Hiroyuki Kuwana', '桑名浩行']`. Set `<title>`, `og:title`, and `twitter:title` to `Hiroyuki (Hiro) Kuwana · building tools that augment humanity`.

- [ ] **Step 6: Remove the ripple canvas**

```bash
git rm src/lib/components/HeroCanvas.svelte
grep -rn "HeroCanvas\|hero-canvas" src || echo "clean"
```

Expected: `clean`.

- [ ] **Step 7: Check, test, build**

Run: `pnpm check && pnpm test && pnpm build`
Expected: 0 errors, all tests pass, build completes.

- [ ] **Step 8: Browser verification** (`pnpm preview`, open `http://localhost:4321/` and `/ja/`)

Check each item and note the result:
1. With JS disabled, the hero shows the name, the four sail buttons, and the Builder panel. The desk shows its intro and the hidden list is reachable with Tab.
2. Click right of the hub: the windmill spins clockwise. Click left: it spins counterclockwise, and the wind turns to blow right to left within about 1 s.
3. Drag a sail and release fast: it keeps turning, slows, and snaps one sail to the top. The panel matches that sail.
4. Wait 7 s without input: one gust turns the windmill one quarter. After a click, no more gusts.
5. Arrow keys and Enter on the focused canvas work.
6. Scroll to the desk: tags drop. Drag and toss a tag. Click Kaiwa: the card shows the logo and the trykaiwa.com link. Click Dostoevsky: portrait (or monogram), descriptor, My take, Wikipedia link. Click 浩: avatar, "Hiroyuki (Hiro) Kuwana", "Yep, that's me."
7. Organize: six labeled planks, nothing overflows (also on `/ja/`). Click Organize and Scatter 5 times quickly: no stuck or flying tags.
8. Toggle the theme: canvas colors change at once.
9. Mobile 390 px with touch emulation: a vertical swipe on empty canvas area scrolls the page.
10. DevTools rendering → `prefers-reduced-motion: reduce`: no gusts, no wind, desk starts organized, no reveals.
11. Switch tabs for 30 s and return: no physics jump.

- [ ] **Step 9: Commit**

```bash
git add -A src
git commit -m "feat(home): windmill hero, desk section, GSAP motion, full name in hero and SEO"
```

---

### Task 9: Font glyph subset

**Files:**
- Create: `scripts/font-glyphs.mjs`, `src/lib/font-glyphs.ts`
- Modify: `src/layouts/BaseLayout.astro:42-45`, `package.json`

**Interfaces:**
- Produces: `SHIPPORI_GLYPHS: string` from `$lib/font-glyphs`.

- [ ] **Step 1: Create** `scripts/font-glyphs.mjs`

```js
// Collect every non-ASCII character in the source and content, so Google
// Fonts serves a Shippori Mincho subset with only these glyphs.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

async function* walk(dir) {
	for (const e of await readdir(dir, { withFileTypes: true })) {
		const p = join(dir, e.name);
		if (e.isDirectory()) { if (e.name !== 'paraglide') yield* walk(p); }
		else if (/\.(svelte|astro|ts|md|mdx|json)$/.test(e.name)) yield p;
	}
}
const set = new Set();
for (const dir of ['src', 'messages']) for await (const f of walk(dir)) for (const ch of await readFile(f, 'utf8')) if (ch.codePointAt(0) > 0x7f) set.add(ch);
const ascii = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join('');
const glyphs = ascii + [...set].sort().join('');
await writeFile('src/lib/font-glyphs.ts', `// Generated by scripts/font-glyphs.mjs. Do not edit.\nexport const SHIPPORI_GLYPHS = ${JSON.stringify(glyphs)};\n`);
console.log(`${glyphs.length} glyphs`);
```

- [ ] **Step 2: Add the scripts** to `package.json`

```json
"fonts:glyphs": "node scripts/font-glyphs.mjs",
"prebuild": "node scripts/font-glyphs.mjs"
```

Run: `pnpm fonts:glyphs`
Expected: prints a glyph count; `src/lib/font-glyphs.ts` exists.

- [ ] **Step 3: Split the font request** in `src/layouts/BaseLayout.astro`

Add to the frontmatter:

```ts
import { SHIPPORI_GLYPHS } from '$lib/font-glyphs';
const shipporiHref = `https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600&display=swap&text=${encodeURIComponent(SHIPPORI_GLYPHS)}`;
```

Replace the single font `<link>` with:

```astro
		<link href={shipporiHref} rel="stylesheet" />
		<link
			href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400;1,6..72,500&family=JetBrains+Mono:wght@400;500&display=swap"
			rel="stylesheet"
		/>
```

- [ ] **Step 4: Measure** before/after font bytes for `/`

Run: `pnpm build && pnpm preview`, open DevTools → Network → Font, reload `/`.
Expected: Shippori Mincho transfer is smaller than before (record both numbers for the PR).

- [ ] **Step 5: Commit**

```bash
git add scripts/font-glyphs.mjs src/lib/font-glyphs.ts src/layouts/BaseLayout.astro package.json
git commit -m "perf(fonts): serve a Shippori Mincho glyph subset"
```

---

### Task 10: Site-wide frames and final checks

**Files:**
- Modify: `src/views/HomePage.svelte`, `src/views/AboutPage.svelte`, `src/style.css`

- [ ] **Step 1: Apply frames**

Add `frame-deco` to: the contact form panel (`.contact-stack` in `ContactPanel.svelte`), each `.scrap-piece .frame` in `ProjectsBoard.svelte`, and the main content block of `AboutPage.svelte` (its outermost content `<section>` or `<article>`). Add `<div class="asanoha-break" aria-hidden="true"></div>` between the Projects, Writing, and Contact sections in `HomePage.svelte`.

- [ ] **Step 2: Size check**

```bash
pnpm build
for f in $(grep -o '/_astro/[^"]*\.js' .vercel/output/static/index.html | sort -u); do gzip -c ".vercel/output/static$f" | wc -c; done | awk '{s+=$1} END {print s " bytes gz (entry scripts)"}'
du -ch $(find .vercel/output/static/_astro -name '*.js') | tail -1
```

Expected: entry scripts referenced by `index.html` stay ≈ 16 KB gz; all island chunks together ≤ 110 KB gz.

- [ ] **Step 3: Full verification**

Run: `pnpm check && pnpm test && pnpm build`
Expected: 0 errors, all tests pass.
Repeat the Task 8 Step 8 browser checklist on `/` and `/ja/`, and check `/about`, `/essays`, one essay, `/ai-guides` in light and dark.

- [ ] **Step 4: Commit**

```bash
git add -A src
git commit -m "feat(style): hairline frames and asanoha breaks across pages"
```

---

### Task 11: Push, PR, and email (after Hiro's go-ahead in this session)

- [ ] **Step 1: Choose the PR base.** `main` and `master` differ. Use the branch that Vercel deploys (ask Hiro if unknown).

- [ ] **Step 2: Push and open the PR**

```bash
git push -u origin worktree-agent-a4003530fc32883fe:feat/astro-taisho-redesign
gh pr create --base <base> --head feat/astro-taisho-redesign --title "Astro migration + Taishō paper redesign (風車 windmill, craftsman's desk)" --body-file <(cat <<'EOF'
## Summary
- Astro + Svelte islands (homepage JS 58.3 KB → 16.1 KB at load)
- Taishō flat woodblock style, palette, hairline frames, standards mode
- 風車 windmill hero (matter.js + GSAP), craftsman's desk with organize, cards, takes
- Full name Hiroyuki (Hiro) Kuwana in hero and SEO

## Review notes
- JA drafts for facets, desk text, and takes need Hiro's review
- Nature sail text is a draft
- Vercel: Node 22.12+, framework = astro

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)
```

- [ ] **Step 3: Link the PR** with the t3-code `link_pull_request` tool.

- [ ] **Step 4: Email Hiro the PR link.** Use the email-safety skill first, then send to hiro@trykaiwa.com.

---

## Addendum (2026-10-08): rebased onto current GitHub `main` (SvelteKit)

The Astro branch was cut from a stale local `main` (94e0324). GitHub `main` (ca8dc9c) has 23 newer commits (tools pages, API routes, essays). Hiro chose to build the redesign on current `main` and redo Astro later. Work now happens in `~/Developer/hiroPersonalSite-taisho` (outside iCloud), branch `feat/taisho-redesign`.

Path mapping for Tasks 5–11:

| Plan says | On `main` |
|---|---|
| `tests/unit/<x>.test.ts` | `src/lib/home/<x>.test.ts` (Vitest 4 from `vite.config.ts`, `include: src/**/*.test.ts`); run with `pnpm test:unit` |
| `vitest.config.ts` | not needed |
| `src/lib/home/content.ts` `mill.*` / `desk.*` copy | `src/lib/home/copy.ts` (`COPY_MILL`, `COPY_DESK`, `type Locale`) imported by the components |
| `Locale` from `$lib/home/content` | `Locale` from `$lib/home/copy` |
| `localizeHref(href, lang)` from `$lib/i18n` | `localizeHref(href, { locale: lang })` from `$lib/paraglide/runtime` |
| `src/views/HomePage.svelte` + `HomeRoute.astro` | `src/routes/+page.svelte` (components imported directly; matter-js and gsap still load by dynamic `import()` in `onMount`) |
| `src/layouts/BaseLayout.astro` fonts | `src/routes/+layout.svelte` `<svelte:head>` |
| delete `src/middleware.ts` (standards mode) | add `<!doctype html>` to `src/app.html` |
| `/hiro-avatar.png` | existing `/hiro-avatar.jpg` |
| `client:idle` / `client:visible` budgets | n/a; measure the homepage entry JS before/after instead |
