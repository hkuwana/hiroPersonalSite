// Pure layout for the ink village: where things stand, how high the rolling
// ground is, and how the akabeko walks around things. No three.js here, so
// it is easy to test.
export type PlaceId = 'windmill' | 'sail' | 'torii' | 'board' | 'tree' | 'hiro';
export type Pt = { x: number; z: number };
export type Dome = {
	x: number;
	y: number;
	z: number;
	sx: number;
	sy: number;
	sz: number;
	wave: number; // how much the top rolls, as a fraction of the height
	seed: number;
};

// Hills are half ellipsoids ("domes") with a rolling top, like the soft,
// wavy hills of sumi-e landscapes.
export const DOMES = {
	far: { x: 9, y: -0.6, z: -17, sx: 14, sy: 3.4, sz: 5, wave: 0.22, seed: 1.3 },
	mid: { x: -6.5, y: -0.4, z: -7, sx: 11, sy: 2.1, sz: 5, wave: 0.28, seed: 4.1 },
	near: { x: 1.4, y: -0.6, z: 0.2, sx: 13, sy: 0.95, sz: 6.5, wave: 0.4, seed: 2.2 }
} satisfies Record<string, Dome>;
export const FLOOR_Y = -0.5;

export const MILL = { x: 1.3, z: 0 };
export const TREES = [
	{ x: -2.6, z: 1.2, s: 1.15, role: 'treeA' },
	{ x: -3.7, z: -0.4, s: 0.85, role: 'treeB' },
	{ x: 5.2, z: -1.2, s: 0.95, role: 'treeA' }
] as const;
export const TORII = { x: -6.2, z: -6, rotY: 0.35 };
export const BOARD = { x: -7.4, z: -2.2, rotY: 0.55 };
export const START = { x: -0.6, z: 2.1 };

// A few long sine swells: smooth, never sharp, never the same twice.
export function swell(x: number, z: number, seed: number): number {
	return (
		0.55 * Math.sin(x * 0.42 + seed) +
		0.3 * Math.sin(x * 0.97 + z * 0.35 + seed * 2.1) +
		0.15 * Math.sin(x * 1.9 - z * 0.6 + seed * 3.3)
	);
}

// Height of a dome at (x, z): an ellipsoid, then rolled by `swell`.
// The scene shapes its hill meshes with this same function.
export function domeHeight(d: Dome, x: number, z: number): number {
	const u = ((x - d.x) / d.sx) ** 2 + ((z - d.z) / d.sz) ** 2;
	if (u >= 1) return -Infinity;
	return d.y + d.sy * Math.sqrt(1 - u) * (1 + d.wave * swell(x, z, d.seed));
}

export function groundY(x: number, z: number): number {
	return Math.max(FLOOR_Y, domeHeight(DOMES.near, x, z), domeHeight(DOMES.mid, x, z));
}

// The far ridges that hide the edge of the ground plane: a skyline of
// soft, rolling peaks.
export function ridgeHeight(x: number, base: number, amp: number, seed: number): number {
	return (
		base +
		amp *
			(0.5 * Math.sin(x * 0.11 + seed) +
				0.3 * Math.sin(x * 0.27 + seed * 1.7) +
				0.2 * Math.sin(x * 0.63 + seed * 2.9))
	);
}

// The akabeko stays on the hills in front of the camera.
export const WALK = { minX: -9.2, maxX: 8.2, minZ: -5.4, maxZ: 2.7 };

type Circle = Pt & { r: number };
const side = (rot: number, d: number) => ({ x: Math.sin(rot) * d, z: Math.cos(rot) * d });
export const OBSTACLES: Circle[] = [
	{ ...MILL, r: 1.6 },
	...TREES.map((t) => ({ x: t.x, z: t.z, r: 0.45 * t.s + 0.2 })),
	// Torii posts: the akabeko can walk through the gate, between them.
	...[-0.42, 0.42].map((d) => ({
		x: TORII.x + Math.cos(TORII.rotY) * d,
		z: TORII.z - Math.sin(TORII.rotY) * d,
		r: 0.22
	})),
	{ ...BOARD, r: 0.6 }
];

// Where the akabeko stands to look at each place: a little in front of it.
export function spotFor(place: PlaceId, index = 0): Pt | null {
	switch (place) {
		case 'windmill':
		case 'sail':
			return { x: MILL.x - 0.2, z: MILL.z + 2.0 };
		case 'torii': {
			const f = side(TORII.rotY, 1.3);
			return { x: TORII.x + f.x, z: TORII.z + f.z };
		}
		case 'board': {
			const f = side(BOARD.rotY, 1.2);
			return { x: BOARD.x + f.x, z: BOARD.z + f.z };
		}
		case 'tree': {
			const t = TREES[index] ?? TREES[0];
			return { x: t.x + 0.3, z: t.z + 0.7 * t.s + 0.55 };
		}
		default:
			return null;
	}
}

export function clampWalk(p: Pt): Pt {
	let x = Math.min(WALK.maxX, Math.max(WALK.minX, p.x));
	let z = Math.min(WALK.maxZ, Math.max(WALK.minZ, p.z));
	for (const o of OBSTACLES) {
		const dx = x - o.x,
			dz = z - o.z;
		const d = Math.hypot(dx, dz);
		if (d < o.r) {
			// Push straight out; from the exact center, push toward the camera.
			x = d > 1e-6 ? o.x + (dx / d) * o.r : o.x;
			z = d > 1e-6 ? o.z + (dz / d) * o.r : o.z + o.r;
		}
	}
	return { x, z };
}

// A straight path, with a waypoint beside each thing that is in the way.
export function route(from: Pt, to: Pt): Pt[] {
	const goal = clampWalk(to);
	const path: Pt[] = [];
	let a = from;
	for (let step = 0; step < 4; step++) {
		const hit = firstBlock(a, goal);
		if (!hit) break;
		path.push(hit);
		a = hit;
	}
	path.push(goal);
	return path;
}

function firstBlock(a: Pt, b: Pt): Pt | null {
	const dx = b.x - a.x,
		dz = b.z - a.z;
	const len2 = dx * dx + dz * dz;
	if (len2 < 1e-6) return null;
	let best: { t: number; p: Pt } | null = null;
	for (const o of OBSTACLES) {
		const t = Math.min(1, Math.max(0, ((o.x - a.x) * dx + (o.z - a.z) * dz) / len2));
		const cx = a.x + dx * t,
			cz = a.z + dz * t;
		const d = Math.hypot(o.x - cx, o.z - cz);
		// Ends of the path that touch a circle are fine: only block the middle.
		if (d >= o.r - 0.05 || t <= 0.02 || t >= 0.98) continue;
		if (best && best.t < t) continue;
		// Step to the side of the circle that the path already leans toward.
		let nx = cx - o.x,
			nz = cz - o.z;
		let n = Math.hypot(nx, nz);
		if (n < 1e-6) {
			nx = -dz;
			nz = dx;
			n = Math.hypot(nx, nz);
		}
		const r = o.r + 0.35;
		best = { t, p: clampWalk({ x: o.x + (nx / n) * r, z: o.z + (nz / n) * r }) };
	}
	return best?.p ?? null;
}

export function nearestSpot(p: Pt, within = 1.1): { place: PlaceId; index: number } | null {
	let best: { place: PlaceId; index: number; d: number } | null = null;
	const consider = (place: PlaceId, index: number) => {
		const s = spotFor(place, index);
		if (!s) return;
		const d = Math.hypot(s.x - p.x, s.z - p.z);
		if (d <= within && (!best || d < best.d)) best = { place, index, d };
	};
	consider('windmill', 0);
	consider('torii', 0);
	consider('board', 0);
	TREES.forEach((_, i) => consider('tree', i));
	if (!best) return null;
	const { place, index } = best;
	return { place, index };
}
