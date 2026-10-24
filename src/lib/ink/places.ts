// Pure layout for the ink village: where things stand, how high the rolling
// ground is, and how the akabeko walks around things. No three.js here, so
// it is easy to test.
export type PlaceId = 'windmill' | 'sail' | 'izakaya' | 'board' | 'tree' | 'hiro';
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
	{ x: -3.9, z: -2.4, s: 1.05, role: 'treeA' },
	{ x: -5.0, z: -3.8, s: 0.85, role: 'treeB' },
	{ x: 5.2, z: -1.2, s: 0.95, role: 'treeA' }
] as const;
export const IZAKAYA = { x: -5.7, z: 0.4, rotY: 0.22 };
export const BOARD = { x: -8.1, z: 0.8, rotY: 0.35 };
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
export const WALK = { minX: -10, maxX: 8.2, minZ: -5.4, maxZ: 3.2 };

type Circle = Pt & { r: number };
const side = (rot: number, d: number) => ({ x: Math.sin(rot) * d, z: Math.cos(rot) * d });
export function villageLayout(portrait = 0) {
	const p = Math.min(1, Math.max(0, portrait));
	const izakaya = { ...IZAKAYA, x: IZAKAYA.x + 0.7 * p };
	const board = { ...BOARD, x: BOARD.x + 0.7 * p };
	const houseScale = 1 + 0.12 * p;
	// The same layout drives meshes, destinations and full-body collisions.
	const obstacles: Circle[] = [
		{ ...MILL, r: 1.45 + 0.85 },
		...TREES.map((t) => ({ x: t.x, z: t.z, r: 0.13 * t.s + 0.85 })),
		{ ...izakaya, r: houseScale + 0.85 },
		{ ...board, r: 0.9 + 0.85 }
	];
	return { izakaya, board, houseScale, obstacles };
}
export type VillageLayout = ReturnType<typeof villageLayout>;
const DEFAULT_LAYOUT = villageLayout();
export const OBSTACLES = DEFAULT_LAYOUT.obstacles;

// Where the akabeko stands to look at each place: a little in front of it.
export function spotFor(place: PlaceId, index = 0, layout = DEFAULT_LAYOUT): Pt | null {
	switch (place) {
		case 'windmill':
		case 'sail':
			return { x: MILL.x - 0.2, z: MILL.z + 2.65 };
		case 'izakaya': {
			const f = side(layout.izakaya.rotY, 2.15 + (layout.houseScale - 1));
			return { x: layout.izakaya.x + f.x, z: layout.izakaya.z + f.z };
		}
		case 'board': {
			const f = side(layout.board.rotY, 2.05);
			return { x: layout.board.x + f.x, z: layout.board.z + f.z };
		}
		case 'tree': {
			const t = TREES[index] ?? TREES[0];
			return { x: t.x + 0.3, z: t.z + 0.7 * t.s + 0.55 };
		}
		default:
			return null;
	}
}

export function clampWalk(p: Pt, layout = DEFAULT_LAYOUT): Pt {
	const at = {
		x: Math.min(WALK.maxX, Math.max(WALK.minX, p.x)),
		z: Math.min(WALK.maxZ, Math.max(WALK.minZ, p.z))
	};
	const clear = (v: Pt) =>
		v.x >= WALK.minX &&
		v.x <= WALK.maxX &&
		v.z >= WALK.minZ &&
		v.z <= WALK.maxZ &&
		layout.obstacles.every((o) => Math.hypot(v.x - o.x, v.z - o.z) >= o.r - 1e-7);
	if (clear(at)) return at;
	const candidates: Pt[] = [];
	for (const o of layout.obstacles) {
		if (Math.hypot(at.x - o.x, at.z - o.z) >= o.r) continue;
		const a = Math.atan2(at.z - o.z, at.x - o.x);
		for (let k = 0; k < 32; k++) {
			const angle = a + (k / 32) * Math.PI * 2;
			candidates.push({
				x: o.x + Math.cos(angle) * (o.r + 0.001),
				z: o.z + Math.sin(angle) * (o.r + 0.001)
			});
		}
		// At overlapping clearances, their intersections are the nearest
		// stable exit. Sequential pushes could otherwise oscillate inside both.
		for (const other of layout.obstacles) {
			const dx = other.x - o.x,
				dz = other.z - o.z,
				d = Math.hypot(dx, dz);
			if (!d || d >= o.r + other.r || d <= Math.abs(o.r - other.r)) continue;
			const along = (o.r * o.r - other.r * other.r + d * d) / (2 * d);
			const h = Math.sqrt(Math.max(0, o.r * o.r - along * along));
			for (const sign of [-1, 1]) {
				const x = o.x + (dx / d) * along - ((sign * dz) / d) * h;
				const z = o.z + (dz / d) * along + ((sign * dx) / d) * h;
				const nx = (x - o.x) / o.r + (x - other.x) / other.r;
				const nz = (z - o.z) / o.r + (z - other.z) / other.r;
				candidates.push({ x: x + nx * 0.002, z: z + nz * 0.002 });
			}
		}
	}
	const free = candidates
		.filter(clear)
		.sort((a, b) => Math.hypot(a.x - at.x, a.z - at.z) - Math.hypot(b.x - at.x, b.z - at.z));
	return free[0] ?? at;
}

// The head extends ahead of the feet. Keep that offset clear as well.
export function clampActor(p: Pt, heading: number, layout = DEFAULT_LAYOUT): Pt {
	const root = clampWalk(p, layout);
	const dx = Math.cos(heading) * 0.22,
		dz = -Math.sin(heading) * 0.22;
	const head = clampWalk({ x: root.x + dx, z: root.z + dz }, layout);
	return { x: head.x - dx, z: head.z - dz };
}

// A straight path, with a waypoint beside each thing that is in the way.
export function route(from: Pt, to: Pt, layout = DEFAULT_LAYOUT): Pt[] {
	const goal = clampWalk(to, layout);
	const path: Pt[] = [];
	let a = from;
	for (let step = 0; step < 4; step++) {
		const hit = firstBlock(a, goal, layout);
		if (!hit) break;
		path.push(hit);
		a = hit;
	}
	path.push(goal);
	return path;
}

function firstBlock(a: Pt, b: Pt, layout: VillageLayout): Pt | null {
	const dx = b.x - a.x,
		dz = b.z - a.z;
	const len2 = dx * dx + dz * dz;
	if (len2 < 1e-6) return null;
	let best: { t: number; p: Pt } | null = null;
	for (const o of layout.obstacles) {
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
		const r = o.r + 0.65;
		best = { t, p: clampWalk({ x: o.x + (nx / n) * r, z: o.z + (nz / n) * r }, layout) };
	}
	return best?.p ?? null;
}

export function nearestSpot(
	p: Pt,
	within = 1.1,
	layout = DEFAULT_LAYOUT
): { place: PlaceId; index: number } | null {
	let best: { place: PlaceId; index: number; d: number } | null = null;
	const consider = (place: PlaceId, index: number) => {
		const s = spotFor(place, index, layout);
		if (!s) return;
		const d = Math.hypot(s.x - p.x, s.z - p.z);
		if (d <= within && (!best || d < best.d)) best = { place, index, d };
	};
	consider('windmill', 0);
	consider('izakaya', 0);
	consider('board', 0);
	TREES.forEach((_, i) => consider('tree', i));
	if (!best) return null;
	const { place, index } = best;
	return { place, index };
}
