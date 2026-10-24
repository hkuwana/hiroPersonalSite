import { describe, expect, it } from 'vitest';
import { createMillAssembly } from './mill-assembly';

describe('mill assembly', () => {
	it('waits for a click and accepts the build only once', () => {
		const mill = createMillAssembly(false);
		expect(mill.advance(50)).toBe(0);
		expect(mill.start()).toBe(true);
		mill.advance(50);
		expect(mill.start()).toBe(false);
		for (let i = 0; i < 40; i++) mill.advance(50);
		expect(mill.progress).toBe(1);
	});
	it('opens in its finished state for a returning visitor', () => {
		const mill = createMillAssembly(true);
		expect(mill.progress).toBe(1);
		expect(mill.start()).toBe(false);
	});
	it('finishes immediately with reduced motion', () => {
		const mill = createMillAssembly(false, true);
		mill.start();
		expect(mill.progress).toBe(1);
	});
	it('does not skip construction after a stalled frame', () => {
		const mill = createMillAssembly(false);
		mill.start();
		expect(mill.advance(30_000)).toBeLessThan(0.1);
	});
});
