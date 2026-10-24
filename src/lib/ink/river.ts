// 川 The river you hear in the village. It comes down from the hills behind
// Fuji, bends past the windmill, and runs out to the front, with a red
// taiko-bashi bridge across it. The water is flat paint with white curls and
// ink banks, as in Ōkami. The path is pure math, so tests cover it.
import * as THREE from 'three';
import { FLOOR_Y, groundY, type Pt } from './places';

// Control points, from the far hills to the front edge of the scene.
export const RIVER_PATH: Pt[] = [
	{ x: 3.2, z: -15 },
	{ x: 4.6, z: -9.5 },
	{ x: 6.4, z: -5.4 },
	{ x: 7.1, z: -2.2 },
	{ x: 6.7, z: 0.9 },
	{ x: 5.5, z: 3.4 },
	{ x: 4.6, z: 6.5 }
];
// Where the bridge crosses, as a fraction of the river's length.
export const BRIDGE_AT = 0.7;

function curve() {
	return new THREE.CatmullRomCurve3(
		RIVER_PATH.map((p) => new THREE.Vector3(p.x, 0, p.z)),
		false,
		'centripetal'
	);
}
// A point on the river, the way the water flows there, and its width.
export function riverAt(t: number) {
	const c = curve();
	const p = c.getPointAt(t);
	const d = c.getTangentAt(t);
	return { x: p.x, z: p.z, dx: d.x, dz: d.z, width: 0.55 + 1.15 * t };
}
const waterY = (x: number, z: number) => Math.max(FLOOR_Y, groundY(x, z)) + 0.035;

// A flat ribbon that lies on the ground, from a list of points and widths.
function ribbon(points: { x: number; z: number; w: number }[], lift: number) {
	const pos: number[] = [];
	const idx: number[] = [];
	points.forEach((p, i) => {
		const q = points[Math.min(points.length - 1, i + 1)];
		const o = points[Math.max(0, i - 1)];
		let dx = q.x - o.x,
			dz = q.z - o.z;
		const l = Math.hypot(dx, dz) || 1;
		dx /= l;
		dz /= l;
		// The side direction is the flow turned a quarter turn.
		const nx = -dz * p.w * 0.5,
			nz = dx * p.w * 0.5;
		for (const s of [-1, 1]) {
			const x = p.x + nx * s,
				z = p.z + nz * s;
			pos.push(x, waterY(x, z) + lift, z);
		}
		if (i > 0) {
			const a = (i - 1) * 2;
			idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
		}
	});
	const g = new THREE.BufferGeometry();
	g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
	g.setIndex(idx);
	g.computeVertexNormals();
	return g;
}

type Kit = {
	inked(geo: THREE.BufferGeometry, mat: THREE.Material, width?: number): THREE.Mesh;
	water: THREE.Material;
	foam: THREE.Material;
	ink: THREE.Material;
	red: THREE.Material;
	wood: THREE.Material;
};

export function createRiver(kit: Kit) {
	const g = new THREE.Group();
	const N = 90;
	const samples = Array.from({ length: N + 1 }, (_, i) => riverAt(i / N));
	const flat = (geo: THREE.BufferGeometry, m: THREE.Material) => {
		const mesh = new THREE.Mesh(geo, m);
		g.add(mesh);
		return mesh;
	};
	flat(
		ribbon(
			samples.map((s) => ({ x: s.x, z: s.z, w: s.width })),
			0
		),
		kit.water
	);
	// Ink banks on both sides.
	for (const side of [-1, 1])
		flat(
			ribbon(
				samples.map((s) => ({
					x: s.x - s.dz * s.width * 0.5 * side,
					z: s.z + s.dx * s.width * 0.5 * side,
					w: 0.05 + 0.03 * Math.sin(s.x * 3 + side)
				})),
				0.012
			),
			kit.ink
		);
	// Ōkami water: short white strokes along the flow, each ending in a curl.
	for (let k = 0; k < 16; k++) {
		const t0 = 0.08 + k * 0.055;
		const lane = ((k * 37) % 7) / 7 - 0.43;
		const pts: { x: number; z: number; w: number }[] = [];
		for (let j = 0; j <= 10; j++) {
			const s = riverAt(Math.min(0.999, t0 + j * 0.0045));
			const off = lane * s.width * 0.8;
			pts.push({
				x: s.x - s.dz * off,
				z: s.z + s.dx * off,
				w: 0.035 * Math.sin((Math.PI * j) / 10) + 0.008
			});
		}
		// The curl: a small loop at the end of the stroke.
		const end = riverAt(Math.min(0.999, t0 + 0.045));
		const off = lane * end.width * 0.8;
		const cx = end.x - end.dz * off,
			cz = end.z + end.dx * off;
		const r = 0.09 + 0.05 * end.width;
		for (let j = 1; j <= 12; j++) {
			const a = (j / 12) * Math.PI * 1.6 - Math.PI / 2;
			const rr = r * (1 - j / 16);
			pts.push({
				x: cx + Math.cos(a) * rr * end.dx - Math.sin(a) * rr * end.dz,
				z: cz + Math.cos(a) * rr * end.dz + Math.sin(a) * rr * end.dx,
				w: 0.03 * (1 - j / 14)
			});
		}
		flat(ribbon(pts, 0.008), kit.foam);
	}

	// 太鼓橋 A drum bridge across the river.
	const at = riverAt(BRIDGE_AT);
	const bridge = new THREE.Group();
	const span = at.width + 1.5;
	const rise = 0.55;
	const arc = (t: number) => rise * Math.sin(Math.PI * t);
	const base = waterY(at.x, at.z) - 0.02;
	for (let i = 0; i <= 11; i++) {
		const t = i / 11;
		const plank = kit.inked(new THREE.BoxGeometry(span / 11 + 0.03, 0.06, 0.7), kit.wood, 0.012);
		plank.position.set(-span / 2 + t * span, arc(t) + 0.06, 0);
		plank.rotation.z = Math.atan2(rise * Math.PI * Math.cos(Math.PI * t), span);
		bridge.add(plank);
	}
	for (const z of [-0.36, 0.36]) {
		for (let i = 0; i <= 5; i++) {
			const t = i / 5;
			const post = kit.inked(new THREE.CylinderGeometry(0.035, 0.035, 0.42, 6), kit.red, 0.012);
			post.position.set(-span / 2 + t * span, arc(t) + 0.27, z);
			bridge.add(post);
		}
		for (let i = 0; i < 10; i++) {
			const t0 = i / 10,
				t1 = (i + 1) / 10;
			const x0 = -span / 2 + t0 * span,
				x1 = -span / 2 + t1 * span;
			const rail = kit.inked(new THREE.BoxGeometry(x1 - x0 + 0.02, 0.05, 0.06), kit.red, 0.01);
			rail.position.set((x0 + x1) / 2, (arc(t0) + arc(t1)) / 2 + 0.47, z);
			rail.rotation.z = Math.atan2(arc(t1) - arc(t0), x1 - x0);
			bridge.add(rail);
		}
	}
	bridge.position.set(at.x, base, at.z);
	// Turn the span (local x) to point across the flow, at (-dz, dx).
	bridge.rotation.y = Math.atan2(-at.dx, -at.dz);
	g.add(bridge);
	return { group: g, bridge };
}
