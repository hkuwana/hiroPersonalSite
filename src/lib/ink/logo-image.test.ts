import { describe, expect, it } from 'vitest';
import { logoBackground, logoBounds } from './logo-image';

function image(w: number, h: number, px: (x: number, y: number) => number[]) {
	const data = new Uint8ClampedArray(w * h * 4);
	for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) data.set(px(x, y), (y * w + x) * 4);
	return data;
}

describe('logo image', () => {
	it('uses the alpha of a transparent logo', () => {
		const data = image(4, 4, (x, y) => (x === 1 && y === 2 ? [10, 20, 30, 255] : [0, 0, 0, 0]));
		const bg = logoBackground(data, 4, 4);
		expect(Array.from(bg).filter((b) => !b)).toHaveLength(1);
		expect(logoBounds(bg, 4, 4)).toEqual({ minX: 1, minY: 2, maxX: 1, maxY: 2 });
	});

	it('drops the background of an opaque logo, but keeps light parts inside it', () => {
		// A cream field, a dark ring, and a cream centre inside the ring.
		const ring = (x: number, y: number) => x >= 1 && x <= 3 && y >= 1 && y <= 3;
		const data = image(5, 5, (x, y) =>
			ring(x, y) && !(x === 2 && y === 2) ? [40, 30, 20, 255] : [240, 236, 220, 255]
		);
		const bg = logoBackground(data, 5, 5);
		expect(bg[2 * 5 + 2]).toBe(0);
		expect(bg[0]).toBe(1);
		expect(logoBounds(bg, 5, 5)).toEqual({ minX: 1, minY: 1, maxX: 3, maxY: 3 });
	});

	it('finds no bounds in an empty image', () => {
		expect(logoBounds(new Uint8Array(9).fill(1), 3, 3)).toBeNull();
	});
});
