import { existsSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { DESK_ITEMS, SHELVES } from '$lib/home/desk-items';
import { FACETS } from '$lib/home/facets';
import credits from '../../../static/portraits/credits.json';
import coverCredits from '../../../static/games/credits.json';

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
	test('unique ids', () =>
		expect(new Set(DESK_ITEMS.map((i) => i.id)).size).toBe(DESK_ITEMS.length));
	test('every item is on a known shelf', () => {
		const ids = new Set(SHELVES.map((s) => s.id));
		for (const i of DESK_ITEMS) expect(ids.has(i.cat)).toBe(true);
	});
	test('every item has EN and JA text', () => {
		for (const i of DESK_ITEMS) expect(both(i.take ?? i.desc)).toBe(true);
	});
	test('authors have a take and descriptor', () => {
		const authors = DESK_ITEMS.filter((i) => i.cat === 'reading');
		expect(authors.map((a) => a.label)).toEqual([
			'Mishima',
			'Bulgakov',
			'Dostoevsky',
			'Chekhov',
			'Hemingway'
		]);
		for (const a of authors) expect(both(a.take) && both(a.author?.descriptor)).toBe(true);
	});
	test("Hiro's games sit on two shelves, Japan and the West", () => {
		const on = (cat: string) => DESK_ITEMS.filter((i) => i.cat === cat).map((i) => i.label);
		expect(on('gamesJp')).toEqual(['Ōkami', 'Silent Hill 2', 'Mario Galaxy', 'Resident Evil 2']);
		expect(on('gamesWest')).toEqual(['Shogun 2', 'Clair Obscur', 'Outer Wilds', 'Civilization V']);
	});
	test('all languages share one row, with learning ones in light moss', () => {
		const langs = DESK_ITEMS.filter((i) => i.cat === 'lang');
		expect(langs.map((i) => i.label)).toEqual([
			'日本語',
			'English',
			'中文',
			'Español',
			'Nederlands'
		]);
		expect(langs.filter((i) => i.color === 'mossLight').map((i) => i.sub)).toEqual([
			'Spanish',
			'Dutch'
		]);
	});
	test("Hiro's takes are on the games he wrote about", () => {
		const taken = DESK_ITEMS.filter((i) => i.cover && i.take).map((i) => i.id);
		expect(taken).toEqual(['shogun-2', 'clair-obscur', 'outer-wilds', 'civ-v']);
		for (const i of DESK_ITEMS) if (i.take) expect(both(i.take)).toBe(true);
	});
	test('every referenced asset exists in static/', () => {
		for (const i of DESK_ITEMS) {
			for (const path of [i.logo, i.avatar, i.author?.portrait, i.cover?.src]) {
				if (path) expect(existsSync(`static${path}`), path).toBe(true);
			}
		}
	});
	test('external links are https', () => {
		for (const i of DESK_ITEMS) if (i.external) expect(i.href).toMatch(/^https:\/\//);
	});
});

test('only free-license portraits are referenced', () => {
	for (const i of DESK_ITEMS) {
		if (!i.author?.portrait) continue;
		expect((credits as Record<string, { free: boolean }>)[i.id]?.free, i.id).toBe(true);
	}
});

test('every game has box art with a source and an owner credit', () => {
	const games = DESK_ITEMS.filter((i) => i.cat === 'gamesJp' || i.cat === 'gamesWest');
	for (const g of games) {
		const c = (coverCredits as Record<string, { source: string; owner: string }>)[g.id];
		expect(g.cover?.src, g.id).toBe(`/games/${g.id}.jpg`);
		expect(c?.source, g.id).toMatch(/^https:\/\//);
		expect(g.cover?.owner, g.id).toBeTruthy();
	}
});
