import { describe, expect, test } from 'vitest';
import {
	MILL,
	QUARTER,
	angleForSail,
	clampDelta,
	clampFlick,
	clickSpin,
	nearestSnap,
	onRotor,
	shouldGust,
	springVelocity,
	stepSunPhase,
	stepWindDir,
	sunPosition,
	topIndex,
	onSail
} from '$lib/home/windmill-model';

describe('sail index', () => {
	test('sail 0 is on top at angle 0', () => expect(topIndex(0)).toBe(0));
	test('clockwise quarter turn brings sail 3 to the top', () => expect(topIndex(QUARTER)).toBe(3));
	test('counterclockwise quarter turn brings sail 1 to the top', () =>
		expect(topIndex(-QUARTER)).toBe(1));
	test('works after many turns', () => expect(topIndex(QUARTER + 10 * 2 * Math.PI)).toBe(3));
	test('angleForSail puts that sail on top, near the current angle', () => {
		const current = 7.1;
		for (let i = 0; i < 4; i++) {
			const a = angleForSail(i, current);
			expect(topIndex(a)).toBe(i);
			expect(Math.abs(a - current)).toBeLessThanOrEqual(Math.PI + 1e-9);
		}
	});
	test('nearestSnap rounds to quarter turns', () =>
		expect(nearestSnap(QUARTER * 1.4)).toBeCloseTo(QUARTER));
});

describe('motion rules', () => {
	test('spring pulls toward the target', () => {
		expect(springVelocity(0, 0, 1)).toBeGreaterThan(0);
		expect(springVelocity(0, 1, 0)).toBeLessThan(0);
	});
	test('click right of hub spins clockwise, left spins counterclockwise', () => {
		expect(clickSpin(MILL.HUB.x + 10, MILL.HUB.x)).toBeCloseTo(0.32);
		expect(clickSpin(MILL.HUB.x - 10, MILL.HUB.x)).toBeCloseTo(-0.32);
	});
	test('flick is clamped', () => {
		expect(clampFlick(5)).toBe(0.7);
		expect(clampFlick(-5)).toBe(-0.7);
	});
	test('onRotor hit test', () => {
		expect(onRotor(MILL.HUB)).toBe(true);
		expect(onRotor({ x: 0, y: MILL.H })).toBe(false);
	});
	test('clampDelta prevents a physics jump after a hidden tab', () => {
		expect(clampDelta(5000)).toBe(1000 / 30);
		expect(clampDelta(16)).toBe(16);
	});
});

describe('wind and sun', () => {
	test('a real counterclockwise spin turns the wind toward -1', () => {
		let d = 1;
		for (let i = 0; i < 60; i++) d = stepWindDir(d, -0.3);
		expect(d).toBeLessThan(-0.95);
	});
	test('the small settle motion does not change the wind', () => {
		expect(stepWindDir(-0.9, 0.02)).toBe(-0.9);
	});
	test('sun phase wraps into [0, 1)', () => {
		expect(stepSunPhase(0.99, 1)).toBeGreaterThanOrEqual(0);
		expect(stepSunPhase(0.01, -1)).toBeLessThan(1);
	});
	test('sun is low at the horizon and high at noon', () => {
		expect(sunPosition(0.5).low).toBeLessThan(sunPosition(0.02).low);
	});
});

describe('gusts', () => {
	const base = {
		now: 10_000,
		lastGust: 0,
		userTookOver: false,
		paused: false,
		reduceMotion: false
	};
	test('gust after the interval', () => expect(shouldGust(base)).toBe(true));
	test('no gust after the user took over', () =>
		expect(shouldGust({ ...base, userTookOver: true })).toBe(false));
	test('no gust while paused', () => expect(shouldGust({ ...base, paused: true })).toBe(false));
	test('no gust with reduced motion', () =>
		expect(shouldGust({ ...base, reduceMotion: true })).toBe(false));
	test('no gust before the interval', () =>
		expect(shouldGust({ ...base, lastGust: 9000 })).toBe(false));
});

describe('onSail hit test', () => {
	const { HUB, BLADE_OFF, BLADE_LEN } = MILL;
	const midTop = { x: HUB.x, y: HUB.y - BLADE_OFF - BLADE_LEN / 2 };
	test('a point on the top sail hits at angle 0', () => expect(onSail(midTop, 0)).toBe(true));
	test('the gap between sails is not a hit', () =>
		expect(onSail({ x: HUB.x + 90, y: HUB.y - 90 }, 0)).toBe(false));
	test('after a quarter turn the top position is empty and the right position hits', () => {
		expect(onSail({ x: HUB.x + BLADE_OFF + BLADE_LEN / 2, y: HUB.y }, QUARTER)).toBe(true);
		expect(onSail(midTop, QUARTER / 2)).toBe(false);
	});
	test('the hub hits', () => expect(onSail(HUB, 1.2)).toBe(true));
});
