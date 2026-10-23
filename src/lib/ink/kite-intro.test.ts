import { describe, expect, it } from 'vitest';
import { createKiteIntro } from './kite-intro';

describe('kite arrival', () => {
	it('holds the kite for visible time, then lands exactly once', () => {
		const intro = createKiteIntro(true);
		expect(intro.initialKite).toBe(true);
		for (let i = 0; i < 35; i++) expect(intro.advance(50, true)).toBe(false);
		expect(intro.advance(50, true)).toBe(true);
		expect(intro.advance(50, true)).toBe(false);
	});

	it('does not spend the hold while hidden or skip it after a long stalled frame', () => {
		const intro = createKiteIntro(true);
		expect(intro.advance(30_000, false)).toBe(false);
		expect(intro.advance(30_000, true)).toBe(false);
		for (let i = 0; i < 34; i++) expect(intro.advance(50, true)).toBe(false);
		expect(intro.advance(50, true)).toBe(true);
	});

	it('never overrides the visitor after interaction', () => {
		const intro = createKiteIntro(true);
		intro.advance(50, true);
		intro.cancel();
		for (let i = 0; i < 100; i++) expect(intro.advance(50, true)).toBe(false);
	});

	it('skips the intro for reduced motion or a visitor-selected graphics mode', () => {
		const intro = createKiteIntro(false);
		expect(intro.initialKite).toBe(false);
		expect(intro.advance(2000, true)).toBe(false);
	});
});
