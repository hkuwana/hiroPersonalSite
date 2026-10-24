import { describe, expect, it } from 'vitest';
import { OBSTACLES, TREES } from './places';
import { BRIDGE_AT, riverAt } from './river';

describe('river', () => {
	it('stays clear of the windmill, the house and the board', () => {
		// Trees may stand on the bank; buildings may not stand in the water.
		const buildings = OBSTACLES.slice(0, 1).concat(OBSTACLES.slice(1 + TREES.length));
		for (let i = 0; i <= 100; i++) {
			const s = riverAt(i / 100);
			for (const o of buildings)
				expect(Math.hypot(s.x - o.x, s.z - o.z) - s.width / 2).toBeGreaterThan(o.r - 0.85);
		}
	});

	it('keeps every tree trunk out of the water', () => {
		for (let i = 0; i <= 100; i++) {
			const s = riverAt(i / 100);
			for (const t of TREES)
				expect(Math.hypot(s.x - t.x, s.z - t.z)).toBeGreaterThan(s.width / 2 + 0.3);
		}
	});

	it('puts the bridge in the walkable front of the village', () => {
		const b = riverAt(BRIDGE_AT);
		expect(b.z).toBeGreaterThan(-2);
		expect(b.z).toBeLessThan(3);
		expect(b.x).toBeLessThan(8.2);
	});

	it('widens as it comes toward the viewer', () => {
		expect(riverAt(0.9).width).toBeGreaterThan(riverAt(0.1).width);
	});
});
