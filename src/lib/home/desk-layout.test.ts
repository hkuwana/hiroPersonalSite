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
