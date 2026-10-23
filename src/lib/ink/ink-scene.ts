// 墨 hi-fi island: the 風車 windmill as a small 3D diorama in the Okami
// sumi-e style. Flat toon steps, brush-wobbled ink outlines (inverted hull),
// no textures to download. The sails can leave the hub and become a kite.
// The brush (after Ōkami's Celestial Brush) can bloom a tree into sakura,
// call a gust of wind, and swap the sun for a crescent moon. An akabeko
// (Hiro's year is the ox) walks the village; each landmark and each sail
// opens one part of the site.
// Loaded only by a dynamic import, so the lo-fi page never pays for three.js.
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { FACETS } from '$lib/home/facets';
import type { Palette } from '$lib/home/palette';
import { createBeko } from './beko';
import {
	BOARD,
	clampWalk,
	DOMES,
	groundY,
	MILL,
	nearestSpot,
	ridgeHeight,
	route,
	spotFor,
	START,
	swell,
	TORII,
	TREES,
	type Dome,
	type PlaceId,
	type Pt
} from './places';

export type PlaceRef = { place: PlaceId; index: number };
export type Pick = PlaceRef | { ground: Pt };

export type InkScene = {
	setPalette(p: Palette, night: boolean): void;
	setKite(on: boolean): void;
	isKite(): boolean;
	spin(impulse: number): void;
	gust(dir: 1 | -1): void;
	// Bloom every tree whose screen position passes `test` (CSS px).
	bloomInside(test: (x: number, y: number) => boolean): number;
	flare(): void;
	// What is under a canvas point (CSS px): a place, or open ground.
	pick(x: number, y: number): Pick | null;
	// The place under a canvas point, with a label anchor in CSS px.
	hover(x: number, y: number): (PlaceRef & { x: number; y: number }) | null;
	walkTo(place: PlaceId, index?: number): void;
	walkToPoint(p: Pt): void;
	setMove(dx: number, dz: number): void;
	near(): PlaceRef | null;
	hop(): void;
	// Turn the windmill until sail `index` points up, then hold it there.
	seekSail(index: number): void;
	bloomTree(index: number): void;
	setPointer(nx: number, ny: number): void;
	// 0..1 through the home page's scroll transition: the camera rises.
	setScroll(p: number): void;
	// Stop drawing (off screen) and start again.
	setActive(on: boolean): void;
	resize(w: number, h: number): void;
	info(): { calls: number; triangles: number };
	dispose(): void;
};

type Role =
	| 'sky'
	| 'far'
	| 'mid'
	| 'near'
	| 'tower'
	| 'cap'
	| 'door'
	| 'hub'
	| 'wood'
	| 'line'
	| 'sun'
	| 'cloud'
	| 'treeA'
	| 'treeB'
	| 'torii'
	| 'snow'
	| 'sakura'
	| 'blossom'
	| 'bekoInk'
	| 'ridgeNear'
	| 'ridgeFar';

// The site has no pink token: sakura is a scene-only accent, used only
// after a brush stroke makes a tree bloom.
const SAKURA = '#e9b3ba';
const BLOSSOM = '#f8e3e6';

// Scene roles from the live tokens. At night the site's dark tokens make a
// lacquer look: pale ink lines on a deep sky, like makie on urushi.
function roles(p: Palette, night: boolean): Record<Role, string> {
	const c = (a: string, b: string, t: number) =>
		'#' + new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString();
	return night
		? {
				sky: c(p.paper, p.kon, 0.22),
				far: c(p.paper, p.kon, 0.42),
				mid: p.mossLight,
				near: c(p.mossLight, p.moss, 0.35),
				tower: c(p.inkMute, p.paper2, 0.25),
				cap: p.ebicha,
				door: p.kon,
				hub: p.gold,
				wood: p.wood,
				line: p.ink,
				bekoInk: c(p.paper, p.kon, 0.25),
				sun: p.ink,
				cloud: c(p.paper, p.kon, 0.32),
				treeA: p.moss,
				treeB: p.gold,
				torii: p.ebicha,
				snow: c(p.ink, p.kon, 0.2),
				sakura: c(SAKURA, p.paper, 0.35),
				blossom: c(BLOSSOM, p.paper, 0.3),
				ridgeNear: c(p.mossLight, p.paper, 0.4),
				ridgeFar: c(p.paper, p.kon, 0.3)
			}
		: {
				sky: p.paper,
				far: c(p.paper, p.kon, 0.16),
				mid: p.mossLight,
				near: p.moss,
				tower: p.paper2,
				cap: p.ebicha,
				door: p.kon,
				hub: p.gold,
				wood: p.wood,
				line: p.ink,
				bekoInk: p.ink,
				sun: '#d9a77f',
				cloud: p.paper2,
				treeA: p.moss,
				treeB: p.gold,
				torii: p.ebicha,
				snow: '#fbfaf4',
				sakura: SAKURA,
				blossom: BLOSSOM,
				ridgeNear: c(p.mossLight, p.paper, 0.35),
				ridgeFar: c(p.paper, p.kon, 0.12)
			};
}

const SAIL = { W: 0.62, L: 1.95, OFF: 0.32 } as const;
const TOWER_X = 1.3;
const HUB = new THREE.Vector3(TOWER_X, 3.95, 1.0);
const KITE_HOME = new THREE.Vector3(TOWER_X - 4.6, 6.4, -1.2);
const TAU = Math.PI * 2;

const smooth = (x: number) => {
	const t = Math.min(1, Math.max(0, x));
	return t * t * (3 - 2 * t);
};

export function createInkScene(
	canvas: HTMLCanvasElement,
	palette: Palette,
	opts: {
		night: boolean;
		reduceMotion: boolean;
		initialKite?: boolean;
		onFrame?: (ms: number) => void;
		onArrive?: (p: PlaceRef) => void;
		// The GPU dropped the context: the page falls back to lo-fi.
		onLost?: () => void;
	}
): InkScene {
	const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'default' });
	// Touch devices get fewer pixels: they are usually phones on battery.
	const coarse = matchMedia('(pointer: coarse)').matches;
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));
	const onLost = (e: Event) => {
		e.preventDefault();
		opts.onLost?.();
	};
	canvas.addEventListener('webglcontextlost', onLost);
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(32, 16 / 9, 0.1, 200);
	const lookAt = new THREE.Vector3(-0.4, 3.6, 0);
	let camDist = 17;

	// Toon ramp: three flat steps, no gradients.
	const ramp = new THREE.DataTexture(
		new Uint8Array([120, 120, 120, 255, 190, 190, 190, 255, 255, 255, 255, 255]),
		3,
		1,
		THREE.RGBAFormat
	);
	ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
	ramp.needsUpdate = true;

	scene.add(new THREE.AmbientLight(0xffffff, 1.35));
	const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
	sunLight.position.set(6, 10, 8);
	scene.add(sunLight);

	// One material per role, so a palette change is a few color writes.
	const toon = new Map<Role, THREE.MeshToonMaterial>();
	const flat = new Map<Role, THREE.MeshBasicMaterial>();
	const sailMats: THREE.MeshToonMaterial[] = [];
	const outlineMat = new THREE.ShaderMaterial({
		uniforms: { color: { value: new THREE.Color() }, thickness: { value: 1 } },
		side: THREE.BackSide,
		vertexShader: /* glsl */ `
			uniform float thickness;
			attribute float ink;
			void main() {
				// A slow wobble along the surface reads as a brush, not a CAD line.
				float w = 0.7 + 0.55 * sin(position.x * 5.1 + position.y * 3.7 + position.z * 4.3);
				vec3 p = position + normal * ink * thickness * w;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
			}`,
		fragmentShader: /* glsl */ `
			uniform vec3 color;
			void main() {
				gl_FragColor = vec4(color, 1.0);
				#include <colorspace_fragment>
			}`
	});
	const lineMat = new THREE.LineBasicMaterial({ transparent: true });
	const getToon = (r: Role) => {
		if (!toon.has(r)) toon.set(r, new THREE.MeshToonMaterial({ gradientMap: ramp }));
		return toon.get(r)!;
	};
	const getFlat = (r: Role) => {
		if (!flat.has(r)) flat.set(r, new THREE.MeshBasicMaterial({ toneMapped: false }));
		return flat.get(r)!;
	};

	// Inverted hull: a copy with merged (smooth) normals, pushed out and drawn
	// back-faces only in ink. `w` is the line weight in world units.
	function inked(geo: THREE.BufferGeometry, mat: THREE.Material, w = 0.035) {
		const mesh = new THREE.Mesh(geo, mat);
		const hullSrc = geo.clone();
		hullSrc.deleteAttribute('normal');
		hullSrc.deleteAttribute('uv');
		const hull = mergeVertices(hullSrc, 1e-4);
		hull.computeVertexNormals();
		hull.setAttribute(
			'ink',
			new THREE.BufferAttribute(new Float32Array(hull.attributes.position.count).fill(w), 1)
		);
		mesh.add(new THREE.Mesh(hull, outlineMat));
		return mesh;
	}

	// ── Land ─────────────────────────────────────────────────────────────
	const dome = (d: Dome, role: Role, w: number) => {
		const g = new THREE.SphereGeometry(1, 72, 18, 0, TAU, 0, Math.PI / 2);
		g.scale(d.sx, d.sy, d.sz);
		// Roll the top with the same swell that groundY() uses.
		const pos = g.attributes.position as THREE.BufferAttribute;
		for (let i = 0; i < pos.count; i++) {
			const wx = d.x + pos.getX(i),
				wz = d.z + pos.getZ(i);
			pos.setY(i, pos.getY(i) * (1 + d.wave * swell(wx, wz, d.seed)));
		}
		g.computeVertexNormals();
		const m = inked(g, getToon(role), w);
		m.position.set(d.x, d.y, d.z);
		return m;
	};
	const far1 = dome(DOMES.far, 'mid', 0.08);
	// 富士: concave slopes, a flat top and a snow cap, far behind the mill.
	const fujiProfile = (pts: number[][]) => pts.map(([x, y]) => new THREE.Vector2(x, y));
	const far2 = inked(
		new THREE.LatheGeometry(
			fujiProfile([
				[7.5, 0],
				[5.4, 0.9],
				[3.7, 2.1],
				[2.3, 3.4],
				[1.3, 4.5],
				[0.95, 4.85],
				[0, 4.9]
			]),
			40
		),
		getToon('far'),
		0.1
	);
	far2.position.set(-6, -0.6, -24);
	const snow = new THREE.Mesh(
		new THREE.LatheGeometry(
			fujiProfile([
				[2.0, 3.65],
				[1.36, 4.5],
				[0.99, 4.88],
				[0, 4.93]
			]),
			40
		),
		getToon('snow')
	);
	far2.add(snow);
	const mid = dome(DOMES.mid, 'mid', 0.06);
	const near = dome(DOMES.near, 'near', 0.05);
	const floor = new THREE.Mesh(new THREE.PlaneGeometry(90, 72), getToon('near'));
	floor.rotation.x = -Math.PI / 2;
	floor.position.y = -0.5;
	scene.add(far1, far2, mid, near, floor);

	// Two far ridges, one behind the other, hide the straight edge of the
	// ground: a rolling skyline with an ink line along its top.
	function ridge(z: number, base: number, amp: number, seed: number, role: Role) {
		const strip = (lift: number) => {
			const g = new THREE.PlaneGeometry(150, 1, 300, 1);
			const pos = g.attributes.position as THREE.BufferAttribute;
			for (let i = 0; i < pos.count; i++) {
				const top = pos.getY(i) > 0;
				pos.setY(i, top ? ridgeHeight(pos.getX(i), base, amp, seed) + lift : -1.5);
			}
			return g;
		};
		const body = new THREE.Mesh(strip(0), getFlat(role));
		body.position.z = z;
		const ink = new THREE.Mesh(strip(0.11), getFlat('line'));
		ink.position.z = z - 0.05;
		scene.add(ink, body);
	}
	ridge(-35, 1.5, 1.0, 0.7, 'ridgeNear');
	ridge(-46, 2.7, 1.5, 2.4, 'ridgeFar');

	// ── Sun / moon and clouds ────────────────────────────────────────────
	// A flat disc has no back faces to extrude: give it an ink ring instead.
	const sun = new THREE.Mesh(new THREE.CircleGeometry(1.9, 48), getFlat('sun'));
	sun.position.set(9.5, 11, -30);
	const sunRing = new THREE.Mesh(new THREE.RingGeometry(1.9, 2.08, 48), getFlat('line'));
	sun.add(sunRing);
	sunRing.position.z = 0.01;
	scene.add(sun);

	// The moon is a crescent: an ink crescent a little larger, behind the body.
	function crescent(R: number, r: number, d: number) {
		const x = (R * R - r * r + d * d) / (2 * d),
			y = Math.sqrt(R * R - x * x);
		const a = Math.atan2(y, x);
		const shape = new THREE.Shape();
		shape.absarc(0, 0, R, a, TAU - a, false);
		shape.absarc(d, 0, r, Math.atan2(-y, x - d), Math.atan2(y, x - d), true);
		return new THREE.ShapeGeometry(shape, 24);
	}
	const moon = new THREE.Group();
	const moonInk = new THREE.Mesh(crescent(1.62, 1.18, 0.85), getFlat('line'));
	const moonBody = new THREE.Mesh(crescent(1.5, 1.3, 0.85), getFlat('sun'));
	moonBody.position.z = 0.01;
	moon.add(moonInk, moonBody);
	moon.position.copy(sun.position);
	moon.rotation.z = 0.55;
	scene.add(moon);

	const clouds: THREE.Group[] = [];
	function cloud(lobes: [number, number, number][]) {
		const g = new THREE.Group();
		for (const [x, y, r] of lobes) {
			const body = new THREE.Mesh(new THREE.CircleGeometry(r, 28), getFlat('cloud'));
			body.position.set(x, y, 0.02);
			const rim = new THREE.Mesh(new THREE.CircleGeometry(r + 0.1, 28), getFlat('line'));
			rim.position.set(x, y, 0);
			// Okami's curl: a spiral of ink inside each lobe.
			const pts: THREE.Vector3[] = [];
			for (let k = 0; k <= 40; k++) {
				const a = (k / 40) * TAU * 1.4;
				const rr = r * 0.62 * (1 - k / 52);
				pts.push(new THREE.Vector3(x + Math.cos(a) * rr, y + Math.sin(a) * rr, 0.04));
			}
			const curl = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat);
			g.add(rim, body, curl);
		}
		scene.add(g);
		clouds.push(g);
		return g;
	}
	cloud([
		[0, 0, 0.9],
		[1.2, 0.3, 1.1],
		[2.4, 0, 0.8]
	]).position.set(-9, 9.5, -24);
	cloud([
		[0, 0, 0.7],
		[1, 0.25, 0.9],
		[1.9, -0.05, 0.6]
	]).position.set(3, 12.5, -26);
	cloud([
		[0, 0, 0.6],
		[0.9, 0.2, 0.75]
	]).position.set(14, 7.5, -22);

	// ── Windmill tower ───────────────────────────────────────────────────
	const mill = new THREE.Group();
	mill.position.set(TOWER_X, 0.25, 0);
	const tower = inked(
		new THREE.CylinderGeometry(0.66, 1.18, 3.6, 8, 1, false, Math.PI / 8),
		getToon('tower'),
		0.04
	);
	tower.position.y = 1.8;
	mill.add(tower);
	for (let y = 0.45; y < 3.5; y += 0.5) {
		const r = 1.18 + (0.66 - 1.18) * (y / 3.6) + 0.012;
		const band = new THREE.Mesh(
			new THREE.CylinderGeometry(r, r, 0.035, 8, 1, true, Math.PI / 8),
			getFlat('line')
		);
		band.position.y = y;
		mill.add(band);
	}
	const capProfile = [
		[0.84, 0],
		[0.8, 0.28],
		[0.62, 0.62],
		[0.32, 0.9],
		[0.06, 1.12],
		[0, 1.16]
	].map(([x, y]) => new THREE.Vector2(x, y));
	const cap = inked(new THREE.LatheGeometry(capProfile, 16), getToon('cap'), 0.04);
	cap.position.y = 3.55;
	mill.add(cap);
	const door = inked(new THREE.BoxGeometry(0.46, 0.72, 0.12), getToon('door'), 0.025);
	door.position.set(0, 0.36, 1.06);
	mill.add(door);
	const arch = inked(
		new THREE.CylinderGeometry(0.23, 0.23, 0.12, 16, 1, false, -Math.PI / 2, Math.PI),
		getToon('door'),
		0.025
	);
	arch.rotation.x = -Math.PI / 2;
	arch.position.set(0, 0.72, 1.06);
	mill.add(arch);
	const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1, 10), getToon('wood'));
	axle.rotation.x = Math.PI / 2;
	axle.position.set(0, HUB.y - 0.25, 0.55);
	mill.add(axle);
	scene.add(mill);

	// Rotor: the gold hub and four stubs stay; the sails can fly away.
	const rotor = new THREE.Group();
	rotor.position.copy(HUB);
	const hub = inked(new THREE.SphereGeometry(0.18, 20, 14), getToon('hub'), 0.03);
	hub.position.z = 0.12;
	rotor.add(hub);
	for (let i = 0; i < 4; i++) {
		const stub = new THREE.Mesh(new THREE.BoxGeometry(0.06, SAIL.OFF + 0.1, 0.06), getFlat('line'));
		stub.position.y = (SAIL.OFF + 0.1) / 2;
		const arm = new THREE.Group();
		arm.rotation.z = (i * Math.PI) / 2;
		arm.add(stub);
		rotor.add(arm);
	}
	scene.add(rotor);

	// ── Sails (each one can be a stripe of the kite) ─────────────────────
	const kanjiCanvases: HTMLCanvasElement[] = [];
	const kanjiTextures: THREE.CanvasTexture[] = [];
	function paintKanji(i: number, r: Record<Role, string>) {
		const cv = kanjiCanvases[i];
		const ctx = cv.getContext('2d')!;
		ctx.clearRect(0, 0, 128, 128);
		ctx.fillStyle = r.tower;
		ctx.beginPath();
		ctx.arc(64, 64, 56, 0, TAU);
		ctx.fill();
		ctx.lineWidth = 5;
		ctx.strokeStyle = r.line;
		ctx.stroke();
		ctx.fillStyle = r.line;
		ctx.font = '600 66px "Shippori Mincho", "Hiragino Mincho ProN", serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText(FACETS[i].kanji, 64, 68);
		kanjiTextures[i].needsUpdate = true;
	}

	const sails: THREE.Group[] = [];
	for (let i = 0; i < 4; i++) {
		const g = new THREE.Group();
		const m = new THREE.MeshToonMaterial({ gradientMap: ramp });
		sailMats.push(m);
		const panel = inked(new THREE.BoxGeometry(SAIL.W, SAIL.L, 0.04), m, 0.03);
		g.add(panel);
		const spar = new THREE.Mesh(new THREE.BoxGeometry(0.05, SAIL.L + 0.14, 0.05), getFlat('line'));
		spar.position.z = 0.04;
		g.add(spar);
		for (let k = 1; k < 7; k++) {
			const bar = new THREE.Mesh(new THREE.BoxGeometry(SAIL.W, 0.018, 0.01), getFlat('line'));
			bar.position.set(0, -SAIL.L / 2 + (k * SAIL.L) / 7, 0.026);
			g.add(bar);
		}
		const cv = document.createElement('canvas');
		cv.width = cv.height = 128;
		kanjiCanvases.push(cv);
		const tex = new THREE.CanvasTexture(cv);
		tex.colorSpace = THREE.SRGBColorSpace;
		kanjiTextures.push(tex);
		const badge = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, toneMapped: false }));
		badge.scale.setScalar(0.48);
		badge.position.set(0, SAIL.L / 2 - 0.42, 0.08);
		g.add(badge);
		scene.add(g);
		sails.push(g);
	}

	// ── Kite parts that appear once the sails line up ────────────────────
	const kite = new THREE.Group();
	const KW = SAIL.W * 4,
		KH = SAIL.L;
	const diag = Math.hypot(KW, KH);
	for (const s of [1, -1]) {
		const bone = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, diag, 6), getToon('wood'));
		bone.rotation.z = s * Math.atan2(KW, KH);
		bone.position.z = -0.05;
		kite.add(bone);
	}
	const tails: THREE.Mesh[] = [];
	for (const [x, role] of [
		[-KW / 2 + 0.1, 'cap'],
		[KW / 2 - 0.1, 'door']
	] as const) {
		const g = new THREE.PlaneGeometry(0.14, 2.6, 1, 20);
		g.translate(0, -1.3, 0);
		const t = new THREE.Mesh(g, getFlat(role));
		(t.material as THREE.MeshBasicMaterial).side = THREE.DoubleSide;
		t.position.set(x, -KH / 2, 0);
		t.userData.base = Float32Array.from(g.attributes.position.array);
		kite.add(t);
		tails.push(t);
	}
	scene.add(kite);
	const STRING_PTS = 32;
	const stringGeo = new THREE.BufferGeometry().setFromPoints(
		Array.from({ length: STRING_PTS }, () => new THREE.Vector3())
	);
	const stringMat = new THREE.LineBasicMaterial({ transparent: true });
	const kiteString = new THREE.Line(stringGeo, stringMat);
	scene.add(kiteString);

	// ── A tree pair and a small torii on the near hill ───────────────────
	type Tree = {
		g: THREE.Group;
		trunk: THREE.Mesh;
		crown: THREE.Mesh;
		mat: THREE.MeshToonMaterial;
		blossoms: THREE.InstancedMesh;
		role: Role;
		s: number;
		base: THREE.Color;
		on: boolean;
		t: number; // 0 = green, 1 = in bloom
		pop: number; // 1 just after a brush circle, eases to 0
		phase: number;
	};
	const trees: Tree[] = [];
	const sakura = new THREE.Color();
	// Five-petal blossoms that open over a crown in bloom.
	const BLOSSOMS = 34;
	const blossomGeo = mergeGeometries(
		Array.from({ length: 5 }, (_, k) => {
			const a = (k / 5) * TAU;
			const petal = new THREE.CircleGeometry(0.045, 8);
			petal.scale(1, 0.72, 1);
			petal.rotateZ(a);
			petal.translate(Math.cos(a) * 0.045, Math.sin(a) * 0.045, 0);
			return petal;
		})
	);
	const blossomMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, toneMapped: false });
	const zAxisB = new THREE.Vector3(0, 0, 1);
	function tree(x: number, z: number, s: number, role: Role) {
		const g = new THREE.Group();
		const trunk = inked(
			new THREE.CylinderGeometry(0.08 * s, 0.13 * s, 1.1 * s, 8),
			getToon('wood'),
			0.025
		);
		trunk.position.y = 0.55 * s;
		// Each crown has its own material, so one tree can bloom alone.
		const mat = new THREE.MeshToonMaterial({ gradientMap: ramp });
		const crown = inked(new THREE.IcosahedronGeometry(0.75 * s, 2), mat, 0.045);
		crown.scale.set(1, 0.82, 1);
		crown.position.y = 1.45 * s;
		const blossoms = new THREE.InstancedMesh(blossomGeo, blossomMat, BLOSSOMS);
		const m4 = new THREE.Matrix4(),
			q = new THREE.Quaternion(),
			dir = new THREE.Vector3(),
			at = new THREE.Vector3(),
			size = new THREE.Vector3();
		for (let k = 0; k < BLOSSOMS; k++) {
			// Spread over the upper and outer crown (none underneath).
			do dir.randomDirection();
			while (dir.y < -0.25);
			at.copy(dir).multiplyScalar(0.75 * s * 1.03);
			q.setFromUnitVectors(zAxisB, dir);
			size.setScalar((0.8 + Math.random() * 0.5) * s);
			blossoms.setMatrixAt(k, m4.compose(at, q, size));
		}
		blossoms.visible = false;
		crown.add(blossoms);
		g.add(trunk, crown);
		g.position.set(x, groundY(x, z) - 0.12, z);
		scene.add(g);
		trees.push({
			g,
			trunk,
			crown,
			mat,
			blossoms,
			role,
			s,
			base: new THREE.Color(),
			on: false,
			t: 0,
			pop: 0,
			phase: Math.random() * TAU
		});
	}
	for (const t of TREES) tree(t.x, t.z, t.s, t.role);
	const torii = new THREE.Group();
	for (const x of [-0.42, 0.42]) {
		const post = inked(new THREE.CylinderGeometry(0.05, 0.06, 1.05, 8), getToon('torii'), 0.02);
		post.position.set(x, 0.52, 0);
		torii.add(post);
	}
	const kasagi = inked(new THREE.BoxGeometry(1.25, 0.09, 0.12), getToon('torii'), 0.02);
	kasagi.position.y = 1.1;
	const nuki = inked(new THREE.BoxGeometry(1.0, 0.06, 0.08), getToon('torii'), 0.02);
	nuki.position.y = 0.88;
	torii.add(kasagi, nuki);
	torii.position.set(TORII.x, groundY(TORII.x, TORII.z) - 0.08, TORII.z);
	torii.rotation.y = TORII.rotY;
	scene.add(torii);

	// 高札: a village notice board, with three paper notes (the essays).
	const board = new THREE.Group();
	for (const x of [-0.58, 0.58]) {
		const post = inked(new THREE.CylinderGeometry(0.05, 0.06, 1.75, 8), getToon('wood'), 0.02);
		post.position.set(x, 0.87, 0);
		board.add(post);
	}
	const plank = inked(new THREE.BoxGeometry(1.4, 0.82, 0.06), getToon('wood'), 0.025);
	plank.position.y = 1.18;
	board.add(plank);
	for (const sgn of [1, -1]) {
		const roof = inked(new THREE.BoxGeometry(1.7, 0.05, 0.38), getToon('cap'), 0.02);
		roof.position.set(0, 1.74, sgn * 0.13);
		roof.rotation.x = sgn * 0.55;
		board.add(roof);
	}
	for (const [k, x] of [-0.42, 0, 0.42].entries()) {
		const note = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.56), getFlat('snow'));
		note.position.set(x, 1.18 + (k === 1 ? 0.04 : -0.02), 0.035);
		note.rotation.z = (k - 1) * 0.06;
		for (let l = 0; l < 4; l++) {
			const row = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.014), getFlat('line'));
			row.position.set(0, 0.16 - l * 0.1, 0.001);
			note.add(row);
		}
		board.add(note);
	}
	board.position.set(BOARD.x, groundY(BOARD.x, BOARD.z) - 0.06, BOARD.z);
	board.rotation.y = BOARD.rotY;
	scene.add(board);

	// 赤べこ: the akabeko, with a soft shadow.
	const beko = createBeko({
		inked,
		red: getToon('torii'),
		ink: getFlat('bekoInk'),
		gold: getToon('hub'),
		white: getFlat('snow')
	});
	beko.root.scale.setScalar(1.2);
	scene.add(beko.root);
	const shadowMat = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false });
	const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24), shadowMat);
	shadow.rotation.x = -Math.PI / 2;
	shadow.scale.set(1.5, 0.75, 1);
	scene.add(shadow);

	// ── Wind: ink curls and leaves ───────────────────────────────────────
	const streaks: {
		line: THREE.Line;
		mat: THREE.LineBasicMaterial;
		x: number;
		y: number;
		life: number;
	}[] = [];
	for (let k = 0; k < 5; k++) {
		const pts: THREE.Vector3[] = [];
		const len = 2.2 + Math.random() * 1.6;
		for (let s = 0; s <= 20; s++) {
			const u = s / 20;
			pts.push(new THREE.Vector3(u * len, Math.sin(u * Math.PI * 2) * 0.12, 0));
		}
		for (let s = 0; s <= 18; s++) {
			const a = -Math.PI / 2 + (s / 18) * TAU * 0.85;
			pts.push(new THREE.Vector3(len + Math.cos(a) * 0.22, 0.22 + Math.sin(a) * 0.22, 0));
		}
		const mat = lineMat.clone();
		const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat);
		scene.add(line);
		streaks.push({ line, mat, x: -14 - k * 6, y: 2 + Math.random() * 6, life: 0 });
	}
	const LEAVES = 26;
	const leafGeo = new THREE.CircleGeometry(0.09, 8);
	leafGeo.scale(1, 0.45, 1);
	const leaves = new THREE.InstancedMesh(
		leafGeo,
		new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }),
		LEAVES
	);
	const leafState = Array.from({ length: LEAVES }, () => ({
		x: -12 + Math.random() * 24,
		y: 0.8 + Math.random() * 8,
		z: -2 + Math.random() * 5,
		r: Math.random() * TAU,
		v: 0.6 + Math.random() * 0.8
	}));
	scene.add(leaves);

	// Sakura petals: hidden until a tree blooms, then they fall from it.
	const PETALS = 56;
	const petalGeo = new THREE.CircleGeometry(0.075, 6);
	petalGeo.scale(1, 0.6, 1);
	const petalMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, toneMapped: false });
	const petals = new THREE.InstancedMesh(petalGeo, petalMat, PETALS);
	petals.visible = false;
	const petalState = Array.from({ length: PETALS }, () => ({
		x: 0,
		y: 0,
		z: 0,
		vx: 0,
		vy: 0,
		r: Math.random() * TAU,
		live: false
	}));
	scene.add(petals);
	const crownPos = new THREE.Vector3();
	function seedPetal(p: (typeof petalState)[number], t: Tree, burst: boolean) {
		t.crown.getWorldPosition(crownPos);
		const a = Math.random() * TAU,
			rr = 0.65 * t.s * Math.random();
		p.x = crownPos.x + Math.cos(a) * rr;
		p.y = crownPos.y + Math.sin(a) * rr * 0.8;
		p.z = crownPos.z + (Math.random() - 0.5) * 0.9;
		const sp = burst ? 1.2 + Math.random() * 1.6 : 0.1;
		p.vx = Math.cos(a) * sp;
		p.vy = Math.sin(a) * sp + (burst ? 0.9 : 0);
		p.live = true;
	}
	let burstAt = 0;

	// ── Palette ──────────────────────────────────────────────────────────
	let night = opts.night;
	let flareT = 0; // a short swell of the sun or moon when it is called
	function setPalette(p: Palette, isNight: boolean) {
		if (isNight !== night) flareT = 1;
		night = isNight;
		const r = roles(p, night);
		scene.background = new THREE.Color(r.sky);
		for (const [role, m] of toon) m.color.set(r[role]);
		for (const [role, m] of flat) m.color.set(r[role]);
		FACETS.forEach((f, i) => sailMats[i].color.set(p[f.color]));
		outlineMat.uniforms.color.value.set(r.line);
		lineMat.color.set(r.line);
		stringMat.color.set(r.line);
		for (const s of streaks) s.mat.color.set(r.line);
		for (const t of trees) t.base.set(r[t.role]);
		sakura.set(r.sakura);
		petalMat.color.set(r.sakura);
		const pale = new THREE.Color(r.blossom),
			deep = new THREE.Color(r.sakura).lerp(new THREE.Color(r.blossom), 0.4);
		for (const t of trees) {
			for (let k = 0; k < BLOSSOMS; k++) t.blossoms.setColorAt(k, k % 3 ? pale : deep);
			t.blossoms.instanceColor!.needsUpdate = true;
		}
		shadowMat.color.set(night ? '#000000' : r.line);
		shadowMat.opacity = night ? 0.3 : 0.16;
		const leafA = new THREE.Color(p.moss),
			leafB = new THREE.Color(p.gold);
		for (let i = 0; i < LEAVES; i++) leaves.setColorAt(i, i % 2 ? leafA : leafB);
		leaves.instanceColor!.needsUpdate = true;
		sun.visible = !night;
		moon.visible = night;
		sunLight.intensity = night ? 0.9 : 1.5;
		for (let i = 0; i < 4; i++) paintKanji(i, r);
	}
	setPalette(palette, night);

	// ── Motion state ─────────────────────────────────────────────────────
	let angle = 0;
	let av = 0.5; // rad/s
	let windDir: 1 | -1 = 1;
	let gustT = 0; // 1 just after a brushed gust, eases to 0
	let kiteOn = !!opts.initialKite;
	let kiteT = kiteOn ? 1 : 0; // 0 = windmill, 1 = kite
	const pointer = new THREE.Vector2();
	const camPos = new THREE.Vector3();
	const tmpQ = new THREE.Quaternion();
	const millQ = new THREE.Quaternion();
	const kiteQ = new THREE.Quaternion();
	const twirl = new THREE.Quaternion();
	const zAxis = new THREE.Vector3(0, 0, 1);
	const yAxis = new THREE.Vector3(0, 1, 0);
	const millP = new THREE.Vector3();
	const kiteP = new THREE.Vector3();
	const bridle = new THREE.Vector3();
	const mixP = new THREE.Vector3();
	const dummy = new THREE.Object3D();
	const probe = new THREE.Vector3();
	const motion = opts.reduceMotion ? 0.3 : 1;

	// Akabeko state: a path of waypoints, or a key direction.
	const BEKO_SPEED = 2.2;
	const bekoPos: Pt = { ...START };
	let heading = -0.5;
	let path: Pt[] = [];
	let goal: PlaceRef | null = null;
	let faceTarget: Pt | null = null;
	const move = { x: 0, z: 0 };
	let stride = 0;
	let nodT = 0;
	let hopT = 0;
	// Windmill: a sail the visitor chose is turned to the top and held.
	let seekAngle: number | null = null;
	let parkT = 0;
	let hovered: THREE.Object3D | null = null;

	const anchorXZ = (p: PlaceRef): Pt =>
		p.place === 'windmill' || p.place === 'sail'
			? MILL
			: p.place === 'torii'
				? TORII
				: p.place === 'board'
					? BOARD
					: p.place === 'tree'
						? TREES[p.index]
						: bekoPos;
	function anchor(p: PlaceRef, out: THREE.Vector3) {
		if (p.place === 'sail') {
			// Over the sail's outer end, wherever it is now.
			sails[p.index].localToWorld(out.set(0, SAIL.L / 2 + 0.2, 0));
			return out;
		}
		const { x, z } = anchorXZ(p);
		const lift =
			p.place === 'windmill'
				? 5.2
				: p.place === 'torii'
					? 1.5
					: p.place === 'board'
						? 2.1
						: p.place === 'tree'
							? 2.3 * TREES[p.index].s
							: 1.2;
		return out.set(x, groundY(x, z) + lift, z);
	}
	function turnTo(target: number, dt: number) {
		let d = target - heading;
		d = Math.atan2(Math.sin(d), Math.cos(d));
		heading += d * Math.min(1, dt * 7);
	}

	function resize(w: number, h: number) {
		renderer.setSize(w, h, false);
		camera.aspect = w / h;
		// Narrow screens: step back so the kite's path stays in frame.
		// Fit a frame that always holds the notice board (left) and the
		// windmill (right); wide screens also show the far tree on the right.
		const a = camera.aspect;
		const left = -8.6;
		const right = 3.9 + 3.7 * Math.min(1, Math.max(0, (a - 0.6) / 0.9));
		const half = (right - left) / 2;
		baseX = (left + right) / 2;
		// Tall screens: aim higher, so the village sits below the buttons.
		baseY = 3.6 + 2.6 * Math.min(1, Math.max(0, (1 - a) / 0.5));
		camDist = Math.min(48, Math.max(17, half / (Math.tan((camera.fov * Math.PI) / 360) * a)));
		camera.updateProjectionMatrix();
	}

	let raf = 0;
	let last = performance.now();
	let time = 0;
	let scrollT = 0;
	let scrollEase = 0;
	let baseX = -0.4;
	let baseY = 3.6;
	function frame(now: number) {
		raf = requestAnimationFrame(frame);
		const ms = now - last;
		last = now;
		const dt = Math.min(ms, 50) / 1000;
		time += dt * motion;

		// Rotor: drift back to a calm idle speed after a flick.
		gustT = Math.max(0, gustT - dt / 3.5);
		flareT = Math.max(0, flareT - dt / 0.9);
		parkT = Math.max(0, parkT - dt);
		if (seekAngle !== null) {
			// Ease the chosen sail up to the top, then hold it a while.
			angle += (seekAngle - angle) * Math.min(1, dt * 3.2);
			av = 0;
			if (Math.abs(seekAngle - angle) < 0.003) {
				angle = seekAngle;
				seekAngle = null;
				parkT = 6;
			}
		} else {
			// Hold still while parked, or while the pointer is on the windmill,
			// so the sail under the pointer stays the one that gets clicked.
			const aiming = hovered?.userData.place === 'sail' || hovered?.userData.place === 'windmill';
			const idle = parkT > 0 || aiming ? 0 : 0.5 * motion * windDir;
			av += (idle - av) * Math.min(1, dt * (aiming ? 6 : 0.8));
			angle += av * dt;
		}
		rotor.rotation.z = angle;

		// Kite progress eases toward its target over ~1.8 s.
		const target = kiteOn ? 1 : 0;
		kiteT += Math.sign(target - kiteT) * Math.min(Math.abs(target - kiteT), dt / 1.8);

		const kx = KITE_HOME.x + Math.sin(time * 0.7) * 0.4 + windDir * gustT * 0.9;
		const ky = KITE_HOME.y + Math.sin(time * 1.13) * 0.25;
		kite.position.set(kx, ky, KITE_HOME.z);
		kiteQ.setFromEuler(new THREE.Euler(-0.12, 0.18, Math.sin(time * 0.9) * 0.13));
		kite.quaternion.copy(kiteQ);

		for (let i = 0; i < 4; i++) {
			const a = angle + (i * Math.PI) / 2;
			millP
				.set(-Math.sin(a), Math.cos(a), 0)
				.multiplyScalar(SAIL.OFF + SAIL.L / 2)
				.add(HUB);
			millP.z += 0.06;
			millQ.setFromAxisAngle(zAxis, a);
			kiteP
				.set((i - 1.5) * SAIL.W, 0, 0)
				.applyQuaternion(kiteQ)
				.add(kite.position);
			// Stagger the sails so they leave the hub one after another.
			const e = smooth((kiteT - i * 0.07) / 0.79);
			mixP.lerpVectors(millP, kiteP, e);
			mixP.y += Math.sin(Math.PI * e) * 1.1;
			mixP.z += Math.sin(Math.PI * e) * 1.6;
			tmpQ.slerpQuaternions(millQ, kiteQ, e);
			twirl.setFromAxisAngle(yAxis, TAU * e);
			sails[i].position.copy(mixP);
			sails[i].quaternion.copy(tmpQ).multiply(twirl);
		}

		// Kite bones, tails and string grow in once the sails have arrived.
		const show = smooth((kiteT - 0.72) / 0.28);
		kite.visible = show > 0.001;
		kite.scale.setScalar(Math.max(0.001, show));
		for (const [n, t] of tails.entries()) {
			const pos = t.geometry.attributes.position as THREE.BufferAttribute;
			const base = t.userData.base as Float32Array;
			for (let v = 0; v < pos.count; v++) {
				const y = base[v * 3 + 1];
				pos.setX(v, base[v * 3] + Math.sin(time * 3.2 + y * 2.1 + n) * 0.22 * -y * 0.45);
			}
			pos.needsUpdate = true;
		}
		kiteString.visible = show > 0.001;
		if (kiteString.visible) {
			stringMat.opacity = show;
			bridle
				.set(0, -KH * 0.2, 0.05)
				.applyQuaternion(kiteQ)
				.add(kite.position);
			const pos = stringGeo.attributes.position as THREE.BufferAttribute;
			for (let s = 0; s < STRING_PTS; s++) {
				const u = s / (STRING_PTS - 1);
				// A gentle sag, deepest a little past the middle.
				const sag = Math.sin(Math.PI * u) * 0.9;
				pos.setXYZ(
					s,
					HUB.x + (bridle.x - HUB.x) * u,
					HUB.y + (bridle.y - HUB.y) * u - sag,
					HUB.z + 0.15 + (bridle.z - HUB.z - 0.15) * u
				);
			}
			pos.needsUpdate = true;
		}

		// Wind: ink curls cross the scene; leaves tumble with it. A brushed
		// gust makes everything faster and can turn the wind around.
		const wind = 1 + Math.min(3, Math.abs(av) * 0.6) + gustT * 3;
		const wrap = (x: number, edge: number) => (x * windDir > edge ? -windDir * edge : x);
		for (const s of streaks) {
			s.x += dt * 3.2 * wind * motion * windDir;
			s.life += dt;
			if (s.x * windDir > 16) {
				s.x = -windDir * (16 + Math.random() * 8);
				s.y = 1.5 + Math.random() * 6.5;
				s.life = 0;
			}
			s.line.scale.x = windDir;
			s.line.position.set(s.x, s.y + Math.sin(s.life * 1.6) * 0.15, 2.5);
			s.mat.opacity =
				0.45 * (1 + gustT) * Math.min(1, s.life / 0.8) * Math.min(1, (16 - s.x * windDir) / 4);
		}
		dummy.scale.setScalar(1);
		for (let i = 0; i < LEAVES; i++) {
			const l = leafState[i];
			l.x = wrap(l.x + dt * l.v * 1.6 * wind * motion * windDir, 13);
			l.r += dt * l.v * 3 * motion;
			dummy.position.set(l.x, l.y + Math.sin(time * l.v + i) * 0.35, l.z);
			dummy.rotation.set(l.r * 0.7, l.r, l.r * 0.4);
			dummy.updateMatrix();
			leaves.setMatrixAt(i, dummy.matrix);
		}
		leaves.instanceMatrix.needsUpdate = true;
		for (const [k, c] of clouds.entries()) {
			c.position.x = wrap(
				c.position.x + dt * (0.12 + k * 0.05) * motion * windDir * (1 + gustT * 3),
				20
			);
		}

		// Trees bend with the wind; a blooming crown swells once, then settles.
		const bloomed: Tree[] = [];
		for (const t of trees) {
			if (t.on) {
				t.t = Math.min(1, t.t + dt / 1.2);
				bloomed.push(t);
			}
			t.mat.color.lerpColors(t.base, sakura, smooth(t.t));
			// Blossoms open from inside the crown as the bloom finishes.
			t.blossoms.visible = t.t > 0.15;
			t.blossoms.scale.setScalar(smooth((t.t - 0.15) / 0.85));
			t.pop = Math.max(0, t.pop - dt / 1.2);
			const swell = 1 + Math.sin(Math.PI * t.pop) * 0.16;
			t.crown.scale.set(swell, 0.82 * swell, swell);
			t.g.rotation.z = -windDir * (Math.sin(time * 1.3 + t.phase) * 0.015 + gustT * 0.1) * motion;
		}

		// Petals drift toward the wind and fall slowly; new ones leave the
		// blooming crowns.
		petals.visible = bloomed.length > 0;
		if (petals.visible) {
			for (let i = 0; i < PETALS; i++) {
				const p = petalState[i];
				if (!p.live && Math.random() < dt * 1.2) {
					seedPetal(p, bloomed[i % bloomed.length], false);
				}
				if (p.live) {
					p.vx += (windDir * 0.7 * wind - p.vx) * Math.min(1, dt * 1.1);
					p.vy += (-0.45 - p.vy) * Math.min(1, dt * 1.4);
					p.x += p.vx * dt * motion;
					p.y += p.vy * dt * motion;
					p.r += dt * 3.5 * motion;
					if (p.y < 0 || Math.abs(p.x) > 15) p.live = false;
				}
				dummy.position.set(p.x, p.y + Math.sin(time * 2 + i) * 0.04, p.z);
				dummy.rotation.set(p.r * 0.6, p.r, p.r * 0.3);
				dummy.scale.setScalar(p.live ? 1 : 0);
				dummy.updateMatrix();
				petals.setMatrixAt(i, dummy.matrix);
			}
			petals.instanceMatrix.needsUpdate = true;
		}

		const rise = 1 + Math.sin(Math.PI * flareT) * 0.22;
		sun.scale.setScalar(rise);
		moon.scale.setScalar(rise);

		// Akabeko: follow the keys, or the path to the clicked spot.
		let vx = 0,
			vz = 0,
			reach = Infinity;
		if (move.x || move.z) {
			const n = Math.hypot(move.x, move.z);
			vx = move.x / n;
			vz = move.z / n;
		} else if (path.length) {
			const dx = path[0].x - bekoPos.x,
				dz = path[0].z - bekoPos.z;
			reach = Math.hypot(dx, dz);
			if (reach < 0.06) {
				path.shift();
				if (!path.length && goal) {
					faceTarget = anchorXZ(goal);
					const g = goal;
					goal = null;
					nodT = 1; // a happy nod on arrival
					opts.onArrive?.(g);
				}
			} else {
				vx = dx / reach;
				vz = dz / reach;
			}
		}
		const moving = vx !== 0 || vz !== 0;
		if (moving) {
			const step = Math.min(BEKO_SPEED * dt, reach);
			const next = clampWalk({ x: bekoPos.x + vx * step, z: bekoPos.z + vz * step });
			bekoPos.x = next.x;
			bekoPos.z = next.z;
			turnTo(Math.atan2(-vz, vx), dt);
		} else if (faceTarget) {
			turnTo(Math.atan2(-(faceTarget.z - bekoPos.z), faceTarget.x - bekoPos.x), dt);
		}
		stride += ((moving ? 1 : 0) - stride) * Math.min(1, dt * 8);
		nodT = Math.max(0, nodT - dt / 1.6);
		hopT = Math.max(0, hopT - dt / 0.55);
		const by = groundY(bekoPos.x, bekoPos.z);
		beko.update(dt, { time, stride, nod: nodT, hop: hopT > 0 ? 1 - hopT : 0 });
		beko.root.position.set(bekoPos.x, by, bekoPos.z);
		beko.root.rotation.y = heading;
		shadow.position.set(bekoPos.x, by + 0.03, bekoPos.z);
		shadow.scale.set(1.5, 0.75, 1).multiplyScalar(1 - Math.sin(Math.PI * hopT) * 0.3);

		// Whatever the pointer is over grows a little: it can be clicked.
		for (const o of pickables) {
			if (o.userData.base === undefined) continue;
			const up = o === hovered ? (o.userData.place === 'sail' ? 1.14 : 1.06) : 1;
			const k = o.scale.x / o.userData.base;
			o.scale.setScalar(o.userData.base * (k + (up - k) * Math.min(1, dt * 12)));
		}

		// Camera: a slow breath, a small pointer parallax, and a light follow.
		// Scrolling into the page lifts the camera up into the sky.
		scrollEase += (scrollT - scrollEase) * Math.min(1, dt * 6);
		const lift = smooth(scrollEase);
		const follow = (bekoPos.x - START.x) * 0.15;
		lookAt.x += (baseX + follow - lookAt.x) * Math.min(1, dt * 2);
		lookAt.y = baseY + lift * 7;
		camPos.set(
			pointer.x * 1.2 + Math.sin(time * 0.15) * 0.4 + follow,
			4.2 + pointer.y * 0.6 + lift * 5,
			camDist * (1 + lift * 0.25)
		);
		camera.position.lerp(camPos, Math.min(1, dt * 2.5));
		camera.lookAt(lookAt);
		renderer.render(scene, camera);
		opts.onFrame?.(ms);
	}
	camera.position.set(0, 4.2, camDist);
	raf = requestAnimationFrame(frame);

	function bloom(t: Tree) {
		t.on = true;
		t.pop = 1;
		for (let k = 0; k < 18; k++) seedPetal(petalState[burstAt++ % PETALS], t, true);
	}

	// Picking: each place root carries its id; hits walk up to that root.
	const raycaster = new THREE.Raycaster();
	const ndc = new THREE.Vector2();
	const pickables: THREE.Object3D[] = [];
	const tag = (o: THREE.Object3D, place: PlaceId, index = 0) => {
		o.userData.place = place;
		o.userData.index = index;
		pickables.push(o);
	};
	tag(mill, 'windmill');
	tag(rotor, 'windmill');
	sails.forEach((s, i) => tag(s, 'sail', i));
	tag(kite, 'windmill');
	trees.forEach((t, i) => tag(t.g, 'tree', i));
	tag(torii, 'torii');
	tag(board, 'board');
	tag(beko.root, 'hiro');
	// Things that grow on hover remember their resting size.
	for (const o of [...sails, ...trees.map((t) => t.g), torii, board, beko.root]) {
		o.userData.base = o.scale.x;
	}
	function cast(x: number, y: number) {
		ndc.set((x / canvas.clientWidth) * 2 - 1, -(y / canvas.clientHeight) * 2 + 1);
		raycaster.setFromCamera(ndc, camera);
	}
	function rootOf(hits: THREE.Intersection[]): THREE.Object3D | null {
		for (const h of hits) {
			let o: THREE.Object3D | null = h.object;
			while (o && o.userData.place === undefined) o = o.parent;
			if (o) return o;
		}
		return null;
	}
	const refOf = (o: THREE.Object3D): PlaceRef => ({
		place: o.userData.place as PlaceId,
		index: o.userData.index as number
	});
	function placeOf(hits: THREE.Intersection[]): PlaceRef | null {
		const o = rootOf(hits);
		return o ? refOf(o) : null;
	}

	return {
		setPalette,
		setKite(on) {
			kiteOn = on;
		},
		isKite: () => kiteOn,
		spin(impulse) {
			av = Math.max(-9, Math.min(9, av + impulse));
		},
		gust(dir) {
			windDir = dir;
			gustT = 1;
			av = Math.max(-9, Math.min(9, av + dir * 6));
		},
		bloomInside(test) {
			const w = canvas.clientWidth,
				h = canvas.clientHeight;
			const onScreen = (o: THREE.Object3D) => {
				o.getWorldPosition(probe).project(camera);
				return test(((probe.x + 1) / 2) * w, ((1 - probe.y) / 2) * h);
			};
			let n = 0;
			for (const t of trees) {
				if (!onScreen(t.crown) && !onScreen(t.trunk)) continue;
				n++;
				bloom(t);
			}
			return n;
		},
		pick(x, y) {
			cast(x, y);
			const hit = placeOf(raycaster.intersectObjects(pickables, true));
			if (hit) return hit;
			const g = raycaster.intersectObjects([near, mid, floor], false)[0];
			return g ? { ground: { x: g.point.x, z: g.point.z } } : null;
		},
		hover(x, y) {
			cast(x, y);
			const o = rootOf(raycaster.intersectObjects(pickables, true));
			hovered = o;
			if (!o) return null;
			const hit = refOf(o);
			anchor(hit, probe).project(camera);
			return {
				...hit,
				x: ((probe.x + 1) / 2) * canvas.clientWidth,
				y: ((1 - probe.y) / 2) * canvas.clientHeight
			};
		},
		walkTo(place, index = 0) {
			const spot = spotFor(place, index);
			if (!spot) return;
			path = route(bekoPos, spot);
			goal = { place, index };
			faceTarget = null;
		},
		walkToPoint(p) {
			path = route(bekoPos, p);
			goal = null;
			faceTarget = null;
		},
		setMove(dx, dz) {
			move.x = dx;
			move.z = dz;
			if (dx || dz) {
				path = [];
				goal = null;
				faceTarget = null;
			}
		},
		near: () => nearestSpot(bekoPos),
		hop() {
			hopT = 1;
			nodT = 1;
			faceTarget = { x: camera.position.x, z: camera.position.z };
		},
		seekSail(index) {
			if (kiteOn) return;
			// Sail i points up when (angle + i·90°) is a whole turn; go forward to it.
			const now = angle + (index * Math.PI) / 2;
			const ahead = (((-now % TAU) + TAU) % TAU) + (Math.abs(av) > 2 ? TAU : 0);
			seekAngle = angle + (ahead < 0.05 ? TAU : ahead);
		},
		bloomTree(index) {
			if (trees[index]) bloom(trees[index]);
		},
		flare() {
			flareT = 1;
		},
		setScroll(p) {
			scrollT = Math.min(1, Math.max(0, p));
		},
		setActive(on) {
			if (on && !raf) {
				last = performance.now();
				raf = requestAnimationFrame(frame);
			} else if (!on && raf) {
				cancelAnimationFrame(raf);
				raf = 0;
			}
		},
		setPointer(nx, ny) {
			pointer.set(nx, ny);
		},
		resize,
		info: () => ({ calls: renderer.info.render.calls, triangles: renderer.info.render.triangles }),
		dispose() {
			cancelAnimationFrame(raf);
			raf = 0;
			canvas.removeEventListener('webglcontextlost', onLost);
			scene.traverse((o) => {
				const m = o as THREE.Mesh;
				m.geometry?.dispose();
				const mat = m.material as THREE.Material | THREE.Material[] | undefined;
				if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
				else mat?.dispose();
			});
			kanjiTextures.forEach((t) => t.dispose());
			ramp.dispose();
			renderer.dispose();
		}
	};
}
