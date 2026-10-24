import { describe, expect, it } from 'vitest';
import { ambienceUrl, parseSoundPref } from './village-sound';

describe('village sound', () => {
	it('stays off unless the visitor turned it on', () => {
		expect(parseSoundPref(null)).toBe(false);
		expect(parseSoundPref('off')).toBe(false);
		expect(parseSoundPref('on')).toBe(true);
	});
	it('picks the bed for the time of day and the codec the browser can play', () => {
		expect(ambienceUrl(false, true)).toBe('/audio/village-day.m4a');
		expect(ambienceUrl(true, false)).toBe('/audio/village-night.ogg');
	});
});
