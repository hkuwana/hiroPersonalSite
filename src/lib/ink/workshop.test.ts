import { describe, expect, it } from 'vitest';
import { PROJECTS } from '$data/constants';
import {
	roomOf,
	roomUrl,
	villageUrl,
	workshopProject,
	workshopUrl,
	WORKSHOP_PROJECTS
} from './workshop';
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
	it('opens the board and the izakaya as rooms, and ignores unknown places', () => {
		const original = 'https://hirokuwana.com/ja/?room=1#work';
		const board = roomUrl(original, 'board');
		expect(roomOf(board.href)).toBe('board');
		expect(board.searchParams.has('project')).toBe(false);
		expect(villageUrl(board.href).href).toBe(original);
		expect(roomOf(roomUrl(original, 'izakaya').href)).toBe('izakaya');
		expect(roomOf(workshopUrl(original, 'kaiwa').href)).toBe('windmill');
		expect(roomOf('https://hirokuwana.com/?place=tree')).toBeNull();
		expect(roomOf(original)).toBeNull();
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

describe('workshop logos', () => {
	it('never shows the site icon as a project logo', () => {
		for (const p of WORKSHOP_PROJECTS) expect(p.logo).not.toBe('/icon-512x512.png');
		expect(WORKSHOP_PROJECTS.find((p) => p.id === 'otterd')?.logo).toBe('/logos/otterd.svg');
	});
});
