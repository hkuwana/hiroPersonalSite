import { describe, expect, it } from 'vitest';
import { PROJECTS } from '$data/constants';
import { villageUrl, workshopProject, workshopUrl, WORKSHOP_PROJECTS } from './workshop';
import { bullStep } from './bull-motion';

describe('workshop navigation', () => {
	it('includes every real project, including the archive, with unique stable addresses', () => {
		expect(WORKSHOP_PROJECTS.map((p) => p.name)).toEqual(PROJECTS.map((p) => p.name));
		expect(new Set(WORKSHOP_PROJECTS.map((p) => p.id)).size).toBe(PROJECTS.length);
		expect(WORKSHOP_PROJECTS.find((p) => p.id === 'otterd')?.href).toBe('https://otterd.co/');
		expect(workshopProject('kaiwa')).toBeGreaterThanOrEqual(0);
		expect(workshopProject('missing')).toBe(-1);
	});
	it('round-trips a destination without losing locale, fidelity or the page anchor', () => {
		const original = 'https://hirokuwana.com/ja/lab/ink?room=1#work';
		const destination = workshopUrl(original, 'kaiwa');
		expect(destination.searchParams.get('project')).toBe('kaiwa');
		expect(destination.searchParams.get('place')).toBe('windmill');
		expect(villageUrl(destination.href).href).toBe(original);
	});
});

describe('bull movement', () => {
	it('reaches a door without overshooting at both 30 and 120 fps', () => {
		for (const fps of [30, 120]) {
			let distance = 4;
			let speed = 0;
			for (let frame = 0; frame < fps * 2; frame++) {
				const step = bullStep(speed, distance, 1 / fps, distance > 0);
				speed = step.speed;
				distance -= step.distance;
				expect(distance).toBeGreaterThanOrEqual(0);
			}
			expect(distance).toBeLessThan(0.06);
		}
	});
	it('accelerates gradually and comes to rest when input stops', () => {
		const first = bullStep(0, Infinity, 1 / 60, true);
		expect(first.speed).toBeGreaterThan(0);
		expect(first.speed).toBeLessThan(1);
		let speed = 5.4;
		for (let frame = 0; frame < 60; frame++) speed = bullStep(speed, Infinity, 1 / 60, false).speed;
		expect(speed).toBeLessThan(0.001);
	});
});
