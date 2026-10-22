import { describe, expect, it } from 'vitest';
import { classifyStroke, encloses, type Pt } from './brush';

const circle = (n = 40, r = 80, close = 1): Pt[] =>
	Array.from({ length: n }, (_, i) => {
		const a = (i / (n - 1)) * Math.PI * 2 * close;
		return { x: 200 + Math.cos(a) * r, y: 200 + Math.sin(a) * r };
	});

const line = (from: Pt, to: Pt, n = 20): Pt[] =>
	Array.from({ length: n }, (_, i) => ({
		x: from.x + ((to.x - from.x) * i) / (n - 1),
		y: from.y + ((to.y - from.y) * i) / (n - 1)
	}));

describe('classifyStroke', () => {
	it('reads a closed loop as a circle (the sun, or a tree to bloom)', () => {
		expect(classifyStroke(circle())).toBe('circle');
	});

	it('reads a wobbly, slightly open loop as a circle', () => {
		const pts = circle(40, 80, 0.92).map((p, i) => ({ x: p.x + (i % 3), y: p.y - (i % 2) }));
		expect(classifyStroke(pts)).toBe('circle');
	});

	it('reads a half arc and a three-quarter arc as a crescent (the moon)', () => {
		expect(classifyStroke(circle(30, 80, 0.5))).toBe('crescent');
		expect(classifyStroke(circle(30, 80, 0.75))).toBe('crescent');
	});

	it('reads an up-stroke as rise (fly the kite)', () => {
		expect(classifyStroke(line({ x: 100, y: 400 }, { x: 180, y: 150 }))).toBe('rise');
	});

	it('reads a down-stroke as fall (bring the kite home)', () => {
		expect(classifyStroke(line({ x: 180, y: 150 }, { x: 120, y: 400 }))).toBe('fall');
	});

	it('reads a side stroke as wind in the stroke direction', () => {
		expect(classifyStroke(line({ x: 100, y: 200 }, { x: 400, y: 230 }))).toBe('wind-right');
		expect(classifyStroke(line({ x: 400, y: 200 }, { x: 100, y: 180 }))).toBe('wind-left');
	});

	it('reads a wavy side stroke as wind, not a crescent', () => {
		const pts = line({ x: 100, y: 200 }, { x: 420, y: 200 }, 30).map((p, i) => ({
			x: p.x,
			y: p.y + Math.sin(i / 2) * 12
		}));
		expect(classifyStroke(pts)).toBe('wind-right');
	});

	it('ignores a short stroke and a tap', () => {
		expect(classifyStroke(line({ x: 100, y: 200 }, { x: 170, y: 205 }))).toBe('none');
		expect(classifyStroke([{ x: 1, y: 1 }])).toBe('none');
	});
});

describe('encloses', () => {
	it('finds a point inside a drawn circle, and not one outside', () => {
		expect(encloses(circle(), { x: 210, y: 190 })).toBe(true);
		expect(encloses(circle(), { x: 320, y: 200 })).toBe(false);
	});

	it('closes a slightly open circle', () => {
		expect(encloses(circle(40, 80, 0.9), { x: 200, y: 200 })).toBe(true);
	});
});
