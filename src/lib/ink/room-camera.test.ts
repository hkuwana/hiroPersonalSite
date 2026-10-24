import { describe, expect, it } from 'vitest';
import { clampOrbit, LIMITS, viewShift } from './room-camera';

describe('room camera', () => {
	it('keeps the visitor inside the room and in front of the objects', () => {
		const o = clampOrbit({ yaw: 5, pitch: -1, dist: 99 });
		expect(o).toEqual({ yaw: LIMITS.yaw, pitch: LIMITS.minPitch, dist: LIMITS.far });
		expect(clampOrbit({ yaw: -5, pitch: 3, dist: 0 })).toEqual({
			yaw: -LIMITS.yaw,
			pitch: LIMITS.maxPitch,
			dist: LIMITS.near
		});
	});

	it('centres the picture in the space between the shelf and the journal', () => {
		// Shelf 200 px on the left, journal 400 px on the right.
		const s = viewShift(1200, 800, { left: 200, right: 400, top: 0, bottom: 0 });
		// The free centre is at x = 500, so the picture moves 100 px left of centre.
		expect(s.x).toBe(100);
		expect(s.y).toBe(0);
		expect(s.fit).toBeGreaterThan(1);
	});

	it('leaves a clear screen alone', () => {
		expect(viewShift(1000, 700, { left: 0, right: 0, top: 0, bottom: 0 })).toEqual({
			x: 0,
			y: 0,
			fit: 1
		});
	});
});
