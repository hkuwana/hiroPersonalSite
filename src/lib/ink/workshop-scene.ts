// The inside of the mill. Procedural timber, paper and ink; no model downloads.
// Each project stands on a two-tier shelf as its own figure, most of them
// cut out of the project's logo like a painted wooden standee. The chosen one flies down
// onto the workbench in front. Loaded only when the visitor enters.
import * as THREE from 'three';
import type { Palette } from '$lib/home/palette';
import { createRoom, type Kit } from './room-kit';
import { WORKSHOP_PROJECTS } from './workshop';

// Shelf slots: top row, then bottom row (x, y of the shelf board).
const SLOTS: [number, number][] = [
	[-3, 3.62],
	[0, 3.62],
	[3, 3.62],
	[-3, 1.52],
	[0, 1.52],
	[3, 1.52]
];
const SHELF_Z = -3.15;
const BENCH = new THREE.Vector3(0, 1.86, 0.7);

// The figure for each project, by id. Logos become cut-out figures; the two
// projects without a usable logo get a small object of their own.
function figure(kit: Kit, id: string, logo: string | null, parent: THREE.Object3D) {
	const { logoFigure, rod, mesh, material, mat } = kit;
	switch (id) {
		case 'kaiwa':
			return logoFigure(
				logo!,
				{ height: 1.2, crop: { x: 0.03, y: 0.02, w: 0.94, h: 0.82 } },
				parent
			);
		case 'flybyrd':
			return logoFigure(logo!, { height: 1.35, thickness: 0.14 }, parent);
		case 'otterd':
			return logoFigure(logo!, { height: 1.05 }, parent);
		case 'exonians-in-japan':
			return logoFigure(logo!, { height: 1 }, parent);
		case 'kaiwa-reddit-scout': {
			// A scout's brass telescope on a tripod, looking out for learners.
			const g = new THREE.Group();
			parent.add(g);
			for (const a of [0, 2.1, 4.2]) {
				const leg = rod(0.03, 1, Math.sin(a) * 0.22, 0.45, Math.cos(a) * 0.22, mat.darkWood, g);
				leg.rotation.set(Math.cos(a) * 0.4, 0, -Math.sin(a) * 0.4);
			}
			const tube = rod(0.09, 1.1, 0, 1.05, 0, mat.brass, g, 0.13);
			tube.rotation.z = 1.15;
			rod(0.05, 0.2, -0.55, 1.28, 0, mat.ink, g).rotation.z = 1.15;
			return g;
		}
		default: {
			// Pebblr: a small cairn of river pebbles.
			const g = new THREE.Group();
			parent.add(g);
			const stone = [material('#9a968a'), material('#b8b1a0'), mat.greenLight, material('#7d786c')];
			let y = 0;
			[0.42, 0.34, 0.27, 0.19].forEach((r, i) => {
				const p = mesh(new THREE.SphereGeometry(r, 18, 10), stone[i], g);
				p.scale.y = 0.55;
				p.position.set((i % 2 ? 0.05 : -0.04) * i, y + r * 0.55, 0);
				y += r * 1.05;
			});
			return g;
		}
	}
}

export function createWorkshopScene(
	canvas: HTMLCanvasElement,
	palette: Palette,
	opts: { reduceMotion: boolean; onLost: () => void }
) {
	return createRoom(canvas, palette, opts, (kit, scene) => {
		const { box, rod, mesh, label } = kit;
		const { wood, darkWood, paper, brass, green, plaster } = kit.mat;
		const gears: THREE.Group[] = [];

		function gear(radius: number, x: number, y: number, z: number, teeth: number) {
			const g = new THREE.Group();
			g.position.set(x, y, z);
			scene.add(g);
			const rim = mesh(new THREE.TorusGeometry(radius * 0.74, radius * 0.13, 6, teeth), wood, g);
			rim.rotation.z = Math.PI / teeth;
			for (let i = 0; i < teeth; i++) {
				const a = (i / teeth) * Math.PI * 2;
				const tooth = box(
					radius * 0.22,
					radius * 0.26,
					0.22,
					Math.sin(a) * radius,
					Math.cos(a) * radius,
					0,
					darkWood,
					g
				);
				tooth.rotation.z = -a;
			}
			for (let i = 0; i < 4; i++) {
				const spoke = box(radius * 1.35, 0.12, 0.16, 0, 0, 0, wood, g);
				spoke.rotation.z = (i * Math.PI) / 4;
			}
			const hub = rod(radius * 0.18, 0.38, 0, 0, 0.05, brass, g);
			hub.rotation.x = Math.PI / 2;
			gears.push(g);
			return g;
		}

		// Open-front timber room: the camera always stays outside the near wall.
		box(18, 10, 0.25, 0, 4.9, -4.5, plaster);
		box(0.3, 10, 13, -9, 4.9, 1.8, plaster);
		box(0.3, 10, 13, 9, 4.9, 1.8, plaster);
		for (let i = 0; i < 22; i++) {
			box(0.8, 0.12, 14, -8.5 + i * 0.81, -0.08, 1.3, i % 3 ? wood : darkWood);
		}
		for (const x of [-8.3, -6.2, 6.2, 8.3]) {
			box(0.24, 8.8, 0.3, x, 4.3, -4.2, darkWood);
		}
		for (const y of [0.35, 7.25, 8.6]) box(17.5, 0.2, 0.3, 0, y, -4.1, darkWood);
		for (const z of [-3, 0.8]) box(17.8, 0.24, 0.24, 0, 8.6, z, darkWood);

		// A round window high on the wall, with an ink hill beyond it.
		const windowDisc = mesh(new THREE.CircleGeometry(1.15, 48), paper);
		windowDisc.position.set(0, 6.75, -4.32);
		const ring = mesh(new THREE.TorusGeometry(1.15, 0.08, 6, 48), darkWood);
		ring.position.set(0, 6.75, -4.2);
		for (const x of [-0.45, 0, 0.45]) {
			const height = Math.sqrt(1.15 ** 2 - x ** 2) * 2;
			box(0.04, height, 0.05, x, 6.75, -4.14, wood);
		}
		const hill = mesh(new THREE.SphereGeometry(1, 24, 12), green);
		hill.scale.set(1.05, 0.36, 0.03);
		hill.position.set(0.1, 6, -4.25);
		// The mill's drive: a shaft and gears beside the shelf.
		rod(0.17, 8.6, 6.9, 4.25, -3.3, darkWood);
		gear(1.05, 6.9, 6.25, -3, 14);
		gear(0.6, 5.3, 6.9, -3, 10);
		gear(0.8, 6.9, 2.8, -3, 12);

		// 棚 The display shelf: two long boards on four uprights.
		for (const x of [-4.6, -1.5, 1.5, 4.6]) box(0.16, 5.3, 0.16, x, 2.65, SHELF_Z - 0.45, darkWood);
		for (const y of [3.62, 1.52]) box(9.6, 0.14, 1.2, 0, y - 0.07, SHELF_Z, wood);
		box(9.6, 0.14, 1.2, 0, 5.28, SHELF_Z, wood);
		box(9.4, 3.9, 0.08, 0, 3.25, SHELF_Z - 0.58, plaster);

		// 作業台 The workbench in front, where a chosen project is laid out.
		box(5.6, 0.2, 2.2, BENCH.x, 1.7, BENCH.z);
		box(5.4, 0.34, 0.12, BENCH.x, 1.4, BENCH.z + 0.85, darkWood);
		for (const dx of [-2.5, 2.5])
			for (const dz of [-0.8, 0.8])
				box(0.16, 1.65, 0.16, BENCH.x + dx, 0.8, BENCH.z + dz, darkWood);
		box(1.7, 0.06, 1.2, BENCH.x, 1.83, BENCH.z, paper); // the felt where it lands
		for (let i = 0; i < 3; i++) {
			const roll = rod(0.09, 1.3, -2 + i * 0.22, 1.9, BENCH.z + 0.4, paper);
			roll.rotation.z = Math.PI / 2;
		}
		// A hanging lantern.
		rod(0.035, 1.5, -6.9, 7.6, -0.4, darkWood);
		rod(0.4, 0.7, -6.9, 6.55, -0.4, paper);
		for (const y of [6.2, 6.9]) rod(0.41, 0.05, -6.9, y, -0.4, darkWood);

		const objects: THREE.Object3D[] = [];
		const homes: THREE.Vector3[] = [];
		const flight: number[] = [];
		WORKSHOP_PROJECTS.forEach((project, index) => {
			const [x, y] = SLOTS[index] ?? [0, 1.52];
			// The name stays on the shelf edge, even while the figure is away.
			label(project.name, 1.9, x, y - 0.32, SHELF_Z + 0.62, scene);
			const g = new THREE.Group();
			scene.add(g);
			box(1.15, 0.1, 0.7, 0, 0.05, 0, darkWood, g); // the figure's own plinth
			const f = figure(kit, project.id, project.logo, g);
			f.position.y = 0.1;
			const home = new THREE.Vector3(x, y, SHELF_Z);
			g.position.copy(home);
			objects.push(g);
			homes.push(home);
			flight.push(0);
		});
		const view = { point: new THREE.Vector3(0, 2.75, -1.1), dist: 9.6 };
		const smooth = (t: number) => t * t * (3 - 2 * t);
		return {
			objects,
			focus: objects.map(() => view),
			swell: false,
			tick(dt, time, selected) {
				gears.forEach((g, i) => {
					g.rotation.z = time * (i % 2 ? -0.18 : 0.12);
				});
				objects.forEach((g, i) => {
					const goal = i === selected ? 1 : 0;
					flight[i] = opts.reduceMotion
						? goal
						: Math.max(0, Math.min(1, flight[i] + Math.sign(goal - flight[i]) * (dt / 0.9)));
					const e = smooth(flight[i]);
					g.position.lerpVectors(homes[i], BENCH, e);
					// An arc through the air, and one turn on the way.
					g.position.y += Math.sin(Math.PI * e) * 1.4;
					g.rotation.y = e * Math.PI * 2 + (e === 1 ? Math.sin(time * 0.8) * 0.12 : 0);
					g.scale.setScalar(1 + 0.4 * e);
				});
			}
		};
	});
}
