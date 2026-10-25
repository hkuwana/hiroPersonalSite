// 家 Hiro's house in the village, behind the izakaya curtain. A tatami room
// that opens onto a small garden; each object in it is one part of the site
// (see `houseContent` in emaki-content.ts, same order). Procedural, like
// the workshop, and loaded only when a visitor goes in.
import * as THREE from 'three';
import type { Palette } from '$lib/home/palette';
import { createRoom, type Focus } from './room-kit';

export type HouseItem = { id: string; mark: string; title: string };

export function createHouseScene(
	canvas: HTMLCanvasElement,
	palette: Palette,
	opts: { reduceMotion: boolean; onLost: () => void; items: HouseItem[] }
) {
	return createRoom(canvas, palette, opts, (kit, scene) => {
		const { box, rod, mesh, tag, material } = kit;
		const { wood, darkWood, paper, brass, blue, green, greenLight, plaster, ink, murasaki } =
			kit.mat;
		const sakura = material('#e3b5bd');
		const stone = material('#9a968a');
		// The same pale celadon as the village river (a scene-only accent).
		const water = material('#a9c6cb');

		// ── The room ────────────────────────────────────────────────────
		// Tatami, two mats per row, with dark cloth borders.
		for (let x = -7; x <= 7; x += 2)
			for (let z = -4.5; z <= 4.5; z += 1) box(1.94, 0.08, 0.94, x, 0.04, z, greenLight);
		box(16.2, 0.12, 10.2, 0, -0.05, 0, ink);
		// Back wall: plaster and shoji on the left, open to the garden on the right.
		box(9.2, 6, 0.2, -3.6, 3, -5.1, plaster);
		box(0.2, 6, 10.2, -8.1, 3, 0, plaster);
		for (const x of [-8, -4.1, 0.9, 7.9]) box(0.28, 6.2, 0.28, x, 3.1, -5, darkWood);
		box(16.2, 0.32, 0.32, 0, 6.1, -5, darkWood); // the lintel
		box(7, 1.1, 0.12, 4.4, 5.4, -5, paper); // a ranma panel over the opening
		for (let i = 0; i < 9; i++) box(0.05, 1.1, 0.14, 1.2 + i * 0.8, 5.4, -4.98, wood);
		// Shoji on the left wall: paper with a fine wooden grid.
		box(0.08, 4.2, 6, -7.95, 2.6, 0.4, paper);
		for (let i = 0; i <= 6; i++) box(0.1, 4.2, 0.05, -7.9, 2.6, -2.6 + i, wood);
		for (let j = 0; j <= 4; j++) box(0.1, 0.05, 6, -7.9, 0.5 + j * 1.05, 0.4, wood);
		// Engawa: the veranda between the room and the garden.
		for (let i = 0; i < 9; i++) box(0.76, 0.1, 1.4, 1.3 + i * 0.78, 0.02, -5.8, wood);

		// ── The garden ──────────────────────────────────────────────────
		box(22, 0.1, 12, 4, -0.15, -12.4, green);
		const pond = mesh(new THREE.CylinderGeometry(1, 1, 0.06, 40), water);
		pond.scale.set(3.6, 1, 1.5);
		pond.position.set(4.4, -0.08, -9);
		const hill = mesh(new THREE.SphereGeometry(1, 24, 12), green);
		hill.scale.set(7, 2.6, 1.8);
		hill.position.set(5, -0.4, -17);
		// The sun as Ōkami paints it: a flat disc with a heavy ink rim.
		const sun = mesh(new THREE.CircleGeometry(1.2, 40), material('#d9a77f'), scene, 0);
		sun.position.set(8.5, 6.2, -17.5);
		const rim = mesh(new THREE.TorusGeometry(1.22, 0.07, 6, 48), ink, scene, 0);
		rim.position.set(8.5, 6.2, -17.45);
		for (const [x, y, w] of [
			[-1.5, 6.8, 4.2],
			[12, 5.2, 3.2]
		] as const)
			kit.swirlCloud(w).position.set(x, y, -16.5);
		// A stone lantern beside the pond.
		rod(0.38, 0.25, 0.9, 0.1, -8.4, stone);
		rod(0.13, 1.2, 0.9, 0.8, -8.4, stone);
		box(0.75, 0.5, 0.75, 0.9, 1.6, -8.4, stone);
		box(0.32, 0.26, 0.8, 0.9, 1.6, -8.4, paper);
		mesh(new THREE.ConeGeometry(0.75, 0.5, 4), stone).position.set(0.9, 2.1, -8.4);
		// Pines along the back of the garden.
		for (const [x, s] of [
			[-0.8, 1],
			[9.5, 1.2]
		]) {
			rod(0.12 * s, 2.6 * s, x, 1.2 * s, -12, darkWood);
			const crown = mesh(new THREE.SphereGeometry(1, 16, 8), green);
			crown.scale.set(1.4 * s, 0.6 * s, 1 * s);
			crown.position.set(x, 2.7 * s, -12);
		}

		const spots: Record<string, Focus> = {};
		const byId: Record<string, THREE.Group> = {};
		for (const item of opts.items) {
			const g = new THREE.Group();
			scene.add(g);
			byId[item.id] = g;
		}
		const hang = (id: string, y: number) => {
			const item = opts.items.find((i) => i.id === id);
			const g = byId[id];
			if (!item || !g) return;
			const t = tag(item.mark, item.title, 0.5, g);
			t.position.set(0, y, 0.2);
		};
		let pinwheel: THREE.Group | null = null;

		// 作 Projects: a pinwheel, the windmill's little cousin.
		if (byId.projects) {
			const g = byId.projects;
			g.position.set(6.4, 0, 1.6);
			rod(0.32, 0.55, 0, 0.28, 0, darkWood, g, 0.4);
			rod(0.03, 2.2, 0, 1.4, 0, wood, g);
			pinwheel = new THREE.Group();
			pinwheel.position.set(0, 2.5, 0.08);
			g.add(pinwheel);
			[darkWood, blue, brass, green].forEach((m, i) => {
				const blade = mesh(new THREE.ConeGeometry(0.34, 0.75, 3), m, pinwheel!);
				blade.rotation.z = (i * Math.PI) / 2;
				blade.position.set(
					Math.sin((-i * Math.PI) / 2) * 0.36,
					Math.cos((-i * Math.PI) / 2) * 0.36,
					0
				);
				blade.scale.z = 0.12;
			});
			hang('projects', 3.45);
			spots['projects'] = { point: new THREE.Vector3(6.4, 1.9, 1.6), dist: 7 };
		}

		// 本 Books: the shelf of authors Hiro returns to, against the back wall.
		if (byId.writing) {
			const g = byId.writing;
			g.position.set(-2.3, 0, -4.55);
			box(2.4, 0.1, 0.7, 0, 0.05, 0, darkWood, g);
			box(2.4, 0.1, 0.7, 0, 2.6, 0, darkWood, g);
			for (const x of [-1.15, 1.15]) box(0.1, 2.6, 0.7, x, 1.3, 0, darkWood, g);
			box(2.3, 2.5, 0.06, 0, 1.3, -0.32, wood, g);
			const books = [blue, paper, darkWood, murasaki, brass, green, blue, paper];
			for (const [row, y] of [0.9, 1.75].entries()) {
				box(2.2, 0.06, 0.6, 0, y - 0.45, 0, darkWood, g);
				books.forEach((m, i) => {
					const h = 0.62 + ((i * 7 + row * 3) % 5) * 0.05;
					const b = box(0.2, h, 0.48, -0.9 + i * 0.25, y - 0.42 + h / 2, 0.02, m, g);
					if ((i + row) % 5 === 4) b.rotation.z = 0.18;
				});
			}
			hang('writing', 3.2);
			spots['writing'] = { point: new THREE.Vector3(-2.3, 1.7, -4.4), dist: 5.6 };
		}

		// 釜 The irori hearth in the middle of the room, with a kama on its hook.
		const steam: THREE.Mesh[] = [];
		if (byId.kama) {
			const g = byId.kama;
			g.position.set(-2.4, 0, -1.4);
			for (const [w, d, x, z] of [
				[1.9, 0.2, 0, -0.85],
				[1.9, 0.2, 0, 0.85],
				[0.2, 1.5, -0.85, 0],
				[0.2, 1.5, 0.85, 0]
			] as const)
				box(w, 0.14, d, x, 0.08, z, darkWood, g);
			box(1.5, 0.04, 1.5, 0, 0.03, 0, plaster, g); // ash
			for (let i = 0; i < 6; i++) {
				const a = i * 1.05;
				box(0.22, 0.1, 0.12, Math.cos(a) * 0.3, 0.09, Math.sin(a) * 0.3, ink, g).rotation.y = a;
			}
			for (let i = 0; i < 4; i++) {
				const ember = mesh(new THREE.SphereGeometry(0.06, 8, 6), material('#d9734e'), g, 0);
				ember.position.set(Math.cos(i * 1.7) * 0.18, 0.13, Math.sin(i * 1.7) * 0.18);
			}
			// 自在鉤 the hook from the beam, with its wooden fish.
			rod(0.03, 3.8, 0, 3, 0, darkWood, g);
			box(0.7, 0.16, 0.08, 0, 1.8, 0, wood, g);
			// The kama: a round iron pot with a lid and a bail handle.
			const pot = mesh(new THREE.SphereGeometry(0.45, 20, 14), ink, g);
			pot.scale.y = 0.72;
			pot.position.y = 0.72;
			rod(0.4, 0.06, 0, 1.0, 0, darkWood, g);
			rod(0.06, 0.08, 0, 1.07, 0, ink, g);
			const bail = mesh(new THREE.TorusGeometry(0.5, 0.02, 6, 24, Math.PI), ink, g);
			bail.position.y = 0.78;
			const puff = material(palette.paper);
			puff.transparent = true;
			for (let i = 0; i < 3; i++) {
				const m = puff.clone();
				kit.materials.push(m);
				const s = mesh(new THREE.SphereGeometry(0.16, 10, 8), m, g, 0);
				s.userData.phase = i / 3;
				steam.push(s);
			}
			hang('kama', 2.95);
			spots['kama'] = { point: new THREE.Vector3(-2.4, 0.8, -1.4), dist: 4.6 };
		}

		// 橋 Kaiwa: a red arched bridge across the pond, between two shores.
		if (byId.kaiwa) {
			const g = byId.kaiwa;
			g.position.set(4.4, 0, -9);
			const span = 4.4;
			const rise = 0.95;
			const arc = (t: number) => rise * Math.sin(Math.PI * t);
			for (let i = 0; i <= 13; i++) {
				const t = i / 13;
				const x = -span / 2 + t * span;
				const plank = box(0.36, 0.08, 1.2, x, arc(t) + 0.12, 0, wood, g);
				plank.rotation.z = Math.atan2(rise * Math.PI * Math.cos(Math.PI * t), span);
			}
			for (const z of [-0.62, 0.62]) {
				for (let i = 0; i <= 6; i++) {
					const t = i / 6;
					rod(0.05, 0.65, -span / 2 + t * span, arc(t) + 0.45, z, darkWood, g);
				}
				for (let i = 0; i < 12; i++) {
					const t0 = i / 12;
					const t1 = (i + 1) / 12;
					const x0 = -span / 2 + t0 * span;
					const x1 = -span / 2 + t1 * span;
					const rail = box(
						x1 - x0 + 0.02,
						0.08,
						0.1,
						(x0 + x1) / 2,
						(arc(t0) + arc(t1)) / 2 + 0.78,
						z,
						darkWood,
						g
					);
					rail.rotation.z = Math.atan2(arc(t1) - arc(t0), x1 - x0);
				}
				for (const x of [-span / 2, span / 2]) rod(0.07, 0.4, x, 0.95, z, brass, g, 0.03);
			}
			hang('kaiwa', 2.55);
			spots['kaiwa'] = { point: new THREE.Vector3(4.4, 1.2, -9), dist: 7.2 };
		}

		// 然 Nature: the tokonoma alcove, with a hanging scroll and a sakura branch.
		if (byId.nature) {
			const g = byId.nature;
			g.position.set(-6, 0, -4.4);
			box(3.2, 0.3, 1.2, 0, 0.15, 0, darkWood, g);
			box(2.9, 0.06, 1.1, 0, 0.33, 0, wood, g);
			const scroll = tag('然', '', 0.9, g);
			scroll.position.set(-0.6, 2.35, -0.5);
			rod(0.03, 1.1, -0.6, 3.05, -0.48, darkWood, g).rotation.z = Math.PI / 2;
			rod(0.22, 0.6, 0.7, 0.66, 0, blue, g, 0.14);
			for (const [a, l] of [
				[0.35, 1.3],
				[-0.25, 1],
				[0.75, 0.8]
			]) {
				const branch = rod(
					0.025,
					l,
					0.7 + Math.sin(a) * l * 0.5,
					0.95 + Math.cos(a) * l * 0.5,
					0,
					darkWood,
					g
				);
				branch.rotation.z = -a;
				for (let k = 0; k < 4; k++) {
					const f = mesh(new THREE.SphereGeometry(0.09, 8, 6), sakura, g);
					const d = 0.35 + k * 0.2;
					f.position.set(0.7 + Math.sin(a) * l * d, 0.95 + Math.cos(a) * l * d, 0.05 * (k % 2));
				}
			}
			hang('nature', 3.45);
			spots['nature'] = { point: new THREE.Vector3(-6, 1.6, -4.2), dist: 5.4 };
		}

		// 文 Contact: a low table with tea for two, and two cushions.
		if (byId.contact) {
			const g = byId.contact;
			g.position.set(1.4, 0, 0.8);
			box(2.6, 0.12, 1.6, 0, 0.62, 0, darkWood, g);
			for (const x of [-1.1, 1.1])
				for (const z of [-0.6, 0.6]) box(0.12, 0.56, 0.12, x, 0.3, z, darkWood, g);
			box(1.1, 0.04, 0.6, 0, 0.7, 0, wood, g);
			const pot = mesh(new THREE.SphereGeometry(0.22, 18, 12), blue, g);
			pot.scale.y = 0.85;
			pot.position.set(-0.25, 0.9, 0);
			rod(0.1, 0.05, -0.25, 1.1, 0, blue, g);
			const spout = rod(0.03, 0.26, -0.02, 0.92, 0, blue, g, 0.02);
			spout.rotation.z = -1;
			for (const x of [0.25, 0.48]) rod(0.07, 0.14, x, 0.79, 0.05, paper, g, 0.09);
			for (const z of [-1.25, 1.25]) box(1, 0.16, 1, 0, 0.1, z, murasaki, g);
			hang('contact', 1.9);
			spots['contact'] = { point: new THREE.Vector3(1.4, 0.95, 0.8), dist: 4.6 };
		}

		// An andon floor lantern, lit, for warmth.
		rod(0.3, 0.9, -7, 0.75, 3.8, paper);
		for (const y of [0.3, 1.2]) rod(0.32, 0.05, -7, y, 3.8, darkWood);
		const glow = new THREE.PointLight(0xffd59a, 6, 8);
		glow.position.set(-7, 1, 3.8);
		scene.add(glow);

		// The order of the objects is the order of the items.
		const shown = opts.items.filter((i) => byId[i.id] && spots[i.id]);
		const objects: THREE.Object3D[] = shown.map((i) => byId[i.id]);
		const focus = shown.map((i) => spots[i.id]);
		return {
			objects,
			focus,
			tick(dt, time) {
				if (pinwheel && !opts.reduceMotion) pinwheel.rotation.z -= dt * 1.6;
				// Steam from the kama: puffs rise, grow and fade, one after another.
				for (const p of steam) {
					const t = opts.reduceMotion ? 0.3 : (time * 0.35 + (p.userData.phase as number)) % 1;
					p.position.set(Math.sin(t * 5 + p.userData.phase * 6) * 0.12, 1.1 + t * 1.3, 0);
					p.scale.setScalar(0.6 + t * 1.2);
					(p.material as THREE.MeshToonMaterial).opacity = 0.7 * (1 - t);
				}
			}
		};
	});
}
