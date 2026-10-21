import { describe, expect, it } from 'vitest';
import {
	clampWalk,
	DOMES,
	domeHeight,
	FLOOR_Y,
	groundY,
	MILL,
	nearestSpot,
	OBSTACLES,
	ridgeHeight,
	route,
	spotFor,
	START,
	TREES,
	WALK
} from './places';

const inside = (p: { x: number; z: number }) =>
	OBSTACLES.some((o) => Math.hypot(p.x - o.x, p.z - o.z) < o.r - 1e-6);

// Does the segment a→b cross the middle of any obstacle?
const crosses = (a: { x: number; z: number }, b: { x: number; z: number }) =>
	OBSTACLES.some((o) => {
		for (let i = 1; i < 20; i++) {
			const t = i / 20;
			const x = a.x + (b.x - a.x) * t,
				z = a.z + (b.z - a.z) * t;
			if (Math.hypot(x - o.x, z - o.z) < o.r - 0.1) return true;
		}
		return false;
	});

describe('ground', () => {
	it('is nothing outside a dome', () => {
		const d = DOMES.near;
		expect(domeHeight(d, d.x + d.sx + 1, d.z)).toBe(-Infinity);
		expect(groundY(40, 40)).toBe(FLOOR_Y);
	});

	it('rolls: the hill top is not flat along x', () => {
		const d = DOMES.near;
		const heights = [-6, -3, 0, 3, 6].map((dx) => domeHeight(d, d.x + dx, d.z));
		expect(Math.max(...heights) - Math.min(...heights)).toBeGreaterThan(0.2);
	});

	it('stays above the floor on every hill', () => {
		for (const d of Object.values(DOMES)) {
			for (let dx = -0.9; dx <= 0.9; dx += 0.1) {
				expect(domeHeight(d, d.x + dx * d.sx, d.z)).toBeGreaterThan(d.y - 1e-9);
			}
		}
	});

	it('climbs the middle hill toward the torii', () => {
		expect(groundY(-6, -4.9)).toBeGreaterThan(groundY(-1, 2));
	});
});

describe('ridges', () => {
	it('roll around their base height and never dip below base - amp', () => {
		const hs = Array.from({ length: 200 }, (_, i) => ridgeHeight(-60 + i * 0.6, 1.2, 0.8, 0.5));
		expect(Math.min(...hs)).toBeGreaterThanOrEqual(1.2 - 0.8 - 1e-9);
		expect(Math.max(...hs) - Math.min(...hs)).toBeGreaterThan(0.8);
	});
});

describe('walking', () => {
	it('keeps the akabeko inside the walk area and out of the windmill', () => {
		const far = clampWalk({ x: 40, z: -40 });
		expect(far.x).toBe(WALK.maxX);
		expect(far.z).toBe(WALK.minZ);
		expect(inside(clampWalk({ x: MILL.x + 0.1, z: MILL.z + 0.1 }))).toBe(false);
	});

	it('walks around the windmill, not through it', () => {
		const from = { x: MILL.x - 4, z: MILL.z };
		const path = route(from, { x: MILL.x + 4, z: MILL.z });
		expect(path.length).toBeGreaterThan(1);
		let a = from;
		for (const p of path) {
			expect(crosses(a, p)).toBe(false);
			a = p;
		}
	});

	it('goes straight when nothing is in the way', () => {
		expect(route(START, { x: START.x + 1, z: START.z })).toHaveLength(1);
	});

	it('can reach every place from the start', () => {
		for (const [place, index] of [
			['windmill', 0],
			['torii', 0],
			['board', 0],
			...TREES.map((_, i) => ['tree', i] as const)
		] as const) {
			const spot = spotFor(place, index)!;
			const path = route(START, spot);
			const end = path[path.length - 1];
			expect(Math.hypot(end.x - spot.x, end.z - spot.z)).toBeLessThan(0.3);
			expect(nearestSpot(end)).toEqual({ place, index });
		}
	});

	it('sends a sail click to the windmill', () => {
		expect(spotFor('sail', 2)).toEqual(spotFor('windmill'));
	});

	it('finds no place far from everything', () => {
		expect(nearestSpot({ x: 7.5, z: 2.5 })).toBeNull();
	});
});
